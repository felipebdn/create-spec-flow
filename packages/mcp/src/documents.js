function quote(value) { return JSON.stringify(String(value ?? '')); }

export function executionReport({ change, runId, attempt, agent, baseCommit, resultCommit, startedAt, outcome, summary, checks = [], details = '' }) {
  const now = new Date().toISOString();
  return `---
workflow_version: 2
change: ${change}
run_id: ${quote(runId)}
attempt: ${attempt}
executor: ${quote(agent)}
adapter: ${quote(agent)}
base_commit: ${quote(baseCommit)}
result_commit: ${quote(resultCommit)}
started_at: ${quote(startedAt)}
finished_at: ${quote(now)}
outcome: ${outcome}
---

# Execution report

## Summary

${summary || 'No summary returned.'}

## Validation

| Command | Result | Evidence |
|---|---|---|
${checks.length ? checks.map((c) => `| \`${c.command}\` | ${c.result} | ${c.evidence ?? ''} |`).join('\n') : '| — | not run | — |'}

## Agent details

${details || 'None.'}
`;
}

export function reviewReport({ change, runId, attempt, reviewer, commit, startedAt, verdict, summary, findings = [], criteria = [] }) {
  const now = new Date().toISOString();
  return `---
workflow_version: 2
change: ${change}
run_id: ${quote(runId)}
review_attempt: ${attempt}
execution_attempt: ${attempt}
reviewer: ${quote(reviewer)}
reviewed_commit: ${quote(commit)}
started_at: ${quote(startedAt)}
finished_at: ${quote(now)}
verdict: ${verdict}
findings: ${findings.length}
---

# Review

## Summary

${summary || 'No summary returned.'}

## Acceptance criteria

| Criterion | Result | Evidence |
|---|---|---|
${criteria.length ? criteria.map((c) => `| ${c.id} | ${c.result} | ${c.evidence ?? ''} |`).join('\n') : '| — | not verified | — |'}

## Findings

| ID | Severity | Location | Problem | Required fix |
|---|---|---|---|---|
${findings.length ? findings.map((f, i) => `| ${f.id ?? `F${i + 1}`} | ${f.severity ?? 'medium'} | ${f.location ?? '—'} | ${f.problem ?? ''} | ${f.fix ?? ''} |`).join('\n') : '| — | — | — | No findings. | — |'}
`;
}

export function parseAgentJson(stdout) {
  const lines = stdout.trim().split('\n').reverse();
  for (const line of lines) {
    try {
      const value = JSON.parse(line);
      if (value?.result && typeof value.result === 'string') {
        try { return JSON.parse(value.result); } catch { return { summary: value.result }; }
      }
      if (value && typeof value === 'object' && ('verdict' in value || 'summary' in value || 'documents' in value)) return value;
    } catch { /* Try the previous line. */ }
  }
  try { return JSON.parse(stdout); } catch { return { summary: stdout.trim() }; }
}
