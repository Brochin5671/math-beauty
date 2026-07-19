import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it, vi } from "vitest";
import { Field, FieldLabel } from "./Field";
import { NumberField, numberFieldVariants } from "./NumberField";

const input = (c: HTMLElement) =>
  c.querySelector('[data-slot="number-field-input"]') as HTMLInputElement;

describe("numberFieldVariants", () => {
  for (const axis of variantAxes(numberFieldVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(numberFieldVariants, axis));
  }
});

describe("NumberField", () => {
  it("renders the input and stepper buttons with data-slots", () => {
    const { container } = render(<NumberField defaultValue={5} />);
    expect(container.querySelector('[data-slot="number-field"]')).not.toBeNull();
    expect(input(container)).toHaveAttribute("data-slot", "number-field-input");
    expect(input(container)).toBe(screen.getByRole("textbox"));
    expect(screen.getByRole("button", { name: "Decrease" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Increase" })).toBeInTheDocument();
  });

  it("increments and decrements by step", async () => {
    const user = userEvent.setup();
    const { container } = render(<NumberField defaultValue={5} step={2} />);
    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(input(container).value).toBe("7");
    await user.click(screen.getByRole("button", { name: "Decrease" }));
    expect(input(container).value).toBe("5");
  });

  it("clamps to max", async () => {
    const user = userEvent.setup();
    const { container } = render(<NumberField defaultValue={9} min={0} max={10} step={5} />);
    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(input(container).value).toBe("10");
  });

  it("controlled: fires onValueChange without self-updating", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<NumberField value={3} step={1} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(onValueChange).toHaveBeenCalledWith(4, expect.anything());
    expect(input(container).value).toBe("3");
  });

  it("disabled blocks the steppers", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<NumberField defaultValue={1} disabled onValueChange={onValueChange} />);
    expect(screen.getByRole("button", { name: "Increase" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("forwards aria-invalid to the input", () => {
    const { container } = render(<NumberField defaultValue={1} aria-invalid />);
    expect(input(container)).toHaveAttribute("aria-invalid", "true");
  });

  it("reflects the sm size on the input and buttons", () => {
    const { container } = render(<NumberField defaultValue={1} size="sm" />);
    const root = container.querySelector('[data-slot="number-field"]');
    expect(root?.className).toContain("[data-slot=number-field-input]]:h-8");
  });

  it("composes with Field: the label names the input", () => {
    render(
      <Field>
        <FieldLabel htmlFor="qty">Quantity</FieldLabel>
        <NumberField id="qty" defaultValue={1} />
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Quantity" })).toBeInTheDocument();
  });

  it("asks for a full keyboard when the value can go negative", () => {
    // Software keypads have no minus key, so a numeric one would make the value untypeable
    const { container } = render(<NumberField defaultValue={1} />);
    expect(input(container)).toHaveAttribute("inputmode", "text");

    const bounded = render(<NumberField defaultValue={1} min={-2} />);
    expect(input(bounded.container)).toHaveAttribute("inputmode", "text");
  });

  it("asks for a decimal keypad when the value cannot go negative", () => {
    const { container } = render(<NumberField defaultValue={1} min={0} />);
    expect(input(container)).toHaveAttribute("inputmode", "decimal");
  });

  it("lets a caller state the keypad explicitly", () => {
    const { container } = render(<NumberField defaultValue={1} min={0} inputMode="numeric" />);
    expect(input(container)).toHaveAttribute("inputmode", "numeric");
  });

  it("commits on Enter by blurring, which Base UI treats as a navigation key", async () => {
    const onValueCommitted = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <NumberField defaultValue={1} onValueCommitted={onValueCommitted} />,
    );
    await user.click(input(container));
    await user.type(input(container), "2");
    await user.keyboard("{Enter}");
    expect(onValueCommitted).toHaveBeenCalled();
  });

  it("names both stepper buttons from controlLabel", () => {
    render(<NumberField defaultValue={1} controlLabel="Zoom" />);
    expect(screen.getByRole("button", { name: "Decrease Zoom" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Increase Zoom" })).toBeInTheDocument();
  });

  it("routes stepper clicks to onStep and vetoes the internal update", async () => {
    const onStep = vi.fn();
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <NumberField value={5} step={1} onStep={onStep} onValueChange={onValueChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Increase" }));
    expect(onStep).toHaveBeenCalledWith(1);
    await user.click(screen.getByRole("button", { name: "Decrease" }));
    expect(onStep).toHaveBeenCalledWith(-1);

    // The veto means the parent owns the value, so neither Base UI nor onValueChange moves it
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input(container).value).toBe("5");
  });

  it("routes the arrow keys to onStep, like the buttons", async () => {
    const onStep = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<NumberField value={5} step={1} onStep={onStep} />);

    await user.click(input(container));
    await user.keyboard("{ArrowUp}");
    expect(onStep).toHaveBeenCalledWith(1);
    await user.keyboard("{ArrowDown}");
    expect(onStep).toHaveBeenCalledWith(-1);
    expect(input(container).value).toBe("5");
  });

  it("leaves typed changes to onValueChange rather than onStep", async () => {
    const onStep = vi.fn();
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <NumberField value={5} step={1} onStep={onStep} onValueChange={onValueChange} />,
    );

    await user.clear(input(container));
    await user.type(input(container), "8");

    expect(onValueChange).toHaveBeenCalledWith(8, expect.anything());
    expect(onStep).not.toHaveBeenCalled();
  });
});
