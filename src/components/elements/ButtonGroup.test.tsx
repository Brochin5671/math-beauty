import { render, screen, within } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";
import { ButtonGroup, buttonGroupVariants } from "./ButtonGroup";

describe("buttonGroupVariants", () => {
  for (const axis of variantAxes(buttonGroupVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(buttonGroupVariants, axis));
  }
});

describe("ButtonGroup", () => {
  it("groups its buttons in a role=group with data-slot", () => {
    render(
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group");
    expect(group).toHaveAttribute("data-slot", "button-group");
    expect(within(group).getAllByRole("button")).toHaveLength(2);
  });

  it("reflects orientation via data-orientation", () => {
    render(
      <ButtonGroup orientation="vertical">
        <Button>One</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toHaveAttribute("data-orientation", "vertical");
  });
});
