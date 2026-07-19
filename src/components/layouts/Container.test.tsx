import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Container, containerVariants } from "./Container";

describe("containerVariants", () => {
  for (const axis of variantAxes(containerVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(containerVariants, axis));
  }
});

describe("Container", () => {
  it("renders children inside a div with data-slot=container", () => {
    const { getByText } = render(<Container>hello</Container>);
    const node = getByText("hello");
    expect(node).toHaveAttribute("data-slot", "container");
    expect(node.tagName).toBe("DIV");
  });

  it("defaults to the default size", () => {
    const { getByText } = render(<Container>x</Container>);
    expect(getByText("x")).toHaveAttribute("data-size", "default");
  });

  it("reflects the size prop via data-size", () => {
    const { getByText } = render(<Container size="narrow">x</Container>);
    expect(getByText("x")).toHaveAttribute("data-size", "narrow");
  });

  it("merges consumer className", () => {
    const { getByText } = render(<Container className="custom-x">x</Container>);
    expect(getByText("x")).toHaveClass("custom-x");
  });
});
