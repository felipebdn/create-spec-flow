import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

test('tarball do companion contém servidor e binário, sem testes', async () => {
  const root = new URL('..', import.meta.url).pathname;
  const { stdout } = await run('npm', ['pack', '--dry-run', '--json'], { cwd: root });
  const files = JSON.parse(stdout)[0].files.map(({ path }) => path);
  assert.ok(files.includes('bin/create-spec-flow-mcp.js'));
  assert.ok(files.includes('src/server.js'));
  assert.ok(!files.some((path) => path.startsWith('test/')));
});
