import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";
import { Field, FieldLabel } from "./Field";

describe("Checkbox", () => {
  it("renders an unchecked checkbox by default", () => {
    render(<Checkbox aria-label="Accept" />);
    const box = screen.getByRole("checkbox", { name: "Accept" });
    expect(box).toHaveAttribute("data-slot", "checkbox");
    expect(box).not.toBeChecked();
  });

  it("uncontrolled: defaultChecked seeds state and a click toggles it", async () => {
    const user = userEvent.setup();
    render(<Checkbox defaultChecked aria-label="Accept" />);
    const box = screen.getByRole("checkbox", { name: "Accept" });
    expect(box).toBeChecked();
    await user.click(box);
    expect(box).not.toBeChecked();
  });

  it("controlled: honors checked and fires onCheckedChange without self-updating", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox checked={false} onCheckedChange={onCheckedChange} aria-label="Accept" />);
    const box = screen.getByRole("checkbox", { name: "Accept" });
    await user.click(box);
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(box).not.toBeChecked();
  });

  it("disabled blocks interaction", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox disabled onCheckedChange={onCheckedChange} aria-label="Accept" />);
    await user.click(screen.getByRole("checkbox", { name: "Accept" }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("reflects the mixed state via aria-checked", () => {
    render(<Checkbox indeterminate aria-label="Accept" />);
    expect(screen.getByRole("checkbox", { name: "Accept" })).toHaveAttribute(
      "aria-checked",
      "mixed",
    );
  });

  it("reflects aria-invalid", () => {
    render(<Checkbox aria-invalid aria-label="Accept" />);
    expect(screen.getByRole("checkbox", { name: "Accept" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("composes with Field: clicking the label toggles the checkbox", async () => {
    const user = userEvent.setup();
    render(
      <Field>
        <FieldLabel htmlFor="terms">Accept terms</FieldLabel>
        <Checkbox id="terms" />
      </Field>,
    );
    await user.click(screen.getByText("Accept terms"));
    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});
