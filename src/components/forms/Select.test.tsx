import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it, vi } from "vitest";
import { Select, SelectOptGroup, SelectOption, selectVariants } from "./Select";

describe("selectVariants", () => {
  for (const axis of variantAxes(selectVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(selectVariants, axis));
  }
});

function options() {
  return (
    <>
      <SelectOption value="a">Apple</SelectOption>
      <SelectOption value="b">Banana</SelectOption>
    </>
  );
}

describe("Select", () => {
  it("renders a native select with data-slot and default size", () => {
    render(<Select aria-label="Fruit">{options()}</Select>);
    const select = screen.getByRole("combobox", { name: "Fruit" });
    expect(select.tagName).toBe("SELECT");
    expect(select).toHaveAttribute("data-slot", "select");
    expect(select).toHaveAttribute("data-size", "default");
  });

  it("seeds the value from defaultValue", () => {
    render(
      <Select aria-label="Fruit" defaultValue="b">
        {options()}
      </Select>,
    );
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveValue("b");
  });

  it("controlled: reflects value and fires onChange on selection", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Select aria-label="Fruit" value="a" onChange={onChange}>
        {options()}
      </Select>,
    );
    await user.selectOptions(screen.getByRole("combobox", { name: "Fruit" }), "b");
    expect(onChange).toHaveBeenCalled();
  });

  it("forwards disabled", () => {
    render(
      <Select aria-label="Fruit" disabled>
        {options()}
      </Select>,
    );
    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeDisabled();
  });

  it("renders option and optgroup parts with their data-slots", () => {
    render(
      <Select aria-label="Fruit">
        <SelectOptGroup label="Citrus">
          <SelectOption value="a">Apple</SelectOption>
        </SelectOptGroup>
      </Select>,
    );
    expect(document.querySelector('[data-slot="select-optgroup"]')).not.toBeNull();
    expect(document.querySelector('[data-slot="select-option"]')).not.toBeNull();
  });
});
