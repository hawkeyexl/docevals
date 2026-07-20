/**
 * Tool adapter: docmeta. Runs in-process via docmeta's programmatic API — no
 * subprocess, identical behavior to `docmeta validate`. Options:
 *   schemas: array of schema refs (builtin ids, file paths, or URLs).
 */
import { runValidate } from "docmeta";
import type { Finding } from "../../types.js";
import type { Grader } from "../types.js";

export const docmetaGrader: Grader = {
  kind: "tool:docmeta",
  mode: "batch",
  async grade(ctx) {
    if (ctx.targets.length === 0) return [];
    const first = ctx.targets[0]!;
    const schemas = first.eval.options.schemas as string[] | undefined;
    const byFile = new Map(
      ctx.targets.map((t) => [t.plan.page.file, t.eval] as const),
    );
    const files = [...byFile.keys()];

    const run = await runValidate({
      inputs: files,
      cliSchemas: schemas,
      cwd: ctx.root,
    });

    const findings: Finding[] = [];
    for (const result of run.results) {
      const file = result.file.replace(/\\/g, "/");
      const ev = byFile.get(file);
      if (!ev || result.ok) continue;
      for (const err of result.errors) {
        findings.push({
          evalName: ev.name,
          file,
          ruleId: err.schema,
          message: err.instancePath
            ? `${err.instancePath}: ${err.message}`
            : err.message,
          severity: ev.severity,
          line: err.line,
          col: err.col,
        });
      }
    }
    return findings;
  },
};
