/**
 * @fileoverview Applies the security header set to server-rendered responses
 *
 * `public/_headers` covers static assets only, so without this every Worker
 * response ships unprotected. See `src/lib/security-headers.ts` for which
 * routes that is and why.
 *
 * Two things this deliberately does not do:
 *
 * It skips prerendered routes. Middleware runs during the build as well as at
 * request time, and the Cloudflare adapter declares no `staticHeaders` feature,
 * so headers set on a prerendered render are discarded rather than emitted. At
 * runtime those routes are served by the assets binding before the Worker runs,
 * and `public/_headers` is what covers them.
 *
 * It must not throw. When middleware throws, Astro re-renders with the middleware
 * skipped, which would silently drop these headers from the error pages they most
 * need to be on. There is no I/O and no parsing here, and `withSecurityHeaders`
 * absorbs the one throw a plain header write can raise: a response whose Headers
 * are immutable, which `Response.redirect` and a passed-through `fetch` both
 * produce
 */

import { defineMiddleware } from "astro:middleware";
import { withSecurityHeaders } from "@/lib/security-headers";

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  if (context.isPrerendered) return response;
  return withSecurityHeaders(response);
});
