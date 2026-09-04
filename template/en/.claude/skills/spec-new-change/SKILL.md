---
name: spec-new-change
description: Creates a new change folder under .specs/changes/ from the templates, with spec.md, plan.md and tasks.md filled in, behind a mandatory readiness gate. Use when the user asks for a new feature, fix or task that has no specification yet — before writing any code.
---

# New change

Turns a request in natural language into a specified change in the queue.

This skill **writes no production code**. It produces the specification that gets executed later. If
the user asks to implement right away, create the specification first and only then move on to
`spec-run-change`.

## Before writing

Read, so you do not specify against what already exists:

1. `.specs/memory/` — the stack and the settled decisions.
2. `.specs/shared/` — conventions and glossary. Use the vocabulary from there.
3. `.specs/domain/` — **only the domain the change touches**. That is where the product rule comes
   from, and the spec has to **distill it in full**: whoever implements will not open `domain/`, and
   "per the credit domain" does not survive a change of session.
4. `.specs/changes/` — the current queue, to find the next number and to spot overlap with a change
   that is already specified.

If the request overlaps a change that is still `ready`, propose editing that one instead of creating a
new one, and wait for the answer.

### Prune `memory/` — here, and only here

**Check the size the moment you read it**, and prune **now**, before moving on to exploration. This
skill is the only point in the flow where pruning happens; the other steps check and warn.

Apply the `spec-ceilings-and-pruning` skill — it carries the numbers, what goes and what stays.

## Numbering

- The next free number, three digits, never reusing a number from an archived change.
- A letter suffix only when the same feature is sliced into parts that must run in sequence:
  `012a-dashboard-backend`, `012b-dashboard-frontend`. Part `b` declares `depends_on: ["012a-…"]`.
- A short, descriptive, kebab-case slug.

## Slicing

A change should fit in one work session and be validatable on its own. Slice when the request:

- crosses backend and frontend — split into `NNNa` and `NNNb`;
- has parts that deliver value independently;
- goes past ~8 tasks in `tasks.md`.

Do not slice to the point of creating changes that cannot be validated in isolation.

### The `spec.md` ceiling

Double: lines **and** number of acceptance criteria, whichever blows first. The numbers, how to split
without botching the cut, and what never to cut to fit are in the `spec-ceilings-and-pruning` skill —
apply it before deciding the slicing.

If it blows, split into two changes chained by `depends_on` and **say so when you propose it**: the
split goes into the readiness check, it never happens silently.

## Readiness check — the gate

**Nothing is written under `.specs/changes/` before this step.** It is a visible message to the user,
not an internal checklist: it hands them the decision to draft. Write it, propose writing the change,
and **wait for confirmation**.

Cover what fits the situation — these are angles, not a quota to fill:

- **Still vague:** what I would have to invent on my own if I started implementing now.
- **Answers that left room open:** points where materially different implementations still fit what
  was said. A choice that already closed well does not return to the table.
- **Silent inferences:** decisions I folded in and the user has not seen concretely. What has already
  been shown and passed without objection does not count.
- **What came from the project context — always one line, even when the answer is "there is nothing
  in `memory/` that governs this".** Which decisions from `decisions.md`, constraints from `stack.md`
  and conventions from `shared/` governed this change. It is the only visible output of reading the
  context, and a step with no visible output is a step that does not happen.
- **Which skills in `.claude/skills/` are the mold** for each part, and what was left **without** one.
  A part with no skill is where the architecture will drift from the rest of the project; saying so
  now is cheaper than finding out at review.
- **Which acceptance criteria assert a guarantee**, and will therefore require a sabotage round. A
  criterion that asserts a refusal, a constraint, a validation, a guard or isolation goes on this
  list. A guarantee you already know will not be sabotaged goes on it with the reason — the decision
  not to protect is the user's, not yours.
- **Vocabulary outside the glossary:** a term the change needs that is not in `shared/glossary.md` is
  a **question**, not your choice. An invented name becomes an identifier frozen into code and
  database at the first commit.
- **The split, when the scope blows the ceiling:** say it will become two changes and where the cut is.

### The gate's rules

**It is not skippable.** It happens even when the request looks obvious — in that case it is
**short** ("nothing material open"), not absent. The temptation to go straight to the spec is exactly
what it exists to contain: a wrong change costs a whole execution cycle, the question costs three
lines.

**Before creating the change folder, check two things:** was the check written for the user in this
conversation, **and** did they answer? If the answer is no to either, you still cannot write.

**A long list almost always means the thinking is not finished** — continue the conversation instead
of piling loose ends at the gate. A short or empty list is a legitimate result when the conversation
already covered what mattered.

**A decision settled here goes into `.specs/memory/decisions.md`**, in the file's format, with the
reason. Only what **governs future work** goes in: an architectural choice, a non-goal, a scope
limit. What matters only to this change stays in `spec.md`. Before appending, prune if the file is
near the ceiling.

## Filling in

Only after the user's confirmation at the gate above.

Copy the three templates from `.specs/templates/` and fill them:

**`spec.md`** — the what and the why. No file names, no function signatures, no libraries. If you are
writing code here, the content belongs in `plan.md`.

**`plan.md`** — the how. Explicitly name which skill in `.claude/skills/` implements each part, when
there is a mold. List the files affected. The "How to validate" section must contain real commands
that exist in the project, copied from `.specs/memory/stack.md` — do not invent a test command that
is not configured.

**`tasks.md`** — the execution. Each task is a small, verifiable step.

## Acceptance criteria

The part that matters most and the one that fails most. Each criterion needs a concrete way to check
it: a command that runs, a response with a known shape, a screen with a specific element. "Should
work well" and "should have good performance" are not criteria — turn them into a number or drop them.

## Open questions

This section of `spec.md` holds what is **left over** from the gate: ambiguity that was taken to the
user and that they deliberately left open, or that depends on something that does not exist yet.

Ambiguity you noticed and did **not** take to the gate does not belong here — it belongs at the gate,
and you should not have been writing yet.

If an open question affects a mandatory requirement, say in your reply that the change is blocked:
`RUN-ALL.md` will stop the queue on it.

Never resolve the ambiguity alone by inventing a decision and recording it in the decisions table — a
decision only goes in there after it is settled with the user, and the place to settle it is the gate.

## When you finish

Report in one screen: the path created, a summary of the scope, what was left out, and the open
questions that block execution. Do not mark anything as `executing`.

If a decision settled at the gate, say that it went to `decisions.md` and which one it was.
