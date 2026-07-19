import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";

describe("Table", () => {
  it("renders the compound shape with correct data-slot attributes", () => {
    const { container } = render(
      <Table>
        <TableCaption>caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>row 1</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>footer</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    expect(container.querySelector('[data-slot="table-container"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="table"]')?.tagName).toBe("TABLE");
    expect(container.querySelector('[data-slot="table-caption"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="table-header"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="table-body"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="table-footer"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="table-row"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="table-head"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="table-cell"]')).not.toBeNull();
  });

  it("wraps the table in an overflow-x-auto container", () => {
    const { container } = render(<Table />);
    expect(container.querySelector('[data-slot="table-container"]')).toHaveClass("overflow-x-auto");
  });

  it("merges consumer className on the <table>", () => {
    const { container } = render(<Table className="my-extra" />);
    expect(container.querySelector('[data-slot="table"]')).toHaveClass("my-extra");
  });
});
