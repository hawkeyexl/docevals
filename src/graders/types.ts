/**
 * Grader contract for deterministically graded evals (command and tool:*).
 * A grader receives every (page, eval) target that resolved to its kind and
 * returns normalized findings. LLM grading lives in src/judge, not here.
 */
import type { Finding } from "../types.js";
import type { DocevalsConfig } from "../core/config.js";
import type { ResolvedEval, ResolvedPagePlan } from "../core/resolve.js";

/** One (page, eval) pair a grader must grade. */
export interface GraderTarget {
  plan: ResolvedPagePlan;
  eval: ResolvedEval;
}

export interface ExecResult {
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  /** Set when the process could not be spawned (e.g. binary not found). */
  spawnError?: string;
}

export interface ExecOptions {
  cwd?: string;
  timeoutMs?: number;
  env?: Record<string, string>;
  /** Text piped to the child's stdin (stdin is closed after writing). */
  input?: string;
}

export type ExecFn = (cmd: string[], opts?: ExecOptions) => Promise<ExecResult>;

export interface GraderContext {
  targets: GraderTarget[];
  config: DocevalsConfig;
  /** Discovery root; page paths are relative to it. */
  root: string;
  exec: ExecFn;
}

export interface Grader {
  /** Registry kind, e.g. "command", "tool:markdownlint", "tool:freshness". */
  kind: string;
  /**
   * batch: one external invocation covers all targets;
   * per-file: one invocation per target;
   * corpus: needs every page at once (cross-page checks).
   */
  mode: "batch" | "per-file" | "corpus";
  grade(ctx: GraderContext): Promise<Finding[]>;
}

/**
 * Split targets into groups that share an eval configuration. Batch and
 * corpus graders run one invocation per group so that (a) two same-kind evals
 * on one page each get their own run and correct finding attribution, and
 * (b) per-page option overrides are honored instead of the first target's
 * options being applied to everyone.
 */
export function groupTargetsByEval(targets: GraderTarget[]): GraderTarget[][] {
  const groups = new Map<string, GraderTarget[]>();
  for (const t of targets) {
    const key = JSON.stringify([
      t.eval.name,
      t.eval.options,
      t.eval.timeoutMs ?? null,
      t.eval.severity,
      t.eval.severityMap ?? null,
    ]);
    const list = groups.get(key) ?? [];
    list.push(t);
    groups.set(key, list);
  }
  return [...groups.values()];
}
