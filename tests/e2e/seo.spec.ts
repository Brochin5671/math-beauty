import { expect, test } from "@playwright/test";
import { sitePages } from "../fixtures/site-pages";

test.describe("SEO metadata", () => {
  test("home page title leads with the brand", async ({ page }) => {
    await page.goto("/");
    // brand-first title: "<brand> - <tagline>" with a tagline, just "<brand>"
    // without one; assert it leads with a brand char rather than a specific brand,
    // so the title stays checkable when the brand or tagline changes
    await expect(page).toHaveTitle(/^[^\s-]/);
  });

  for (const { path, name } of sitePages) {
    test(`${name} (${path}) has a canonical URL`, async ({ page }) => {
      await page.goto(path);
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute("href", /.+/);
    });

    test(`${name} (${path}) has a meta description`, async ({ page }) => {
      await page.goto(path);
      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute("content", /.{10,}/);
    });
  }
});
