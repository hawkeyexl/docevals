/**
 * Cost tracking (safeguard layer 4): token usage priced from a small static
 * table, overridable per provider in config. Unknown models cost 0 (unknown),
 * never a guess.
 */
import type { JudgeRun } from "../types.js";
import type { DocevalsConfig, Pricing } from "../core/config.js";

/** USD per million tokens. Keep entries pinned-model-specific. */
const PRICE_TABLE: Record<string, Pricing> = {
  "claude-sonnet-4-5": { inputPerMTok: 3, outputPerMTok: 15 },
  "claude-haiku-4-5": { inputPerMTok: 1, outputPerMTok: 5 },
  "claude-opus-4-8": { inputPerMTok: 15, outputPerMTok: 75 },
  "gpt-4o-mini": { inputPerMTok: 0.15, outputPerMTok: 0.6 },
  "gpt-4o": { inputPerMTok: 2.5, outputPerMTok: 10 },
};

/**
 * The pricing override configured for a provider, if it carries one. Only
 * anthropic/openai are configured with pricing; claude-cli reports no usage
 * and other providers (e.g. the mock) aren't configured at all.
 */
export function pricingOverrideFor(
  config: DocevalsConfig,
  providerName: string,
): Pricing | undefined {
  if (providerName === "anthropic") return config.provider.anthropic.pricing;
  if (providerName === "openai") return config.provider.openai.pricing;
  return undefined;
}

export function pricingFor(
  model: string,
  override?: Pricing,
): Pricing | undefined {
  if (override) return override;
  if (PRICE_TABLE[model]) return PRICE_TABLE[model];
  // Match pinned variants like claude-sonnet-4-5-20250929.
  const base = Object.keys(PRICE_TABLE).find((k) => model.startsWith(k));
  return base ? PRICE_TABLE[base] : undefined;
}

/** Cost of a single provider response. Missing usage or pricing costs 0. */
export function costOfUsage(
  usage: { inputTokens: number; outputTokens: number } | undefined,
  pricing?: Pricing,
): number {
  if (!usage || !pricing) return 0;
  return (
    (usage.inputTokens / 1_000_000) * pricing.inputPerMTok +
    (usage.outputTokens / 1_000_000) * pricing.outputPerMTok
  );
}

export function costOfRuns(runs: JudgeRun[], pricing?: Pricing): number {
  if (!pricing) return 0;
  let usd = 0;
  for (const run of runs) {
    if (!run.usage || run.cached) continue;
    usd +=
      (run.usage.inputTokens / 1_000_000) * pricing.inputPerMTok +
      (run.usage.outputTokens / 1_000_000) * pricing.outputPerMTok;
  }
  return usd;
}
