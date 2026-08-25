# Project instructions

This project uses spec-driven development. Context lives in files, not in the conversation.

## Before any work

Read, in this order:

1. `.specs/README.md` — how the flow works.
2. `.specs/memory/stack.md` — allowed technologies and commands.
3. `.specs/memory/decisions.md` — architectural decisions already settled.
4. `.specs/shared/` — code conventions and the domain glossary.
5. `.specs/domain/` — **only the domain the task touches**, when there is one.

## Rules

- **Specification before code.** New work becomes a change under `.specs/changes/`
  before it becomes an implementation. Use the `spec-new-change` skill.
- **Gate before spec.** No file is created under `.specs/changes/` before the
  readiness check has been written for the user **and** answered by them. This holds
  even when the request looks obvious — then the check is short, not absent.
- **Pattern before preference.** Before writing code of a kind that is already
  standardized, find the matching skill in `.claude/skills/` and apply its mold.
- **One vocabulary.** Use the terms from `.specs/shared/glossary.md` in the spec,
  in the code, in the database and in the interface.
- **No new dependency on your own.** A library outside `.specs/memory/stack.md`
  requires a decision recorded in `decisions.md`.
- **Scope is a contract.** Necessary work that is not in the current change's
  `spec.md` becomes a new change at the end of the queue.
- **A ceiling applies to every file that is always read.** `spec.md` goes up to ~600
  lines or ~10 acceptance criteria, whichever blows first; `memory/decisions.md` and
  `memory/stack.md`, up to ~150 lines. Pruning happens on read and only in the
  `spec-new-change` skill — whoever runs or archives checks and warns, never prunes.
- **Validation is executed, not presumed.** Tick an acceptance criterion only after
  having actually verified it.
- **A guarantee is only protected if removing it drops a named test.** An acceptance
  criterion that asserts a refusal, a constraint, a validation or a guard goes through
  a sabotage round before being ticked, and the name of every test that fell goes into
  `tasks.md`. A guarantee left without a round is declared with its reason, never
  silently.

## Flow commands

| Intent | How |
|---|---|
| Specify new work | `spec-new-change` skill |
| Implement one change | `spec-run-change` skill |
| Run the whole queue | `Follow @.specs/RUN-ALL.md` |
| Audit what was done | `spec-verify-change` skill |
| Write the closing walkthrough | `spec-change-walkthrough` skill |
| Close a finished change | `spec-archive-change` skill |
| Freeze a repeating pattern | `spec-new-skill` skill |
| Adopt the flow with context that already exists | `spec-adopt-context` skill |

## Current state

Fill this section in with what the project is, what stage it is at, and what is
blocking it right now. It is the first thing an agent reads, and a stale answer here
costs more than an empty one.
