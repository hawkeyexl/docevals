---
id: journeys-overview
type: overview
backbone: cuj-first-gate
journeys:
  - cuj-first-gate
  - cuj-eval-library
  - cuj-orchestrate-tools
  - cuj-bootstrap-corpus
  - cuj-retrofit-corpus
  - cuj-cheapen-evals
  - cuj-ci-wire
  - cuj-bound-cost-and-risk
  - cuj-write-judgeable-assertions
  - cuj-trust-the-judge
  - cuj-resolve-review
  - cuj-fix-red-check
---

# Critical user journeys

**Scope:** the twelve end-to-end outcomes the docs must support, and which persona takes each. The
people are in [`../personas/`](../personas/_overview.md); where each journey's steps land in the site
is [`../information-architecture/proposed-ia.md`](../information-architecture/proposed-ia.md).

A CUJ is a complete outcome someone reaches **using docevals**, not a topic. Each one lists ordered
steps, and every step names a real repo-relative doc path with an `exists:` marker — which is what
turns this directory into a checkable backlog rather than a wish list.

## Coverage matrix

● primary · ○ secondary

| CUJ | Priya | Nate | Devin | Sara | Theo | Iris |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| [`cuj-first-gate`](cuj-first-gate.md) **(backbone)** | ● | ○ | | | | |
| [`cuj-eval-library`](cuj-eval-library.md) | ● | | | ○ | | |
| [`cuj-orchestrate-tools`](cuj-orchestrate-tools.md) | ● | | | | | |
| [`cuj-bootstrap-corpus`](cuj-bootstrap-corpus.md) | | ● | | | | ○ |
| [`cuj-retrofit-corpus`](cuj-retrofit-corpus.md) | ○ | | | | | ● |
| [`cuj-cheapen-evals`](cuj-cheapen-evals.md) | | ○ | | ● | | ○ |
| [`cuj-ci-wire`](cuj-ci-wire.md) | ○ | | ● | | | |
| [`cuj-bound-cost-and-risk`](cuj-bound-cost-and-risk.md) | | | ● | | | |
| [`cuj-write-judgeable-assertions`](cuj-write-judgeable-assertions.md) | ○ | | | ● | | |
| [`cuj-trust-the-judge`](cuj-trust-the-judge.md) | | | | ● | | |
| [`cuj-resolve-review`](cuj-resolve-review.md) | ○ | | | ● | | |
| [`cuj-fix-red-check`](cuj-fix-red-check.md) | | | | | ● | |

Every persona has at least one primary journey and every journey has at least one persona. The
distribution is uneven by design: Sara owns four primaries because assertion craft, calibration, the
review queue, and the push toward cheaper graders are four distinct jobs that happen to sit with one
role, and Theo owns exactly one because his entire relationship with the tool is a single page.

## The backbone

[`cuj-first-gate`](cuj-first-gate.md) — install → assert → run → gate — is the backbone. It is the
only journey that crosses every layer: the frontmatter contract, the grader hierarchy, the judge, the
output format, and CI. Everything below either specializes one of its steps or picks up where it ends:

- **Authoring** grows out of the "write an assertion" step
  - [`cuj-write-judgeable-assertions`](cuj-write-judgeable-assertions.md) — the wording of one eval
    - [`cuj-trust-the-judge`](cuj-trust-the-judge.md) — proving the wording holds at scale
      - [`cuj-resolve-review`](cuj-resolve-review.md) — the recurring queue that follows
  - [`cuj-eval-library`](cuj-eval-library.md) — many assertions, shared
  - [`cuj-orchestrate-tools`](cuj-orchestrate-tools.md) — the deterministic half of the hierarchy
- **Scale** grows out of "do this for more than one page"
  - [`cuj-bootstrap-corpus`](cuj-bootstrap-corpus.md) — propose instead of hand-write
    - [`cuj-retrofit-corpus`](cuj-retrofit-corpus.md) — the same, when day one would be all red
- **Operations** grows out of the "land the CI step" step
  - [`cuj-ci-wire`](cuj-ci-wire.md) — install and operate
    - [`cuj-bound-cost-and-risk`](cuj-bound-cost-and-risk.md) — keep it from becoming an incident
- **Convergent** — reached from authoring *and* from scale
  - [`cuj-cheapen-evals`](cuj-cheapen-evals.md) — push evals down the grader hierarchy
- **Standalone**
  - [`cuj-fix-red-check`](cuj-fix-red-check.md) — reached from a CI annotation, never from another
    journey

When two journeys disagree about how something should be explained, the backbone wins.

## Reading the steps

Each step is `{ stage, doc, exists, note }`, where `doc` is a **repo-relative source path** so
`exists` can be checked with a file test:

| `exists` | Meaning | Count today |
|---|---|---|
| `true` | A real page serves this step | **0** — the site is greenfield |
| `partial` | A section-index stub exists at that path, but not the content | the 8 scaffolded stubs |
| `false` | The page does not exist and the journey needs it | everything else |

Every `partial` and `false` route appears in
[`../information-architecture/ia-gap-analysis.md`](../information-architecture/ia-gap-analysis.md).
That correspondence runs both ways and is the check that the backlog is complete: a route in a journey
and not in the backlog means an unplanned page, and a page in the backlog serving no journey means
content nobody asked for.

## Concentration, and what it tells us

Four pages carry a disproportionate share of the steps, which is a useful signal about where the
writing effort actually is:

| Page | Steps | Why |
|---|---|---|
| `ci/untrusted-pull-requests.mdx` | 4 | The highest-consequence page on the site — a plausible wrong answer causes real harm |
| `fix/index.mdx` | 4 | Correct: the whole journey should be one page, not a section |
| `evals/write-good-assertions.mdx` | 3 | The highest-leverage page for Sara |
| `judge/index.mdx` | 3 | Three separate journeys need the judging model explained |
