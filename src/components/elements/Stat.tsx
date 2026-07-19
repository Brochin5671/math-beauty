import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import type * as React from "react";

import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Single metric tile: a large value paired with a small label, with an
 * optional trend delta (up / down / flat) for dashboard usage. Composes
 * inside the Stats block but also stands alone as a primitive
 */
const statVariants = cva("text-center", {
  variants: {
    size: {
      sm: "[&_[data-slot=stat-value]]:text-2xl",
      default: "[&_[data-slot=stat-value]]:text-4xl",
      lg: "[&_[data-slot=stat-value]]:text-6xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface StatTrend {
  /** Direction of the change. `up` is success-tinted, `down` destructive-tinted, `flat` muted */
  direction: "up" | "down" | "flat";
  /** Primary trend value (e.g. "+12%"). Strings get default styling; ReactNodes render verbatim */
  value: React.ReactNode;
  /** Optional muted suffix (e.g. "vs last month") */
  label?: React.ReactNode;
}

interface StatProps
  extends Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof statVariants> {
  /** Large numeric value (e.g. "150+", "99.9%"). Strings get the default styled paragraph; pass a ReactNode for custom formatting */
  value?: React.ReactNode;
  /** Small descriptive label below the value. Strings get the default styled paragraph; pass a ReactNode for custom formatting */
  label?: React.ReactNode;
  /** Optional trend delta rendered below the label */
  trend?: StatTrend;
}

const TREND_ICON = {
  up: TrendingUpIcon,
  down: TrendingDownIcon,
  flat: MinusIcon,
} as const;

const TREND_COLOR = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
} as const;

function isPrimitiveString(node: React.ReactNode): node is string {
  return typeof node === "string";
}

function Stat({ value, label, size = "default", trend, className, ...props }: StatProps) {
  const TrendIcon = trend ? TREND_ICON[trend.direction] : null;
  return (
    <div
      data-slot="stat"
      data-size={size}
      className={cn(statVariants({ size }), className)}
      {...props}>
      {isPrimitiveString(value) ? (
        <p data-slot="stat-value" className="font-bold">
          {value}
        </p>
      ) : (
        value
      )}
      {isPrimitiveString(label) ? (
        <p data-slot="stat-label" className="text-sm text-muted-foreground">
          {label}
        </p>
      ) : (
        label
      )}
      {trend && TrendIcon ? (
        <div
          data-slot="stat-trend"
          data-direction={trend.direction}
          className={cn(
            "mt-1 flex items-center justify-center gap-1 text-sm",
            TREND_COLOR[trend.direction],
          )}>
          <TrendIcon className="size-4" aria-hidden="true" />
          <span>{trend.value}</span>
          {trend.label ? <span className="text-muted-foreground">{trend.label}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export { Stat, type StatProps, statVariants };
