# changes

The queue. Each folder here is one unit of work specified **before** it becomes code.

It is born empty on purpose: a new project inherits nobody's work. The first change enters through
the `spec-new-change` skill, and nothing is created here before the readiness check has been written
for the user and answered by them.

```
.specs/changes/007-idea-registration/
├── spec.md    # WHAT and WHY — requirements and acceptance criteria. No code.
├── plan.md    # HOW — files touched, technical sequence, risks.
└── tasks.md   # EXECUTION — tickable checklist, plus the sabotage record.
```

Execution order by numeric prefix. Letter suffix when a feature is sliced into parts that run in
sequence — `012a-dashboard-backend`, `012b-dashboard-frontend`.

A finished change leaves here through the `spec-archive-change` skill, never by deletion.
