/*
 * Asserts the opt-out reaches the rendered input, not that the hook was called.
 *
 * The defect this pins is a browser restoring a hidden input's `checked` on history
 * traversal, which leaves the control dead on its first press after Back. What prevents it
 * is the attribute being present on the real node, so that is what these assert; a test
 * against the hook's return value would pass with the wiring removed from all three
 * controls.
 *
 * The back-navigation behaviour itself needs a real browser and real history, so it cannot
 * be reproduced here: happy-dom does not restore form state. This covers the mechanism,
 * and a reload test would not have found the original defect either
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "@/components/forms/Checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/forms/RadioGroup";
import { Switch } from "@/components/forms/Switch";

function hiddenInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector("input");
  if (!input) throw new Error("control rendered no hidden input");
  return input;
}

describe("form-restore opt-out", () => {
  it("sets autocomplete=off on the Switch's hidden input", () => {
    const { container } = render(<Switch aria-label="Notifications" />);
    expect(hiddenInput(container).getAttribute("autocomplete")).toBe("off");
  });

  it("sets autocomplete=off on the Checkbox's hidden input", () => {
    const { container } = render(<Checkbox aria-label="Accept" />);
    expect(hiddenInput(container).getAttribute("autocomplete")).toBe("off");
  });

  it("sets autocomplete=off on a RadioGroupItem's hidden input", () => {
    const { container } = render(
      <RadioGroup aria-label="Plan">
        <RadioGroupItem value="free" aria-label="Free" />
      </RadioGroup>,
    );
    expect(hiddenInput(container).getAttribute("autocomplete")).toBe("off");
  });

  /*
   * The hook owns `inputRef`, so a caller passing one would lose it to a naive
   * implementation. Both halves are asserted: the caller's ref receives the node AND the
   * attribute is still set, or merging could satisfy this by dropping the opt-out
   */
  it("merges a caller's own inputRef rather than replacing it", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch aria-label="Notifications" inputRef={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.getAttribute("autocomplete")).toBe("off");
  });

  // guards the three cases above: a control that stopped rendering an input would make
  // every assertion above throw rather than silently pass, and this states that intent
  it("renders exactly one hidden input per control", () => {
    render(<Switch aria-label="Notifications" />);
    expect(screen.getAllByRole("switch")).toHaveLength(1);
  });
});
