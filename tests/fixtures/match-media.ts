/*
 * Pins a viewport width for width-based hooks in happy-dom, and makes
 * `matchMedia` agree with it.
 *
 * happy-dom's `matchMedia` does not observe `window.innerWidth` when it is
 * redefined on the global under vitest. Probed directly: `innerWidth` reads back
 * 375 while `matchMedia("(max-width: 767px)")` is still false and
 * `("min-width: 768px")` is still true. So setting the width alone does nothing
 * for a hook that reads `mql.matches`, which is why this stubs both.
 *
 * A query with no width term delegates to the real implementation rather than
 * being answered false, so stubbing the width does not silently break an
 * unrelated `prefers-reduced-motion` or `forced-colors` query.
 *
 * `resize` exists because a hook can report the right value and still be broken:
 * the thing worth testing is often whether crossing a breakpoint notifies at all
 */

const WIDTH_QUERY = /\((min|max)-width:\s*([\d.]+)px\)/g;

type Listener = (event: MediaQueryListEvent) => void;

interface LiveList {
  query: string;
  listeners: Set<Listener>;
}

/**
 * Evaluates every width term in a query, or null when it has none
 *
 * All of them, not just the first: `(min-width: 768px) and (max-width: 1024px)` read
 * off its `min` term alone answers a silently wrong `matches` at 2000px, and because
 * the result is non-null it never falls through to anything that would notice
 */
function matchesWidth(query: string, width: number): boolean | null {
  const terms = [...query.matchAll(WIDTH_QUERY)];
  if (terms.length === 0) return null;
  return terms.every((term) => {
    const bound = Number.parseFloat(term[2] as string);
    return term[1] === "min" ? width >= bound : width <= bound;
  });
}

export interface Viewport {
  /** Moves the viewport and notifies every listener whose query changed */
  resize(width: number): void;
  /** Puts back the original property descriptors. Call in a `finally` */
  restore(): void;
}

/** Stubs the viewport width and keeps `matchMedia` consistent with it */
export function setViewportWidth(width: number): Viewport {
  const originalWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");
  const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");
  const realMatchMedia = window.matchMedia.bind(window);

  let current = width;
  const live = new Set<LiveList>();

  const setWidth = (value: number) =>
    Object.defineProperty(window, "innerWidth", { configurable: true, value });

  setWidth(current);
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string): MediaQueryList => {
      if (matchesWidth(query, current) === null) return realMatchMedia(query);

      const entry: LiveList = { query, listeners: new Set() };
      live.add(entry);
      return {
        get matches() {
          return matchesWidth(query, current) as boolean;
        },
        media: query,
        onchange: null,
        addEventListener: (_type: "change", listener: Listener) => entry.listeners.add(listener),
        removeEventListener: (_type: "change", listener: Listener) => {
          entry.listeners.delete(listener);
          if (entry.listeners.size === 0) live.delete(entry);
        },
        addListener: (listener: Listener) => entry.listeners.add(listener),
        removeListener: (listener: Listener) => entry.listeners.delete(listener),
        dispatchEvent: () => true,
      } as unknown as MediaQueryList;
    },
  });

  return {
    resize(next: number) {
      const before = [...live].map((entry) => matchesWidth(entry.query, current));
      current = next;
      setWidth(next);
      let index = 0;
      for (const entry of live) {
        const wasMatching = before[index++];
        const isMatching = matchesWidth(entry.query, current);
        if (wasMatching === isMatching) continue;
        for (const listener of entry.listeners) {
          listener({ matches: isMatching, media: entry.query } as MediaQueryListEvent);
        }
      }
    },
    restore() {
      live.clear();
      restore("innerWidth", originalWidth);
      restore("matchMedia", originalMatchMedia);
    },
  };
}

function restore(prop: string, descriptor: PropertyDescriptor | undefined): void {
  if (descriptor) Object.defineProperty(window, prop, descriptor);
  else delete (window as unknown as Record<string, unknown>)[prop];
}
