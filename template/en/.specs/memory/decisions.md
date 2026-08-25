# Architectural decisions

Append-only log. Each decision goes in once, with a date and a reason. A decision that gets reverted
is **not deleted**: a new entry is added that supersedes it, linking to the original. The history of
the why is the value of this file.

Only what spans changes belongs here. A detail that matters to a single change stays in its `spec.md`.

> **This file has a ceiling — see the `spec-ceilings-and-pruning` skill.** It is read on every
> change, so its size is imposed on all future work. Pruning happens **on read**, and only in the
> `spec-new-change` skill. Running and archiving check and warn, never prune.

---

## D001 — Adopt spec-driven development

- **Date:** YYYY-MM-DD
- **Context:** Work conducted mostly by an agent. Without an external record, the context behind each
  decision dies at the end of the session, and the next session rebuilds it by guessing.
- **Decision:** Every unit of work is specified under `.specs/changes/` before becoming code.
  Recurring implementation patterns become skills under `.claude/skills/`.
- **Discarded alternatives:**
  - *Free-form prompting per session* — fast at first, but the project loses traceability and the
    architecture drifts every session.
  - *Repository issues only* — they describe the task, but not the code pattern the implementation
    must follow.
- **Consequence:** A fixed cost per change (writing the spec first). In exchange: reproducible
  execution, review possible before the code exists, and context that survives a change of session
  or of person.

---

## D002 — <title of the next decision>

- **Date:**
- **Context:**
- **Decision:**
- **Discarded alternatives:**
- **Consequence:**
