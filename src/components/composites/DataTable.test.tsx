import type { ColumnDef } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataTable } from "./DataTable";

// DataTable owns a @tanstack/react-table instance internally. These tests cover
// our wiring (columns -> headers, data -> rows, empty/filter/caption/pagination),
// not the library's sorting/filtering internals (fed real columns + data)
type Person = { name: string; role: string };

const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
];

const data: Person[] = [
  { name: "Ada", role: "Engineer" },
  { name: "Linus", role: "Maintainer" },
];

describe("DataTable", () => {
  it("renders a header per column and a cell per datum", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Role" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Ada" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Maintainer" })).toBeInTheDocument();
  });

  it("renders the empty state when data is empty", () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("forces the empty state when showEmpty is set despite having data", () => {
    render(<DataTable columns={columns} data={data} showEmpty />);
    expect(screen.getByText("No results.")).toBeInTheDocument();
  });

  it("renders the filter input only when filterColumnId is provided", () => {
    const { rerender } = render(<DataTable columns={columns} data={data} />);
    expect(screen.queryByPlaceholderText("Filter...")).toBeNull();
    rerender(
      <DataTable
        columns={columns}
        data={data}
        filterColumnId="name"
        filterPlaceholder="Filter names"
      />,
    );
    expect(screen.getByPlaceholderText("Filter names")).toBeInTheDocument();
  });

  it("renders the caption when provided", () => {
    render(<DataTable columns={columns} data={data} caption="Team roster" />);
    expect(screen.getByText("Team roster")).toBeInTheDocument();
  });

  it("disables Previous on the first page", () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });
});
