/**
 * Judge prompt construction. The system prompt sets a binary rubric with an
 * explicit `partial` escape valve; the user content carries the assertion,
 * evidence hint, pass/fail example anchors, and the page body with
 * frontmatter and MDX noise stripped.
 *
 * PROMPT_VERSION is part of every cache key — bump it whenever the prompt
 * changes so stale cached verdicts never survive a prompt revision.
 */
import type { ResolvedEval } from "../core/resolve.js";

export const PROMPT_VERSION = 1;

export const JUDGE_SYSTEM_PROMPT = [
  "You are a meticulous technical documentation judge. You evaluate whether a",
  "documentation page satisfies a specific assertion.",
  "",
  "Rules:",
  "- Judge ONLY the stated assertion against the supplied page content. Do not",
  "  invent requirements the assertion does not state.",
  '- "match" is "pass" only when the assertion is fully satisfied by the page.',
  '- Use "partial" when the page partially satisfies the assertion.',
  '- Use "fail" when the page does not satisfy the assertion.',
  "- Quote the specific page text you relied on in \"observed\". If the page",
  "  lacks relevant content, say so explicitly.",
  "- Be conservative with confidence: reserve values above 0.9 for verdicts a",
  "  careful human reviewer would certainly agree with.",
  "Respond with a JSON object matching the provided schema.",
].join("\n");

/** Strip MDX imports/exports and comments; keep JSX text content and markdown. */
export function cleanBody(body: string): string {
  return body
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^(import|export)\s.*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildUserContent(ev: ResolvedEval, body: string): string {
  const parts: string[] = [
    `# Assertion`,
    ev.assertion ?? "",
  ];
  if (ev.evidence) {
    parts.push("", `# Where to look`, ev.evidence);
  }
  if (ev.examples?.pass || ev.examples?.fail) {
    parts.push("", "# Anchors");
    if (ev.examples.pass) parts.push(`A passing page: ${ev.examples.pass}`);
    if (ev.examples.fail) parts.push(`A failing page: ${ev.examples.fail}`);
  }
  parts.push("", "# Page content", "", cleanBody(body));
  return parts.join("\n");
}
