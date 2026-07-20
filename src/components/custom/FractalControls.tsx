import { CircleHelp } from "lucide-react";
import type { ComponentProps } from "react";
import {
  COMPLEX_FORMAT,
  DECIMAL_FORMAT,
  FRACTAL_OPTIONS,
  type FractalControlsApi,
  ITERATIONS_FORMAT,
  METHOD_OPTIONS,
  PRESET_OPTIONS,
  RGB_CHANNELS,
  ZOOM_FORMAT,
} from "@/components/custom/fractal-ui";
import { Button } from "@/components/elements/Button";
import { ButtonGroup } from "@/components/elements/ButtonGroup";
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
import type { ColorMethodKind, FractalKind, PresetKind } from "@/lib/fractals/types";
import { cn } from "@/lib/utils";

/*
 * The viewer's control panel and help dialog, split out so the island can load them after
 * the canvas is interactive. Together they pull in most of the Base UI surface this app
 * uses, which is the bulk of the island's JavaScript
 */

function sliderValue(value: number | readonly number[]): number {
  return Array.isArray(value) ? (value[0] ?? 0) : (value as number);
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

export function FractalHelp() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" />}>
        <CircleHelp className="size-5" />
        Help
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How to use</DialogTitle>
          <DialogDescription>Controls and keyboard shortcuts</DialogDescription>
        </DialogHeader>
        <Stack gap="sm" className="text-sm">
          <p>Drag to move, press or scroll to zoom.</p>
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
            <p className="text-muted-foreground">Drag to move, pinch or tap to zoom.</p>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export function FractalControls({ api }: { api: FractalControlsApi }) {
  return (
    <Stack gap="default" className="w-full md:w-72">
      <Stack gap="xs">
        <Label htmlFor="fractal-select">Fractal</Label>
        <Select
          id="fractal-select"
          value={api.ui.fractal}
          onChange={(e) => api.changeFractal(e.currentTarget.value as FractalKind)}
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
              value={api.ui.zoom}
              format={ZOOM_FORMAT}
              onValueChange={(v) => api.showValue("zoom", v)}
              onValueCommitted={api.commitZoom}
              onStep={api.stepZoom}
            />
            {api.ui.fractal === "multibrot" && (
              <CameraField
                id="d-input"
                label="Exponent"
                value={api.ui.d}
                step={0.25}
                format={DECIMAL_FORMAT}
                onValueChange={(v) => api.showValue("d", v)}
                onValueCommitted={api.commitD}
                onStep={api.stepD}
              />
            )}
            {api.ui.julia ? (
              <>
                <CameraField
                  id="cr-input"
                  label="Complex Real"
                  value={api.ui.cr}
                  step={0.25}
                  min={-2}
                  max={2}
                  format={COMPLEX_FORMAT}
                  onValueChange={(v) => api.showValue("cr", v)}
                  onValueCommitted={api.commitCr}
                  onStep={api.stepCr}
                />
                <CameraField
                  id="ci-input"
                  label="Complex Imaginary"
                  value={api.ui.ci}
                  step={0.05}
                  min={-2}
                  max={2}
                  format={COMPLEX_FORMAT}
                  onValueChange={(v) => api.showValue("ci", v)}
                  onValueCommitted={api.commitCi}
                  onStep={api.stepCi}
                />
              </>
            ) : null}
            <CameraField
              id="x-input"
              label="Pan X"
              value={api.ui.x}
              step={25}
              format={DECIMAL_FORMAT}
              onValueChange={(v) => api.showValue("x", v)}
              onValueCommitted={api.commitX}
              onStep={api.stepX}
            />
            <CameraField
              id="y-input"
              label="Pan Y"
              value={api.ui.y}
              step={25}
              format={DECIMAL_FORMAT}
              onValueChange={(v) => api.showValue("y", v)}
              onValueCommitted={api.commitY}
              onStep={api.stepY}
            />
            <CameraField
              id="iterations-input"
              label="Iterations"
              value={api.ui.iterations}
              step={100}
              min={100}
              max={10000}
              format={ITERATIONS_FORMAT}
              onValueChange={(v) => api.showValue("iterations", v)}
              onValueCommitted={api.commitIterations}
              onStep={api.stepIterations}
            />
            <Stack direction="horizontal" gap="sm" justify="between" align="center">
              <ButtonGroup>
                <Button type="button" onClick={api.drawNow}>
                  Render
                </Button>
                <Button type="button" variant="outline" onClick={api.onReset}>
                  Reset
                </Button>
              </ButtonGroup>
              <Stack direction="horizontal" gap="sm" align="center">
                <Switch
                  id="julia-toggle"
                  checked={api.ui.julia}
                  onCheckedChange={api.toggleJulia}
                />
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
                value={api.ui.method}
                onValueChange={(value) => api.changeMethod(value as ColorMethodKind)}>
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
                value={api.ui.preset}
                onChange={(e) => api.changePreset(e.currentTarget.value as PresetKind)}
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
                checked={api.ui.gradientLoop}
                onCheckedChange={api.toggleLoop}
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
                    value={[api.ui.rgb[key]]}
                    thumbLabels={[`${label} factor or shift`]}
                    onValueChange={(value) => api.onRgbLive(key, sliderValue(value))}
                    onValueCommitted={() => api.requestRender()}
                  />
                </Stack>
              ))}
            </Stack>

            <Stack gap="xs">
              <span className="text-xs text-muted-foreground">Palette preview</span>
              <canvas
                ref={api.paletteCanvasRef}
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
                checked={api.ui.autoRender}
                onCheckedChange={api.toggleAutoRender}
              />
              <Label htmlFor="auto-render-toggle">Auto-render</Label>
            </Stack>
          </Stack>
        </TabsContent>
      </Tabs>
    </Stack>
  );
}
