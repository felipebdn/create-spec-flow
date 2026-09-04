#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { cwd, exit, stdout } from 'node:process';
import { startServer } from '../src/server.js';
import { configureClient } from '../src/configure.js';

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    project: { type: 'string' },
    client: { type: 'string' },
    yes: { type: 'boolean', short: 'y', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});
const command = positionals[0] ?? 'serve';
const project = values.project ?? cwd();

if (values.help) {
  stdout.write('create-spec-flow-mcp serve --project <dir>\ncreate-spec-flow-mcp configure --client <claude|codex> --project <dir> --yes\n');
  exit(0);
}
if (command === 'serve') await startServer({ project });
else if (command === 'configure') {
  if (!values.client) throw new Error('--client is required');
  const result = await configureClient({ client: values.client, project, confirmed: values.yes });
  stdout.write(`${result.command.join(' ')}\n`);
  if (!result.executed) stdout.write('Re-run with --yes to register the MCP server.\n');
} else throw new Error(`Unknown command: ${command}`);
