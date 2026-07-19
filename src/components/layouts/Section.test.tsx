import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Section, sectionVariants } from "./Section";

describe("sectionVariants", () => {
  for (const axis of variantAxes(sectionVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(sectionVariants, axis));
  }
});

describe("Section", () => {
  it("renders a <section> with data-slot=section", () => {
    const { container } = render(
      <Section>
        <p>body</p>
      </Section>,
    );
    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("data-slot", "section");
  });

  it("wraps content in an inner Container at the default size", () => {
    const { container } = render(
      <Section>
        <p>body</p>
      </Section>,
    );
    expect(container.querySelector('[data-slot="container"]')).toHaveAttribute(
      "data-size",
      "default",
    );
  });

  it("forwards containerSize to the inner Container", () => {
    const { container } = render(
      <Section containerSize="narrow">
        <p>body</p>
      </Section>,
    );
    expect(container.querySelector('[data-slot="container"]')).toHaveAttribute(
      "data-size",
      "narrow",
    );
  });

  it("forwards aria-label to the <section>", () => {
    const { container } = render(
      <Section aria-label="Features">
        <p>body</p>
      </Section>,
    );
    expect(container.querySelector("section")).toHaveAttribute("aria-label", "Features");
  });
});
