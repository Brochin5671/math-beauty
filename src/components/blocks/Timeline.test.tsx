import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline, TimelineItem } from "./Timeline";

describe("Timeline", () => {
  it("renders with data-slot", () => {
    const { container } = render(<Timeline>items</Timeline>);
    expect(container.querySelector('[data-slot="timeline"]')).toBeInTheDocument();
  });

  it("renders the vertical line", () => {
    const { container } = render(<Timeline>items</Timeline>);
    const line = container.querySelector('[data-slot="timeline"] > [aria-hidden="true"]');
    expect(line?.className).toContain("w-px");
    expect(line?.className).toContain("bg-border");
  });

  it("merges className", () => {
    const { container } = render(<Timeline className="custom-class">items</Timeline>);
    expect(container.querySelector('[data-slot="timeline"]')?.className).toContain("custom-class");
  });
});

describe("TimelineItem", () => {
  it("renders with data-slot", () => {
    const { container } = render(<TimelineItem>milestone</TimelineItem>);
    expect(container.querySelector('[data-slot="timeline-item"]')).toBeInTheDocument();
  });

  it("renders the dot", () => {
    const { container } = render(<TimelineItem>milestone</TimelineItem>);
    const dot = container.querySelector('[data-slot="timeline-item"] > [aria-hidden="true"]');
    expect(dot?.className).toContain("rounded-full");
    expect(dot?.className).toContain("bg-primary");
  });

  it("sizes the dot from the --timeline-marker-size token so it re-tokenizes", () => {
    const { container } = render(<TimelineItem>milestone</TimelineItem>);
    const dot = container.querySelector('[data-slot="timeline-item"] > [aria-hidden="true"]');
    expect(dot?.className).toContain("var(--timeline-marker-size");
  });

  it("renders children", () => {
    const { getByText } = render(<TimelineItem>2024 milestone</TimelineItem>);
    expect(getByText("2024 milestone")).toBeInTheDocument();
  });

  it("merges className", () => {
    const { container } = render(<TimelineItem className="custom-class">milestone</TimelineItem>);
    expect(container.querySelector('[data-slot="timeline-item"]')?.className).toContain(
      "custom-class",
    );
  });
});
