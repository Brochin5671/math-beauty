# Custom components

Project-specific components for the Fractal Viewer, not designed for reuse across other projects.

## Current inventory

| Component | Purpose |
| --- | --- |
| `FractalViewer.tsx` | The interactive viewer island: a 320x320 canvas plus camera and render controls, hydrated on the home page. Handles press, drag, wheel and pinch gestures, and drives the fractal engine in `src/lib/fractals/`. |
| `FractalControls.tsx` | The control panel and the help dialog, loaded lazily so the canvas is interactive before the Base UI form controls arrive. |
| `fractal-ui.ts` | Shared types, option tables and number formats for the two components above. |

The camera inputs use the library `NumberField`, and the camera math lives in
`src/lib/fractals/camera.ts`. Gestures bind the press to the canvas and track on
the window, because iOS Safari sends no pointer events to the `display:contents`
island root React would otherwise delegate them to (see `src/styles/global.css`).

## What does NOT live here

- Reusable primitives (buttons, cards, dialogs) -> `src/components/elements/`.
- Reusable layout primitives (container, section, stack, grid) -> `src/components/layouts/`.
- Reusable page sections -> `src/components/blocks/`.
- Generic SEO primitives -> `src/components/seo/`.
- The fractal engine (algorithms, coloring, render) -> `src/lib/fractals/`.

If something here turns out to be reusable, promote it to the appropriate sibling folder.
