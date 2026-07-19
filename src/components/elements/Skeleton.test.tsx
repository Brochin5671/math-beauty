import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders a placeholder with data-slot", () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('[data-slot="skeleton"]')).not.toBeNull();
  });

  it("merges a consumer className", () => {
    const { container } = render(<Skeleton className="custom-x" />);
    expect(container.querySelector('[data-slot="skeleton"]')).toHaveClass("custom-x");
  });
});
