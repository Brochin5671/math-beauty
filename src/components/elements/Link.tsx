import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/elements/Button";
import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Playground-facing CVA factory: declares the size axis Link exposes
 * so the playground Appearance picker can be auto-generated from it.
 * The class strings are intentionally empty - Link's actual size
 * styling comes from buttonVariants(size) inside the component
 */
const linkVariants = cva("", {
  variants: {
    size: {
      default: "",
      xs: "",
      sm: "",
      lg: "",
      icon: "",
      "icon-xs": "",
      "icon-sm": "",
      "icon-lg": "",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface LinkProps extends ComponentProps<"a">, VariantProps<typeof buttonVariants> {
  href: string;
}

/*
 * Anchor styled with the Button visual system. Renders a plain <a> rather
 * than going through Base UI's Button + render-prop, because Base UI's
 * Button always applies role="button" and a keyboard polyfill (Space activates)
 * which is wrong for a link (Enter activates, Space scrolls). Sharing
 * `buttonVariants` keeps the visuals identical without sharing the semantics
 */
function Link({
  href,
  variant = "link",
  size = "default",
  className,
  children,
  ...props
}: LinkProps) {
  return (
    <a
      href={href}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}>
      {children}
    </a>
  );
}

export { Link, type LinkProps, linkVariants };
