import { fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  MobileStepper,
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperTitle,
} from "./Stepper";

function renderFourStep(activeStep: number, props?: Partial<React.ComponentProps<typeof Stepper>>) {
  return render(
    <Stepper activeStep={activeStep} aria-label="Test stepper" {...props}>
      <StepperItem>
        <StepperIndicator />
        <StepperTitle>One</StepperTitle>
      </StepperItem>
      <StepperItem>
        <StepperIndicator />
        <StepperTitle>Two</StepperTitle>
      </StepperItem>
      <StepperItem>
        <StepperIndicator />
        <StepperTitle>Three</StepperTitle>
      </StepperItem>
      <StepperItem>
        <StepperIndicator />
        <StepperTitle>Four</StepperTitle>
      </StepperItem>
    </Stepper>,
  );
}

describe("Stepper", () => {
  it("renders the root as <ol> with data-slot", () => {
    const { container } = renderFourStep(0);
    const root = container.querySelector('[data-slot="stepper"]');
    expect(root).toBeInTheDocument();
    expect(root?.tagName).toBe("OL");
  });

  it("exposes orientation, size, and tone via data attributes", () => {
    const { container } = renderFourStep(0, {
      orientation: "vertical",
      size: "lg",
      tone: "success",
    });
    const root = container.querySelector('[data-slot="stepper"]');
    expect(root).toHaveAttribute("data-orientation", "vertical");
    expect(root).toHaveAttribute("data-size", "lg");
    expect(root).toHaveAttribute("data-tone", "success");
  });

  it("defaults tone to 'default' with filled active and complete indicators", () => {
    const { container } = renderFourStep(1);
    const root = container.querySelector('[data-slot="stepper"]');
    expect(root).toHaveAttribute("data-tone", "default");
    const indicators = container.querySelectorAll('[data-slot="stepper-indicator"]');
    // Active (index 1) is filled primary
    expect(indicators[1]?.className).toContain("bg-primary");
    expect(indicators[1]?.className).toContain("text-primary-foreground");
    // Complete (index 0) is also filled primary, distinguished by the check icon
    expect(indicators[0]?.className).toContain("bg-primary");
  });

  it("tone='success' fills active and complete indicators with the success token", () => {
    const { container } = renderFourStep(2, { tone: "success" });
    const indicators = container.querySelectorAll('[data-slot="stepper-indicator"]');
    // Complete (index 0, 1) and active (index 2) all fill with success
    expect(indicators[0]?.className).toContain("bg-success");
    expect(indicators[1]?.className).toContain("bg-success");
    expect(indicators[2]?.className).toContain("bg-success");
    expect(indicators[2]?.className).not.toContain("bg-primary");
  });

  it("tone='success' preserves destructive styling on error state", () => {
    const { container } = render(
      <Stepper activeStep={1} tone="success" aria-label="x">
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
        </StepperItem>
        <StepperItem state="error">
          <StepperIndicator />
          <StepperTitle>Two</StepperTitle>
        </StepperItem>
      </Stepper>,
    );
    const errorIndicator = container.querySelectorAll('[data-slot="stepper-indicator"]')[1];
    expect(errorIndicator?.className).toContain("bg-destructive");
    expect(errorIndicator?.className).not.toContain("bg-success");
  });

  it("auto-renders an item-owned line on each non-last item", () => {
    const { container } = renderFourStep(0);
    const lines = container.querySelectorAll('[data-slot="stepper-item-line"]');
    expect(lines).toHaveLength(3);
  });

  it("does not render a line on the last item", () => {
    const { container } = renderFourStep(0);
    const items = container.querySelectorAll('[data-slot="stepper-item"]');
    expect(items[3]?.querySelector('[data-slot="stepper-item-line"]')).toBeNull();
  });

  it("renders the line inside the last interactive position with correct state", () => {
    const { container } = renderFourStep(2);
    const lines = container.querySelectorAll('[data-slot="stepper-item-line"]');
    // 4 items, 3 lines. activeStep=2 -> lines on items 0, 1, 2.
    // Lines from items 0 and 1 are between complete items -> data-state=complete
    // Line from item 2 is leaving the active item -> data-state=pending
    expect(lines[0]).toHaveAttribute("data-state", "complete");
    expect(lines[1]).toHaveAttribute("data-state", "complete");
    expect(lines[2]).toHaveAttribute("data-state", "pending");
  });

  it("derives state from activeStep: complete < active < pending", () => {
    const { container } = renderFourStep(2);
    const items = container.querySelectorAll('[data-slot="stepper-item"]');
    expect(items[0]).toHaveAttribute("data-state", "complete");
    expect(items[1]).toHaveAttribute("data-state", "complete");
    expect(items[2]).toHaveAttribute("data-state", "active");
    expect(items[3]).toHaveAttribute("data-state", "pending");
  });

  it("sets aria-current=step on the active item when non-interactive", () => {
    const { container } = renderFourStep(2);
    const items = container.querySelectorAll('[data-slot="stepper-item"]');
    expect(items[2]).toHaveAttribute("aria-current", "step");
    expect(items[0]).not.toHaveAttribute("aria-current");
    expect(items[3]).not.toHaveAttribute("aria-current");
  });

  it("renders the index number in the indicator by default", () => {
    const { container } = renderFourStep(0);
    const indicators = container.querySelectorAll('[data-slot="stepper-indicator"]');
    expect(indicators[0]?.textContent).toContain("1");
    expect(indicators[3]?.textContent).toContain("4");
  });

  it("renders CheckIcon in complete indicators and includes sr-only completion text", () => {
    const { container } = renderFourStep(2);
    const completeIndicator = container.querySelectorAll('[data-slot="stepper-indicator"]')[0];
    expect(completeIndicator?.querySelector("svg")).toBeInTheDocument();
    expect(completeIndicator?.textContent).toContain("Completed step 1");
  });

  it("honors per-item state override (e.g. error)", () => {
    const { container } = render(
      <Stepper activeStep={1} aria-label="x">
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
        </StepperItem>
        <StepperItem state="error">
          <StepperIndicator />
          <StepperTitle>Two</StepperTitle>
        </StepperItem>
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>Three</StepperTitle>
        </StepperItem>
      </Stepper>,
    );
    const items = container.querySelectorAll('[data-slot="stepper-item"]');
    expect(items[1]).toHaveAttribute("data-state", "error");
    expect(items[1]).toHaveAttribute("aria-invalid", "true");
  });

  it("auto-promotes to a <button> when onClick is set", () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Stepper activeStep={0} aria-label="x">
        <StepperItem onClick={handleClick}>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
        </StepperItem>
      </Stepper>,
    );
    const button = container.querySelector('[data-slot="stepper-item"] button');
    expect(button).toBeInTheDocument();
    expect(button?.tagName).toBe("BUTTON");
    fireEvent.click(button as HTMLElement);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("keeps aria-current on the <li> even when the item is interactive", () => {
    const { container } = render(
      <Stepper activeStep={0} aria-label="x">
        <StepperItem onClick={() => {}}>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
        </StepperItem>
      </Stepper>,
    );
    const li = container.querySelector('[data-slot="stepper-item"]');
    expect(li).toHaveAttribute("aria-current", "step");
    expect(li?.querySelector("button")).not.toHaveAttribute("aria-current");
  });

  it("does not render a button when onClick is omitted", () => {
    const { container } = renderFourStep(0);
    expect(container.querySelector('[data-slot="stepper-item"] button')).toBeNull();
  });

  it("renders StepperTitle and StepperDescription as <span> (valid inside a button)", () => {
    const { getByText, container } = render(
      <Stepper activeStep={0} aria-label="x">
        <StepperItem onClick={() => {}}>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
          <StepperDescription>Setup your account</StepperDescription>
        </StepperItem>
      </Stepper>,
    );
    const title = getByText("One");
    const desc = getByText("Setup your account");
    expect(title.tagName).toBe("SPAN");
    expect(desc.tagName).toBe("SPAN");
    expect(desc).toHaveAttribute("data-slot", "stepper-description");
    expect(desc.className).toContain("text-muted-foreground");
    expect(container.querySelector("button p")).toBeNull();
  });

  it("throws when StepperItem is rendered outside <Stepper>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <StepperItem>
          <StepperIndicator />
        </StepperItem>,
      ),
    ).toThrow(/Stepper/);
    spy.mockRestore();
  });

  it("renders the default 'Optional' caption when optional={true}", () => {
    const { container, getByText } = render(
      <Stepper activeStep={0} aria-label="x">
        <StepperItem optional>
          <StepperIndicator />
          <StepperTitle>Photo</StepperTitle>
        </StepperItem>
      </Stepper>,
    );
    const caption = getByText("Optional");
    expect(caption).toHaveAttribute("data-slot", "stepper-optional");
    expect(caption.className).toContain("italic");
    expect(container.querySelectorAll('[data-slot="stepper-optional"]')).toHaveLength(1);
  });

  it("renders the provided ReactNode when optional is a node", () => {
    const { getByText, container } = render(
      <Stepper activeStep={0} aria-label="x">
        <StepperItem optional={<span data-testid="custom-opt">Last step</span>}>
          <StepperIndicator />
          <StepperTitle>Confirm</StepperTitle>
        </StepperItem>
      </Stepper>,
    );
    expect(getByText("Last step")).toBeInTheDocument();
    expect(container.querySelector('[data-testid="custom-opt"]')).toBeInTheDocument();
  });

  it("does not render an optional caption when optional is omitted or false", () => {
    const { container, rerender } = render(
      <Stepper activeStep={0} aria-label="x">
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
        </StepperItem>
      </Stepper>,
    );
    expect(container.querySelector('[data-slot="stepper-optional"]')).toBeNull();
    rerender(
      <Stepper activeStep={0} aria-label="x">
        <StepperItem optional={false}>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
        </StepperItem>
      </Stepper>,
    );
    expect(container.querySelector('[data-slot="stepper-optional"]')).toBeNull();
  });

  it("keeps StepperContent visible when the active step is overridden to error", () => {
    const { container } = render(
      <Stepper activeStep={1} orientation="vertical" aria-label="x">
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
          <StepperContent>First content</StepperContent>
        </StepperItem>
        <StepperItem state="error">
          <StepperIndicator />
          <StepperTitle>Two</StepperTitle>
          <StepperContent>Second content</StepperContent>
        </StepperItem>
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>Three</StepperTitle>
          <StepperContent>Third content</StepperContent>
        </StepperItem>
      </Stepper>,
    );
    const contents = container.querySelectorAll('[data-slot="stepper-content"]');
    expect(contents).toHaveLength(1);
    expect(contents[0]?.textContent).toBe("Second content");
    expect(contents[0]).toHaveAttribute("data-state", "error");
  });

  it("renders StepperContent only inside the active step", () => {
    const { container } = render(
      <Stepper activeStep={1} orientation="vertical" aria-label="x">
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
          <StepperContent>First step content</StepperContent>
        </StepperItem>
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>Two</StepperTitle>
          <StepperContent>Second step content</StepperContent>
        </StepperItem>
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>Three</StepperTitle>
          <StepperContent>Third step content</StepperContent>
        </StepperItem>
      </Stepper>,
    );
    const contents = container.querySelectorAll('[data-slot="stepper-content"]');
    expect(contents).toHaveLength(1);
    expect(contents[0]?.textContent).toBe("Second step content");
    expect(contents[0]).toHaveAttribute("data-state", "active");
  });

  it("linear={true} suppresses onClick on steps past activeStep and flags them aria-disabled", () => {
    const futureClick = vi.fn();
    const reachedClick = vi.fn();
    const { container } = render(
      <Stepper activeStep={1} linear aria-label="x">
        <StepperItem onClick={reachedClick}>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
        </StepperItem>
        <StepperItem onClick={reachedClick}>
          <StepperIndicator />
          <StepperTitle>Two</StepperTitle>
        </StepperItem>
        <StepperItem onClick={futureClick}>
          <StepperIndicator />
          <StepperTitle>Three</StepperTitle>
        </StepperItem>
        <StepperItem onClick={futureClick}>
          <StepperIndicator />
          <StepperTitle>Four</StepperTitle>
        </StepperItem>
      </Stepper>,
    );
    const items = container.querySelectorAll('[data-slot="stepper-item"]');
    // Reached steps (index <= activeStep): interactive
    expect(items[0]?.querySelector("button")).toBeInTheDocument();
    expect(items[1]?.querySelector("button")).toBeInTheDocument();
    expect(items[0]).not.toHaveAttribute("aria-disabled");
    // Future steps (index > activeStep): not interactive + aria-disabled
    expect(items[2]?.querySelector("button")).toBeNull();
    expect(items[3]?.querySelector("button")).toBeNull();
    expect(items[2]).toHaveAttribute("aria-disabled", "true");
    expect(items[3]).toHaveAttribute("aria-disabled", "true");
    expect(items[2]).toHaveAttribute("data-disabled", "");
    // Confirm clicks on reached steps still fire
    fireEvent.click(items[0]?.querySelector("button") as HTMLElement);
    expect(reachedClick).toHaveBeenCalled();
    // Future click handlers never bound (no button to click)
    expect(futureClick).not.toHaveBeenCalled();
  });

  it("linear={false} (default) leaves future steps interactive when onClick is set", () => {
    const click = vi.fn();
    const { container } = render(
      <Stepper activeStep={0} aria-label="x">
        <StepperItem onClick={click}>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
        </StepperItem>
        <StepperItem onClick={click}>
          <StepperIndicator />
          <StepperTitle>Two</StepperTitle>
        </StepperItem>
      </Stepper>,
    );
    const items = container.querySelectorAll('[data-slot="stepper-item"]');
    expect(items[1]?.querySelector("button")).toBeInTheDocument();
    expect(items[1]).not.toHaveAttribute("aria-disabled");
  });

  it("connector='default' renders solid muted lines (no state-aware fill)", () => {
    const { container } = renderFourStep(2);
    const lines = container.querySelectorAll('[data-slot="stepper-item-line"]');
    for (const line of Array.from(lines)) {
      expect(line.className).toContain("bg-border");
      expect(line.className).not.toContain("bg-primary");
    }
  });

  it("trail={true} fills lines before activeStep with the primary token", () => {
    const { container } = renderFourStep(2, { trail: true });
    const lines = container.querySelectorAll('[data-slot="stepper-item-line"]');
    expect(lines[0]?.className).toContain("bg-primary");
    expect(lines[0]).toHaveAttribute("data-state", "complete");
    expect(lines[1]?.className).toContain("bg-primary");
    expect(lines[2]?.className).toContain("bg-border");
    expect(lines[2]).toHaveAttribute("data-state", "pending");
  });

  it("trail={true} under tone='success' fills with the success token", () => {
    const { container } = renderFourStep(2, { trail: true, tone: "success" });
    const lines = container.querySelectorAll('[data-slot="stepper-item-line"]');
    expect(lines[0]?.className).toContain("bg-success");
    expect(lines[0]?.className).not.toContain("bg-primary");
  });

  it("connector='dotted' renders a dashed border line instead of a solid fill", () => {
    const { container } = renderFourStep(2, { connector: "dotted" });
    const line = container.querySelector('[data-slot="stepper-item-line"]');
    expect(line?.className).toContain("border-dashed");
    expect(line?.className).toContain("bg-transparent");
  });

  it("connector='dotted' + trail tints the dashed border with the tone color", () => {
    const { container } = renderFourStep(2, { connector: "dotted", trail: true });
    const lines = container.querySelectorAll('[data-slot="stepper-item-line"]');
    expect(lines[0]?.className).toContain("border-primary");
    expect(lines[2]?.className).toContain("border-border");
  });

  it("connector='thick' renders a thicker 4px line", () => {
    const { container } = renderFourStep(2, { connector: "thick" });
    const line = container.querySelector('[data-slot="stepper-item-line"]');
    expect(line?.className).toContain("h-1");
    expect(line?.className).toContain("bg-border");
  });

  it("connector='thick' + trail fills the thick line with the tone color before activeStep", () => {
    const { container } = renderFourStep(2, { connector: "thick", trail: true });
    const lines = container.querySelectorAll('[data-slot="stepper-item-line"]');
    expect(lines[0]?.className).toContain("h-1");
    expect(lines[0]?.className).toContain("bg-primary");
    expect(lines[2]?.className).toContain("bg-border");
  });

  it("default connector renders a 2px line (visible on high-DPI displays)", () => {
    const { container } = renderFourStep(2);
    const line = container.querySelector('[data-slot="stepper-item-line"]');
    expect(line?.className).toContain("h-0.5");
  });

  it("horizontal orientation positions the line absolutely at the indicator's vertical center", () => {
    const { container } = renderFourStep(2, { orientation: "horizontal", size: "default" });
    const line = container.querySelector('[data-slot="stepper-item-line"]');
    expect(line?.className).toContain("absolute");
    expect(line?.className).toContain("left-1/2");
    expect(line?.className).toContain("top-4");
  });

  it("vertical orientation places the line inline with flex-1 inside the indicator column", () => {
    const { container } = renderFourStep(2, { orientation: "vertical" });
    const line = container.querySelector('[data-slot="stepper-item-line"]');
    expect(line?.className).toContain("flex-1");
    expect(line?.className).toContain("w-0.5");
    expect(line?.className).not.toContain("absolute");
  });

  it("vertical + connector='dotted' uses a dashed left border", () => {
    const { container } = renderFourStep(1, { orientation: "vertical", connector: "dotted" });
    const line = container.querySelector('[data-slot="stepper-item-line"]');
    expect(line?.className).toContain("border-l-2");
    expect(line?.className).toContain("border-dashed");
  });

  it("horizontal items are equal-width and indicators stack above the line", () => {
    const { container } = renderFourStep(1);
    const items = container.querySelectorAll('[data-slot="stepper-item"]');
    for (const item of Array.from(items)) {
      expect(item.className).toContain("flex-1");
      expect(item.className).toContain("relative");
    }
    const indicators = container.querySelectorAll('[data-slot="stepper-indicator"]');
    for (const ind of Array.from(indicators)) {
      expect(ind.className).toContain("z-10");
    }
  });

  it("custom separator slot replaces the default line node per item", () => {
    const { container } = render(
      <Stepper
        activeStep={1}
        trail
        aria-label="x"
        separator={<span data-testid="custom-sep" aria-hidden="true" />}>
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
        </StepperItem>
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>Two</StepperTitle>
        </StepperItem>
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>Three</StepperTitle>
        </StepperItem>
      </Stepper>,
    );
    expect(container.querySelectorAll('[data-testid="custom-sep"]')).toHaveLength(2);
    expect(container.querySelector('[data-slot="stepper-item-line"]')).toBeNull();
  });

  it("dynamic activeStep: clicking a step updates derived states across the row", () => {
    function Driver() {
      const [step, setStep] = useState(0);
      return (
        <Stepper activeStep={step} trail aria-label="x">
          <StepperItem onClick={() => setStep(0)}>
            <StepperIndicator />
            <StepperTitle>One</StepperTitle>
          </StepperItem>
          <StepperItem onClick={() => setStep(1)}>
            <StepperIndicator />
            <StepperTitle>Two</StepperTitle>
          </StepperItem>
          <StepperItem onClick={() => setStep(2)}>
            <StepperIndicator />
            <StepperTitle>Three</StepperTitle>
          </StepperItem>
        </Stepper>
      );
    }
    const { container } = render(<Driver />);
    const buttons = container.querySelectorAll('[data-slot="stepper-item"] button');
    fireEvent.click(buttons[2] as HTMLElement);
    const items = container.querySelectorAll('[data-slot="stepper-item"]');
    expect(items[0]).toHaveAttribute("data-state", "complete");
    expect(items[1]).toHaveAttribute("data-state", "complete");
    expect(items[2]).toHaveAttribute("data-state", "active");
    const lines = container.querySelectorAll('[data-slot="stepper-item-line"]');
    expect(lines[0]?.className).toContain("bg-primary");
    expect(lines[1]?.className).toContain("bg-primary");
  });

  it("default (connected=false) draws the line indicator-center to indicator-center", () => {
    const { container } = renderFourStep(0, { size: "default" });
    const line = container.querySelector('[data-slot="stepper-item-line"]');
    expect(line?.className).toContain("left-1/2");
    expect(line?.className).toContain("w-[calc(100%_+_0.5rem)]");
    const root = container.querySelector('[data-slot="stepper"]');
    expect(root).not.toHaveAttribute("data-connected");
  });

  it("connected={true} shrinks the line so it starts past the indicator and stops short of the next one", () => {
    const { container } = renderFourStep(0, { connected: true, size: "default" });
    const line = container.querySelector('[data-slot="stepper-item-line"]');
    // Line shifts right by r + 16px = 32px = 2rem
    expect(line?.className).toContain("left-[calc(50%_+_2rem)]");
    // And its width loses 2 * 2rem = 4rem to leave breathing room on both sides
    expect(line?.className).toContain("w-[calc(100%_+_0.5rem_-_4rem)]");
    const root = container.querySelector('[data-slot="stepper"]');
    expect(root).toHaveAttribute("data-connected", "true");
    // Indicator stays exactly as it was; no halo
    const indicator = container.querySelector('[data-slot="stepper-indicator"]');
    expect(indicator?.className).not.toContain("ring-[16px]");
  });

  it("connected={true} in vertical adds my-4 to the line and pads the text column so the visible line survives", () => {
    const { container } = render(
      <Stepper activeStep={0} orientation="vertical" connected aria-label="x">
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
        </StepperItem>
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>Two</StepperTitle>
        </StepperItem>
      </Stepper>,
    );
    const line = container.querySelector('[data-slot="stepper-item-line"]');
    expect(line?.className).toContain("my-4");
    const item = container.querySelector('[data-slot="stepper-item"]');
    const textCol = item?.querySelector(".flex-1.flex-col");
    expect(textCol?.className).toContain("pb-12");
    expect(textCol?.className).not.toContain("pb-4 ");
  });

  it("connected={true} leaves the title's mt and the horizontal indicator-text gap untouched", () => {
    const { container } = renderFourStep(0, { connected: true });
    const title = container.querySelector('[data-slot="stepper-title"]');
    expect(title?.className).toContain("mt-2");
    expect(title?.className).not.toContain("mt-6");
  });

  it("single-item Stepper renders no line", () => {
    const { container } = render(
      <Stepper activeStep={0} aria-label="x">
        <StepperItem>
          <StepperIndicator />
          <StepperTitle>One</StepperTitle>
        </StepperItem>
      </Stepper>,
    );
    expect(container.querySelector('[data-slot="stepper-item-line"]')).toBeNull();
  });
});

describe("MobileStepper", () => {
  it("renders the root as a progressbar with ARIA valuenow/min/max + label", () => {
    const { container } = render(
      <MobileStepper activeStep={1} steps={4} aria-label="Checkout progress" />,
    );
    const root = container.querySelector('[data-slot="mobile-stepper"]');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("role", "progressbar");
    expect(root).toHaveAttribute("aria-valuenow", "2");
    expect(root).toHaveAttribute("aria-valuemin", "1");
    expect(root).toHaveAttribute("aria-valuemax", "4");
    expect(root).toHaveAttribute("aria-label", "Checkout progress");
  });

  it("defaults to the text indicator and renders 'n+1 / steps'", () => {
    const { container } = render(<MobileStepper activeStep={0} steps={3} aria-label="x" />);
    const root = container.querySelector('[data-slot="mobile-stepper"]');
    expect(root).toHaveAttribute("data-indicator", "text");
    const text = container.querySelector('[data-slot="mobile-stepper-text"]');
    expect(text?.textContent).toBe("1 / 3");
  });

  it("text indicator updates with activeStep", () => {
    const { container, rerender } = render(
      <MobileStepper activeStep={0} steps={3} aria-label="x" />,
    );
    expect(container.querySelector('[data-slot="mobile-stepper-text"]')?.textContent).toBe("1 / 3");
    rerender(<MobileStepper activeStep={2} steps={3} aria-label="x" />);
    expect(container.querySelector('[data-slot="mobile-stepper-text"]')?.textContent).toBe("3 / 3");
  });

  it("dots indicator renders one dot per step with the active dot filled", () => {
    const { container } = render(
      <MobileStepper activeStep={1} steps={4} indicator="dots" aria-label="x" />,
    );
    const dots = container.querySelectorAll('[data-slot="mobile-stepper-dot"]');
    expect(dots).toHaveLength(4);
    expect(dots[0]).toHaveAttribute("data-state", "complete");
    expect(dots[1]).toHaveAttribute("data-state", "active");
    expect(dots[1]?.className).toContain("bg-primary");
    expect(dots[2]).toHaveAttribute("data-state", "pending");
    expect(dots[2]?.className).toContain("bg-border");
    expect(dots[3]).toHaveAttribute("data-state", "pending");
  });

  it("progress indicator sets inner bar width to (activeStep + 1) / steps", () => {
    const { container } = render(
      <MobileStepper activeStep={1} steps={4} indicator="progress" aria-label="x" />,
    );
    const bar = container.querySelector(
      '[data-slot="mobile-stepper-progress-bar"]',
    ) as HTMLElement | null;
    expect(bar).toBeInTheDocument();
    // (1 + 1) / 4 = 50%
    expect(bar?.style.width).toBe("50%");
    expect(bar?.className).toContain("bg-primary");
  });

  it("tone='success' swaps primary tokens to success on dots and progress", () => {
    const { container, rerender } = render(
      <MobileStepper activeStep={0} steps={3} indicator="dots" tone="success" aria-label="x" />,
    );
    const dot = container.querySelector('[data-slot="mobile-stepper-dot"][data-state="active"]');
    expect(dot?.className).toContain("bg-success");
    rerender(
      <MobileStepper activeStep={0} steps={3} indicator="progress" tone="success" aria-label="x" />,
    );
    const bar = container.querySelector('[data-slot="mobile-stepper-progress-bar"]');
    expect(bar?.className).toContain("bg-success");
  });

  it("size axis scales dot, text, and progress dimensions", () => {
    const { container, rerender } = render(
      <MobileStepper activeStep={0} steps={3} indicator="dots" size="lg" aria-label="x" />,
    );
    expect(container.querySelector('[data-slot="mobile-stepper-dot"]')?.className).toContain(
      "size-2.5",
    );
    rerender(<MobileStepper activeStep={0} steps={3} size="lg" aria-label="x" />);
    expect(container.querySelector('[data-slot="mobile-stepper-text"]')?.className).toContain(
      "text-base",
    );
    rerender(
      <MobileStepper activeStep={0} steps={3} indicator="progress" size="lg" aria-label="x" />,
    );
    expect(container.querySelector('[data-slot="mobile-stepper-progress"]')?.className).toContain(
      "h-1.5",
    );
  });

  it("radiant indicator renders an SVG ring with stroke-dashoffset reflecting progress", () => {
    const { container } = render(
      <MobileStepper activeStep={1} steps={4} indicator="radiant" aria-label="x" />,
    );
    const root = container.querySelector('[data-slot="mobile-stepper-radiant"]');
    expect(root).toBeInTheDocument();
    const progressCircle = container.querySelector(
      '[data-slot="mobile-stepper-radiant-progress"]',
    ) as SVGCircleElement | null;
    expect(progressCircle).toBeInTheDocument();
    expect(progressCircle?.getAttribute("class")).toContain("stroke-primary");
    // Circumference = 2π·16; with 2/4 progress, dashoffset = circumference * 0.5
    const circumference = 2 * Math.PI * 16;
    const expected = circumference * 0.5;
    expect(Number(progressCircle?.getAttribute("stroke-dashoffset"))).toBeCloseTo(expected, 1);
    const label = container.querySelector('[data-slot="mobile-stepper-radiant-text"]');
    expect(label?.textContent).toBe("2/4");
  });

  it("radiant indicator under tone='success' strokes the ring with the success token", () => {
    const { container } = render(
      <MobileStepper activeStep={0} steps={3} indicator="radiant" tone="success" aria-label="x" />,
    );
    const progressCircle = container.querySelector('[data-slot="mobile-stepper-radiant-progress"]');
    expect(progressCircle?.getAttribute("class")).toContain("stroke-success");
  });

  it("radiant indicator scales the ring + text with size", () => {
    const { container, rerender } = render(
      <MobileStepper activeStep={0} steps={3} indicator="radiant" size="sm" aria-label="x" />,
    );
    expect(container.querySelector('[data-slot="mobile-stepper-radiant"]')?.className).toContain(
      "size-9",
    );
    rerender(
      <MobileStepper activeStep={0} steps={3} indicator="radiant" size="lg" aria-label="x" />,
    );
    expect(container.querySelector('[data-slot="mobile-stepper-radiant"]')?.className).toContain(
      "size-14",
    );
  });

  it("clamps activeStep to a sensible range and renders the last step when overflowing", () => {
    const { container } = render(<MobileStepper activeStep={10} steps={3} aria-label="x" />);
    const text = container.querySelector('[data-slot="mobile-stepper-text"]');
    expect(text?.textContent).toBe("3 / 3");
    const root = container.querySelector('[data-slot="mobile-stepper"]');
    expect(root).toHaveAttribute("aria-valuenow", "3");
  });
});

describe("Stepper verticalBelow", () => {
  function mockMatchMedia(matchesBelow: boolean) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: query.startsWith("(max-width") && query !== "(max-width: 0px)" && matchesBelow,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  it("reflects the verticalBelow prop and stays horizontal above the cutoff", () => {
    mockMatchMedia(false);
    const { container } = renderFourStep(1, { verticalBelow: "sm" });
    const root = container.querySelector('[data-slot="stepper"]');
    expect(root).toHaveAttribute("data-vertical-below", "sm");
    expect(root).toHaveAttribute("data-orientation", "horizontal");
  });

  it("flips to vertical below the cutoff", () => {
    mockMatchMedia(true);
    const { container } = renderFourStep(1, { verticalBelow: "sm" });
    expect(container.querySelector('[data-slot="stepper"]')).toHaveAttribute(
      "data-orientation",
      "vertical",
    );
  });
});
