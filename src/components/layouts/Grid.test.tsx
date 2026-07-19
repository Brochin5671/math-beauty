import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Grid, GridItem, gridVariants } from "./Grid";

// Real rendered layout (resolved grid tracks, responsive reflow at breakpoints,
// auto-fit track counts) is covered in Grid.browser.test.tsx. These happy-dom
// tests cover the resolveCols branching logic and structural wiring, not the
// emitted class strings as a stand-in for the layout they produce. The CVA
// style axes (gap/flow/align/justify) are checked via the factory matrix.
describe("gridVariants", () => {
  for (const axis of variantAxes(gridVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(gridVariants, axis));
  }
});

describe("Grid", () => {
  it("renders a div with data-slot=grid", () => {
    const { getByText } = render(<Grid>body</Grid>);
    const node = getByText("body");
    expect(node).toHaveAttribute("data-slot", "grid");
    expect(node.tagName).toBe("DIV");
  });

  it("treats a plain number as fixed tracks at every width", () => {
    const { getByText } = render(<Grid cols={4}>x</Grid>);
    const node = getByText("x");
    expect(node).toHaveClass("grid-cols-4");
    expect(node.className).not.toMatch(/(sm|md|lg|xl):grid-cols/);
  });

  it("expands a responsive object into per-breakpoint classes", () => {
    const { getByText } = render(<Grid cols={{ base: 1, md: 2, lg: 3 }}>x</Grid>);
    const node = getByText("x");
    expect(node).toHaveClass("grid-cols-1");
    expect(node).toHaveClass("md:grid-cols-2");
    expect(node).toHaveClass("lg:grid-cols-3");
    expect(node).not.toHaveClass("sm:grid-cols-2");
    expect(node).not.toHaveClass("xl:grid-cols-3");
  });

  it("emits only the breakpoints present in a partial object", () => {
    const { getByText } = render(<Grid cols={{ md: 2 }}>x</Grid>);
    const node = getByText("x");
    expect(node).toHaveClass("md:grid-cols-2");
    expect(node).not.toHaveClass("grid-cols-2");
    expect(node).not.toHaveClass("grid-cols-3");
  });

  it("clamps out-of-range column counts to 12", () => {
    const { getByText } = render(<Grid cols={20}>x</Grid>);
    expect(getByText("x")).toHaveClass("grid-cols-12");
  });

  it("uses container-query variants and a wrapper when container is set", () => {
    const { getByText } = render(
      <Grid cols={{ base: 1, md: 3 }} container>
        x
      </Grid>,
    );
    const node = getByText("x");
    expect(node).toHaveClass("grid-cols-1");
    expect(node).toHaveClass("@md:grid-cols-3");
    expect(node).not.toHaveClass("md:grid-cols-3");
    expect(node.parentElement).toHaveClass("@container");
    expect(node.parentElement).toHaveAttribute("data-slot", "grid-container");
  });

  it("renders no wrapper when container is false", () => {
    const { getByText } = render(<Grid cols={2}>x</Grid>);
    expect(getByText("x").parentElement).not.toHaveClass("@container");
  });

  it("honors the fill mode for intrinsic columns", () => {
    const { getByText } = render(
      <Grid minColWidth="10rem" fill="auto-fill">
        x
      </Grid>,
    );
    expect(getByText("x").style.gridTemplateColumns).toBe("repeat(auto-fill, minmax(10rem, 1fr))");
  });

  it("lets minColWidth override cols and skips the container wrapper", () => {
    const { getByText } = render(
      <Grid cols={4} minColWidth="12rem" container>
        x
      </Grid>,
    );
    const node = getByText("x");
    expect(node.style.gridTemplateColumns).toBe("repeat(auto-fit, minmax(12rem, 1fr))");
    expect(node).not.toHaveClass("grid-cols-4");
    expect(node.parentElement).not.toHaveClass("@container");
  });

  it("merges consumer className", () => {
    const { getByText } = render(<Grid className="custom-x">x</Grid>);
    expect(getByText("x")).toHaveClass("custom-x");
  });
});

describe("GridItem", () => {
  it("renders a div with data-slot=grid-item", () => {
    const { getByText } = render(<GridItem>body</GridItem>);
    const node = getByText("body");
    expect(node).toHaveAttribute("data-slot", "grid-item");
    expect(node.tagName).toBe("DIV");
  });

  it("applies a fixed column span", () => {
    const { getByText } = render(<GridItem span={3}>x</GridItem>);
    expect(getByText("x")).toHaveClass("col-span-3");
  });

  it("expands a responsive span and supports full", () => {
    const { getByText } = render(<GridItem span={{ base: "full", md: 6 }}>x</GridItem>);
    const node = getByText("x");
    expect(node).toHaveClass("col-span-full");
    expect(node).toHaveClass("md:col-span-6");
  });

  it("applies a row span", () => {
    const { getByText } = render(<GridItem rowSpan={2}>x</GridItem>);
    expect(getByText("x")).toHaveClass("row-span-2");
  });

  it("uses container-query variants for span", () => {
    const { getByText } = render(
      <GridItem span={{ md: 4 }} container>
        x
      </GridItem>,
    );
    const node = getByText("x");
    expect(node).toHaveClass("@md:col-span-4");
    expect(node).not.toHaveClass("md:col-span-4");
  });

  it("emits no placement classes when no props are set", () => {
    const { getByText } = render(<GridItem>x</GridItem>);
    expect(getByText("x").className).not.toMatch(/col-span|row-span/);
  });

  it("merges consumer className", () => {
    const { getByText } = render(<GridItem className="custom-x">x</GridItem>);
    expect(getByText("x")).toHaveClass("custom-x");
  });
});
