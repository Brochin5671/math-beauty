import { XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/elements/Button";
import { Link } from "@/components/elements/Link";
import { Container } from "@/components/layouts/Container";
import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Thin one-line strip rendered above the Header, for product launches, sales,
 * or status notices. The default variant is a static server render. When
 * `dismissible` is true the component needs hydration (consume with
 * client:load); set `dismissKey` to persist dismissal across reloads via
 * localStorage
 */
const announcementBarVariants = cva("w-full border-b text-sm", {
  defaultVariants: {
    variant: "default",
    padding: "default",
  },
  variants: {
    variant: {
      default: "bg-muted text-foreground border-border",
      promo: "bg-primary text-primary-foreground border-primary/40",
      warning: "bg-destructive text-destructive-foreground border-destructive/40",
    },
    // Vertical density of the strip, so a downstream project can tighten or
    // loosen it without forking the source. `default` is the demo baseline
    padding: {
      compact: "py-1.5",
      default: "py-2",
      spacious: "py-3",
    },
  },
});

interface AnnouncementBarProps
  extends Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof announcementBarVariants> {
  /** Optional CTA link target appended after the message */
  href?: string;
  /** CTA link label (required if href is set) */
  cta?: string;
  /** The announcement message */
  children: React.ReactNode;
  /** Horizontal alignment of the message: centered (default) or leading edge */
  align?: "center" | "start";
  /** Render a dismiss button. Requires client hydration */
  dismissible?: boolean;
  /** localStorage key used to persist dismissal. When set, the bar stays dismissed across reloads. Omit for session-only dismissal */
  dismissKey?: string;
  /** Called when the user dismisses the bar */
  onDismiss?: () => void;
}

function AnnouncementBar({
  variant = "default",
  padding = "default",
  href,
  cta,
  children,
  align = "center",
  dismissible = false,
  dismissKey,
  onDismiss,
  className,
  ...props
}: AnnouncementBarProps) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (!dismissible || !dismissKey) return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(dismissKey) === "1") {
      setVisible(false);
    }
  }, [dismissible, dismissKey]);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    if (dismissKey && typeof window !== "undefined") {
      window.localStorage.setItem(dismissKey, "1");
    }
    onDismiss?.();
  };

  return (
    <div
      data-slot="announcement-bar"
      data-variant={variant}
      data-align={align}
      className={cn(announcementBarVariants({ variant, padding }), className)}
      {...props}>
      <Container className="flex items-center gap-2">
        {/*
         * Center mode pairs a leading flex-1 spacer with the trailing one that
         * holds the dismiss button, so the message stays centered whether or not
         * a CTA or dismiss button renders. Start mode omits the leading spacer
         * so the message sits at the leading edge
         */}
        {align === "center" ? <span aria-hidden className="flex-1" /> : null}
        <span className={cn(align === "center" && "text-center")}>{children}</span>
        {href && cta ? (
          <Link
            href={href}
            variant="link"
            // text-inherit keeps the CTA in the bar's own foreground color so it
            // always contrasts; a fixed palette color (the link variant's
            // text-primary) would vanish on the promo bar
            className="text-inherit underline underline-offset-2 hover:no-underline">
            {cta}
          </Link>
        ) : null}
        <span className="flex flex-1 justify-end">
          {dismissible ? (
            <Button
              data-slot="announcement-bar-dismiss"
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Dismiss announcement"
              onClick={handleDismiss}>
              <XIcon />
            </Button>
          ) : null}
        </span>
      </Container>
    </div>
  );
}

export { AnnouncementBar, type AnnouncementBarProps, announcementBarVariants };
