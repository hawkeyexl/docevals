/**
 * Tool adapter: Vale. Runs once over all target files with --output=JSON:
 *   { "path.md": [{ Check, Message, Line, Span, Severity }, ...], ... }
 * Vale's own severities map through the eval's severityMap
 * (default: error→error, warning→warning, suggestion→info).
 */
import type { Finding, Severity } from "../../types.js";
import type { Grader } from "../types.js";

interface ValeIssue {
  Check?: string;
  Message?: string;
  Line?: number;
  Span?: [number, number];
  Severity?: string;
}

const DEFAULT_SEVERITY_MAP: Record<string, Severity> = {
  error: "error",
  warning: "warning",
  suggestion: "info",
};

export const valeGrader: Grader = {
  kind: "tool:vale",
  mode: "batch",
  async grade(ctx) {
    if (ctx.targets.length === 0) return [];
    const first = ctx.targets[0]!;
    const commandOverride = first.eval.options.command as string[] | undefined;
    const files = [...new Set(ctx.targets.map((t) => t.plan.page.file))];
    const result = await ctx.exec(
      [...(commandOverride ?? ["vale", "--output=JSON"]), ...files],
      { cwd: ctx.root, timeoutMs: first.eval.timeoutMs ?? 120000 },
    );
    if (result.spawnError) {
      return ctx.targets.map(({ plan, eval: ev }) => ({
        evalName: ev.name,
        file: plan.page.file,
        message: `Failed to run vale: ${result.spawnError} (is it installed?)`,
        severity: ev.severity,
      }));
    }

    let parsed: Record<string, ValeIssue[]>;
    try {
      parsed = JSON.parse(result.stdout) as Record<string, ValeIssue[]>;
    } catch {
      // Vale prints config errors to stderr with a nonzero exit and no JSON.
      return ctx.targets.map(({ plan, eval: ev }) => ({
        evalName: ev.name,
        file: plan.page.file,
        message: `Vale produced no JSON output: ${result.stderr.trim().slice(-300)}`,
        severity: ev.severity,
      }));
    }

    const byFile = new Map(
      ctx.targets.map((t) => [t.plan.page.file, t.eval] as const),
    );
    const findings: Finding[] = [];
    for (const [file, issues] of Object.entries(parsed)) {
      const normalized = file.replace(/\\/g, "/");
      const ev = byFile.get(normalized);
      if (!ev) continue;
      const severityMap = { ...DEFAULT_SEVERITY_MAP, ...(ev.severityMap ?? {}) };
      for (const issue of issues) {
        findings.push({
          evalName: ev.name,
          file: normalized,
          ruleId: issue.Check,
          message: issue.Message ?? "Vale issue",
          severity: severityMap[issue.Severity ?? "warning"] ?? "warning",
          line: issue.Line,
          col: issue.Span?.[0],
        });
      }
    }
    return findings;
  },
};
