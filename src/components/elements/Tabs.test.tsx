import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it, vi } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants } from "./Tabs";

function fixture(extra?: Record<string, unknown>) {
  return (
    <Tabs defaultValue="a" {...extra}>
      <TabsList>
        <TabsTrigger value="a">Tab A</TabsTrigger>
        <TabsTrigger value="b">Tab B</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Panel A</TabsContent>
      <TabsContent value="b">Panel B</TabsContent>
    </Tabs>
  );
}

describe("tabsListVariants", () => {
  for (const axis of variantAxes(tabsListVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(tabsListVariants, axis));
  }
});

describe("Tabs", () => {
  it("renders the tablist, tabs, and the active panel", () => {
    render(fixture());
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByRole("tab", { name: "Tab A" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel A");
  });

  it("clicking a tab activates it and fires onValueChange", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(fixture({ onValueChange }));
    await user.click(screen.getByRole("tab", { name: "Tab B" }));
    expect(screen.getByRole("tab", { name: "Tab B" })).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe("b");
  });

  it("arrow keys move focus to the next tab", async () => {
    const user = userEvent.setup();
    render(fixture());
    screen.getByRole("tab", { name: "Tab A" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Tab B" })).toHaveFocus();
  });
});
