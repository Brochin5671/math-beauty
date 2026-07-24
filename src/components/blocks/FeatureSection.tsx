import type * as React from "react";

import { Container } from "@/components/layouts/Container";
import { Grid } from "@/components/layouts/Grid";
import { Stack } from "@/components/layouts/Stack";
import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Content + visual pair in a two-column grid. Composes Grid for the split
 * Use `reverse` to swap sides. Stack multiple FeatureSections with
 * alternating `reverse` to create the zig-zag pattern. Content stacks
 * vertically on mobile, splits at lg breakpoint
 */

// Section padding tiers (compact / default / spacious), aligned with the Section
// layout primitive's padding scale so blocks and sections share one rhythm
// `default` is the brand baseline; drop to `compact` for dense pages or stacked
// runs of FeatureSections, lift to `spacious` for marquee marketing sections.
const featureSectionVariants = cva("", {
  variants: {
    padding: {
      compact: "py-12 md:py-16",
      default: "py-16 md:py-24 lg:py-32",
      spacious: "py-24 md:py-32 lg:py-40",
    },
  },
  defaultVariants: {
    padding: "default",
  },
});

interface FeatureSectionProps
  extends Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof featureSectionVariants> {
  /** Swap content and visual sides (visual left, content right) */
  reverse?: boolean;
  /** Left-column content (headline, lead, CTA) */
  children?: React.ReactNode;
  /** Right-column visual (image, illustration, code block, etc.) */
  visual?: React.ReactNode;
}

function FeatureSection({
  reverse = false,
  padding,
  className,
  children,
  visual,
  ...props
}: FeatureSectionProps) {
  return (
    <div
      data-slot="feature-section"
      className={cn(featureSectionVariants({ padding }), className)}
      {...props}>
      <Container>
        <Grid
          cols={{ base: 1, lg: 2 }}
          gap="xl"
          align="center"
          className={cn(
            "lg:gap-12",
            reverse && "lg:[&>:first-child]:order-2 lg:[&>:last-child]:order-1",
          )}>
          <Stack gap="default">{children}</Stack>
          <div>{visual}</div>
        </Grid>
      </Container>
    </div>
  );
}

export { FeatureSection, type FeatureSectionProps, featureSectionVariants };
