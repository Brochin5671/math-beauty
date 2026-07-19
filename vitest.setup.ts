import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  // happy-dom does not auto-clean the DOM between tests; jsdom does
  cleanup();
  // Defensive: if a test calls vi.useFakeTimers() and forgets to reset,
  // every subsequent test in the file would inherit fake timers
  vi.useRealTimers();
});
