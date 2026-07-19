import { render, screen } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
} from "./Card";

describe("cardVariants", () => {
  for (const axis of variantAxes(cardVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(cardVariants, axis));
  }
});

describe("Card", () => {
  it("renders the root with data-slot, default size, and children", () => {
    const { container } = render(<Card>body</Card>);
    const root = container.querySelector('[data-slot="card"]');
    expect(root).toHaveAttribute("data-size", "default");
    expect(root).toHaveTextContent("body");
  });

  it("reflects the size prop via data-size", () => {
    const { container } = render(<Card size="sm">x</Card>);
    expect(container.querySelector('[data-slot="card"]')).toHaveAttribute("data-size", "sm");
  });

  it("renders each compound part with its data-slot", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Title")).toHaveAttribute("data-slot", "card-title");
    expect(screen.getByText("Desc")).toHaveAttribute("data-slot", "card-description");
    expect(screen.getByText("Action")).toHaveAttribute("data-slot", "card-action");
    expect(screen.getByText("Content")).toHaveAttribute("data-slot", "card-content");
    expect(screen.getByText("Footer")).toHaveAttribute("data-slot", "card-footer");
  });
});
