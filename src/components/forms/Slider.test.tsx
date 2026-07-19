import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Slider, sliderVariants } from "./Slider";

// Base UI keeps slider thumbs visibility:hidden until it measures the track,
// which needs layout happy-dom lacks; the value/keyboard/aria behavior lives in
// Slider.browser.test.tsx. Here we cover the CVA axes and our thumb-per-value
// rendering, which need no layout.

function thumbs(container: HTMLElement) {
  return container.querySelectorAll('[data-slot="slider-thumb"]');
}

describe("sliderVariants", () => {
  for (const axis of variantAxes(sliderVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(sliderVariants, axis));
  }
});

describe("Slider", () => {
  it("renders the slider root with data-slot", () => {
    const { container } = render(<Slider defaultValue={[40]} thumbLabels={["Volume"]} />);
    expect(container.querySelector('[data-slot="slider"]')).not.toBeNull();
  });

  it("renders one thumb per value", () => {
    const { container: single } = render(<Slider defaultValue={[40]} thumbLabels={["Volume"]} />);
    expect(thumbs(single)).toHaveLength(1);
    const { container: range } = render(
      <Slider defaultValue={[20, 60]} thumbLabels={["Min", "Max"]} />,
    );
    expect(thumbs(range)).toHaveLength(2);
  });

  it("renders the value readout only when showValue is set", () => {
    const { container: without } = render(<Slider defaultValue={[40]} thumbLabels={["Volume"]} />);
    expect(without.querySelector('[data-slot="slider-value"]')).toBeNull();
    const { container: withValue } = render(
      <Slider defaultValue={[40]} thumbLabels={["Volume"]} showValue />,
    );
    expect(withValue.querySelector('[data-slot="slider-value"]')).not.toBeNull();
  });
});
