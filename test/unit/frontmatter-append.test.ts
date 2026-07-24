import { describe, it, expect } from "vitest";
import { parse as parseYaml } from "yaml";
import { Ajv2020 } from "ajv/dist/2020.js";
import {
  appendPageEvals,
  type NewEvalEntry,
} from "../../src/core/frontmatter-edit.js";
import { frontmatterSchema } from "../../src/schema.js";
import { DocevalsError } from "../../src/types.js";

const PATH = "docs/page.mdx";

const ENTRY: NewEvalEntry = {
  name: "has-overview",
  assertion: "The page opens with a short overview paragraph.",
  type: "regression",
  grader: "llm",
  examples: {
    pass: "An intro paragraph summarizes the feature before any heading.",
    fail: "The page jumps straight into reference tables.",
  },
};

const SECOND: NewEvalEntry = {
  name: "links-resolve",
  assertion: "All relative links point at existing pages.",
  grader: "llm",
  examples: { pass: "Links resolve.", fail: "A link 404s." },
};

const ajv = new Ajv2020({ allErrors: true });
const validateFrontmatter = ajv.compile(frontmatterSchema);

/** Parse the frontmatter block of `content` and validate it against the published schema. */
function frontmatterOf(content: string): Record<string, unknown> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(content);
  expect(match, "output has a frontmatter block").toBeTruthy();
  const data = parseYaml(match![1]!) as Record<string, unknown>;
  expect(
    validateFrontmatter(data),
    JSON.stringify(validateFrontmatter.errors),
  ).toBe(true);
  return data;
}

describe("appendPageEvals", () => {
  it("appends to an array-shorthand evals list, preserving body and comments", () => {
    const page = [
      "---",
      "title: Page # keep me",
      "evals:",
      "  - name: existing",
      "    assertion: Something.",
      "---",
      "",
      "# Body",
      "",
    ].join("\n");
    const out = appendPageEvals(page, PATH, [ENTRY]);
    expect(out.endsWith("# Body\n")).toBe(true);
    expect(out).toContain("# keep me");
    const data = frontmatterOf(out);
    const evals = data.evals as Record<string, unknown>[];
    expect(evals.map((e) => e.name)).toEqual(["existing", "has-overview"]);
    expect(evals[1]).toEqual({
      name: "has-overview",
      assertion: ENTRY.assertion,
      type: "regression",
      grader: "llm",
      examples: ENTRY.examples,
    });
  });

  it("appends into the nested seq of an object-form evals key", () => {
    const page = [
      "---",
      "evals:",
      "  suite: reference",
      "  evals:",
      "    - name: existing",
      "      assertion: Something.",
      "---",
      "body",
      "",
    ].join("\n");
    const out = appendPageEvals(page, PATH, [ENTRY]);
    const data = frontmatterOf(out);
    const obj = data.evals as { suite: string; evals: { name: string }[] };
    expect(obj.suite).toBe("reference");
    expect(obj.evals.map((e) => e.name)).toEqual(["existing", "has-overview"]);
  });

  it("creates the nested seq when object form has no evals list", () => {
    const page = ["---", "evals:", "  suite: reference", "---", "body", ""].join(
      "\n",
    );
    const out = appendPageEvals(page, PATH, [ENTRY]);
    const data = frontmatterOf(out);
    const obj = data.evals as { suite: string; evals: { name: string }[] };
    expect(obj.suite).toBe("reference");
    expect(obj.evals.map((e) => e.name)).toEqual(["has-overview"]);
  });

  it("creates an array-shorthand evals key when the page has none", () => {
    const page = ["---", "title: Page", "---", "", "# Body", ""].join("\n");
    const out = appendPageEvals(page, PATH, [ENTRY, SECOND]);
    expect(out.endsWith("# Body\n")).toBe(true);
    const data = frontmatterOf(out);
    expect(data.title).toBe("Page");
    const evals = data.evals as { name: string }[];
    expect(evals.map((e) => e.name)).toEqual(["has-overview", "links-resolve"]);
  });

  it("synthesizes a frontmatter block when the page has none", () => {
    const page = "# Just a body\n\nSome prose.\n";
    const out = appendPageEvals(page, PATH, [ENTRY]);
    expect(out.endsWith("# Just a body\n\nSome prose.\n")).toBe(true);
    const data = frontmatterOf(out);
    expect((data.evals as { name: string }[])[0]?.name).toBe("has-overview");
  });

  it("preserves CRLF line endings", () => {
    const page = "---\r\ntitle: Page\r\n---\r\nbody\r\n";
    const out = appendPageEvals(page, PATH, [ENTRY]);
    expect(out.endsWith("body\r\n")).toBe(true);
    expect(/(?<!\r)\n/.test(out.slice(0, out.lastIndexOf("---")))).toBe(false);
  });

  it("omits undefined optional fields", () => {
    const page = ["---", "title: Page", "---", "body", ""].join("\n");
    const out = appendPageEvals(page, PATH, [SECOND]);
    const data = frontmatterOf(out);
    expect((data.evals as Record<string, unknown>[])[0]).toEqual({
      name: "links-resolve",
      assertion: SECOND.assertion,
      grader: "llm",
      examples: SECOND.examples,
    });
  });

  it("throws on a duplicate inline eval name", () => {
    const page = [
      "---",
      "evals:",
      "  - name: has-overview",
      "    assertion: Something.",
      "---",
      "body",
      "",
    ].join("\n");
    expect(() => appendPageEvals(page, PATH, [ENTRY])).toThrow(DocevalsError);
  });

  it("throws on a duplicate string-shorthand entry", () => {
    const page = ["---", "evals: [has-overview]", "---", "body", ""].join("\n");
    expect(() => appendPageEvals(page, PATH, [ENTRY])).toThrow(DocevalsError);
  });
});
