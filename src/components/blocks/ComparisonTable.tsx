import { CheckIcon, XIcon } from "lucide-react";
import type * as React from "react";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/elements/Table";
import { Container } from "@/components/layouts/Container";
import { Stack } from "@/components/layouts/Stack";
import { cn } from "@/lib/utils";

interface ComparisonColumn {
  /** Column header label (typically a plan name) */
  label: string;
  /** Highlight this column with a subtle background tint and ring */
  featured?: boolean;
}

interface ComparisonRow {
  /** Feature/row label rendered as the row header (th scope="row") in the first column */
  feature: string;
  /** Cell values aligned to `columns`. Booleans render as a Check/X icon with an aria-label; strings render as plain text; ReactNodes render verbatim */
  values: (boolean | string | React.ReactNode)[];
}

interface ComparisonTableProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Plan / option columns (in order). The first <th> is reserved for the feature label */
  columns: ComparisonColumn[];
  /** Feature rows; each row's `values` must have the same length as `columns` */
  rows: ComparisonRow[];
  /** Optional `<TableCaption>` text */
  caption?: string;
  /** Headline + lead rendered above the table */
  children?: React.ReactNode;
}

function renderValue(value: boolean | string | React.ReactNode): React.ReactNode {
  if (value === true) {
    return <CheckIcon aria-label="Yes" className="mx-auto size-5 text-primary" />;
  }
  if (value === false) {
    return <XIcon aria-label="No" className="mx-auto size-5 text-muted-foreground" />;
  }
  return value;
}

function ComparisonTable({
  columns,
  rows,
  caption,
  className,
  children,
  ...props
}: ComparisonTableProps) {
  return (
    <Container data-slot="comparison-table" className={cn(className)} {...props}>
      <Stack gap="lg">
        {children}
        <Table>
          {caption ? <TableCaption>{caption}</TableCaption> : null}
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="w-[40%]">
                Feature
              </TableHead>
              {columns.map((col) => (
                <TableHead
                  key={col.label}
                  scope="col"
                  data-featured={col.featured || undefined}
                  className={cn("text-center", col.featured && "bg-primary/10")}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.feature}>
                <TableHead scope="row" className="text-foreground">
                  {row.feature}
                </TableHead>
                {row.values.map((value, i) => {
                  const col = columns[i];
                  return (
                    <TableCell
                      key={col?.label ?? i}
                      data-featured={col?.featured || undefined}
                      className={cn("text-center", col?.featured && "bg-primary/5")}>
                      {renderValue(value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Container>
  );
}

export { type ComparisonColumn, type ComparisonRow, ComparisonTable, type ComparisonTableProps };
