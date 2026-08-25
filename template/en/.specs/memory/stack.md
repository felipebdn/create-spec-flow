# Stack

The source of truth about technology, versions and commands. The agent reads this file before
choosing any library or running any command.

> **This file has a ceiling — see the `spec-ceilings-and-pruning` skill.** Read on every change.
> Pruning on read, only in the `spec-new-change` skill — out goes whatever became a lint, type or
> test rule, because the tool became the source.

> **State:** not defined yet. Fill this in before any implementation. While it looks like this, no
> dependency should be added without confirming with the user.

## Language and runtime

| Item | Choice | Version | Reason |
|---|---|---|---|
| Language | — | — | — |
| Runtime | — | — | — |
| Package manager | — | — | — |

## Backend

| Layer | Choice | Reason |
|---|---|---|
| HTTP framework | — | — |
| Data access | — | — |
| Database | — | — |
| Authentication | — | — |
| Validation | — | — |

## Frontend

| Layer | Choice | Reason |
|---|---|---|
| Framework | — | — |
| Styling | — | — |
| State / data | — | — |
| Routing | — | — |

## Quality

| Item | Tool | Command |
|---|---|---|
| Tests | — | — |
| Lint | — | — |
| Formatting | — | — |
| Type check | — | — |
| Build | — | — |

## Constraints

- Libraries outside this list require a decision recorded in `decisions.md`.
- Every new choice needs a written reason — "it is the most popular" is not a reason.
