// Shared types for the escape-fractal engine

export interface RGB {
  r: number;
  g: number;
  b: number;
}

// 256-entry color lookup table
export type Palette = RGB[];

export interface EscapeResult {
  iterations: number;
  radius: number;
}

export type FractalKind = "mandelbrot" | "ship" | "tricorn" | "multibrot";
export type ColorMethodKind = "iteration" | "smooth";
export type PresetKind = "default" | "rainbow" | "temperature" | "whacky";

// Camera + escape parameters the algorithms read
// cr/ci undefined selects the Mandelbrot family, a fixed value selects the Julia variant
export interface EscapeParams {
  maxIterations: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
  d: number;
  cr?: number;
  ci?: number;
}

export type FractalFn = (
  x: number,
  y: number,
  width: number,
  height: number,
  options: EscapeParams,
) => EscapeResult;

export type ColorFn = (
  iterations: number,
  maxIterations: number,
  radius: number,
  palette: Palette,
) => RGB;

// Full render state, a superset of EscapeParams with the chosen fractal, color method and color
export interface FractalOptions extends EscapeParams {
  escapeFractal: FractalFn;
  colorMethod: ColorFn;
  color: RGB;
}
