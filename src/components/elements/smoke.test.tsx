import { describe, expect, it } from "vitest";

/*
 * Element smoke gate. Auto-imports every element module via import.meta.glob so
 * import-time regressions (missing or renamed exports, CVA import drift, peer-dep
 * breakage) fail here the moment a primitive lands - no per-component wiring
 * Scales for free as elements are added
 *
 * Each module must export a component named after its file. Rendering with
 * defaults is intentionally NOT attempted: many elements are compound parts that
 * need a parent context or required props, so a blanket render would assert
 * little. The import + export-shape check is the cheap, high-signal guard;
 * per-component behavior lives in each colocated *.test.tsx
 *
 * The name is what makes this fail on the case worth catching. "exports at least
 * one function" is satisfied by the CVA variants factory alone, so deleting the
 * component itself from a module left this green
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

/** "./AlertDialog.tsx" -> "AlertDialog" */
function componentNameFor(path: string): string {
  return path.replace(/^\.\//, "").replace(/\.tsx$/, "");
}

describe("elements smoke", () => {
  /*
   * A count floor alone cannot fail usefully here: at zero the loop below emits no
   * tests either, so the file would go quiet rather than red. Naming a module that
   * must be present is what proves the glob still resolves
   */
  it("discovers element modules", () => {
    expect(componentEntries.map(([path]) => componentNameFor(path))).toContain("Button");
  });

  for (const [path, mod] of componentEntries) {
    const name = componentNameFor(path);
    it(`${path} exports ${name}`, () => {
      expect(typeof mod[name]).toBe("function");
    });
  }
});
