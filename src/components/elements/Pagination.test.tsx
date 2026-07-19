import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./Pagination";

describe("Pagination", () => {
  it("renders a <nav> with data-slot + aria-label", () => {
    const { container } = render(<Pagination />);
    const nav = container.querySelector("nav");
    expect(nav).toHaveAttribute("data-slot", "pagination");
    expect(nav).toHaveAttribute("aria-label", "pagination");
  });

  it("PaginationContent renders <ul> with data-slot", () => {
    const { container } = render(<PaginationContent />);
    const ul = container.querySelector("ul");
    expect(ul).toHaveAttribute("data-slot", "pagination-content");
  });

  it("PaginationLink isActive sets aria-current=page", () => {
    const { container } = render(<PaginationLink href="#" isActive />);
    const anchor = container.querySelector("a");
    expect(anchor).toHaveAttribute("aria-current", "page");
    expect(anchor).toHaveAttribute("data-active", "true");
  });

  it("PaginationPrevious renders text + chevron with aria-label", () => {
    const { container, getByText } = render(<PaginationPrevious href="#" />);
    expect(getByText("Previous")).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Go to previous page"]')).not.toBeNull();
  });

  it("PaginationNext renders text + chevron with aria-label", () => {
    const { container, getByText } = render(<PaginationNext href="#" />);
    expect(getByText("Next")).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Go to next page"]')).not.toBeNull();
  });

  it("PaginationEllipsis renders sr-only label", () => {
    const { getByText } = render(<PaginationEllipsis />);
    expect(getByText("More pages")).toHaveClass("sr-only");
  });

  it("PaginationItem renders <li>", () => {
    const { container } = render(<PaginationItem />);
    expect(container.querySelector("li")).toHaveAttribute("data-slot", "pagination-item");
  });
});
