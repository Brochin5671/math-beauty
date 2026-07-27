/*
 * Naming rules that axe cannot enforce, asserted against the built HTML.
 *
 * `<time>` has no corresponding ARIA role, so `aria-label` on it is prohibited by ARIA
 * and screen readers commonly drop the label, leaving the element's own text. axe does
 * not catch it: it returns *incomplete* when the element has text, and inside a link it
 * does not flag it at all, which is the case that ships most often. So it needs its own
 * assertion rather than trusting the scan.
 *
 * The same reasoning covers the other roleless elements below. Where a date needs a
 * different spoken form from its visible text, the fix is a visually hidden sibling, not
 * a label on the element.
 *
 * Requires a prior `pnpm build` (see `pnpm preflight:build`)
 */

import { readFileSync } from "node:fs";
import * as cheerio from "cheerio";
import { describe, expect, it } from "vitest";
import { distPath, sitePages } from "../fixtures/site-pages";

/** Elements ARIA gives no role, so an accessible name on them is prohibited */
const ROLELESS = ["time", "span", "div"] as const;

/** Only `time` is asserted for now; span and div carry roles once given one */
const NAMEABLE_ONLY_WITH_ROLE = ["time"] as const;

function load(urlPath: string) {
  return cheerio.load(readFileSync(distPath(urlPath), "utf8"));
}

describe("prohibited ARIA attributes", () => {
  /*
   * Guards every loop below. `sitePages` is the single registry, and an empty one would
   * make each case vacuous while reading as a pass
   */
  it("has pages to scan", () => {
    expect(sitePages.length).toBeGreaterThan(0);
    expect(ROLELESS.length).toBeGreaterThan(0);
  });

  for (const { path, name } of sitePages) {
    it(`${name} (${path}) puts no accessible name on a <time>`, () => {
      const $ = load(path);
      for (const tag of NAMEABLE_ONLY_WITH_ROLE) {
        const offenders = $(tag)
          .toArray()
          .filter((el) => {
            const $el = $(el);
            return (
              $el.attr("aria-label") !== undefined || $el.attr("aria-labelledby") !== undefined
            );
          })
          .map((el) => $.html(el));
        expect(
          offenders,
          `<${tag}> has no ARIA role, so naming it is prohibited; use a visually hidden sibling`,
        ).toEqual([]);
      }
    });

    /*
     * The other half of the same rule: an element given `role="region"` must be named, or
     * it is dropped from the accessibility tree, and its `aria-roledescription` goes with
     * it. axe's `region` rule checks that content sits inside a landmark, not that a
     * declared landmark has a name
     */
    it(`${name} (${path}) names every role="region"`, () => {
      const $ = load(path);
      const unnamed = $('[role="region"]')
        .toArray()
        .filter((el) => {
          const $el = $(el);
          return $el.attr("aria-label") === undefined && $el.attr("aria-labelledby") === undefined;
        })
        .map((el) => $.html(el).slice(0, 120));
      expect(unnamed, 'an unnamed role="region" is dropped from the accessibility tree').toEqual(
        [],
      );
    });
  }
});
