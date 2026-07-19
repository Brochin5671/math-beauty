import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "./Drawer";

function fixture(extra?: Record<string, unknown>) {
  return (
    <Drawer {...extra}>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>Cart</DrawerTitle>
        <DrawerDescription>Your items.</DrawerDescription>
      </DrawerContent>
    </Drawer>
  );
}

describe("Drawer", () => {
  it("does not mount the portaled content until opened", () => {
    render(fixture());
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on trigger click and shows the titled content", async () => {
    const user = userEvent.setup();
    render(fixture());
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByRole("dialog")).toBeVisible();
    expect(screen.getByText("Cart")).toBeInTheDocument();
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
