import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "./Field";

describe("Field", () => {
  it("renders role=group with data-orientation", () => {
    render(
      <Field orientation="horizontal">
        <FieldLabel htmlFor="x">L</FieldLabel>
        <input id="x" />
      </Field>,
    );
    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).toHaveAttribute("data-slot", "field");
  });

  it("propagates data-invalid as a styling hook", () => {
    render(
      <Field data-invalid>
        <FieldLabel htmlFor="y">L</FieldLabel>
        <input id="y" />
      </Field>,
    );
    expect(screen.getByRole("group")).toHaveAttribute("data-invalid", "true");
  });

  it("FieldLabel wires htmlFor to a sibling input id", () => {
    render(
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <input id="email" type="email" />
      </Field>,
    );
    // Implicit association via id/htmlFor; getByLabelText resolves the input
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
  });

  it("FieldError renders role=alert when children provided", () => {
    render(<FieldError>Required</FieldError>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Required");
    expect(alert).toHaveAttribute("data-slot", "field-error");
  });

  it("FieldError accepts an errors array and deduplicates by message", () => {
    render(<FieldError errors={[{ message: "Too short" }, { message: "Too short" }]} />);
    // Single-message dedupe collapses to a string, not a list
    expect(screen.getByRole("alert")).toHaveTextContent("Too short");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("FieldError renders nothing when neither children nor errors are passed", () => {
    const { container } = render(<FieldError />);
    expect(container).toBeEmptyDOMElement();
  });

  it("FieldGroup carries data-slot=field-group and accepts the @container className", () => {
    render(
      <FieldGroup className="@container/field-group flex">
        <Field>
          <FieldLabel htmlFor="z">L</FieldLabel>
          <input id="z" />
        </Field>
      </FieldGroup>,
    );
    const group = document.querySelector('[data-slot="field-group"]');
    expect(group).not.toBeNull();
    expect(group?.className).toContain("@container/field-group");
  });

  it("FieldSet + FieldLegend render a fieldset/legend pair with the legend variant", () => {
    render(
      <FieldSet>
        <FieldLegend variant="label">Group</FieldLegend>
      </FieldSet>,
    );
    const legend = screen.getByText("Group");
    expect(legend.tagName).toBe("LEGEND");
    expect(legend).toHaveAttribute("data-variant", "label");
  });
});
