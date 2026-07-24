import { cva as cvaUpstream } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  // Whitelist [a-z0-9]; drop everything else so separators and dots stay out of slugs
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Re-export of class-variance-authority's `cva` that attaches the config
 * object to the returned function as `.config`. Upstream cva captures the
 * config in closure scope and exposes nothing, so the playground's variant
 * picker has no way to read variants without this wrapper.
 *
 * Component files import `cva` from `@/lib/utils` instead of
 * `class-variance-authority` directly. Variant inference via
 * `VariantProps<typeof xVariants>` is unchanged.
 */
export function cva<T>(...args: Parameters<typeof cvaUpstream<T>>): ReturnType<
  typeof cvaUpstream<T>
> & {
  config?: Parameters<typeof cvaUpstream<T>>[1];
  base?: Parameters<typeof cvaUpstream<T>>[0];
} {
  const fn = cvaUpstream<T>(...args);
  // Capture both base and config so the playground can scan for hover /
  // focus-visible / active / disabled / aria-invalid signals to auto-
  // derive supportedStates.
  return Object.assign(fn, { config: args[1], base: args[0] });
}

export type { VariantProps } from "class-variance-authority";
