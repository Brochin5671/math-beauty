# Custom components

Project-specific components for the Fractal Viewer, not designed for reuse across other projects.

## Current inventory

| Component | Purpose |
| --- | --- |
| `FractalViewer.tsx` | The interactive viewer island: a 320x320 canvas plus camera and render controls, hydrated on the home page. Handles tap, drag, wheel and pinch gestures, and drives the fractal engine in `src/lib/fractals/`. |

The camera inputs use the library `NumberField`, and the camera math lives in
`src/lib/fractals/camera.ts`.

## What does NOT live here

- Reusable primitives (buttons, cards, dialogs) -> `src/components/elements/`.
- Reusable layout primitives (container, section, stack, grid) -> `src/components/layouts/`.
- Reusable page sections -> `src/components/blocks/`.
- Generic SEO primitives -> `src/components/seo/`.
- The fractal engine (algorithms, coloring, render) -> `src/lib/fractals/`.

If something here turns out to be reusable, promote it to the appropriate sibling folder.
