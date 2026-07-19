import { describe, expect, test } from "vitest";
import {
  colorPresets,
  createPalette,
  iterationColoring,
  smoothColoring,
} from "@/lib/fractals/coloring";

describe("createPalette", () => {
  test("returns 256 entries", () => {
    expect(createPalette({ r: 1, g: 1, b: 1 }, false)).toHaveLength(256);
  });

  test("non-looping gradient is channel = (i * factor) % 256", () => {
    const palette = createPalette({ r: 1, g: 2, b: 0 }, false);
    expect(palette[0]).toStrictEqual({ r: 0, g: 0, b: 0 });
    expect(palette[10]).toStrictEqual({ r: 10, g: 20, b: 0 });
    expect(palette[200]).toStrictEqual({ r: 200, g: (200 * 2) % 256, b: 0 });
  });

  test("looping gradient wraps with a sine curve", () => {
    const palette = createPalette({ r: 2, g: 4, b: 0 }, true);
    expect(palette[0]).toStrictEqual({
      r: Math.round(Math.sin(2) * 127 + 128),
      g: Math.round(Math.sin(4) * 127 + 128),
      b: 128,
    });
  });
});

describe("colorPresets", () => {
  test("expose the four shipped presets", () => {
    expect(colorPresets.default).toStrictEqual([{ r: 1, g: 1, b: 1 }, false]);
    expect(colorPresets.rainbow).toStrictEqual([{ r: 2, g: 4, b: 0 }, true]);
    expect(colorPresets.temperature).toStrictEqual([{ r: 4, g: 5, b: 6 }, true]);
    expect(colorPresets.whacky).toStrictEqual([{ r: 18, g: 12, b: 20 }, false]);
  });
});

describe("iterationColoring", () => {
  const palette = createPalette({ r: 1, g: 1, b: 1 }, false);

  test("interior points are black", () => {
    expect(iterationColoring(100, 100, 0, palette)).toStrictEqual({ r: 0, g: 0, b: 0 });
  });

  test("escaped points map into the palette by sqrt-normalized index", () => {
    // 25/100 -> sqrt(0.25) = 0.5 -> * 255 = 127.5 -> floor 127
    expect(iterationColoring(25, 100, 0, palette)).toStrictEqual(palette[127]);
  });
});

describe("smoothColoring", () => {
  const palette = createPalette({ r: 1, g: 1, b: 1 }, false);

  test("interior points are black", () => {
    expect(smoothColoring(100, 100, 0, palette)).toStrictEqual({ r: 0, g: 0, b: 0 });
  });

  test("escaped points interpolate within the palette band", () => {
    const result = smoothColoring(50, 100, 100, palette);
    expect(result.r).toBe(result.g);
    expect(result.g).toBe(result.b);
    expect(result.r).toBeGreaterThan(49);
    expect(result.r).toBeLessThan(50);
  });
});
