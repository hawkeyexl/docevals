/**
 * Guard against drift between docevals' canonical frontmatter schema and the
 * copy registered as a docmeta built-in. Both must stay byte-equivalent
 * (as parsed JSON) — update src/schemas/frontmatter-0.1.json and docmeta's
 * src/schemas/docevals/0.1.json together.
 */
import { describe, it, expect } from "vitest";
import { loadSchema, listBuiltins } from "docmeta";
import canonical from "../../src/schemas/frontmatter-0.1.json" with { type: "json" };

describe("docmeta built-in schema", () => {
  it("docmeta registers docevals:frontmatter:0.1", () => {
    const ids = listBuiltins().map((b) => b.id);
    expect(ids).toContain("docevals:frontmatter:0.1");
  });

  it("matches docevals' canonical copy exactly", async () => {
    const registered = await loadSchema("docevals:frontmatter:0.1");
    expect(registered).toEqual(canonical);
  });

  it("full deterministic run validates fixtures against the built-in", async () => {
    // The dogfood config's reference suite includes tool:docmeta with the
    // built-in schema; every annotated fixture must validate.
    const { runEvals } = await import("../../src/core/engine.js");
    const { resolve } = await import("node:path");
    const report = await runEvals({
      cwd: resolve(import.meta.dirname, "../.."),
      deterministicOnly: true,
      generate: false,
    });
    const docmetaResults = report.evalResults.filter(
      (r) => r.evalName === "frontmatter-valid",
    );
    expect(docmetaResults.length).toBeGreaterThan(0);
    for (const r of docmetaResults) {
      expect(r.outcome, `${r.file}: ${JSON.stringify(r.findings)}`).toBe("pass");
    }
  }, 30000);
});
