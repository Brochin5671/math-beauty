import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LogoCloud } from "./LogoCloud";

describe("LogoCloud", () => {
  it("renders with data-slot", () => {
    const { container } = render(<LogoCloud>logos</LogoCloud>);
    expect(container.querySelector('[data-slot="logo-cloud"]')).toBeInTheDocument();
  });

  it("applies default size and gap", () => {
    const { container } = render(<LogoCloud>logos</LogoCloud>);
    const el = container.querySelector('[data-slot="logo-cloud"]');
    // Composes Grid: gap is a class, the auto-fit min width is inline style
    expect(el?.className).toContain("gap-8");
    expect(el?.getAttribute("style")).toContain("minmax(120px");
  });

  it("applies sm size variant", () => {
    const { container } = render(<LogoCloud size="sm">logos</LogoCloud>);
    expect(container.querySelector('[data-slot="logo-cloud"]')?.getAttribute("style")).toContain(
      "minmax(80px",
    );
  });

  it("applies lg gap variant", () => {
    const { container } = render(<LogoCloud gap="lg">logos</LogoCloud>);
    expect(container.querySelector('[data-slot="logo-cloud"]')?.className).toContain("gap-12");
  });

  it("merges className", () => {
    const { container } = render(<LogoCloud className="custom-class">logos</LogoCloud>);
    expect(container.querySelector('[data-slot="logo-cloud"]')?.className).toContain(
      "custom-class",
    );
  });
});
