import { describe, expect, it } from "vitest";
// `?raw` inlines the file through Vite's own resolver, so this does not depend on
// the working directory the runner happens to start in
import raw from "../../public/_headers?raw";
import { applySecurityHeaders, SECURITY_HEADERS, withSecurityHeaders } from "./security-headers";

/*
 * Parses one path block out of `public/_headers`
 *
 * Three things a naive parser gets wrong here, each of which degrades to an
 * empty or truncated result rather than an error, which is why the suite below
 * checks the parse itself before comparing anything:
 *
 * Comment lines start with `#` and carry colons of their own, so splitting on `:`
 * without dropping comments invents a header named after the comment's first word
 *
 * Header values contain colons. The CSP has `img-src 'self' data:`, so
 * `line.split(":")[1]` truncates the policy at "data" and produces a plausible
 * wrong answer
 *
 * A block ends at the next line starting with `/`, not at a blank line
 */
function parseBlock(text: string, path: string): Record<string, string> {
  const lines = text
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "" && !line.trim().startsWith("#"));

  const start = lines.findIndex((line) => line.trim() === path);
  if (start === -1) return {};

  const headers: Record<string, string> = {};
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("/")) break;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const name = line.slice(0, separator).trim().toLowerCase();
    headers[name] = line.slice(separator + 1).trim();
  }
  return headers;
}

function lowercaseKeys(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value.trim()]),
  );
}

describe("_headers parser", () => {
  /*
   * Guards the assertions below. Every parser mistake described above yields an
   * empty or partial object, and an empty parse would satisfy a directional
   * comparison, so the parse is checked before it is trusted
   */
  const parsed = parseBlock(raw, "/*");

  it("finds the /* block", () => {
    expect(Object.keys(parsed).length).toBeGreaterThan(0);
  });

  it("reads every header in the block", () => {
    expect(Object.keys(parsed).sort()).toEqual([
      "content-security-policy",
      "permissions-policy",
      "referrer-policy",
      "strict-transport-security",
      "x-content-type-options",
      "x-frame-options",
    ]);
  });

  it("keeps a value containing a colon intact", () => {
    // The file really does carry this, so a truncating split fails here first
    expect(raw).toContain("img-src 'self' data:");
    expect(parsed["content-security-policy"]).toContain("img-src 'self' data:");
    expect(parsed["content-security-policy"]).toContain("form-action 'self'");
  });

  it("does not mistake a comment for a header", () => {
    expect(raw).toMatch(/^#/m);
    for (const name of Object.keys(parsed)) {
      expect(name.startsWith("#")).toBe(false);
    }
  });

  it("stops at the next path block", () => {
    // /_astro/* carries a Cache-Control that must not leak into the /* block
    expect(parsed).not.toHaveProperty("cache-control");
    expect(parseBlock(raw, "/_astro/*")["cache-control"]).toBe(
      "public, max-age=31536000, immutable",
    );
  });

  it("returns nothing for a path the file does not define", () => {
    /*
     * Paired with a block that does exist, so "found nothing" is distinguishable from
     * "cannot find anything". On its own this compares two empty values
     */
    expect(Object.keys(parseBlock(raw, "/*")).length).toBeGreaterThanOrEqual(6);
    expect(parseBlock(raw, "/nope/*")).toEqual({});
  });
});

describe("SECURITY_HEADERS", () => {
  /*
   * The divergence guard. `public/_headers` covers static assets and
   * src/middleware.ts covers server-rendered responses, so a header added to one
   * and not the other means two classes of response disagree about the policy.
   * Symmetric equality, so an extra key on either side fails
   */
  it("matches the /* block in public/_headers exactly", () => {
    expect(lowercaseKeys({ ...SECURITY_HEADERS })).toEqual(parseBlock(raw, "/*"));
  });

  it("is frozen, so a caller cannot mutate the shared set", () => {
    expect(Object.isFrozen(SECURITY_HEADERS)).toBe(true);
  });
});

describe("applySecurityHeaders", () => {
  it("writes every header onto a Headers object", () => {
    const headers = new Headers();
    applySecurityHeaders(headers);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      expect(headers.get(name)).toBe(value);
    }
  });

  it("overwrites a weaker value already present", () => {
    const headers = new Headers({ "X-Frame-Options": "ALLOWALL" });
    applySecurityHeaders(headers);
    expect(headers.get("x-frame-options")).toBe("DENY");
  });

  it("leaves unrelated headers alone", () => {
    const headers = new Headers({ "Content-Type": "application/json" });
    applySecurityHeaders(headers);
    expect(headers.get("content-type")).toBe("application/json");
  });
});

/*
 * The immutable-headers path. `Response.redirect` and a Response handed straight
 * back from `fetch` both carry a guarded Headers, and `Headers.set` throws
 * `TypeError: immutable` on those. That throw is worse than the missing header it
 * would replace: Astro answers a middleware throw by re-rendering with the
 * middleware skipped, so the response that ships carries none of the set
 */
describe("withSecurityHeaders", () => {
  it("mutates a normal response in place", () => {
    const original = new Response("body", { status: 201, statusText: "Created" });
    const result = withSecurityHeaders(original);
    // The same object, so nothing about the response is reconstructed needlessly
    expect(result).toBe(original);
    expect(result.status).toBe(201);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      expect(result.headers.get(name)).toBe(value);
    }
  });

  /*
   * The guard is constructed rather than taken from `Response.redirect`, because
   * happy-dom does not implement it: in this environment a redirect's headers are
   * writable and the fallback would never be entered, so the test would pass over
   * the in-place path and prove nothing about the one it names. Under Node and
   * workerd the same call does throw, which is where this matters
   */
  function guarded(response: Response): Response {
    const headers = new Headers(response.headers);
    headers.set = () => {
      throw new TypeError("immutable");
    };
    Object.defineProperty(response, "headers", { value: headers, configurable: true });
    return response;
  }

  it("does not throw when the response headers are immutable", () => {
    const redirect = guarded(
      new Response(null, { status: 302, headers: { location: "https://example.com/next" } }),
    );
    // The premise: without this the case below could be taking the in-place path
    expect(() => redirect.headers.set("x-probe", "1")).toThrow(TypeError);

    const result = withSecurityHeaders(redirect);
    // A different object, since the original could not be written to
    expect(result).not.toBe(redirect);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      expect(result.headers.get(name), name).toBe(value);
    }
  });

  it("preserves the status and location of a response it rebuilds", () => {
    const result = withSecurityHeaders(
      guarded(
        new Response(null, { status: 307, headers: { location: "https://example.com/next" } }),
      ),
    );
    expect(result.status).toBe(307);
    expect(result.headers.get("location")).toBe("https://example.com/next");
  });

  /*
   * The rebuild can fail for its own reasons, and then returning the response
   * unprotected is the lesser failure: a throw costs the headers on the error page
   * Astro re-renders without the middleware.
   *
   * In Node and workerd the real trigger is a status the Response constructor
   * rejects, anything outside 200-599, which `Response.error()` (status 0) and a 101
   * upgrade both are. happy-dom does not enforce that range, so the failure is
   * forced here instead of reproduced
   */
  it("returns the original rather than throwing when the rebuild fails", () => {
    const unrebuildable = guarded(new Response(null, { status: 204 }));
    Object.defineProperty(unrebuildable, "body", {
      get() {
        throw new RangeError("cannot rebuild");
      },
      configurable: true,
    });
    // The premise: the rebuild path is genuinely reached and genuinely fails
    expect(() => unrebuildable.headers.set("x-probe", "1")).toThrow(TypeError);
    expect(() => unrebuildable.body).toThrow(RangeError);

    let result: Response | undefined;
    expect(() => {
      result = withSecurityHeaders(unrebuildable);
    }).not.toThrow();
    expect(result).toBe(unrebuildable);
  });
});
