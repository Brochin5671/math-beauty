import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";

function group(extra?: Record<string, unknown>) {
  return (
    <ToggleGroup aria-label="Format" {...extra}>
      <ToggleGroupItem value="bold" aria-label="Bold" />
      <ToggleGroupItem value="italic" aria-label="Italic" />
    </ToggleGroup>
  );
}

describe("ToggleGroup", () => {
  it("carries data-slot and orientation on the group", () => {
    render(group({ orientation: "vertical" }));
    const root = document.querySelector('[data-slot="toggle-group"]');
    expect(root).toHaveAttribute("data-orientation", "vertical");
  });

  it("reflects defaultValue as the pressed item", () => {
    render(group({ defaultValue: ["bold"] }));
    expect(screen.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Italic" })).toHaveAttribute("aria-pressed", "false");
  });

  it("clicking an item presses it and fires onValueChange with that value", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(group({ onValueChange }));
    await user.click(screen.getByRole("button", { name: "Italic" }));
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls.at(-1)?.[0]).toContain("italic");
    expect(screen.getByRole("button", { name: "Italic" })).toHaveAttribute("aria-pressed", "true");
  });

  it("items inherit the group variant and size via data attributes", () => {
    render(group({ variant: "outline", size: "sm" }));
    const item = document.querySelector('[data-slot="toggle-group-item"]');
    expect(item).toHaveAttribute("data-variant", "outline");
    expect(item).toHaveAttribute("data-size", "sm");
  });
});
