import { expect, test } from "@playwright/test";
import { sitePages } from "../fixtures/site-pages";

test.describe("Smoke tests", () => {
  for (const { path, name } of sitePages) {
    test(`${name} (${path}) loads with title and main content`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(/.+/);
      await expect(page.getByRole("main")).toBeVisible();
    });
  }

  test("404 page renders for unknown routes", async ({ page }) => {
    const response = await page.goto("/nonexistent-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "Go Home" })).toBeVisible();
  });

  test("robots.txt is served with sitemap reference", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    const body = await response?.text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Sitemap:");
  });

  /*
   * Guards the cascade behind the display:contents override in global.css, where a bare
   * selector loses to Astro's own rule and would leave every other check green. The matrix
   * is Chromium only, so this proves the rule applies, not that iOS behaves
   */
  test("the hydration root has a layout box", async ({ page }) => {
    await page.goto("/");
    const island = page.locator('astro-island[component-export="FractalViewer"]');
    await expect(island).toHaveCSS("display", "block");
    const box = await island.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.width).toBeGreaterThan(0);
    expect(box?.height).toBeGreaterThan(0);
  });

  test("skip-to-content link is keyboard-accessible", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).toBeVisible();
    await skipLink.click();
    await expect(page).toHaveURL(/#main-content/);
  });
});
