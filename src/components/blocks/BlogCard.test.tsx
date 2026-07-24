import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlogCard } from "./BlogCard";

describe("BlogCard", () => {
  it("renders with data-slot", () => {
    const { container } = render(<BlogCard>excerpt</BlogCard>);
    expect(container.querySelector('[data-slot="blog-card"]')).toBeInTheDocument();
  });

  it("renders children inside the content wrapper", () => {
    const { getByText } = render(<BlogCard>Excerpt text</BlogCard>);
    expect(getByText("Excerpt text")).toBeInTheDocument();
  });

  it("renders the image slot when provided", () => {
    const { getByTestId } = render(
      <BlogCard image={<div data-testid="image">img</div>}>excerpt</BlogCard>,
    );
    expect(getByTestId("image")).toBeInTheDocument();
  });

  it("omits the image wrapper when image is not provided", () => {
    const { container } = render(<BlogCard>excerpt</BlogCard>);
    // With no image, the first child is the padded content, not an image wrapper
    const first = container.querySelector('[data-slot="blog-card"] > *:first-child');
    expect(first).toHaveAttribute("data-slot", "card-content");
  });

  it("includes container query scope class", () => {
    const { container } = render(<BlogCard>excerpt</BlogCard>);
    expect(container.querySelector('[data-slot="blog-card"]')?.className).toContain(
      "@container/blog-card",
    );
  });

  it("merges className", () => {
    const { container } = render(<BlogCard className="custom-class">excerpt</BlogCard>);
    expect(container.querySelector('[data-slot="blog-card"]')?.className).toContain("custom-class");
  });

  it("applies the default content padding tier and accepts an override", () => {
    const { container, rerender } = render(<BlogCard>excerpt</BlogCard>);
    expect(container.querySelector('[data-slot="card-content"]')?.className).toContain("py-6");
    rerender(<BlogCard padding="compact">excerpt</BlogCard>);
    const content = container.querySelector('[data-slot="card-content"]');
    expect(content?.className).toContain("py-4");
    expect(content?.className).not.toContain("py-6");
  });

  it("wraps the card in an anchor when href is set", () => {
    const { container } = render(<BlogCard href="/blog/post">excerpt</BlogCard>);
    const link = container.querySelector("a");
    expect(link).toHaveAttribute("href", "/blog/post");
    expect(link?.querySelector('[data-slot="blog-card"]')).toBeInTheDocument();
  });

  it("renders no anchor when href is omitted", () => {
    const { container } = render(<BlogCard>excerpt</BlogCard>);
    expect(container.querySelector("a")).not.toBeInTheDocument();
  });
});
