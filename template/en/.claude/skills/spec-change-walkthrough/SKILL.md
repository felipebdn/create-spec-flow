---
name: spec-change-walkthrough
description: Writes a change's closing walkthrough — what it closed, what order to review it in by risk, the decisions and the gotchas. Use when closing a change, after the criteria are ticked and before archiving.
---

# Closing walkthrough

It lives in `.specs/changes/NNN-slug/walkthrough.md`, and travels with the change into `archive/`.

## What it is, and what it is not

The other three files already record everything. `spec.md` says what and why, `plan.md` says how, and
the Execution notes in `tasks.md` say what happened. **The walkthrough repeats none of that.**

What they lack is **synthesis ordered by risk**. Notes are chronological and fragmentary — "found X
in phase 3", "deviated from the plan in phase 5". Whoever arrives to review does not want the order
things happened in; they want to know **where to look first, because that is where a mistake would
cost most**.

If your walkthrough could be produced by concatenating the other three, it should not exist.

## Why it is a step, not a courtesy

**Explaining is a different lens from auditing.** Verification asks "is this correct?"; the
walkthrough asks "does this hold together?". Different questions, and they catch different defects.

An incoherent narrative is the classic symptom of a half-applied fix: one passage corrected and
another, saying the same thing, left behind. Auditing criteria against code does not see that,
because it is not code against criteria — it is text against text.

A finding that shows up here **does not become a footnote**: go back and fix the wrong file, and the
walkthrough records that you did.

## The shape

Suggested order. Omit any section with no real content — an empty section is noise.

```markdown
# NNN — Closing walkthrough

Commits, and the change's state.

## What closed
Two or three sentences. **The property the change exists to guarantee**, not the list of what was
done — the list is in the plan.

## Areas of change
A table: area, where, what it carries. Enough to orient, not to replace reading.

## Review order
**By risk, highest first**, with the reason for each position. This is the section that justifies the
file existing. Silent failures come first; text and configuration come last.

## Important decisions
The ones you cannot read off the diff, and the ones where a plausible alternative existed. Each with
its reason — and, where there is one, the measured number that backs it.

## Gotchas
What the implementation revealed and the planning did not anticipate. Surprising behaviour from a
tool, a version, an environment. It is what the next person would otherwise rediscover alone.

## Measured verification
Command and real result. The sabotage rounds, naming what fell.
**A claim without a number does not close a change.**

## What remains
Declared pending work, contracts the next change consumes, recorded debt.
```

## Rules

- **Review order is by risk, never by order of implementation.** If the two coincide, say they
  coincide; if you do not know which carries the most risk, the walkthrough is not ready.
- **Numbers, not adjectives.** "The suite passed" is not verification; "5 suites, 15 tests, 0.98 s" is.
- **A gotcha is what cost you time.** If you had to measure to find out, write down what you measured.
- **A recorded mistake is worth more than a hidden one.** A sabotage round redone, a test that was
  wrong, a criterion ticked too early — all of it goes in. It is what stops the next person from
  concluding it all went smoothly and lowering their guard.
- **Do not invent synthesis.** If the change was mechanical, with no gotcha and no decision, the
  walkthrough is short. Short is a legitimate result; padded is not.

## Do not

- Repeat the file list from `plan.md`.
- Rewrite the Execution notes in a different order.
- Write it before the criteria are ticked — the walkthrough describes what closed, and nothing has
  closed yet.
- Leave your own finding as an observation. Go back and fix it.

## When you finish

Report the path and, if writing the walkthrough revealed anything, what you fixed because of it.
