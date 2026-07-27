import { expect, test } from "@playwright/test";
import { apiEndpoints } from "../fixtures/api-endpoints";

/*
 * Iteration-driven smoke for every endpoint in apiEndpoints. Asserts each
 * endpoint responds, not 404, not a server error. Per-endpoint behavioral
 * tests (status codes, payload validation, response shape) live in their
 * own spec files (e.g., contact-api.spec.ts) since each endpoint has its
 * own contract that cannot be modularized
 */

test.describe("API endpoint smoke", () => {
  for (const { path, method, description, emptyPayloadStatus } of apiEndpoints) {
    test(`${method} ${path} responds (${description})`, async ({ request }) => {
      /*
       * `data: {}` rather than no body at all, so the request carries a JSON
       * content-type. Astro's checkOrigin rejects a bodyless POST with 403 before
       * the route runs, so the previous version of this spec never reached a
       * handler and passed anyway, because 403 is neither 404 nor a 5xx
       */
      const response = await request.fetch(path, {
        method,
        data: {},
        failOnStatusCode: false,
      });
      /*
       * The status the fixture declares, rather than a range. "not 404 and under
       * 500" is satisfied by 200, 400, 401, 403 and 429 alike, so it could not
       * tell a working endpoint from one that had started rejecting or silently
       * accepting everything
       */
      expect(response.status()).toBe(emptyPayloadStatus);
    });
  }
});
