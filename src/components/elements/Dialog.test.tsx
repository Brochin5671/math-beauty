import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./Dialog";

function fixture(extra?: Record<string, unknown>) {
  return (
    <Dialog {...extra}>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogTitle>Confirm</DialogTitle>
        <DialogDescription>Are you sure?</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("does not mount the portaled content until opened", () => {
    render(fixture());
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on trigger click and shows the titled content", async () => {
    const user = userEvent.setup();
    render(fixture());
    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeVisible();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
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
