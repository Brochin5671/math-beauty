import { render, screen } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Kbd, KbdGroup, kbdVariants } from "./Kbd";

describe("kbdVariants", () => {
  for (const axis of variantAxes(kbdVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(kbdVariants, axis));
  }
});

describe("Kbd", () => {
  it("renders a kbd element with the default variant and size", () => {
    render(<Kbd>Esc</Kbd>);
    const kbd = screen.getByText("Esc");
    expect(kbd.tagName).toBe("KBD");
    expect(kbd).toHaveAttribute("data-slot", "kbd");
    expect(kbd).toHaveAttribute("data-variant", "filled");
    expect(kbd).toHaveAttribute("data-size", "default");
  });

  it("reflects variant and size via data attributes", () => {
    render(
      <Kbd variant="outline" size="lg">
        K
      </Kbd>,
    );
    const kbd = screen.getByText("K");
    expect(kbd).toHaveAttribute("data-variant", "outline");
    expect(kbd).toHaveAttribute("data-size", "lg");
  });

  it("KbdGroup wraps keys with its data-slot", () => {
    const { container } = render(
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    );
    expect(container.querySelector('[data-slot="kbd-group"]')).not.toBeNull();
  });
});
