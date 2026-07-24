import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  emptyVariants,
} from "./Empty";

// emptyMediaVariants is not exported, so EmptyMedia's variant is covered through
// its observable data-variant attribute below rather than a CVA-matrix block
describe("emptyVariants", () => {
  for (const axis of variantAxes(emptyVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(emptyVariants, axis));
  }
});

describe("Empty", () => {
  it("renders the compound shape with correct data-slot attributes", () => {
    const { container, getByText } = render(
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">icon</EmptyMedia>
          <EmptyTitle>Nothing here</EmptyTitle>
          <EmptyDescription>Try a different filter.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>action</EmptyContent>
      </Empty>,
    );
    expect(container.querySelector('[data-slot="empty"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="empty-header"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="empty-icon"]')).not.toBeNull();
    expect(getByText("Nothing here")).toHaveAttribute("data-slot", "empty-title");
    expect(getByText("Try a different filter.")).toHaveAttribute("data-slot", "empty-description");
    expect(getByText("action")).toHaveAttribute("data-slot", "empty-content");
  });

  it("reflects the Empty variant via data-variant", () => {
    const { container } = render(<Empty variant="filled">x</Empty>);
    expect(container.querySelector('[data-slot="empty"]')).toHaveAttribute(
      "data-variant",
      "filled",
    );
  });

  it("EmptyMedia reflects its variant via data-variant", () => {
    const { container } = render(<EmptyMedia variant="icon">x</EmptyMedia>);
    expect(container.querySelector('[data-slot="empty-icon"]')).toHaveAttribute(
      "data-variant",
      "icon",
    );
  });

  it("merges consumer className", () => {
    const { container } = render(<Empty className="custom-x">x</Empty>);
    expect(container.querySelector('[data-slot="empty"]')).toHaveClass("custom-x");
  });
});
