import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stats } from "./Stats";

describe("Stats", () => {
  it("renders with data-slot", () => {
    const { container } = render(<Stats>stats</Stats>);
    expect(container.querySelector('[data-slot="stats"]')).toBeInTheDocument();
  });

  it("applies columns=4 by default", () => {
    const { container } = render(<Stats>stats</Stats>);
    expect(container.querySelector('[data-slot="stats"]')?.className).toContain("md:grid-cols-4");
  });

  it("applies columns=3 variant", () => {
    const { container } = render(<Stats columns={3}>stats</Stats>);
    expect(container.querySelector('[data-slot="stats"]')?.className).toContain("md:grid-cols-3");
  });

  it("merges className", () => {
    const { container } = render(<Stats className="custom-class">stats</Stats>);
    expect(container.querySelector('[data-slot="stats"]')?.className).toContain("custom-class");
  });
});
