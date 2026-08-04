---
id: cuj-ci-wire
type: cuj
title: Wire the gate into CI
personas: [persona-pipeline-owner, persona-corpus-owner]
trigger: "A docs team asked for a step, and it has to work the same way in every repo"
entry_point: docs/src/content/docs/ci/index.mdx
success_criteria: >
  One parameterized job, identical across repos, that blocks a pull request on findings, annotates
  the offending lines inline, and routes operational failures somewhere other than the author.
steps:
  - { stage: "Add the job on the reader's platform", doc: docs/src/content/docs/ci/index.mdx, exists: partial, note: "[GAP] section-index stub only; needs the GitHub Actions recipe" }
  - { stage: "Get the same recipe for the other platforms", doc: docs/src/content/docs/ci/recipes.mdx, exists: false, note: "[GAP] GitLab CI, Jenkins, pre-commit" }
  - { stage: "Route on the exit code", doc: docs/src/content/docs/ci/exit-codes-and-annotations.mdx, exists: false, note: "[GAP] 0 pass, 1 findings, 2 operational" }
  - { stage: "Annotate the offending lines in the pull request", doc: docs/src/content/docs/ci/exit-codes-and-annotations.mdx, exists: false, note: "[GAP] --format github" }
  - { stage: "Supply the provider credential", doc: docs/src/content/docs/judge/choose-a-provider.mdx, exists: false, note: "[GAP] apiKeyEnv, and the claude-cli provider needing no key" }
  - { stage: "Persist the response cache between runs", doc: docs/src/content/docs/ci/cost-and-caching.mdx, exists: false, note: "[GAP] cache location and what belongs in a CI cache key" }
  - { stage: "Feed results into existing tooling", doc: docs/src/content/docs/ci/consume-results.mdx, exists: false, note: "[GAP] --format json and the TypeScript API" }
---

# CUJ: Wire the gate into CI

**Scope:** installing and operating the gate. Bounding what it can spend and what it can execute is
the companion journey, [`cuj-bound-cost-and-risk`](cuj-bound-cost-and-risk.md) — split out because it
has a different failure mode (a security incident or a surprise bill, rather than a broken build) and
a reader can get this one right and that one badly wrong.

**Trigger.** The evals exist and work locally. Now they have to run somewhere nobody is watching.

**Narrative.** [Devin](../personas/devin-pipeline-owner.md) is the primary reader and he authors no
evals; every page in this journey must be usable without knowing what a capability suite is. He
arrives with a strong prior that any check which is slow, flaky, or expensive will be disabled by the
first team it inconveniences, and he is looking for evidence that this one is none of those.

**The exit-code contract is the load-bearing part**, because the three codes route to different
humans. `0` passes. `1` means findings — that is the author's problem and should block the pull
request. `2` means operational: a missing credential, an unreachable provider, a malformed config.
That is the platform team's problem and blaming the author for it is how a check earns a reputation
for flakiness it does not deserve. A recipe that treats any non-zero exit as "docs are bad" is wrong,
and the docs have to be explicit enough that nobody writes one.

**`--format github` is the difference between a usable check and an annoying one.** A failure that
annotates the exact line in the pull request is fixed in minutes; the same failure reported only in a
job log gets ignored until someone asks. This is the step that most directly serves
[Theo](../personas/theo-contributor.md), who never reads this journey — which is worth stating,
because Devin will not otherwise weigh a formatting flag as an adoption decision.

**Cache persistence is a correctness concern, not an optimization.** The cost model assumes unchanged
pages never re-judge. A CI job that starts with a cold cache every time re-judges the whole corpus on
every push, and the resulting bill is the reason the check gets removed. Where the cache lives and
what belongs in the cache key are therefore first-class reference material.

The credential step is where the fork problem first appears. It is *raised* here and *resolved* in
[`cuj-bound-cost-and-risk`](cuj-bound-cost-and-risk.md); this journey must hand off rather than
half-answer it.

**Current friction / gap.** Seven steps, seven gaps.
