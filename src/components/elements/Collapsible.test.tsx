import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./Collapsible";

function fixture(extra?: Record<string, unknown>) {
  return (
    <Collapsible {...extra}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Body</CollapsibleContent>
    </Collapsible>
  );
}

describe("Collapsible", () => {
  it("starts collapsed and expands on trigger click", async () => {
    const user = userEvent.setup();
    render(fixture());
    const trigger = screen.getByRole("button", { name: "Toggle" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Body")).toBeVisible();
  });

  it("seeds the open state from defaultOpen", () => {
    render(fixture({ defaultOpen: true }));
    expect(screen.getByRole("button", { name: "Toggle" })).toHaveAttribute("aria-expanded", "true");
  });

  it("controlled: honors open and fires onOpenChange without self-updating", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(fixture({ open: true, onOpenChange }));
    const trigger = screen.getByRole("button", { name: "Toggle" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(onOpenChange).toHaveBeenCalled();
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
