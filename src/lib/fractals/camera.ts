import type { EscapeParams } from "@/lib/fractals/types";

// The camera fields a gesture mutates, a narrow view of EscapeParams
export type Camera = Pick<EscapeParams, "zoom" | "offsetX" | "offsetY">;

// Multiplier taking a CSS-pixel delta into backing-store pixels
// The canvas paints narrower than its backing store on small viewports and offsets live
// in backing pixels, so every pointer delta has to be scaled before it reaches the camera
// Falls back to 1 for a canvas that has not been laid out yet, where either width is 0
export function backingScale(backingWidth: number, cssWidth: number): number {
  if (!(backingWidth > 0) || !(cssWidth > 0)) return 1;
  return backingWidth / cssWidth;
}

// Zooms by factor about a point u,v backing pixels from the canvas centre
// seed() maps a pixel to a = (-2 + 4(x + offsetX)/W)/zoom, so holding a fixed while zoom
// scales by k gives offsetX' = k*offsetX + (k-1)*u
// The y axis flips because seed() uses y - offsetY
// Anchored zoom only: centre zoom keeps its own multiply and divide in the viewer, because
// x/1.15 and x*(1/1.15) disagree in the last bit for about 15% of doubles
export function zoomAt(camera: Camera, factor: number, u: number, v: number): void {
  camera.zoom *= factor;
  camera.offsetX = factor * camera.offsetX + (factor - 1) * u;
  camera.offsetY = factor * camera.offsetY - (factor - 1) * v;
}

// Moves the image with the pointer, deltas in backing pixels
// No zoom scaling: offsetX sits beside x inside the same divide, so one backing pixel of
// drag is always one unit of offset whatever the zoom
export function panBy(camera: Camera, dx: number, dy: number): void {
  camera.offsetX -= dx;
  camera.offsetY += dy;
}
