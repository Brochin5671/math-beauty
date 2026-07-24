"use client";

import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type Table as TanstackTable,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  EyeOffIcon,
  Settings2Icon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/elements/Button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/elements/DropdownMenu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/elements/Table";
import { Input } from "@/components/forms/Input";
import { Select, SelectOption } from "@/components/forms/Select";
import { cn } from "@/lib/utils";

type TableForwardProps = React.ComponentProps<typeof Table>;

interface DataTableProps<TData, TValue> {
  /** Column definitions describing how to render headers, cells, and optional footers */
  columns: ColumnDef<TData, TValue>[];
  /** Row data; TanStack typing flows through so accessors check against this shape */
  data: TData[];
  /** Column id to filter via the toolbar Input; omit to hide the input */
  filterColumnId?: string;
  /** Placeholder text for the filter Input */
  filterPlaceholder?: string;
  /** Accessible description rendered inside <caption> */
  caption?: React.ReactNode;
  /** Forwarded to the inner Table; defaults to `bordered` for the card-style look */
  variant?: TableForwardProps["variant"];
  /** Forwarded to the inner Table; controls row-height density */
  size?: TableForwardProps["size"];
  /** Forwarded to the inner Table; pins the header during vertical scroll */
  stickyHeader?: boolean;
  /** Forwarded to the inner Table; pins the first column during horizontal scroll */
  stickyFirstColumn?: boolean;
  /** Forwarded to the inner Table; className for the scroll wrapper */
  containerClassName?: string;
  /** className for the outer wrapper */
  className?: string;
  /** Render the TableFooter; defaults to auto-detect (any column with `footer` defined opts in) */
  showFooter?: boolean;
  /** Force the empty-state row even when data has rows; defaults to auto-detect (empty when data has no rows) */
  showEmpty?: boolean;
}

/**
 * Monolithic DataTable: takes columns + data, owns the TanStack table instance
 * internally, renders a toolbar (filter Input + column-visibility dropdown), the
 * table itself, and Prev/Next pagination. Mirrors shadcn's docs example
 *
 * For richer pagination (page-size selector, first/last buttons) or a different
 * column-visibility UI, compose with the DataTablePagination + DataTableViewOptions
 * exports against your own useReactTable instance instead of using this wrapper
 */
function DataTable<TData, TValue>({
  columns,
  data,
  filterColumnId,
  filterPlaceholder = "Filter...",
  caption,
  variant = "bordered",
  size,
  stickyHeader,
  stickyFirstColumn,
  containerClassName,
  className,
  showFooter,
  showEmpty,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div data-slot="data-table" className={className}>
      <div className="flex items-center py-4">
        {filterColumnId ? (
          <Input
            placeholder={filterPlaceholder}
            value={(table.getColumn(filterColumnId)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(filterColumnId)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table
        variant={variant}
        size={size}
        stickyHeader={stickyHeader}
        stickyFirstColumn={stickyFirstColumn}
        containerClassName={containerClassName}>
        {caption ? <TableCaption>{caption}</TableCaption> : null}
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {showEmpty || table.getRowModel().rows.length === 0 ? (
            <TableEmpty colSpan={columns.length}>No results.</TableEmpty>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
        {(showFooter ?? columns.some((col) => col.footer !== undefined)) ? (
          <TableFooter>
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <TableCell key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.footer, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        ) : null}
      </Table>
      <div className="flex items-center justify-end gap-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="sm" className="-ml-3 h-8 data-open:bg-muted">
              <span>{title}</span>
              {column.getIsSorted() === "desc" ? (
                <ArrowDownIcon />
              ) : column.getIsSorted() === "asc" ? (
                <ArrowUpIcon />
              ) : (
                <ChevronsUpDownIcon />
              )}
            </Button>
          }
        />
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOffIcon />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface DataTablePaginationProps<TData> {
  table: TanstackTable<TData>;
}

function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            size="sm"
            value={`${table.getState().pagination.pageSize}`}
            onChange={(event) => table.setPageSize(Number(event.target.value))}>
            {[10, 20, 25, 30, 40, 50].map((pageSize) => (
              <SelectOption key={pageSize} value={pageSize}>
                {pageSize}
              </SelectOption>
            ))}
          </Select>
        </div>
        <div className="flex w-25 items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">Go to first page</span>
            <ChevronsLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="size-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}>
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="size-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}>
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="hidden size-8 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}>
            <span className="sr-only">Go to last page</span>
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DataTableViewOptions<TData>({ table }: { table: TanstackTable<TData> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
            <Settings2Icon />
            View
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-37.5">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}>
              {column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  type DataTableProps,
  DataTableViewOptions,
};
