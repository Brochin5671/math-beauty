import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it, vi } from "vitest";
import { Toggle, toggleVariants } from "./Toggle";

describe("toggleVariants", () => {
  for (const axis of variantAxes(toggleVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(toggleVariants, axis));
  }
});

describe("Toggle", () => {
  it("renders an unpressed toggle button with data-slot", () => {
    render(<Toggle aria-label="Bold" />);
    const toggle = screen.getByRole("button", { name: "Bold" });
    expect(toggle).toHaveAttribute("data-slot", "toggle");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("uncontrolled: defaultPressed seeds state and a click toggles it", async () => {
    const user = userEvent.setup();
    render(<Toggle defaultPressed aria-label="Bold" />);
    const toggle = screen.getByRole("button", { name: "Bold" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("controlled: honors pressed and fires onPressedChange without self-updating", async () => {
    const onPressedChange = vi.fn();
    const user = userEvent.setup();
    render(<Toggle pressed={false} onPressedChange={onPressedChange} aria-label="Bold" />);
    const toggle = screen.getByRole("button", { name: "Bold" });
    await user.click(toggle);
    expect(onPressedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("disabled blocks interaction", async () => {
    const onPressedChange = vi.fn();
    const user = userEvent.setup();
    render(<Toggle disabled onPressedChange={onPressedChange} aria-label="Bold" />);
    await user.click(screen.getByRole("button", { name: "Bold" }));
    expect(onPressedChange).not.toHaveBeenCalled();
  });
});
