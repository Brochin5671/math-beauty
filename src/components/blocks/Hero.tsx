import type * as React from "react";

import { Container } from "@/components/layouts/Container";
import { Grid } from "@/components/layouts/Grid";
import { Stack } from "@/components/layouts/Stack";
import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Page-opening section with clamped height. Owns its own vertical sizing
 * so Section doesn't need a height variant. Supports centered (default)
 * and start-aligned layouts. The optional `visual` slot enables a split
 * layout (content left, visual right). The optional `background` slot
 * positions content (image, video, gradient div) behind the foreground
 * at absolute inset-0 z-0
 */
const heroVariants = cva("relative flex items-center-safe", {
  defaultVariants: {
    align: "center",
    size: "default",
  },
  variants: {
    align: {
      /** Centered content, good for landing pages and error pages */
      center: "text-center justify-center-safe",
      /** Left-aligned content, F-pattern reading flow for marketing copy */
      start: "text-left justify-start",
    },
    size: {
      /** Clamped height: --hero-min-height (600px) min, --hero-height (85svh) on large screens, --hero-max-height (900px) max. Override those tokens in :root to re-tokenize. svh (small viewport) avoids mobile toolbar jitter during scroll; stable at first paint. Accounts for header via --header-height */
      default:
        "min-h-[var(--hero-min-height,600px)] lg:min-h-[calc(var(--hero-height,85svh)-var(--header-height,0px))] xl:max-h-[var(--hero-max-height,900px)]",
      /** Remaining viewport after header, via --hero-height-full (100svh). Uses svh for stable mobile first paint. Accounts for header via --header-height */
      fullscreen: "min-h-[calc(var(--hero-height-full,100svh)-var(--header-height,0px))]",
    },
  },
});

interface HeroProps
  extends Omit<React.ComponentProps<"section">, "children">,
    VariantProps<typeof heroVariants> {
  /** Foreground content (headline, lead, CTA) */
  children?: React.ReactNode;
  /** Right-column visual for split layout; presence enables the split grid */
  visual?: React.ReactNode;
  /** Background slot (gradient div, image, video) rendered absolute inset-0 z-0 */
  background?: React.ReactNode;
}

function Hero({
  align = "center",
  size = "default",
  className,
  children,
  visual,
  background,
  ...props
}: HeroProps) {
  return (
    <section data-slot="hero" className={cn(heroVariants({ align, size }), className)} {...props}>
      {background ? <div className="absolute inset-0 z-0 overflow-hidden">{background}</div> : null}
      <Container className="relative z-10">
        {visual ? (
          <Grid cols={{ base: 1, lg: 2 }} gap="xl" align="center" className="lg:gap-12">
            <Stack gap="default">{children}</Stack>
            <div>{visual}</div>
          </Grid>
        ) : align === "center" ? (
          <Container size="narrow">
            <Stack gap="default" align="center">
              {children}
            </Stack>
          </Container>
        ) : (
          <Stack gap="default">{children}</Stack>
        )}
      </Container>
    </section>
  );
}

export { Hero, type HeroProps, heroVariants };
