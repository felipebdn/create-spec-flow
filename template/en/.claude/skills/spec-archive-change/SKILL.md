---
name: spec-archive-change
description: Moves a finished change from .specs/changes/ to .specs/archive/, first promoting what it learned into memory/ and shared/. Use when the user asks to archive, close or clean up changes that are already done.
---

# Archive change

Takes what is finished out of the active queue, without losing the why.

Archiving is not deleting. It is moving something to where it no longer clutters the queue but stays
readable as history. Never delete a change folder.

## Preconditions

Do not archive without all of these:

- [ ] `status: archive-approved` in `spec.md`, after explicit human approval.
- [ ] `review.md` has an `approved` verdict for the current commit.
- [ ] Every acceptance criterion ticked.
- [ ] Every task in `tasks.md` ticked.
- [ ] Every guarantee either sabotaged with named tests, or declared without a round and with a reason.
- [ ] `walkthrough.md` written, with a risk-ordered review and measured verification.
- [ ] No open question pending.
- [ ] No other active change declares `depends_on` on this one and still needs to consult it actively
      (archiving does not break the dependency, but confirm the dependent already has the contract it
      needs in `shared/`).

If any of these is missing: stop, say which one, do not archive.

## Promotion before moving

This is the step that gives archiving its value. Before moving, extract what outlives the change:

1. **Decisions** — what was decided and holds beyond this change goes into
   `.specs/memory/decisions.md`, with the date, the discarded alternative and the reason.
2. **Contracts** — a signature, an error shape, a schema another change will consume is promoted to
   `.specs/shared/`.
3. **Domain rule** — a rule that now holds beyond this change is promoted to that domain's file
   under `.specs/domain/`, creating the file if it does not exist. A new invariant gets a number,
   and that number is frozen from then on.
4. **Vocabulary** — a new domain term goes into `.specs/shared/glossary.md`.
4. **Stack** — a new dependency goes into `.specs/memory/stack.md`.
5. **A repeated pattern** — if the implementation produced a mold that will repeat, suggest creating
   a skill under `.claude/skills/`. Suggest; do not create without approval.

Once it is archived, nobody will look for a contract inside the archived folder. Whatever does not
get promoted now disappears in practice.

**When appending to `memory/`, check the size** — `wc -l`. Over the ceiling, append anyway and
**warn in the report** that pruning is due in the next `spec-new-change`. Do not prune here:
promoting is appending, and choosing what goes is another decision. See the
`spec-ceilings-and-pruning` skill.

## Move

Before moving, set the state to `archived`. If the operation fails, restore
`archive-approved` and record the blocker.

```bash
mv .specs/changes/NNN-slug .specs/archive/NNN-slug
```

Keep the numeric prefix. The number is **not** reused by future changes.

## When you finish

Report: what was archived, what was promoted into `memory/` and `shared/`, and what is still in the
active queue.
