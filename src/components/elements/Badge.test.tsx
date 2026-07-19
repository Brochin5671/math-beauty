import { render, screen } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Badge, badgeVariants } from "./Badge";

describe("badgeVariants", () => {
  for (const axis of variantAxes(badgeVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(badgeVariants, axis));
  }
});

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies variant via the data-variant attribute", () => {
    render(<Badge variant="outline">Tag</Badge>);
    expect(screen.getByText("Tag")).toHaveAttribute("data-variant", "outline");
  });

  it("renders a custom element via the render prop", () => {
    render(<Badge render={<a href="/tags">Link Badge</a>} />);
    const link = screen.getByRole("link", { name: "Link Badge" });
    expect(link.tagName).toBe("A");
  });
});
