import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  FRACTAL_OPTIONS,
  type FractalControlsApi,
  type NumericUiKey,
  type Ui,
} from "@/components/custom/fractal-ui";
import { Card, CardContent, CardHeader } from "@/components/elements/Card";
import { Stack } from "@/components/layouts/Stack";
import { useMediaQuery } from "@/hooks/use-media-query";
import { FRACTALS } from "@/lib/fractals/algorithms";
import { backingScale, panBy, zoomAt } from "@/lib/fractals/camera";
import { COLOR_METHODS, colorPresets, createPalette } from "@/lib/fractals/coloring";
import { drawEscapeFractal, drawPalettePreview } from "@/lib/fractals/render";
import type {
  ColorMethodKind,
  FractalKind,
  FractalOptions,
  Palette,
  PresetKind,
  RGB,
} from "@/lib/fractals/types";
import { cn } from "@/lib/utils";

/*
 * The control panel and help dialog are most of this island's JavaScript. Loading them
 * apart from the canvas keeps the critical path to the engine and the gestures, so the
 * canvas responds to a press well before the panel arrives
 */
const FractalControls = lazy(() =>
  import("@/components/custom/FractalControls").then((m) => ({ default: m.FractalControls })),
);
const FractalHelp = lazy(() =>
  import("@/components/custom/FractalControls").then((m) => ({ default: m.FractalHelp })),
);

const JULIA_CR = -0.70176;
const JULIA_CI = 0.3842;

/*
 * CSS pixels a press may wander before it counts as a drag rather than a zoom
 * A finger rolls several pixels on even a deliberate tap, where a mouse does not move at
 * all, so touch gets the wider slop the platforms themselves use. Sharing the mouse value
 * made most real taps register as tiny drags and swallowed the zoom
 */
const DRAG_THRESHOLD_MOUSE = 4;
const DRAG_THRESHOLD_TOUCH = 12;
const dragThresholdFor = (pointerType: string) =>
  pointerType === "touch" ? DRAG_THRESHOLD_TOUCH : DRAG_THRESHOLD_MOUSE;
// Wheel deltas are continuous, so zoom exponentially rather than by a fixed step, which a
// trackpad would apply dozens of times per flick. A 100px pixel-mode notch lands near the
// 1.15 the keyboard and a press use
const WHEEL_ZOOM_RATE = 0.0015;
// Pixels per line, matching what pixel-mode browsers report for one notch
const WHEEL_LINE_HEIGHT = 33;
// Page-mode deltas and runaway trackpads can report enormous values, so bound one event
const WHEEL_MIN_FACTOR = 0.25;
const WHEEL_MAX_FACTOR = 4;

// Seeds the palette, the gradient-loop switch and the picker, so the three cannot drift
const DEFAULT_PRESET: PresetKind = "temperature";
const [DEFAULT_COLOR, DEFAULT_LOOP] = colorPresets[DEFAULT_PRESET];

// A value the coordinate mapping can use, so an empty field or an overflowing entry
// such as 1e999 never reaches the draw state
function drawable(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

// seed() divides by zoom, so a zero would map every pixel to infinity and blank the canvas
function drawableZoom(value: number | null): value is number {
  return drawable(value) && value !== 0;
}

/*
 * Zoom about the canvas centre, which the keyboard and the zoom stepper share
 * Kept apart from zoomAt so the arithmetic stays a multiply going in and a divide coming
 * out: those disagree in the last bit for about 15% of doubles, and this path predates the
 * anchored one. Refuses a step it cannot draw, the same way zoomAt does
 */
function zoomCentre(o: FractalOptions, dir: 1 | -1): void {
  const zoom = dir === 1 ? o.zoom * 1.15 : o.zoom / 1.15;
  const offsetX = dir === 1 ? o.offsetX * 1.15 : o.offsetX / 1.15;
  const offsetY = dir === 1 ? o.offsetY * 1.15 : o.offsetY / 1.15;
  if (!drawableZoom(zoom) || !drawable(offsetX) || !drawable(offsetY)) return;
  o.zoom = zoom;
  o.offsetX = offsetX;
  o.offsetY = offsetY;
}

export function FractalViewer() {
  // Mutable render state, the single source of truth for drawing
  const optionsRef = useRef<FractalOptions>({
    escapeFractal: FRACTALS.mandelbrot,
    colorMethod: COLOR_METHODS.iteration,
    maxIterations: 100,
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
    d: 2,
    cr: undefined,
    ci: undefined,
    color: { ...DEFAULT_COLOR },
  });
  const paletteRef = useRef<Palette>([]);
  const autoRenderRef = useRef(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteCanvasRef = useRef<HTMLCanvasElement>(null);

  // Gesture state, all refs so a pointer stream never re-renders on its own
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef({
    active: false,
    moved: false,
    lastX: 0,
    lastY: 0,
    threshold: DRAG_THRESHOLD_MOUSE,
  });
  const pinchRef = useRef<{ dist: number; cx: number; cy: number } | null>(null);
  const frameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  const [ui, setUi] = useState<Ui>({
    fractal: "mandelbrot",
    method: "iteration",
    preset: DEFAULT_PRESET,
    gradientLoop: DEFAULT_LOOP,
    julia: false,
    autoRender: true,
    rgb: { ...DEFAULT_COLOR },
    zoom: 1,
    x: 0,
    y: 0,
    d: 2,
    cr: JULIA_CR,
    ci: JULIA_CI,
    iterations: 100,
  });

  const drawNow = () =>
    drawEscapeFractal(canvasRef.current, optionsRef.current, paletteRef.current);
  const requestRender = () => {
    if (autoRenderRef.current) drawNow();
  };
  const rebuildPalette = (color: RGB, loop: boolean) => {
    paletteRef.current = createPalette(color, loop);
    drawPalettePreview(paletteCanvasRef.current, paletteRef.current);
  };

  /*
   * The prerendered markup arrives long before the island hydrates, and until it does there
   * is no gesture handler. Claiming touch-action up front would let the canvas swallow every
   * touch in that window, so it reads as broken rather than as not ready: no pan, no pinch,
   * and the page will not even scroll from there. Take it over only once handlers exist
   */
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  /*
   * Touch and mouse want different wording, and the server cannot tell which is coming.
   * Reads the primary pointer rather than a breakpoint, so a touch laptop is judged by its
   * input and not its width, and follows a keyboard being attached to a tablet mid-session
   */
  const coarsePointer = useMediaQuery("(pointer: coarse)");

  // Initial palette, preview and draw, client only
  useEffect(() => {
    rebuildPalette(optionsRef.current.color, DEFAULT_LOOP);
    drawNow();
  }, []);

  // Global keyboard controls, always redraw even when auto-render is off
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, [contenteditable='true'], [role='dialog']");
      // Number inputs swallow letters, so the camera shortcuts stay live while one holds
      // focus, which matters because clicking a stepper button moves focus into its input
      if (typing && !typing.matches("[data-slot='number-field-input']")) {
        return;
      }
      const o = optionsRef.current;
      let handled = true;
      switch (e.key) {
        case "w":
          o.offsetY += 25;
          break;
        case "a":
          o.offsetX -= 25;
          break;
        case "s":
          o.offsetY -= 25;
          break;
        case "d":
          o.offsetX += 25;
          break;
        case "q":
          zoomCentre(o, 1);
          break;
        case "e":
          zoomCentre(o, -1);
          break;
        case "z":
          if (o.maxIterations < 10000) o.maxIterations += 100;
          break;
        case "x":
          if (o.maxIterations > 100) o.maxIterations -= 100;
          break;
        case "r":
          o.zoom = 1;
          o.offsetX = 0;
          o.offsetY = 0;
          o.maxIterations = 100;
          o.d = 2;
          if (o.cr && o.ci) {
            o.cr = JULIA_CR;
            o.ci = JULIA_CI;
          }
          break;
        default:
          handled = false;
      }
      if (!handled) return;
      setUi((u) => ({
        ...u,
        zoom: o.zoom,
        x: o.offsetX,
        y: o.offsetY,
        d: o.d,
        iterations: o.maxIterations,
        cr: o.cr ?? u.cr,
        ci: o.ci ?? u.ci,
      }));
      drawNow();
    };
    // Capture phase, because the number inputs stop propagation on the keys they reject
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, []);

  // Scroll to zoom, registered by hand because React attaches wheel listeners passively
  // and so could not stop the page scrolling underneath
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scale = backingScale(canvas.width, rect.width);
      // Normalise line and page deltas so every device reports in pixels
      const delta =
        e.deltaMode === 1
          ? e.deltaY * WHEEL_LINE_HEIGHT
          : e.deltaMode === 2
            ? e.deltaY * rect.height
            : e.deltaY;
      const factor = Math.min(
        Math.max(Math.exp(-delta * WHEEL_ZOOM_RATE), WHEEL_MIN_FACTOR),
        WHEEL_MAX_FACTOR,
      );
      zoomAt(
        optionsRef.current,
        factor,
        (e.clientX - rect.left - rect.width / 2) * scale,
        (e.clientY - rect.top - rect.height / 2) * scale,
      );
      scheduleCameraFrame();
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, []);

  /*
   * Drag and pinch, registered by hand so the press lands on the canvas itself rather than
   * on the island root React would otherwise delegate it to. global.css gives that root a
   * layout box because iOS Safari ignores a boxless listener target; binding here keeps
   * drag and pinch off that rule, though tap to zoom still rides the delegated click
   *
   * Only the press is bound to the canvas. Tracking and release listen on the window, so a
   * gesture follows the pointer wherever it travels instead of resting on pointer capture
   * holding for the whole of it. Both handlers ignore pointers they never saw pressed
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const down = (e: PointerEvent) => onPointerDown(canvas, e);
    const move = (e: PointerEvent) => onPointerMove(canvas, e);
    const end = (e: PointerEvent) => onPointerEnd(canvas, e);
    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  // Drop any frame still queued at unmount, kept apart from the wheel listener so an
  // early return there could never leave one pending
  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  // Typing only moves the display, so a keystroke never triggers a render
  const showValue = (key: NumericUiKey, value: number | null) => {
    if (!drawable(value)) return;
    setUi((u) => ({ ...u, [key]: value }));
  };

  /*
   * Committing applies the value to the draw state, on blur or Enter. Each guard bails when
   * the value is unchanged: rounding the display back to a committed value means a plain tab
   * through a field would otherwise fire a full synchronous render for no visible difference
   * A value the mapping cannot use puts the drawn one back, so the field never disagrees
   * with the canvas
   */
  const restore = (key: NumericUiKey, value: number) => setUi((u) => ({ ...u, [key]: value }));

  const commitZoom = (v: number | null) => {
    const o = optionsRef.current;
    if (!drawableZoom(v)) {
      restore("zoom", o.zoom);
      return;
    }
    if (v === o.zoom) return;
    o.zoom = v;
    requestRender();
  };
  const commitX = (v: number | null) => {
    const o = optionsRef.current;
    if (!drawable(v)) {
      restore("x", o.offsetX);
      return;
    }
    if (v === o.offsetX) return;
    o.offsetX = v;
    requestRender();
  };
  const commitY = (v: number | null) => {
    const o = optionsRef.current;
    if (!drawable(v)) {
      restore("y", o.offsetY);
      return;
    }
    if (v === o.offsetY) return;
    o.offsetY = v;
    requestRender();
  };
  const commitD = (v: number | null) => {
    const o = optionsRef.current;
    if (!drawable(v)) {
      restore("d", o.d);
      return;
    }
    if (v === o.d) return;
    o.d = v;
    requestRender();
  };
  const commitCr = (v: number | null) => {
    const o = optionsRef.current;
    if (!drawable(v)) {
      restore("cr", o.cr ?? JULIA_CR);
      return;
    }
    if (v === o.cr) return;
    o.cr = v;
    requestRender();
  };
  const commitCi = (v: number | null) => {
    const o = optionsRef.current;
    if (!drawable(v)) {
      restore("ci", o.ci ?? JULIA_CI);
      return;
    }
    if (v === o.ci) return;
    o.ci = v;
    requestRender();
  };
  const commitIterations = (v: number | null) => {
    const o = optionsRef.current;
    if (!drawable(v)) {
      restore("iterations", o.maxIterations);
      return;
    }
    if (v === o.maxIterations) return;
    o.maxIterations = v;
    requestRender();
  };

  const stepZoom = (dir: 1 | -1) => {
    const o = optionsRef.current;
    zoomCentre(o, dir);
    setUi((u) => ({ ...u, zoom: o.zoom, x: o.offsetX, y: o.offsetY }));
    requestRender();
  };
  const stepX = (dir: 1 | -1) => {
    optionsRef.current.offsetX += dir * 25;
    showValue("x", optionsRef.current.offsetX);
    requestRender();
  };
  const stepY = (dir: 1 | -1) => {
    optionsRef.current.offsetY += dir * 25;
    showValue("y", optionsRef.current.offsetY);
    requestRender();
  };
  const stepD = (dir: 1 | -1) => {
    optionsRef.current.d += dir * 0.25;
    showValue("d", optionsRef.current.d);
    requestRender();
  };
  const stepCr = (dir: 1 | -1) => {
    const o = optionsRef.current;
    if (o.cr === undefined) return;
    if (dir === -1) {
      if (o.cr > -2) o.cr -= 0.25;
    } else if (o.cr < 2) {
      o.cr += 0.25;
    }
    showValue("cr", o.cr);
    requestRender();
  };
  const stepCi = (dir: 1 | -1) => {
    const o = optionsRef.current;
    if (o.ci === undefined) return;
    if (dir === -1) {
      if (o.ci > -2) o.ci -= 0.05;
    } else if (o.ci < 2) {
      o.ci += 0.05;
    }
    showValue("ci", o.ci);
    requestRender();
  };
  const stepIterations = (dir: 1 | -1) => {
    const o = optionsRef.current;
    if (dir === 1) {
      if (o.maxIterations < 10000) o.maxIterations += 100;
    } else if (o.maxIterations > 100) {
      o.maxIterations -= 100;
    }
    showValue("iterations", o.maxIterations);
    requestRender();
  };

  const changeFractal = (kind: FractalKind) => {
    optionsRef.current.escapeFractal = FRACTALS[kind];
    setUi((u) => ({ ...u, fractal: kind }));
    requestRender();
  };
  const toggleJulia = (checked: boolean) => {
    const o = optionsRef.current;
    if (checked) {
      o.cr = JULIA_CR;
      o.ci = JULIA_CI;
    } else {
      o.cr = undefined;
      o.ci = undefined;
    }
    setUi((u) => ({
      ...u,
      julia: checked,
      cr: checked ? JULIA_CR : u.cr,
      ci: checked ? JULIA_CI : u.ci,
    }));
    requestRender();
  };
  const onReset = () => {
    const o = optionsRef.current;
    const reseed = Boolean(o.cr && o.ci);
    o.zoom = 1;
    o.offsetX = 0;
    o.offsetY = 0;
    o.d = 2;
    o.maxIterations = 100;
    if (reseed) {
      o.cr = JULIA_CR;
      o.ci = JULIA_CI;
    }
    setUi((u) => ({
      ...u,
      zoom: 1,
      x: 0,
      y: 0,
      d: 2,
      iterations: 100,
      cr: reseed ? JULIA_CR : u.cr,
      ci: reseed ? JULIA_CI : u.ci,
    }));
    requestRender();
  };

  const changeMethod = (value: ColorMethodKind) => {
    optionsRef.current.colorMethod = COLOR_METHODS[value];
    setUi((u) => ({ ...u, method: value }));
    requestRender();
  };
  const changePreset = (name: PresetKind) => {
    const [color, loop] = colorPresets[name];
    const next = { ...color };
    optionsRef.current.color = next;
    rebuildPalette(next, loop);
    setUi((u) => ({ ...u, preset: name, rgb: next, gradientLoop: loop }));
    requestRender();
  };
  const toggleLoop = (checked: boolean) => {
    rebuildPalette(optionsRef.current.color, checked);
    setUi((u) => ({ ...u, gradientLoop: checked }));
    requestRender();
  };
  const onRgbLive = (channel: keyof RGB, value: number) => {
    const color = { ...optionsRef.current.color, [channel]: value };
    optionsRef.current.color = color;
    rebuildPalette(color, ui.gradientLoop);
    setUi((u) => ({ ...u, rgb: color }));
  };
  const toggleAutoRender = (checked: boolean) => {
    autoRenderRef.current = checked;
    setUi((u) => ({ ...u, autoRender: checked }));
    requestRender();
  };

  // Reads the canvas rect once per gesture step, since offsets are in backing pixels
  const canvasFrame = (canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return { rect, scale: backingScale(canvas.width, rect.width) };
  };

  // Distance and midpoint between the two active pointers, in CSS pixels
  const pinchState = () => {
    const [a, b] = [...pointersRef.current.values()];
    if (!a || !b) return null;
    return { dist: Math.hypot(b.x - a.x, b.y - a.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
  };

  /*
   * A gesture can outpace the synchronous render, so collapse a burst into one camera sync
   * and at most one draw per frame. Respects auto-render like the steppers do
   */
  const scheduleCameraFrame = () => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const o = optionsRef.current;
      setUi((u) => ({ ...u, zoom: o.zoom, x: o.offsetX, y: o.offsetY }));
      if (autoRenderRef.current) drawNow();
    });
  };

  const onPointerDown = (canvas: HTMLCanvasElement, e: PointerEvent) => {
    const pointers = pointersRef.current;
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      dragRef.current = {
        active: true,
        moved: false,
        lastX: e.clientX,
        lastY: e.clientY,
        threshold: dragThresholdFor(e.pointerType),
      };
      return;
    }
    // Any further pointer restarts the pinch from the spread as it stands, so a stale
    // measurement can never survive into the next move
    dragRef.current.active = false;
    // A pinch is never a press, so the click that closes it must not zoom again
    dragRef.current.moved = true;
    pinchRef.current = pinchState();
  };

  const onPointerMove = (canvas: HTMLCanvasElement, e: PointerEvent) => {
    const pointers = pointersRef.current;
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size >= 2) {
      const previous = pinchRef.current;
      const next = pinchState();
      pinchRef.current = next;
      if (!previous || !next) return;
      const factor = next.dist / previous.dist;
      // A factor of one means a pointer outside the measured pair moved, which would
      // otherwise cost a full redraw for no change
      if (!Number.isFinite(factor) || factor === 1) return;
      const { rect, scale } = canvasFrame(canvas);
      zoomAt(
        optionsRef.current,
        factor,
        (next.cx - rect.left - rect.width / 2) * scale,
        (next.cy - rect.top - rect.height / 2) * scale,
      );
      scheduleCameraFrame();
      return;
    }

    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    // Keep the whole delta until the threshold clears, so the first accepted move
    // does not have a dead zone to jump back over
    if (!drag.moved && Math.hypot(dx, dy) < drag.threshold) return;
    drag.moved = true;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    const { scale } = canvasFrame(canvas);
    panBy(optionsRef.current, dx * scale, dy * scale);
    scheduleCameraFrame();
  };

  const onPointerEnd = (canvas: HTMLCanvasElement, e: PointerEvent) => {
    const pointers = pointersRef.current;
    // Listening on the window means most of what arrives belongs to somebody else
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    if (pointers.size >= 2) {
      // Re-measure from the pointers still down, never against one that has lifted
      pinchRef.current = pinchState();
      return;
    }
    pinchRef.current = null;
    const [remaining] = [...pointers.values()];
    if (remaining) {
      // Carry on panning with the finger still down rather than going dead until it lifts
      dragRef.current = {
        active: true,
        moved: true,
        lastX: remaining.x,
        lastY: remaining.y,
        threshold: dragThresholdFor(e.pointerType),
      };
      return;
    }
    dragRef.current.active = false;
  };

  // Zooms toward the tapped point, which stays put instead of drifting toward the centre
  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // A drag finishes with a click, which must not zoom on top of the pan
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scale = backingScale(canvas.width, rect.width);
    const o = optionsRef.current;
    zoomAt(
      o,
      1.15,
      (e.clientX - rect.left - rect.width / 2) * scale,
      (e.clientY - rect.top - rect.height / 2) * scale,
    );
    setUi((u) => ({ ...u, zoom: o.zoom, x: o.offsetX, y: o.offsetY }));
    requestRender();
  };

  const activeFractal = FRACTAL_OPTIONS.find((f) => f.value === ui.fractal)?.label ?? "Fractal";
  const canvasLabel = `${activeFractal}${ui.julia ? " Julia set" : ""}, ${ui.iterations} iterations`;

  // Everything the panel drives, gathered so the lazy boundary stays one prop
  const api: FractalControlsApi = {
    ui,
    paletteCanvasRef,
    showValue,
    commitZoom,
    commitX,
    commitY,
    commitD,
    commitCr,
    commitCi,
    commitIterations,
    stepZoom,
    stepX,
    stepY,
    stepD,
    stepCr,
    stepCi,
    stepIterations,
    changeFractal,
    changeMethod,
    changePreset,
    toggleJulia,
    toggleLoop,
    toggleAutoRender,
    onRgbLive,
    onReset,
    drawNow,
    requestRender,
  };

  return (
    <Card className="mx-auto w-fit max-w-full gap-2 pt-4">
      <CardHeader>
        <Stack direction="horizontal" justify="end" align="center">
          {/* Reserves the help button's box so the header does not jump when the chunk lands */}
          <Suspense fallback={<div aria-hidden="true" data-pending="help" className="h-9 w-20" />}>
            <FractalHelp />
          </Suspense>
        </Stack>
      </CardHeader>
      <CardContent>
        <Stack
          direction={{ base: "vertical", md: "horizontal" }}
          gap="lg"
          align="start"
          className="md:gap-40">
          <Stack gap="default" className="w-full md:w-72">
            {/* Reserves the panel's rendered height so mounting it does not shove the
                canvas down on mobile, where the controls sit above it */}
            <Suspense
              fallback={
                <div aria-hidden="true" data-pending="controls" className="min-h-[426px]" />
              }>
              <FractalControls api={api} />
            </Suspense>
          </Stack>

          <Stack gap="sm" align="center" className="w-full md:w-auto md:shrink-0">
            <div className="w-fit max-w-full rounded-md border border-border">
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                role="img"
                aria-label={canvasLabel}
                aria-describedby="canvas-hint"
                onClick={onCanvasClick}
                className={cn(
                  "block h-auto max-w-full cursor-crosshair select-none [-webkit-tap-highlight-color:transparent]",
                  hydrated ? "touch-none" : "touch-auto",
                )}
              />
            </div>
            <p id="canvas-hint" className="max-w-[320px] text-center text-xs text-muted-foreground">
              {coarsePointer
                ? "Drag to move, pinch or tap to zoom."
                : "Drag to move, press or scroll to zoom."}
            </p>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
