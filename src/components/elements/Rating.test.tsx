import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Rating } from "./Rating";

describe("Rating", () => {
  it("renders a read-only score with role img and a derived label", () => {
    const { container, getByRole } = render(<Rating value={4.5} />);
    expect(container.querySelector('[data-slot="rating"]')).not.toBeNull();
    expect(getByRole("img")).toHaveAttribute("aria-label", "Rated 4.5 out of 5");
  });

  it("renders one icon pair per step (max)", () => {
    const { container } = render(<Rating value={3} max={7} />);
    // Each pair owns one outline icon; filled overlays add more, so assert the
    // pair count via the relative wrappers instead of raw svg count
    expect(container.querySelectorAll('[data-slot="rating"] > span.relative')).toHaveLength(7);
  });

  it("merges a consumer className", () => {
    const { container } = render(<Rating value={2} className="custom-x" />);
    expect(container.querySelector('[data-slot="rating"]')).toHaveClass("custom-x");
  });

  it("exposes a focusable slider with value semantics when interactive", () => {
    const { getByRole } = render(<Rating readOnly={false} defaultValue={2} />);
    const slider = getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuenow", "2");
    expect(slider).toHaveAttribute("aria-valuemax", "5");
    expect(slider).toHaveAttribute("tabindex", "0");
  });

  it("moves by step with the arrow keys and fires onValueChange", () => {
    const onValueChange = vi.fn();
    const { getByRole } = render(
      <Rating readOnly={false} defaultValue={2} step={0.5} onValueChange={onValueChange} />,
    );
    const slider = getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenCalledWith(2.5);
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(onValueChange).toHaveBeenLastCalledWith(2);
  });

  it("jumps to the bounds with Home and End", () => {
    const onValueChange = vi.fn();
    const { getByRole } = render(
      <Rating readOnly={false} defaultValue={3} onValueChange={onValueChange} />,
    );
    const slider = getByRole("slider");
    fireEvent.keyDown(slider, { key: "End" });
    expect(onValueChange).toHaveBeenLastCalledWith(5);
    fireEvent.keyDown(slider, { key: "Home" });
    expect(onValueChange).toHaveBeenLastCalledWith(1);
  });
});
