import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./Carousel";

describe("Carousel", () => {
  it("renders root with data-slot and ARIA wiring", () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const root = container.querySelector('[data-slot="carousel"]');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("role", "region");
    expect(root).toHaveAttribute("aria-roledescription", "carousel");
  });

  it("renders CarouselContent with data-slot", () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    expect(container.querySelector('[data-slot="carousel-content"]')).toBeInTheDocument();
  });

  it("renders CarouselItem with ARIA wiring", () => {
    const { container } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    const item = container.querySelector('[data-slot="carousel-item"]');
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute("role", "group");
    expect(item).toHaveAttribute("aria-roledescription", "slide");
  });

  it("renders Previous/Next buttons with sr-only labels", () => {
    const { container, getByText } = render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
          <CarouselItem>Two</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );
    expect(container.querySelector('[data-slot="carousel-previous"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="carousel-next"]')).toBeInTheDocument();
    expect(getByText("Previous slide")).toHaveClass("sr-only");
    expect(getByText("Next slide")).toHaveClass("sr-only");
  });

  it("merges className on root", () => {
    const { container } = render(
      <Carousel className="custom-class">
        <CarouselContent>
          <CarouselItem>One</CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    expect(container.querySelector('[data-slot="carousel"]')?.className).toContain("custom-class");
  });
});
