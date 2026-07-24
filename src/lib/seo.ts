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
 */
export function buildAbsoluteURL(path: string, site: URL | undefined): string {
  return new URL(path, site).href;
}

export function buildCanonicalURL(pathname: string, site: URL | undefined): string {
  return buildAbsoluteURL(pathname, site);
}
