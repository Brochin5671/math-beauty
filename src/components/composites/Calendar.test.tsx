import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Calendar } from "./Calendar";

describe("Calendar", () => {
  it("renders the calendar root with data-slot=calendar", () => {
    const { container } = render(<Calendar />);
    expect(container.querySelector('[data-slot="calendar"]')).not.toBeNull();
  });

  it("renders the month grid as a table", () => {
    const { container } = render(<Calendar />);
    expect(container.querySelector("table")).not.toBeNull();
  });

  it("renders weekday headers", () => {
    const { container } = render(<Calendar />);
    expect(container.querySelectorAll("th").length).toBeGreaterThan(0);
  });

  it("merges consumer className", () => {
    const { container } = render(<Calendar className="custom-x" />);
    expect(container.querySelector('[data-slot="calendar"]')).toHaveClass("custom-x");
  });
});
