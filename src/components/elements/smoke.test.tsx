import { describe, expect, it } from "vitest";

/*
 * Element smoke gate. Auto-imports every element module via import.meta.glob so
 * import-time regressions (missing or renamed exports, CVA import drift, peer-dep
 * breakage) fail here the moment a primitive lands - no per-component wiring
 * Scales for free as consumers add elements
 *
 * Each module must export at least one function (the component, and usually its
 * CVA variants factory). Rendering with defaults is intentionally NOT attempted:
 * many elements are compound parts that need a parent context or required props,
 * so a blanket render would assert little. The import + export-shape check is the
 * cheap, high-signal guard; per-component behavior lives in each colocated
 * *.test.tsx
 */

// Eager glob executes each module's top level (CVA definitions, imports), which
// is exactly where drift surfaces. Exclude *.test.tsx siblings at the glob level
// (the negative pattern also drops *.browser.test.tsx, which imports
// vitest/browser and cannot be imported in this forks pool)
const modules = import.meta.glob(["./*.tsx", "!./*.test.tsx"], { eager: true }) as Record<
  string,
  Record<string, unknown>
>;

const componentEntries = Object.entries(modules);

describe("elements smoke", () => {
  it("discovers element modules", () => {
    expect(componentEntries.length).toBeGreaterThan(0);
  });

  for (const [path, mod] of componentEntries) {
    it(`${path} exports at least one function`, () => {
      const fns = Object.values(mod).filter((value) => typeof value === "function");
      expect(fns.length).toBeGreaterThan(0);
    });
  }
});
