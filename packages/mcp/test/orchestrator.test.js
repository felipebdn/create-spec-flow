import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp } from 'node:fs/promises';
import { init } from '../../../src/init.js';
import { SpecFlowOrchestrator } from '../src/orchestrator.js';

const run = promisify(execFile);
let sandbox;
let project;

class FakeOrchestrator extends SpecFlowOrchestrator {
  async dispatch(role, _prompt, cwd) {
    if (role === 'executor' || role === 'remediator') {
      await writeFile(join(cwd, 'implemented.txt'), `attempt ${this.runs.get(this.active)?.attempt ?? 1}\n`);
      return { adapter: 'fake-codex', stderr: '', output: { outcome: 'completed', summary: 'implemented', checks: [{ command: 'fake-test', result: 'passed', evidence: 'ok' }] } };
    }
    if (role === 'reviewer') return { adapter: 'fake-claude', stderr: '', output: { verdict: 'approved', summary: 'approved', findings: [], criteria: [{ id: 'AC1', result: 'met', evidence: 'implemented.txt' }] } };
    if (role === 'archiver') {
      const source = join(cwd, '.specs/changes/001-example');
      await writeFile(join(source, 'walkthrough.md'), '# Walkthrough\n');
      await rename(source, join(cwd, '.specs/archive/001-example'));
      return { adapter: 'fake-claude', stderr: '', output: { summary: 'archived' } };
    }
    throw new Error(`Unexpected role: ${role}`);
  }
}

beforeEach(async () => {
  sandbox = await mkdtemp(join(tmpdir(), 'spec-flow-mcp-'));
  project = join(sandbox, 'project');
  await mkdir(project);
  await init({ target: project, orchestrator: 'mcp' });
  const change = join(project, '.specs/changes/001-example');
  await mkdir(change);
  await writeFile(join(change, 'spec.md'), '---\nid: 001-example\nworkflow_version: 2\nstatus: ready\nattempt: 0\ndepends_on: []\n---\n# Example\n- [ ] AC1\n');
  await writeFile(join(change, 'plan.md'), '# Plan\n');
  await writeFile(join(change, 'tasks.md'), '# Tasks\n');
  await run('git', ['init', '-b', 'main'], { cwd: project });
  await run('git', ['add', '-A'], { cwd: project });
  await run('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '-m', 'fixture'], { cwd: project });
});

afterEach(async () => { await rm(sandbox, { recursive: true, force: true }); });

test('executa e revisa em worktree, para no portão e integra o arquivo aprovado', async () => {
  const orchestrator = new FakeOrchestrator({ project });
  const started = await orchestrator.start({ change: '001-example' });
  let state;
  for (let index = 0; index < 100; index += 1) {
    state = await orchestrator.status(started.id);
    if (state.status !== 'running') break;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  assert.equal(state.status, 'awaiting-archive-approval');
  assert.match(await readFile(join(state.worktree, '.specs/changes/001-example/execution-report.md'), 'utf8'), /\| passed \|/);
  assert.match(await readFile(join(state.worktree, '.specs/changes/001-example/review.md'), 'utf8'), /verdict: approved/);

  const archived = await orchestrator.approveArchive({ runId: started.id, confirmed: true });
  assert.equal(archived.status, 'archived');
  assert.match(await readFile(join(project, '.specs/archive/001-example/spec.md'), 'utf8'), /status: archived/);
  assert.match(await readFile(join(project, 'implemented.txt'), 'utf8'), /attempt/);
});
