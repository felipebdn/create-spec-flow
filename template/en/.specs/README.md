# .specs — spec-driven development

This directory is the source of truth about **what** the project does and **why** it does it that
way. Code answers "how is this implemented today"; `.specs/` answers everything the code cannot
express: intent, discarded alternatives, acceptance criteria, and the order the work must happen in.

Central rule: **context becomes a file, not a conversation.** A fresh agent session rebuilds all of
its context by reading this directory.

## Structure

| Directory | Role |
|---|---|
| `changes/` | The queue of numbered changes. Each folder is one unit of work specified before coding. |
| `archive/` | Changes that are finished and verified. They leave the active queue but stay readable as a record of decisions. |
| `memory/` | Context that spans changes: architectural decisions, chosen stack, constraints. |
| `shared/` | Contracts and conventions several changes consume: naming, error shape, domain glossary. |
| `domain/` | Product rules per domain, plus invariants and formulas. **Read selectively** — only the domain the change touches — and therefore with no ceiling. |
| `templates/` | Molds for `spec.md`, `plan.md` and `tasks.md`. Every new change is born from these. |
| `RUN-ALL.md` | The orchestrator. Runs the whole queue in order, validating between changes. |

## Anatomy of a change

```
.specs/changes/007-idea-registration/
├── spec.md    # WHAT and WHY — requirements and acceptance criteria. No code.
├── plan.md    # HOW — files touched, technical sequence, risks.
├── tasks.md   # EXECUTION — tickable checklist, plus the sabotage record.
└── walkthrough.md  # CLOSING — risk-ordered synthesis, written when closing.
```

`tasks.md` is the only one of the three written **during** the work. It holds the sabotage record:
for every acceptance criterion that asserts a guarantee, what was removed and the name of every test
that fell. A green suite does not distinguish "protected" from "never tested" — the sabotage round
is what closes that gap, and the test name is the only proof that survives, because the sabotage is
undone before the commit.

`status` lives in `spec.md`'s frontmatter: `todo`, `in-progress`, `done`.

## Numbering convention

- Three-digit prefix, execution order: `001-`, `002-`, …
- Letter suffix when a feature is sliced by layer and the slices must run in sequence:
  `012a-dashboard-backend`, `012b-dashboard-frontend`.
- The slug is descriptive and hyphen-separated.

The sequential counter assumes one person maintaining the queue. If the project becomes team work,
replace the numeric prefix with a stable ID (a date or a ticket) so two `007`s cannot collide on
different branches.

## Ceilings

Every file read in full in every session imposes its own size on all future work. That is why these
are not a matter of style.

| File | Blew the ceiling |
|---|---|
| A change's `spec.md` | split into two changes, chained by `depends_on` |
| `memory/decisions.md` and `memory/stack.md` | prune on the next read |

The check happens **on read**, never on write — these files are read always and written rarely, and
checking on write would let them grow with nobody watching. **Only the `spec-new-change` skill
prunes**; running, archiving and verifying check and warn.

**The numbers live in exactly one place: the `spec-ceilings-and-pruning` skill.** That is also where
you find how to split a change without botching the cut, what goes in a pruning pass, and why only
the planner prunes.

## Flow

```
request ──► GATE ──► changes/NNN-slug/ ──► run ──► verify ──► archive/
              ▲                                     │
              └────────── memory/ + shared/ ◄───────┘
```

The **gate** is the readiness check in the `spec-new-change` skill: before any file is created, what
is still vague, what was silently inferred, what came from `memory/` and `shared/`, which skills are
the mold and which criteria will require sabotage all go into a visible message — and the change is
only written after the user answers. It is not skippable, not even when the request looks obvious;
in that case it is short, not absent.

## Related skills

The skills in `.claude/skills/` are the operational "how to" of this flow:

- `spec-new-change` — creates a change folder from the templates, behind the gate.
- `spec-run-change` — implements a change that is already specified.
- `spec-verify-change` — checks the implementation against the acceptance criteria.
- `spec-archive-change` — moves a finished change and promotes what it learned.
- `spec-ceilings-and-pruning` — the size ceilings and the pruning discipline.
- `spec-new-skill` — freezes a repeating pattern into a new skill.
- `spec-change-walkthrough` — writes the closing walkthrough, ordered by risk.
- `spec-adopt-context` — brings context that already exists into `.specs/`, without losing anything.
