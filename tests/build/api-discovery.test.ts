import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { apiEndpoints } from "../fixtures/api-endpoints";

/*
 * Catches the "an API route was added under src/pages/api/ but nobody updated
 * to update apiEndpoints" failure mode (and vice versa) so every endpoint
 * has at least one matching fixture entry to drive smoke + behavioral tests
 *
 * With no APIs at all (no src/pages/api/), set
 * apiEndpoints = [] in the fixture and this test still passes
 */

const API_DIR = "src/pages/api";

function discoverApiPaths(): string[] {
  if (!existsSync(API_DIR)) return [];

  const paths: string[] = [];
  function walk(dir: string, urlPrefix: string) {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath, `${urlPrefix}/${entry}`);
      } else if (entry.endsWith(".ts") && !entry.includes(".test.")) {
        const name = entry.replace(/\.ts$/, "");
        paths.push(name === "index" ? urlPrefix : `${urlPrefix}/${name}`);
      }
    }
  }
  walk(API_DIR, "/api");
  return paths.sort();
}

describe("API endpoint discovery", () => {
  it("apiEndpoints fixture matches every route under src/pages/api/", () => {
    const filesystemPaths = discoverApiPaths();
    const fixturePaths = apiEndpoints.map((e) => e.path).sort();
    expect(filesystemPaths).toEqual(fixturePaths);
  });
});
