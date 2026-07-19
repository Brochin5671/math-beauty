import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Stat, statVariants } from "./Stat";

describe("statVariants", () => {
  for (const axis of variantAxes(statVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(statVariants, axis));
  }
});

describe("Stat", () => {
  it("renders with data-slot and the default size", () => {
    const { container } = render(<Stat value="99%" label="Uptime" />);
    const root = container.querySelector('[data-slot="stat"]');
    expect(root).toHaveAttribute("data-size", "default");
  });

  it("reflects the size prop via data-size", () => {
    const { container } = render(<Stat value="99%" label="Uptime" size="lg" />);
    expect(container.querySelector('[data-slot="stat"]')).toHaveAttribute("data-size", "lg");
  });

  it("wraps a string value in a paragraph with the stat-value data-slot", () => {
    const { getByText } = render(<Stat value="150+" label="Projects" />);
    const valueEl = getByText("150+");
    expect(valueEl.tagName).toBe("P");
    expect(valueEl).toHaveAttribute("data-slot", "stat-value");
  });

  it("wraps a string label in a paragraph with the stat-label data-slot", () => {
    const { getByText } = render(<Stat value="150+" label="Projects" />);
    const labelEl = getByText("Projects");
    expect(labelEl.tagName).toBe("P");
    expect(labelEl).toHaveAttribute("data-slot", "stat-label");
  });

  it("renders a ReactNode value verbatim without wrapping", () => {
    const { getByTestId } = render(
      <Stat value={<span data-testid="custom-value">99%</span>} label="Uptime" />,
    );
    expect(getByTestId("custom-value").tagName).toBe("SPAN");
  });

  it("renders a ReactNode label verbatim without wrapping", () => {
    const { getByTestId } = render(
      <Stat value="99%" label={<span data-testid="custom-label">Uptime</span>} />,
    );
    expect(getByTestId("custom-label").tagName).toBe("SPAN");
  });

  it("omits the trend when the prop is not provided", () => {
    const { container } = render(<Stat value="99%" label="Uptime" />);
    expect(container.querySelector('[data-slot="stat-trend"]')).toBeNull();
  });

  it("renders the trend with its direction, icon, and value", () => {
    const { container, getByText } = render(
      <Stat value="99%" label="Uptime" trend={{ direction: "up", value: "+12%" }} />,
    );
    const trend = container.querySelector('[data-slot="stat-trend"]');
    expect(trend).toHaveAttribute("data-direction", "up");
    expect(trend?.querySelector("svg")).toBeInTheDocument();
    expect(getByText("+12%")).toBeInTheDocument();
  });

  it("reflects the trend direction for down and flat", () => {
    const { container, rerender } = render(
      <Stat value="99%" label="Uptime" trend={{ direction: "down", value: "-4%" }} />,
    );
    expect(container.querySelector('[data-slot="stat-trend"]')).toHaveAttribute(
      "data-direction",
      "down",
    );
    rerender(<Stat value="99%" label="Uptime" trend={{ direction: "flat", value: "0%" }} />);
    expect(container.querySelector('[data-slot="stat-trend"]')).toHaveAttribute(
      "data-direction",
      "flat",
    );
  });

  it("renders the optional trend label", () => {
    const { getByText } = render(
      <Stat
        value="99%"
        label="Uptime"
        trend={{ direction: "up", value: "+12%", label: "vs last month" }}
      />,
    );
    expect(getByText("vs last month")).toBeInTheDocument();
  });

  it("merges consumer className", () => {
    const { container } = render(<Stat value="99%" label="Uptime" className="custom-x" />);
    expect(container.querySelector('[data-slot="stat"]')).toHaveClass("custom-x");
  });
});
