import { render, screen } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import {
  Footer,
  FooterColumnTitle,
  FooterCopyright,
  FooterLegalLinks,
  FooterSocial,
  FooterSocialLink,
  footerVariants,
} from "./Footer";

describe("footerVariants", () => {
  for (const axis of variantAxes(footerVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(footerVariants, axis));
  }
});

describe("Footer", () => {
  it("renders the contentinfo landmark with background and density data attributes", () => {
    render(
      <Footer background="muted" density="spacious">
        content
      </Footer>,
    );
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveAttribute("data-slot", "footer");
    expect(footer).toHaveAttribute("data-background", "muted");
    expect(footer).toHaveAttribute("data-density", "spacious");
  });

  it("FooterCopyright renders the year inside a time element", () => {
    render(<FooterCopyright year={2024}>Acme</FooterCopyright>);
    const time = screen.getByText("2024");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("datetime", "2024");
  });

  it("FooterColumnTitle honors the as prop for the heading level", () => {
    render(<FooterColumnTitle as="h3">Product</FooterColumnTitle>);
    expect(screen.getByRole("heading", { name: "Product", level: 3 })).toBeInTheDocument();
  });

  it("FooterLegalLinks renders a labelled nav of links", () => {
    render(<FooterLegalLinks links={[{ label: "Privacy", href: "/privacy" }]} />);
    expect(screen.getByRole("navigation", { name: "Legal" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
  });

  it("FooterSocialLink uses its label as the accessible name", () => {
    render(
      <FooterSocial>
        <FooterSocialLink href="#x" label="Twitter">
          icon
        </FooterSocialLink>
      </FooterSocial>,
    );
    expect(screen.getByRole("navigation", { name: "Social media" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Twitter" })).toHaveAttribute("href", "#x");
  });
});
