import type * as React from "react";

import { cn, cva, type VariantProps } from "@/lib/utils";
import type { ResponsiveValue } from "./Grid";

/*
 * Stack arranges children in a row or column with controlled gap, alignment,
 * and wrapping, so you don't hand-write flex utilities on every parent
 *
 * `direction` resolves through the static DIRECTION map (not CVA) so every
 * responsive class is a literal the Tailwind scanner can see; the other axes
 * stay in CVA so they can be introspected at runtime
 */

const BREAKPOINTS = ["base", "sm", "md", "lg", "xl"] as const;
type Breakpoint = (typeof BREAKPOINTS)[number];
type Direction = "vertical" | "horizontal";

// Flex direction keyed to the viewport. `base` is unprefixed.
const DIRECTION: Record<Breakpoint, Record<Direction, string>> = {
  base: { vertical: "flex-col", horizontal: "flex-row" },
  sm: { vertical: "sm:flex-col", horizontal: "sm:flex-row" },
  md: { vertical: "md:flex-col", horizontal: "md:flex-row" },
  lg: { vertical: "lg:flex-col", horizontal: "lg:flex-row" },
  xl: { vertical: "xl:flex-col", horizontal: "xl:flex-row" },
};

function resolveDirection(direction: ResponsiveValue<Direction>): string {
  const responsive: Partial<Record<Breakpoint, Direction>> =
    typeof direction === "object" && direction !== null ? direction : { base: direction };
  // Column-first: always emit a base class, defaulting to vertical when a
  // responsive object omits `base`, so the stack collapses on small screens
  const out: string[] = [DIRECTION.base[responsive.base ?? "vertical"]];
  for (const bp of BREAKPOINTS) {
    if (bp === "base") continue;
    const value = responsive[bp];
    if (value == null) continue;
    out.push(DIRECTION[bp][value]);
  }
  return out.join(" ");
}

const stackVariants = cva("flex", {
  variants: {
    gap: {
      /** No gap between children */
      none: "gap-0",
      /** Tight spacing, 8px */
      xs: "gap-2",
      /** Compact spacing, 12px */
      sm: "gap-3",
      /** Default spacing, 16px */
      default: "gap-4",
      /** Comfortable spacing, 24px */
      lg: "gap-6",
      /** Spacious, 32px */
      xl: "gap-8",
      /** Generous, 48px */
      "2xl": "gap-12",
    },
    align: {
      /** Stretch children to fill the cross axis (default) */
      stretch: "items-stretch",
      /** Align to the start of the cross axis (top for row, left for column) */
      start: "items-start",
      /** Center on the cross axis. Uses `safe` so overflowing content falls back to start instead of clipping */
      center: "items-center-safe",
      /** Align to the end of the cross axis */
      end: "items-end",
      /** Align to the text baseline (useful for mixed-size inline content) */
      baseline: "items-baseline",
    },
    justify: {
      /** Pack children at the start of the main axis (default) */
      start: "justify-start",
      /** Center on the main axis. Uses `safe` so overflowing content falls back to start instead of clipping */
      center: "justify-center-safe",
      /** Pack at the end of the main axis */
      end: "justify-end",
      /** Distribute with equal space between */
      between: "justify-between",
      /** Distribute with equal space around each child */
      around: "justify-around",
      /** Distribute with equal space between and at the edges */
      evenly: "justify-evenly",
    },
    wrap: {
      false: "flex-nowrap",
      true: "flex-wrap",
    },
  },
  defaultVariants: {
    gap: "default",
    align: "stretch",
    justify: "start",
    wrap: false,
  },
});

interface StackProps extends React.ComponentProps<"div">, VariantProps<typeof stackVariants> {
  /**
   * Layout axis. "vertical" stacks children in a column (default),
   * "horizontal" in a row. Pass a mobile-first object for a responsive switch
   * (`direction={{ base: "vertical", md: "horizontal" }}`); an object that
   * omits `base` still starts vertical so the stack collapses on small screens
   */
  direction?: ResponsiveValue<Direction>;
}

function Stack({
  className,
  direction = "vertical",
  gap = "default",
  align = "stretch",
  justify = "start",
  wrap = false,
  ...props
}: StackProps) {
  return (
    <div
      data-slot="stack"
      className={cn(
        stackVariants({ gap, align, justify, wrap }),
        resolveDirection(direction),
        className,
      )}
      {...props}
    />
  );
}

export { Stack, type StackProps, stackVariants };
