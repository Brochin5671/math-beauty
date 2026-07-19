import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "@/lib/utils";

function Separator({ className, orientation = "horizontal", ...props }: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        // Horizontal defaults are unconditional (h-px w-full) so consumers
        // can override width with a bare `w-*` utility and have
        // tailwind-merge drop the default. Vertical orientation overrides
        // both axes via data-variants that Base UI emits explicitly.
        "shrink-0 bg-border h-px w-full data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
