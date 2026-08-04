/** Reporter dispatch. */
import type { EngineReport } from "../core/engine.js";
import { DocevalsError } from "../types.js";
import { renderHuman } from "./human.js";
import { renderJson } from "./json.js";
import { renderMarkdown } from "./markdown.js";
import { renderGithub } from "./github.js";
import { REPORT_FORMATS, type ReportFormat } from "./format.js";

export {
  REPORT_FORMATS,
  SUMMARY_FORMATS,
  parseFormat,
  type ReportFormat,
  type SummaryFormat,
} from "./format.js";

export function render(report: EngineReport, format: ReportFormat): string {
  switch (format) {
    case "human":
      return renderHuman(report);
    case "json":
      return renderJson(report);
    case "markdown":
      return renderMarkdown(report);
    case "github":
      return renderGithub(report);
    default:
      // Unreachable from the CLI, which parses through parseFormat. Library
      // callers can still get here past the type, and used to receive
      // `undefined` — which the CLI happily printed. Fail instead.
      throw new DocevalsError(
        `unknown report format "${String(format)}" — expected one of ${REPORT_FORMATS.join(" | ")}`,
      );
  }
}
