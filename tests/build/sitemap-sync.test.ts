import { readFileSync } from "node:fs";
import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import { sitePages } from "../fixtures/site-pages";

// Catches the "consumer added a page to src/pages/ but forgot to update
// sitePages" failure mode: every URL in the built sitemap must be in the
// fixture, and vice versa, so all page-driven tests cover every real page

describe("Sitemap sync", () => {
  it("sitePages fixture matches every URL in the generated sitemap", () => {
    const xml = readFileSync("dist/client/sitemap-0.xml", "utf-8");
    const $ = load(xml, { xmlMode: true });

    const sitemapPaths = $("loc")
      .toArray()
      .map((el) => new URL($(el).text()).pathname)
      .sort();

    const fixturePaths = sitePages.map((p) => p.path).sort();

    expect(sitemapPaths).toEqual(fixturePaths);
  });
});
