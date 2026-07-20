/**
 * Shared result model for docevals.
 *
 * Vocabulary follows the "Docs as Evals" methodology (Docs as Tests with AI):
 * every check is an *eval*; what differs is its *grader* (code-based, LLM-as-
 * judge, or human). Verdicts are binary pass/fail — aggregate rates emerge from
 * binary judgments, they are never assigned per item.
 */

/** A single judge run's match verdict. `partial` counts as fail for the binary outcome. */
export type Match = "pass" | "fail" | "partial";

/** Confidence-zone routing for LLM-judged evals. */
export type Zone = "auto-pass" | "auto-fail" | "human-review";

/**
 * Regression evals guard behavior that must keep working (~100% target pass
 * rate). Capability evals probe what the docs/system can do (~70% target).
 */
export type EvalType = "capability" | "regression";

/** Finding severity for deterministically graded evals. Only `error` affects exit codes. */
export type Severity = "error" | "warning" | "info";

/** How an eval is graded. `tool:*` kinds are built-in adapters for external tools. */
export type GraderKind = "llm" | "command" | "human" | `tool:${string}`;

/** Structured verdict returned by a single LLM judge run (exact book shape). */
export interface JudgeVerdict {
  /** The specific documented assertion under evaluation. */
  claim: string;
  /** What the judge actually observed in the page. */
  observed: string;
  match: Match;
  /** 0.0–1.0 self-reported confidence. */
  confidence: number;
  reasoning: string;
}

/** One run within an ensemble. */
export interface JudgeRun {
  /** Absent when the run errored (invalid JSON after retry, API failure). */
  verdict?: JudgeVerdict;
  error?: string;
  provider: string;
  model: string;
  cached: boolean;
  usage?: { inputTokens: number; outputTokens: number };
  durationMs: number;
}

/** Aggregated outcome of an ensemble of judge runs for one (page, eval) pair. */
export interface ConsensusResult {
  runs: JudgeRun[];
  votes: { pass: number; fail: number; partial: number; error: number };
  /** Majority verdict; `partial` counts as fail for the binary outcome. */
  verdict: Match;
  /** Fraction of non-errored runs agreeing with the majority verdict. */
  agreement: number;
  /** Mean confidence across non-errored runs. */
  meanConfidence: number;
  zone: Zone;
}

/** A normalized finding from a deterministically graded eval (command or tool). */
export interface Finding {
  /** Name of the eval that produced this finding. */
  evalName: string;
  /** Repo-relative path of the page the finding applies to. */
  file: string;
  /** Tool-specific rule id (e.g. "MD013", "Vale.Spelling"), when available. */
  ruleId?: string;
  message: string;
  severity: Severity;
  line?: number;
  col?: number;
}

/** Result of one eval applied to one page. */
export interface EvalResult {
  evalName: string;
  type: EvalType;
  grader: GraderKind;
  file: string;
  outcome: "pass" | "fail" | "needs-review" | "skipped" | "error";
  /** Present for llm-graded evals. */
  consensus?: ConsensusResult;
  /** Present for command/tool-graded evals that produced findings. */
  findings?: Finding[];
  /** True when this run generated the eval's check script. */
  generated?: boolean;
  /** Set when a persisted human review resolved a needs-review outcome. */
  via?: "human-review";
  skipReason?: string;
  costUsd?: number;
  durationMs: number;
}

/** Per-suite aggregate. Pass rates emerge from binary outcomes. */
export interface SuiteSummary {
  suite: string;
  total: number;
  passed: number;
  failed: number;
  needsReview: number;
  skipped: number;
  errored: number;
  /** passed / (total - skipped), 1 when nothing ran. */
  passRate: number;
  /** From config: ~1.0 for regression suites, ~0.7 for capability suites. */
  targetPassRate: number;
  meetsTarget: boolean;
}

/** Full run output consumed by reporters. */
export interface RunReport {
  pages: number;
  evalResults: EvalResult[];
  suites: SuiteSummary[];
  cost: {
    totalUsd: number;
    totalTokens: number;
    cachedEvals: number;
    judgedEvals: number;
  };
  /** Script generations performed during this run (paths written). */
  generated: string[];
  exitCode: 0 | 1;
}

/** Operational/usage error → exit code 2. */
export class DocevalsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocevalsError";
  }
}
