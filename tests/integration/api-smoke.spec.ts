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
  for (const { path, method, description } of apiEndpoints) {
    test(`${method} ${path} responds (${description})`, async ({ request }) => {
      const response = await request.fetch(path, { method });
      const status = response.status();
      // 4xx is acceptable (endpoint received the request and returned a
      // controlled error like 400 for missing body); 404 means the route
      // does not exist; 5xx means the handler threw
      expect(status).not.toBe(404);
      expect(status).toBeLessThan(500);
    });
  }
});
