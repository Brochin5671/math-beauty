import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup, RadioGroupItem } from "./RadioGroup";

function group(extra?: Record<string, unknown>) {
  return (
    <RadioGroup aria-label="Plan" {...extra}>
      <RadioGroupItem value="free" aria-label="Free" />
      <RadioGroupItem value="pro" aria-label="Pro" />
    </RadioGroup>
  );
}

describe("RadioGroup", () => {
  it("renders a radiogroup with radio items", () => {
    render(group());
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toHaveAttribute(
      "data-slot",
      "radio-group",
    );
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("seeds the checked item from defaultValue", () => {
    render(group({ defaultValue: "pro" }));
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Free" })).not.toBeChecked();
  });

  it("uncontrolled: clicking an item selects it and fires onValueChange", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(group({ onValueChange }));
    await user.click(screen.getByRole("radio", { name: "Pro" }));
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith("pro", expect.anything());
  });

  it("controlled: honors value and fires onValueChange without self-updating", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(group({ value: "free", onValueChange }));
    await user.click(screen.getByRole("radio", { name: "Pro" }));
    expect(onValueChange).toHaveBeenCalledWith("pro", expect.anything());
    expect(screen.getByRole("radio", { name: "Free" })).toBeChecked();
  });

  it("arrow keys move selection to the next item", async () => {
    const user = userEvent.setup();
    render(group({ defaultValue: "free" }));
    const free = screen.getByRole("radio", { name: "Free" });
    free.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
  });

  it("disabled group blocks selection", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(group({ disabled: true, onValueChange }));
    await user.click(screen.getByRole("radio", { name: "Pro" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
