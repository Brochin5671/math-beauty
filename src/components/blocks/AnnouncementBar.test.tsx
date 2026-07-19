import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnnouncementBar, announcementBarVariants } from "./AnnouncementBar";

describe("announcementBarVariants", () => {
  for (const axis of variantAxes(announcementBarVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(announcementBarVariants, axis));
  }
});

describe("AnnouncementBar", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders with data-slot and data-variant", () => {
    const { container } = render(<AnnouncementBar>Hello</AnnouncementBar>);
    const bar = container.querySelector('[data-slot="announcement-bar"]');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("data-variant", "default");
  });

  it("reflects the variant via data-variant", () => {
    const { container } = render(<AnnouncementBar variant="promo">Sale</AnnouncementBar>);
    expect(container.querySelector('[data-slot="announcement-bar"]')).toHaveAttribute(
      "data-variant",
      "promo",
    );
  });

  it("defaults to center alignment and honors align=start", () => {
    const { container, rerender } = render(<AnnouncementBar>Hello</AnnouncementBar>);
    expect(container.querySelector('[data-slot="announcement-bar"]')).toHaveAttribute(
      "data-align",
      "center",
    );
    rerender(<AnnouncementBar align="start">Hello</AnnouncementBar>);
    expect(container.querySelector('[data-slot="announcement-bar"]')).toHaveAttribute(
      "data-align",
      "start",
    );
  });

  it("renders the message", () => {
    const { getByText } = render(<AnnouncementBar>Sitewide sale, 50% off</AnnouncementBar>);
    expect(getByText("Sitewide sale, 50% off")).toBeInTheDocument();
  });

  it("applies the default padding tier and accepts an override", () => {
    const { container, rerender } = render(<AnnouncementBar>Hello</AnnouncementBar>);
    expect(container.querySelector('[data-slot="announcement-bar"]')?.className).toContain("py-2");
    rerender(<AnnouncementBar padding="compact">Hello</AnnouncementBar>);
    const bar = container.querySelector('[data-slot="announcement-bar"]');
    expect(bar?.className).toContain("py-1.5");
    expect(bar?.className).not.toContain("py-2");
  });

  it("renders a CTA link when href + cta are set", () => {
    const { getByText } = render(
      <AnnouncementBar href="/sale" cta="Shop now">
        Sale
      </AnnouncementBar>,
    );
    const link = getByText("Shop now");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/sale");
  });

  it("omits the dismiss button by default", () => {
    const { container } = render(<AnnouncementBar>Hello</AnnouncementBar>);
    expect(
      container.querySelector('[data-slot="announcement-bar-dismiss"]'),
    ).not.toBeInTheDocument();
  });

  it("renders a dismiss button when dismissible", () => {
    const { container } = render(<AnnouncementBar dismissible>Hello</AnnouncementBar>);
    const btn = container.querySelector('[data-slot="announcement-bar-dismiss"]');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-label", "Dismiss announcement");
  });

  it("hides the bar on dismiss click and calls onDismiss", async () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <AnnouncementBar dismissible onDismiss={onDismiss}>
        Hello
      </AnnouncementBar>,
    );
    const btn = container.querySelector('[data-slot="announcement-bar-dismiss"]');
    if (!btn) throw new Error("dismiss button missing");
    await userEvent.click(btn);
    expect(container.querySelector('[data-slot="announcement-bar"]')).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("persists dismissal via localStorage when dismissKey is set", async () => {
    const { container } = render(
      <AnnouncementBar dismissible dismissKey="bar-1">
        Hello
      </AnnouncementBar>,
    );
    const btn = container.querySelector('[data-slot="announcement-bar-dismiss"]');
    if (!btn) throw new Error("dismiss button missing");
    await userEvent.click(btn);
    expect(window.localStorage.getItem("bar-1")).toBe("1");
  });

  it("starts hidden when localStorage already has the dismissKey set", () => {
    window.localStorage.setItem("bar-1", "1");
    const { container } = render(
      <AnnouncementBar dismissible dismissKey="bar-1">
        Hello
      </AnnouncementBar>,
    );
    expect(container.querySelector('[data-slot="announcement-bar"]')).not.toBeInTheDocument();
  });
});
