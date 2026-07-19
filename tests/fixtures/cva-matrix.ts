import { expect } from "vitest";

// Shared assertions for cva-presentational components. The goal is to test the
// variant API as a contract (every option is accepted and actually branches)
// without echoing the Tailwind class strings, which restate the CVA config and
// break on any restyle.

type VariantsConfig = {
  variants?: Record<string, Record<string, unknown>>;
  defaultVariants?: Record<string, unknown>;
};

// Minimal shape we need from a cva() factory: the introspectable config our
// wrapper attaches in src/lib/utils.ts. Callers pass the factory itself.
export type CvaFactory = {
  config?: VariantsConfig;
};

type Renderer = (props?: Record<string, unknown>) => string;

// Every axis name a factory declares, e.g. ["variant", "size"]
export function variantAxes(factory: CvaFactory): string[] {
  return Object.keys(factory.config?.variants ?? {});
}

// Option keys for one axis, e.g. ["default", "secondary", "destructive", ...]
export function axisOptions(factory: CvaFactory, axis: string): string[] {
  return Object.keys(factory.config?.variants?.[axis] ?? {});
}

// Assert every option on an axis is accepted and that a non-default option
// changes the class output, proving the axis is wired. Robust to class renames;
// fails only when an option is dropped or stops affecting the output.
export function expectAxisWired(factory: CvaFactory, axis: string): void {
  const render = factory as unknown as Renderer;
  const options = axisOptions(factory, axis);
  expect(options, `cva axis "${axis}" declares no options`).not.toHaveLength(0);

  const baseline = render({});
  // Coerce both sides to string: boolean axes (e.g. wrap) key their options as
  // "true"/"false" while defaultVariants stores the raw boolean.
  const defaultOption = String(factory.config?.defaultVariants?.[axis]);
  for (const option of options) {
    const out = render({ [axis]: option });
    expect(out, `${axis}=${option} must return a class string`).toBeTypeOf("string");
    if (option !== defaultOption) {
      expect(out, `${axis}=${option} must differ from the default option`).not.toBe(baseline);
    }
  }
}
