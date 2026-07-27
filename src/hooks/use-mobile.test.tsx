import { act, render, screen } from "@testing-library/react";
import { setViewportWidth, type Viewport } from "@tests/fixtures/match-media";
import { afterEach, describe, expect, it } from "vitest";
import { useIsMobile } from "./use-mobile";

function Probe() {
  return <span data-testid="value">{String(useIsMobile())}</span>;
}

function value(): string {
  return screen.getByTestId("value").textContent ?? "";
}

let viewport: Viewport | undefined;

afterEach(() => {
  viewport?.restore();
  viewport = undefined;
});

describe("useIsMobile", () => {
  it("reports mobile below the md breakpoint", () => {
    viewport = setViewportWidth(375);
    render(<Probe />);
    expect(value()).toBe("true");
  });

  it("reports desktop at the md breakpoint", () => {
    viewport = setViewportWidth(768);
    render(<Probe />);
    expect(value()).toBe("false");
  });

  /*
   * Tailwind's `md:` is min-width 768, so 767.5 is still mobile as far as the
   * stylesheet is concerned. A hook bounded at `max-width: 767px` disagrees, and
   * the component then picks the desktop branch while the CSS around it is mobile
   */
  it("reports mobile in the fractional band below 768", () => {
    viewport = setViewportWidth(767.5);
    render(<Probe />);
    expect(value()).toBe("true");
  });

  /*
   * The value being right is not enough: crossing the breakpoint has to notify, or
   * the component keeps rendering the branch it mounted with. The previous version
   * listened on `max-width: 767px` while reading `innerWidth < 768`, so a resize
   * from 768.5 to 767.5 crossed no boundary its listener knew about and nothing
   * re-rendered
   */
  it("re-renders when a resize crosses the breakpoint in the fractional band", () => {
    viewport = setViewportWidth(768.5);
    render(<Probe />);
    expect(value()).toBe("false");

    act(() => viewport?.resize(767.5));
    expect(value()).toBe("true");
  });

  it("re-renders when a resize crosses the breakpoint on whole pixels", () => {
    viewport = setViewportWidth(1024);
    render(<Probe />);
    expect(value()).toBe("false");

    act(() => viewport?.resize(375));
    expect(value()).toBe("true");
  });
});
