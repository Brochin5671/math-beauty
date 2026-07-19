import { render, screen } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Meter, meterVariants } from "./Meter";

describe("meterVariants", () => {
  for (const axis of variantAxes(meterVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(meterVariants, axis));
  }
});

describe("Meter", () => {
  it("renders a meter exposing the value via aria-valuenow", () => {
    render(<Meter value={60} aria-label="Disk usage" />);
    const meter = screen.getByRole("meter", { name: "Disk usage" });
    expect(meter).toHaveAttribute("data-slot", "meter");
    expect(meter).toHaveAttribute("aria-valuenow", "60");
  });

  it("reflects tone, size, shape, and surface via data attributes", () => {
    render(
      <Meter
        value={40}
        aria-label="Disk"
        tone="danger"
        size="lg"
        shape="square"
        surface="outline"
      />,
    );
    const meter = screen.getByRole("meter", { name: "Disk" });
    expect(meter).toHaveAttribute("data-tone", "danger");
    expect(meter).toHaveAttribute("data-size", "lg");
    expect(meter).toHaveAttribute("data-shape", "square");
    expect(meter).toHaveAttribute("data-surface", "outline");
  });
});
