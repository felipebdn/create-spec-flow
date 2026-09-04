import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest, TOOLS } from '../src/server.js';
import { configureClient } from '../src/configure.js';

test('MCP anuncia ferramentas e protocolo', async () => {
  const initialized = await handleRequest({}, { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } });
  assert.equal(initialized.result.serverInfo.name, 'create-spec-flow-mcp');
  const listed = await handleRequest({}, { jsonrpc: '2.0', id: 2, method: 'tools/list' });
  assert.equal(listed.result.tools.length, TOOLS.length);
  assert.ok(TOOLS.some(({ name }) => name === 'spec_flow_approve_archive'));
});

test('configure é opt-in e monta comandos sem shell', async () => {
  const claude = await configureClient({ client: 'claude', project: '/tmp/project' });
  assert.equal(claude.executed, false);
  assert.deepEqual(claude.command.slice(0, 6), ['claude', 'mcp', 'add', '--scope', 'project', 'spec-flow']);
  const codex = await configureClient({ client: 'codex', project: '/tmp/project' });
  assert.deepEqual(codex.command.slice(0, 4), ['codex', 'mcp', 'add', 'spec-flow']);
});
