import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertTransition, canTransition, migrateLegacyStatus, setFrontmatterFields } from '../src/workflow.js';

test('a máquina aceita apenas transições declaradas', () => {
  assert.equal(canTransition('ready', 'executing'), true);
  assert.equal(canTransition('ready', 'verified'), false);
  assert.throws(() => assertTransition('awaiting-review', 'archived'), /Invalid/);
});

test('migração legada nunca considera done como verificado sem review', () => {
  assert.deepEqual(migrateLegacyStatus('todo'), { status: 'ready' });
  assert.equal(migrateLegacyStatus('in-progress').status, 'blocked');
  assert.equal(migrateLegacyStatus('done').status, 'awaiting-review');
  assert.equal(migrateLegacyStatus('done', { approvedReview: true }).status, 'verified');
});

test('frontmatter é atualizado sem reescrever o corpo', () => {
  const changed = setFrontmatterFields('---\nstatus: todo\n---\n# Body\n', { workflow_version: 2, status: 'ready' });
  assert.match(changed, /workflow_version: 2/);
  assert.match(changed, /status: ready/);
  assert.match(changed, /# Body/);
});
