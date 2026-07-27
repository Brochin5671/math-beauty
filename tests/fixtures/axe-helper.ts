import AxeBuilder from "@axe-core/playwright";
import type { Page, TestInfo } from "@playwright/test";

/*
 * Shared AxeBuilder configured for WCAG 2.1 + 2.2 AA compliance scanning
 * plus axe-core's `best-practice` rule set. WCAG 2.2 (Oct 2023) adds 9 SC
 * over 2.1; most are dev-discipline rather than axe-detectable, but the
 * tag is forward-compat for upcoming axe rules. `best-practice` catches
 * non-WCAG issues that still produce real UX bugs (e.g. skip-link targets
 * without `tabindex="-1"` and content outside landmark regions)
 */
export function createAxeBuilder(page: Page) {
  return new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
    "wcag22a",
    "wcag22aa",
    "best-practice",
  ]);
}

// Result shape of an axe scan, derived from AxeBuilder so no direct axe-core
// type import is needed
type AxeScanResults = Awaited<ReturnType<ReturnType<typeof createAxeBuilder>["analyze"]>>;

/*
 * Attach the full axe result set to the test as a JSON artifact, but only when
 * the scan found violations. On a CI failure the Playwright report (and the CD
 * merged report) then carries the exact rules, node targets, and failureSummary
 * for each violation, so an a11y failure is triageable without a local re-run.
 * Clean scans attach nothing, keeping the report light across the full matrix.
 * See Playwright docs -> accessibility-testing -> exporting scan results as an
 * attachment
 */
export async function attachAxeResults(testInfo: TestInfo, results: AxeScanResults) {
  if (results.violations.length === 0) return;
  await testInfo.attach("axe-scan-results", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });
}

/*
 * Suppress CSS transitions/animations and force-reveal `.reveal` sections before
 * passive scans. axe-core composites colors via getComputedStyle, which can
 * read transition-interpolated or zero opacity:
 *   - shadcn Button's `transition-all` + `disabled:opacity-50` flap during
 *     hydration (mobile-webkit) - axe captures `bg-primary` at ~50% opacity
 *     composited over body bg, failing color-contrast at ~3.5:1
 *   - `.reveal` sections start at opacity:0 and only flip via IntersectionObserver
 *     when they enter the viewport. axe may sample mid-fade and read an
 *     interpolated text color (e.g. `#828282` instead of `#ababab`)
 *
 * Two-pronged: emulateMedia sets `prefers-reduced-motion: reduce` so the OS-level
 * preference is active during hydration. The global `@media (prefers-reduced-motion:
 * reduce)` block in global.css then suppresses every transition + animation
 * site-wide. The injected `<style>` is the belt to those braces - it covers
 * `.reveal` opacity explicitly so scans stay deterministic even if global.css
 * drifts. Site CSS stays untouched outside the scan
 */
export async function disableAnimations(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition-duration: 0s !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
      }
      .reveal {
        opacity: 1 !important;
        transform: none !important;
      }
      .reveal [data-stagger] {
        opacity: 1 !important;
        transform: none !important;
      }
    `,
  });
}

/*
 * Use before passive observations (axe scans, structural assertions) on pages
 * with React islands. Interactions don't need this; the Interactive island
 * convention auto-waits via Playwright actionability
 */
export async function waitForHydration(page: Page) {
  /*
   * Three signals composed: Astro island lifecycle complete (`ssr` attr cleared),
   * every lazy boundary resolved (no `data-pending` placeholder left standing),
   * AND React useEffect has fired (no `<form>` button left disabled by the
   * hydration gate). Webkit's runtime can clear the island ssr attribute before
   * React's useEffect runs, so polling only on `[ssr]` is insufficient on
   * mobile-webkit, and a lazily imported panel lands later still, which would
   * otherwise let a scan pass over markup that has not rendered yet
   */
  await page.waitForFunction(
    () => {
      if (document.querySelector("astro-island[ssr]")) return false;
      if (document.querySelector("[data-pending]")) return false;
      if (!document.querySelector("astro-island")) return true;
      const formBtns = Array.from(document.querySelectorAll("form button"));
      return formBtns.every((btn) => !(btn as HTMLButtonElement).disabled);
    },
    null,
    /*
     * 10s (not 5s) because under full-suite load mobile-webkit hydration latency
     * stretches past the 5s default; flake-tested with
     * `pnpm exec playwright test --repeat-each=5` under preflight
     */
    { timeout: 10000 },
  );
}
