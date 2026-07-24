import { readFileSync } from "node:fs";
import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import { distPath, sitePages } from "../fixtures/site-pages";

// Routable pages from sitePages (single source of truth). The 404/500 error
// pages are SSR routes now, not static build artifacts, so the E2E suite covers
// them (status code + noindex) instead
// Regenerate snapshots via `pnpm test:build -u` after intentional changes
const pages = sitePages.map((p) => ({ name: p.name, path: distPath(p.path) }));

// Extract only SEO-relevant head tags (stable across content changes)
function extractHeadMeta(html: string) {
  const $ = load(html);
  return {
    title: $("head title").text(),
    description: $('meta[name="description"]').attr("content"),
    canonical: $('link[rel="canonical"]').attr("href"),
    ogSiteName: $('meta[property="og:site_name"]').attr("content"),
    ogLocale: $('meta[property="og:locale"]').attr("content"),
    ogTitle: $('meta[property="og:title"]').attr("content"),
    ogUrl: $('meta[property="og:url"]').attr("content"),
    ogType: $('meta[property="og:type"]').attr("content"),
    ogImage: $('meta[property="og:image"]').attr("content"),
    twitterCard: $('meta[name="twitter:card"]').attr("content"),
    twitterImage: $('meta[name="twitter:image"]').attr("content"),
    robots: $('meta[name="robots"]').attr("content") || "not set",
  };
}

// Brand- and URL-derived head values come from site-config and change per
// consumer, so the snapshot masks them: present-or-absent is still captured, the
// exact value is not, so a scaffold passes without a `-u` after the brand is set.
// Structural fields (og:type, twitter:card, robots, locale) stay frozen.
const CONFIGURABLE = "[configurable]";
function maskConfigurable(meta: ReturnType<typeof extractHeadMeta>) {
  const mask = (v: string | undefined) => (v == null ? v : CONFIGURABLE);
  return {
    ...meta,
    title: mask(meta.title),
    description: mask(meta.description),
    canonical: mask(meta.canonical),
    ogSiteName: mask(meta.ogSiteName),
    ogTitle: mask(meta.ogTitle),
    ogUrl: mask(meta.ogUrl),
    ogImage: mask(meta.ogImage),
    twitterImage: mask(meta.twitterImage),
  };
}

// Extract JSON-LD schema types per page (stable across data changes)
function extractJsonLdTypes(html: string): string[] {
  const $ = load(html);
  const blocks = $('script[type="application/ld+json"]')
    .toArray()
    .map((el) => $(el).text().trim());
  const types: string[] = [];
  for (const text of blocks) {
    try {
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item?.["@type"]) {
          types.push(item["@type"]);
        }
      }
    } catch {
      types.push("INVALID_JSON");
    }
  }
  return types.sort();
}

describe("SEO meta snapshots", () => {
  for (const page of pages) {
    it(`${page.name} meta tags`, () => {
      const html = readFileSync(page.path, "utf-8");
      const meta = extractHeadMeta(html);
      // Description has a length bound (site-config `pageMeta` copy); the other
      // brand/URL-derived fields are masked by maskConfigurable, so only a
      // structural change (a tag appearing/disappearing) moves the snapshot.
      const description = meta.description ?? "";
      expect(description.length).toBeGreaterThan(0);
      expect(description.length).toBeLessThanOrEqual(200);
      expect(maskConfigurable(meta)).toMatchSnapshot();
    });
  }
});

describe("Structured data (JSON-LD)", () => {
  for (const page of pages) {
    it(`${page.name} schema types`, () => {
      const html = readFileSync(page.path, "utf-8");
      const types = extractJsonLdTypes(html);
      expect(types).toMatchSnapshot();
    });
  }
});
