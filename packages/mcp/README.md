# create-spec-flow-mcp

Optional MCP orchestrator for projects initialized with `create-spec-flow --orchestrator mcp`.

```bash
npx create-spec-flow-mcp configure --client claude --project . --yes
npx create-spec-flow-mcp configure --client codex --project . --yes
```

The server dispatches fresh CLI processes according to `.specs/orchestrator.json`, isolates each
change in a Git worktree, persists execution and review reports, and stops for explicit spec and
archive approvals. The original checkout must be clean at every integration gate.
