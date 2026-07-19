import type * as React from "react";
import { Children } from "react";

import { Container, type ContainerSize } from "@/components/layouts/Container";
import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Compound page-footer primitive. A TSX surface so it can mount from any React
 * context (Astro pages, embedded previews, Storybook-style harnesses).
 *
 * Structure: <Footer> wraps a centered container, then composes
 * brand / columns / trust / bottom rows from named parts. Each part is
 * presentation-only; the consumer assembles the shape they want.
 *
 * The root <footer> is the page's contentinfo landmark (only when scoped to
 * <body>). Inner <FooterLegalLinks> and <FooterSocial> are labeled <nav>
 * regions so screen readers can jump between them.
 *
 * The sub-parts keep raw flex/grid on purpose: each encodes behavioral CVA
 * variants the primitives do not express (FooterColumns' responsive ramp plus
 * `divided`, FooterBottom's split/stacked/end justification, FooterBrand's
 * align + text-center), and the trivial vertical stacks (FooterColumn) are
 * one-liners where a Stack would only add indirection. Stack supports
 * responsive direction and Grid responsive cols, so the primitives are not the
 * limiter here
 */

const footerVariants = cva("w-full", {
  variants: {
    background: {
      default: "bg-card text-card-foreground",
      muted: "bg-muted",
      inverted: "bg-foreground text-background",
      brand: "bg-primary text-primary-foreground",
      transparent: "",
    },
    density: {
      compact: "py-8",
      default: "py-12",
      spacious: "py-16 md:py-20",
    },
  },
  defaultVariants: {
    background: "default",
    density: "default",
  },
});

interface FooterProps extends React.ComponentProps<"footer">, VariantProps<typeof footerVariants> {
  /** Inner content max-width. Matches Container primitive sizes. */
  containerSize?: ContainerSize;
  /** Add a top border that separates the footer from page content above it. */
  borderTop?: boolean;
}

function Footer({
  className,
  background = "default",
  density = "default",
  borderTop = false,
  containerSize = "default",
  children,
  ...props
}: FooterProps) {
  return (
    <footer
      data-slot="footer"
      data-background={background}
      data-density={density}
      className={cn(
        footerVariants({ background, density }),
        borderTop && "border-t border-border",
        className,
      )}
      {...props}>
      <Container size={containerSize} className="flex flex-col gap-10">
        {children}
      </Container>
    </footer>
  );
}

const footerBrandVariants = cva("flex flex-col gap-4", {
  variants: {
    align: {
      start: "items-start",
      center: "items-center text-center",
    },
  },
  defaultVariants: {
    align: "start",
  },
});

function FooterBrand({
  className,
  align = "start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof footerBrandVariants>) {
  return (
    <div
      data-slot="footer-brand"
      className={cn(footerBrandVariants({ align }), className)}
      {...props}
    />
  );
}

const footerColumnsVariants = cva("grid grid-cols-1", {
  variants: {
    cols: {
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-2 lg:grid-cols-3",
      4: "sm:grid-cols-2 lg:grid-cols-4",
      5: "sm:grid-cols-2 lg:grid-cols-5",
      6: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
    },
    gap: {
      compact: "gap-6",
      default: "gap-8",
      spacious: "gap-12",
    },
    // Vertical rules only at lg+, where columns sit in one row; stacked and
    // wrapped layouts stay clean (divide-x misbehaves once columns wrap)
    divided: {
      true: "lg:divide-x divide-border",
      false: "",
    },
  },
  defaultVariants: {
    cols: 4,
    gap: "default",
    divided: false,
  },
});

function FooterColumns({
  className,
  cols = 4,
  gap = "default",
  divided = false,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof footerColumnsVariants>) {
  return (
    <div
      data-slot="footer-columns"
      className={cn(footerColumnsVariants({ cols, gap, divided }), className)}
      {...props}
    />
  );
}

function FooterColumn({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="footer-column" className={cn("flex flex-col gap-3", className)} {...props} />
  );
}

type HeadingTag = "h2" | "h3" | "h4" | "div";

interface FooterColumnTitleProps extends React.ComponentProps<"h2"> {
  /** Heading level. Default `h2` because AT users scan footer columns by heading. Override to `h3`/`h4` if your page outline conflicts, or to `div` for non-heading visual. */
  as?: HeadingTag;
}

function FooterColumnTitle({ className, as: As = "h2", ...props }: FooterColumnTitleProps) {
  return (
    <As
      data-slot="footer-column-title"
      className={cn("text-sm font-semibold tracking-wider uppercase", className)}
      {...props}
    />
  );
}

function FooterColumnLinks({ className, children, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="footer-column-links"
      className={cn(
        "flex flex-col gap-2 text-sm [&_a]:text-muted-foreground [&_a:hover]:text-foreground [&_a]:transition-colors",
        className,
      )}
      {...props}>
      {Children.map(children, (child) => {
        if (child === null || child === undefined || child === false) return null;
        return <li>{child}</li>;
      })}
    </ul>
  );
}

function FooterTrust({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="footer-trust"
      className={cn("flex flex-wrap items-center gap-6", className)}
      {...props}
    />
  );
}

const footerBottomVariants = cva(
  "flex flex-col gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:gap-6",
  {
    variants: {
      variant: {
        split: "sm:flex-row sm:items-center sm:justify-between",
        stacked: "items-center text-center",
        end: "sm:flex-row sm:items-center sm:justify-end",
      },
    },
    defaultVariants: {
      variant: "split",
    },
  },
);

function FooterBottom({
  className,
  variant = "split",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof footerBottomVariants>) {
  return (
    <div
      data-slot="footer-bottom"
      className={cn(footerBottomVariants({ variant }), className)}
      {...props}
    />
  );
}

interface FooterCopyrightProps extends React.ComponentProps<"p"> {
  /** Year to display. Defaults to the current year. */
  year?: number;
  /** Append " All rights reserved." after the entity name. Default `true`. */
  rightsReserved?: boolean;
}

function FooterCopyright({
  className,
  year = new Date().getFullYear(),
  rightsReserved = true,
  children,
  ...props
}: FooterCopyrightProps) {
  return (
    <p data-slot="footer-copyright" className={cn(className)} {...props}>
      &copy; <time dateTime={String(year)}>{year}</time>
      {children != null && <> {children}</>}
      {rightsReserved ? <>. All rights reserved.</> : null}
    </p>
  );
}

interface LegalLink {
  label: string;
  href: string;
}

interface FooterLegalLinksProps extends Omit<React.ComponentProps<"nav">, "children"> {
  links: LegalLink[];
}

function FooterLegalLinks({ className, links, ...props }: FooterLegalLinksProps) {
  return (
    <nav
      data-slot="footer-legal-links"
      aria-label="Legal"
      className={cn("flex flex-wrap items-center gap-4", className)}
      {...props}>
      {links.map((link) => (
        <a key={link.href} href={link.href} className="hover:text-foreground transition-colors">
          {link.label}
        </a>
      ))}
    </nav>
  );
}

function FooterSocial({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="footer-social"
      aria-label="Social media"
      className={cn("flex items-center gap-3", className)}
      {...props}
    />
  );
}

interface FooterSocialLinkProps extends Omit<React.ComponentProps<"a">, "aria-label"> {
  href: string;
  /** Required accessible name for the icon-only link. Becomes `aria-label`. */
  label: string;
}

function FooterSocialLink({ className, href, label, children, ...props }: FooterSocialLinkProps) {
  return (
    <a
      data-slot="footer-social-link"
      href={href}
      aria-label={label}
      className={cn(
        "text-muted-foreground hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors [&_svg]:size-5",
        className,
      )}
      {...props}>
      {children}
    </a>
  );
}

export {
  Footer,
  FooterBottom,
  FooterBrand,
  FooterColumn,
  FooterColumnLinks,
  FooterColumns,
  FooterColumnTitle,
  FooterCopyright,
  type FooterCopyrightProps,
  FooterLegalLinks,
  FooterSocial,
  FooterSocialLink,
  type FooterSocialLinkProps,
  FooterTrust,
  footerVariants,
  type LegalLink,
};
