import type * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Semantic `<main>` landmark for the page's primary content region. Ships
 * with sensible defaults: `id="main-content"` (skip-link target convention)
 * and `tabIndex={-1}` (allows skip-link focus to land on activation).
 * Consumers can override either via props. No padding/background variants -
 * Main is a landmark wrapper, not a styled surface; nest Section / Container
 * / Stack inside to handle visual rhythm
 */
function Main({
  className,
  id = "main-content",
  tabIndex = -1,
  ...props
}: React.ComponentProps<"main">) {
  return <main data-slot="main" id={id} tabIndex={tabIndex} className={cn(className)} {...props} />;
}

export { Main };
