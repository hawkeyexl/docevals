/** Reporter dispatch. */
import type { EngineReport } from "../core/engine.js";
import { renderHuman } from "./human.js";
import { renderJson } from "./json.js";
import { renderMarkdown } from "./markdown.js";
import { renderGithub } from "./github.js";

export type ReportFormat = "human" | "json" | "markdown" | "github";

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
  }
}
