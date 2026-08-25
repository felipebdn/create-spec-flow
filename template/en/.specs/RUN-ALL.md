# RUN-ALL

Orchestrator for the change queue. Point the agent at this file and it runs all of
`.specs/changes/`, in order, stopping where it must stop.

**How to trigger:** `Follow @.specs/RUN-ALL.md`

## Required context before starting

Read, in this order, and start nothing before finishing the reading:

1. `.specs/README.md` — how this flow works.
2. `.specs/memory/` — architectural decisions and the settled stack.
3. `.specs/shared/` — conventions and contracts every change respects.
4. `CLAUDE.md` at the root, if it exists.

**Check the size of `memory/` as you read it** — `wc -l` on `decisions.md` and `stack.md`, against
the ceiling in the `spec-ceilings-and-pruning` skill. Over either one, **record in the final report**
that pruning is due in the next `spec-new-change`. **Do not prune here.**

Checking is this step's duty precisely because a whole queue runs with no planning in between: each
change adds little to `decisions.md`, and fourteen add a lot with nobody seeing it.

## Selection

1. List `.specs/changes/` and order by numeric prefix. Letter suffixes order within the same number:
   `012a` before `012b`.
2. Discard folders whose `spec.md` has `status: done`.
3. The first remaining folder is the current change.

## Cycle per change

For each selected change, in order:

### 1. Check dependencies

Read `depends_on` in the `spec.md` frontmatter. If a dependency is not `done`, **skip this change**
and record why in the final report. Do not pull a dependency forward out of order.

### 2. Check for blockers

If `spec.md` has unresolved items under **Open questions** that affect mandatory requirements,
**stop the whole queue** and ask the user. Guessing the answer to an open question is the one mistake
this flow does not forgive — the wrong change contaminates every change after it.

An open question that does not affect a mandatory requirement: continue, assume the most conservative
default, and record the assumption under **Execution notes** in `tasks.md`.

### 3. Mark the start

Change `status: todo` to `status: in-progress` in `spec.md`.

### 4. Implement

- Follow `plan.md` in the sequence it defines.
- Before writing code of a kind that is already standardized, find the matching skill in
  `.claude/skills/` and apply its mold. Do not invent new architecture for something that already
  has one.
- Tick each task in `tasks.md` the moment it is done.

### 5. Validate

- Run the commands from the **How to validate** section of `plan.md`.
- Check the **Acceptance criteria** in `spec.md` one by one and tick the ones that pass.
- If a command fails: fix it and run again, up to 3 attempts. If it keeps failing, **stop the queue**,
  leave the change `in-progress`, and report exactly what failed, with the shortest decisive line of
  the error.

### 6. Sabotage

**A green suite does not distinguish "protected" from "never tested".** An acceptance criterion that
asserts a guarantee is only proven if **removing it drops a named test**. This step closes that gap,
and it is why step 5 alone is not enough.

**What counts as a guarantee.** Any criterion whose failure mode is **silent**: a refusal, a database
constraint, an input validation, a guard, an isolation rule, an error path. A criterion that only
describes a happy path — "the screen lists the items" — is not a guarantee: if it breaks, it breaks
visibly, and the ordinary test already covers it.

**One round per guarantee, one at a time:**

1. Remove the protection — the constraint, the validation, the guard's line. **Remove executed
   code**, not a comment and not a dead file: a removed comment drops no test, and the round would
   measure nothing.
2. Run the **whole** suite, never just the guarantee's file. It is the whole suite that shows the
   difference between protection and noise — a round that drops thirty tests across ten files says
   something else than one that drops two in the expected file.
3. **Write down the name of every test that fell** in the `## Sabotage` table in `tasks.md`.
4. Undo it, run the suite again, confirm green.

**Two rounds do not close the phase, and neither is resolved by moving on:**

- **Nothing fell.** The guarantee is protected by no test at all. Write the missing test and repeat
  the round. Do not tick the acceptance criterion.
- **It fell for the wrong reason** — the target was already gone, the test broke by side effect, the
  error message is about something else. That counts as noise, not protection. Fix it until the
  reason matches what the criterion asserts.

**Be careful undoing.** `git restore` **deletes** an untracked file instead of restoring it, and it
also undoes any other change this very task made to that file. When the target is a new file, or a
file already modified by this change, keep a byte-for-byte copy **before** editing and restore from
it, checking with `diff`.

**A guarantee you chose not to sabotage is legitimate, but it has to be said.** Write what was left
out and why under "Guarantees without a round" in `tasks.md`. A declared absence is reviewable; a
silent absence passes for coverage.

**Finishing with the repository sabotaged is not finishing.** The phase closes with a green suite and
a clean tree.

### 7. Close

Only once every acceptance criterion is ticked:

- Fill **Execution notes** in `tasks.md` with deviations, assumptions and surprises.
- Record in `.specs/memory/decisions.md` every new decision `spec.md` did not anticipate.
- Promote to `.specs/shared/` any contract the next change will consume.
- Change `status` to `done` in `spec.md`.
- Do not move anything to `.specs/archive/` here. Archiving is a separate step, taken by the user's
  decision through the `spec-archive-change` skill.

### 8. Move on

Go to the next change in the queue and repeat from step 1.

## Rules that hold for the whole queue

- **One change at a time.** Do not implement `008` while `007` is open.
- **Do not change the scope.** If necessary work shows up during execution that is not in the current
  `spec.md`, create a new change at the end of the queue and carry on. Do not widen the current change
  on your own.
- **Do not skip validation or sabotage** to reach the end of the queue faster. Sabotage is the step
  that looks most dispensable while the suite is green, and that is exactly why it exists.
- **Actually stop when the rules say stop.** An interrupted queue with an honest diagnosis is worth
  more than a queue "finished" on top of broken code.

## Final report

When you finish, or when you stop, deliver:

| Change | Result | Note |
|---|---|---|
| `001-…` | done / skipped / failed / not started | reason, when not done |

After the table, list in prose:

- Assumptions made during execution.
- New decisions recorded in `memory/`.
- Changes created during execution, if any.
- What was left out and why.
