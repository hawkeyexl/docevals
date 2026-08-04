---
id: cuj-retrofit-corpus
type: cuj
title: Get a legacy corpus onto a ratchet without a wall of red
personas: [persona-retrofitter, persona-corpus-owner]
trigger: "Thousands of pages that have never been measured, and a mandate to get quality under control"
entry_point: docs/src/content/docs/adopt/retrofit-a-legacy-corpus.mdx
success_criteria: >
  One section is gated at error severity, the rest reports at warning, every increment merged green,
  and no assertion was weakened to get there.
steps:
  - { stage: "Decide what should not be evaluated at all", doc: docs/src/content/docs/adopt/retrofit-a-legacy-corpus.mdx, exists: false, note: "[GAP] files.exclude and page-level skip as legitimate triage" }
  - { stage: "Propose evals one directory at a time", doc: docs/src/content/docs/adopt/index.mdx, exists: partial, note: "[GAP] section-index stub only; batching keeps the review reviewable" }
  - { stage: "Enter at warning severity so nothing fails yet", doc: docs/src/content/docs/evals/severity-and-findings.mdx, exists: false, note: "[GAP] the inversion: lower severity, never weaken the assertion" }
  - { stage: "Use a capability suite with a target below 1.0", doc: docs/src/content/docs/evals/regression-vs-capability.mdx, exists: false, note: "[GAP]" }
  - { stage: "Burn down the findings for one section", doc: docs/src/content/docs/fix/index.mdx, exists: partial, note: "[GAP] section-index stub only" }
  - { stage: "Ratchet that section up to error severity", doc: docs/src/content/docs/adopt/retrofit-a-legacy-corpus.mdx, exists: false, note: "[GAP]" }
  - { stage: "Make the surviving evals cheap to keep running", doc: docs/src/content/docs/adopt/promote-to-deterministic.mdx, exists: false, note: "[GAP]" }
---

# CUJ: Get a legacy corpus onto a ratchet

**Scope:** the transition from an unmeasured corpus to a continuously evaluated one. The proposing
mechanics are [`cuj-bootstrap-corpus`](cuj-bootstrap-corpus.md); this journey is about **sequencing**
so that every increment is mergeable. Steady-state operation afterwards is
[`cuj-first-gate`](cuj-first-gate.md) and [`cuj-ci-wire`](cuj-ci-wire.md).

**Trigger.** Someone has been made responsible for the quality of a corpus they did not write, cannot
fully vouch for, and may not delete.

**Narrative.** This journey exists because the obvious approach fails, reliably and expensively. Point
an honest quality bar at 3,000 pages that have never been measured and nearly all of them fail at
once. The result is accurate and useless — unmergeable, untriageable, and it teaches the team that the
tool is wrong rather than that the docs are.

The instinct that follows is to soften the assertions until the build goes green. That is the failure
mode this journey exists to prevent, because it is irreversible in practice: an assertion weakened to
accommodate the current state of the corpus permanently encodes that state as the standard, and no
one ever tightens it back.

**The inversion is the whole lesson: keep the assertions honest and lower the *severity* instead.**
`severity: warning` reports without failing. A capability suite with a target pass rate below 1.0
measures reach instead of demanding perfection. `files.exclude` and page-level `skip` remove content
that should never have been in scope. None of these touch what the assertion says. Then severity
ratchets up section by section as findings are burned down — each step small, green, and mergeable.

Two supporting points earn their space. **Triage is a legitimate first step, not surrender**:
deprecated sections, generated reference, and archives should be excluded rather than fixed, and a
reader who feels that excluding is cheating will instead try to fix content nobody reads. And
**batching by directory is what keeps the review reviewable** — a `fill` pass across the whole corpus
produces a pull request no human can approve, which stalls the initiative on its first review rather
than its first run.

[Iris](../personas/iris-retrofitter.md) owns this journey; [Priya](../personas/priya-corpus-owner.md)
walks it whenever her corpus predates her adoption, which is most of the time.

**Current friction / gap.** Seven steps, seven gaps. `adopt/retrofit-a-legacy-corpus.mdx` carries the
inversion and is the highest-consequence page in the `adopt/` section — getting it wrong does not slow
an adoption down, it ends one.
