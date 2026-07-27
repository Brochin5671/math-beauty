import { isHttpUrl } from "@/lib/url";

/**
 * Build the document <title>. The brand goes last (suffix) so the page-specific
 * keyword leads: search engines favor it and it survives SERP truncation. The
 * homepage has no page title, so it leads with the brand plus its tagline (the
 * one place brand-first is recommended). A dash separator is used over a pipe:
 * Google rewrites the pipe more often and dashes test better on click-through
 * `siteName` + `tagline` come from `siteSeo` / `brand` in site-config
 */
export function buildMetaTitle(
  title: string | undefined,
  siteName: string,
  tagline?: string,
): string {
  if (!title) return tagline ? `${siteName} - ${tagline}` : siteName;
  return `${title} - ${siteName}`;
}

/**
 * Resolve a path (or already-absolute URL) to an absolute URL against the
 * configured `site`. Used for canonical, og:url, and the social images, which
 * are read by external crawlers that cannot resolve a relative path
 *
 * Throws on anything that does not resolve to http(s). `new URL(path, base)`
 * ignores the base whenever `path` carries its own scheme, so a `javascript:` or
 * `data:` value used to pass through untouched into `og:image` and `twitter:image`,
 * and into `canonical` and `og:url` for any caller passing an explicit canonical.
 * Failing the build is the right outcome: this runs at build time and there is no
 * sensible fallback for a canonical URL that is wrong
 *
 * It does **not** enforce an origin, and a protocol-relative `//host/path` will
 * resolve to `https://host/path` and be accepted. That is deliberate rather than
 * an oversight: an absolute URL on another host is a supported input (a CDN for
 * social images), so there is no way to reject the retarget without rejecting the
 * feature. Treat any path reaching this from outside the repo as needing its own
 * origin check
 */
export function buildAbsoluteURL(path: string, site: URL | undefined): string {
  const resolved = new URL(path, site).href;
  if (!isHttpUrl(resolved)) {
    throw new Error(`buildAbsoluteURL: ${JSON.stringify(path)} resolved to a non-http(s) URL`);
  }
  return resolved;
}

export function buildCanonicalURL(pathname: string, site: URL | undefined): string {
  return buildAbsoluteURL(pathname, site);
}
