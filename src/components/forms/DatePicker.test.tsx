import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  it("renders a trigger button with the placeholder when no date is set", () => {
    const { getByText, getByRole } = render(<DatePicker />);
    expect(getByText("Pick a date")).toBeInTheDocument();
    expect(getByRole("button")).toHaveAttribute("data-slot", "date-picker-trigger");
  });

  it("displays the formatted date when controlled and a value is set", () => {
    const date = new Date(2026, 4, 15);
    const { getByText } = render(<DatePicker date={date} />);
    expect(getByText("May 15th, 2026")).toBeInTheDocument();
  });

  it("respects a custom placeholder", () => {
    const { getByText } = render(<DatePicker placeholder="Choose a day" />);
    expect(getByText("Choose a day")).toBeInTheDocument();
  });

  it("respects a custom dateFormat", () => {
    const date = new Date(2026, 4, 15);
    const { getByText } = render(<DatePicker date={date} dateFormat="yyyy-MM-dd" />);
    expect(getByText("2026-05-15")).toBeInTheDocument();
  });
});
