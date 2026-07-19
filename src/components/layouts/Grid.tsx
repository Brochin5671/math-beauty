import type * as React from "react";

import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Grid lays out children into columns: fixed (`cols={3}`), responsive
 * (`cols={{ base: 1, md: 2, lg: 3 }}`), or intrinsic (`minColWidth`). Pair
 * with GridItem for a 12-column span system. For asymmetric "bento" cards
 * reach for BentoGrid/BentoCell instead; GridItem is the general, unstyled
 * placement primitive.
 *
 * Responsive values resolve through the static lookup maps below so every
 * class is a literal the Tailwind scanner can see. The one dynamic value,
 * `minColWidth`, is applied via inline style, never a class
 */

/** A static value, or a per-breakpoint responsive object (mobile-first). */
export type ResponsiveValue<T> = T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T };

const BREAKPOINTS = ["base", "sm", "md", "lg", "xl"] as const;
type Breakpoint = (typeof BREAKPOINTS)[number];

type ColMap = Record<Breakpoint, Record<number, string>>;
type SpanMap = Record<Breakpoint, Record<number, string> & { full: string }>;

// Column tracks keyed to the viewport; `base` is unprefixed
const COLS_VIEWPORT: ColMap = {
  base: {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
    8: "grid-cols-8",
    9: "grid-cols-9",
    10: "grid-cols-10",
    11: "grid-cols-11",
    12: "grid-cols-12",
  },
  sm: {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    5: "sm:grid-cols-5",
    6: "sm:grid-cols-6",
    7: "sm:grid-cols-7",
    8: "sm:grid-cols-8",
    9: "sm:grid-cols-9",
    10: "sm:grid-cols-10",
    11: "sm:grid-cols-11",
    12: "sm:grid-cols-12",
  },
  md: {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
    7: "md:grid-cols-7",
    8: "md:grid-cols-8",
    9: "md:grid-cols-9",
    10: "md:grid-cols-10",
    11: "md:grid-cols-11",
    12: "md:grid-cols-12",
  },
  lg: {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
    7: "lg:grid-cols-7",
    8: "lg:grid-cols-8",
    9: "lg:grid-cols-9",
    10: "lg:grid-cols-10",
    11: "lg:grid-cols-11",
    12: "lg:grid-cols-12",
  },
  xl: {
    1: "xl:grid-cols-1",
    2: "xl:grid-cols-2",
    3: "xl:grid-cols-3",
    4: "xl:grid-cols-4",
    5: "xl:grid-cols-5",
    6: "xl:grid-cols-6",
    7: "xl:grid-cols-7",
    8: "xl:grid-cols-8",
    9: "xl:grid-cols-9",
    10: "xl:grid-cols-10",
    11: "xl:grid-cols-11",
    12: "xl:grid-cols-12",
  },
};

// Column tracks keyed to the grid's own width (container queries)
const COLS_CONTAINER: ColMap = {
  base: {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    7: "grid-cols-7",
    8: "grid-cols-8",
    9: "grid-cols-9",
    10: "grid-cols-10",
    11: "grid-cols-11",
    12: "grid-cols-12",
  },
  sm: {
    1: "@sm:grid-cols-1",
    2: "@sm:grid-cols-2",
    3: "@sm:grid-cols-3",
    4: "@sm:grid-cols-4",
    5: "@sm:grid-cols-5",
    6: "@sm:grid-cols-6",
    7: "@sm:grid-cols-7",
    8: "@sm:grid-cols-8",
    9: "@sm:grid-cols-9",
    10: "@sm:grid-cols-10",
    11: "@sm:grid-cols-11",
    12: "@sm:grid-cols-12",
  },
  md: {
    1: "@md:grid-cols-1",
    2: "@md:grid-cols-2",
    3: "@md:grid-cols-3",
    4: "@md:grid-cols-4",
    5: "@md:grid-cols-5",
    6: "@md:grid-cols-6",
    7: "@md:grid-cols-7",
    8: "@md:grid-cols-8",
    9: "@md:grid-cols-9",
    10: "@md:grid-cols-10",
    11: "@md:grid-cols-11",
    12: "@md:grid-cols-12",
  },
  lg: {
    1: "@lg:grid-cols-1",
    2: "@lg:grid-cols-2",
    3: "@lg:grid-cols-3",
    4: "@lg:grid-cols-4",
    5: "@lg:grid-cols-5",
    6: "@lg:grid-cols-6",
    7: "@lg:grid-cols-7",
    8: "@lg:grid-cols-8",
    9: "@lg:grid-cols-9",
    10: "@lg:grid-cols-10",
    11: "@lg:grid-cols-11",
    12: "@lg:grid-cols-12",
  },
  xl: {
    1: "@xl:grid-cols-1",
    2: "@xl:grid-cols-2",
    3: "@xl:grid-cols-3",
    4: "@xl:grid-cols-4",
    5: "@xl:grid-cols-5",
    6: "@xl:grid-cols-6",
    7: "@xl:grid-cols-7",
    8: "@xl:grid-cols-8",
    9: "@xl:grid-cols-9",
    10: "@xl:grid-cols-10",
    11: "@xl:grid-cols-11",
    12: "@xl:grid-cols-12",
  },
};

// Column span for GridItem, keyed to the viewport; includes col-span-full
const SPAN_VIEWPORT: SpanMap = {
  base: {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6",
    7: "col-span-7",
    8: "col-span-8",
    9: "col-span-9",
    10: "col-span-10",
    11: "col-span-11",
    12: "col-span-12",
    full: "col-span-full",
  },
  sm: {
    1: "sm:col-span-1",
    2: "sm:col-span-2",
    3: "sm:col-span-3",
    4: "sm:col-span-4",
    5: "sm:col-span-5",
    6: "sm:col-span-6",
    7: "sm:col-span-7",
    8: "sm:col-span-8",
    9: "sm:col-span-9",
    10: "sm:col-span-10",
    11: "sm:col-span-11",
    12: "sm:col-span-12",
    full: "sm:col-span-full",
  },
  md: {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
    5: "md:col-span-5",
    6: "md:col-span-6",
    7: "md:col-span-7",
    8: "md:col-span-8",
    9: "md:col-span-9",
    10: "md:col-span-10",
    11: "md:col-span-11",
    12: "md:col-span-12",
    full: "md:col-span-full",
  },
  lg: {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
    7: "lg:col-span-7",
    8: "lg:col-span-8",
    9: "lg:col-span-9",
    10: "lg:col-span-10",
    11: "lg:col-span-11",
    12: "lg:col-span-12",
    full: "lg:col-span-full",
  },
  xl: {
    1: "xl:col-span-1",
    2: "xl:col-span-2",
    3: "xl:col-span-3",
    4: "xl:col-span-4",
    5: "xl:col-span-5",
    6: "xl:col-span-6",
    7: "xl:col-span-7",
    8: "xl:col-span-8",
    9: "xl:col-span-9",
    10: "xl:col-span-10",
    11: "xl:col-span-11",
    12: "xl:col-span-12",
    full: "xl:col-span-full",
  },
};

// Column span for GridItem, keyed to the grid's own width
const SPAN_CONTAINER: SpanMap = {
  base: {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6",
    7: "col-span-7",
    8: "col-span-8",
    9: "col-span-9",
    10: "col-span-10",
    11: "col-span-11",
    12: "col-span-12",
    full: "col-span-full",
  },
  sm: {
    1: "@sm:col-span-1",
    2: "@sm:col-span-2",
    3: "@sm:col-span-3",
    4: "@sm:col-span-4",
    5: "@sm:col-span-5",
    6: "@sm:col-span-6",
    7: "@sm:col-span-7",
    8: "@sm:col-span-8",
    9: "@sm:col-span-9",
    10: "@sm:col-span-10",
    11: "@sm:col-span-11",
    12: "@sm:col-span-12",
    full: "@sm:col-span-full",
  },
  md: {
    1: "@md:col-span-1",
    2: "@md:col-span-2",
    3: "@md:col-span-3",
    4: "@md:col-span-4",
    5: "@md:col-span-5",
    6: "@md:col-span-6",
    7: "@md:col-span-7",
    8: "@md:col-span-8",
    9: "@md:col-span-9",
    10: "@md:col-span-10",
    11: "@md:col-span-11",
    12: "@md:col-span-12",
    full: "@md:col-span-full",
  },
  lg: {
    1: "@lg:col-span-1",
    2: "@lg:col-span-2",
    3: "@lg:col-span-3",
    4: "@lg:col-span-4",
    5: "@lg:col-span-5",
    6: "@lg:col-span-6",
    7: "@lg:col-span-7",
    8: "@lg:col-span-8",
    9: "@lg:col-span-9",
    10: "@lg:col-span-10",
    11: "@lg:col-span-11",
    12: "@lg:col-span-12",
    full: "@lg:col-span-full",
  },
  xl: {
    1: "@xl:col-span-1",
    2: "@xl:col-span-2",
    3: "@xl:col-span-3",
    4: "@xl:col-span-4",
    5: "@xl:col-span-5",
    6: "@xl:col-span-6",
    7: "@xl:col-span-7",
    8: "@xl:col-span-8",
    9: "@xl:col-span-9",
    10: "@xl:col-span-10",
    11: "@xl:col-span-11",
    12: "@xl:col-span-12",
    full: "@xl:col-span-full",
  },
};

const ROW_SPAN: Record<number, string> = {
  1: "row-span-1",
  2: "row-span-2",
  3: "row-span-3",
  4: "row-span-4",
  5: "row-span-5",
  6: "row-span-6",
};

type GapScale = "none" | "xs" | "sm" | "default" | "lg" | "xl" | "2xl";

// Per-axis gap overrides; same scale as the `gap` CVA axis, applied only when set
const GAP_X: Record<GapScale, string> = {
  none: "gap-x-0",
  xs: "gap-x-2",
  sm: "gap-x-3",
  default: "gap-x-4",
  lg: "gap-x-6",
  xl: "gap-x-8",
  "2xl": "gap-x-12",
};
const GAP_Y: Record<GapScale, string> = {
  none: "gap-y-0",
  xs: "gap-y-2",
  sm: "gap-y-3",
  default: "gap-y-4",
  lg: "gap-y-6",
  xl: "gap-y-8",
  "2xl": "gap-y-12",
};

function clampInt(n: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(n), min), max);
}

/** Number/string => `{ base: value }`; object passes through unchanged. */
function toResponsive<T>(
  value: T | Partial<Record<Breakpoint, T>>,
): Partial<Record<Breakpoint, T>> {
  return typeof value === "object" && value !== null
    ? (value as Partial<Record<Breakpoint, T>>)
    : { base: value as T };
}

function resolveCols(cols: ResponsiveValue<number>, container: boolean): string {
  const map = container ? COLS_CONTAINER : COLS_VIEWPORT;
  const responsive = toResponsive(cols);
  const out: string[] = [];
  for (const bp of BREAKPOINTS) {
    const value = responsive[bp];
    if (value == null) continue;
    const cls = map[bp][clampInt(value, 1, 12)];
    if (cls) out.push(cls);
  }
  return out.join(" ");
}

function resolveSpan(span: ResponsiveValue<number | "full">, container: boolean): string {
  const map = container ? SPAN_CONTAINER : SPAN_VIEWPORT;
  const responsive = toResponsive(span);
  const out: string[] = [];
  for (const bp of BREAKPOINTS) {
    const value = responsive[bp];
    if (value == null) continue;
    const cls = value === "full" ? map[bp].full : map[bp][clampInt(value, 1, 12)];
    if (cls) out.push(cls);
  }
  return out.join(" ");
}

// Only the finite, enumerable axes live in CVA so the playground can
// introspect them. Each axis lists its real default FIRST (the variant
// picker pre-selects the first value). `cols`, `minColWidth`, `container`,
// `gapX`, and `gapY` resolve outside CVA
const gridVariants = cva("grid w-full", {
  variants: {
    gap: {
      none: "gap-0",
      xs: "gap-2",
      sm: "gap-3",
      default: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
      "2xl": "gap-12",
    },
    flow: {
      row: "grid-flow-row",
      col: "grid-flow-col",
      dense: "grid-flow-dense",
      "row-dense": "grid-flow-row-dense",
    },
    align: {
      stretch: "items-stretch",
      start: "items-start",
      center: "items-center",
      end: "items-end",
    },
    justify: {
      stretch: "justify-items-stretch",
      start: "justify-items-start",
      center: "justify-items-center",
      end: "justify-items-end",
    },
  },
  defaultVariants: {
    gap: "default",
    flow: "row",
    align: "stretch",
    justify: "stretch",
  },
});

interface GridProps
  extends Omit<React.ComponentProps<"div">, "cols">,
    VariantProps<typeof gridVariants> {
  /**
   * Column tracks. A plain number is a FIXED count at every width
   * (`cols={3}` is exactly 3 tracks). Pass a responsive object for a
   * mobile-first cascade (`cols={{ base: 1, md: 2, lg: 3 }}`). Bounded 1-12.
   * Ignored when `minColWidth` is set. Default 3.
   */
  cols?: ResponsiveValue<number>;
  /**
   * Intrinsic columns: each track is at least `minColWidth` wide, filling the
   * row with as many equal tracks as fit. Any CSS length ("14rem"). Applied
   * via inline style and overrides `cols`.
   */
  minColWidth?: string;
  /** Track-fill mode when `minColWidth` is set. Default "auto-fit". */
  fill?: "auto-fit" | "auto-fill";
  /**
   * Resolve the responsive `cols` breakpoints against this grid's OWN width
   * (container queries) instead of the viewport. Default false. No effect in
   * intrinsic (`minColWidth`) mode.
   */
  container?: boolean;
  /** Column-axis gap override; wins over `gap` horizontally. */
  gapX?: GapScale;
  /** Row-axis gap override; wins over `gap` vertically. */
  gapY?: GapScale;
}

function Grid({
  className,
  style,
  cols = 3,
  minColWidth,
  fill = "auto-fit",
  container = false,
  gap = "default",
  gapX,
  gapY,
  flow = "row",
  align = "stretch",
  justify = "stretch",
  children,
  ...props
}: GridProps) {
  const intrinsic = minColWidth != null && minColWidth !== "";
  const colClasses = intrinsic ? undefined : resolveCols(cols, container);
  const gridStyle = intrinsic
    ? { ...style, gridTemplateColumns: `repeat(${fill}, minmax(${minColWidth}, 1fr))` }
    : style;

  const grid = (
    <div
      data-slot="grid"
      className={cn(
        gridVariants({ gap, flow, align, justify }),
        colClasses,
        gapX != null && GAP_X[gapX],
        gapY != null && GAP_Y[gapY],
        className,
      )}
      style={gridStyle}
      {...props}>
      {children}
    </div>
  );

  // Container mode needs a containment ancestor: container queries apply to a
  // container's descendants, not the element itself, so the grid's own
  // `@sm:grid-cols-*` must read a wrapper, not the grid. The grid is w-full,
  // so the wrapper's width equals the grid's width
  if (container && !intrinsic) {
    return (
      <div data-slot="grid-container" className="@container">
        {grid}
      </div>
    );
  }
  return grid;
}

interface GridItemProps extends React.ComponentProps<"div"> {
  /** Column span. Number, responsive object, or "full". Bounded 1-12. */
  span?: ResponsiveValue<number | "full">;
  /** Row span. Plain number, bounded 1-6. */
  rowSpan?: number;
  /** Resolve `span` against the grid's own width (container queries). */
  container?: boolean;
}

function GridItem({ className, span, rowSpan, container = false, ...props }: GridItemProps) {
  return (
    <div
      data-slot="grid-item"
      className={cn(
        span != null && resolveSpan(span, container),
        rowSpan != null && ROW_SPAN[clampInt(rowSpan, 1, 6)],
        className,
      )}
      {...props}
    />
  );
}

export { Grid, GridItem, type GridItemProps, type GridProps, gridVariants };
