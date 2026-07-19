import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Link } from "./Link";

describe("Link", () => {
  it("renders an anchor with href", () => {
    render(<Link href="/about">About</Link>);
    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "/about");
  });

  it("passes variant to underlying Button", () => {
    render(
      <Link href="/" variant="outline">
        Home
      </Link>,
    );
    // The wrapping element (rendered by Button via Slot) should carry the variant
    const link = screen.getByRole("link", { name: "Home" });
    expect(link).toHaveAttribute("data-variant", "outline");
  });

  it("renders children inside the anchor", () => {
    render(<Link href="/contact">Get in touch</Link>);
    expect(screen.getByText("Get in touch")).toBeInTheDocument();
  });
});
