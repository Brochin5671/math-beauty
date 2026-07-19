import type * as React from "react";

import { Button } from "@/components/elements/Button";
import { Input } from "@/components/forms/Input";
import { Label } from "@/components/forms/Label";
import { Container } from "@/components/layouts/Container";
import { Stack } from "@/components/layouts/Stack";
import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Email-capture block for mailing lists and newsletters. Composes Container +
 * Stack + Input + Button + Label. Native HTML <form> so the browser submits it
 * directly; wire the `action` prop to your provider (Mailchimp / ConvertKit /
 * Resend / etc.). Children render above the form for headline + lead;
 * `finePrint` renders below for GDPR + privacy copy
 */
const newsletterFormVariants = cva("flex w-full gap-2", {
  defaultVariants: {
    layout: "inline",
    width: "default",
  },
  variants: {
    layout: {
      /** Input + button on one row at sm+; stacks on mobile */
      inline: "flex-col sm:flex-row sm:items-center",
      /** Always stacked, full-width button */
      stacked: "flex-col",
    },
    // Max width of the form row, so a downstream project can widen or tighten
    // the capture field without forking the source
    width: {
      narrow: "max-w-sm",
      default: "max-w-md",
      wide: "max-w-lg",
    },
  },
});

interface NewsletterProps
  extends Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof newsletterFormVariants> {
  /** Form post target */
  action?: string;
  /** Form method (default "post") */
  method?: string;
  /** Email input placeholder */
  placeholder?: string;
  /** Submit-button label */
  cta?: string;
  /** Form-data name attribute for the email field (default "email") */
  inputName?: string;
  /** Headline + lead above the form */
  children?: React.ReactNode;
  /** GDPR / privacy copy below the form */
  finePrint?: React.ReactNode;
}

function Newsletter({
  layout = "inline",
  width = "default",
  action,
  method = "post",
  placeholder = "you@example.com",
  cta = "Subscribe",
  inputName = "email",
  className,
  children,
  finePrint,
  ...props
}: NewsletterProps) {
  return (
    <Container
      data-slot="newsletter"
      size="narrow"
      className={cn("text-center", className)}
      {...props}>
      <Stack gap="default" align="center">
        {children}
        <form
          data-slot="newsletter-form"
          action={action}
          method={method}
          className={newsletterFormVariants({ layout, width })}>
          <Label htmlFor="newsletter-email" className="sr-only">
            Email address
          </Label>
          <Input
            id="newsletter-email"
            type="email"
            name={inputName}
            placeholder={placeholder}
            required
            autoComplete="email"
            className="flex-1"
          />
          <Button type="submit" className={layout === "stacked" ? "w-full" : undefined}>
            {cta}
          </Button>
        </form>
        {finePrint ? (
          <div data-slot="newsletter-fine-print" className="text-xs text-muted-foreground">
            {finePrint}
          </div>
        ) : null}
      </Stack>
    </Container>
  );
}

export { Newsletter, type NewsletterProps, newsletterFormVariants };
