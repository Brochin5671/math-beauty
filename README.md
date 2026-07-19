# Fractal Viewer

## Overview

A website for viewing escape fractals such as the [Mandelbrot Set](https://en.wikipedia.org/wiki/Mandelbrot_set), [Burning Ship fractal](https://en.wikipedia.org/wiki/Burning_Ship_fractal), [Tricorn Set](<https://en.wikipedia.org/wiki/Tricorn_(mathematics)>) and the [Multibrot Set](https://en.wikipedia.org/wiki/Multibrot_set) along with a [Julia Set](https://en.wikipedia.org/wiki/Julia_set) variant for each. Camera and render controls adjust position, zoom, iterations, the exponent, the Julia constant and the coloring. Built with Astro 7, React 19 islands, TypeScript and Tailwind CSS 4 with a shadcn / Base UI component library, deployed to Cloudflare Workers; the fractal engine renders per pixel on a 2D canvas in the browser. Unit tests guard the fractal algorithms against regressions.

## Controls

- Fractal picker: Mandelbrot, Burning Ship, Tricorn, Multibrot, each with a Julia toggle
- Camera: zoom, pan, iterations, exponent (Multibrot), complex constant (Julia)
- Render: iteration or smooth coloring, palette presets, gradient loop, RGB factors, auto-render
- Click the canvas to zoom toward a point
- Keyboard: `Q` / `E` zoom, `W` `A` `S` `D` pan, `Z` / `X` iterations, `R` reset

## Development

Requires Node 24+ and pnpm 11+.

```bash
git clone https://github.com/Brochin5671/math-beauty.git
cd math-beauty
pnpm install
pnpm dev
```

The dev server runs at http://localhost:4321.

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview the production build |
| `pnpm test` | Unit and component tests (Vitest) |
| `pnpm test:e2e` | End-to-end and accessibility tests (Playwright, needs a prior build) |
| `pnpm preflight` | Run the full CI pipeline locally |

## Deployment

Deploys to Cloudflare Workers via the `@astrojs/cloudflare` adapter. A push to `main` builds, runs the end-to-end and accessibility gates, then runs `wrangler deploy`. Set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions repository secrets.

## License

MIT. See [LICENSE](LICENSE).

Developed by Maxim Brochin.
