import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as cheerio from "cheerio";
import { describe, expect, it } from "vitest";
import { distPath, sitePages } from "../fixtures/site-pages";

/*
 * Asserts the icon set actually reaches the built HTML, and that everything the
 * HTML and the manifest point at exists on disk.
 *
 * astro-favicons generates the files through an integration but injects the tags
 * through middleware that bails unless the response carries
 * `X-Astro-Route-Type: page`, a header Astro 7 never sets. So the whole set
 * generated correctly and no page linked any of it: the manifest was unreachable,
 * there was no theme-color, and nothing failed. Layout.astro injects the tags
 * explicitly now, and this is what notices if that stops working.
 *
 * Requires a prior `pnpm build` (see `pnpm preflight:build`)
 */

const DIST = "dist/client";

function loadPage(urlPath: string) {
  const file = distPath(urlPath);
  if (!existsSync(file)) throw new Error(`missing built page: ${file}`);
  return cheerio.load(readFileSync(file, "utf8"));
}

/** Root-relative local asset paths referenced by the head's icon and manifest tags */
function referencedAssets($: cheerio.CheerioAPI): string[] {
  const refs = new Set<string>();
  const tags = $(
    'link[rel~="icon"], link[rel="manifest"], link[rel="apple-touch-icon"], link[rel="mask-icon"]',
  ).toArray();
  for (const tag of tags) {
    const href = $(tag).attr("href");
    if (href?.startsWith("/")) refs.add(href);
  }
  return [...refs];
}

describe("head icons and manifest", () => {
  for (const { path, name } of sitePages) {
    describe(`${name} (${path})`, () => {
      it("links the web app manifest", () => {
        const $ = loadPage(path);
        expect($('link[rel="manifest"]').attr("href")).toBe("/manifest.webmanifest");
      });

      it("declares a theme-color", () => {
        const $ = loadPage(path);
        const themeColors = $('meta[name="theme-color"]')
          .toArray()
          .map((el) => $(el).attr("content"));
        /*
         * One tag, and its value pinned to the configured theme rather than to a hex
         * shape. `themes: ["#0a0a0a"]` in astro.config.mjs is the single source, so a
         * regex would accept a light value on a dark-by-default site
         */
        expect(themeColors).toEqual(["#0a0a0a"]);
      });

      it("links an svg icon and an ico fallback", () => {
        const $ = loadPage(path);
        const hrefs = $('link[rel~="icon"]')
          .toArray()
          .map((el) => $(el).attr("href"));
        expect(hrefs).toContain("/favicon.svg");
        expect(hrefs).toContain("/favicon.ico");
      });

      it("links an apple-touch-icon", () => {
        const $ = loadPage(path);
        // Two: the bare 180x180 plus the precomposed variant the generator emits
        expect($('link[rel="apple-touch-icon"]').length).toBe(2);
      });

      /*
       * The direction that catches a broken reference. Every tag above could be
       * present and point at a file the generator no longer emits, which fails in a
       * browser and nowhere else
       */
      it("references only files that exist in the build", () => {
        const $ = loadPage(path);
        const refs = referencedAssets($);
        expect(refs.length).toBeGreaterThan(0);
        const missing = refs.filter((href) => !existsSync(join(DIST, href)));
        expect(missing).toEqual([]);
      });
    });
  }

  it("the manifest's own icons exist in the build", () => {
    const manifest = JSON.parse(readFileSync(join(DIST, "manifest.webmanifest"), "utf8")) as {
      icons?: { src: string }[];
    };
    const icons = manifest.icons ?? [];
    expect(icons.length).toBeGreaterThan(0);
    const missing = icons.map((icon) => icon.src).filter((src) => !existsSync(join(DIST, src)));
    expect(missing).toEqual([]);
  });

  /*
   * The splash screen shows background_color before the app paints, so #fff on a
   * dark-by-default site flashes white. Pinned to the shipped theme
   */
  it("the manifest's background matches the shipped theme", () => {
    const manifest = JSON.parse(readFileSync(join(DIST, "manifest.webmanifest"), "utf8")) as {
      background_color?: string;
      theme_color?: string;
    };
    expect(manifest.background_color).toBe("#0a0a0a");
    expect(manifest.theme_color).toBe("#0a0a0a");
  });
});
