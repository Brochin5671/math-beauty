import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Testimonial, testimonialVariants } from "./Testimonial";

describe("testimonialVariants", () => {
  for (const axis of variantAxes(testimonialVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(testimonialVariants, axis));
  }
});

describe("Testimonial", () => {
  it("renders a <blockquote> with data-slot", () => {
    const { container } = render(<Testimonial>quote</Testimonial>);
    const bq = container.querySelector("blockquote");
    expect(bq).toHaveAttribute("data-slot", "testimonial");
  });

  it("renders children", () => {
    const { getByText } = render(<Testimonial>The team was amazing</Testimonial>);
    expect(getByText("The team was amazing")).toBeInTheDocument();
  });

  it("renders the decorative opening quote mark", () => {
    const { container } = render(<Testimonial>quote</Testimonial>);
    const decor = container.querySelector('[aria-hidden="true"]');
    expect(decor).toBeInTheDocument();
    expect(decor?.textContent).toBe("“");
  });

  it("includes container query scope class", () => {
    const { container } = render(<Testimonial>quote</Testimonial>);
    expect(container.querySelector("blockquote")?.className).toContain("@container/testimonial");
  });

  it("merges className", () => {
    const { container } = render(<Testimonial className="custom-class">quote</Testimonial>);
    expect(container.querySelector("blockquote")?.className).toContain("custom-class");
  });

  it("applies the default padding tier and accepts an override", () => {
    const { container, rerender } = render(<Testimonial>quote</Testimonial>);
    expect(container.querySelector("blockquote")?.className).toContain("p-6");
    rerender(<Testimonial padding="spacious">quote</Testimonial>);
    const bq = container.querySelector("blockquote");
    expect(bq?.className).toContain("p-8");
    expect(bq?.className).not.toContain("p-6");
  });
});
