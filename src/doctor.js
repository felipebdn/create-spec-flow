import { access, readFile } from 'node:fs/promises';
import { delimiter, join, resolve } from 'node:path';
import { INSTALL_MANIFEST } from './upgrade.js';

async function present(path) {
  try { await access(path); return true; } catch { return false; }
}

async function executable(name) {
  for (const directory of (process.env.PATH ?? '').split(delimiter)) {
    if (directory && await present(join(directory, name))) return true;
  }
  return false;
}

export async function doctor({ target = process.cwd() } = {}) {
  const root = resolve(target);
  const checks = [];
  for (const rel of ['.specs/README.md', 'CLAUDE.md', 'AGENTS.md', INSTALL_MANIFEST]) {
    checks.push({ name: rel, ok: await present(join(root, rel)) });
  }
  const manifestPath = join(root, INSTALL_MANIFEST);
  if (await present(manifestPath)) {
    try {
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      checks.push({ name: 'manifest', ok: manifest.workflowVersion === 2, detail: `workflow ${manifest.workflowVersion}` });
      if (manifest.orchestrator === 'mcp') {
        const configPath = join(root, '.specs/orchestrator.json');
        try {
          const config = JSON.parse(await readFile(configPath, 'utf8'));
          checks.push({ name: '.specs/orchestrator.json', ok: config.schemaVersion === 1 });
          for (const adapter of new Set(Object.values(config.roles ?? {}))) {
            const command = config.adapters?.[adapter]?.command;
            checks.push({ name: `adapter:${adapter}`, ok: Boolean(command) && await executable(command), detail: command ?? 'missing command' });
          }
        } catch (error) {
          checks.push({ name: '.specs/orchestrator.json', ok: false, detail: error.message });
        }
      }
    } catch (error) {
      checks.push({ name: 'manifest', ok: false, detail: error.message });
    }
  }
  return { target: root, checks, ok: checks.every(({ ok }) => ok) };
}
