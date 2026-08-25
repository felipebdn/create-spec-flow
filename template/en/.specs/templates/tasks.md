# Tasks — NNN-slug

Execution checklist. Each line is a step small enough to be done and verified in one go. Tick `[x]`
as soon as the step is done **and** validated — never before.

## Implementation

- [ ] T1 — …
- [ ] T2 — …

## Validation

- [ ] V1 — Run `<command>` and confirm it passes.
- [ ] V2 — Check each acceptance criterion in `spec.md` and tick it there too.

## Sabotage

Mandatory, and it is the one proof a green suite does not give. Every acceptance criterion that
asserts a **guarantee** — a refusal, a constraint, a validation, a guard, an isolation rule — is only
protected if **removing it drops a named test**. Without the round, "protected" and "never tested"
are the same green.

One line per round, filled in the moment the round happens — not at the end.

| # | Guarantee | What was removed | Tests that fell |
|---|---|---|---|
| S1 | AC_ — … | `file:line` | `exact test name`, `another` |

**The test name is the record.** "I sabotaged it and the suite fell" proves nothing: there is no way
to know whether the right protection fell, and the test the criterion claims to protect may not even
exist. The sabotage is undone before the commit, so this table is the only proof that survives.

- [ ] S0 — Every round undone, suite green again, repository clean.

### Guarantees without a round

A declared absence is reviewable; a silent absence passes for coverage. One line per guarantee you
chose **not** to sabotage, with the reason.

- …

## Record

- [ ] L1 — Note in `.specs/memory/decisions.md` any new decision taken during implementation that
      `spec.md` did not anticipate.
- [ ] L2 — Update `.specs/shared/` if a contract became reusable.
- [ ] L3 — Switch `status` in `spec.md` to `done`.

## Execution notes

Free space for whatever showed up along the way: a deviation from the plan, a bug found, an
assumption made. This is what the next session reads to understand why.
