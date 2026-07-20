import { describe, it, expect } from "vitest";
import { parseConfig } from "../../src/core/config.js";
import { DocevalsError } from "../../src/types.js";

const PATH = "/fake/docevals.config.yaml";

describe("parseConfig", () => {
  it("applies defaults for a minimal config", () => {
    const c = parseConfig("version: 1\n", PATH);
    expect(c.files.include).toEqual(["**/*.{md,mdx}"]);
    expect(c.defaults.concurrency).toBe(4);
    expect(c.provider.default).toBe("anthropic");
    expect(c.judge.ensembleRuns).toBe(3);
    expect(c.judge.temperature).toBe(0);
    expect(c.judge.zones).toEqual({ autoPass: 0.8, autoFail: 0.8 });
    expect(c.judge.falsePositiveAlert).toBe(0.15);
    expect(c.scripts.allowFrontmatterCommands).toBe(true);
    expect(c.evals).toEqual({});
    expect(c.suites).toEqual({});
  });

  it("rejects invalid YAML", () => {
    expect(() => parseConfig("version: [1", PATH)).toThrow(DocevalsError);
  });

  it("rejects a non-object root", () => {
    expect(() => parseConfig("- a\n- b\n", PATH)).toThrow(/root must be an object/);
  });

  it("rejects unknown top-level keys with a schema path", () => {
    expect(() => parseConfig("version: 1\nrunners: {}\n", PATH)).toThrow(
      /Invalid config/,
    );
  });

  it("rejects a missing version", () => {
    expect(() => parseConfig("files: {}\n", PATH)).toThrow(/version/);
  });

  it("parses evals and suites, defaulting targetPassRate to 1.0", () => {
    const c = parseConfig(
      [
        "version: 1",
        "evals:",
        "  my-eval:",
        "    assertion: Something is true.",
        "suites:",
        "  ref:",
        "    evals: [my-eval]",
      ].join("\n"),
      PATH,
    );
    expect(c.suites.ref).toEqual({ targetPassRate: 1.0, evals: ["my-eval"] });
    expect(c.evals["my-eval"]?.assertion).toBe("Something is true.");
  });

  it("rejects a suite referencing an undefined eval", () => {
    expect(() =>
      parseConfig(
        ["version: 1", "suites:", "  ref:", "    evals: [ghost]"].join("\n"),
        PATH,
      ),
    ).toThrow(/references undefined eval "ghost"/);
  });

  it("rejects an undefined defaults.suite", () => {
    expect(() =>
      parseConfig(["version: 1", "defaults:", "  suite: ghost"].join("\n"), PATH),
    ).toThrow(/defaults\.suite "ghost"/);
  });

  it("rejects invalid eval names", () => {
    expect(() =>
      parseConfig(
        ["version: 1", "evals:", "  Bad_Name:", "    assertion: x"].join("\n"),
        PATH,
      ),
    ).toThrow(/Invalid config/);
  });
});
