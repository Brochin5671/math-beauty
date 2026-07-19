import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Article, articleVariants } from "./Article";

describe("articleVariants", () => {
  for (const axis of variantAxes(articleVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(articleVariants, axis));
  }
});

describe("Article", () => {
  it("renders as an <article> with data-slot=article", () => {
    const { container } = render(
      <Article>
        <p>body</p>
      </Article>,
    );
    const article = container.querySelector("article");
    expect(article).not.toBeNull();
    expect(article).toHaveAttribute("data-slot", "article");
  });

  it("merges consumer className", () => {
    const { container } = render(
      <Article className="custom-x">
        <p>x</p>
      </Article>,
    );
    expect(container.querySelector("article")).toHaveClass("custom-x");
  });
});
