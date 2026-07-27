import type * as React from "react";

import { Stack } from "@/components/layouts/Stack";
import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Individual testimonial/quote card. Renders a decorative opening quote
 * mark, the quote text (children), and attribution below. Stays a
 * blockquote for semantics (so it is not composed from Card, which is a
 * div); Stack handles the inner spacing. Named container (testimonial) so
 * slot content can adapt to the card's own width via Tailwind @container
 * queries
 */
const testimonialVariants = cva("@container/testimonial rounded-xl border bg-card", {
  defaultVariants: {
    padding: "default",
  },
  variants: {
    // Card padding tier, so a downstream project can dial density without
    // forking the source. `default` is the baseline used everywhere else.
    padding: {
      compact: "p-4",
      default: "p-6",
      spacious: "p-8",
    },
  },
});

interface TestimonialProps
  extends React.ComponentProps<"blockquote">,
    VariantProps<typeof testimonialVariants> {}

function Testimonial({ className, padding, children, ...props }: TestimonialProps) {
  return (
    <blockquote
      data-slot="testimonial"
      className={cn(testimonialVariants({ padding }), className)}
      {...props}>
      <span aria-hidden="true" className="block text-4xl leading-none text-primary select-none">
        &ldquo;
      </span>
      <Stack gap="default" className="mt-2">
        {children}
      </Stack>
    </blockquote>
  );
}

export { Testimonial, type TestimonialProps, testimonialVariants };
