import type { ColorMethodKind, FractalKind, PresetKind, RGB } from "@/lib/fractals/types";

/*
 * Shared between the viewer island and its lazily loaded control panel
 * Types and plain data only, so importing this never drags the panel's Base UI
 * components onto the critical path
 */

// Display state for the controlled inputs, never read by the draw path
export interface Ui {
  fractal: FractalKind;
  method: ColorMethodKind;
  preset: PresetKind;
  gradientLoop: boolean;
  julia: boolean;
  autoRender: boolean;
  rgb: RGB;
  zoom: number;
  x: number;
  y: number;
  d: number;
  cr: number;
  ci: number;
  iterations: number;
}

export type NumericUiKey = "zoom" | "x" | "y" | "d" | "cr" | "ci" | "iterations";

export const FRACTAL_OPTIONS: { value: FractalKind; label: string }[] = [
  { value: "mandelbrot", label: "Mandelbrot Set" },
  { value: "ship", label: "Burning Ship" },
  { value: "tricorn", label: "Tricorn" },
  { value: "multibrot", label: "Multibrot Set" },
];

export const PRESET_OPTIONS: { value: PresetKind; label: string }[] = [
  { value: "temperature", label: "Temperature" },
  { value: "default", label: "Black & White" },
  { value: "rainbow", label: "Rainbow" },
  { value: "whacky", label: "Whacky Gradients" },
];

export const METHOD_OPTIONS: { value: ColorMethodKind; label: string }[] = [
  { value: "iteration", label: "Iteration" },
  { value: "smooth", label: "Smooth" },
];

export const RGB_CHANNELS: { key: keyof RGB; label: string }[] = [
  { key: "r", label: "Red" },
  { key: "g", label: "Green" },
  { key: "b", label: "Blue" },
];

// Base UI renders the value through Intl.NumberFormat, whose default rounds to three
// decimals and groups thousands, so every field states the precision it needs
export const ZOOM_FORMAT: Intl.NumberFormatOptions = {
  useGrouping: false,
  maximumSignificantDigits: 10,
};
export const DECIMAL_FORMAT: Intl.NumberFormatOptions = {
  useGrouping: false,
  maximumFractionDigits: 4,
};
export const COMPLEX_FORMAT: Intl.NumberFormatOptions = {
  useGrouping: false,
  maximumFractionDigits: 5,
};
export const ITERATIONS_FORMAT: Intl.NumberFormatOptions = {
  useGrouping: false,
  maximumFractionDigits: 0,
};

// Everything the control panel needs from the island, gathered so the lazy boundary
// stays a single prop rather than thirty
export interface FractalControlsApi {
  ui: Ui;
  paletteCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  showValue: (key: NumericUiKey, value: number | null) => void;
  commitZoom: (v: number | null) => void;
  commitX: (v: number | null) => void;
  commitY: (v: number | null) => void;
  commitD: (v: number | null) => void;
  commitCr: (v: number | null) => void;
  commitCi: (v: number | null) => void;
  commitIterations: (v: number | null) => void;
  stepZoom: (dir: 1 | -1) => void;
  stepX: (dir: 1 | -1) => void;
  stepY: (dir: 1 | -1) => void;
  stepD: (dir: 1 | -1) => void;
  stepCr: (dir: 1 | -1) => void;
  stepCi: (dir: 1 | -1) => void;
  stepIterations: (dir: 1 | -1) => void;
  changeFractal: (kind: FractalKind) => void;
  changeMethod: (value: ColorMethodKind) => void;
  changePreset: (name: PresetKind) => void;
  toggleJulia: (checked: boolean) => void;
  toggleLoop: (checked: boolean) => void;
  toggleAutoRender: (checked: boolean) => void;
  onRgbLive: (channel: keyof RGB, value: number) => void;
  onReset: () => void;
  drawNow: () => void;
  requestRender: () => void;
}
