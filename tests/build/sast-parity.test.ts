import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/*
 * The Semgrep invocation is written twice: `check:sast` in package.json runs it in
 * a container locally, and the `sast` CI job runs the same scan on a Semgrep image.
 * Nothing keeps the two rule packs in step, so adding a pack to one leaves the other
 * scanning less than the reader of either would assume. Divergence in the quieter
 * direction is the dangerous one: CI stays green while covering fewer rules.
 *
 * Compares the argument list rather than the whole command, since the two differ
 * legitimately in how they reach the binary
 */

/** Everything after the `semgrep ci` token, whitespace-normalized */
function semgrepArgs(command: string): string[] {
  const marker = "semgrep ci ";
  const at = command.indexOf(marker);
  if (at === -1) throw new Error(`no \`semgrep ci\` invocation in: ${command}`);
  return command
    .slice(at + marker.length)
    .trim()
    .split(/\s+/);
}

describe("Semgrep rule packs stay in step", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts: Record<string, string | undefined>;
  };
  const workflow = readFileSync(".github/workflows/ci.yml", "utf8");

  /** The local script, or a loud failure rather than an undefined that reads as empty */
  function localScript(): string {
    const script = pkg.scripts["check:sast"];
    if (!script) throw new Error("no check:sast script in package.json");
    return script;
  }

  /*
   * Both sides are located before they are compared. A regex that silently matches
   * nothing would make the comparison below two empty arrays, which is exactly the
   * shape a passing test takes when it has stopped reading anything
   */
  it("finds an invocation on both sides", () => {
    expect(localScript()).toContain("semgrep ci ");
    expect(workflow).toContain("run: semgrep ci ");
  });

  it("passes the same arguments locally and in CI", () => {
    const local = semgrepArgs(localScript());
    const ciLine = workflow.split("\n").find((line) => line.includes("run: semgrep ci "));
    if (!ciLine) throw new Error("no semgrep step in .github/workflows/ci.yml");
    expect(semgrepArgs(ciLine)).toEqual(local);
  });

  // Not just "some packs": a scan reduced to one pack would still pass the parity
  // check above, because both sides would be reduced together
  it("still enables every rule pack the comment above the CI step explains", () => {
    const local = semgrepArgs(localScript()).join(" ");
    for (const pack of [
      "p/javascript",
      "p/typescript",
      "p/react",
      "p/security-audit",
      "p/owasp-top-ten",
    ]) {
      expect(local).toContain(`--config ${pack}`);
    }
  });
});
