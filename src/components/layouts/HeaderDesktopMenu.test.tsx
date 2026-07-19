import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { nestedItems } from "./__fixtures__/nav-items";
import { HeaderDesktopMenu } from "./HeaderDesktopMenu";

// Exercises the desktop nav wrapper as a black box: items + currentPath in,
// link/trigger structure and active state out. The dropdown content is portaled
// by Base UI only when open, so these assertions cover the closed trigger row;
// the open-content path is covered in NavigationMenu.test.tsx.
describe("HeaderDesktopMenu", () => {
  it("renders flat items as links with their href", () => {
    render(<HeaderDesktopMenu items={nestedItems} currentPath="/" />);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about/");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact/");
  });

  it("marks the link matching currentPath as active", () => {
    render(<HeaderDesktopMenu items={nestedItems} currentPath="/about/" />);
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("data-active", "true");
    expect(screen.getByRole("link", { name: "Contact" })).not.toHaveAttribute("data-active");
  });

  it("renders an item with children as a trigger, not a link", () => {
    render(<HeaderDesktopMenu items={nestedItems} currentPath="/" />);
    expect(screen.getByRole("button", { name: /Resources/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Resources" })).toBeNull();
  });

  it("flags the parent trigger active when a child matches currentPath", () => {
    render(<HeaderDesktopMenu items={nestedItems} currentPath="/resources/#section-a" />);
    expect(screen.getByRole("button", { name: /Resources/ })).toHaveClass("font-semibold");
  });

  it("does not flag the parent trigger active when no child matches", () => {
    render(<HeaderDesktopMenu items={nestedItems} currentPath="/about/" />);
    expect(screen.getByRole("button", { name: /Resources/ })).not.toHaveClass("font-semibold");
  });

  it("renders the root as a div so the Header nav stays the only landmark", () => {
    const { container } = render(<HeaderDesktopMenu items={nestedItems} currentPath="/" />);
    expect(container.querySelector('[data-slot="navigation-menu"]')?.tagName).toBe("DIV");
  });

  it("spaces the nav list by the itemsGap prop, defaulting to gap-6", () => {
    const { container, rerender } = render(
      <HeaderDesktopMenu items={nestedItems} currentPath="/" />,
    );
    expect(container.querySelector('[data-slot="navigation-menu-list"]')).toHaveClass("gap-6");
    rerender(<HeaderDesktopMenu items={nestedItems} currentPath="/" itemsGap="lg" />);
    expect(container.querySelector('[data-slot="navigation-menu-list"]')).toHaveClass("gap-8");
  });
});
