import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("includes conditional classes via object syntax", () => {
    const result = cn("base", { active: true, hidden: false });
    expect(result).toContain("base");
    expect(result).toContain("active");
    expect(result).not.toContain("hidden");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });

  it("handles undefined, null, and false gracefully", () => {
    expect(cn("base", undefined, null, false)).toBe("base");
  });

  it("returns empty string for no input", () => {
    expect(cn()).toBe("");
  });

  it("handles array input", () => {
    expect(cn(["a", "b"])).toBe("a b");
  });
});
