import { cva } from "@/lib/utils";

/*
 * Header CVA variants, split out of Header.astro so both the component and
 * the playground tile (which rebuilds the bar in React) share one source of
 * truth for the variant class maps.
 */

/*
 * Variant controls container background and text color. Desktop items
 * inherit text color from the container via opacity, so switching variants
 * automatically re-themes the nav without needing text color overrides
 */
export const headerVariants = cva("w-full", {
  defaultVariants: {
    position: "sticky",
    variant: "default",
  },
  variants: {
    position: {
      /** Scrolls with the page, no sticky behavior */
      static: "relative",
      /** Stays at the top of the viewport after user scrolls past its initial position */
      sticky: "sticky top-0 z-50",
    },
    variant: {
      /** Fully opaque background. The plain, predictable header */
      default: "border-b border-border bg-background text-foreground",
      /** Translucent frosted background with backdrop blur. The effect only shows over content scrolling beneath a sticky header */
      blur: "border-b border-border bg-background/95 text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/60",
      /** No background or border. Use for hero overlays where the page background should show through */
      transparent: "text-foreground",
      /** Brand primary color background. Uses primary-foreground for text */
      brand: "border-b border-primary-foreground/20 bg-primary text-primary-foreground",
      /** Foreground/background swap for stark contrast */
      inverted: "border-b border-background/20 bg-foreground text-background",
    },
  },
});

/*
 * Items group alignment controls where the nav items sit between the logo
 * and the CTA. Uses margin-auto tricks to avoid conflicting with the CTA's
 * ml-auto positioning. Item-to-item spacing lives on NavigationMenuList via
 * HeaderDesktopMenu's itemsGap, not here, since this wrapper has one child.
 */
export const itemsGroupVariants = cva("hidden md:flex md:items-center", {
  defaultVariants: {
    itemsAlign: "start",
  },
  variants: {
    itemsAlign: {
      /** Items immediately after the logo. CTA pushed to far right */
      start: "mr-auto",
      /** Items horizontally centered between logo and CTA */
      center: "mx-auto",
      /** Items pushed to the right, adjacent to the CTA */
      end: "ml-auto",
    },
  },
});
