import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "./Popover";

function fixture(extra?: Record<string, unknown>) {
  return (
    <Popover {...extra}>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Account</PopoverTitle>
        <PopoverDescription>Manage your account.</PopoverDescription>
      </PopoverContent>
    </Popover>
  );
}

describe("Popover", () => {
  it("does not mount the portaled content until opened", () => {
    render(fixture());
    expect(screen.queryByText("Account")).toBeNull();
  });

  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(fixture());
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Account")).toBeVisible();
  });

  it("controlled: open renders content and Escape fires onOpenChange(false)", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(fixture({ open: true, onOpenChange }));
    expect(screen.getByText("Account")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalled();
    expect(onOpenChange.mock.calls.at(-1)?.[0]).toBe(false);
  });
});
