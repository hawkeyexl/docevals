/**
 * Native differentiation check (the book's ch10 example): related pages —
 * e.g. per-endpoint or per-action reference docs — must be sufficiently
 * distinct from each other. Similarity is cosine similarity over word
 * frequencies of the cleaned page prose; pages above `maxSimilarity` against
 * any sibling in scope fail.
 */
import picomatch from "picomatch";
import type { Finding } from "../../types.js";
import type { Grader } from "../types.js";
import { extractProse } from "./reading-level.js";

interface DifferentiationOptions {
  scope?: string;
  maxSimilarity?: number;
}

export function wordFrequencies(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[a-z][a-z'-]*/g) ?? []) {
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }
  return freq;
}

export function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  if (a.size === 0 || b.size === 0) return 0;
  let dot = 0;
  for (const [word, count] of a) {
    const other = b.get(word);
    if (other) dot += count * other;
  }
  const norm = (m: Map<string, number>) =>
    Math.sqrt([...m.values()].reduce((n, c) => n + c * c, 0));
  return dot / (norm(a) * norm(b));
}

export const differentiationGrader: Grader = {
  kind: "tool:differentiation",
  mode: "corpus",
  async grade(ctx) {
    if (ctx.targets.length === 0) return [];
    const findings: Finding[] = [];
    const first = ctx.targets[0]!;
    const opts = first.eval.options as DifferentiationOptions;
    const maxSimilarity = opts.maxSimilarity ?? 0.85;
    const inScope = opts.scope ? picomatch(opts.scope) : () => true;

    const scoped = ctx.targets.filter((t) => inScope(t.plan.page.file));
    if (scoped.length < 2) return [];

    const vectors = scoped.map((t) => ({
      target: t,
      freq: wordFrequencies(extractProse(t.plan.page.body)),
    }));

    for (let i = 0; i < vectors.length; i++) {
      let worst = { similarity: 0, other: "" };
      for (let j = 0; j < vectors.length; j++) {
        if (i === j) continue;
        const similarity = cosineSimilarity(vectors[i]!.freq, vectors[j]!.freq);
        if (similarity > worst.similarity) {
          worst = { similarity, other: vectors[j]!.target.plan.page.file };
        }
      }
      if (worst.similarity > maxSimilarity) {
        const { target } = vectors[i]!;
        findings.push({
          evalName: target.eval.name,
          file: target.plan.page.file,
          ruleId: "differentiation/similar",
          message: `Content is ${(worst.similarity * 100).toFixed(0)}% similar to ${worst.other} (max ${(maxSimilarity * 100).toFixed(0)}%) — describe what makes this page's subject unique`,
          severity: target.eval.severity,
        });
      }
    }
    return findings;
  },
};
