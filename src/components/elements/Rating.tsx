"use client";

import { Heart, Star } from "lucide-react";
import { type ComponentProps, type KeyboardEvent, useRef, useState } from "react";

import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Rating: a score shown as icons, read-only or interactive
 *
 * - Read-only (default): pass `value` (fractional allowed, e.g. 4.5) for averaged
 *   scores on testimonial cards or product badges. Renders role="img" with an
 *   accessible label; each icon clips a filled overlay to its fraction
 * - Interactive: set `readOnly={false}` and pass `onValueChange`. Renders a
 *   role="slider" over the icons (focusable, arrow-key navigable); click to set,
 *   hover to preview. `step` sets granularity (1 for whole icons, 0.5 for half)
 *   Supply `value` to control or `defaultValue` to leave it uncontrolled
 *
 * Filled icons use the primary token; empties are muted outlines. Override
 * either via className
 */
const ratingVariants = cva("inline-flex items-center text-primary", {
  variants: {
    size: {
      sm: "gap-0.5 [&_svg]:size-4",
      default: "gap-1 [&_svg]:size-5",
      lg: "gap-1 [&_svg]:size-6",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

const ICONS = { star: Star, heart: Heart } as const;
type RatingIcon = keyof typeof ICONS;

// Fill fraction for the icon at 1-based `index`: 0 empty, 1 full
function clampFraction(value: number, index: number): number {
  return Math.max(0, Math.min(1, value - (index - 1)));
}

// Snap a raw value to the nearest step within [step, max], killing float drift
function snap(value: number, step: number, max: number): number {
  const snapped = Math.round(value / step) * step;
  return Math.round(Math.min(max, Math.max(step, snapped)) * 100) / 100;
}

interface RatingProps
  extends Omit<ComponentProps<"div">, "onChange" | "defaultValue">,
    VariantProps<typeof ratingVariants> {
  /** Number of icons. Defaults to 5. */
  max?: number;
  /** Icon set. Defaults to star */
  icon?: RatingIcon;
  /** Read-only display (the default). Set false for an interactive input */
  readOnly?: boolean;
  /** Current score. Read-only allows fractional values */
  value?: number;
  /** Interactive only: uncontrolled initial value. Defaults to 0 (no selection) */
  defaultValue?: number;
  /** Interactive only: selection granularity. 1 for whole icons, 0.5 for half. Defaults to 1. */
  step?: number;
  /** Interactive only: fires with the chosen value */
  onValueChange?: (value: number) => void;
  /** Accessible name. Read-only derives one from the value when omitted */
  "aria-label"?: string;
}

function RatingIconPair({ icon, fraction }: { icon: RatingIcon; fraction: number }) {
  const Icon = ICONS[icon];
  return (
    <span className="relative inline-flex shrink-0">
      <Icon aria-hidden="true" className="fill-transparent text-muted-foreground" />
      {fraction > 0 ? (
        <span
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ width: `${fraction * 100}%` }}>
          <Icon aria-hidden="true" className="fill-current text-primary" />
        </span>
      ) : null}
    </span>
  );
}

function Rating({
  className,
  size,
  max = 5,
  icon = "star",
  readOnly = true,
  value,
  defaultValue,
  step,
  onValueChange,
  "aria-label": ariaLabel,
  ...props
}: RatingProps) {
  // Interactive-only props are destructured above so they never leak onto the
  // DOM via {...props} in the read-only branch
  if (!readOnly) {
    return (
      <RatingInteractive
        className={className}
        size={size}
        max={max}
        icon={icon}
        step={step ?? 1}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        aria-label={ariaLabel ?? "Rating"}
        {...props}
      />
    );
  }

  const current = value ?? 0;
  return (
    <div
      data-slot="rating"
      data-readonly=""
      role="img"
      aria-label={ariaLabel ?? `Rated ${current} out of ${max}`}
      className={cn(ratingVariants({ size }), className)}
      {...props}>
      {Array.from({ length: max }, (_, i) => (
        <RatingIconPair
          // index key is stable: rating positions are fixed and never reorder
          key={i}
          icon={icon}
          fraction={clampFraction(current, i + 1)}
        />
      ))}
    </div>
  );
}

interface RatingInteractiveProps
  extends Omit<ComponentProps<"div">, "onChange" | "defaultValue">,
    VariantProps<typeof ratingVariants> {
  max: number;
  icon: RatingIcon;
  step: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
}

function RatingInteractive({
  className,
  size,
  max,
  icon,
  step,
  value: controlled,
  defaultValue = 0,
  onValueChange,
  "aria-label": ariaLabel = "Rating",
  ...props
}: RatingInteractiveProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const current = controlled ?? internal;
  const display = hover ?? current;

  function commit(next: number) {
    if (controlled === undefined) setInternal(next);
    onValueChange?.(next);
  }

  // Map a pointer x-position across the track to a snapped rating value
  function valueFromPointer(clientX: number): number {
    const el = trackRef.current;
    if (!el) return current;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return current;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return snap(ratio * max, step, max);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowUp")
      next = snap(current + step, step, max);
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown")
      next = snap(current - step, step, max);
    else if (event.key === "Home") next = step;
    else if (event.key === "End") next = max;
    if (next !== null) {
      event.preventDefault();
      commit(next);
    }
  }

  return (
    <div
      ref={trackRef}
      data-slot="rating"
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={current}
      aria-valuetext={`${current} out of ${max}`}
      tabIndex={0}
      className={cn(ratingVariants({ size }), "cursor-pointer", className)}
      onKeyDown={onKeyDown}
      onClick={(event) => commit(valueFromPointer(event.clientX))}
      onPointerMove={(event) => setHover(valueFromPointer(event.clientX))}
      onPointerLeave={() => setHover(null)}
      {...props}>
      {Array.from({ length: max }, (_, i) => (
        <RatingIconPair
          // index key is stable: rating positions are fixed and never reorder
          key={i}
          icon={icon}
          fraction={clampFraction(display, i + 1)}
        />
      ))}
    </div>
  );
}

export { Rating, type RatingProps, ratingVariants };
