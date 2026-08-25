---
name: spec-run-change
description: Implements a change already specified under .specs/changes/, following plan.md and ticking tasks.md. Use when the user asks to run, implement or "do" a change from the queue (by number or by name). To run the whole queue, use .specs/RUN-ALL.md.
---

# Run change

Implements **one** change from the queue, start to finish, with real validation.

## 1. Load context

In this order:

1. `.specs/memory/` — stack and decisions.
2. `.specs/shared/` — conventions and glossary.
3. `spec.md`, `plan.md`, `tasks.md` of the change.
4. The skills named in `plan.md`.

**Do not open `.specs/domain/`.** Planning already distilled into the spec the rule that governs
this change, and re-reading the domain on every run undoes that saving. If something essential is
missing from the spec, that is a distillation failure, not an invitation to open the domain: treat
it as major drift, stop, and propose fixing the spec.

**Check the size of `memory/` — `wc -l`, nothing more.** Over the ceiling, **warn in the final
summary** that pruning is due in the next `spec-new-change`. **Pruning is not your job**, and
checking is — the numbers and the reason for the asymmetry are in the `spec-ceilings-and-pruning`
skill.

## 2. Check for blockers

- `depends_on` naming a change that is not `done`: stop and say so.
- An open question affecting a mandatory requirement: stop and ask. Do not guess.
- An open question not affecting a mandatory requirement: continue with the most conservative option
  and record the assumption under **Execution notes**.
- `spec.md` and `plan.md` contradict each other: `spec.md` wins; fix `plan.md` before starting.

## 3. Mark the start

`status: todo` becomes `status: in-progress` in `spec.md`.

## 4. Implement

- Follow the sequence in `plan.md`.
- Before writing any code of a kind that is already standardized, find the matching skill in
  `.claude/skills/` and apply its mold. Consistency with the existing pattern is worth more than your
  personal design preference.
- If there is no skill for a pattern that will repeat, implement it and flag in the final report that
  it is worth creating the skill.
- Tick each task `[x]` in `tasks.md` the moment it is finished — not all at the end.

## 5. Scope

`spec.md` is the contract. Necessary work that showed up along the way and is not in it **does not
enter this change**: create a new change at the end of the queue and carry on. One exception only: a
trivial fix that is an immediate prerequisite of the current step — do it, and record it under
**Execution notes**.

Reducing scope is not your call either. If a part is blocked, deliver everything else in full and say
explicitly what was left out and why.

## 6. Validate

- Run the commands from "How to validate" in `plan.md`. Actually run them — do not assume they pass
  because the code looks right.
- Check each acceptance criterion in `spec.md` and tick only the ones you verified.
- If it fails: fix and run again, up to 3 attempts. If it persists, stop, leave it `in-progress` and
  report the shortest decisive line of the error.

A test you wrote yourself that passes does not prove the acceptance criterion was met — check the
criterion, not the test.

## 6b. Sabotage

Every acceptance criterion that asserts a **guarantee** — refusal, constraint, validation, guard,
isolation, error path — goes through a sabotage round before being ticked. The full procedure is in
step 6 of `.specs/RUN-ALL.md`, and it holds identically here: remove the protection, run the whole
suite, **write down the name of every test that fell** in the `## Sabotage` section of `tasks.md`,
undo it, confirm green.

A green suite does not distinguish "protected" from "never tested". Nothing fell, or it fell for the
wrong reason: the criterion does not close. A guarantee you chose not to sabotage goes under
"Guarantees without a round" with the reason — declared, never silent.

## 7. Close

Only with every acceptance criterion ticked:

- **Execution notes** in `tasks.md`: deviations, assumptions, surprises.
- A new decision that `spec.md` did not anticipate goes into `.specs/memory/decisions.md`.
- A contract the next change will consume is promoted to `.specs/shared/`.
- `status: done` in `spec.md`.
- Do not archive. Archiving is the user's decision, through `spec-archive-change`.

## 8. Report

- What was implemented, in one or two sentences.
- Commands run and the real result of each.
- Assumptions made.
- What was left out and why.
- Skills worth creating, if you repeated a pattern with no mold.

If something failed, say it failed, with the output. An optimistic report on top of broken code is
the worst possible outcome of this flow.
