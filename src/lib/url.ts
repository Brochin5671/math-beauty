import { z } from "zod";

/**
 * @fileoverview Scheme-checked validation for absolute URLs the site publishes
 *
 * `new URL(value)` proves a string parses, not that it is safe to put in an
 * attribute: `javascript:alert(1)` and `data:text/html,...` are both perfectly
 * valid URLs. Anything reaching an `href`, a `src`, or a JSON-LD URL field needs
 * its scheme checked rather than its syntax.
 *
 * The check is on the parsed protocol, not on a prefix. `startsWith("http")`
 * accepts `httpx://` and `http-evil://`, which are valid URLs with a scheme
 * nobody intended.
 *
 * Deliberately not applied to `Link`'s `href`. A link may legitimately be
 * relative, a fragment, `mailto:` or `tel:`, so http-only there would be wrong.
 * This is for the absolute URLs the site asserts about itself: brand and social
 * links, and structured-data URL fields
 */

/**
 * An absolute http(s) URL
 *
 * Two behaviours worth knowing, both verified in the tests: the scheme compare is
 * case-insensitive, so `HTTPS://` is accepted; and surrounding whitespace is
 * trimmed rather than rejected, so a pasted value with a stray space passes and
 * the parsed output is the trimmed form
 */
export const httpUrl = z.url({ protocol: /^https?$/ });

/** Whether `value` is an absolute http(s) URL */
export function isHttpUrl(value: unknown): boolean {
  return httpUrl.safeParse(value).success;
}
