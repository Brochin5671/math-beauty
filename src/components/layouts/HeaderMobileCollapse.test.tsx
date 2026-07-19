import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { flatItems, nestedItems } from "./__fixtures__/nav-items";
import { HeaderMobileCollapse } from "./HeaderMobileCollapse";

describe("HeaderMobileCollapse", () => {
  it("renders a labelled trigger that starts collapsed", () => {
    render(
      <HeaderMobileCollapse
        items={flatItems}
        currentPath="/about/"
        mobileTriggerLabel="Open menu"
      />,
    );
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("toggles open and closed on trigger clicks", async () => {
    const user = userEvent.setup();
    render(<HeaderMobileCollapse items={flatItems} currentPath="/about/" />);
    const trigger = screen.getByRole("button", { name: "Open menu" });
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("exposes a link per flat nav item once open", async () => {
    const user = userEvent.setup();
    render(<HeaderMobileCollapse items={flatItems} currentPath="/about/" />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about/");
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact/");
  });

  it("renders nested children as links under a non-link parent label", async () => {
    const user = userEvent.setup();
    render(<HeaderMobileCollapse items={nestedItems} currentPath="/about/" />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.queryByRole("link", { name: "Resources" })).toBeNull();
    expect(screen.getByText("Resources")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Section A" })).toHaveAttribute(
      "href",
      "/resources/#section-a",
    );
  });
});
