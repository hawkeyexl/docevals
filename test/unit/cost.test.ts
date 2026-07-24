import { describe, it, expect } from "vitest";
import { costOfUsage, pricingFor } from "../../src/judge/cost.js";

describe("costOfUsage", () => {
  it("prices a single response", () => {
    const pricing = pricingFor("claude-sonnet-4-5");
    const usd = costOfUsage({ inputTokens: 1_000_000, outputTokens: 1_000_000 }, pricing);
    expect(usd).toBeCloseTo(18); // 3 in + 15 out
  });

  it("returns 0 without usage or pricing", () => {
    expect(costOfUsage(undefined, pricingFor("claude-sonnet-4-5"))).toBe(0);
    expect(
      costOfUsage({ inputTokens: 100, outputTokens: 100 }, undefined),
    ).toBe(0);
  });
});
