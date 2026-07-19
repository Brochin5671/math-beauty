import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Stack, stackVariants } from "./Stack";

// Real computed flex-direction and responsive reflow are covered in
// Stack.browser.test.tsx. The CVA style axes (gap/align/justify/wrap) are
// checked via the factory matrix; the direction tests below cover the
// resolveDirection branching logic.
describe("stackVariants", () => {
  for (const axis of variantAxes(stackVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(stackVariants, axis));
  }
});

describe("Stack", () => {
  it("renders a div with data-slot=stack", () => {
    const { getByText } = render(<Stack>body</Stack>);
    const node = getByText("body");
    expect(node).toHaveAttribute("data-slot", "stack");
    expect(node.tagName).toBe("DIV");
  });

  it("defaults to vertical direction (flex-col + flex)", () => {
    const { getByText } = render(<Stack>x</Stack>);
    const node = getByText("x");
    expect(node).toHaveClass("flex");
    expect(node).toHaveClass("flex-col");
  });

  it("applies horizontal direction", () => {
    const { getByText } = render(<Stack direction="horizontal">x</Stack>);
    expect(getByText("x")).toHaveClass("flex-row");
  });

  it("resolves a responsive direction object to per-breakpoint classes", () => {
    const { getByText } = render(
      <Stack direction={{ base: "vertical", md: "horizontal" }}>x</Stack>,
    );
    const node = getByText("x");
    expect(node).toHaveClass("flex-col");
    expect(node).toHaveClass("md:flex-row");
    expect(node).not.toHaveClass("flex-row");
    expect(node).not.toHaveClass("md:flex-col");
  });

  it("falls back to vertical at base when a responsive object omits it", () => {
    const { getByText } = render(<Stack direction={{ md: "horizontal" }}>x</Stack>);
    const node = getByText("x");
    expect(node).toHaveClass("flex-col");
    expect(node).toHaveClass("md:flex-row");
  });

  it("merges consumer className", () => {
    const { getByText } = render(<Stack className="custom-x">x</Stack>);
    expect(getByText("x")).toHaveClass("custom-x");
  });
});
