/** Programmatic API for docevals. */
export { loadConfig, parseConfig, DEFAULT_CONFIG_FILENAME } from "./core/config.js";
export type { DocevalsConfig, EvalDef, SuiteDef, ProviderName } from "./core/config.js";
export { discoverPages, readPage, stripFrontmatterBlock } from "./core/discover.js";
export type { PageFile } from "./core/discover.js";
export { resolvePage, resolvePages } from "./core/resolve.js";
export type { ResolvedEval, ResolvedPagePlan, PageProblem } from "./core/resolve.js";
export { runList, renderList } from "./commands/list.js";
export type { ListOptions, ListRun } from "./commands/list.js";
export { runEvals } from "./core/engine.js";
export type {
  EngineReport,
  JudgeFn,
  JudgeOptions,
  RunOptions,
  RunProblem,
} from "./core/engine.js";
export { runRun } from "./commands/run.js";
export type { RunCommandOptions } from "./commands/run.js";
export { computeConsensus } from "./core/consensus.js";
export { zoneFor } from "./core/zones.js";
export { makeJudge } from "./judge/judge.js";
export { makeProvider } from "./judge/providers/index.js";
export { MockProvider, mockVerdict } from "./judge/providers/mock.js";
export type { JudgeProvider } from "./judge/types.js";
export { render } from "./reporters/index.js";
export type { ReportFormat } from "./reporters/index.js";
export {
  listReviews,
  renderReviews,
  runReview,
} from "./commands/review.js";
export { runGenerate } from "./commands/generate.js";
export type { GenerateOptions, GenerateRun } from "./commands/generate.js";
export { runFill, renderFill } from "./commands/fill.js";
export type {
  FillOptions,
  FillReport,
  FillPageResult,
  FillStatus,
  ProposedEval,
} from "./commands/fill.js";
export {
  FILL_PROMPT_VERSION,
  FILL_SYSTEM_PROMPT,
  MAX_BODY_CHARS,
  PROPOSAL_SCHEMA,
  buildFillUser,
  isValidProposal,
} from "./fill/prompt.js";
export { FillCache, fillCacheKey } from "./fill/cache.js";
export { runPromote } from "./commands/promote.js";
export type { PromoteOptions, PromoteProposal } from "./commands/promote.js";
export { makeGenerateScripts, scriptLocationFor } from "./graders/scriptgen.js";
export { runCalibrate, renderCalibration, loadGoldenCases } from "./commands/calibrate.js";
export type {
  CalibrateOptions,
  CalibrationReport,
  GoldenCase,
} from "./commands/calibrate.js";
export { runInit } from "./commands/init.js";
export { registerGrader, graderFor, listGraderKinds } from "./graders/registry.js";
export type { Grader, GraderContext, GraderTarget, ExecFn } from "./graders/types.js";
export {
  updatePageEval,
  updateConfigEval,
  appendPageEvals,
} from "./core/frontmatter-edit.js";
export type { NewEvalEntry } from "./core/frontmatter-edit.js";
export {
  frontmatterSchema,
  frontmatterSchemaPath,
  FRONTMATTER_SCHEMA_ID,
} from "./schema.js";
export * from "./types.js";
