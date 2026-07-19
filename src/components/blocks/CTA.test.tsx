import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CTA } from "./CTA";

describe("CTA", () => {
  it("renders with data-slot", () => {
    const { container } = render(<CTA>content</CTA>);
    expect(container.querySelector('[data-slot="cta-section"]')).toBeInTheDocument();
  });

  it("renders children", () => {
    const { getByText } = render(<CTA>Call to action copy</CTA>);
    expect(getByText("Call to action copy")).toBeInTheDocument();
  });

  it("applies narrow container size", () => {
    const { container } = render(<CTA>content</CTA>);
    expect(container.querySelector('[data-slot="cta-section"]')).toHaveAttribute(
      "data-size",
      "narrow",
    );
  });

  it("applies text-center", () => {
    const { container } = render(<CTA>content</CTA>);
    expect(container.querySelector('[data-slot="cta-section"]')?.className).toContain(
      "text-center",
    );
  });

  it("merges className", () => {
    const { container } = render(<CTA className="custom-class">content</CTA>);
    expect(container.querySelector('[data-slot="cta-section"]')?.className).toContain(
      "custom-class",
    );
  });
});
