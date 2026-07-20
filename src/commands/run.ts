/**
 * `docevals run` — execute the full pipeline. Deterministic graders run
 * first (cheap-first ordering); the LLM judge stage runs when a provider is
 * available and not disabled.
 */
import { runEvals, type EngineReport, type RunOptions } from "../core/engine.js";
import { render, type ReportFormat } from "../reporters/index.js";

export interface RunCommandOptions {
  config?: string;
  format?: ReportFormat;
  deterministicOnly?: boolean;
  llmOnly?: boolean;
  frontmatterCommands?: boolean;
  generate?: boolean;
  cache?: boolean;
  failOnReview?: boolean;
  provider?: string;
  model?: string;
  runs?: number;
  maxCost?: number;
  cwd?: string;
}

export async function runRun(
  globs: string[],
  options: RunCommandOptions = {},
  engineOverrides: Partial<RunOptions> = {},
): Promise<EngineReport> {
  return runEvals({
    configPath: options.config,
    globs,
    cwd: options.cwd,
    deterministicOnly: options.deterministicOnly,
    llmOnly: options.llmOnly,
    frontmatterCommands: options.frontmatterCommands,
    generate: options.generate,
    failOnReview: options.failOnReview,
    judgeOptions: {
      provider: options.provider,
      model: options.model,
      runs: options.runs,
      noCache: options.cache === false,
      maxCostUsd: options.maxCost ?? null,
    },
    ...engineOverrides,
  });
}

export { render };
