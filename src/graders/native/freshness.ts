/**
 * Native freshness check: the page's review date (default frontmatter field
 * `last-reviewed`) must be within `maxAgeDays`. No external tool covers this
 * frontmatter-driven staleness contract, so it's built in.
 */
import type { Finding } from "../../types.js";
import type { Grader } from "./../types.js";

interface FreshnessOptions {
  field?: string;
  maxAgeDays?: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const freshnessGrader: Grader = {
  kind: "tool:freshness",
  mode: "per-file",
  async grade(ctx) {
    const findings: Finding[] = [];
    for (const { plan, eval: ev } of ctx.targets) {
      const opts = ev.options as FreshnessOptions;
      const field = opts.field ?? "last-reviewed";
      const maxAgeDays = opts.maxAgeDays ?? 365;
      const raw = plan.page.frontmatter.data[field];

      if (raw == null) {
        findings.push({
          evalName: ev.name,
          file: plan.page.file,
          ruleId: "freshness/missing",
          message: `Missing "${field}" frontmatter field`,
          severity: ev.severity,
          line: 1,
        });
        continue;
      }
      const date =
        raw instanceof Date ? raw : new Date(String(raw));
      if (Number.isNaN(date.getTime())) {
        findings.push({
          evalName: ev.name,
          file: plan.page.file,
          ruleId: "freshness/invalid",
          message: `Unparseable "${field}" date: ${String(raw)}`,
          severity: ev.severity,
          line: plan.page.frontmatter.lineFor(`/${field}`),
        });
        continue;
      }
      const ageDays = Math.floor((Date.now() - date.getTime()) / MS_PER_DAY);
      if (ageDays > maxAgeDays) {
        findings.push({
          evalName: ev.name,
          file: plan.page.file,
          ruleId: "freshness/stale",
          message: `Page last reviewed ${ageDays} days ago (max ${maxAgeDays})`,
          severity: ev.severity,
          line: plan.page.frontmatter.lineFor(`/${field}`),
        });
      }
    }
    return findings;
  },
};
