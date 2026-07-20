/** Programmatic API for docevals. */
export { loadConfig, parseConfig, DEFAULT_CONFIG_FILENAME } from "./core/config.js";
export type { DocevalsConfig, EvalDef, SuiteDef, ProviderName } from "./core/config.js";
export { discoverPages, readPage, stripFrontmatterBlock } from "./core/discover.js";
export type { PageFile } from "./core/discover.js";
export { resolvePage, resolvePages } from "./core/resolve.js";
export type { ResolvedEval, ResolvedPagePlan, PageProblem } from "./core/resolve.js";
export { runList, renderList } from "./commands/list.js";
export type { ListOptions, ListRun } from "./commands/list.js";
export * from "./types.js";
