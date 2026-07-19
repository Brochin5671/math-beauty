import { render, screen } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Progress, progressVariants } from "./Progress";

describe("progressVariants", () => {
  for (const axis of variantAxes(progressVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(progressVariants, axis));
  }
});

describe("Progress", () => {
  it("renders a progressbar exposing the value via aria-valuenow", () => {
    render(<Progress value={70} aria-label="Upload" />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("data-slot", "progress");
    expect(bar).toHaveAttribute("aria-valuenow", "70");
  });

  it("reflects tone, size, shape, and surface via data attributes", () => {
    render(
      <Progress
        value={30}
        aria-label="Upload"
        tone="warning"
        size="sm"
        shape="square"
        surface="none"
      />,
    );
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("data-tone", "warning");
    expect(bar).toHaveAttribute("data-size", "sm");
    expect(bar).toHaveAttribute("data-shape", "square");
    expect(bar).toHaveAttribute("data-surface", "none");
  });
});
