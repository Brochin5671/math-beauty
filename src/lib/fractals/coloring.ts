import type { ColorFn, ColorMethodKind, Palette, PresetKind, RGB } from "@/lib/fractals/types";
import { mapToRange } from "@/lib/fractals/utils";

const BLACK: RGB = { r: 0, g: 0, b: 0 };

// Preset factor/shift triples paired with the gradient-loop flag
export const colorPresets: Record<PresetKind, [RGB, boolean]> = {
  default: [{ r: 1, g: 1, b: 1 }, false],
  rainbow: [{ r: 2, g: 4, b: 0 }, true],
  temperature: [{ r: 4, g: 5, b: 6 }, true],
  whacky: [{ r: 18, g: 12, b: 20 }, false],
};

// Basic gradient entry, channel = (i * factor) % 256
function gradient(redFactor: number, greenFactor: number, blueFactor: number, i: number): RGB {
  return {
    r: (i * redFactor) % 256,
    g: (i * greenFactor) % 256,
    b: (i * blueFactor) % 256,
  };
}

// Looping gradient entry, channel = sin(0.024 * i + phase) * 127 + 128
function gradientLoop(redPhase: number, greenPhase: number, bluePhase: number, i: number): RGB {
  return {
    r: Math.round(Math.sin(0.024 * i + redPhase) * 127 + 128),
    g: Math.round(Math.sin(0.024 * i + greenPhase) * 127 + 128),
    b: Math.round(Math.sin(0.024 * i + bluePhase) * 127 + 128),
  };
}

// Builds the 256-entry palette from a color and the loop flag
export function createPalette(color: RGB, loop: boolean): Palette {
  const { r, g, b } = color;
  const getColor = loop ? gradientLoop : gradient;
  const palette: Palette = [];
  for (let i = 0; i < 256; i++) {
    palette.push(getColor(r, g, b, i));
  }
  return palette;
}

// Iteration coloring, sqrt-normalized index into the palette, interior is black
export const iterationColoring: ColorFn = (iterations, maxIterations, _radius, palette): RGB => {
  if (iterations === maxIterations) {
    return BLACK;
  }
  let color = mapToRange(iterations, 0, maxIterations, 0, 1);
  color = mapToRange(Math.sqrt(color), 0, 1, 0, 255);
  return palette[Math.floor(color)] ?? BLACK;
};

// Smooth coloring, continuous escape count with linear interpolation between palette entries
export const smoothColoring: ColorFn = (iterations, maxIterations, radius, palette): RGB => {
  let count = iterations;
  if (count < maxIterations) {
    count += 1 - Math.log(Math.log(radius) / 2 / Math.log(2)) / Math.log(2);
  } else {
    return BLACK;
  }

  const color1 = palette[((Math.floor(count) % 255) + 255) % 255] ?? BLACK;
  const color2 = palette[(((Math.floor(count) + 1) % 255) + 255) % 255] ?? BLACK;
  const fracIteration = count % 1;
  return {
    r: (color2.r - color1.r) * fracIteration + color1.r,
    g: (color2.g - color1.g) * fracIteration + color1.g,
    b: (color2.b - color1.b) * fracIteration + color1.b,
  };
};

export const COLOR_METHODS: Record<ColorMethodKind, ColorFn> = {
  iteration: iterationColoring,
  smooth: smoothColoring,
};
