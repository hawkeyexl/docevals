# docevals — agent notes

TypeScript/ESM CLI + library. Node >= 24. Mirrors docmeta conventions (same author): tsup build to `dist/`, vitest, commander.

## Commands

- `npm test` — vitest (unit + integration; no network, no API keys; the mock provider and injected exec cover everything)
- `DOCEVALS_LIVE=1 npm test` — adds the live smoke test via the Claude CLI
- `npm run typecheck` / `npm run build`
- `node dist/cli.js run --deterministic-only` — dogfood run against `test/fixtures/pages`

## Architecture

- One concept: the **eval**. Graders: `llm`, `command`, `tool:<name>`, `human`. No "runners".
- `src/core/engine.ts` — pipeline: discover → resolve → generation pass → deterministic graders (cheap first) → LLM judge → reviews → aggregate. Judge and script generation are injected (`options.judge`, `options.generateScripts`) so the engine tests offline.
- `src/core/resolve.ts` — merges page frontmatter (`docevals` key) with `docevals.config.yaml` suites/named evals. Page wins on name collision. `type` defaults to `regression`, `grader` to `llm`.
- `src/graders/` — grader registry (docmeta schema-registry pattern). Tool adapters parse each tool's output into `Finding[]`; unit tests use captured output + fake exec, never real binaries.
- `src/judge/` — providers (anthropic / openai-compat / claude-cli / mock), 3-run ensemble, consensus (`partial` = fail), zones, content-addressed cache (`PROMPT_VERSION` in the key — bump when prompts change), cost table.
- `src/graders/scriptgen.ts` + `src/core/frontmatter-edit.ts` — LLM-generated check scripts written to `{docDir}/docevals/`, command reference persisted via surgical YAML edits (body stays byte-identical). `generated.assertionHash` triggers regeneration when the assertion changes.

## Invariants

- Errored judge runs count against consensus — they may push an eval to human-review, never to a silent pass.
- Deterministic evals fail only on `error`-severity findings; warnings/info report but pass.
- Exit codes: 0 pass, 1 any fail/error/suite-miss, 2 operational (`DocevalsError`).
- `src/schemas/frontmatter-0.1.json` must stay identical to docmeta's `src/schemas/docevals/0.1.json` (drift-guarded by `test/unit/schema-drift.test.ts`). Update both together.
- docmeta is a `file:../docmeta` dependency until a docmeta release ships the `extractFrontmatter` export; switch to a semver range then.

## Fixtures

`test/fixtures/pages/` is a snapshot of doc-detective's docs annotated with docevals frontmatter. `goTo.mdx` intentionally fails freshness at error severity; `installation.mdx` has a command eval with no command (generation target); `find.mdx` has a pre-generated script in `docs/actions/docevals/`.
