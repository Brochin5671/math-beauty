import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // tsconfigPaths picks up the `@/*` alias from tsconfig.json so paths have one
  // source of truth; tailwindcss compiles `@/styles/global.css` for the browser
  // project so its computed-style assertions reflect the real design tokens
  plugins: [tsconfigPaths(), tailwindcss()],
  // Force a single React instance across the prebundle so Base UI's hooks
  // (useRef/useId in @base-ui/utils) do not read a null dispatcher
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@base-ui/react"],
  },
  test: {
    testTimeout: 5_000,
    // Auto-isolation: cleans up spies, env stubs, and global stubs between tests
    // so isolation never depends on a test remembering to clean up
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    // Block stray .only commits from passing CI; allow locally for focused debugging
    allowOnly: !process.env.CI,
    // Show full assertion diffs in failures (default truncates at 40 chars)
    chaiConfig: { truncateThreshold: 0 },
    // Inline PR annotations on test failures when running on GitHub Actions runners
    reporters: process.env.GITHUB_ACTIONS ? ["default", "github-actions"] : ["default"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/components/**/*.tsx"],
      // render.ts is canvas glue whose loop cannot run under happy-dom (no 2D context)
      exclude: [
        "src/components/**/*.astro",
        "**/*.test.*",
        "**/playground/**",
        "src/lib/fractals/render.ts",
      ],
      // CONFIGURE: a baseline, not a mandate. Each floor sits a few points under this
      // codebase's measured coverage, so refactors keep headroom but a real regression fails
      // the CI `tests` job (which runs `test:coverage`). Re-measure with `pnpm test:coverage`
      // and reset for your own code; a scaffold that drops features starts lower until you add
      // tests. Aggregate-only for now; revisit perFile + raising the floor once the suite
      // stabilizes
      thresholds: {
        statements: 78,
        branches: 74,
        functions: 68,
        lines: 78,
      },
    },
    projects: [
      {
        // Unit tests: pure-function and module tests in `.test.ts` files
        // Same happy-dom + setup as `components` so both share fixtures
        extends: true,
        test: {
          name: "unit",
          environment: "happy-dom",
          include: ["src/**/*.test.ts"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        // Component tests: React components in `.test.tsx` files (RTL)
        // Split from `unit` so the script-to-project mapping is 1:1.
        // Excludes `*.browser.test.tsx` so those run only in the `browser`
        // project below, never twice
        extends: true,
        test: {
          name: "components",
          environment: "happy-dom",
          include: ["src/**/*.test.tsx"],
          exclude: ["src/**/*.browser.test.tsx"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
      {
        // Build snapshot tests: parse dist/*.html with Cheerio in node
        // Requires a prior `pnpm build`. No DOM, no setup file
        extends: true,
        test: {
          name: "build",
          environment: "node",
          include: ["tests/build/**/*.test.ts"],
        },
      },
    ],
  },
});
