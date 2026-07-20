/**
 * Confidence-zone routing (safeguard layer 3): only unanimous, high-confidence
 * ensembles auto-resolve; everything else goes to a human.
 */
import type { ConsensusResult, Zone } from "../types.js";

export interface ZoneThresholds {
  autoPass: number;
  autoFail: number;
}

export function zoneFor(
  consensus: Omit<ConsensusResult, "zone">,
  thresholds: ZoneThresholds,
): Zone {
  const { votes, meanConfidence } = consensus;
  const unanimousPass =
    votes.pass > 0 && votes.fail === 0 && votes.partial === 0 && votes.error === 0;
  const unanimousFail =
    votes.pass === 0 && votes.error === 0 && votes.fail + votes.partial > 0;

  if (unanimousPass && meanConfidence >= thresholds.autoPass) return "auto-pass";
  if (unanimousFail && meanConfidence >= thresholds.autoFail) return "auto-fail";
  return "human-review";
}
