import * as React from "react";

/**
 * Subscribe to a CSS media query and return whether it currently matches
 *
 * SSR-safe: returns `false` on the server and the first client render (there is
 * no viewport to measure before mount), then syncs to the real match. A brief
 * first-paint flip is expected on the client when the query already matches
 * Sibling of `use-mobile.ts`, generalized to any query string
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
