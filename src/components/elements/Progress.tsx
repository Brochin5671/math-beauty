"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";

import { cn, cva, type VariantProps } from "@/lib/utils";

const progressVariants = cva("flex flex-wrap gap-3", {
  variants: {
    tone: {
      default: "[&_[data-slot=progress-indicator]]:bg-primary",
      safe: "[&_[data-slot=progress-indicator]]:bg-success",
      warning: "[&_[data-slot=progress-indicator]]:bg-warning",
      danger: "[&_[data-slot=progress-indicator]]:bg-destructive",
    },
    size: {
      sm: "[&_[data-slot=progress-track]]:h-1.5",
      default: "[&_[data-slot=progress-track]]:h-2",
      lg: "[&_[data-slot=progress-track]]:h-3",
    },
    shape: {
      rounded: "[&_[data-slot=progress-track]]:rounded-full",
      square: "[&_[data-slot=progress-track]]:rounded-none",
    },
    surface: {
      filled: "[&_[data-slot=progress-track]]:bg-muted",
      // Ring instead of border so the indicator doesn't overlap the outline (border eats into box height with border-box)
      outline:
        "[&_[data-slot=progress-track]]:bg-transparent [&_[data-slot=progress-track]]:ring-1 [&_[data-slot=progress-track]]:ring-inset [&_[data-slot=progress-track]]:ring-border",
      none: "[&_[data-slot=progress-track]]:bg-transparent",
    },
  },
  defaultVariants: {
    tone: "default",
    size: "default",
    shape: "rounded",
    surface: "filled",
  },
});

function Progress({
  className,
  tone = "default",
  size = "default",
  shape = "rounded",
  surface = "filled",
  children,
  value,
  ...props
}: ProgressPrimitive.Root.Props & VariantProps<typeof progressVariants>) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      data-tone={tone}
      data-size={size}
      data-shape={shape}
      data-surface={surface}
      className={cn(progressVariants({ tone, size, shape, surface }), className)}
      {...props}>
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  );
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn("relative flex w-full items-center overflow-x-hidden", className)}
      data-slot="progress-track"
      {...props}
    />
  );
}

function ProgressIndicator({ className, ...props }: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full transition-all", className)}
      {...props}
    />
  );
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  );
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn("ml-auto text-sm text-muted-foreground tabular-nums", className)}
      data-slot="progress-value"
      {...props}
    />
  );
}

export {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
  progressVariants,
};
