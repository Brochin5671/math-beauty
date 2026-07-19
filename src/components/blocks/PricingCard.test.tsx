import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PricingCard } from "./PricingCard";

describe("PricingCard", () => {
  it("renders with data-slot", () => {
    const { container } = render(<PricingCard>tier</PricingCard>);
    expect(container.querySelector('[data-slot="pricing-card"]')).toBeInTheDocument();
  });

  it("renders children", () => {
    const { getByText } = render(<PricingCard>Pro tier</PricingCard>);
    expect(getByText("Pro tier")).toBeInTheDocument();
  });

  it("marks the featured tier with data-featured", () => {
    const { container } = render(<PricingCard featured>tier</PricingCard>);
    expect(container.querySelector('[data-slot="pricing-card"]')).toHaveAttribute(
      "data-featured",
      "true",
    );
  });

  it("omits data-featured when not featured", () => {
    const { container } = render(<PricingCard>tier</PricingCard>);
    expect(container.querySelector('[data-slot="pricing-card"]')).not.toHaveAttribute(
      "data-featured",
    );
  });

  it("includes container query scope class", () => {
    const { container } = render(<PricingCard>tier</PricingCard>);
    expect(container.querySelector('[data-slot="pricing-card"]')?.className).toContain(
      "@container/pricing-card",
    );
  });

  it("merges className", () => {
    const { container } = render(<PricingCard className="custom-class">tier</PricingCard>);
    expect(container.querySelector('[data-slot="pricing-card"]')?.className).toContain(
      "custom-class",
    );
  });
});
