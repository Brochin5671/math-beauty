import type * as React from "react";

import { Card, CardContent } from "@/components/elements/Card";
import { Grid } from "@/components/layouts/Grid";
import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Asymmetric grid container for bento-style layouts. Composes the Grid
 * primitive, so it inherits w-full, the shared gap scale, and responsive
 * tracks. Pairs with BentoCell for individual items with col-span/row-span
 * control. Stacks to a single column on mobile; the cols track count
 * activates at the md breakpoint
 */
interface BentoGridProps extends React.ComponentProps<"div"> {
  /** Desktop track count; the grid stacks to one column on small screens */
  cols?: 2 | 3 | 4;
  /** Gap between cells */
  gap?: "sm" | "default" | "lg";
}

function BentoGrid({ cols = 3, gap = "default", className, ...props }: BentoGridProps) {
  return (
    <Grid
      data-slot="bento-grid"
      cols={{ base: 1, md: cols }}
      gap={gap}
      className={className}
      {...props}
    />
  );
}

/*
 * Individual cell inside a BentoGrid. Composes Card for the surface
 * (ring + shadow, content padded via CardContent) and adds the col/row
 * spans, which apply at md+ (where the grid is multi-track); on mobile
 * everything is single-column. Declares a named container (bento-cell) so
 * slot content can respond to the cell's own width via Tailwind @container
 * queries (@sm/bento-cell:, etc)
 */
const bentoCellVariants = cva("@container/bento-cell", {
  defaultVariants: {
    colSpan: 1,
    rowSpan: 1,
  },
  variants: {
    colSpan: {
      1: "",
      2: "md:col-span-2",
      3: "md:col-span-3",
      4: "md:col-span-4",
    },
    rowSpan: {
      1: "",
      2: "md:row-span-2",
    },
  },
});

interface BentoCellProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof bentoCellVariants> {}

function BentoCell({ colSpan = 1, rowSpan = 1, className, children, ...props }: BentoCellProps) {
  return (
    <Card
      data-slot="bento-cell"
      className={cn(bentoCellVariants({ colSpan, rowSpan }), className)}
      {...props}>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export { BentoCell, type BentoCellProps, BentoGrid, type BentoGridProps, bentoCellVariants };
