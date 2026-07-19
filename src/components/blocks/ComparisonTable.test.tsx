import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ComparisonTable } from "./ComparisonTable";

const columns = [{ label: "Free" }, { label: "Pro", featured: true }, { label: "Enterprise" }];

const rows = [
  { feature: "Custom domain", values: [false, true, true] },
  { feature: "Storage", values: ["1 GB", "100 GB", "Unlimited"] },
];

describe("ComparisonTable", () => {
  it("renders with data-slot", () => {
    const { container } = render(<ComparisonTable columns={columns} rows={rows} />);
    expect(container.querySelector('[data-slot="comparison-table"]')).toBeInTheDocument();
  });

  it("renders one TableHead per column plus the Feature header", () => {
    const { container } = render(<ComparisonTable columns={columns} rows={rows} />);
    expect(container.querySelectorAll("thead th")).toHaveLength(columns.length + 1);
  });

  it("marks the featured column with data-featured", () => {
    const { container } = render(<ComparisonTable columns={columns} rows={rows} />);
    const featuredHead = container.querySelector('thead th[data-featured="true"]');
    expect(featuredHead?.textContent).toBe("Pro");
  });

  it("renders boolean values as icons with aria-label", () => {
    const { container } = render(<ComparisonTable columns={columns} rows={rows} />);
    expect(container.querySelector('[aria-label="No"]')).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Yes"]')).toBeInTheDocument();
  });

  it("renders string values as text", () => {
    const { getByText } = render(<ComparisonTable columns={columns} rows={rows} />);
    expect(getByText("1 GB")).toBeInTheDocument();
    expect(getByText("Unlimited")).toBeInTheDocument();
  });

  it("renders caption when provided", () => {
    const { getByText } = render(
      <ComparisonTable columns={columns} rows={rows} caption="Pricing summary" />,
    );
    expect(getByText("Pricing summary")).toBeInTheDocument();
  });

  it("renders headline children above the table", () => {
    const { getByText } = render(
      <ComparisonTable columns={columns} rows={rows}>
        <h2>Compare plans</h2>
      </ComparisonTable>,
    );
    expect(getByText("Compare plans")).toBeInTheDocument();
  });

  it("merges className", () => {
    const { container } = render(
      <ComparisonTable columns={columns} rows={rows} className="custom-class" />,
    );
    expect(container.querySelector('[data-slot="comparison-table"]')?.className).toContain(
      "custom-class",
    );
  });
});
