import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Process, ProcessStep } from "./Process";

describe("Process", () => {
  it("renders with data-slot", () => {
    const { container } = render(<Process>steps</Process>);
    expect(container.querySelector('[data-slot="process"]')).toBeInTheDocument();
  });

  it("renders the vertical connecting line", () => {
    const { container } = render(<Process>steps</Process>);
    const line = container.querySelector('[data-slot="process"] > [aria-hidden="true"]');
    expect(line?.className).toContain("w-px");
    expect(line?.className).toContain("bg-border");
  });

  it("insets the line from the --process-marker-size token so it re-tokenizes", () => {
    const { container } = render(<Process>steps</Process>);
    const line = container.querySelector('[data-slot="process"] > [aria-hidden="true"]');
    expect(line?.className).toContain("var(--process-marker-size");
  });

  it("merges className", () => {
    const { container } = render(<Process className="custom-class">steps</Process>);
    expect(container.querySelector('[data-slot="process"]')?.className).toContain("custom-class");
  });
});

describe("ProcessStep", () => {
  it("renders with data-slot", () => {
    const { container } = render(<ProcessStep step={1}>content</ProcessStep>);
    expect(container.querySelector('[data-slot="process-step"]')).toBeInTheDocument();
  });

  it("renders the step number", () => {
    const { getByText } = render(<ProcessStep step={3}>content</ProcessStep>);
    expect(getByText("3")).toBeInTheDocument();
  });

  it("sizes the step circle from the --process-marker-size token", () => {
    const { getByText } = render(<ProcessStep step={1}>content</ProcessStep>);
    expect(getByText("1").className).toContain("var(--process-marker-size");
  });

  it("renders children alongside the numbered circle", () => {
    const { getByText } = render(<ProcessStep step={1}>Discovery phase</ProcessStep>);
    expect(getByText("Discovery phase")).toBeInTheDocument();
  });

  it("merges className", () => {
    const { container } = render(
      <ProcessStep step={1} className="custom-class">
        content
      </ProcessStep>,
    );
    expect(container.querySelector('[data-slot="process-step"]')?.className).toContain(
      "custom-class",
    );
  });
});
