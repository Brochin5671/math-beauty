import { readFileSync } from "node:fs";
import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import { distPath } from "../fixtures/site-pages";

/*
 * The prerendered canvas ships before the island hydrates, so it has no gesture handler yet.
 * If it claimed touch-action none up front it would swallow every touch in that window: no
 * pan, no pinch, and no page scroll either, which reads as a broken canvas rather than one
 * that is not ready. The island takes touch-action over once its handlers exist
 */
describe("prerendered canvas", () => {
  const html = readFileSync(distPath("/"), "utf8");
  const $ = load(html);
  const className = $("canvas[aria-describedby='canvas-hint']").attr("class") ?? "";

  it("leaves touch behaviour to the browser before hydration", () => {
    expect(className).toContain("touch-auto");
    expect(className).not.toContain("touch-none");
  });
});
