# Architecture Decision Records

Every **behavior change** in docevals ships with an ADR here. The ADR records the intended behavior and the reasoning — write it before or alongside the code, so it is the reviewable source of truth rather than an afterthought. The full rule lives in [CLAUDE.md](../CLAUDE.md#architecture-decision-records-required).

## Conventions

- **Format**: [MADR 4.0.0](https://adr.github.io/madr/). Start from [template.md](template.md).
- **Filename**: `NNNNN-kebab-case-title.md`, 5-digit zero-padded.
- **Numbering starts at `01000`** and increments. The range `00001`–`00999` is **reserved** to backfill pre-existing architectural decisions later — do not use it for new ones.
- **Scope**: decisions (behavior, contracts, trade-offs), not mechanical changes. Pure refactors, dependency bumps, typo fixes, and style changes don't need one. If a change alters observable behavior or a public contract, it does.

## Index

| ADR | Title | Status |
|---|---|---|
| [01000](01000-publish-the-frontmatter-schema-from-this-repo.md) | Publish the frontmatter schema from this repo | accepted |
| [01001](01001-fill-proposes-llm-evals-with-confidence-gating.md) | `fill` proposes llm-graded evals with a confidence gate | accepted |

## To backfill

These decisions predate the ADR rule and are currently recorded only in [CLAUDE.md](../CLAUDE.md#design-decisions). They should each become an ADR:

- One unified concept: the eval (rejecting the runners/evals split).
- Generated check scripts are files referenced as commands, never inline in frontmatter.
- `type` defaults to `regression` rather than `capability`.
- Level 1 orchestrates existing tools rather than reimplementing them.
