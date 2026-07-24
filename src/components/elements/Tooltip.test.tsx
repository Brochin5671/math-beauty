import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./Tooltip";

// Tooltip is hover/focus-triggered, which happy-dom cannot simulate reliably, so
// these drive open state through the open/defaultOpen prop
function fixture(extra?: Record<string, unknown>) {
  return (
    <TooltipProvider>
      <Tooltip {...extra}>
        <TooltipTrigger>Help</TooltipTrigger>
        <TooltipContent>Saves your draft</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

describe("Tooltip", () => {
  it("does not render content when closed", () => {
    render(fixture());
    expect(screen.queryByText("Saves your draft")).toBeNull();
  });

  it("renders content when opened via the open prop", () => {
    render(fixture({ open: true }));
    expect(screen.getByText("Saves your draft")).toBeInTheDocument();
  });

  it("renders the trigger as a button", () => {
    render(fixture());
    expect(screen.getByRole("button", { name: "Help" })).toBeInTheDocument();
  });
});
