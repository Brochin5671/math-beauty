import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it, vi } from "vitest";
import { Field, FieldLabel } from "./Field";
import { Switch, switchVariants } from "./Switch";

describe("switchVariants", () => {
  for (const axis of variantAxes(switchVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(switchVariants, axis));
  }
});

describe("Switch", () => {
  it("renders an unchecked switch with the default size", () => {
    render(<Switch aria-label="Wifi" />);
    const sw = screen.getByRole("switch", { name: "Wifi" });
    expect(sw).toHaveAttribute("data-slot", "switch");
    expect(sw).toHaveAttribute("data-size", "default");
    expect(sw).not.toBeChecked();
  });

  it("reflects the sm size via data-size", () => {
    render(<Switch size="sm" aria-label="Wifi" />);
    expect(screen.getByRole("switch", { name: "Wifi" })).toHaveAttribute("data-size", "sm");
  });

  it("uncontrolled: defaultChecked seeds state and a click toggles it", async () => {
    const user = userEvent.setup();
    render(<Switch defaultChecked aria-label="Wifi" />);
    const sw = screen.getByRole("switch", { name: "Wifi" });
    expect(sw).toBeChecked();
    await user.click(sw);
    expect(sw).not.toBeChecked();
  });

  it("controlled: honors checked and fires onCheckedChange without self-updating", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch checked={false} onCheckedChange={onCheckedChange} aria-label="Wifi" />);
    const sw = screen.getByRole("switch", { name: "Wifi" });
    await user.click(sw);
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(sw).not.toBeChecked();
  });

  it("disabled blocks interaction", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch disabled onCheckedChange={onCheckedChange} aria-label="Wifi" />);
    await user.click(screen.getByRole("switch", { name: "Wifi" }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("reflects aria-invalid", () => {
    render(<Switch aria-invalid aria-label="Wifi" />);
    expect(screen.getByRole("switch", { name: "Wifi" })).toHaveAttribute("aria-invalid", "true");
  });

  it("composes with Field: clicking the label toggles the switch", async () => {
    const user = userEvent.setup();
    render(
      <Field>
        <FieldLabel htmlFor="wifi">Wifi</FieldLabel>
        <Switch id="wifi" />
      </Field>,
    );
    await user.click(screen.getByText("Wifi"));
    expect(screen.getByRole("switch")).toBeChecked();
  });
});
