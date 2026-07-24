import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Combobox, ComboboxInput } from "./Combobox";

// Combobox wraps Base UI's Combobox. These tests cover our composition wiring
// (the named disclosure button, disabled propagation, the showTrigger toggle),
// not Base UI's filtering/keyboard internals

describe("Combobox", () => {
  it("renders an input with role combobox and a named disclosure button", () => {
    render(
      <Combobox items={["Apple", "Banana"]}>
        <ComboboxInput aria-label="Fruit" />
      </Combobox>,
    );
    expect(screen.getByRole("combobox", { name: "Fruit" })).toHaveAttribute(
      "data-slot",
      "input-group-control",
    );
    expect(screen.getByRole("button", { name: "Show suggestions" })).toBeInTheDocument();
  });

  it("disables the input and the disclosure button when disabled", () => {
    render(
      <Combobox items={["Apple"]}>
        <ComboboxInput aria-label="Fruit" disabled />
      </Combobox>,
    );
    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Show suggestions" })).toBeDisabled();
  });

  it("hides the disclosure button when showTrigger is false", () => {
    render(
      <Combobox items={["Apple"]}>
        <ComboboxInput aria-label="Fruit" showTrigger={false} />
      </Combobox>,
    );
    expect(screen.queryByRole("button", { name: "Show suggestions" })).toBeNull();
  });
});
