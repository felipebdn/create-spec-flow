---
name: spec-verify-change
description: Checks the implemented code against the acceptance criteria of a change under .specs/changes/ and produces a report by severity. Use when the user asks to verify, review or audit a change that is already implemented, or before archiving it.
---

# Verify change

An audit of an implemented change against its specification. The job is to look for divergence, not
to confirm everything is fine.

## Stance

You are probably verifying code this very flow wrote. Start from the assumption that **some**
acceptance criterion is ticked without having actually been verified — it is the most common failure
of this kind of flow. Find which one.

Fix nothing here. Verification only reports; the fix is a separate step, with the user deciding.

## Procedure

1. Read `spec.md` (acceptance criteria and requirements) and `plan.md` (contracts and validation
   commands).
2. Read the code the change touched. Compare against the files `plan.md` said would be touched: a
   file changed outside that list is scope leakage and goes into the report.
3. Run the commands from "How to validate". Actually run them. If a command does not exist or does
   not run, that alone is a high finding.
4. Walk the acceptance criteria one by one and verify each independently of the test the implementer
   wrote.
5. **Check the change's internal coherence** and **audit the sabotage record** — the two sections below.
6. Check adherence to `.specs/shared/conventions.md`.
7. Check whether `memory/` and `shared/` were updated when they should have been.
8. Check the ceilings from the `spec-ceilings-and-pruning` skill — `wc -l` on `decisions.md`,
   `stack.md` and the change's `spec.md`, plus the acceptance-criteria count. A file over the ceiling
   is a **medium** severity finding: it breaks nothing today, and it makes every future session more
   expensive. You do not prune — you report, and pruning is due in the next `spec-new-change`.

## Internal coherence of the change

Before looking at code. `spec.md`, `plan.md` and `tasks.md` have to agree **with each other**, and
the check is a cross-table — not a read-through.

| Question | Severity when it fails |
|---|---|
| Does every acceptance criterion have a task that produces it? | **high** — a criterion with no task gets ticked by mistake or never closes |
| Does every criterion that asserts a guarantee have a sabotage round, or a declaration with a reason? | **high** |
| Does every task serve some criterion? | **medium** — what is left over is scope nobody asked for |
| Does every file listed in `plan.md` have a task that touches it? | **medium** |
| Does every `ACn` citation point at the criterion it describes? | **high** |

**The first two questions are the direction people forget.** Checking that every `ACn` citation
resolves is easy and passes green easily; checking that every criterion is **reached** by some task
is the opposite direction, and that is where the hole lives. Measured: a review fixed `spec.md` and
`plan.md` without going down to `tasks.md`, two criteria ended up with nothing producing them, and
the citation check did not see it — they all existed.

**Renumbering is what breaks the last one.** A citation to a criterion that **exists** but changed
meaning survives any mechanical check, because the number resolves. Only re-reading the criterion's
text catches it.

**This is cheaper before implementing.** Run afterwards it still catches things — but the work was
already done on top of an incoherent plan.

## Auditing the sabotage

**You do not execute sabotage.** Sabotaging means editing code, and verification does not write — not
even to undo afterwards. What you audit is the **record**: the `## Sabotage` section of `tasks.md`,
which says what was removed, what fell, and for what reason it fell. It is the only proof that
survives, because the sabotage was undone before the commit.

Build three lists and close them against each other:

1. The acceptance criteria in `spec.md` that **assert a guarantee** — refusal, constraint, validation,
   guard, isolation, error path. You decide which ones; do not trust the implementer's list.
2. The rounds the `## Sabotage` table records.
3. The guarantees the "Guarantees without a round" section declares, with a reason.

Every hole between the three has a destination:

| Situation | Severity |
|---|---|
| A criterion asserts a guarantee, is ticked, and no round covers it | **high** |
| A round recorded with no **name** of a test that fell | **high** — "the suite fell" does not prove the right protection fell |
| The round says **nothing fell** | **high** — the guarantee is protected by no test at all |
| The round fell for a reason that does not match what the criterion asserts | **high** — that counts as noise, not protection |
| The round removed a comment, a dead file, or code that is not executed | **high** — it measured nothing |
| A guarantee left out **with a written reason** | — legitimate; repeat the declaration in the report so it stays reviewable |
| A guarantee left out **silently** | **medium** — a silent absence passes for coverage |
| Repository or suite left in the sabotaged state | **high** |

**Cite the line of the record** that supports each verdict — `tasks.md:<line>` and the test name — as
the report requires of any finding.

Sabotage the change planned for a criterion not yet met is not a finding: it is remaining work.

## Severity

| Level | Meaning |
|---|---|
| **high** | A ticked acceptance criterion that does not hold; a mandatory requirement not met; a validation command that fails or does not exist. |
| **medium** | An optional requirement ignored without a record; a convention violated; a contract diverging from `plan.md`; scope leakage; a file over the ceiling. |
| **low** | Style noise, a name off-pattern, a comment that explains the "what". |

Style that does not change behaviour is always low. Do not inflate severity to give the report weight.

## Report

One line per finding:

```
<path>:<line> — [high|medium|low] <the problem>. <what to do>.
```

After the list, a table of the acceptance criteria:

| Criterion | Status | Evidence |
|---|---|---|
| AC1 | met / not met / not verifiable | the command run and its output, or what is missing |

"Not verifiable" is a legitimate and important result: it means the criterion was written in a way
that cannot be checked, and it is the spec that needs to change.

After that, a table of the sabotage record — **always**, even when it is complete. It is the only
visible output of the record audit, and an audit with no visible output is an audit that did not
happen.

| Guarantee | Round recorded | Tests named | Verdict |
|---|---|---|---|
| AC1 — … | yes / no / declared without a round | the names, or what is missing | proven / not proven / declared |

If nothing was found, say so in one line and list what you actually executed to reach that
conclusion. An approval with no evidence of what was run is worth nothing.
