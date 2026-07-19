import { defineConfig, devices } from "@playwright/test";

// Test infrastructure owns its port; does not depend on Astro's default
const TEST_PORT = 4400;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${TEST_PORT}`;

// Browser-deterministic specs: axe rules and head-tag/meta assertions read
// the DOM + computed styles, not engine internals, so a second engine adds
// no signal. The testIgnore entries below keep them off the extra browsers
const CHROMIUM_ONLY = [/seo\.spec/, /emulation\.spec/];

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  /*
   * Local keeps retries at 0: a flake is a real bug, so fix the test rather
   * than paper over it. CI gets 2 retries to absorb parallel-load timing
   * flakes that do not reproduce locally. Real flakes still surface in dev
   * where retries stay 0.
   */
  retries: process.env.CI ? 2 : 0,
  // 2 workers, one per runner core. The a11y suite is all-chromium so a single
  // CD job with workers=2 covers it without sharding. Local: 2 workers (the
  // unbounded default overwhelms the shared preview server)
  workers: 2,
  // CI: `list` streams live per-test progress to the job log; `html` is the
  // durable report (uploaded as an artifact); `github` posts inline
  // annotations (pass count, flaky, slowest spec)
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }], ["github"]]
    : [["html", { open: "on-failure" }]],
  timeout: 15_000,
  use: {
    baseURL: BASE_URL,
    // CI runs retries:2, so on-first-retry captures the run where a flake
    // reproduces without tracing every pass. Local runs retries:0, where
    // on-first-retry never fires - keep retain-on-failure for live debugging
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 5_000,
    // CONFIGURE: pin for reproducible runs; change for non-US/UTC audiences
    locale: "en-US",
    timezoneId: "UTC",
    // CONFIGURE: matches site's class="dark"; forward-compat for prefers-color-scheme
    colorScheme: "dark",
  },
  // Chromium desktop + mobile only (webkit and firefox dropped to keep CI light)
  // Integration project runs HTTP-only specs against the preview server (no browser device)
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] },
      testIgnore: CHROMIUM_ONLY,
    },
    { name: "integration", testDir: "./tests/integration" },
  ],
  webServer: {
    command: `pnpm preview --port ${TEST_PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // Astro 7's Cloudflare adapter previews through workerd; a cold boot (first
    // CI run, no warm cache) runs past the old 15s, so give startup headroom
    timeout: 120_000,
  },
});
