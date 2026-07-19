import type * as React from "react";

import { Container } from "@/components/layouts/Container";
import { Stack } from "@/components/layouts/Stack";
import { cn } from "@/lib/utils";

/*
 * Centered content block for call-to-action bands. Composes
 * Container (narrow width) + Stack (centered column). Place inside a
 * Section with background='accent' or 'inverted' for visual
 * punctuation; Section handles background and outer padding
 */
interface CTAProps extends React.ComponentProps<"div"> {}

function CTA({ className, children, ...props }: CTAProps) {
  return (
    <Container
      data-slot="cta-section"
      size="narrow"
      className={cn("text-center", className)}
      {...props}>
      <Stack gap="default" align="center">
        {children}
      </Stack>
    </Container>
  );
}

export { CTA, type CTAProps };
