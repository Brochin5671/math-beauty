import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AspectRatio } from "./AspectRatio";

describe("AspectRatio", () => {
  it("renders a div with data-slot=aspect-ratio", () => {
    const { getByText } = render(<AspectRatio ratio={16 / 9}>x</AspectRatio>);
    const node = getByText("x");
    expect(node).toHaveAttribute("data-slot", "aspect-ratio");
    expect(node.tagName).toBe("DIV");
  });

  it("sets --ratio CSS custom property from the ratio prop", () => {
    const { getByText } = render(<AspectRatio ratio={1}>x</AspectRatio>);
    const node = getByText("x") as HTMLElement;
    expect(node.style.getPropertyValue("--ratio")).toBe("1");
  });

  it("applies aspect-(--ratio) utility + relative positioning", () => {
    const { getByText } = render(<AspectRatio ratio={4 / 3}>x</AspectRatio>);
    const node = getByText("x");
    expect(node).toHaveClass("relative");
    expect(node).toHaveClass("aspect-(--ratio)");
  });

  it("merges consumer className with base classes", () => {
    const { getByText } = render(
      <AspectRatio ratio={1} className="custom-x">
        x
      </AspectRatio>,
    );
    expect(getByText("x")).toHaveClass("custom-x");
    expect(getByText("x")).toHaveClass("relative");
  });
});
