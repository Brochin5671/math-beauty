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

  test("skip-to-content link is keyboard-accessible", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: "Skip to content" });
    await expect(skipLink).toBeVisible();
    await skipLink.click();
    await expect(page).toHaveURL(/#main-content/);
  });
});
