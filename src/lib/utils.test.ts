import { describe, expect, it } from "vitest";
import { cn, slugify } from "./utils";

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

describe("slugify", () => {
  it("lowercases and hyphenates whitespace", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips path separators and dots so a slug cannot traverse", () => {
    expect(slugify("a/../b")).toBe("a-b");
  });

  it("drops other punctuation and collapses runs", () => {
    expect(slugify("Foo & Bar!")).toBe("foo-bar");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  --x--  ")).toBe("x");
  });
});
