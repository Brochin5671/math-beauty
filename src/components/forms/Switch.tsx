import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn, cva, type VariantProps } from "@/lib/utils";

// `size` is the only visual axis (track + thumb dimensions). Kept as a CVA
// factory so the variant is introspectable; the thumb reads `data-size` off the
// root via group-data selectors, so the root keeps that attribute.
const switchVariants = cva(
  // in-data-[state=focus] mirrors the focus ring when the playground picker
  // writes data-state=focus on the wrapper.
  "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 in-data-[state=focus]:border-ring in-data-[state=focus]:ring-3 in-data-[state=focus]:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-[18.4px] w-[32px]",
        sm: "h-[14px] w-[24px]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

/**
 * Uncontrolled by default. `defaultChecked` seeds the initial state on
 * mount and is then ignored, the component manages its own checked state
 * after first render. For a controlled Switch pass `checked` and
 * `onCheckedChange` instead.
 */
function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & VariantProps<typeof switchVariants>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(switchVariants({ size }), className)}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch, switchVariants };
