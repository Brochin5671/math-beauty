import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./InputGroup";

describe("InputGroup", () => {
  it("wraps the control in a role=group with data-slot", () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Search" />
      </InputGroup>,
    );
    const root = document.querySelector('[data-slot="input-group"]');
    expect(root).toHaveAttribute("role", "group");
    expect(screen.getByRole("textbox", { name: "Search" })).toHaveAttribute(
      "data-slot",
      "input-group-control",
    );
  });

  it("InputGroupAddon reflects its align prop via data-align", () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Amount" />
        <InputGroupAddon align="inline-end">$</InputGroupAddon>
      </InputGroup>,
    );
    expect(document.querySelector('[data-slot="input-group-addon"]')).toHaveAttribute(
      "data-align",
      "inline-end",
    );
  });

  it("clicking a non-button addon focuses the nested input", async () => {
    const user = userEvent.setup();
    render(
      <InputGroup>
        <InputGroupInput aria-label="Amount" />
        <InputGroupAddon align="inline-start">$</InputGroupAddon>
      </InputGroup>,
    );
    const addon = document.querySelector('[data-slot="input-group-addon"]') as HTMLElement;
    await user.click(addon);
    expect(screen.getByRole("textbox", { name: "Amount" })).toHaveFocus();
  });

  it("InputGroupButton handles clicks", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <InputGroup>
        <InputGroupInput aria-label="Search" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={onClick}>Go</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
