# domain

Product rules per domain, plus what holds across all of them: numbered invariants, formulas,
calculation conventions.

It is born empty. One file per domain, created when a rule spans changes and does not fit in a
single `spec.md` — `ledger.md`, `credit.md`, `subscriptions.md`, whatever the project has. A rule
that matters to one change only stays in that change's `spec.md`.

## Why this layer exists

`memory/` holds cross-cutting decisions and has a ceiling, because it is read on every change.
`shared/` holds conventions and the glossary, and is read on every change for the same reason.
Domain rules fit in neither: they are large, and relevant to few changes at a time.

**This layer is read selectively** — only the file for the domain the change touches, picked by
name. That is what exempts it from a ceiling: it is not a fixed per-session cost.

## Who reads it, and who does not

| Step | `.specs/domain/` |
|---|---|
| `spec-new-change` | **reads** the domain the change touches, and **distills it in full** into the spec |
| `spec-run-change` | **does not open it** — the spec already distilled it |
| `RUN-ALL.md` | reads selectively, while loading context |
| `spec-archive-change` | **writes** here, when a change settles a domain rule |
| `spec-verify-change` | does not audit against the domain — it audits against the approved spec |

**Distill, do not reference.** Whoever implements will not open this directory. A rule that governs
a task goes into that task's `spec.md` written out in full; "per the credit domain" does not survive
a change of session.

## Invariant numbering

If the project numbers invariants, the number is **frozen**: code and migrations start citing it.
Gaps in the numbering are normal and are not to be fixed — renumbering breaks every written
reference.
