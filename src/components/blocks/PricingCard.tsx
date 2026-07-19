import type * as React from "react";

import { Card, CardContent } from "@/components/elements/Card";
import { Stack } from "@/components/layouts/Stack";
import { cn } from "@/lib/utils";

/*
 * Individual pricing tier card. Composes Card for the surface; children
 * should include the tier name, price, description, features list, and a
 * CTA button. Set `featured` to true to swap Card's neutral ring for a
 * primary highlight. Named container (pricing-card) so slot content can
 * adapt to the card's own width via Tailwind @container queries
 */
interface PricingCardProps extends React.ComponentProps<"div"> {
  /** Adds a primary ring highlight for the recommended tier */
  featured?: boolean;
}

function PricingCard({ featured = false, className, children, ...props }: PricingCardProps) {
  return (
    <Card
      data-slot="pricing-card"
      data-featured={featured || undefined}
      className={cn("@container/pricing-card", featured && "ring-2 ring-primary", className)}
      {...props}>
      <CardContent>
        <Stack gap="default">{children}</Stack>
      </CardContent>
    </Card>
  );
}

export { PricingCard, type PricingCardProps };
