import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "./Separator";

describe("Separator", () => {
  it("renders a horizontal separator landmark by default", () => {
    const { container } = render(<Separator />);
    const node = container.querySelector('[data-slot="separator"]');
    expect(node).not.toBeNull();
    expect(node).toHaveAttribute("role", "separator");
    expect(node).toHaveAttribute("data-orientation", "horizontal");
  });

  it("exposes the vertical orientation to assistive tech", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const node = container.querySelector('[data-slot="separator"]');
    expect(node).toHaveAttribute("aria-orientation", "vertical");
    expect(node).toHaveAttribute("data-orientation", "vertical");
  });

  it("merges consumer className over the defaults", () => {
    const { container } = render(<Separator className="my-8" />);
    const node = container.querySelector('[data-slot="separator"]');
    expect(node).toHaveClass("my-8");
    expect(node).toHaveClass("bg-border");
  });
});
