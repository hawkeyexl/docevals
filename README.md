# docevals

Deterministic and LLM-as-judge evals for documentation pages, driven by frontmatter.

Every quality check on a documentation page is an **eval**: a named, testable assertion with a
**grader** that decides pass or fail. Graders run in preference order — code first, an LLM judge
second, a human last.

## Quickstart

Requires Node.js 24+.

```bash
npm i -D @hawkeyexl/docevals
npx docevals init
npx docevals run --deterministic-only
```

That last command needs no API key and costs nothing — it runs the deterministic graders only. On a
corpus that has never been checked, it usually finds something.

Declare an assertion in a page's frontmatter:

```yaml
---
title: Installation
last-reviewed: 2026-06-01
evals:
  - no-future-promises
  - name: install-command-present
    assertion: The page contains a bash code block with `npm i -g doc-detective`.
    grader: command
---
```

```console
$ npx docevals run docs/ --deterministic-only
docs/actions/goTo.mdx
  FAIL fresh-enough
       error:4 [freshness/stale] Page last reviewed 937 days ago (max 365)
  pass readable
  pass frontmatter-valid

Suites
  reference: 2/3 passed — 67% vs target 100% below target (1 skipped)
```

Exit `1`. A docs regression, caught the way a test catches a code one.

## Documentation

Full docs are in [`docs/`](docs/src/content/docs/) and build with Astro + Starlight.

| Section | Covers |
|---|---|
| [Get started](docs/src/content/docs/get-started/index.mdx) | Install, first assertion, first finding |
| [How docevals works](docs/src/content/docs/get-started/how-docevals-works.mdx) | The eval, the grader hierarchy, how a verdict is reached |
| [Write evals](docs/src/content/docs/evals/index.mdx) | The frontmatter contract, assertion craft, deterministic checks, suites |
| [Adopt at scale](docs/src/content/docs/adopt/index.mdx) | `fill`, retrofitting a legacy corpus, `promote` |
| [Run it in CI](docs/src/content/docs/ci/index.mdx) | Recipes, exit codes, cost, and fork safety |
| [Trust the judge](docs/src/content/docs/judge/index.mdx) | Ensemble, confidence zones, calibration, providers |
| [Fix a failing eval](docs/src/content/docs/fix/index.mdx) | For contributors whose PR just went red |
| [Reference](docs/src/content/docs/reference/index.mdx) | CLI, config, frontmatter, graders, output, state |

To run the site locally:

```bash
cd docs && npm install && npm run dev
```

## Commands

| Command | Purpose |
|---|---|
| `docevals run [globs]` | Run all evals: deterministic graders first, then the LLM judge |
| `docevals list` | Dry run — show each page's resolved eval plan |
| `docevals generate` | Generate scripts for command evals missing a command |
| `docevals fill [--dry-run]` | Propose new frontmatter evals with an LLM, gated on confidence |
| `docevals promote [--write]` | Convert llm evals that could be deterministic |
| `docevals review <file> <eval> <pass\|fail>` | Record a human verdict |
| `docevals calibrate` | Score the judge against a human-verified golden set |
| `docevals init` | Scaffold a starter config |

Exit codes: `0` pass · `1` failures, errors, or a suite below target · `2` usage or operational
error. Full flag reference in [the CLI docs](docs/src/content/docs/reference/cli.mdx).

## The published schema

docevals ships the frontmatter JSON Schema as a package artifact, so any validator can check your
pages:

```bash
docmeta validate --schema node_modules/@hawkeyexl/docevals/schemas/frontmatter-0.1.json docs/
```

```js
import { frontmatterSchema, frontmatterSchemaPath } from "@hawkeyexl/docevals";
```

## Contributing

See [CLAUDE.md](CLAUDE.md) for repo conventions — red/green TDD, Conventional Commits, and the ADR
rule. Decisions live in [`adrs/`](adrs); the docs content strategy lives in
[`docs/content-strategy/`](docs/content-strategy/).

## License

MIT
