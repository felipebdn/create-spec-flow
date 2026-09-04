import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { init } from '../src/init.js';
import { upgrade } from '../src/upgrade.js';

let root;
beforeEach(async () => { root = await mkdtemp(join(tmpdir(), 'spec-flow-upgrade-')); });
afterEach(async () => { await rm(root, { recursive: true, force: true }); });

test('upgrade preserva arquivo customizado e produz candidato de conflito', async () => {
  await init({ target: root, orchestrator: 'manual' });
  const path = join(root, 'CLAUDE.md');
  await writeFile(path, `${await readFile(path, 'utf8')}\nMinha regra.\n`);
  const result = await upgrade({ target: root, orchestrator: 'mcp' });
  assert.ok(result.conflicts.includes('CLAUDE.md'));
  assert.match(await readFile(path, 'utf8'), /Minha regra/);
  assert.ok(result.added.includes('.specs/orchestrator.json'));
});

test('upgrade migra estado legado de forma conservadora', async () => {
  await init({ target: root });
  const change = join(root, '.specs/changes/001-old');
  await mkdir(change, { recursive: true });
  await writeFile(join(change, 'spec.md'), '---\nid: 001-old\nstatus: done\n---\n# Old\n');
  const result = await upgrade({ target: root });
  assert.deepEqual(result.migrated, [{ change: '001-old', from: 'done', to: 'awaiting-review' }]);
  assert.match(await readFile(join(change, 'spec.md'), 'utf8'), /status: awaiting-review/);
});

test('dry-run não escreve arquivos', async () => {
  await init({ target: root, orchestrator: 'none' });
  const result = await upgrade({ target: root, orchestrator: 'mcp', dryRun: true });
  assert.ok(result.added.includes('.specs/orchestrator.json'));
  await assert.rejects(() => readFile(join(root, '.specs/orchestrator.json'), 'utf8'), { code: 'ENOENT' });
});
