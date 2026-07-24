import type * as React from "react";

import { cn, cva, type VariantProps } from "@/lib/utils";

const tableVariants = cva("relative w-full overflow-x-auto", {
  variants: {
    variant: {
      /** Horizontal divider between rows, the standard HTML look (default) */
      horizontal: "",
      /** No dividers between body rows, minimalist */
      free: "[&_tbody_tr]:border-0",
      /** Both horizontal and vertical lines forming a full grid */
      grid: "[&_th:not(:last-child)]:border-r [&_td:not(:last-child)]:border-r",
      /** Alternating row backgrounds, no horizontal dividers */
      zebra: "[&_tbody_tr]:border-0 [&_tbody_tr:nth-child(even)]:bg-muted/50",
      /** Horizontal dividers plus a rounded card-style outer border, used by DataTable */
      bordered: "rounded-md border",
    },
    size: {
      /** Standard row heights (default) */
      default: "",
      /** Tight row heights and cell padding for dense data */
      condensed: "[&_th]:h-8 [&_td]:px-2 [&_td]:py-1",
      /** Generous row heights and cell padding for editorial / readable layouts */
      relaxed: "[&_th]:h-14 [&_td]:px-4 [&_td]:py-3",
    },
  },
  defaultVariants: {
    variant: "horizontal",
    size: "default",
  },
});

interface TableProps extends React.ComponentProps<"table">, VariantProps<typeof tableVariants> {
  /** Pin the header to the top of the scroll container; pair with a height-constraining containerClassName so the wrapper actually scrolls vertically */
  stickyHeader?: boolean;
  /** Pin the first column to the left during horizontal scroll, useful for wide tables */
  stickyFirstColumn?: boolean;
  /** className applied to the scroll-container wrapper (use this for max-height, etc.). The component's own className stays on the inner <table> */
  containerClassName?: string;
}

function Table({
  className,
  containerClassName,
  variant,
  size,
  stickyHeader,
  stickyFirstColumn,
  ...props
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      data-variant={variant ?? "horizontal"}
      data-size={size ?? "default"}
      data-sticky-header={stickyHeader || undefined}
      data-sticky-first-column={stickyFirstColumn || undefined}
      className={cn(
        tableVariants({ variant, size }),
        stickyHeader &&
          "overflow-y-auto [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-20 [&_thead]:bg-background",
        stickyFirstColumn &&
          "[&_th:first-child]:sticky [&_th:first-child]:left-0 [&_th:first-child]:z-10 [&_th:first-child]:bg-background [&_td:first-child]:sticky [&_td:first-child]:left-0 [&_td:first-child]:z-10 [&_td:first-child]:bg-background",
        containerClassName,
      )}>
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 in-data-[state=hover]:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

type CellAlign = "left" | "center" | "right";

const alignClass: Record<CellAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

interface TableHeadProps extends React.ComponentProps<"th"> {
  /** Text alignment within the cell. Defaults to left (or right when numeric is true) */
  alignment?: CellAlign;
  /** Right-align text and use tabular-nums for digit-aligned numeric columns; alignment overrides if both are set */
  numeric?: boolean;
}

function TableHead({ className, alignment, numeric, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      data-alignment={alignment ?? (numeric ? "right" : undefined)}
      data-numeric={numeric || undefined}
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        numeric && "tabular-nums",
        alignClass[alignment ?? (numeric ? "right" : "left")],
        className,
      )}
      {...props}
    />
  );
}

interface TableCellProps extends React.ComponentProps<"td"> {
  /** Text alignment within the cell. Defaults to left (or right when numeric is true) */
  alignment?: CellAlign;
  /** Right-align text and use tabular-nums for digit-aligned numeric columns; alignment overrides if both are set */
  numeric?: boolean;
}

function TableCell({ className, alignment, numeric, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      data-alignment={alignment ?? (numeric ? "right" : undefined)}
      data-numeric={numeric || undefined}
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        numeric && "tabular-nums",
        alignClass[alignment ?? (numeric ? "right" : "left")],
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

interface TableEmptyProps extends React.ComponentProps<"td"> {
  /** Column span for the empty-state row; should match the table's visible-column count */
  colSpan: number;
}

/** Empty-state row helper. Renders a centered, fixed-height row that spans every visible column */
function TableEmpty({ className, colSpan, children, ...props }: TableEmptyProps) {
  return (
    <TableRow data-slot="table-empty">
      <TableCell
        colSpan={colSpan}
        className={cn("h-24 text-center text-muted-foreground", className)}
        {...props}>
        {children}
      </TableCell>
    </TableRow>
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  tableVariants,
};
