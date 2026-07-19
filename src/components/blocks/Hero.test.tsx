import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Hero, heroVariants } from "./Hero";

describe("heroVariants", () => {
  for (const axis of variantAxes(heroVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(heroVariants, axis));
  }
});

describe("Hero", () => {
  it("renders a <section> with data-slot", () => {
    const { container } = render(<Hero>content</Hero>);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-slot", "hero");
  });

  it("merges className with variant classes", () => {
    const { container } = render(<Hero className="custom-class">content</Hero>);
    expect(container.querySelector("section")?.className).toContain("custom-class");
  });

  it("renders the visual slot in a split grid when provided", () => {
    const { getByTestId } = render(
      <Hero visual={<div data-testid="visual">visual</div>}>content</Hero>,
    );
    expect(getByTestId("visual")).toBeInTheDocument();
  });

  it("renders the background slot when provided", () => {
    const { getByTestId } = render(
      <Hero background={<div data-testid="bg">bg</div>}>content</Hero>,
    );
    expect(getByTestId("bg")).toBeInTheDocument();
  });

  it("drives clamped height from the --hero-* tokens so it re-tokenizes", () => {
    const { container, rerender } = render(<Hero>content</Hero>);
    expect(container.querySelector("section")?.className).toContain("var(--hero-min-height");
    rerender(<Hero size="fullscreen">content</Hero>);
    expect(container.querySelector("section")?.className).toContain("var(--hero-height-full");
  });
});
