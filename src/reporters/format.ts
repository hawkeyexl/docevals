/**
 * The single source of truth for `-f/--format` values (ADR 01007).
 *
 * Both the allowed sets and the type are declared here, so the constant a
 * command validates against and the type its renderer accepts cannot drift.
 * Every command taking `--format` parses through `parseFormat`; an unknown
 * value is a usage error (exit 2), never a silent fallback to the human
 * renderer.
 */
import { DocevalsError } from "../types.js";

/** Formats `run` can emit — one per module in this directory. */
export const REPORT_FORMATS = ["human", "json", "markdown", "github"] as const;

/** Formats the summary commands (`list`, `fill`) can emit. */
export const SUMMARY_FORMATS = ["human", "json"] as const;

export type ReportFormat = (typeof REPORT_FORMATS)[number];
export type SummaryFormat = (typeof SUMMARY_FORMATS)[number];

/**
 * Narrow a raw `--format` value to one of `allowed`, or throw.
 *
 * Matching is exact: no trimming, no case folding. A near-miss is a typo the
 * caller should see, not something to guess at.
 */
export function parseFormat<T extends string>(
  value: string,
  allowed: readonly T[],
  flag: string,
): T {
  if (!(allowed as readonly string[]).includes(value)) {
    throw new DocevalsError(
      `${flag} must be one of ${allowed.join(" | ")}, got "${value}"`,
    );
  }
  return value as T;
}
