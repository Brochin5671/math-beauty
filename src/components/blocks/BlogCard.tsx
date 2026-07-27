import type * as React from "react";

import { Card, CardContent } from "@/components/elements/Card";
import { Stack } from "@/components/layouts/Stack";
import { cn, cva, type VariantProps } from "@/lib/utils";

// Content padding tier, so a downstream project can dial blog-index density
// without forking the source. `default` is the baseline used everywhere else
const blogCardContentVariants = cva("", {
  defaultVariants: {
    padding: "default",
  },
  variants: {
    padding: {
      compact: "py-4",
      default: "py-6",
      spacious: "py-8",
    },
  },
});

/*
 * Article preview card with an optional `image` slot at the top and a default
 * slot for title, date, and excerpt. Composes Card for the surface (gap-0/py-0
 * so the image sits flush at the top, text padded by CardContent below). Set
 * `href` to make the whole card a keyboard-accessible link: it renders an <a>
 * wrapper with a focus ring and a hover lift. Use inside a Grid for blog index
 * layouts. Named container (blog-card) so slot content can adapt to the card's
 * own width via Tailwind @container queries
 */
interface BlogCardProps
  extends Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof blogCardContentVariants> {
  /** Default-slot content: title, date, excerpt */
  children?: React.ReactNode;
  /** Optional image rendered above the content block */
  image?: React.ReactNode;
  /** When set, the whole card becomes a link to this URL */
  href?: string;
}

function BlogCard({ className, children, image, href, padding, ...props }: BlogCardProps) {
  const card = (
    <Card
      data-slot="blog-card"
      className={cn(
        "@container/blog-card gap-0 py-0",
        // Hover lift. in-data-[state=hover] mirrors real hover, so a forced
        // data-state on an ancestor previews it
        href != null &&
          "transition-shadow group-hover/blog-link:shadow-md in-data-[state=hover]:shadow-md",
        className,
      )}
      {...props}>
      {image ? <div className="w-full">{image}</div> : null}
      <CardContent className={blogCardContentVariants({ padding })}>
        <Stack gap="sm">{children}</Stack>
      </CardContent>
    </Card>
  );

  if (href == null) return card;

  return (
    <a
      href={href}
      // in-data-[state=focus] mirrors :focus-visible so the States picker can
      // preview the focus ring (it forces data-state on an ancestor)
      className="group/blog-link block rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 in-data-[state=focus]:ring-[3px] in-data-[state=focus]:ring-ring/50">
      {card}
    </a>
  );
}

export { BlogCard, type BlogCardProps, blogCardContentVariants };
