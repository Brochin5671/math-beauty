import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Newsletter, newsletterFormVariants } from "./Newsletter";

describe("newsletterFormVariants", () => {
  for (const axis of variantAxes(newsletterFormVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(newsletterFormVariants, axis));
  }
});

describe("Newsletter", () => {
  it("renders with data-slot", () => {
    const { container } = render(<Newsletter>headline</Newsletter>);
    expect(container.querySelector('[data-slot="newsletter"]')).toBeInTheDocument();
  });

  it("renders a native form with data-slot", () => {
    const { container } = render(<Newsletter>headline</Newsletter>);
    const form = container.querySelector('form[data-slot="newsletter-form"]');
    expect(form).toBeInTheDocument();
    expect(form?.getAttribute("method")).toBe("post");
  });

  it("renders email input with required + autocomplete + custom name", () => {
    const { container } = render(<Newsletter inputName="user_email">headline</Newsletter>);
    const input = container.querySelector('input[type="email"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("name", "user_email");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("autocomplete", "email");
  });

  it("uses custom cta label", () => {
    const { getByText } = render(<Newsletter cta="Join us">headline</Newsletter>);
    expect(getByText("Join us")).toBeInTheDocument();
  });

  it("renders fine-print slot when provided", () => {
    const { getByTestId } = render(
      <Newsletter finePrint={<span data-testid="fine">No spam</span>}>headline</Newsletter>,
    );
    expect(getByTestId("fine")).toBeInTheDocument();
  });

  it("forwards action attribute to the form", () => {
    const { container } = render(<Newsletter action="/api/subscribe">headline</Newsletter>);
    expect(container.querySelector('[data-slot="newsletter-form"]')).toHaveAttribute(
      "action",
      "/api/subscribe",
    );
  });

  it("applies the default width tier and accepts an override", () => {
    const { container, rerender } = render(<Newsletter>headline</Newsletter>);
    expect(container.querySelector('[data-slot="newsletter-form"]')?.className).toContain(
      "max-w-md",
    );
    rerender(<Newsletter width="wide">headline</Newsletter>);
    const form = container.querySelector('[data-slot="newsletter-form"]');
    expect(form?.className).toContain("max-w-lg");
    expect(form?.className).not.toContain("max-w-md");
  });
});
