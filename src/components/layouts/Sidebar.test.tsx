import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setViewportWidth } from "@tests/fixtures/match-media";
import { describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./Sidebar";

// sidebarMenuButtonVariants is not exported, so the menu button's size is
// covered through its observable data-size attribute below.
function fixture(providerProps?: Record<string, unknown>, buttonProps?: Record<string, unknown>) {
  return (
    <SidebarProvider {...providerProps}>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive {...buttonProps}>
                  Home
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger />
    </SidebarProvider>
  );
}

function sidebarEl() {
  return document.querySelector('[data-slot="sidebar"]');
}

describe("Sidebar", () => {
  it("renders expanded by default", () => {
    render(fixture());
    expect(sidebarEl()).toHaveAttribute("data-state", "expanded");
  });

  it("collapses when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(fixture());
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(sidebarEl()).toHaveAttribute("data-state", "collapsed");
  });

  it("controlled: respects the open prop and fires onOpenChange", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(fixture({ open: true, onOpenChange }));
    expect(sidebarEl()).toHaveAttribute("data-state", "expanded");
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("marks the active menu button with data-active", () => {
    render(fixture());
    expect(document.querySelector('[data-slot="sidebar-menu-button"]')).toHaveAttribute(
      "data-active",
    );
  });

  it("reflects the menu button size via data-size", () => {
    render(fixture(undefined, { size: "lg" }));
    expect(document.querySelector('[data-slot="sidebar-menu-button"]')).toHaveAttribute(
      "data-size",
      "lg",
    );
  });

  it("throws when a sidebar part is used without a provider", () => {
    expect(() => render(<SidebarTrigger />)).toThrow(/SidebarProvider/);
  });

  it("renders the mobile sheet branch on a narrow viewport", async () => {
    const reset = setViewportWidth(375);
    try {
      const user = userEvent.setup();
      render(fixture());
      // On mobile the sidebar is a closed Sheet (mount-on-open), so the trigger
      // opens it; the opened dialog is the mobile sidebar surface.
      await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
      const sheet = await screen.findByRole("dialog");
      expect(sheet).toHaveAttribute("data-mobile", "true");
    } finally {
      reset();
    }
  });
});
