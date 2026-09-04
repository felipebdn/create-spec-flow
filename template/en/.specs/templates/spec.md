---
id: NNN-slug
title: "Readable title of the change"
workflow_version: 2
status: ready # ready | executing | awaiting-review | reviewing | changes-requested | verified | archive-approved | archived | blocked
attempt: 0
depends_on: [] # e.g. ["002-register-user"]
created: YYYY-MM-DD
---

# NNN — Readable title of the change

> **This file has a ceiling, in lines and in number of acceptance criteria — see the
> `spec-ceilings-and-pruning` skill.** If it blows, this is two changes, chained by `depends_on`. Do
> not shrink it by cutting a verifiable criterion or a validation command: the excess is almost
> always prose already stated elsewhere, or scope that belongs to another change. Delete this note
> when you fill the file in.

## Problem

What the situation is today and why it does not work. Describe the problem from the point of view of
whoever uses the system, not of the technical solution.

## Goal

One sentence: the desired state after this change.

## Scope

**In:**

- A concrete thing this change delivers.

**Out:**

- A thing explicitly deferred, with the reason or the future change that handles it.

## Requirements

| # | Requirement | Mandatory |
|---|---|---|
| R1 | The system must … | yes |
| R2 | The system must … | no |

## Acceptance criteria

Write each criterion as something checkable — a command that runs, a screen that appears, an API
response with a known shape. If you cannot check it, it is not an acceptance criterion.

A criterion that asserts more than one verifiable fact is two criteria.

- [ ] AC1: given …, when …, then …
- [ ] AC2: given …, when …, then …

## Decisions

Record only what is already settled here. An open question is written down as an open question,
never as a decision.

| Decision | Discarded alternative | Reason |
|---|---|---|
| … | … | … |

## Open questions

What is left over from the gate: ambiguity the user deliberately left open, or that depends on
something that does not exist yet.

- [ ] A question that still blocks, or that could change the design.

## References

- `.specs/shared/conventions.md`
- `.specs/shared/contracts/<area>.md`, when applicable
- `.specs/memory/decisions.md`
