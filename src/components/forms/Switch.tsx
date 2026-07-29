import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { useFormRestoreOptOut } from "@/hooks/use-form-restore-opt-out";
import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * `size` is the only visual axis (track + thumb dimensions). Kept as a CVA
 * factory so the variant is part of the declared API rather than an inline
 * selector; the thumb reads `data-size` off the root via group-data selectors,
 * so the root keeps that attribute
 */
const switchVariants = cva(
  /*
   * in-data-[state=focus] paints the focus ring when an ancestor carries
   * data-state="focus", so a static render can show the state without real focus
   *
   * Properties are enumerated, not `transition-all`: that animates outline-width too, from
   * the CSS initial 3px down to 2px, so a computed-style read after focus() catches the
   * start value. Reduced motion does not settle it (the global.css hatch is 0.001ms, not 0s)
   */
  "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-[background-color,border-color,box-shadow] outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 in-data-[state=focus]:border-ring in-data-[state=focus]:ring-3 in-data-[state=focus]:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
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
 * `onCheckedChange` instead
 *
 * NAMING: pass `aria-labelledby` explicitly when this is `client:visible` below the fold.
 * Base UI puts a passed `id` on the hidden input rather than the visible control, and
 * resolves an associated `<label for>` inside a layout effect, so the server-rendered
 * markup is `role="switch"` with no accessible name and the name only appears once the
 * island mounts. Anything scanning pre-hydration HTML sees the nameless version.
 * `aria-labelledby` is taken ahead of both the context id and the fallback, so it survives
 * to the HTML. A component test cannot catch this: Testing Library renders and hydrates in
 * one step, so the effect runs and the assertion passes while the shipped markup is unnamed
 */
function Switch({
  className,
  size = "default",
  inputRef,
  ...props
}: SwitchPrimitive.Root.Props & VariantProps<typeof switchVariants>) {
  const optOutRef = useFormRestoreOptOut(inputRef);
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      inputRef={optOutRef}
      className={cn(switchVariants({ size }), className)}
      {...props}>
      {/*
       * forced-colors:border carries the state. Forced colors flattens both backgrounds to
       * Canvas, so on and off render identically (SC 1.4.11 at 1:1); a border is all it keeps
       */}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform forced-colors:border group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch, switchVariants };
