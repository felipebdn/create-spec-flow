---
name: spec-new-skill
description: Creates a new skill under .claude/skills/ capturing a code pattern that repeats in the project. Use when a pattern has been implemented two or more times, or when the user asks to turn a convention into a skill.
---

# New skill

A skill is a frozen code pattern. It exists so the agent **applies an already-settled mold** instead
of reinventing architecture on every feature. It is what keeps the seventh feature looking like the
first.

## When to create one

Create one when the pattern has already appeared **twice** and will appear again. Do not create one
in anticipation: a skill written before the second real case freezes a design that use has not
tested yet.

Signs that it is time:

- You copied the structure of an existing file to write another one.
- `spec-verify-change` flagged a pattern deviation twice in the same kind of code.
- One change's `plan.md` described step by step something another `plan.md` already described.

## Naming

`<scope>-<thing>`, kebab-case, matching the directory name:

| Scope | For what | Examples |
|---|---|---|
| `backend-` | A server-layer pattern | `backend-controller`, `backend-repository` |
| `frontend-` | An interface pattern | `frontend-form`, `frontend-table` |
| `shared-` | A rule that holds on both sides | `shared-validation-rule` |
| `config-` | Tool or environment configuration | `config-lint`, `config-env` |
| `spec-` | An operation of the specification flow itself | `spec-new-change` |

## Format

```markdown
---
name: <same as the directory name>
description: <what it does> + <when to use it>. Third person, one or two sentences.
---

# Title

## Rule
The decision in one or two sentences. What always holds.

## Where it lives
The path and the file organization.

## Mold
A real, working code block from the project.

## Rules
A short list of constraints the mold does not show on its own.

## Do not
The concrete mistakes this skill exists to prevent.
```

The `description` is what decides whether the skill gets loaded at the right moment. It has to say
**when to use it**, not just what it does — a vague description is a skill that never fires.

## Quality

- **The mold comes from real code** that exists in the repository and works. An invented example
  becomes a lie at the first divergence.
- **One skill, one pattern.** If the title needs an "and", it is two skills.
- **Short.** Target: a screen and a half. A long skill gets skimmed, and the detail that mattered is
  lost.
- **Say the "do not".** The most useful part is usually the list of mistakes the pattern exists to
  avoid.
- **Do not repeat a general convention.** Naming and style already live in
  `.specs/shared/conventions.md`; point there instead of duplicating — two copies diverge.

## Maintenance

A skill describes the pattern in force, not the history. When the pattern changes, **edit the skill**
and record the change in `.specs/memory/decisions.md`. An out-of-date skill is worse than a missing
one: the agent confidently applies a mold the project has abandoned.

## When you finish

Report the path created, the pattern captured, and the existing files the mold was extracted from.
