import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FAQ } from "./FAQ";

const items = [
  { value: "a", question: "Question A?", answer: "Answer A" },
  { value: "b", question: "Question B?", answer: "Answer B" },
];

describe("FAQ", () => {
  it("renders with data-slot", () => {
    const { container } = render(<FAQ items={items} />);
    expect(container.querySelector('[data-slot="faq"]')).toBeInTheDocument();
  });

  it("renders one AccordionItem per item", () => {
    const { container } = render(<FAQ items={items} />);
    expect(container.querySelectorAll('[data-slot="accordion-item"]')).toHaveLength(2);
  });

  it("renders all questions as triggers", () => {
    const { getByText } = render(<FAQ items={items} />);
    expect(getByText("Question A?")).toBeInTheDocument();
    expect(getByText("Question B?")).toBeInTheDocument();
  });

  it("renders headline children above the accordion", () => {
    const { getByText } = render(
      <FAQ items={items}>
        <h2>Frequently asked questions</h2>
      </FAQ>,
    );
    expect(getByText("Frequently asked questions")).toBeInTheDocument();
  });

  it("falls back to question text when value is omitted", () => {
    const noValueItems = [{ question: "Hello?", answer: "Hi" }];
    const { container } = render(<FAQ items={noValueItems} />);
    expect(container.querySelectorAll('[data-slot="accordion-item"]')).toHaveLength(1);
  });

  it("merges className", () => {
    const { container } = render(<FAQ items={items} className="custom-class" />);
    expect(container.querySelector('[data-slot="faq"]')?.className).toContain("custom-class");
  });
});
