import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Main } from "./Main";

describe("Main", () => {
  it("renders as <main> with data-slot=main", () => {
    const { container } = render(<Main>body</Main>);
    const main = container.querySelector("main");
    expect(main).not.toBeNull();
    expect(main).toHaveAttribute("data-slot", "main");
  });

  it("defaults id to main-content + tabIndex to -1", () => {
    const { container } = render(<Main>body</Main>);
    const main = container.querySelector("main");
    expect(main).toHaveAttribute("id", "main-content");
    expect(main).toHaveAttribute("tabindex", "-1");
  });

  it("consumer id override wins", () => {
    const { container } = render(<Main id="custom-main">body</Main>);
    const main = container.querySelector("main");
    expect(main).toHaveAttribute("id", "custom-main");
  });

  it("children pass through", () => {
    const { getByText } = render(
      <Main>
        <p>hello</p>
      </Main>,
    );
    expect(getByText("hello")).toBeInTheDocument();
  });

  it("merges consumer className", () => {
    const { container } = render(<Main className="custom-x">body</Main>);
    expect(container.querySelector("main")).toHaveClass("custom-x");
  });
});
