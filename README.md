# docevals

Deterministic and LLM-as-judge evals for documentation pages, driven by frontmatter.

docevals operationalizes the **Docs as Evals** methodology: every quality check on a documentation page is an *eval* — a named, testable assertion with a *grader* that decides pass or fail. Graders follow the grader hierarchy:

1. **Code-based (preferred)** — `command` evals run any CLI check; `tool:*` evals orchestrate existing tools (docmeta, markdownlint, Vale, doc-structure-lint, Doc Detective) plus a few native checks no existing tool covers (freshness, reading level, cross-page differentiation). docevals doesn't reimplement linters; it hooks them.
2. **LLM-as-judge** — for assertions that need interpretation. Judged with safeguards: temperature 0, pinned models, structured JSON verdicts, a 3-run ensemble, and confidence zones (auto-pass / auto-fail / human-review).
3. **Human** — the human-review zone routes to people; verdicts persist in `.docevals/reviews.yaml` and self-invalidate when the page changes.

Verdicts are **binary pass/fail**. Suite pass rates emerge from binary judgments — regression suites target ~100%, capability suites ~70%.

## Install

```bash
npm i -D docevals
npx docevals init
```

Requires Node.js 24+.

## Declare evals in frontmatter

All eval fields live in page frontmatter under the `docevals` key, validated by the `docevals:frontmatter:0.1` schema (also a docmeta built-in). Pages can reference named evals from `docevals.config.yaml`, or inline their own:

```yaml
---
title: Installation
last-reviewed: 2026-06-01
docevals:
  suite: how-to                  # named suite from docevals.config.yaml
  evals:
    - no-future-promises         # reference a named eval
    - name: install-command-accuracy
      assertion: >
        The documented install command is `npm i -g doc-detective` and the
        stated Node.js minimum is 22 or later.
      type: regression           # regression (default) | capability
      grader: llm
      evidence: Code blocks and prerequisites list
      examples:
        pass: Shows `npm i -g doc-detective` and Node.js v22+.
        fail: Shows a deprecated command or an older Node minimum.
    - name: install-command-present
      assertion: The page contains a bash code block with `npm i -g doc-detective`.
      grader: command            # no command? docevals generates a script for it
---
```

## Generated check scripts

A `command`-graded eval with an assertion but no `command` is a plain-language deterministic check. `docevals run` (or `docevals generate`) has your configured LLM write a small Node script for it, saves it **parallel to the doc** (`{docDir}/docevals/page.eval-name.mjs`), and writes the command reference back into the frontmatter:

```yaml
    - name: install-command-present
      assertion: The page contains a bash code block with `npm i -g doc-detective`.
      grader: command
      command: [ node, docevals/installation.install-command-present.mjs, "{file}" ]
      generated:
        assertionHash: aefaa89e…   # editing the assertion regenerates the script
```

Generated scripts are ordinary version-controlled source — review them in PRs, edit them by hand. After generation, the check is fully deterministic: no LLM in the loop.

`docevals promote` goes the other way: it reviews your llm-graded evals, asks the LLM which are actually expressible as code ("if you can express the eval criterion as code, do it"), and with `--write` converts them.

## Commands

| Command | Purpose |
|---|---|
| `docevals run [globs]` | Run all evals: deterministic graders first, then the LLM judge |
| `docevals list` | Dry-run: show each page's resolved eval plan |
| `docevals generate` | Generate scripts for command evals missing a command |
| `docevals promote [--write]` | Convert llm evals that could be deterministic |
| `docevals review <file> <eval> <pass\|fail>` | Record a human verdict for a needs-review eval |
| `docevals calibrate` | Score the judge against a human-verified golden set |
| `docevals init` | Scaffold a starter config |

Useful `run` flags: `--deterministic-only`, `--llm-only`, `--format human|json|markdown|github`, `--fail-on-review`, `--runs N`, `--no-cache`, `--no-generate`, `--no-frontmatter-commands` (for untrusted PRs), `--max-cost <usd>`, `--provider`, `--model`.

Exit codes: `0` all pass · `1` failures, errors, or a suite below its target pass rate · `2` usage/operational error.

## Judge providers

- **anthropic** (default) — `ANTHROPIC_API_KEY`, structured output via forced tool use.
- **openai** — any OpenAI-compatible endpoint (`baseUrl`), including Ollama, Azure, Groq; strict `json_schema` with automatic `json_object` fallback.
- **claude-cli** — shells out to the `claude` CLI with local auth; no API key.

Judge responses are cached by content (`.docevals/cache/`) — unchanged pages and assertions never re-judge. Cost is tracked per run; set `judge.maxCostUsd` for a hard budget.

## Configuration

`docevals.config.yaml` holds providers, judge settings, named evals, and suites. See [`docevals.config.yaml`](docevals.config.yaml) in this repo (which runs docevals against its own test fixtures) for a complete example.

## Calibration

Keep 20–50 human-verified cases in `.docevals/golden/*.yaml`:

```yaml
- file: docs/install.md
  eval: no-future-promises
  expected: pass
  rationale: Mentions only shipped features.
```

`docevals calibrate` reports judge/human agreement (below 70% it exits 1 — refine your assertions first, not the grader) and flags false-positive rates above `judge.falsePositiveAlert`.

## License

MIT
