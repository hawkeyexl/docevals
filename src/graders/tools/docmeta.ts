/**
 * Tool adapter: docmeta. Runs in-process via docmeta's programmatic API — no
 * subprocess, identical behavior to `docmeta validate`. Runs once per
 * eval-configuration group so evals with different schema sets validate
 * independently. Options:
 *   schemas: array of schema refs (builtin ids, file paths, or URLs).
 */
import { runValidate } from "docmeta";
import type { Finding } from "../../types.js";
import { groupTargetsByEval, type Grader, type GraderContext, type GraderTarget } from "../types.js";

async function gradeGroup(
  ctx: GraderContext,
  targets: GraderTarget[],
): Promise<Finding[]> {
  const first = targets[0]!;
  const schemas = first.eval.options.schemas as string[] | undefined;
  const byFile = new Map(targets.map((t) => [t.plan.page.file, t.eval] as const));
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
}

export const docmetaGrader: Grader = {
  kind: "tool:docmeta",
  mode: "batch",
  async grade(ctx) {
    const findings: Finding[] = [];
    for (const group of groupTargetsByEval(ctx.targets)) {
      findings.push(...(await gradeGroup(ctx, group)));
    }
    return findings;
  },
};
