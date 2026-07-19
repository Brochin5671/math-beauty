// Drive happy-dom's viewport width so width-based hooks resolve to a known
// breakpoint. useIsMobile keys off window.innerWidth; happy-dom has no layout,
// so innerWidth is set explicitly (its matchMedia already resolves the query).
// Returns a reset to restore the previous width; call it in a finally.
export function setViewportWidth(width: number): () => void {
  const original = window.innerWidth;
  const set = (value: number) =>
    Object.defineProperty(window, "innerWidth", { configurable: true, value });
  set(width);
  return () => set(original);
}
