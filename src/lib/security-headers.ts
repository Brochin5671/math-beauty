/**
 * @fileoverview The security header set, and the single place it is written
 *
 * `public/_headers` is applied by Cloudflare's asset server, which only serves
 * static assets. A response the Worker renders never passes through it, so
 * `/404`, `/500` and every `/api/*` route would ship with no CSP, no HSTS and no
 * frame protection. `wrangler.jsonc` sets `not_found_handling: "none"`, so an
 * asset miss falls through to the Worker: that makes every 404 on the site a
 * Worker response.
 *
 * `src/middleware.ts` applies this set to those responses.
 * `src/lib/security-headers.test.ts` asserts it never diverges from
 * `public/_headers`, so the two cannot drift.
 *
 * Header names are written the way `public/_headers` writes them. HTTP header
 * names are case-insensitive and the parity test compares case-insensitively
 */

/*
 * Keep these in step with the `/*` block in `public/_headers`
 *
 * The Content-Security-Policy allows `static.cloudflareinsights.com`
 * (script-src) and `cloudflareinsights.com` (connect-src) for Cloudflare Web
 * Analytics' beacon. If you have not enabled Web Analytics, remove both
 * references here and in `public/_headers` to tighten the policy
 *
 * Framing is locked down: nothing on the site frames itself
 */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy":
    "default-src 'self'; object-src 'none'; script-src 'self' 'unsafe-inline' static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' cloudflareinsights.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
});

/**
 * Writes the set onto a Headers object, overwriting any existing value
 *
 * Throws on an immutable Headers guard. Use `withSecurityHeaders` for a Response
 * of unknown provenance; call this directly only on Headers you constructed
 */
export function applySecurityHeaders(headers: Headers): void {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
}

/**
 * Returns a Response carrying the set, whatever the original's headers allow
 *
 * `Headers.set` throws `TypeError: immutable` on a guarded Headers, and two
 * ordinary handler returns produce one: `Response.redirect(...)` and a Response
 * passed through from `fetch`. A throw here is worse than a missing header,
 * because Astro answers a middleware throw by re-rendering with the middleware
 * skipped, so the error response it lands on carries no headers at all.
 *
 * Mutates in place where it can, since that preserves everything about the
 * response, and rebuilds only on the immutable path. `body` is passed through
 * rather than read, so a streamed response stays streamed.
 *
 * The rebuild is guarded too, because it can throw for its own reasons: the
 * Response constructor rejects a status outside 200-599, which `Response.error()`
 * (status 0) and a 101 upgrade both are, and a rebuild drops workerd-only fields
 * like `webSocket`. An unprotected response is better than a thrown one, since a
 * throw costs the headers on the error page Astro falls back to
 */
export function withSecurityHeaders(response: Response): Response {
  try {
    applySecurityHeaders(response.headers);
    return response;
  } catch {
    try {
      const headers = new Headers(response.headers);
      applySecurityHeaders(headers);
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch {
      return response;
    }
  }
}
