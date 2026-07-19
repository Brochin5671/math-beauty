import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./HoverCard";

describe("HoverCard", () => {
  it("renders the trigger with data-slot=hover-card-trigger", () => {
    const { getByText } = render(
      <HoverCard>
        <HoverCardTrigger>hover me</HoverCardTrigger>
        <HoverCardContent>card body</HoverCardContent>
      </HoverCard>,
    );
    expect(getByText("hover me")).toHaveAttribute("data-slot", "hover-card-trigger");
  });

  it("does not render the content until the card is open (Base UI portals on open)", () => {
    const { queryByText } = render(
      <HoverCard>
        <HoverCardTrigger>trigger</HoverCardTrigger>
        <HoverCardContent>body</HoverCardContent>
      </HoverCard>,
    );
    expect(queryByText("body")).toBeNull();
  });

  it("renders content when forced open", () => {
    const { getByText } = render(
      <HoverCard open>
        <HoverCardTrigger>trigger</HoverCardTrigger>
        <HoverCardContent>body</HoverCardContent>
      </HoverCard>,
    );
    expect(getByText("body")).toHaveAttribute("data-slot", "hover-card-content");
  });
});
