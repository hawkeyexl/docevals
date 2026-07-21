/**
 * Judge response cache: content-addressed JSON files storing the full
 * ensemble, so cached evals replay identically. The key covers provider,
 * model, prompt version, run count, page body, and the resolved eval — any
 * change misses.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { JudgeRun } from "../types.js";
import type { ResolvedEval } from "../core/resolve.js";
import { PROMPT_VERSION } from "./prompt.js";

export function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function cacheKey(
  provider: string,
  model: string,
  runs: number,
  temperature: number,
  body: string,
  ev: ResolvedEval,
): string {
  const evalFingerprint = JSON.stringify({
    assertion: ev.assertion,
    evidence: ev.evidence,
    examples: ev.examples,
    type: ev.type,
  });
  return sha256(
    [
      provider,
      model,
      `v${PROMPT_VERSION}`,
      `r${runs}`,
      `t${temperature}`,
      sha256(body),
      sha256(evalFingerprint),
    ].join("|"),
  );
}

export class JudgeCache {
  constructor(
    private readonly dir: string,
    private readonly enabled: boolean = true,
  ) {}

  get(key: string): JudgeRun[] | undefined {
    if (!this.enabled) return undefined;
    const path = join(this.dir, `${key}.json`);
    if (!existsSync(path)) return undefined;
    try {
      const runs = JSON.parse(readFileSync(path, "utf8")) as JudgeRun[];
      return runs.map((r) => ({ ...r, cached: true }));
    } catch {
      return undefined; // Corrupt cache entry — treat as a miss.
    }
  }

  set(key: string, runs: JudgeRun[]): void {
    if (!this.enabled) return;
    mkdirSync(this.dir, { recursive: true });
    writeFileSync(join(this.dir, `${key}.json`), JSON.stringify(runs, null, 2));
  }
}
