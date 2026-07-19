import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./Input";
import { Label } from "./Label";

describe("Label", () => {
  it("renders a label element with data-slot", () => {
    render(<Label>Email</Label>);
    const label = screen.getByText("Email");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("data-slot", "label");
  });

  it("associates with a control via htmlFor", () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <Input id="email" />
      </>,
    );
    expect(screen.getByLabelText("Email")).toBe(screen.getByRole("textbox"));
  });

  it("clicking the label focuses its associated control", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Label htmlFor="name">Name</Label>
        <Input id="name" />
      </>,
    );
    await user.click(screen.getByText("Name"));
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("merges a custom className", () => {
    render(<Label className="custom-x">L</Label>);
    expect(screen.getByText("L")).toHaveClass("custom-x");
  });
});
