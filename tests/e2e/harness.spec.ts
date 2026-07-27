import { expect, test } from "@playwright/test";
import { waitForHydration } from "../fixtures/axe-helper";

/*
 * Covers the shared test helpers themselves. Every a11y and structural spec
 * calls waitForHydration before observing a page, so a helper that returns early
 * makes those scans pass over a state they were supposed to wait through, and
 * nothing else in the suite would notice
 */

test.describe("waitForHydration", () => {
  /*
   * Every page in this project happens to carry the header island, so the
   * island-free case is constructed rather than found. That is the case a
   * consumer hits the moment they ship a page with a pending region and no
   * island, which is also the only case where data-pending is the sole signal
   */
  test("waits for a pending region on a page with no island", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);

    /*
     * The probe clears on the helper's own polling rather than on a timer. A timer
     * makes detection a race: an early-returning helper still reads a cleared probe
     * if the round trips happen to land after the timeout, and CI retries are
     * exactly when they do. Counting the lookups removes wall-clock from it
     */
    await page.evaluate(() => {
      for (const island of document.querySelectorAll("astro-island")) island.remove();
      const pending = document.createElement("div");
      pending.id = "pending-probe";
      pending.dataset.pending = "";
      document.body.appendChild(pending);

      const w = window as unknown as { __pendingLookups: number };
      w.__pendingLookups = 0;
      const original = document.querySelector.bind(document);
      document.querySelector = ((selector: string) => {
        if (selector === "[data-pending]") {
          w.__pendingLookups += 1;
          // Clears on the second poll, so a helper that looks once still sees it
          if (w.__pendingLookups >= 2) pending.remove();
        }
        return original(selector);
      }) as typeof document.querySelector;
    });

    await waitForHydration(page);

    /*
     * `count()` rather than `expect(locator).toHaveCount(0)`: the web-first form
     * auto-retries for five seconds and would sit there waiting out the probe's own
     * removal, which made this pass against a helper that returned immediately
     */
    expect(await page.locator("#pending-probe").count()).toBe(0);

    /*
     * The assertion that actually fails on the regression. A helper returning early
     * never looks for [data-pending] at all, so this reads 0 no matter how the
     * timing falls
     */
    const lookups = await page.evaluate(
      () => (window as unknown as { __pendingLookups: number }).__pendingLookups,
    );
    expect(lookups).toBeGreaterThanOrEqual(2);
  });

  test("still resolves on a page with no island and nothing pending", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      for (const island of document.querySelectorAll("astro-island")) island.remove();
      const w = window as unknown as { __pendingLookups: number };
      w.__pendingLookups = 0;
      const original = document.querySelector.bind(document);
      document.querySelector = ((selector: string) => {
        if (selector === "[data-pending]") w.__pendingLookups += 1;
        return original(selector);
      }) as typeof document.querySelector;
    });
    await waitForHydration(page);
    await expect(page.getByRole("main")).toBeVisible();
    /*
     * Resolving is not the claim on its own: a helper whose body were replaced with
     * `return` resolves too. This is what says the checks ran
     */
    const lookups = await page.evaluate(
      () => (window as unknown as { __pendingLookups: number }).__pendingLookups,
    );
    expect(lookups).toBeGreaterThanOrEqual(1);
  });

  /*
   * A form button can be disabled for reasons that are not a hydration gate, and
   * the gate only exists where there is an island to hydrate. Left unscoped, the
   * helper would hang for its full timeout on a static page with a disabled submit
   */
  test("ignores a disabled form button on a page with no island", async ({ page }) => {
    await page.goto("/contact/");
    await waitForHydration(page);

    await page.evaluate(() => {
      for (const island of document.querySelectorAll("astro-island")) island.remove();
      const form = document.createElement("form");
      const button = document.createElement("button");
      button.type = "submit";
      button.disabled = true;
      form.appendChild(button);
      document.body.appendChild(form);
    });

    await waitForHydration(page);
    await expect(page.getByRole("main")).toBeVisible();
  });
});
