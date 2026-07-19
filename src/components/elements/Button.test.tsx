import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies variant via data-variant attribute", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "destructive");
  });

  it("applies size via data-size attribute", () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "lg");
  });

  it("forwards click handler", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("renders custom element via render prop", () => {
    /*
     * Base UI's Button keeps button semantics (role, keyboard polyfill)
     * regardless of the rendered tag; nativeButton={false} silences the
     * warning when rendering as a non-button. Assert by tag, not role
     * For a real anchor with link semantics + button styling, see Link
     */
    render(<Button render={<a href="/">Click</a>} nativeButton={false} />);
    const el = screen.getByText("Click");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/");
  });

  it("has disabled attribute when disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("has data-slot attribute", () => {
    render(<Button>Slot</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button");
  });
});
