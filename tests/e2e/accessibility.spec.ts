import { expect, test } from "@playwright/test";
import {
  attachAxeResults,
  createAxeBuilder,
  disableAnimations,
  waitForHydration,
} from "../fixtures/axe-helper";
import { sitePages } from "../fixtures/site-pages";

test.describe("Accessibility (WCAG 2.1 + 2.2 AA)", () => {
  for (const { path, name } of sitePages) {
    test(`${name} (${path}) has no a11y violations`, async ({ page }, testInfo) => {
      await page.goto(path);
      /*
       * Suppress transitions BEFORE waiting for hydration. The
       * disabled -> enabled flip on hydrated form buttons fires a CSS
       * transition (`transition-all` + `disabled:opacity-50`). On webkit /
       * mobile-webkit the transition can still be in flight when axe scans,
       * capturing `bg-primary` at ~50% opacity composited over body bg
       * (~3.5:1 contrast). Suppressing first makes the flip snap to opacity:1
       */
      await disableAnimations(page);
      await waitForHydration(page);
      const results = await createAxeBuilder(page).analyze();
      await attachAxeResults(testInfo, results);
      expect(results.violations).toEqual([]);
    });
  }

  test("404 page has no a11y violations", async ({ page }, testInfo) => {
    await page.goto("/nonexistent-page");
    await disableAnimations(page);
    await waitForHydration(page);
    const results = await createAxeBuilder(page).analyze();
    await attachAxeResults(testInfo, results);
    expect(results.violations).toEqual([]);
  });
});
