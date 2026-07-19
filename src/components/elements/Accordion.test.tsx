import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it, vi } from "vitest";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  accordionVariants,
} from "./Accordion";

function fixture(extra?: Record<string, unknown>) {
  return (
    <Accordion {...extra}>
      <AccordionItem value="a">
        <AccordionTrigger>Section A</AccordionTrigger>
        <AccordionContent>Panel A</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Section B</AccordionTrigger>
        <AccordionContent>Panel B</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("accordionVariants", () => {
  for (const axis of variantAxes(accordionVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(accordionVariants, axis));
  }
});

describe("Accordion", () => {
  it("starts collapsed and expands a panel on trigger click", async () => {
    const user = userEvent.setup();
    render(fixture());
    const trigger = screen.getByRole("button", { name: "Section A" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("seeds the open panel from defaultValue", () => {
    render(fixture({ defaultValue: ["a"] }));
    expect(screen.getByRole("button", { name: "Section A" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("fires onValueChange when a panel is toggled", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(fixture({ onValueChange }));
    await user.click(screen.getByRole("button", { name: "Section B" }));
    expect(onValueChange).toHaveBeenCalled();
  });
});
