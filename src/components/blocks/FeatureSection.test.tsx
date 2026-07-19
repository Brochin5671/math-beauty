import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeatureSection } from "./FeatureSection";

describe("FeatureSection", () => {
  it("renders with data-slot", () => {
    const { container } = render(<FeatureSection>content</FeatureSection>);
    expect(container.querySelector('[data-slot="feature-section"]')).toBeInTheDocument();
  });

  it("renders children in the content column", () => {
    const { getByText } = render(<FeatureSection>Hello feature</FeatureSection>);
    expect(getByText("Hello feature")).toBeInTheDocument();
  });

  it("renders the visual slot when provided", () => {
    const { getByTestId } = render(
      <FeatureSection visual={<div data-testid="visual">visual</div>}>content</FeatureSection>,
    );
    expect(getByTestId("visual")).toBeInTheDocument();
  });

  it("applies reverse order classes when reverse is set", () => {
    const { container } = render(<FeatureSection reverse>content</FeatureSection>);
    const grid = container.querySelector('[data-slot="feature-section"] > div > div');
    expect(grid?.className).toContain("[&>:first-child]:order-2");
  });

  it("merges className", () => {
    const { container } = render(<FeatureSection className="custom-class">content</FeatureSection>);
    expect(container.querySelector('[data-slot="feature-section"]')?.className).toContain(
      "custom-class",
    );
  });

  it("applies the default padding tier and accepts an override", () => {
    const { container, rerender } = render(<FeatureSection>content</FeatureSection>);
    expect(container.querySelector('[data-slot="feature-section"]')?.className).toContain(
      "lg:py-32",
    );
    rerender(<FeatureSection padding="compact">content</FeatureSection>);
    const node = container.querySelector('[data-slot="feature-section"]');
    expect(node?.className).toContain("py-12");
    expect(node?.className).not.toContain("lg:py-32");
  });
});
