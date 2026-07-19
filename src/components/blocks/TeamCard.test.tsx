import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamCard } from "./TeamCard";

describe("TeamCard", () => {
  it("renders with data-slot", () => {
    const { container } = render(<TeamCard>member</TeamCard>);
    expect(container.querySelector('[data-slot="team-card"]')).toBeInTheDocument();
  });

  it("renders children", () => {
    const { getByText } = render(<TeamCard>Jane Doe</TeamCard>);
    expect(getByText("Jane Doe")).toBeInTheDocument();
  });

  it("includes container query scope class", () => {
    const { container } = render(<TeamCard>member</TeamCard>);
    expect(container.querySelector('[data-slot="team-card"]')?.className).toContain(
      "@container/team-card",
    );
  });

  it("merges className", () => {
    const { container } = render(<TeamCard className="custom-class">member</TeamCard>);
    expect(container.querySelector('[data-slot="team-card"]')?.className).toContain("custom-class");
  });
});
