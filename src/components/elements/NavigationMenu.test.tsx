import { render, screen } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuLinkStyle,
} from "./NavigationMenu";

// The variant axis is verified through the exported CVA factory rather than the
// rendered class string, which would echo the Tailwind config
describe("navigationMenuLinkStyle", () => {
  for (const axis of variantAxes(navigationMenuLinkStyle)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(navigationMenuLinkStyle, axis));
  }
});

// The <a> render props look empty to the linter because the visible text is
// passed as NavigationMenuLink children and merged into the anchor by Base UI's
// useRender, the same reason HeaderDesktopMenu suppresses this rule
describe("NavigationMenu", () => {
  it("tags the structural parts with data-slot attributes", () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={
                // text forwarded via NavigationMenuLink children
                <a href="/about" />
              }>
              About
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    for (const slot of [
      "navigation-menu",
      "navigation-menu-list",
      "navigation-menu-item",
      "navigation-menu-link",
    ]) {
      expect(container.querySelector(`[data-slot="${slot}"]`)).toBeInTheDocument();
    }
  });

  it("renders a link as an anchor and forwards href and data-active", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={
                // text forwarded via NavigationMenuLink children
                <a href="/about" data-active />
              }>
              About
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "/about");
    expect(link).toHaveAttribute("data-active", "true");
  });

  it("keeps dropdown content closed by default", () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="resources">
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink
                render={
                  // text forwarded via NavigationMenuLink children
                  <a href="/docs" />
                }>
                Docs
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(screen.getByRole("button", { name: /Resources/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Docs" })).toBeNull();
  });

  it("renders dropdown content when its item is the open value", async () => {
    render(
      <NavigationMenu value="resources">
        <NavigationMenuList>
          <NavigationMenuItem value="resources">
            <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink
                render={
                  // text forwarded via NavigationMenuLink children
                  <a href="/docs" />
                }>
                Docs
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    expect(await screen.findByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
  });
});
