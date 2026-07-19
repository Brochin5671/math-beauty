/*
 * Single source of truth for every page-driven test (smoke, a11y, SEO,
 * emulation, build snapshots, sitemap sync)
 * CONFIGURE: add an entry here when shipping a new public page; every
 * relevant test will pick it up automatically
 * Note: 404 is excluded - it is not a routable URL, it is the fallback
 * rendered on unknown routes; tests that need it reference it directly
 */

export const sitePages = [{ path: "/", name: "Fractal Viewer" }] as const;

export type SitePage = (typeof sitePages)[number];

// Maps a URL path to the built HTML file path under dist/client/
// Astro's `directoryUrls: true` (default) writes every page as <slug>/index.html
export function distPath(urlPath: string): string {
  if (urlPath === "/") return "dist/client/index.html";
  return `dist/client${urlPath.replace(/\/$/, "")}/index.html`;
}
