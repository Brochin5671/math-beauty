import type * as React from "react";

import { cn, cva, type VariantProps } from "@/lib/utils";

/*
 * Semantic `<article>` wrapper for self-contained content (blog posts,
 * news items, case studies, knowledge-base entries). `density` applies
 * inter-child spacing via `space-y-*`, not outer padding - Articles
 * typically nest inside a Section / Container which already provides the
 * page-level vertical rhythm
 */
const articleVariants = cva("relative", {
  variants: {
    density: {
      /** Tight 16 px vertical rhythm */
      compact: "space-y-4",
      /** Comfortable 24 px vertical rhythm (default) */
      default: "space-y-6",
      /** Generous 32 px vertical rhythm */
      spacious: "space-y-8",
    },
  },
  defaultVariants: {
    density: "default",
  },
});

interface ArticleProps
  extends React.ComponentProps<"article">,
    VariantProps<typeof articleVariants> {}

function Article({ className, density = "default", ...props }: ArticleProps) {
  return (
    <article
      data-slot="article"
      className={cn(articleVariants({ density }), className)}
      {...props}
    />
  );
}

export { Article, type ArticleProps, articleVariants };
