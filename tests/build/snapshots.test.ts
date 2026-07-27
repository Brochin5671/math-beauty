import { readFileSync } from "node:fs";
import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import { htmlLang } from "../../src/lib/site-config";
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
    htmlLang: $("html").attr("lang"),
  };
}

// Brand- and URL-derived head values come from site-config and change per
// brand, so the snapshot masks them: present-or-absent is still captured, the
// exact value is not, so changing the brand does not need a `-u`.
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

/*
 * The canonical URL as emitted. No page passes an explicit `canonical` prop, so this
 * covers the pathname path only; the prop path is pinned separately below, at the
 * source, because the built HTML cannot exercise a prop nothing sets
 */
describe("canonical URL", () => {
  for (const { name, path } of pages) {
    it(`${name} emits an absolute http(s) canonical and og:url`, () => {
      const $ = load(readFileSync(path, "utf-8"));
      const canonical = $('link[rel="canonical"]').attr("href");
      const ogUrl = $('meta[property="og:url"]').attr("content");
      expect(canonical).toMatch(/^https?:\/\//);
      // The same value in both, which is what makes one guard cover the pair
      expect(ogUrl).toBe(canonical);
    });
  }
});

/*
 * The `canonical` prop path, pinned at the source. `buildAbsoluteURL` rejects a
 * non-http(s) scheme, but only for values routed through it, and an explicit
 * `canonical` prop used to be written into `<link rel="canonical">` and `og:url`
 * verbatim. No page sets that prop, so no built page can exercise it and no
 * assertion over `dist/` can fail on the regression.
 *
 * `.astro` files are not importable from the Vitest projects (no Astro plugin), so
 * this reads the source. Coarse, but it does fail on the one edit that reopens the
 * hole, which is what the guard needs
 */
describe("canonical prop is resolved, not trusted", () => {
  const source = readFileSync("src/components/seo/SEO.astro", "utf-8");

  it("routes the canonical prop through the resolver", () => {
    // The premise: the assignment is present at all, so a rename fails loudly
    expect(source).toMatch(/const canonicalURL\s*=/);
    /*
     * `canonical` must be an argument to buildCanonicalURL, never the whole value.
     * `canonical ?? buildCanonicalURL(...)` is the regression: it takes the prop
     * verbatim whenever it is set
     */
    expect(source).toMatch(/const canonicalURL\s*=\s*buildCanonicalURL\(\s*canonical\s*\?\?/);
  });
});

/*
 * The rendered `lang`, asserted at its point of use. site-config.test.ts pins the
 * derivation, but that passes with Layout.astro back on a hardcoded `lang="en"`:
 * the value has to be read off the built HTML for the fix to be falsifiable
 */
describe("html lang attribute", () => {
  for (const { name, path } of pages) {
    it(`${name} declares the configured language`, () => {
      const $ = load(readFileSync(path, "utf-8"));
      const lang = $("html").attr("lang");
      expect(lang).toBe(htmlLang);
      /*
       * And that it agrees with og:locale, which is the drift this fix closed. The
       * two use different notations, so neither is wrong on its own and a
       * disagreement is invisible without comparing them
       */
      const ogLocale = $('meta[property="og:locale"]').attr("content");
      expect(ogLocale?.replace("_", "-")).toBe(lang);
    });
  }
});
