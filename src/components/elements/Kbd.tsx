import type * as React from "react";

import { cn, cva, type VariantProps } from "@/lib/utils";

const kbdVariants = cva(
  "pointer-events-none inline-flex w-fit items-center justify-center gap-1 rounded-sm font-sans font-medium text-muted-foreground select-none in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*='size-'])]:size-3",
  {
    variants: {
      variant: {
        filled: "bg-muted",
        outline: "border bg-transparent",
      },
      size: {
        sm: "h-4 min-w-4 px-1 text-xs",
        default: "h-5 min-w-5 px-1 text-xs",
        lg: "h-6 min-w-6 px-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  },
);

function Kbd({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"kbd"> & VariantProps<typeof kbdVariants>) {
  return (
    <kbd
      data-slot="kbd"
      data-variant={variant ?? "filled"}
      data-size={size ?? "default"}
      className={cn(kbdVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup, kbdVariants };
