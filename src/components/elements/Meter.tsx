"use client";

import { Meter as MeterPrimitive } from "@base-ui/react/meter";

import { cn, cva, type VariantProps } from "@/lib/utils";

const meterVariants = cva("flex flex-wrap gap-3", {
  variants: {
    tone: {
      default: "[&_[data-slot=meter-indicator]]:bg-primary",
      safe: "[&_[data-slot=meter-indicator]]:bg-success",
      warning: "[&_[data-slot=meter-indicator]]:bg-warning",
      danger: "[&_[data-slot=meter-indicator]]:bg-destructive",
    },
    size: {
      sm: "[&_[data-slot=meter-track]]:h-1.5",
      default: "[&_[data-slot=meter-track]]:h-2",
      lg: "[&_[data-slot=meter-track]]:h-3",
    },
    shape: {
      rounded: "[&_[data-slot=meter-track]]:rounded-full",
      square: "[&_[data-slot=meter-track]]:rounded-none",
    },
    surface: {
      filled: "[&_[data-slot=meter-track]]:bg-muted",
      // Ring instead of border so the indicator doesn't overlap the outline (border eats into box height with border-box)
      outline:
        "[&_[data-slot=meter-track]]:bg-transparent [&_[data-slot=meter-track]]:ring-1 [&_[data-slot=meter-track]]:ring-inset [&_[data-slot=meter-track]]:ring-border",
      none: "[&_[data-slot=meter-track]]:bg-transparent",
    },
  },
  defaultVariants: {
    tone: "default",
    size: "default",
    shape: "rounded",
    surface: "filled",
  },
});

function Meter({
  className,
  tone = "default",
  size = "default",
  shape = "rounded",
  surface = "filled",
  children,
  value,
  ...props
}: MeterPrimitive.Root.Props & VariantProps<typeof meterVariants>) {
  return (
    <MeterPrimitive.Root
      value={value}
      data-slot="meter"
      data-tone={tone}
      data-size={size}
      data-shape={shape}
      data-surface={surface}
      className={cn(meterVariants({ tone, size, shape, surface }), className)}
      {...props}>
      {children}
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </MeterPrimitive.Root>
  );
}

function MeterTrack({ className, ...props }: MeterPrimitive.Track.Props) {
  return (
    <MeterPrimitive.Track
      className={cn("relative flex w-full items-center overflow-x-hidden", className)}
      data-slot="meter-track"
      {...props}
    />
  );
}

function MeterIndicator({ className, ...props }: MeterPrimitive.Indicator.Props) {
  return (
    <MeterPrimitive.Indicator
      data-slot="meter-indicator"
      className={cn("h-full transition-all", className)}
      {...props}
    />
  );
}

function MeterLabel({ className, ...props }: MeterPrimitive.Label.Props) {
  return (
    <MeterPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="meter-label"
      {...props}
    />
  );
}

function MeterValue({ className, ...props }: MeterPrimitive.Value.Props) {
  return (
    <MeterPrimitive.Value
      className={cn("ml-auto text-sm text-muted-foreground tabular-nums", className)}
      data-slot="meter-value"
      {...props}
    />
  );
}

export { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue, meterVariants };
