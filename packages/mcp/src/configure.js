import { resolve } from 'node:path';
import { runProcess } from './process.js';

export async function configureClient({ client, project = process.cwd(), confirmed = false }) {
  const root = resolve(project);
  const server = ['npx', '--yes', 'create-spec-flow-mcp', 'serve', '--project', root];
  let command;
  if (client === 'claude') command = ['claude', 'mcp', 'add', '--scope', 'project', 'spec-flow', '--', ...server];
  else if (client === 'codex') command = ['codex', 'mcp', 'add', 'spec-flow', '--', ...server];
  else throw new Error(`Unsupported MCP client: ${client}`);
  if (confirmed) await runProcess(command[0], command.slice(1), { cwd: root });
  return { client, command, executed: confirmed };
}
