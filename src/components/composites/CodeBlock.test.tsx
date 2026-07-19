import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./CodeBlock";

describe("CodeBlock", () => {
  it("renders highlighted code inside a figure, dark by default", () => {
    const { container } = render(<CodeBlock code="const x = 1" lang="typescript" />);
    const figure = container.querySelector('[data-slot="code-block"]');
    expect(figure).not.toBeNull();
    expect(figure?.tagName).toBe("FIGURE");
    const pre = figure?.querySelector("pre.shiki");
    expect(pre).not.toBeNull();
    // Forced themes bake one palette in as absolute inline colors.
    expect(pre?.getAttribute("class")).toContain("github-dark");
    expect(pre?.getAttribute("style")).toContain("background-color:#");
    expect(pre?.textContent).toContain("const x = 1");
  });

  it("bakes a named palette in, e.g. theme=github-light", () => {
    const { container } = render(<CodeBlock code="x" lang="typescript" theme="github-light" />);
    const pre = container.querySelector("pre.shiki");
    expect(pre?.getAttribute("class")).toContain("github-light");
    expect(pre?.getAttribute("style")).toContain("background-color:#");
  });

  it("themes the frame from the palette for a forced theme", () => {
    const { container } = render(<CodeBlock code="x" theme="github-dark" />);
    const figure = container.querySelector('[data-slot="code-block"]');
    // A forced theme bakes the surface in as an inline background color.
    expect(figure?.getAttribute("style")).toMatch(/background-color/i);
  });

  it("keeps the site surface for theme=system", () => {
    const { container } = render(<CodeBlock code="x" theme="system" />);
    const figure = container.querySelector('[data-slot="code-block"]');
    // System defers to the site surface: no forced inline background color.
    expect(figure?.getAttribute("style") ?? "").not.toMatch(/background-color/i);
  });

  it("emits both palettes as CSS variables for theme=system", () => {
    const { container } = render(<CodeBlock code="const x = 1" lang="typescript" theme="system" />);
    const pre = container.querySelector("pre.shiki");
    // Dual-theme output: tokens carry both palettes; global.css picks one.
    const token = pre?.querySelector("span[style*='--shiki-light']");
    expect(token).not.toBeNull();
    expect(pre?.querySelector("span[style*='--shiki-dark']")).not.toBeNull();
  });

  it("shows the title in the header bar", () => {
    const { getByText } = render(<CodeBlock code="x" lang="typescript" title="example.ts" />);
    expect(getByText("example.ts").tagName).toBe("FIGCAPTION");
  });

  it("renders a copy button and its wiring script by default", () => {
    const { container, getByRole } = render(<CodeBlock code="x" />);
    expect(getByRole("button", { name: "Copy code" })).toHaveAttribute("data-code-copy");
    expect(container.querySelector("script")).not.toBeNull();
  });

  it("omits the copy button and script when canCopy is false", () => {
    const { container, queryByRole } = render(<CodeBlock code="x" canCopy={false} />);
    expect(queryByRole("button", { name: "Copy code" })).toBeNull();
    expect(container.querySelector("script")).toBeNull();
  });

  it("falls back to plaintext for an unknown language", () => {
    const { container } = render(<CodeBlock code="SELECT 1" lang="sql" />);
    expect(container.querySelector("pre.shiki")?.textContent).toContain("SELECT 1");
  });

  it("escapes markup in the code instead of injecting it", () => {
    const { container } = render(<CodeBlock code={'<img src=x onerror="alert(1)">'} lang="html" />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("pre")?.textContent).toContain('<img src=x onerror="alert(1)">');
  });

  it("merges consumer className on the figure", () => {
    const { container } = render(<CodeBlock code="x" className="custom-x" />);
    expect(container.querySelector('[data-slot="code-block"]')).toHaveClass("custom-x");
  });
});
