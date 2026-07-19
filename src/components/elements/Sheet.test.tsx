import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "./Sheet";

function fixture(extra?: Record<string, unknown>) {
  return (
    <Sheet {...extra}>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent side="right">
        <SheetTitle>Filters</SheetTitle>
        <SheetDescription>Refine the list.</SheetDescription>
      </SheetContent>
    </Sheet>
  );
}

describe("Sheet", () => {
  it("does not mount the portaled content until opened", () => {
    render(fixture());
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on trigger click and shows the titled content", async () => {
    const user = userEvent.setup();
    render(fixture());
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog")).toBeVisible();
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("controlled: open renders content and Escape fires onOpenChange(false)", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(fixture({ open: true, onOpenChange }));
    expect(screen.getByRole("dialog")).toBeVisible();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalled();
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
  });
});
