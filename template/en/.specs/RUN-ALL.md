# RUN-ALL

Manual queue orchestrator. Use with `Follow @.specs/RUN-ALL.md`. Every role receives fresh context;
an executor never becomes its own reviewer.

## Required context

Read `CLAUDE.md` or `AGENTS.md`, `.specs/README.md`, `memory/`, conventions, and glossary. Read only
the files under `shared/contracts/` and `domain/` related to the current change.

## Roles

| Role | Responsibility | Writes allowed |
|---|---|---|
| Orchestrator | Select, transition, persist reports, and stop at gates | Flow artifacts |
| Executor | Implement `spec.md`, `plan.md`, and `tasks.md`; validate and sabotage | Code and `tasks.md` |
| Reviewer | Audit the commit against every criterion | None |
| Remediator | Fix only review findings | Code and `tasks.md` |
| Archiver | Produce walkthrough, promote learning, and move the change | `.specs/` |

Use fresh processes or subagents for every role. Do not fork executor context into the reviewer. If
`.specs/orchestrator.json` exists, respect its adapter mapping; otherwise use fresh agents available
in the current client.

## Selection and dependencies

1. Sort `.specs/changes/` by numeric prefix and letter suffix.
2. Select the first change in `ready`, `changes-requested`, or explicitly resumed `blocked`.
3. A dependency is satisfied only when `verified`, `archive-approved`, or already under `archive/`.
4. An open question that changes a mandatory requirement stops the queue and returns to the user.

## Per-change cycle

1. Transition `ready` or `changes-requested` to `executing` and increment `attempt`.
2. Give the executor only project instructions, change files, and selective context.
3. The executor implements, validates, and sabotages. The orchestrator writes the result to
   `execution-report.md` and copies it to `runs/NNN/execution-report.md`.
4. On a recoverable failure, transition to `blocked`; on success, to `awaiting-review`.
5. Transition to `reviewing` and give a fresh reviewer the commit, spec, plan, tasks, and report. The
   orchestrator writes `review.md` and `runs/NNN/review.md`.
6. A `changes-requested` verdict returns to a fresh remediator. After 3 remediations without
   approval, transition to `blocked` and stop.
7. An approved verdict transitions to `verified`. Only then produce `walkthrough.md`.
8. Stop at the human gate. After explicit approval, transition to `archive-approved`, run the
   `spec-archive-change` skill with a fresh agent, and finish at `archived`.

Persist every transition before dispatching the next role. On resume, trust artifacts and commits,
not the prior conversation. Never treat `awaiting-review` as completion.

## Final report

| Change | State | Attempt | Commit | Note |
|---|---|---|---|---|

Also list assumptions, promoted decisions, created changes, blockers, and the next gate.
