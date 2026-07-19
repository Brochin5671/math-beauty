import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";
import { cn, cva, type VariantProps } from "@/lib/utils";

// Size is the only visual axis; height is the only thing it changes. Kept as a
// CVA factory (not an inline data-[size] selector) so the variant is introspectable.
const selectVariants = cva(
  "w-full min-w-0 appearance-none rounded-md border border-input bg-transparent py-1 pr-8 pl-2.5 text-sm shadow-xs transition-[color,box-shadow] outline-none select-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring in-data-[state=focus]:border-ring focus-visible:ring-3 in-data-[state=focus]:ring-3 focus-visible:ring-ring/50 in-data-[state=focus]:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        default: "h-9",
        sm: "h-8",
        lg: "h-10",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type SelectProps = Omit<React.ComponentProps<"select">, "size"> &
  VariantProps<typeof selectVariants>;

function Select({ className, size = "default", ...props }: SelectProps) {
  return (
    <div
      className={cn("group/select relative w-fit has-[select:disabled]:opacity-50", className)}
      data-slot="select-wrapper"
      data-size={size}>
      <select data-slot="select" data-size={size} className={selectVariants({ size })} {...props} />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="select-icon"
      />
    </div>
  );
}

function SelectOption({ className, ...props }: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

function SelectOptGroup({ className, ...props }: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

export { Select, SelectOptGroup, SelectOption, selectVariants };
