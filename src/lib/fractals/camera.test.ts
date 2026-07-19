import { describe, expect, test } from "vitest";
import { seed } from "@/lib/fractals/algorithms";
import { backingScale, type Camera, panBy, zoomAt } from "@/lib/fractals/camera";

const DIMENSION = 320;

// Runs the real mapping from algorithms.ts so these tests cross-check the camera against
// the authoritative formula rather than a copy that could rot beside it
function planeAt(camera: Camera, u: number, v: number) {
  return seed(DIMENSION / 2 + u, DIMENSION / 2 + v, DIMENSION, DIMENSION, {
    ...camera,
    maxIterations: 100,
    d: 2,
  });
}

function camera(zoom = 1, offsetX = 0, offsetY = 0): Camera {
  return { zoom, offsetX, offsetY };
}

describe("backingScale", () => {
  test.each`
    backingWidth  | cssWidth      | expected
    ${320}        | ${320}        | ${1}
    ${320}        | ${160}        | ${2}
    ${320}        | ${640}        | ${0.5}
    ${320}        | ${0}          | ${1}
    ${320}        | ${-10}        | ${1}
    ${0}          | ${320}        | ${1}
    ${Number.NaN} | ${320}        | ${1}
    ${320}        | ${Number.NaN} | ${1}
  `(
    "scales a backing width of $backingWidth against a CSS width of $cssWidth to $expected",
    ({ backingWidth, cssWidth, expected }) => {
      expect(backingScale(backingWidth, cssWidth)).toBe(expected);
    },
  );
});

describe("zoomAt", () => {
  test("about the centre matches scaling zoom and both offsets", () => {
    const anchored = camera(2, 40, -15);
    const scaled = camera(2, 40, -15);
    zoomAt(anchored, 1.15, 0, 0);

    scaled.zoom *= 1.15;
    scaled.offsetX *= 1.15;
    scaled.offsetY *= 1.15;

    expect(anchored).toStrictEqual(scaled);
  });

  test("holds the real coordinate under the anchor fixed", () => {
    const c = camera(1.5, 30, 0);
    const before = planeAt(c, 96, 0).a;
    expect(before).not.toBe(0);
    zoomAt(c, 1.15, 96, 0);
    expect(planeAt(c, 96, 0).a).toBeCloseTo(before, 12);
  });

  test("holds the imaginary coordinate under the anchor fixed", () => {
    const c = camera(1.5, 0, 30);
    const before = planeAt(c, 0, -72).b;
    expect(before).not.toBe(0);
    zoomAt(c, 1.15, 0, -72);
    expect(planeAt(c, 0, -72).b).toBeCloseTo(before, 12);
  });

  test("moves the offsets in opposite directions for the same anchor sign", () => {
    const c = camera(1, 0, 0);
    zoomAt(c, 2, 100, 100);
    expect(c.offsetX).toBe(100);
    expect(c.offsetY).toBe(-100);
  });

  test("zooming out then back in returns the camera to its start", () => {
    const c = camera(1, 12, -8);
    zoomAt(c, 1.15, 40, 25);
    zoomAt(c, 1 / 1.15, 40, 25);
    expect(c.zoom).toBeCloseTo(1, 12);
    expect(c.offsetX).toBeCloseTo(12, 12);
    expect(c.offsetY).toBeCloseTo(-8, 12);
  });
});

describe("panBy", () => {
  test("moves the image with the pointer", () => {
    const c = camera(1, 0, 0);
    panBy(c, 25, 10);
    expect(c.offsetX).toBe(-25);
    expect(c.offsetY).toBe(10);
  });

  // Anchored away from the origin and run at several zooms, since the coordinate at the
  // canvas centre is zero for every zoom and would pass whatever the scaling
  test.each([1, 8, 1000])("holds the coordinate under the pointer fixed at zoom %s", (zoom) => {
    const c = camera(zoom, 30, -20);
    const before = planeAt(c, 12, -6);
    expect(before.a).not.toBe(0);
    expect(before.b).not.toBe(0);

    panBy(c, 40, 25);
    const after = planeAt(c, 52, 19);

    expect(after.a).toBeCloseTo(before.a, 12);
    expect(after.b).toBeCloseTo(before.b, 12);
  });
});
