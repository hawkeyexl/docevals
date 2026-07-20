import { describe, it, expect } from "vitest";
import { parseConfig } from "../../src/core/config.js";
import { extractFrontmatter } from "docmeta";
import { stripFrontmatterBlock, type PageFile } from "../../src/core/discover.js";
import { resolvePage } from "../../src/core/resolve.js";
import { commandGrader } from "../../src/graders/command.js";
import { freshnessGrader } from "../../src/graders/native/freshness.js";
import {
  countSyllables,
  extractProse,
  fleschKincaidGrade,
  readingLevelGrader,
} from "../../src/graders/native/reading-level.js";
import { parseMarkdownlintOutput } from "../../src/graders/tools/markdownlint.js";
import type { ExecFn, ExecResult, GraderTarget } from "../../src/graders/types.js";

const CONFIG = parseConfig("version: 1\n", "/fake/docevals.config.yaml");

function makeTarget(frontmatterYaml: string, body = "Body."): GraderTarget {
  const content = `---\n${frontmatterYaml}\n---\n${body}`;
  const page: PageFile = {
    file: "docs/page.md",
    absPath: "/fake/docs/page.md",
    content,
    body: stripFrontmatterBlock(content),
    frontmatter: extractFrontmatter(content, "markdown"),
  };
  const plan = resolvePage(page, CONFIG);
  if (plan.evals.length === 0) throw new Error("fixture resolved no evals");
  return { plan, eval: plan.evals[0]! };
}

function fakeExec(result: Partial<ExecResult>): { exec: ExecFn; calls: string[][] } {
  const calls: string[][] = [];
  const exec: ExecFn = (cmd) => {
    calls.push(cmd);
    return Promise.resolve({
      code: 0,
      stdout: "",
      stderr: "",
      timedOut: false,
      ...result,
    });
  };
  return { exec, calls };
}

describe("commandGrader", () => {
  const fm = [
    "docevals:",
    "  evals:",
    "    - name: check",
    "      assertion: Something.",
    "      grader: command",
    '      command: ["node", "check.mjs", "{file}"]',
  ].join("\n");

  it("passes on exit 0 with no findings", async () => {
    const { exec, calls } = fakeExec({ code: 0 });
    const findings = await commandGrader.grade({
      targets: [makeTarget(fm)],
      config: CONFIG,
      root: "/fake",
      exec,
    });
    expect(findings).toEqual([]);
    expect(calls[0]).toEqual(["node", "check.mjs", "/fake/docs/page.md"]);
  });

  it("fails on nonzero exit with the output tail", async () => {
    const { exec } = fakeExec({ code: 1, stderr: "missing heading" });
    const findings = await commandGrader.grade({
      targets: [makeTarget(fm)],
      config: CONFIG,
      root: "/fake",
      exec,
    });
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toMatch(/Exit code 1: missing heading/);
    expect(findings[0]?.severity).toBe("error");
  });

  it("honors successExitCodes", async () => {
    const target = makeTarget(
      fm.replace("grader: command", "grader: command\n      successExitCodes: [0, 3]"),
    );
    const { exec } = fakeExec({ code: 3 });
    const findings = await commandGrader.grade({
      targets: [target],
      config: CONFIG,
      root: "/fake",
      exec,
    });
    expect(findings).toEqual([]);
  });

  it("reports spawn errors", async () => {
    const { exec } = fakeExec({ code: null, spawnError: "ENOENT" });
    const findings = await commandGrader.grade({
      targets: [makeTarget(fm)],
      config: CONFIG,
      root: "/fake",
      exec,
    });
    expect(findings[0]?.message).toMatch(/Failed to run command "node": ENOENT/);
  });

  it("reports timeouts", async () => {
    const { exec } = fakeExec({ code: null, timedOut: true });
    const findings = await commandGrader.grade({
      targets: [makeTarget(fm)],
      config: CONFIG,
      root: "/fake",
      exec,
    });
    expect(findings[0]?.message).toMatch(/timed out/);
  });
});

describe("freshnessGrader", () => {
  const exec = fakeExec({}).exec;
  const graderConfig = parseConfig(
    [
      "version: 1",
      "evals:",
      "  fresh:",
      "    grader: tool:freshness",
      "    options: { maxAgeDays: 365 }",
      "    severity: warning",
      "suites:",
      "  s: { evals: [fresh] }",
    ].join("\n"),
    "/fake/docevals.config.yaml",
  );

  function freshTarget(frontmatter: string): GraderTarget {
    const content = `---\n${frontmatter}\ndocevals:\n  suite: s\n---\nBody.`;
    const page: PageFile = {
      file: "docs/page.md",
      absPath: "/fake/docs/page.md",
      content,
      body: "Body.",
      frontmatter: extractFrontmatter(content, "markdown"),
    };
    const plan = resolvePage(page, graderConfig);
    return { plan, eval: plan.evals[0]! };
  }

  it("passes for a recent date", async () => {
    const recent = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const findings = await freshnessGrader.grade({
      targets: [freshTarget(`title: x\nlast-reviewed: ${recent}`)],
      config: graderConfig,
      root: "/fake",
      exec,
    });
    expect(findings).toEqual([]);
  });

  it("flags stale dates with the eval severity and a line number", async () => {
    const findings = await freshnessGrader.grade({
      targets: [freshTarget("title: x\nlast-reviewed: 2020-01-01")],
      config: graderConfig,
      root: "/fake",
      exec,
    });
    expect(findings[0]?.ruleId).toBe("freshness/stale");
    expect(findings[0]?.severity).toBe("warning");
    expect(findings[0]?.line).toBe(3);
  });

  it("flags a missing field", async () => {
    const findings = await freshnessGrader.grade({
      targets: [freshTarget("title: x")],
      config: graderConfig,
      root: "/fake",
      exec,
    });
    expect(findings[0]?.ruleId).toBe("freshness/missing");
  });

  it("flags unparseable dates", async () => {
    const findings = await freshnessGrader.grade({
      targets: [freshTarget("title: x\nlast-reviewed: whenever")],
      config: graderConfig,
      root: "/fake",
      exec,
    });
    expect(findings[0]?.ruleId).toBe("freshness/invalid");
  });
});

describe("reading level", () => {
  it("counts syllables approximately", () => {
    expect(countSyllables("cat")).toBe(1);
    expect(countSyllables("documentation")).toBeGreaterThanOrEqual(4);
  });

  it("strips code and markup from prose", () => {
    const prose = extractProse(
      "# Title\n\nSome text with `code` and a [link](https://x.test).\n\n```js\nconst x = 1;\n```\n",
    );
    expect(prose).not.toContain("const x");
    expect(prose).not.toContain("https://");
    expect(prose).toContain("link");
  });

  it("returns null for too-short prose", () => {
    expect(fleschKincaidGrade("Short.")).toBeNull();
  });

  it("scores simple prose lower than complex prose", () => {
    const simple = Array(10)
      .fill("The cat sat on the mat. The dog ran to the park. We like it here.")
      .join(" ");
    const complex = Array(10)
      .fill(
        "Notwithstanding organizational considerations, comprehensive implementation methodologies necessitate extraordinarily sophisticated administrative infrastructure.",
      )
      .join(" ");
    const simpleGrade = fleschKincaidGrade(simple)!;
    const complexGrade = fleschKincaidGrade(complex)!;
    expect(simpleGrade).toBeLessThan(6);
    expect(complexGrade).toBeGreaterThan(12);
  });

  it("grader flags pages above maxGrade", async () => {
    const graderConfig = parseConfig(
      [
        "version: 1",
        "evals:",
        "  readable:",
        "    grader: tool:reading-level",
        "    options: { maxGrade: 5 }",
        "    severity: warning",
        "suites:",
        "  s: { evals: [readable] }",
      ].join("\n"),
      "/fake/docevals.config.yaml",
    );
    const body = Array(10)
      .fill(
        "Notwithstanding organizational considerations, comprehensive implementation methodologies necessitate extraordinarily sophisticated administrative infrastructure.",
      )
      .join(" ");
    const content = `---\ntitle: x\ndocevals:\n  suite: s\n---\n${body}`;
    const page: PageFile = {
      file: "docs/page.md",
      absPath: "/fake/docs/page.md",
      content,
      body,
      frontmatter: extractFrontmatter(content, "markdown"),
    };
    const plan = resolvePage(page, graderConfig);
    const findings = await readingLevelGrader.grade({
      targets: [{ plan, eval: plan.evals[0]! }],
      config: graderConfig,
      root: "/fake",
      exec: fakeExec({}).exec,
    });
    expect(findings[0]?.ruleId).toBe("reading-level/grade");
  });
});

describe("parseMarkdownlintOutput", () => {
  it("parses line and column forms", () => {
    const out = [
      "docs/a.md:12:3 MD013/line-length Line length [Expected: 80; Actual: 120]",
      "docs\\b.md:9 MD041/first-line-heading First line in a file should be a top-level heading",
      "Summary: 2 error(s)",
    ].join("\n");
    const items = parseMarkdownlintOutput(out);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      file: "docs/a.md",
      line: 12,
      col: 3,
      ruleId: "MD013/line-length",
    });
    expect(items[1]).toMatchObject({ file: "docs/b.md", line: 9, col: undefined });
  });
});
