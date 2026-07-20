/**
 * Tool adapter: Doc Detective. Runs procedure tests embedded in a page and
 * reports failed steps. Slow (drives a browser) — enable it only in dedicated
 * suites. Options:
 *   command: override (default: npx --no-install doc-detective run)
 * Output: Doc Detective prints a results JSON; failed specs/tests/steps are
 * collected recursively from any object with result/status === "FAIL".
 */
import type { Finding } from "../../types.js";
import type { Grader } from "../types.js";

interface FailedStep {
  description: string;
  detail?: string;
}

/** Recursively collect FAIL-status entries from a Doc Detective results blob. */
export function collectFailures(node: unknown, out: FailedStep[] = []): FailedStep[] {
  if (Array.isArray(node)) {
    for (const item of node) collectFailures(item, out);
    return out;
  }
  if (node == null || typeof node !== "object") return out;
  const record = node as Record<string, unknown>;
  const status = record.result ?? record.status;
  if (typeof status === "string" && status.toUpperCase() === "FAIL") {
    const description =
      (typeof record.description === "string" && record.description) ||
      (typeof record.id === "string" && record.id) ||
      (typeof record.stepId === "string" && record.stepId) ||
      "step failed";
    const detail =
      (typeof record.resultDescription === "string" && record.resultDescription) ||
      (typeof record.message === "string" && record.message) ||
      undefined;
    out.push({ description, detail });
  }
  for (const value of Object.values(record)) {
    if (value != null && typeof value === "object") collectFailures(value, out);
  }
  return out;
}

/** Find the last JSON object in mixed stdout (Doc Detective logs then results). */
export function lastJsonBlob(stdout: string): unknown {
  const start = stdout.indexOf("{");
  if (start < 0) return undefined;
  for (let i = start; i >= 0 && i < stdout.length; i = stdout.indexOf("{", i + 1)) {
    const candidate = stdout.slice(i, stdout.lastIndexOf("}") + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // keep scanning
    }
  }
  return undefined;
}

export const docDetectiveGrader: Grader = {
  kind: "tool:doc-detective",
  mode: "per-file",
  async grade(ctx) {
    const findings: Finding[] = [];
    for (const { plan, eval: ev } of ctx.targets) {
      const commandOverride = ev.options.command as string[] | undefined;
      const cmd = [
        ...(commandOverride ?? ["npx", "--no-install", "doc-detective", "run"]),
        "--input",
        plan.page.file,
      ];
      const result = await ctx.exec(cmd, {
        cwd: ctx.root,
        timeoutMs: ev.timeoutMs ?? 600000,
      });
      if (result.spawnError) {
        findings.push({
          evalName: ev.name,
          file: plan.page.file,
          message: `Failed to run doc-detective: ${result.spawnError} (is it installed?)`,
          severity: ev.severity,
        });
        continue;
      }
      const blob = lastJsonBlob(result.stdout);
      const failures = blob ? collectFailures(blob) : [];
      if (failures.length > 0) {
        for (const f of failures) {
          findings.push({
            evalName: ev.name,
            file: plan.page.file,
            ruleId: "doc-detective/step",
            message: f.detail ? `${f.description}: ${f.detail}` : f.description,
            severity: ev.severity,
          });
        }
      } else if (result.code !== 0) {
        findings.push({
          evalName: ev.name,
          file: plan.page.file,
          message: `doc-detective exited ${result.code}: ${result.stderr.trim().slice(-300)}`,
          severity: ev.severity,
        });
      }
    }
    return findings;
  },
};
