import { useMediaQuery } from "@/hooks/use-media-query";

/*
 * Tailwind's `md:` is `min-width: 768px`, so "mobile" is everything below it.
 * The bound is 767.98 rather than 767 because a viewport can be fractional under
 * browser zoom, display scaling, or a non-integer window size: at 767.5px
 * Tailwind still applies its mobile styles while `max-width: 767px` does not
 * match, which put this hook and the stylesheet on opposite sides of one
 * breakpoint
 */
const MOBILE_QUERY = "(max-width: 767.98px)";

/**
 * Whether the viewport is below Tailwind's `md` breakpoint
 *
 * SSR-safe: false on the server and the first client render, then syncs to the
 * real match. Reads the media query itself rather than `window.innerWidth`, so
 * the value and the event that triggers a re-render cannot disagree: the previous
 * version listened on a `max-width: 767px` query while reading
 * `innerWidth < 768`, so a resize across 767.x fired no event even though the
 * value it reported had changed
 */
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_QUERY);
}
