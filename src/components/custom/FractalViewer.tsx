import { CircleHelp } from "lucide-react";
import { type ComponentProps, useEffect, useRef, useState } from "react";
import { Button } from "@/components/elements/Button";
import { ButtonGroup } from "@/components/elements/ButtonGroup";
import { Card, CardContent, CardHeader } from "@/components/elements/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/elements/Dialog";
import { Kbd } from "@/components/elements/Kbd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/elements/Tabs";
import { Label } from "@/components/forms/Label";
import { NumberField } from "@/components/forms/NumberField";
import { RadioGroup, RadioGroupItem } from "@/components/forms/RadioGroup";
import { Select, SelectOption } from "@/components/forms/Select";
import { Slider } from "@/components/forms/Slider";
import { Switch } from "@/components/forms/Switch";
import { Stack } from "@/components/layouts/Stack";
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

const JULIA_CR = -0.70176;
const JULIA_CI = 0.3842;

// CSS pixels a press may wander before it counts as a drag instead of a tap
const DRAG_THRESHOLD = 4;
// Wheel deltas are continuous, so zoom exponentially rather than by a fixed step, which a
// trackpad would apply dozens of times per flick. A 100px pixel-mode notch lands near the
// 1.15 the keyboard and tap use
const WHEEL_ZOOM_RATE = 0.0015;
// Pixels per line, matching what pixel-mode browsers report for one notch
const WHEEL_LINE_HEIGHT = 33;
// Page-mode deltas and runaway trackpads can report enormous values, so bound one event
const WHEEL_MIN_FACTOR = 0.25;
const WHEEL_MAX_FACTOR = 4;

const FRACTAL_OPTIONS: { value: FractalKind; label: string }[] = [
  { value: "mandelbrot", label: "Mandelbrot Set" },
  { value: "ship", label: "Burning Ship" },
  { value: "tricorn", label: "Tricorn" },
  { value: "multibrot", label: "Multibrot Set" },
];

// Seeds the palette, the gradient-loop switch and the picker, so the three cannot drift
const DEFAULT_PRESET: PresetKind = "temperature";
const [DEFAULT_COLOR, DEFAULT_LOOP] = colorPresets[DEFAULT_PRESET];

const PRESET_OPTIONS: { value: PresetKind; label: string }[] = [
  { value: "temperature", label: "Temperature" },
  { value: "default", label: "Black & White" },
  { value: "rainbow", label: "Rainbow" },
  { value: "whacky", label: "Whacky Gradients" },
];

const METHOD_OPTIONS: { value: ColorMethodKind; label: string }[] = [
  { value: "iteration", label: "Iteration" },
  { value: "smooth", label: "Smooth" },
];

const RGB_CHANNELS: { key: keyof RGB; label: string }[] = [
  { key: "r", label: "Red" },
  { key: "g", label: "Green" },
  { key: "b", label: "Blue" },
];

// Base UI renders the value through Intl.NumberFormat, whose default rounds to three
// decimals and groups thousands, so every field states the precision it needs
const ZOOM_FORMAT: Intl.NumberFormatOptions = { useGrouping: false, maximumSignificantDigits: 10 };
const DECIMAL_FORMAT: Intl.NumberFormatOptions = { useGrouping: false, maximumFractionDigits: 4 };
const COMPLEX_FORMAT: Intl.NumberFormatOptions = { useGrouping: false, maximumFractionDigits: 5 };
const ITERATIONS_FORMAT: Intl.NumberFormatOptions = {
  useGrouping: false,
  maximumFractionDigits: 0,
};

// Display state for the controlled inputs, never read by the draw path
interface Ui {
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

type NumericUiKey = "zoom" | "x" | "y" | "d" | "cr" | "ci" | "iterations";

function sliderValue(value: number | readonly number[]): number {
  return Array.isArray(value) ? (value[0] ?? 0) : (value as number);
}

// A value the coordinate mapping can use, so an empty field or an overflowing entry
// such as 1e999 never reaches the draw state
function drawable(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

// seed() divides by zoom, so a zero would map every pixel to infinity and blank the canvas
function drawableZoom(value: number | null): value is number {
  return drawable(value) && value !== 0;
}

// One labelled camera control, the same shape seven times over
function CameraField({
  id,
  label,
  ...field
}: { id: string; label: string } & Omit<ComponentProps<typeof NumberField>, "controlLabel">) {
  return (
    <Stack gap="none">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <NumberField
        {...field}
        id={id}
        controlLabel={label}
        className={cn("w-full [&_[data-slot=number-field-input]]:w-full", field.className)}
      />
    </Stack>
  );
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
  const dragRef = useRef({ active: false, moved: false, lastX: 0, lastY: 0 });
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
          o.zoom *= 1.15;
          o.offsetX *= 1.15;
          o.offsetY *= 1.15;
          break;
        case "e":
          o.zoom /= 1.15;
          o.offsetX /= 1.15;
          o.offsetY /= 1.15;
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
      drawEscapeFractal(canvasRef.current, optionsRef.current, paletteRef.current);
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
    if (dir === 1) {
      o.zoom *= 1.15;
      o.offsetX *= 1.15;
      o.offsetY *= 1.15;
    } else {
      o.zoom /= 1.15;
      o.offsetX /= 1.15;
      o.offsetY /= 1.15;
    }
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

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pointers = pointersRef.current;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      dragRef.current = { active: true, moved: false, lastX: e.clientX, lastY: e.clientY };
      return;
    }
    // Any further pointer restarts the pinch from the spread as it stands, so a stale
    // measurement can never survive into the next move
    dragRef.current.active = false;
    // A pinch is never a tap, so the click that closes it must not zoom again
    dragRef.current.moved = true;
    pinchRef.current = pinchState();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
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
      const { rect, scale } = canvasFrame(e.currentTarget);
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
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    drag.moved = true;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    const { scale } = canvasFrame(e.currentTarget);
    panBy(optionsRef.current, dx * scale, dy * scale);
    scheduleCameraFrame();
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pointers = pointersRef.current;
    pointers.delete(e.pointerId);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
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
      dragRef.current = { active: true, moved: true, lastX: remaining.x, lastY: remaining.y };
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

  return (
    <Card className="mx-auto w-fit max-w-full gap-2 pt-4">
      <CardHeader>
        <Stack direction="horizontal" justify="end" align="center">
          <Dialog>
            <DialogTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Help and keyboard shortcuts" />
              }>
              <CircleHelp />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How to use</DialogTitle>
                <DialogDescription>Controls and keyboard shortcuts</DialogDescription>
              </DialogHeader>
              <Stack gap="sm" className="text-sm">
                <p>
                  Tap to zoom toward a point, drag to move and scroll to zoom. Right-click to save
                  the render.
                </p>
                {/* Raw dl: Grid renders a div and cannot express the auto column these need */}
                <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
                  <dt className="flex gap-1">
                    <Kbd>Q</Kbd>
                    <Kbd>E</Kbd>
                  </dt>
                  <dd className="text-muted-foreground">Zoom in and out</dd>
                  <dt className="flex gap-1">
                    <Kbd>W</Kbd>
                    <Kbd>A</Kbd>
                    <Kbd>S</Kbd>
                    <Kbd>D</Kbd>
                  </dt>
                  <dd className="text-muted-foreground">Pan</dd>
                  <dt className="flex gap-1">
                    <Kbd>Z</Kbd>
                    <Kbd>X</Kbd>
                  </dt>
                  <dd className="text-muted-foreground">Increase and decrease iterations</dd>
                  <dt className="flex gap-1">
                    <Kbd>R</Kbd>
                  </dt>
                  <dd className="text-muted-foreground">Reset the camera</dd>
                </dl>
                <Stack gap="xs">
                  <p className="font-medium">Mobile</p>
                  <p className="text-muted-foreground">Drag to move, pinch to zoom.</p>
                </Stack>
              </Stack>
            </DialogContent>
          </Dialog>
        </Stack>
      </CardHeader>
      <CardContent>
        <Stack
          direction={{ base: "vertical", md: "horizontal" }}
          gap="lg"
          align="start"
          className="md:gap-32">
          <Stack gap="default" className="w-full md:w-72">
            <Stack gap="xs">
              <Label htmlFor="fractal-select">Fractal</Label>
              <Select
                id="fractal-select"
                value={ui.fractal}
                onChange={(e) => changeFractal(e.currentTarget.value as FractalKind)}
                className="w-full">
                {FRACTAL_OPTIONS.map(({ value, label }) => (
                  <SelectOption key={value} value={value}>
                    {label}
                  </SelectOption>
                ))}
              </Select>
            </Stack>

            <Tabs defaultValue="camera">
              <TabsList className="w-full">
                <TabsTrigger value="camera">Camera</TabsTrigger>
                <TabsTrigger value="render">Render</TabsTrigger>
              </TabsList>

              <TabsContent value="camera">
                <Stack gap="default">
                  <CameraField
                    id="zoom-input"
                    label="Zoom"
                    value={ui.zoom}
                    format={ZOOM_FORMAT}
                    onValueChange={(v) => showValue("zoom", v)}
                    onValueCommitted={commitZoom}
                    onStep={stepZoom}
                  />
                  {ui.fractal === "multibrot" && (
                    <CameraField
                      id="d-input"
                      label="Exponent"
                      value={ui.d}
                      step={0.25}
                      format={DECIMAL_FORMAT}
                      onValueChange={(v) => showValue("d", v)}
                      onValueCommitted={commitD}
                      onStep={stepD}
                    />
                  )}
                  {ui.julia ? (
                    <>
                      <CameraField
                        id="cr-input"
                        label="Complex Real"
                        value={ui.cr}
                        step={0.25}
                        min={-2}
                        max={2}
                        format={COMPLEX_FORMAT}
                        onValueChange={(v) => showValue("cr", v)}
                        onValueCommitted={commitCr}
                        onStep={stepCr}
                      />
                      <CameraField
                        id="ci-input"
                        label="Complex Imaginary"
                        value={ui.ci}
                        step={0.05}
                        min={-2}
                        max={2}
                        format={COMPLEX_FORMAT}
                        onValueChange={(v) => showValue("ci", v)}
                        onValueCommitted={commitCi}
                        onStep={stepCi}
                      />
                    </>
                  ) : null}
                  <CameraField
                    id="x-input"
                    label="Pan X"
                    value={ui.x}
                    step={25}
                    format={DECIMAL_FORMAT}
                    onValueChange={(v) => showValue("x", v)}
                    onValueCommitted={commitX}
                    onStep={stepX}
                  />
                  <CameraField
                    id="y-input"
                    label="Pan Y"
                    value={ui.y}
                    step={25}
                    format={DECIMAL_FORMAT}
                    onValueChange={(v) => showValue("y", v)}
                    onValueCommitted={commitY}
                    onStep={stepY}
                  />
                  <CameraField
                    id="iterations-input"
                    label="Iterations"
                    value={ui.iterations}
                    step={100}
                    min={100}
                    max={10000}
                    format={ITERATIONS_FORMAT}
                    onValueChange={(v) => showValue("iterations", v)}
                    onValueCommitted={commitIterations}
                    onStep={stepIterations}
                  />
                  <Stack direction="horizontal" gap="sm" justify="between" align="center">
                    <ButtonGroup>
                      <Button type="button" onClick={drawNow}>
                        Render
                      </Button>
                      <Button type="button" variant="outline" onClick={onReset}>
                        Reset
                      </Button>
                    </ButtonGroup>
                    <Stack direction="horizontal" gap="sm" align="center">
                      <Switch id="julia-toggle" checked={ui.julia} onCheckedChange={toggleJulia} />
                      <Label htmlFor="julia-toggle">Julia Set</Label>
                    </Stack>
                  </Stack>
                </Stack>
              </TabsContent>

              <TabsContent value="render">
                <Stack gap="default">
                  <Stack gap="xs">
                    <span className="text-sm font-medium">Coloring method</span>
                    <RadioGroup
                      aria-label="Coloring method"
                      value={ui.method}
                      onValueChange={(value) => changeMethod(value as ColorMethodKind)}>
                      <Stack direction="horizontal" gap="lg">
                        {METHOD_OPTIONS.map(({ value, label }) => (
                          <Stack key={value} direction="horizontal" gap="sm" align="center">
                            <RadioGroupItem value={value} id={`method-${value}`} />
                            <Label htmlFor={`method-${value}`}>{label}</Label>
                          </Stack>
                        ))}
                      </Stack>
                    </RadioGroup>
                  </Stack>

                  <Stack gap="xs">
                    <Label htmlFor="preset-select">Color preset</Label>
                    <Select
                      id="preset-select"
                      value={ui.preset}
                      onChange={(e) => changePreset(e.currentTarget.value as PresetKind)}
                      className="w-full">
                      {PRESET_OPTIONS.map(({ value, label }) => (
                        <SelectOption key={value} value={value}>
                          {label}
                        </SelectOption>
                      ))}
                    </Select>
                  </Stack>

                  <Stack direction="horizontal" gap="sm" align="center">
                    <Switch
                      id="loop-toggle"
                      checked={ui.gradientLoop}
                      onCheckedChange={toggleLoop}
                    />
                    <Label htmlFor="loop-toggle">Gradient Loop</Label>
                  </Stack>

                  <Stack gap="sm">
                    <span className="text-sm font-medium">Color factors and shifts</span>
                    {RGB_CHANNELS.map(({ key, label }) => (
                      <Stack key={key} gap="xs">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <Slider
                          min={0}
                          max={30}
                          step={1}
                          value={[ui.rgb[key]]}
                          thumbLabels={[`${label} factor or shift`]}
                          onValueChange={(value) => onRgbLive(key, sliderValue(value))}
                          onValueCommitted={() => requestRender()}
                        />
                      </Stack>
                    ))}
                  </Stack>

                  <Stack gap="xs">
                    <span className="text-xs text-muted-foreground">Palette preview</span>
                    <canvas
                      ref={paletteCanvasRef}
                      width={256}
                      height={20}
                      role="img"
                      aria-label="Current color palette"
                      className="block h-5 w-full rounded-sm"
                    />
                  </Stack>

                  <Stack direction="horizontal" gap="sm" align="center">
                    <Switch
                      id="auto-render-toggle"
                      checked={ui.autoRender}
                      onCheckedChange={toggleAutoRender}
                    />
                    <Label htmlFor="auto-render-toggle">Auto-render</Label>
                  </Stack>
                </Stack>
              </TabsContent>
            </Tabs>
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
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
                className="block h-auto max-w-full cursor-crosshair touch-none select-none [-webkit-tap-highlight-color:transparent]"
              />
            </div>
            <Stack gap="xs" align="center" className="max-w-[320px] text-xs text-muted-foreground">
              <p id="canvas-hint" className="text-center">
                Tap to zoom toward a point.
              </p>
              {/* The keys repeat what the dialog already describes, so keep them out of the
                  canvas description rather than announcing them twice */}
              <p aria-hidden="true" className="flex flex-wrap items-center justify-center gap-1">
                <Kbd size="sm">Q</Kbd>
                <Kbd size="sm">E</Kbd>
                <span>zoom</span>
                <Kbd size="sm">W</Kbd>
                <Kbd size="sm">A</Kbd>
                <Kbd size="sm">S</Kbd>
                <Kbd size="sm">D</Kbd>
                <span>pan</span>
              </p>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
