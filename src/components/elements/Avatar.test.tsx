import { render, screen } from "@testing-library/react";
import { expectAxisWired, variantAxes } from "@tests/fixtures/cva-matrix";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarFallback, avatarVariants } from "./Avatar";

describe("avatarVariants", () => {
  for (const axis of variantAxes(avatarVariants)) {
    it(`wires the ${axis} axis`, () => expectAxisWired(avatarVariants, axis));
  }
});

describe("Avatar", () => {
  it("renders the root with data-slot and default size", () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>MB</AvatarFallback>
      </Avatar>,
    );
    expect(container.querySelector('[data-slot="avatar"]')).toHaveAttribute("data-size", "default");
  });

  it("reflects the size prop via data-size", () => {
    const { container } = render(
      <Avatar size="lg">
        <AvatarFallback>MB</AvatarFallback>
      </Avatar>,
    );
    expect(container.querySelector('[data-slot="avatar"]')).toHaveAttribute("data-size", "lg");
  });

  it("renders the fallback with its data-slot", () => {
    render(
      <Avatar>
        <AvatarFallback>MB</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText("MB")).toHaveAttribute("data-slot", "avatar-fallback");
  });
});
