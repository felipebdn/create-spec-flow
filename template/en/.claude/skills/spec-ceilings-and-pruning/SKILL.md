---
name: spec-ceilings-and-pruning
description: The size ceilings of the .specs flow and the pruning discipline for memory/ — how much fits in a spec.md, how much fits in decisions.md and stack.md, who prunes and who only warns. Use when creating or splitting a change, when reading or appending to .specs/memory/, and whenever one of those files starts to look big.
---

# Ceilings and pruning

Every file read in full in every session imposes its own size on **all** future work. The ceilings
below are not a matter of style: they are what stops the per-session cost from growing on its own,
without anyone deciding it should.

## The two ceilings

| File | Ceiling | When it blows |
|---|---|---|
| A change's `spec.md` | ~600 lines **or** ~10 acceptance criteria | split into two changes |
| `memory/decisions.md` | ~150 lines | prune on the next read |
| `memory/stack.md` | ~150 lines | prune on the next read |

## The `spec.md` ceiling is a double one

Whichever blows first. **Counting criteria alone holds nothing:** the criterion fattens in the
change's place, and the per-session cost rises just the same.

If either blows, split into two changes, chained by `depends_on`, and **say so when you propose it**
— never split silently. Split **by what the second one needs from the first**, never down the middle
of the count: a big change usually blows the line ceiling before the criteria ceiling, and that is
exactly where the split is easiest to get wrong.

An acceptance criterion that asserts more than one verifiable fact is two criteria.

**Never shrink by cutting a verifiable acceptance criterion or a validation command from `plan.md`.**
Those two fields are what make the change stand on its own; cutting them costs a whole execution
cycle, not a few lines. If `spec.md` is big, the excess is almost always prose already stated
elsewhere, or scope that belongs to another change.

## `.specs/domain/` has no ceiling, and that is a decision, not an oversight

The ceiling exists because the file is read in **every** session. `domain/` is read **selectively**
— only the domain the change touches — so its size is not imposed on all future work. A 300-line
domain file costs on the few changes that touch it, and nothing on the rest.

The trade-off is reading discipline: whoever reads all of `domain/` "just in case" reintroduces
exactly the cost the exemption assumes is absent.

## Pruning `memory/`

`decisions.md` and `stack.md` are read on **every** change and written on few.

### The check happens on read, not on write

Checking on write would let the file grow with nobody watching — because writing is rare and reading
is always. You read it, it is over the ceiling, you deal with it there, before moving on.

### Who prunes, and who only warns

| Step | On reading or writing `memory/` |
|---|---|
| `spec-new-change` | **prunes**, right there, before moving on to exploration |
| `spec-run-change` | `wc -l`, warns in the final summary. **Does not prune** |
| `RUN-ALL.md` | `wc -l`, records in the final report. **Does not prune** |
| `spec-archive-change` | appends, checks, warns in the report. **Does not prune** |
| `spec-verify-change` | reports an over-ceiling file as a **medium** severity finding |

**Only the planner prunes.** Choosing what goes requires the planning context, which whoever is
executing does not have. **But checking is everyone's duty**, because a whole queue runs with no
planning in between: each change adds little to `decisions.md`, fourteen add a lot, and nobody sees it.

### What goes

- A decision that **already became code** — the code became the source, and the entry became a
  duplicate paid for on every read.
- A decision reverted or superseded — only what holds today stays.
- A convention the project now enforces through **lint, types or tests** — the tool became the source.

What stays is what still governs a future choice and is not derivable from the code.

If pruning is not enough to get back under the ceiling, **say so** instead of letting it grow
silently.

## Do not

- **Do not edit an existing entry in `decisions.md` to "update" a decision.** A decision that changed
  goes in as a new entry at the end; the old one leaves in the next pruning pass. The history of the
  why is the value of the file.
- **Do not prune outside of a read.** Pruning is the only rewrite allowed in those files, and it
  happens in exactly one place in the flow.
- **Do not prune while you are running or archiving.** Warn instead. Pruning without the planning
  context removes what still governs a future choice.
- **Do not shrink a big `spec.md` by cutting what makes it verifiable.** Cut repeated prose, or split
  the change.
- **Do not let it blow silently.** A file over the ceiling that nobody mentioned is a cost every
  future planning session pays without knowing.
