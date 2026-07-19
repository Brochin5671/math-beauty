import type * as React from "react";

import { cn } from "@/lib/utils";

// The field auto-grows with content (field-sizing-content), so the manual
// resize handle defaults to off; opt into vertical or both as needed.
const resizeClasses = {
  none: "resize-none",
  vertical: "resize-y",
  both: "resize",
} as const;

type TextareaProps = React.ComponentProps<"textarea"> & {
  /** Direction the user can drag to resize. Defaults to "none". */
  resize?: keyof typeof resizeClasses;
};

function Textarea({ className, resize = "none", ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        /*
         * in-data-[state=focus]: mirror for playground focus sim. Disabled
         * and error fire via real DOM props (compat shim).
         */
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 in-data-[state=focus]:border-ring in-data-[state=focus]:ring-3 in-data-[state=focus]:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        resizeClasses[resize],
        className,
      )}
      {...props}
    />
  );
}

export { Textarea, type TextareaProps };
