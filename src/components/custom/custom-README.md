# Custom components

Project-specific components for the Fractal Viewer, not designed for reuse across other projects.

## Current inventory

| Component | Purpose |
| --- | --- |
| `FractalViewer.tsx` | The interactive viewer island: a 320x320 canvas plus camera and render controls, hydrated on the home page. Drives the fractal engine in `src/lib/fractals/`. |
| `NumberStepper.tsx` | A labelled `[-] [number] [+]` control used by the viewer's camera inputs, composed from library Button, Input, Label and Stack. |

## What does NOT live here

- Reusable primitives (buttons, cards, dialogs) -> `src/components/elements/`.
- Reusable layout primitives (container, section, stack, grid) -> `src/components/layouts/`.
- Reusable page sections -> `src/components/blocks/`.
- Generic SEO primitives -> `src/components/seo/`.
- The fractal engine (algorithms, coloring, render) -> `src/lib/fractals/`.

If something here turns out to be reusable, promote it to the appropriate sibling folder.
