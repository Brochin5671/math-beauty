import { expect, test } from "@playwright/test";
import { waitForHydration } from "../fixtures/axe-helper";
import { sitePages } from "../fixtures/site-pages";

// Tests under emulation conditions that real users encounter
// page.emulateMedia accepts reducedMotion and forcedColors directly,
// avoiding the typing limitations of test.use() for these options

test.describe("Reduced motion preference", () => {
  for (const { path, name } of sitePages) {
    test(`${name} (${path}) renders with reduced motion`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await expect(page.getByRole("main")).toBeVisible();
    });
  }
});

test.describe("Forced colors (Windows high-contrast)", () => {
  for (const { path, name } of sitePages) {
    test(`${name} (${path}) renders under forced colors`, async ({ page }) => {
      await page.emulateMedia({ forcedColors: "active" });
      await page.goto(path);
      await expect(page.getByRole("main")).toBeVisible();
    });
  }

  /*
   * The focus indicator has to survive forced colors, and most of the library's
   * indicators do not: a `ring-*` box-shadow is not painted in that mode at all,
   * and border-color is forced to the same system colour focused or not, so
   * `focus-visible:border-ring` produces no visible change either.
   *
   * Measured on a Button before this was fixed: focusing changed border,
   * box-shadow, background, colour and text-decoration by nothing, and the
   * outline resolved to `none` in both states. Every interactive element on the
   * page took focus with no indicator.
   *
   * This asserts a painted outline rather than "some property differs", because a
   * difference in a property that is not rendered is what the old state had
   */
  test("a focused button paints an outline under forced colors", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto("/");
    /*
     * Hydration first, then measure. The control panel is a React island, so holding a
     * locator handle across its hydration re-render leaves it pointing at a detached
     * node, and `getComputedStyle` on a detached node returns "" for every property
     * rather than failing, which reads as "outline-style is unset"
     */
    await waitForHydration(page);

    const SELECTOR = 'main [data-slot="button"]';
    await expect(page.locator(SELECTOR).first()).toBeVisible();

    /*
     * Resolved fresh inside the page on every read, for the same reason: a re-render
     * between the poll's start and its next tick must not silently blank the result
     */
    const outlineOf = () =>
      page.evaluate((selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const cs = getComputedStyle(el);
        if (cs.display === "") return null;
        return {
          style: cs.outlineStyle,
          width: cs.outlineWidth,
          offset: cs.outlineOffset,
          /*
           * The colour matters as much as the width. Tailwind's outline-hidden reserves
           * `2px solid transparent`, and it only becomes an indicator because
           * forced-colors mode forces the colour to a system one. Without this a
           * reserved-but-invisible outline would pass identically
           */
          transparent: cs.outlineColor === "rgba(0, 0, 0, 0)" || cs.outlineColor === "transparent",
        };
      }, SELECTOR);

    // Unfocused it draws nothing, which is what makes the focused case a signal
    expect((await outlineOf())?.style).toBe("none");

    await page.locator(SELECTOR).first().focus();
    /*
     * Polls the whole resolved outline rather than waiting on `style` and then reading
     * `width`. Button carries `transition-all`, so outline-width animates from its
     * resting 3px to the focused 2px: a poll that returns as soon as the style stops
     * being "none" samples the width mid-transition and reads 3
     *
     * 2px at 2px offset is what Tailwind's `outline-hidden` reserves inside its
     * `forced-colors: active` block, which is the whole reason that utility is on this
     * component
     */
    await expect
      .poll(outlineOf)
      .toEqual({ style: "solid", width: "2px", offset: "2px", transparent: false });
  });
});
