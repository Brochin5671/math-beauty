// @ts-check

/*
 * Adapter: swap to deploy elsewhere. Each is a one-line change
 *   Cloudflare (current): import cloudflare from "@astrojs/cloudflare"
 *   Vercel:               import vercel from "@astrojs/vercel"
 *   Netlify:              import netlify from "@astrojs/netlify"
 *   Node (self-hosted):   import node from "@astrojs/node"
 * `imageService: "compile"` is Cloudflare-specific (free-plan compatible)
 * Other adapters use sharp by default - drop the option on swap
 */
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import expressiveCode from "astro-expressive-code";
import favicons from "astro-favicons";
import { brand } from "./src/lib/site-config.ts";

// Build timestamp used as the sitemap `lastmod` (see the sitemap() serialize).
const buildDate = new Date().toISOString();

// https://astro.build/config
export default defineConfig({
  // Astro 5+ enables `security.checkOrigin: true` by default, which validates
  // the Origin header on POST/PUT/PATCH/DELETE to SSR routes (our `/api/contact`)
  // Free CSRF protection on top of the response-direction CSP in `_headers`
  adapter: cloudflare({ imageService: "compile" }),
  // no Astro sessions here: the memory driver stops the Cloudflare adapter from
  // provisioning an unused SESSION KV namespace on every deploy
  session: { driver: { entrypoint: "unstorage/drivers/memory" } },
  integrations: [
    /*
     * Expressive Code renders every markdown/MDX code fence (frames, titles,
     * copy button). The CodeBlock composite uses Shiki directly with the same
     * github themes, so fenced and component-rendered code stay visually in
     * sync. Themes follow the site's .dark class toggle, not the OS
     * preference. Keep this before any mdx() integration if one is added later
     */
    expressiveCode({
      themes: ["github-light", "github-dark"],
      themeCssSelector: (theme) => (theme.type === "dark" ? ".dark" : ":root:not(.dark)"),
      useDarkModeMediaQuery: false,
      styleOverrides: {
        borderRadius: "var(--radius)",
      },
      plugins: [
        /*
         * a11y: Expressive Code's <pre> scrolls horizontally for long lines
         * but, unlike Shiki's own output, ships no tabindex, so keyboard
         * users can't scroll it (axe scrollable-region-focusable, WCAG 2.1.1)
         * Add tabindex="0" to every rendered <pre>
         */
        {
          name: "pre-keyboard-scroll",
          hooks: {
            postprocessRenderedBlock: ({ renderData }) => {
              /** @param {any} node */
              const walk = (node) => {
                if (node?.type === "element" && node.tagName === "pre") {
                  node.properties = { ...node.properties, tabIndex: 0 };
                }
                for (const child of node?.children ?? []) walk(child);
              };
              walk(renderData.blockAst);
            },
          },
        },
      ],
    }),
    react(),
    // Playground is an internal design-showcase surface, not a public page;
    // exclude from sitemap so search engines don't crawl it
    sitemap({
      // Exclude the playground showcase and the /404 + /500 error pages
      filter: (page) => !page.includes("/playground") && !/\/(404|500)\/?$/.test(page),
      // Every entry is stamped with the build time as a baseline lastmod. For
      // per-page accuracy, look `item.url` up against a content date here and fall
      // back to the build date
      serialize(item) {
        item.lastmod = buildDate;
        return item;
      },
    }),
    /*
     * astro-favicons reads `public/favicon.svg` as the source and generates
     * the full icon set (16+ PNG sizes, ICO, manifest) at build time
     *
     * Brand name + short name come from src/lib/site-config.ts (single source)
     *
     * `public/favicon.svg` is the favicon source, a real vector (~4 KB).
     * astro-favicons rasterizes the downstream PNG variants
     * (16/32/48/180/192/512) from it at build time
     */
    favicons({
      name: process.env.PUBLIC_SITE_NAME || brand.name,
      short_name:
        process.env.PUBLIC_SITE_SHORT_NAME || process.env.PUBLIC_SITE_NAME || brand.shortName,
      themes: ["#0a0a0a"],
      /*
       * The PWA splash background. Matches the dark default the site ships
       * (`class="dark"` in Layout.astro); the generator's own default is #fff,
       * which flashes white before a dark app paints
       */
      background: "#0a0a0a",
    }),
  ],
  // Production URL (sitemap, canonical, OG): brand.url, or the PUBLIC_SITE_URL
  // build env where one is set
  site: process.env.PUBLIC_SITE_URL || brand.url,

  // System font stack only, no web font is loaded (see src/styles/global.css)

  /*
   * Type-safe env vars (astro:env). Read server secrets with
   * `import { CONTACT_API_KEY } from "astro:env/server"`, public client vars
   * from "astro:env/client". Local values live in `.dev.vars` (gitignored);
   * production secrets are set with `wrangler secret put`
   */
  env: {
    schema: {
      // Public value baked into the static page head at build time (set in the build env)
      GOOGLE_SITE_VERIFICATION: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
      // Public client vars use: envField.string({ context: "client", access: "public" })
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      /*
       * Pre-bundle the React island dependencies so Vite optimizes them at
       * startup instead of discovering them on first hydration mid-session. A
       * mid-session re-optimization forces a full reload that races the
       * Cloudflare (workerd) SSR render and briefly nulls React's shared
       * dispatcher, producing a flood of "Invalid hook call / Cannot read
       * properties of null (useContext)" dev errors (dev-only; the production
       * build is prebuilt and unaffected). Keep in sync
       * with the deps imported by React islands under src/components: add a
       * specifier here when a new island starts importing one
       */
      include: [
        // Astro's env runtime (astro:env/server), pulled in during SSR by
        // Layout.astro; discovered late otherwise
        "astro/env/runtime",
        // Core island deps: icons, forms, and the cn()/cva class helpers
        "lucide-react",
        "react-hook-form",
        "@hookform/resolvers/zod",
        "zod",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
        // Composite island deps (Carousel, Command, Calendar, Toast, DataTable,
        // Drawer, CodeBlock); shiki here uses the JS regex engine (no wasm)
        "embla-carousel-react",
        "cmdk",
        "react-day-picker",
        "sonner",
        "@tanstack/react-table",
        "vaul-base",
        "shiki/core",
        "shiki/engine/javascript",
        // @base-ui/react primitives behind the element + composite islands
        "@base-ui/react/accordion",
        "@base-ui/react/alert-dialog",
        "@base-ui/react/avatar",
        "@base-ui/react/button",
        "@base-ui/react/checkbox",
        "@base-ui/react/collapsible",
        "@base-ui/react/dialog",
        "@base-ui/react/input",
        "@base-ui/react/menu",
        "@base-ui/react/merge-props",
        "@base-ui/react/meter",
        "@base-ui/react/navigation-menu",
        "@base-ui/react/popover",
        "@base-ui/react/preview-card",
        "@base-ui/react/progress",
        "@base-ui/react/radio",
        "@base-ui/react/radio-group",
        "@base-ui/react/scroll-area",
        "@base-ui/react/separator",
        "@base-ui/react/slider",
        "@base-ui/react/switch",
        "@base-ui/react/tabs",
        "@base-ui/react/toggle",
        "@base-ui/react/toggle-group",
        "@base-ui/react/tooltip",
        "@base-ui/react/use-render",
      ],
    },
    // astro-favicons' virtual module needs the SSR dep optimizer to skip
    // prebundling its middleware
    ssr: {
      optimizeDeps: {
        exclude: ["astro-favicons/middleware"],
      },
    },
  },
});
