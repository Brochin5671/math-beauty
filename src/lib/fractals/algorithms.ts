import type { EscapeParams, EscapeResult, FractalFn, FractalKind } from "@/lib/fractals/types";
import { getRelativeValue } from "@/lib/fractals/utils";

// Maps a pixel to the complex plane, offsets pan and zoom divides
// cr/ci override c for the Julia variant, otherwise c is the pixel itself
function seed(x: number, y: number, width: number, height: number, options: EscapeParams) {
  const { cr, ci, zoom, offsetX, offsetY } = options;
  const a = getRelativeValue(x + offsetX, width, -2, 4) / zoom;
  const b = getRelativeValue(y - offsetY, height, -2, 4) / zoom;
  return { a, b, ca: cr ?? a, cb: ci ?? b };
}

// Mandelbrot set, z = z^2 + c
export const mandelbrotSet: FractalFn = (x, y, width, height, options): EscapeResult => {
  const { maxIterations } = options;
  const { a: a0, b: b0, ca, cb } = seed(x, y, width, height, options);
  let a = a0;
  let b = b0;

  let iterations = 0;
  let radius = a * a + b * b;
  while (radius <= 4 && iterations < maxIterations) {
    const a2 = a * a - b * b;
    const b2 = 2 * a * b;
    a = a2 + ca;
    b = b2 + cb;
    radius = a * a + b * b;
    iterations++;
  }
  return { iterations, radius };
};

// Burning Ship, z = (|Re z| + |Im z| i)^2 + c
export const burningShip: FractalFn = (x, y, width, height, options): EscapeResult => {
  const { maxIterations } = options;
  const { a: a0, b: b0, ca, cb } = seed(x, y, width, height, options);
  let a = a0;
  let b = b0;

  let iterations = 0;
  let radius = a * a + b * b;
  while (radius <= 4 && iterations < maxIterations) {
    const a2 = a * a - b * b;
    const b2 = Math.abs(2 * a * b);
    a = a2 + ca;
    b = b2 + cb;
    radius = a * a + b * b;
    iterations++;
  }
  return { iterations, radius };
};

// Tricorn (Mandelbar), z = conj(z)^2 + c
export const tricorn: FractalFn = (x, y, width, height, options): EscapeResult => {
  const { maxIterations } = options;
  const { a: a0, b: b0, ca, cb } = seed(x, y, width, height, options);
  let a = a0;
  let b = b0;

  let iterations = 0;
  let radius = a * a + b * b;
  while (radius <= 4 && iterations < maxIterations) {
    const a2 = a * a - b * b;
    const b2 = -2 * a * b;
    a = a2 + ca;
    b = b2 + cb;
    radius = a * a + b * b;
    iterations++;
  }
  return { iterations, radius };
};

// Multibrot, z = z^d + c via polar form so d can be fractional
export const multibrotSet: FractalFn = (x, y, width, height, options): EscapeResult => {
  const { maxIterations, d } = options;
  const { a: a0, b: b0, ca, cb } = seed(x, y, width, height, options);
  let a = a0;
  let b = b0;

  let iterations = 0;
  let radius = a * a + b * b;
  while (radius <= 4 && iterations < maxIterations) {
    const aabbd = (a * a + b * b) ** (d / 2);
    const datan2 = d * Math.atan2(b, a);
    const a2 = aabbd * Math.cos(datan2);
    const b2 = aabbd * Math.sin(datan2);
    a = a2 + ca;
    b = b2 + cb;
    radius = a * a + b * b;
    iterations++;
  }
  return { iterations, radius };
};

export const FRACTALS: Record<FractalKind, FractalFn> = {
  mandelbrot: mandelbrotSet,
  ship: burningShip,
  tricorn,
  multibrot: multibrotSet,
};
