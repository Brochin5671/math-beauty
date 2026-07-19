import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { MinusIcon, PlusIcon } from "lucide-react";
import type * as React from "react";

import { cn, cva, type VariantProps } from "@/lib/utils";

// Numeric input with -/+ steppers on Base UI NumberField, which owns parsing,
// clamping, keyboard stepping and formatting. size scales the input and buttons
// via data-slot descendant selectors, like Slider
const numberFieldVariants = cva("inline-flex items-center gap-1", {
  variants: {
    size: {
      default:
        "[&_[data-slot=number-field-input]]:h-9 [&_[data-slot=number-field-decrement]]:size-9 [&_[data-slot=number-field-increment]]:size-9",
      sm: "[&_[data-slot=number-field-input]]:h-8 [&_[data-slot=number-field-decrement]]:size-8 [&_[data-slot=number-field-increment]]:size-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// Outline icon button, sized by the size variant above
const stepButton =
  "inline-flex shrink-0 items-center justify-center rounded-md border border-input bg-transparent text-foreground shadow-xs transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 in-data-[state=focus]:border-ring in-data-[state=focus]:ring-3 in-data-[state=focus]:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 dark:bg-input/30";

interface NumberFieldProps
  extends NumberFieldPrimitive.Root.Props,
    VariantProps<typeof numberFieldVariants> {
  // Forwarded to the input, which Base UI renders as type=text
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  // Names both stepper buttons, so several fields on one page stay tellable apart
  // Base UI labels them a bare Increase and Decrease otherwise
  controlLabel?: string;
  /*
   * Takes over stepping. Fires with -1 or 1 for every increment and decrement, from the
   * buttons and from the arrow keys alike, and vetoes Base UI's own update so the parent's
   * math is the only one that runs. Use it when a step is not a fixed addition, such as a
   * multiplicative zoom or a step with side effects
   * Only the direction survives, so the parent decides the magnitude and the Alt and Shift
   * modifiers no longer change it. Press and hold does not repeat either, since the veto
   * reports the step as not applied
   */
  onStep?: (direction: 1 | -1) => void;
}

// Uncontrolled unless you pass value + onValueChange. Wrap in Field + FieldLabel to name it
function NumberField({
  className,
  size = "default",
  controlLabel,
  onStep,
  onValueChange,
  inputMode,
  // aria-invalid belongs on the input, forward it there where the error styling lives
  "aria-invalid": ariaInvalid,
  ...props
}: NumberFieldProps) {
  /*
   * Software keypads on both iOS and Android lack a minus key, so a field that can go
   * negative needs the ordinary keyboard or its value cannot be typed at all. Base UI
   * reaches the same conclusion but only on iOS, and falls back to a numeric keypad
   * elsewhere, which has neither a minus nor a decimal point. Apply it on every platform
   */
  const canBeNegative = props.min == null || props.min < 0;
  const resolvedInputMode = inputMode ?? (canBeNegative ? "text" : "decimal");

  // Base UI stamps direction at the source of every step, so the buttons and the arrow keys
  // route through the same parent math and cannot drift apart
  const handleValueChange: NumberFieldPrimitive.Root.Props["onValueChange"] = (next, details) => {
    if (onStep && details.direction != null) {
      details.cancel();
      onStep(details.direction);
      return;
    }
    onValueChange?.(next, details);
  };

  return (
    <NumberFieldPrimitive.Root
      data-slot="number-field"
      className={cn(numberFieldVariants({ size }), className)}
      onValueChange={handleValueChange}
      {...props}>
      <NumberFieldPrimitive.Group data-slot="number-field-group" className="contents">
        <NumberFieldPrimitive.Decrement
          data-slot="number-field-decrement"
          aria-label={controlLabel ? `Decrease ${controlLabel}` : "Decrease"}
          className={stepButton}>
          <MinusIcon />
        </NumberFieldPrimitive.Decrement>
        <NumberFieldPrimitive.Input
          data-slot="number-field-input"
          aria-invalid={ariaInvalid}
          inputMode={resolvedInputMode}
          onKeyDown={(event) => {
            // Base UI treats Enter as a navigation key, so blur to reach its commit on blur
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          className="w-16 min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-center text-base tabular-nums shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 in-data-[state=focus]:border-ring in-data-[state=focus]:ring-3 in-data-[state=focus]:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
        />
        <NumberFieldPrimitive.Increment
          data-slot="number-field-increment"
          aria-label={controlLabel ? `Increase ${controlLabel}` : "Increase"}
          className={stepButton}>
          <PlusIcon />
        </NumberFieldPrimitive.Increment>
      </NumberFieldPrimitive.Group>
    </NumberFieldPrimitive.Root>
  );
}

export { NumberField, numberFieldVariants };
