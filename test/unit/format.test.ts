/**
 * `--format` validation (ADR 01007). An unrecognized format is a usage error —
 * exit 2 via DocevalsError — not a silent fallback to the human renderer.
 */
import { describe, it, expect } from "vitest";
import {
  parseFormat,
  REPORT_FORMATS,
  SUMMARY_FORMATS,
} from "../../src/reporters/format.js";
import { render } from "../../src/reporters/index.js";
import { DocevalsError } from "../../src/types.js";
import type { EngineReport } from "../../src/core/engine.js";

const EMPTY_REPORT: EngineReport = {
  pages: 0,
  evalResults: [],
  suites: [],
  cost: { totalUsd: 0, totalTokens: 0, cachedEvals: 0, judgedEvals: 0 },
  generated: [],
  exitCode: 0,
  problems: [],
};

describe("parseFormat", () => {
  it("exposes the full reporter set for run", () => {
    expect([...REPORT_FORMATS]).toEqual(["human", "json", "markdown", "github"]);
  });

  it("exposes the human/json pair for list and fill", () => {
    expect([...SUMMARY_FORMATS]).toEqual(["human", "json"]);
  });

  it("accepts every value in the allowed set", () => {
    for (const f of REPORT_FORMATS) {
      expect(parseFormat(f, REPORT_FORMATS, "--format")).toBe(f);
    }
    for (const f of SUMMARY_FORMATS) {
      expect(parseFormat(f, SUMMARY_FORMATS, "--format")).toBe(f);
    }
  });

  it("throws a DocevalsError for an unknown value", () => {
    expect(() => parseFormat("xml", SUMMARY_FORMATS, "--format")).toThrow(
      DocevalsError,
    );
  });

  it("names the flag, the received value, and the allowed set", () => {
    expect(() => parseFormat("xml", SUMMARY_FORMATS, "--format")).toThrow(
      '--format must be one of human | json, got "xml"',
    );
    expect(() => parseFormat("xml", REPORT_FORMATS, "--format")).toThrow(
      '--format must be one of human | json | markdown | github, got "xml"',
    );
  });

  it("rejects a format valid for another command", () => {
    // `markdown` is a run format; list and fill must not silently accept it.
    expect(() => parseFormat("markdown", SUMMARY_FORMATS, "--format")).toThrow(
      DocevalsError,
    );
  });

  it("rejects case variants and surrounding whitespace rather than coercing", () => {
    expect(() => parseFormat("JSON", SUMMARY_FORMATS, "--format")).toThrow(
      DocevalsError,
    );
    expect(() => parseFormat(" json", SUMMARY_FORMATS, "--format")).toThrow(
      DocevalsError,
    );
  });

  it("rejects the empty string", () => {
    expect(() => parseFormat("", SUMMARY_FORMATS, "--format")).toThrow(
      DocevalsError,
    );
  });
});

describe("render dispatch", () => {
  it("renders every declared format to a string", () => {
    for (const f of REPORT_FORMATS) {
      expect(typeof render(EMPTY_REPORT, f)).toBe("string");
    }
  });

  it("throws instead of returning undefined for an unknown format", () => {
    // Reachable from library consumers, who are not behind the CLI parser.
    expect(() => render(EMPTY_REPORT, "xml" as never)).toThrow(DocevalsError);
  });
});
