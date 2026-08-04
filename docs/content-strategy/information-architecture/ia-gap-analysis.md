---
id: ia-gap-analysis
type: information-architecture
scope: What the CUJ-driven IA requires that does not exist, and where today's content goes
companion: proposed-ia.md
current_source: README.md
new_pages: 34
---

# IA gap analysis

**Scope:** the distance between [the proposed IA](proposed-ia.md) and what exists today. It does not
restate the target structure — read that file first.

The site is **greenfield**: `docs/src/content/docs/` contains eight section-index stubs and nothing
else, created so the build resolves. The conventional "current page → proposed section" table would
therefore be empty, so §1 maps the **README** instead — the only user-facing surface docevals has —
and §2 carries the real deliverable: every page the journeys require, prioritized. **Enumerating the
gaps is the point of this document, not an embarrassment in it.**

## 1. README decomposition map

The README is a features tour. Every section has a destination, so it can be slimmed to a hook, a
five-line quickstart, and links without losing content. Slimming it is **not** part of this change —
it happens when the destination pages exist.

| README section | Destination |
|---|---|
| Title, tagline, grader hierarchy | `index.mdx`, `get-started/how-docevals-works.mdx` |
| Install | `get-started/index.mdx` |
| Declare evals in frontmatter | `evals/index.mdx`, `reference/frontmatter.mdx` |
| Validating the frontmatter itself | `evals/deterministic-checks.mdx` (`tool:docmeta`), `reference/frontmatter.mdx` |
| Generated check scripts | `evals/deterministic-checks.mdx`, `adopt/review-generated-scripts.mdx` |
| `promote` | `adopt/promote-to-deterministic.mdx` |
| Proposing evals with `fill` | `adopt/index.mdx` |
| Commands table | `reference/cli.mdx` |
| Useful `run` flags | `reference/cli.mdx` |
| Exit codes | `reference/output-and-exit-codes.mdx`, `ci/exit-codes-and-annotations.mdx` |
| Judge providers | `judge/choose-a-provider.mdx` |
| Response caching, cost | `ci/cost-and-caching.mdx` |
| Configuration | `reference/configuration.mdx` |
| Calibration | `judge/calibrate.mdx` |
| License | Stays in the README |

**Stays in the README permanently:** the hook, badges, a five-line quickstart, install, and links into
the site. Nothing else.

## 2. `[NEW]` — content the CUJs require

All 34 pages are new. `partial` means a section-index stub exists at that path with `title` and
`description` frontmatter and no content.

### P0 — launch (18)

| Page | State | Serves | Why it matters |
|---|:--:|---|---|
| `index.mdx` | partial | all | Nobody can self-route without it; every persona lands here first. |
| `get-started/index.mdx` | partial | `cuj-first-gate` | Nate's ten-minute window. No finding, no adoption. |
| `get-started/how-docevals-works.mdx` | new | `cuj-first-gate`, `cuj-orchestrate-tools` | The model every other page assumes. Priya will not commit her team without it. |
| `evals/index.mdx` | partial | `cuj-first-gate`, `cuj-eval-library` | The frontmatter contract — the tool's primary interface. |
| `evals/write-good-assertions.mdx` | new | `cuj-write-judgeable-assertions` | Highest-leverage page for Sara. Vague assertions are the root cause of flaky evals. |
| `evals/deterministic-checks.mdx` | new | `cuj-orchestrate-tools`, `cuj-cheapen-evals` | Without it readers conclude docevals means "an LLM grades my docs" and lose the cost argument internally. |
| `adopt/index.mdx` | partial | `cuj-bootstrap-corpus` | `fill` is the entire product for the solo owner. |
| `ci/index.mdx` | partial | `cuj-ci-wire` | A gate that is not in CI is a linter someone runs sometimes. |
| `ci/exit-codes-and-annotations.mdx` | new | `cuj-ci-wire`, `cuj-resolve-review` | Conflating exit 1 and exit 2 makes the check look flaky and gets it removed. |
| `ci/untrusted-pull-requests.mdx` | new | `cuj-bound-cost-and-risk` | **Highest consequence on the site.** A plausible wrong answer causes a real security incident. |
| `judge/index.mdx` | partial | 3 CUJs | "Can I trust this?" blocks every segment; three journeys route through this page. |
| `fix/index.mdx` | partial | `cuj-fix-red-check` | Highest traffic. A blocked contributor who cannot self-serve is how the gate gets removed. |
| `reference/index.mdx` | new | *(navigation)* | Shelf entry point. |
| `reference/cli.mdx` | new | 2 CUJs | Eight commands and their flags exist only in `--help` today. |
| `reference/configuration.mdx` | new | 2 CUJs | Every config knob is currently undocumented outside the schema file. |
| `reference/frontmatter.mdx` | new | 3 CUJs | The published schema needs prose; resolution order is invisible until it bites. |
| `reference/graders.mdx` | new | `cuj-orchestrate-tools` | Nine grader kinds with per-kind `options`, documented nowhere. |
| `reference/output-and-exit-codes.mdx` | new | `cuj-first-gate` | Four output formats; readers must be able to parse what they see. |

### P1 — depth (11)

| Page | Serves | Why |
|---|---|---|
| `evals/named-evals-and-suites.mdx` | `cuj-eval-library` | The step from a linter to a standard. |
| `evals/test-your-commands.mdx` | `cuj-orchestrate-tools` | The self-testing convention this site itself runs on. |
| `adopt/retrofit-a-legacy-corpus.mdx` | `cuj-retrofit-corpus` | The severity inversion. Getting it wrong ends adoptions. |
| `adopt/promote-to-deterministic.mdx` | `cuj-cheapen-evals` | Without the ratchet, cost grows with the corpus forever. |
| `ci/recipes.mdx` | `cuj-ci-wire` | Devin runs four CI platforms, not one. |
| `ci/cost-and-caching.mdx` | `cuj-bound-cost-and-risk`, `cuj-bootstrap-corpus` | Unpredictable spend is what gets a check disabled. |
| `judge/calibrate.mdx` | `cuj-trust-the-judge` | The artifact Sara hands a skeptic. |
| `judge/human-review.mdx` | `cuj-resolve-review` | A queue nobody knows how to clear becomes a queue nobody clears. |
| `judge/choose-a-provider.mdx` | `cuj-trust-the-judge`, `cuj-ci-wire` | The security-review answer: self-hosted endpoint, or no API key at all. |
| `fix/faq.mdx` | `cuj-fix-red-check` | Failures that are not the contributor's to fix. |
| `reference/glossary.mdx` | *(vocabulary)* | Ten terms used across every section. |

### P2 — completeness (5)

| Page | Serves | Why deferred |
|---|---|---|
| `evals/regression-vs-capability.mdx` | `cuj-write-judgeable-assertions`, `cuj-retrofit-corpus` | Covered in outline by `write-good-assertions` and `severity-and-findings` until it earns a page. |
| `evals/severity-and-findings.mdx` | `cuj-orchestrate-tools`, `cuj-retrofit-corpus` | The ratchet is teachable inside `retrofit-a-legacy-corpus` first. |
| `adopt/review-generated-scripts.mdx` | `cuj-cheapen-evals` | `promote-to-deterministic` covers the essential warning. |
| `ci/consume-results.mdx` | `cuj-ci-wire` | Only bites once a team has a dashboard to feed. |
| `reference/files-and-state.mdx` | `cuj-resolve-review` | Paths are discoverable; documenting them is a completeness fix. |

## 3. Pages that serve no CUJ

Two of the 34 are not required by any journey step. Both are kept, with a stated reason — the check
exists so that furniture is a decision rather than an accident.

| Page | Disposition | Reason |
|---|---|---|
| `reference/index.mdx` | **Keep** | Navigation, not content. Starlight needs a section entry point and readers need a shelf index. It carries no unique information and must not grow any. |
| `reference/glossary.mdx` | **Keep** | Vocabulary support. Ten terms recur across every section; a glossary is cheaper than defining them repeatedly. If it starts explaining rather than defining, it has become a concept page in the wrong section. |

Nothing is pruned, because nothing exists yet. **Re-run this section at the first content audit** —
after launch, pages accumulate that serve no journey, and that is when this table earns its keep.

## 4. Surface coverage check

Every part of the tool's public surface must map to a page. Anything unmapped is a gap, not an
omission. Verified against `src/cli.ts`, `src/core/config-schema.json`, and `src/graders/registry.ts`.

### Commands

| Command | Documented in |
|---|---|
| `run` | `get-started/index.mdx`, `ci/index.mdx`, `reference/cli.mdx` |
| `list` | `evals/named-evals-and-suites.mdx`, `reference/cli.mdx` |
| `generate` | `evals/deterministic-checks.mdx`, `reference/cli.mdx` |
| `fill` | `adopt/index.mdx`, `reference/cli.mdx` |
| `promote` | `adopt/promote-to-deterministic.mdx`, `reference/cli.mdx` |
| `calibrate` | `judge/calibrate.mdx`, `reference/cli.mdx` |
| `review` | `judge/human-review.mdx`, `reference/cli.mdx` |
| `init` | `get-started/index.mdx`, `reference/cli.mdx` |

Notable flags with a home beyond the CLI reference: `--deterministic-only` and `--llm-only`
(`evals/deterministic-checks.mdx`, `fix/index.mdx`); `--no-frontmatter-commands`
(`ci/untrusted-pull-requests.mdx`); `--no-cache` and `--max-cost` (`ci/cost-and-caching.mdx`);
`--format` (`reference/output-and-exit-codes.mdx`); `--fail-on-review`
(`ci/exit-codes-and-annotations.mdx`); `--runs` (`judge/index.mdx`); `--provider`/`--model`
(`judge/choose-a-provider.mdx`); `--dry-run` and `--confidence` (`adopt/index.mdx`); `--write`
(`adopt/promote-to-deterministic.mdx`); `--golden` (`judge/calibrate.mdx`); `--no-generate`
(`evals/deterministic-checks.mdx`).

### Config keys

Keys are written fully qualified so this table is greppable against
`src/core/config-schema.json` rather than merely readable.

| Key | Documented in |
|---|---|
| `version` | `reference/configuration.mdx` |
| `files.include`, `files.exclude` | `reference/configuration.mdx`, `adopt/retrofit-a-legacy-corpus.mdx` |
| `defaults.suite` | `evals/named-evals-and-suites.mdx` |
| `defaults.failFast`, `defaults.concurrency` | `reference/configuration.mdx` |
| `provider.default`, `provider.anthropic`, `provider.openai`, `provider.claude-cli` | `judge/choose-a-provider.mdx`, `reference/configuration.mdx` |
| `judge.ensembleRuns`, `judge.temperature`, `judge.zones` | `judge/index.mdx` |
| `judge.falsePositiveAlert` | `judge/calibrate.mdx` |
| `judge.cacheDir`, `fill.cacheDir` | `ci/cost-and-caching.mdx`, `reference/files-and-state.mdx` |
| `judge.maxCostUsd`, `fill.maxCostUsd` | `ci/cost-and-caching.mdx` |
| `scripts.dir`, `scripts.configDir`, `scripts.timeoutMs` | `adopt/review-generated-scripts.mdx`, `reference/configuration.mdx` |
| `scripts.allowFrontmatterCommands` | `ci/untrusted-pull-requests.mdx` |
| `fill.confidenceThreshold`, `fill.maxEvalsPerPage`, `fill.temperature` | `adopt/index.mdx` |
| `evals` (named evals), `suites` (incl. `targetPassRate`) | `evals/named-evals-and-suites.mdx` |

Eval fields — `assertion`, `type`, `grader`, `evidence`, `examples`, `command`, `successExitCodes`,
`timeoutMs`, `generated`, `options`, `severity`, `severityMap` — are all covered by
`reference/frontmatter.mdx`, with `assertion`/`evidence`/`examples` taught in
`evals/write-good-assertions.mdx` and `severity`/`severityMap` in `evals/severity-and-findings.mdx`.

### Grader kinds

| Kind | Documented in |
|---|---|
| `llm` | `judge/index.mdx`, `evals/write-good-assertions.mdx` |
| `command` | `evals/deterministic-checks.mdx` |
| `human` | `judge/human-review.mdx` |
| `tool:docmeta` | `evals/deterministic-checks.mdx`, `reference/graders.mdx` |
| `tool:markdownlint` | `evals/deterministic-checks.mdx`, `reference/graders.mdx` |
| `tool:vale` | `evals/deterministic-checks.mdx`, `reference/graders.mdx` |
| `tool:doc-structure-lint` | `evals/deterministic-checks.mdx`, `reference/graders.mdx` |
| `tool:doc-detective` | `evals/test-your-commands.mdx`, `reference/graders.mdx` |
| `tool:freshness` | `reference/graders.mdx` |
| `tool:reading-level` | `reference/graders.mdx` |
| `tool:differentiation` | `reference/graders.mdx` |

**No unmapped surface.** Re-run this check whenever a command, config key, or grader is added — a new
capability with no page is a documentation gap the moment it ships, and this table is where that
becomes visible.
