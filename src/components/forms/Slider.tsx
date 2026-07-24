import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn, cva, type VariantProps } from "@/lib/utils";

// Variants apply on the root via descendant selectors (mirrors Meter): `size`
// scales the thumb while `surface` and `shape` style the track. The
// orientation-dependent track thickness lives on the track element via
// `sliderTrackSize` instead, to avoid stacking a descendant selector with the
// data-orientation variant
const sliderVariants = cva("flex flex-col gap-2 data-horizontal:w-full data-vertical:h-full", {
  variants: {
    size: {
      sm: "[&_[data-slot=slider-thumb]]:size-3",
      default: "[&_[data-slot=slider-thumb]]:size-4",
      lg: "[&_[data-slot=slider-thumb]]:size-5",
    },
    surface: {
      filled: "[&_[data-slot=slider-track]]:bg-muted",
      // Ring not border: with border-box a border eats into box height
      outline:
        "[&_[data-slot=slider-track]]:bg-transparent [&_[data-slot=slider-track]]:ring-1 [&_[data-slot=slider-track]]:ring-inset [&_[data-slot=slider-track]]:ring-border",
      none: "[&_[data-slot=slider-track]]:bg-transparent",
    },
    shape: {
      rounded: "[&_[data-slot=slider-track]]:rounded-full",
      square: "[&_[data-slot=slider-track]]:rounded-none",
    },
  },
  defaultVariants: {
    size: "default",
    surface: "filled",
    shape: "rounded",
  },
});

// Track thickness is orientation-dependent, so it sits on the track element
const sliderTrackSize = {
  sm: "data-horizontal:h-1 data-vertical:w-1",
  default: "data-horizontal:h-1.5 data-vertical:w-1.5",
  lg: "data-horizontal:h-2 data-vertical:w-2",
} as const;

type SliderProps = SliderPrimitive.Root.Props &
  VariantProps<typeof sliderVariants> & {
    /**
     * Accessible name per thumb, applied by index. Provide one entry per
     * thumb when no visible label is rendered; a range slider needs one
     * for each end (e.g. ["Minimum", "Maximum"])
     */
    thumbLabels?: string[];
    /** Display the current value as text above the track */
    showValue?: boolean;
  };

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  size = "default",
  surface = "filled",
  shape = "rounded",
  thumbLabels,
  showValue = false,
  ...props
}: SliderProps) {
  // Thumb count follows the value: a scalar renders one thumb (Base UI accepts a
  // scalar too), an array one per entry, and only a bare slider falls back to a range
  const _values = Array.isArray(value)
    ? value
    : typeof value === "number"
      ? [value]
      : Array.isArray(defaultValue)
        ? defaultValue
        : typeof defaultValue === "number"
          ? [defaultValue]
          : [min, max];

  return (
    <SliderPrimitive.Root
      className={cn(sliderVariants({ size, surface, shape }), className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}>
      {showValue ? (
        <SliderPrimitive.Value
          data-slot="slider-value"
          className="text-sm font-medium tabular-nums"
        />
      ) : null}
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "relative grow overflow-hidden select-none data-horizontal:w-full data-vertical:h-full",
            sliderTrackSize[size ?? "default"],
          )}>
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            // Thumbs keep stable identity by position and never reorder, so key by index
            key={index}
            index={index}
            aria-label={thumbLabels?.[index]}
            className="block shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] select-none hover:ring-4 in-data-[state=hover]:ring-4 focus-visible:ring-4 in-data-[state=focus]:ring-4 focus-visible:outline-hidden in-data-[state=focus]:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider, sliderVariants };
