import type { FractalOptions, Palette } from "@/lib/fractals/types";

const BLACK = { r: 0, g: 0, b: 0 };

// Renders the fractal to the canvas one 1px-tall ImageData strip per row
// No-ops when there is no canvas or 2D context, safe for SSR and happy-dom
export function drawEscapeFractal(
  canvas: HTMLCanvasElement | null,
  options: FractalOptions,
  palette: Palette,
): void {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;
  const { escapeFractal, colorMethod, maxIterations } = options;
  const imageData = ctx.createImageData(width, 1);
  ctx.clearRect(0, 0, width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { iterations, radius } = escapeFractal(x, y, width, height, options);
      const { r, g, b } = colorMethod(iterations, maxIterations, radius, palette);
      let pixelIdx = x * 4;
      imageData.data[pixelIdx++] = r;
      imageData.data[pixelIdx++] = g;
      imageData.data[pixelIdx++] = b;
      imageData.data[pixelIdx++] = 255;
    }
    ctx.putImageData(imageData, 0, y);
  }
}

// Paints the current palette into the preview strip
export function drawPalettePreview(canvas: HTMLCanvasElement | null, palette: Palette): void {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;
  const imageData = ctx.createImageData(width, 1);
  ctx.clearRect(0, 0, width, height);

  for (let x = 0; x < width; x++) {
    const { r, g, b } = palette[x] ?? BLACK;
    let pixelIdx = x * 4;
    imageData.data[pixelIdx++] = r;
    imageData.data[pixelIdx++] = g;
    imageData.data[pixelIdx++] = b;
    imageData.data[pixelIdx++] = 255;
  }
  for (let y = 0; y < height; y++) {
    ctx.putImageData(imageData, 0, y);
  }
}
