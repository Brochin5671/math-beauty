import { render } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Alert, AlertAction, AlertDescription, AlertTitle, alertVariants } from "./Alert";

describe("alertVariants", () => {
  for (const axis of variantAxes(alertVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(alertVariants, axis));
  }
});

describe("Alert", () => {
  it("renders the compound shape with role=alert and data-slot attributes", () => {
    const { container, getByText } = render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Body text</AlertDescription>
      </Alert>,
    );
    const root = container.querySelector('[data-slot="alert"]');
    expect(root).toHaveAttribute("role", "alert");
    expect(getByText("Heads up")).toHaveAttribute("data-slot", "alert-title");
    expect(getByText("Body text")).toHaveAttribute("data-slot", "alert-description");
  });

  it("renders AlertAction with its data-slot", () => {
    const { container } = render(
      <Alert>
        <AlertAction>act</AlertAction>
      </Alert>,
    );
    expect(container.querySelector('[data-slot="alert-action"]')).not.toBeNull();
  });

  it("merges consumer className without dropping base classes", () => {
    const { container } = render(<Alert className="custom-x">x</Alert>);
    expect(container.querySelector('[data-slot="alert"]')).toHaveClass("custom-x");
  });
});
