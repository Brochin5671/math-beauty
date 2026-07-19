import { describe, expect, it } from "vitest";
import { nestedItems } from "./__fixtures__/nav-items";
import { hasActiveChild } from "./HeaderMobile";

describe("hasActiveChild", () => {
  const parentWithChildren = nestedItems.find((i) => i.label === "Resources");
  if (!parentWithChildren) throw new Error("Fixture missing Resources item");

  it("returns true when a child href matches currentPath", () => {
    expect(hasActiveChild(parentWithChildren, "/resources/#section-a")).toBe(true);
  });

  it("returns false when no child matches", () => {
    expect(hasActiveChild(parentWithChildren, "/about")).toBe(false);
  });

  it("returns false when item has no children", () => {
    expect(hasActiveChild({ label: "About", href: "/about" }, "/about")).toBe(false);
  });

  it("returns false for empty children array", () => {
    expect(hasActiveChild({ label: "Empty", children: [] }, "/about")).toBe(false);
  });
});
