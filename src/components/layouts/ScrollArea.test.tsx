import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { ScrollArea, scrollBarVariants } from "./ScrollArea";

// Real overflow and scrolling are covered in ScrollArea.browser.test.tsx; these
// cover the markup structure and the scrollbar visibility axis.
describe("scrollBarVariants", () => {
  for (const axis of variantAxes(scrollBarVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(scrollBarVariants, axis));
  }
});

describe("ScrollArea", () => {
  it("nests children inside the content wrapper inside the viewport", () => {
    const { getByText } = render(<ScrollArea>body</ScrollArea>);
    const content = getByText("body").closest('[data-slot="scroll-area-content"]');
    expect(content).not.toBeNull();
    expect(content?.closest('[data-slot="scroll-area-viewport"]')).not.toBeNull();
    expect(content?.closest('[data-slot="scroll-area"]')).not.toBeNull();
  });

  it("merges consumer className on the root", () => {
    const { getByText } = render(<ScrollArea className="custom-x">body</ScrollArea>);
    expect(getByText("body").closest('[data-slot="scroll-area"]')).toHaveClass("custom-x");
  });
});
