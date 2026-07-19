import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { BentoCell, BentoGrid, bentoCellVariants } from "./BentoGrid";

describe("bentoCellVariants", () => {
  for (const axis of variantAxes(bentoCellVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(bentoCellVariants, axis));
  }
});

describe("BentoGrid", () => {
  it("renders with data-slot", () => {
    const { container } = render(<BentoGrid>cells</BentoGrid>);
    expect(container.querySelector('[data-slot="bento-grid"]')).toBeInTheDocument();
  });

  it("applies cols variant", () => {
    const { container } = render(<BentoGrid cols={4}>cells</BentoGrid>);
    expect(container.querySelector('[data-slot="bento-grid"]')?.className).toContain(
      "md:grid-cols-4",
    );
  });

  it("applies gap variant", () => {
    const { container } = render(<BentoGrid gap="lg">cells</BentoGrid>);
    expect(container.querySelector('[data-slot="bento-grid"]')?.className).toContain("gap-6");
  });

  it("merges className", () => {
    const { container } = render(<BentoGrid className="custom-class">cells</BentoGrid>);
    expect(container.querySelector('[data-slot="bento-grid"]')?.className).toContain(
      "custom-class",
    );
  });
});

describe("BentoCell", () => {
  it("renders with data-slot", () => {
    const { container } = render(<BentoCell>content</BentoCell>);
    expect(container.querySelector('[data-slot="bento-cell"]')).toBeInTheDocument();
  });

  it("includes container query scope class", () => {
    const { container } = render(<BentoCell>content</BentoCell>);
    expect(container.querySelector('[data-slot="bento-cell"]')?.className).toContain(
      "@container/bento-cell",
    );
  });

  it("merges className", () => {
    const { container } = render(<BentoCell className="custom-class">content</BentoCell>);
    expect(container.querySelector('[data-slot="bento-cell"]')?.className).toContain(
      "custom-class",
    );
  });
});
