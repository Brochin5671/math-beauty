import { expect, test } from "@playwright/test";
import { SECURITY_HEADERS } from "../../src/lib/security-headers";

/*
 * Asserts the security headers reach real responses, on both paths that serve
 * them.
 *
 * src/lib/security-headers.test.ts proves the shipped set and public/_headers
 * agree, but two constants agreeing says nothing about whether either is ever
 * attached. Deleting src/middleware.ts leaves that test green; it fails here.
 *
 * The static control matters as much as the SSR case. Cloudflare's asset server
 * is what covers a prerendered route, and the middleware skips those, so a pass
 * on /404 alone cannot distinguish "middleware works" from "_headers started
 * covering everything".
 *
 * HTTP-only, so this runs in the `integration` project rather than tests/e2e,
 * where it would repeat across four browser projects and measure nothing extra
 */

const HEADER_NAMES = Object.keys(SECURITY_HEADERS);

test.describe("security headers", () => {
  /*
   * Guards the three loops below: an emptied SECURITY_HEADERS would reduce each of them
   * to its bare status check while reading as a pass
   */
  test("the header set under test is not empty", () => {
    expect(HEADER_NAMES.length).toBeGreaterThanOrEqual(6);
  });
  test("a Worker-rendered 404 carries the full set", async ({ request }) => {
    // not_found_handling is "none" in wrangler.jsonc and 404.astro is
    // prerender=false, so an asset miss is rendered by the Worker
    const response = await request.get("/this-route-does-not-exist", {
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(404);

    const headers = response.headers();
    for (const name of HEADER_NAMES) {
      expect(headers[name.toLowerCase()], `${name} on a Worker-rendered 404`).toBe(
        SECURITY_HEADERS[name],
      );
    }
  });

  /*
   * No API-route case: this site ships no src/pages/api/, so the 404 above is the
   * only Worker-rendered response class there is. Add one here alongside the first
   * endpoint, since an API route is the response an SSR-only header set most needs
   * covered
   */

  test("a static route carries the full set from public/_headers", async ({ request }) => {
    const response = await request.get("/");
    expect(response.status()).toBe(200);

    const headers = response.headers();
    for (const name of HEADER_NAMES) {
      expect(headers[name.toLowerCase()], `${name} on a prerendered route`).toBe(
        SECURITY_HEADERS[name],
      );
    }
  });

  test("a hashed asset keeps its immutable cache policy and frame protection", async ({
    request,
    baseURL,
  }) => {
    // _headers matching is additive across blocks, so /_astro/* gets both its own
    // Cache-Control and the /* security set. A per-path override that dropped the
    // inherited headers would show up here
    const home = await request.get("/");
    const html = await home.text();
    const asset = html.match(/\/_astro\/[^"']+\.css/)?.[0];
    // The shape, not just presence: a match of "" would satisfy toBeDefined and
    // then request the home page again, quietly testing the wrong response
    expect(asset, "home page references a hashed stylesheet").toMatch(
      /^\/_astro\/.+\.[A-Za-z0-9_-]{6,}\.css$/,
    );

    const response = await request.get(new URL(asset as string, baseURL).href);
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");
    expect(response.headers()["x-frame-options"]).toBe(SECURITY_HEADERS["X-Frame-Options"]);
  });
});
