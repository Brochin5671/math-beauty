import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { cn, cva, type VariantProps } from "@/lib/utils";

const buttonVariants = cva(
  /*
   * State styles are authored twice: production selectors
   * (`hover:` / `active:` / `focus-visible:`) and mirrors
   * (`in-data-[state=*]:`) for the StatesPicker. Pointer states are
   * transient and programmatic `.focus()` does not reliably trigger
   * `:focus-visible`, so the mirrors keep them inspectable. Disabled
   * and error pass real `disabled` / `aria-invalid` props instead
   */
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring in-data-[state=focus]:border-ring focus-visible:ring-3 in-data-[state=focus]:ring-3 focus-visible:ring-ring/50 in-data-[state=focus]:ring-ring/50 active:not-aria-[haspopup]:translate-y-px in-data-[state=active]:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80 in-data-[state=hover]:bg-primary/80",
        outline:
          "border-border bg-background shadow-xs hover:bg-muted hover:text-foreground in-data-[state=hover]:bg-muted in-data-[state=hover]:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 dark:in-data-[state=hover]:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 in-data-[state=hover]:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground in-data-[state=hover]:bg-muted in-data-[state=hover]:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 dark:in-data-[state=hover]:bg-muted/50",
        destructive:
          // dark hover capped at /25 (not /30): at /30 the soft bg drops
          // text-destructive to 4.37:1 in dark mode (below AA 4.5); /25 keeps a
          // visible hover while clearing contrast
          "bg-destructive/10 text-destructive hover:bg-destructive/20 in-data-[state=hover]:bg-destructive/20 focus-visible:border-destructive/40 in-data-[state=focus]:border-destructive/40 focus-visible:ring-destructive/20 in-data-[state=focus]:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/25 dark:in-data-[state=hover]:bg-destructive/25 dark:focus-visible:ring-destructive/40 dark:in-data-[state=focus]:ring-destructive/40",
        success:
          "bg-success/10 text-success hover:bg-success/20 in-data-[state=hover]:bg-success/20 focus-visible:border-success/40 in-data-[state=focus]:border-success/40 focus-visible:ring-success/20 in-data-[state=focus]:ring-success/20 dark:bg-success/20 dark:hover:bg-success/30 dark:in-data-[state=hover]:bg-success/30 dark:focus-visible:ring-success/40 dark:in-data-[state=focus]:ring-success/40",
        warning:
          "bg-warning/10 text-warning hover:bg-warning/20 in-data-[state=hover]:bg-warning/20 focus-visible:border-warning/40 in-data-[state=focus]:border-warning/40 focus-visible:ring-warning/20 in-data-[state=focus]:ring-warning/20 dark:bg-warning/20 dark:hover:bg-warning/30 dark:in-data-[state=hover]:bg-warning/30 dark:focus-visible:ring-warning/40 dark:in-data-[state=focus]:ring-warning/40",
        link: "text-primary underline-offset-4 hover:underline in-data-[state=hover]:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-9",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
