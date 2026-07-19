import { CircleHelp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NumberStepper } from "@/components/custom/NumberStepper";
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
import { RadioGroup, RadioGroupItem } from "@/components/forms/RadioGroup";
import { Select, SelectOption } from "@/components/forms/Select";
import { Slider } from "@/components/forms/Slider";
import { Switch } from "@/components/forms/Switch";
import { Stack } from "@/components/layouts/Stack";
import { FRACTALS } from "@/lib/fractals/algorithms";
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
import { mapToRange } from "@/lib/fractals/utils";

const JULIA_CR = -0.70176;
const JULIA_CI = 0.3842;

const FRACTAL_OPTIONS: { value: FractalKind; label: string }[] = [
  { value: "mandelbrot", label: "Mandelbrot Set" },
  { value: "ship", label: "Burning Ship" },
  { value: "tricorn", label: "Tricorn" },
  { value: "multibrot", label: "Multibrot Set" },
];

const PRESET_OPTIONS: { value: PresetKind; label: string }[] = [
  { value: "default", label: "Black & White" },
  { value: "rainbow", label: "Rainbow" },
  { value: "temperature", label: "Temperature" },
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

// Display state for the controlled inputs, never read by the draw path
interface Ui {
  fractal: FractalKind;
  method: ColorMethodKind;
  preset: PresetKind;
  gradientLoop: boolean;
  julia: boolean;
  autoRender: boolean;
  rgb: RGB;
  zoom: string;
  x: string;
  y: string;
  d: string;
  cr: string;
  ci: string;
  iterations: string;
}

function sliderValue(value: number | readonly number[]): number {
  return Array.isArray(value) ? (value[0] ?? 0) : (value as number);
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
    color: { r: 1, g: 1, b: 1 },
  });
  const paletteRef = useRef<Palette>([]);
  const autoRenderRef = useRef(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteCanvasRef = useRef<HTMLCanvasElement>(null);

  const [ui, setUi] = useState<Ui>({
    fractal: "mandelbrot",
    method: "iteration",
    preset: "default",
    gradientLoop: false,
    julia: false,
    autoRender: true,
    rgb: { r: 1, g: 1, b: 1 },
    zoom: "1",
    x: "0",
    y: "0",
    d: "2",
    cr: String(JULIA_CR),
    ci: String(JULIA_CI),
    iterations: "100",
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
    paletteRef.current = createPalette(optionsRef.current.color, false);
    drawPalettePreview(paletteCanvasRef.current, paletteRef.current);
    drawEscapeFractal(canvasRef.current, optionsRef.current, paletteRef.current);
  }, []);

  // Global keyboard controls, always redraw even when auto-render is off
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true'], [role='dialog']")) {
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
        zoom: String(o.zoom),
        x: String(o.offsetX),
        y: String(o.offsetY),
        d: String(o.d),
        iterations: String(o.maxIterations),
        cr: o.cr != null ? String(o.cr) : u.cr,
        ci: o.ci != null ? String(o.ci) : u.ci,
      }));
      drawEscapeFractal(canvasRef.current, optionsRef.current, paletteRef.current);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const setBuffer = (key: keyof Ui, raw: string) => setUi((u) => ({ ...u, [key]: raw }));

  const commitZoom = (raw: string) => {
    const v = Number.parseFloat(raw);
    if (!Number.isNaN(v)) optionsRef.current.zoom = v;
    requestRender();
  };
  const commitX = (raw: string) => {
    const v = Number.parseFloat(raw);
    if (!Number.isNaN(v)) optionsRef.current.offsetX = v;
    requestRender();
  };
  const commitY = (raw: string) => {
    const v = Number.parseFloat(raw);
    if (!Number.isNaN(v)) optionsRef.current.offsetY = v;
    requestRender();
  };
  const commitD = (raw: string) => {
    const v = Number.parseFloat(raw);
    if (!Number.isNaN(v)) optionsRef.current.d = v;
    requestRender();
  };
  const commitCr = (raw: string) => {
    const v = Number.parseFloat(raw);
    if (!Number.isNaN(v) && v <= 2 && v >= -2) optionsRef.current.cr = v;
    requestRender();
  };
  const commitCi = (raw: string) => {
    const v = Number.parseFloat(raw);
    if (!Number.isNaN(v) && v <= 2 && v >= -2) optionsRef.current.ci = v;
    requestRender();
  };
  const commitIterations = (raw: string) => {
    const v = Number.parseFloat(raw);
    if (!Number.isNaN(v) && v <= 10000 && v >= 100) optionsRef.current.maxIterations = v;
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
    setUi((u) => ({ ...u, zoom: String(o.zoom), x: String(o.offsetX), y: String(o.offsetY) }));
    requestRender();
  };
  const stepX = (dir: 1 | -1) => {
    optionsRef.current.offsetX += dir * 25;
    setBuffer("x", String(optionsRef.current.offsetX));
    requestRender();
  };
  const stepY = (dir: 1 | -1) => {
    optionsRef.current.offsetY += dir * 25;
    setBuffer("y", String(optionsRef.current.offsetY));
    requestRender();
  };
  const stepD = (dir: 1 | -1) => {
    optionsRef.current.d += dir * 0.25;
    setBuffer("d", String(optionsRef.current.d));
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
    setBuffer("cr", String(o.cr));
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
    setBuffer("ci", String(o.ci));
    requestRender();
  };
  const stepIterations = (dir: 1 | -1) => {
    const o = optionsRef.current;
    if (dir === 1) {
      if (o.maxIterations < 10000) o.maxIterations += 100;
    } else if (o.maxIterations > 100) {
      o.maxIterations -= 100;
    }
    setBuffer("iterations", String(o.maxIterations));
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
      cr: checked ? String(JULIA_CR) : u.cr,
      ci: checked ? String(JULIA_CI) : u.ci,
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
      zoom: "1",
      x: "0",
      y: "0",
      d: "2",
      iterations: "100",
      cr: reseed ? String(JULIA_CR) : u.cr,
      ci: reseed ? String(JULIA_CI) : u.ci,
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

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const target = e.currentTarget;
    const { left, top } = target.getBoundingClientRect();
    const width = target.clientWidth;
    const height = target.clientHeight;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const x = mapToRange(e.clientX - left, 0, width, -halfWidth, halfWidth);
    const y = mapToRange(e.clientY - top, 0, height, -halfHeight, halfHeight);
    const panFactor = width === 320 ? 7.25 : width === 275 ? 6 : 5;
    const o = optionsRef.current;
    o.zoom *= 1.15;
    o.offsetX = (o.offsetX + x / panFactor) * 1.15;
    o.offsetY = (o.offsetY - y / panFactor) * 1.15;
    setUi((u) => ({ ...u, zoom: String(o.zoom), x: String(o.offsetX), y: String(o.offsetY) }));
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
                <p>Click the canvas to zoom toward a point. Right-click to save the render.</p>
                <Stack gap="xs">
                  <p>
                    <Kbd>Q</Kbd> <Kbd>E</Kbd> zoom in and out
                  </p>
                  <p>
                    <Kbd>W</Kbd> <Kbd>A</Kbd> <Kbd>S</Kbd> <Kbd>D</Kbd> pan
                  </p>
                  <p>
                    <Kbd>Z</Kbd> <Kbd>X</Kbd> increase and decrease iterations
                  </p>
                  <p>
                    <Kbd>R</Kbd> reset the camera
                  </p>
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
                  <NumberStepper
                    id="zoom-input"
                    label="Zoom"
                    value={ui.zoom}
                    onValueChange={(raw) => setBuffer("zoom", raw)}
                    onCommit={commitZoom}
                    onStep={stepZoom}
                  />
                  {ui.fractal === "multibrot" && (
                    <NumberStepper
                      id="d-input"
                      label="Exponent"
                      value={ui.d}
                      step={0.25}
                      onValueChange={(raw) => setBuffer("d", raw)}
                      onCommit={commitD}
                      onStep={stepD}
                    />
                  )}
                  {ui.julia ? (
                    <>
                      <NumberStepper
                        id="cr-input"
                        label="Complex Real"
                        value={ui.cr}
                        step={0.25}
                        min={-2}
                        max={2}
                        onValueChange={(raw) => setBuffer("cr", raw)}
                        onCommit={commitCr}
                        onStep={stepCr}
                      />
                      <NumberStepper
                        id="ci-input"
                        label="Complex Imaginary"
                        value={ui.ci}
                        step={0.05}
                        min={-2}
                        max={2}
                        onValueChange={(raw) => setBuffer("ci", raw)}
                        onCommit={commitCi}
                        onStep={stepCi}
                      />
                    </>
                  ) : null}
                  <NumberStepper
                    id="x-input"
                    label="Pan X"
                    value={ui.x}
                    step={25}
                    onValueChange={(raw) => setBuffer("x", raw)}
                    onCommit={commitX}
                    onStep={stepX}
                  />
                  <NumberStepper
                    id="y-input"
                    label="Pan Y"
                    value={ui.y}
                    step={25}
                    onValueChange={(raw) => setBuffer("y", raw)}
                    onCommit={commitY}
                    onStep={stepY}
                  />
                  <NumberStepper
                    id="iterations-input"
                    label="Iterations"
                    value={ui.iterations}
                    step={100}
                    min={100}
                    max={10000}
                    onValueChange={(raw) => setBuffer("iterations", raw)}
                    onCommit={commitIterations}
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
                className="block h-auto max-w-full cursor-crosshair"
              />
            </div>
            <p id="canvas-hint" className="max-w-[320px] text-center text-xs text-muted-foreground">
              Click to zoom toward a point. Use Q and E to zoom, W A S D to pan.
            </p>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
