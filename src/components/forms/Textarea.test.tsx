import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders as textarea element", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox").tagName).toBe("TEXTAREA");
  });

  it("forwards placeholder", () => {
    render(<Textarea placeholder="Write a message" />);
    expect(screen.getByPlaceholderText("Write a message")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<Textarea />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-slot", "textarea");
  });

  it("forwards disabled", () => {
    render(<Textarea disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("reflects aria-invalid", () => {
    render(<Textarea aria-invalid />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("controlled: reflects the value prop", () => {
    render(<Textarea value="hello" readOnly aria-label="Bio" />);
    expect(screen.getByRole("textbox", { name: "Bio" })).toHaveValue("hello");
  });
});
