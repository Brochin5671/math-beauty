import { describe, expect, it } from "vitest";
import { httpUrl, isHttpUrl } from "./url";

/*
 * The hostile cases are the point. A prefix check on "http" accepts `httpx://`
 * and `http-evil://`; a `new URL()` parseability check accepts `javascript:` and
 * `data:`. Both were the shipped state before this module existed
 */

describe("isHttpUrl", () => {
  it.each([
    ["https://example.com", "https"],
    ["http://example.com", "http"],
    ["https://example.com/path?q=1#frag", "a full url"],
    ["HTTPS://example.com", "an uppercase scheme, since the compare is case-insensitive"],
  ])("accepts %s (%s)", (value) => {
    expect(isHttpUrl(value)).toBe(true);
  });

  it.each([
    ["javascript:alert(1)", "a script scheme that new URL() parses happily"],
    ["data:text/html,<script>alert(1)</script>", "a data url"],
    ["httpx://example.com", "a scheme a startsWith('http') check would accept"],
    ["http-evil://example.com", "the same, with a hyphen"],
    ["vbscript:msgbox(1)", "another script scheme"],
    ["file:///etc/passwd", "a local file"],
    ["/og-logo.png", "a root-relative path"],
    ["example.com", "a bare host with no scheme"],
    ["", "an empty string"],
  ])("rejects %s (%s)", (value) => {
    expect(isHttpUrl(value)).toBe(false);
  });

  it.each([[null], [undefined], [42], [{}]])("rejects the non-string %s", (value) => {
    expect(isHttpUrl(value)).toBe(false);
  });
});

describe("httpUrl", () => {
  /*
   * Pinned rather than assumed: a value with surrounding whitespace is accepted
   * and silently trimmed. Worth knowing, because it means a pasted config value
   * validates and the parsed result is not the string that was written
   */
  it("trims surrounding whitespace instead of rejecting it", () => {
    const result = httpUrl.safeParse("  https://example.com  ");
    expect(result.success).toBe(true);
    expect(result.success && result.data).toBe("https://example.com");
  });

  it("reports the protocol as the failing check", () => {
    const result = httpUrl.safeParse("javascript:alert(1)");
    expect(result.success).toBe(false);
    // The issue path matters: a bare `.toThrow()` cannot tell a rejected scheme
    // from a rejected anything-else
    expect(result.success === false && result.error.issues[0]?.code).toBe("invalid_format");
  });
});
