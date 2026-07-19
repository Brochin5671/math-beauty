import { render, screen } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import type { SVGProps } from "react";
import { describe, expect, it } from "vitest";
import { Spinner, spinnerVariants } from "./Spinner";

describe("spinnerVariants", () => {
  for (const axis of variantAxes(spinnerVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(spinnerVariants, axis));
  }
});

describe("Spinner", () => {
  it("renders an accessible status with the loading label and default icon", () => {
    render(<Spinner />);
    const spinner = screen.getByRole("status", { name: "Loading" });
    expect(spinner).toHaveAttribute("data-slot", "spinner");
    expect(spinner).toHaveAttribute("data-icon", "circle");
    expect(spinner).toHaveAttribute("data-size", "default");
  });

  it("selects the bars icon via the icon prop", () => {
    render(<Spinner icon="bars" />);
    expect(screen.getByRole("status", { name: "Loading" })).toHaveAttribute("data-icon", "bars");
  });

  it("marks a custom icon component via data-icon=custom", () => {
    const Custom = (props: SVGProps<SVGSVGElement>) => <svg {...props} />;
    render(<Spinner icon={Custom} />);
    expect(screen.getByRole("status", { name: "Loading" })).toHaveAttribute("data-icon", "custom");
  });

  it("reflects the size prop via data-size", () => {
    render(<Spinner size="xl" />);
    expect(screen.getByRole("status", { name: "Loading" })).toHaveAttribute("data-size", "xl");
  });
});
