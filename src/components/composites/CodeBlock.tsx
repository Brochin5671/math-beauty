import { CheckIcon, CopyIcon } from "lucide-react";
import type * as React from "react";
import { createHighlighterCoreSync, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import astro from "shiki/langs/astro.mjs";
import bash from "shiki/langs/bash.mjs";
import css from "shiki/langs/css.mjs";
import html from "shiki/langs/html.mjs";
import javascript from "shiki/langs/javascript.mjs";
import json from "shiki/langs/json.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import githubDark from "shiki/themes/github-dark.mjs";
import githubLight from "shiki/themes/github-light.mjs";
import { Button } from "@/components/elements/Button";
import { cn } from "@/lib/utils";

/*
 * Syntax-highlighted code block with an optional title bar and copy button,
 * built on Shiki's sync core (same engine and themes Astro uses for markdown
 * fences, so both stay in sync).
 *
 * Render it WITHOUT a client: directive: highlighting is server-side and the
 * copy button wires through a tiny inline script, so grammars never ship to
 * the browser. Hydrating works (the playground tile does) but pays for Shiki
 * in the client bundle
 */

// Grammars bundled with the component; anything else falls back to plaintext.
// Add more by importing above and listing here plus in the highlighter
const BUNDLED_LANGS = [
  "astro",
  "bash",
  "css",
  "html",
  "javascript",
  "json",
  "tsx",
  "typescript",
] as const;
type BundledLang = (typeof BUNDLED_LANGS)[number];

// Named palettes bundled with the component, a curated slice of Shiki's
// catalog. Each theme rides in the server bundle, so keep the set
// deliberate: to add one, import it above and list it here
const BUNDLED_THEMES = ["github-dark", "github-light"] as const;
type BundledTheme = (typeof BUNDLED_THEMES)[number];

const highlighter: HighlighterCore = createHighlighterCoreSync({
  themes: [githubDark, githubLight],
  langs: [astro, bash, css, html, javascript, json, tsx, typescript],
  engine: createJavaScriptRegexEngine(),
});

/*
 * Copy-to-clipboard via event delegation: one document-level listener
 * (guarded so repeated blocks bind once) instead of per-block hydration.
 * data-copied drives the icon swap and clears after a moment
 */
const COPY_SCRIPT = `if(!window.__codeBlockCopy){window.__codeBlockCopy=true;document.addEventListener("click",function(e){var btn=e.target&&e.target.closest&&e.target.closest("[data-code-copy]");if(!btn)return;var block=btn.closest('[data-slot="code-block"]');var code=block&&block.querySelector("pre code");if(!code||!navigator.clipboard)return;navigator.clipboard.writeText(code.innerText).then(function(){btn.setAttribute("data-copied","");setTimeout(function(){btn.removeAttribute("data-copied")},2000)})})}`;

interface CodeBlockProps extends React.ComponentProps<"figure"> {
  /** The code to display */
  code: string;
  /** Language for syntax highlighting. Unknown values render as plaintext */
  lang?: BundledLang | (string & {});
  /** Optional label shown in the title bar, e.g. a file name */
  title?: string;
  /**
   * Palette for the whole block. A named theme ("github-dark" by default)
   * bakes that palette into both the code and its frame, independent of the
   * site theme and the device; "system" follows the site's .dark toggle with
   * the github pair and draws the frame from the site surface.
   */
  theme?: BundledTheme | "system";
  /** Wrap long lines instead of scrolling horizontally */
  wrap?: boolean;
  /** Show the copy-to-clipboard button. Default true */
  canCopy?: boolean;
}

function CodeBlock({
  code,
  lang = "text",
  title,
  theme = "github-dark",
  wrap = false,
  canCopy = true,
  className,
  style,
  ...props
}: CodeBlockProps) {
  const language = (BUNDLED_LANGS as readonly string[]).includes(lang) ? lang : "text";
  const isSystem = theme === "system";
  const resolvedTheme = (BUNDLED_THEMES as readonly string[]).includes(theme)
    ? (theme as BundledTheme)
    : "github-dark";
  // Named themes emit absolute inline colors (no CSS dependence); "system"
  // emits both palettes as CSS variables with defaultColor: false, and
  // global.css activates --shiki-light by default, --shiki-dark under .dark
  const highlighted = isSystem
    ? highlighter.codeToHtml(code, {
        lang: language,
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
      })
    : highlighter.codeToHtml(code, { lang: language, theme: resolvedTheme });

  // A forced theme drives the whole frame off the theme's own surface, so the
  // header and copy button match the code canvas instead of the site. The
  // header and divider are a translucent tint of the theme foreground over
  // that surface. System mode keeps the site tokens, since the code already
  // follows the site theme there
  const palette = isSystem ? undefined : highlighter.getTheme(resolvedTheme);
  const surfaceStyle = palette
    ? { backgroundColor: palette.bg, color: palette.fg, ...style }
    : style;

  return (
    <figure
      data-slot="code-block"
      className={cn(
        "overflow-hidden rounded-lg border",
        isSystem ? "border-border bg-card" : "border-current/15",
        className,
      )}
      style={surfaceStyle}
      {...props}>
      {title || canCopy ? (
        <div
          className={cn(
            "flex min-h-10 items-center justify-between gap-2 border-b py-1 pr-2 pl-4",
            isSystem
              ? "border-border bg-muted/50 text-muted-foreground"
              : "border-current/15 bg-current/[0.05]",
          )}>
          <figcaption className={cn("truncate font-mono text-xs", !isSystem && "opacity-70")}>
            {title}
          </figcaption>
          {canCopy ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Copy code"
              data-code-copy
              className={cn(
                "group/copy shrink-0",
                isSystem
                  ? "text-muted-foreground"
                  : "text-current opacity-70 hover:bg-current/15 hover:opacity-100",
              )}>
              <CopyIcon className="group-data-copied/copy:hidden" />
              <CheckIcon className="hidden group-data-copied/copy:block" />
            </Button>
          ) : null}
        </div>
      ) : null}
      <div
        className={cn(
          "text-sm [&_pre]:my-0 [&_pre]:rounded-none",
          wrap && "[&_pre]:whitespace-pre-wrap",
        )}
        // safe: shiki html-escapes the code prop, so this output is not user-controlled markup
        dangerouslySetInnerHTML={{ __html: highlighted }} // nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml
      />
      {canCopy ? (
        // safe: constant script, see COPY_SCRIPT
        <script dangerouslySetInnerHTML={{ __html: COPY_SCRIPT }} />
      ) : null}
    </figure>
  );
}

export { CodeBlock, type CodeBlockProps };
