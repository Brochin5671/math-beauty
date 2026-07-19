import type * as React from "react";

import { Container, type ContainerSize } from "@/components/layouts/Container";
import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Pure layout primitive: handles spacing and background only
 * Alignment, height, and internal layout belong to the content inside
 * Wraps children in a Container so consumers don't need to nest one manually
 */
const sectionVariants = cva("relative", {
  variants: {
    background: {
      default: "",
      accent: "bg-primary text-primary-foreground",
      inverted: "bg-foreground text-background",
      muted: "bg-muted [&_p]:text-muted-foreground",
    },
    padding: {
      compact: "py-12 md:py-16",
      default: "py-16 md:py-24 lg:py-32",
      spacious: "py-24 md:py-32 lg:py-40",
    },
  },
  defaultVariants: {
    background: "default",
    padding: "default",
  },
});

interface SectionProps
  extends React.ComponentProps<"section">,
    VariantProps<typeof sectionVariants> {
  /** Internal container width constraint. Matches Container primitive sizes */
  containerSize?: ContainerSize;
}

function Section({
  className,
  background = "default",
  padding = "default",
  containerSize = "default",
  children,
  ...props
}: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ background, padding }), className)}
      {...props}>
      <Container size={containerSize} className="flex flex-col">
        {children}
      </Container>
    </section>
  );
}

export { Section, type SectionProps, sectionVariants };
