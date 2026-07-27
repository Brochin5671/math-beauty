import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * `components.json` points shadcn's `ui` alias at `src/components/ui/`, which is
 * a staging area: `shadcn add` writes there, the component gets adapted into
 * elements/, composites/ or forms/, and the staged copy is deleted.
 *
 * A staged copy left behind splits the library across two conventions, because
 * the CLI writes kebab-case filenames and rewrites intra-registry imports to
 * match, while this library is PascalCase. Both files then coexist and the
 * generated imports resolve to the unadapted one.
 *
 * This is the only thing enforcing that cleanup step
 */

const COMPONENTS_DIR = import.meta.dirname;

/*
 * Read out of components.json rather than hardcoded, so repointing the alias moves
 * this check with it instead of leaving it guarding a directory shadcn no longer
 * writes to
 */
const { aliases } = JSON.parse(
  readFileSync(join(COMPONENTS_DIR, "../../components.json"), "utf8"),
) as { aliases: { ui: string } };
const STAGING_DIR = join(COMPONENTS_DIR, "..", aliases.ui.replace(/^@\//, ""));

describe("shadcn staging directory", () => {
  /*
   * "the directory is empty" is satisfied by "the directory could not be found",
   * so a path that stopped resolving would make the assertion below pass forever
   * while checking nothing. Verified by mutation: an earlier version of this file
   * resolved its path a different way, silently found nothing, and stayed green
   * with a staged component sitting in the tree
   */
  it("resolves the directory it is asserting about", () => {
    /*
     * `existsSync(COMPONENTS_DIR)` is not worth asserting: COMPONENTS_DIR is this
     * file's own directory, so it cannot be false. What can be false is whether the
     * alias resolves onto the tree, which is what the empty branch below turns on
     *
     * Only the `@/` form maps onto `src/`, and shadcn users do write a bare
     * `src/components/ui`, which would resolve to a path that never exists and take
     * the empty branch forever
     */
    expect(aliases.ui, "components.json ui alias must use the @/ form").toMatch(/^@\//);
    expect(STAGING_DIR.startsWith(`${COMPONENTS_DIR}/`) || STAGING_DIR === COMPONENTS_DIR).toBe(
      true,
    );
    /*
     * And that the resolution lands somewhere real. STAGING_DIR itself is absent by
     * design when nothing is staged, so its parent is what proves the path was built
     * against the actual tree rather than against a prefix that no longer exists
     */
    expect(existsSync(dirname(STAGING_DIR)), `${dirname(STAGING_DIR)} must exist`).toBe(true);
  });

  it("holds no unadapted component", () => {
    const staged = existsSync(STAGING_DIR) ? readdirSync(STAGING_DIR) : [];
    expect(
      staged,
      "adapt these into elements/, composites/ or forms/, then delete src/components/ui/",
    ).toEqual([]);
  });
});
