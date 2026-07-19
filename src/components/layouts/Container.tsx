import type * as React from "react";

import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Centers and constrains content width. Use standalone when you need container
 * behavior outside of a Section (e.g., inside a full-bleed Hero with a centered
 * content block). Inside a Section, the built-in container handles this already
 */
const containerVariants = cva("mx-auto w-full px-4 sm:px-6 lg:px-8", {
  variants: {
    size: {
      /** Most marketing and app content, ~1280px */
      default: "max-w-7xl",
      /** No max-width. Full-bleed sections */
      full: "max-w-none",
      /** Reading width, ~768px. Blog posts, long-form content */
      narrow: "max-w-3xl",
      /** Wider layouts, ~1536px. Dashboards, data-heavy pages */
      wide: "max-w-screen-2xl",
      /** 4K-friendly layouts, ~1920px */
      ultrawide: "max-w-[1920px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type ContainerSize = NonNullable<VariantProps<typeof containerVariants>["size"]>;

interface ContainerProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof containerVariants> {}

function Container({ className, size = "default", ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      data-size={size}
      className={cn(containerVariants({ size }), className)}
      {...props}
    />
  );
}

export { Container, type ContainerProps, type ContainerSize, containerVariants };
