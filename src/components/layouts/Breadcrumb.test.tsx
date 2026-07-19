import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./Breadcrumb";

function fixture() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Getting Started</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

describe("Breadcrumb", () => {
  it("renders a labelled navigation landmark", () => {
    render(fixture());
    const nav = screen.getByRole("navigation", { name: "breadcrumb" });
    expect(nav).toHaveAttribute("data-slot", "breadcrumb");
  });

  it("renders intermediate links with their href", () => {
    render(fixture());
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
  });

  it("marks the current page with aria-current=page", () => {
    render(fixture());
    const page = screen.getByText("Getting Started");
    expect(page).toHaveAttribute("data-slot", "breadcrumb-page");
    expect(page).toHaveAttribute("aria-current", "page");
  });

  it("renders separators hidden from assistive tech", () => {
    const { container } = render(fixture());
    expect(container.querySelector('[data-slot="breadcrumb-separator"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
