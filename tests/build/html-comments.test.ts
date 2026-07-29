/*
 * Prose comments must not ship to the reader, asserted against the built HTML.
 *
 * An `<!-- -->` comment in an Astro template is markup and ships on every page; a
 * `{/* *\/}` one is compile-time and does not. The two look interchangeable in the
 * template and nothing flags the difference, so internal design reasoning reaches
 * production HTML without anyone choosing it.
 *
 * The allowlist is scoped to framework and conditional-comment syntax, so the rule
 * stays about our prose rather than banning comments outright.
 *
 * Requires a prior `pnpm build` (see `pnpm preflight:build`)
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { distPath, sitePages } from "../fixtures/site-pages";

/*
 * Comment bodies that are allowed to ship. `astro:` covers the framework's own markers
 * (`<!--astro:end-->`); `[if ` and `<![endif]` cover downlevel conditional comments, which
 * are a targeting mechanism rather than prose; the `$` set is React's Suspense boundary
 * markers (`<!--$-->`, `<!--$?-->`, `<!--$!-->`, `<!--/$-->`), which hydration needs and
 * which only appear on a page that renders a Suspense boundary
 *
 * Each is anchored at both ends so the allowlist stays about exact markers. A prefix match
 * on `$` would excuse any comment starting with it
 */
const ALLOWED = [/^astro:/, /^\[if /, /^<!\[endif\]/, /^\$[?!]?$/, /^\/\$$/];

const COMMENT_RE = /<!--([\s\S]*?)-->/g;

function shippedComments(urlPath: string): string[] {
  const html = readFileSync(distPath(urlPath), "utf8");
  const found: string[] = [];
  for (const [, body] of html.matchAll(COMMENT_RE)) {
    const text = (body ?? "").trim();
    if (text.length === 0) continue;
    if (ALLOWED.some((re) => re.test(text))) continue;
    found.push(text);
  }
  return found;
}

describe("shipped HTML comments", () => {
  // an empty registry would make every case below vacuous while reading as a pass
  it("has pages to scan", () => {
    expect(sitePages.length).toBeGreaterThan(0);
  });

  for (const { path, name } of sitePages) {
    it(`${name} (${path}) ships no prose comment`, () => {
      expect(shippedComments(path)).toEqual([]);
    });
  }
});
