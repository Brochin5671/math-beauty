import { expect, test } from "@playwright/test";
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
});
