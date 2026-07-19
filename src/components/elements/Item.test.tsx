import { render, screen } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Item, ItemContent, ItemGroup, ItemTitle, itemVariants } from "./Item";

// itemMediaVariants is not exported, so ItemMedia's variant is left to its
// observable data attributes rather than a CVA-matrix block.
describe("itemVariants", () => {
  for (const axis of variantAxes(itemVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(itemVariants, axis));
  }
});

describe("Item", () => {
  it("renders a non-interactive item with its content slots", () => {
    render(
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>Inbox</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>,
    );
    expect(screen.getByText("Inbox")).toHaveAttribute("data-slot", "item-title");
  });

  it("renders as a link when href is set", () => {
    render(
      <ItemGroup>
        <Item href="/inbox">
          <ItemContent>
            <ItemTitle>Inbox</ItemTitle>
          </ItemContent>
        </Item>
      </ItemGroup>,
    );
    expect(screen.getByRole("link", { name: /Inbox/ })).toHaveAttribute("href", "/inbox");
  });

  it("reflects variant and size via data attributes", () => {
    const { container } = render(
      <Item variant="outline" size="sm">
        <ItemContent>x</ItemContent>
      </Item>,
    );
    const item = container.querySelector('[data-slot="item"]');
    expect(item).toHaveAttribute("data-variant", "outline");
    expect(item).toHaveAttribute("data-size", "sm");
  });
});
