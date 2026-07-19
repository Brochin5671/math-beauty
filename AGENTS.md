# Fractal Viewer - Agent instructions

> Project context for AI coding agents. Recognized by Claude Code, Cursor, OpenAI Codex, Gemini CLI, and other tools that read [AGENTS.md](https://agents.md). Claude Code picks this up via a one-line `CLAUDE.md` containing `@AGENTS.md` (trampoline pattern, single source of truth).

## Core Engineering Principles
- Clarity over cleverness. Write code and docs that are obvious on first read.
- Explicit over implicit. State assumptions, dependencies, and constraints directly.
- Composition over inheritance. Prefer small, composable pieces over deep hierarchies.
- Fail fast and loud. Surface errors immediately with meaningful messages.
- Delete code you don't need. Dead code is misleading context.
- Verify, don't assume. Check that changes work before marking them done.

## Fundamentals
- Never assume or guess. Always ask if unclear.
- Show your work, then confirm. Present inferences and get user confirmation before acting.
- User stays in control. Hand opinionated decisions to the user.
- Incremental. Work with what already exists. Do not overwrite, replace, or ignore existing artifacts without asking.

## Project scope

This is the Fractal Viewer web app. The fractal engine (escape-time
algorithms, coloring, coordinate math, canvas render loop) lives in
`src/lib/fractals/`, and the interactive UI is the `FractalViewer` island in
`src/components/custom/`. The rest of
`src/components/{elements,composites,forms,layouts,blocks,seo}/` is this
project's reusable component library; treat it as stable and prefer additive
changes over modifying it unless a change is a genuine library improvement.

## WHAT
- **Framework**: Astro 7 + React 19 islands (interactive components only)
- **Language**: TypeScript 6 (project extends `astro/tsconfigs/strict`)
- **Styling**: Tailwind CSS 4 + shadcn/ui (base-vega style, `@base-ui/react` 1.6.x primitives, CVA variants); `Drawer` uses vaul-base (Base UI port of vaul)
- **Package manager**: pnpm 11
- **Deployment**: Cloudflare Workers via `wrangler deploy` + `@astrojs/cloudflare` adapter
- **Linting/Formatting**: Biome
- **Git hooks**: lefthook (pre-commit: biome check + prettier `*.astro` + tsc; commit-msg: commitlint; pre-push: block direct main)
- **Commit format**: Conventional Commits (enforced by commitlint)

### Component Architecture
- Astro components (`.astro`) - server-side, minimal JS by default. Use for pages and static content.
- React components (`.tsx`) - browser interactivity only. Prefer `client:visible` over `client:load` for below-the-fold.
- Elements (`src/components/elements/`) - foundational primitives that are modular, accessible, and fully customizable (Button, Badge, Card, Dialog, Tabs, ...). shadcn/ui pattern, PascalCase files, named exports.
- Composites (`src/components/composites/`) - pre-composed patterns built from elements, more opinionated because they wrap larger external libraries (`react-day-picker`, `embla-carousel`, `cmdk`, `@tanstack/react-table`, `sonner`, `shiki`, `astro-embed`) or compose multiple parts into a single behavior (Calendar, Carousel, CodeBlock, Command, DataTable, Embed, Stepper + MobileStepper, Toast). `Embed.astro` is server-rendered (no React island), the one composite that is `.astro`.
- Forms (`src/components/forms/`) - data-entry controls and form composition primitives (Input, Textarea, Switch, Label, NumberField, Field family). Same shadcn/ui pattern; separated by domain because forms span scales (atomic Input + compound Field + future block-level form sections) and have unique deps (react-hook-form, zod).
- Layouts (`src/components/layouts/`) - page structure (Container, Grid, Stack, Section, Header, Footer, Breadcrumb, ScrollArea).
- Block components (`src/components/blocks/`) - pre-composed page sections.
- Custom components (`src/components/custom/`) - project-specific. This app ships `FractalViewer`, the canvas viewer island.
- Fractal engine (`src/lib/fractals/`) - pure escape-time algorithms, coloring, coordinate utils and the canvas render loop. Framework-agnostic and unit-tested; the `FractalViewer` island drives it. Preserve the exact math when changing it.
- SEO components (`src/components/seo/`) - SEO meta-tag wrapper (title, canonical, Open Graph, Twitter card) and JsonLd primitive (typed structured-data wrapper).
- Content collections (`src/content/`) - none shipped; define one in `src/content.config.ts` with a glob loader when you add Markdown/MDX content.
- `cn()` from `@/lib/utils` for conditional Tailwind classes. CVA for component variants.
- Path alias `@/` maps to `src/`.

## HOW

### Commands

Most-used scripts. Run `pnpm run` for the full list (check:secrets, check:sast, check:deps, format, generate-types, test:coverage, test:watch, etc.).

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm check` | Biome lint + format with auto-fix |
| `pnpm check:types` | TypeScript type check |
| `pnpm test` | Unit + component tests (Vitest, happy-dom) |
| `pnpm test:e2e` | E2E + a11y tests (Playwright, needs prior build) |
| `pnpm preflight` | Full CI pipeline locally (secrets, sast, deps, commitlint, lint, format-astro, types, test, build, snapshots, E2E) |

### Agent dev server (Astro 7)

Astro 7 detects when it runs inside an AI coding agent and adapts the dev server so an agent does not tie up its session on a foreground process:

- `astro dev --background` runs the server detached, printing its URL and PID and writing a lockfile so a second start reuses the running instance instead of duplicating it. Astro enables this automatically under agent detection.
- `astro dev status` and `astro dev stop` inspect or stop that server from a separate command; `GET /_astro/status` is a machine-readable health check.
- `astro dev --json` emits structured JSON logs (also auto-enabled under agent detection). Add handlers with `logger: logHandlers.json()` (from `astro/config`) if you want JSON logging for humans too.

Humans keep using `pnpm dev` (foreground). These flags are for tooling that needs to launch, poll, and tear down the server programmatically.

### Style Rules
- PascalCase for all component files under `src/components/` (both `.astro` and `.tsx`). Kebab-case for pages and utility files.
- Named exports (not default exports) - except where Astro requires defaults (page components)
- Path alias `@/` for all imports (except colocated test files which may use `./Component`)
- **`class` vs `className`**: Astro components (`.astro`) take `class`; React components (`.tsx`) take `className`. `tsc --noEmit` does not validate Astro template attributes; the Astro language server catches mismatches in the IDE. Don't add `className` to Astro Props for convenience - keep the framework idiom (`class`) and let `cn()` / `class:list` merge.
- Present tense, imperative mood for commits: "add feature" not "added feature"
- Merge to `main` by squash (default; one clean PR-linked changelog entry) or rebase (to keep scoped commits as separate entries, no duplicate); use a merge commit only for a stacked PR onto a feature base (a merge commit to `main` is double-counted by semantic-release)

### Branch Naming
`feat/`, `fix/`, `chore/`, `refactor/`, `docs/` + short-description

### Project Tools

| Tool | Purpose |
|------|---------|
| Biome | Lint + format (JS, TS, JSON, JSONC, CSS) |
| Prettier (`prettier-plugin-astro`) | Format `.astro` files (Biome's Astro support is experimental) |
| lefthook | Git hooks manager |
| commitlint | Commit message validation (Conventional Commits) |
| gitleaks | Secret scanning (lefthook pre-commit + CI `secrets`) |
| Semgrep | SAST (CI `sast`, Docker container) |
| Trivy | CVE scan against `pnpm-lock.yaml` (preflight + CI `deps`) |
| Vitest | Unit + component tests (happy-dom) |
| Playwright | E2E + a11y tests via `pnpm exec playwright` (CLI). |
| axe-core | WCAG 2.1 + 2.2 AA scanning |
| gh | GitHub CLI for PRs/issues |
| wrangler | Cloudflare Workers CLI |
| semantic-release | Automated version + tag + GitHub Release |

## Output Preferences
- Tables for structured comparisons
- Bullet lists for enumerated items
- Code blocks for reviewable content
- Summary first, details on request

## Additional Documentation

- `README.md` - overview, controls, dev and deploy
- `SECURITY.md` - response headers, audit policy
- `CONTRIBUTING.md` - workflow, branch naming, commit format

## Mandatory Directives

### Parameterization markers (IMPORTANT)
`// CONFIGURE:` comment markers flag remaining project-specific swap points
(e.g. the deployed site URL). Do not remove a marker without setting its
value. Add new markers when introducing new project-specific values.

### Staleness Prevention (CRITICAL)
When codebase changes occur, update ALL affected artifacts BEFORE stopping:
- [ ] AGENTS.md - counts, descriptions, references still accurate?
- [ ] README.md - controls, commands, deploy notes still accurate?
- [ ] CHANGELOG.md - autogenerated by semantic-release from commits; never hand-edit. Confirm the commit message (Conventional Commits) captures the change.
- [ ] Code comments - updated to reflect changes, not left stale

### Comment Preservation (IMPORTANT)
Never strip existing code comments. Update stale comments. Only delete
comments that obviously restate the code itself.

### Scoped Commits (IMPORTANT)
Commits should be scoped like PRs. Split unrelated changes into separate commits.

### No AI Attribution (CRITICAL)
NEVER add Co-Authored-By, Generated-By, or any AI attribution lines to
commit messages.

### No Em Dashes in Tracked Files (IMPORTANT)
Never use em dashes in human-facing files: CHANGELOG, CONTRIBUTING, README,
SECURITY.md, page content, code comments. Replacements: `-` (hyphen) for labels and separators,
`,` for inline asides, `:` for definitions, `;` for related clauses.
Internal agent-tool config (`.claude/`, `.cursor/`, `.codex/`, `.gemini/`, memory files) are exempt.

### No Overengineering (IMPORTANT)
Do not add features, abstractions, or complexity beyond what was asked.
Three similar lines is better than a premature abstraction.

### No Phantom References
Only reference skills, rules, hooks, or doc pointers that actually exist.

### Library vs Consumer Boundary (IMPORTANT)
- Library code: `src/components/{elements,composites,forms,layouts,blocks,seo}/`, `src/lib/{utils,seo,structured-data}.ts`, `src/styles/global.css` (the layer + tokens part). Treat as stable; modify with care.
- App code: `src/pages/`, `src/components/custom/` (FractalViewer), `src/lib/fractals/`, `src/lib/site-config.ts`, brand parameterization points. Edit freely.

When asked for changes, default to app code. Modify library code
only when the change is genuinely a library improvement (and document it
in CHANGELOG with `feat(library):` or `fix(library):` scope).

Build pages and sections from the included library components first
(`elements`, `composites`, `forms`, `layouts`, `blocks`). Reach for
`src/components/custom/` only when no library component fits, or while you
iterate on a new component before it stabilizes. A custom component that
settles and gets reused belongs in the library, not `custom/`.

### Library-First UI (CRITICAL)
When building UI, reach for library primitives in `src/components/{elements,composites,forms,layouts,blocks,seo}/` BEFORE writing raw HTML + Tailwind utilities. Workarounds (`<div class="flex flex-col gap-4">`, `<div class="grid grid-cols-3">`, `<button class="bg-primary ...">`, `<a class="rounded-md border ...">`, hand-rolled card or item markup) duplicate behavior the library already owns: variant systems, focus rings, dark-mode tokens, ARIA wiring, mobile responsiveness, hover/active/disabled states.

**Reach for these primitives first:**

| If you would write... | Use instead |
|---|---|
| `<div class="flex flex-col gap-N">` / `<div class="flex flex-row gap-N">` | `<Stack direction={...} gap={...}>` |
| `<div class="grid grid-cols-N">` | `<Grid cols={N}>` |
| `<div class="mx-auto max-w-7xl">` | `<Container size={...}>` |
| `<section class="py-...">` with bespoke padding | `<Section padding={...}>` |
| `<main id="main-content" tabindex="-1">` | `<Main>` |
| `<article>` for blog posts / case studies / news items | `<Article density={...}>` |
| `<div style="aspect-ratio: 16/9">` or `<div class="aspect-video">` | `<AspectRatio ratio={...}>` |
| `<button class="bg-primary ...">` | `<Button variant={...} size={...}>` |
| `<a class="bg-primary ...">` styled link | `<Link variant={...}>` (`src/components/elements/Link.tsx`) |
| `<a class="card">` clickable list rows | `<Item href={...}>` |
| `<div class="rounded border bg-card ...">` card surface | `<Card>` (+ `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`) |
| Hand-rolled dropdown / menu / popover / dialog / tooltip / sheet | `<DropdownMenu>` / `<Popover>` / `<Dialog>` / `<Tooltip>` / `<Sheet>` from `src/components/elements/` |
| `<input>` / `<textarea>` / `<select>` styled by hand | `<Input>` / `<Textarea>` / `<Select>` from `src/components/forms/` |

**When workarounds are warranted:**
- The library primitive truly does not fit (one-off animation, an exact visual that cannot be expressed via existing variants).
- Adding a variant would over-fit the primitive to a single consumer.
- The pattern is one-off enough that extending the library would be premature abstraction.

**When you do reach for raw HTML/Tailwind:** flag it explicitly in your response so the user can decide whether to (a) extend the existing primitive, (b) introduce a new primitive, or (c) accept the workaround as a deliberate exception. Silent workarounds erode the library; tracked workarounds let the library grow.

## Self-Correcting

If a directive in this file is ignored or a command is hallucinated,
treat it as a bug in `AGENTS.md`. Refactor or re-prioritize the rule
rather than working around it. If a directive is unclear, ineffective,
or contradicts another, rewrite it.
