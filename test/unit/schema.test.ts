/**
 * The frontmatter schema is published from this repo (shipped in the package
 * under schemas/), not registered as a built-in inside a validator. These
 * tests pin the published artifact: it must be resolvable by path, usable by
 * docmeta as a plain schema file, and it must accept the fixture corpus.
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runValidate } from "docmeta";
import {
  frontmatterSchema,
  frontmatterSchemaPath,
  FRONTMATTER_SCHEMA_ID,
} from "../../src/schema.js";

const ROOT = resolve(import.meta.dirname, "../..");

describe("published frontmatter schema", () => {
  it("ships at a resolvable path", () => {
    const path = frontmatterSchemaPath();
    expect(existsSync(path)).toBe(true);
    expect(JSON.parse(readFileSync(path, "utf8"))).toEqual(frontmatterSchema);
  });

  it("is listed in the package files so it reaches consumers", () => {
    const pkg = JSON.parse(
      readFileSync(resolve(ROOT, "package.json"), "utf8"),
    ) as { files: string[]; exports: Record<string, unknown> };
    expect(pkg.files).toContain("schemas");
    expect(pkg.exports).toHaveProperty("./schemas/frontmatter-0.1.json");
  });

  it("carries a resolvable $id, not a validator-internal registry id", () => {
    expect(FRONTMATTER_SCHEMA_ID).toMatch(/^https?:\/\//);
  });

  it("validates the fixture corpus when passed to docmeta as a file path", async () => {
    const run = await runValidate({
      inputs: ["test/fixtures/pages/**/*.{md,mdx}"],
      cliSchemas: [frontmatterSchemaPath()],
      cwd: ROOT,
    });
    expect(run.results.length).toBeGreaterThan(0);
    const failures = run.results
      .filter((r) => !r.ok)
      .map((r) => `${r.file}: ${JSON.stringify(r.errors)}`);
    expect(failures).toEqual([]);
  }, 30000);

  it("full deterministic run validates fixtures via the tool:docmeta eval", async () => {
    const { runEvals } = await import("../../src/core/engine.js");
    const report = await runEvals({
      cwd: ROOT,
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
