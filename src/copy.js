import { readdir, mkdir, copyFile, stat, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

/** Erro de domínio do scaffolder. Distingue recusa esperada de defeito do programa. */
export class InitRefused extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'InitRefused';
    this.code = code;
    this.details = details;
  }
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (erro) {
    if (erro.code === 'ENOENT') return false;
    throw erro;
  }
}

/**
 * Enumera todo arquivo sob `entry`, relativo a `root`.
 * Aceita tanto arquivo solto quanto diretório.
 */
async function listFiles(root, entry) {
  const abs = join(root, entry);
  if (!(await exists(abs))) return [];

  const info = await stat(abs);
  if (info.isFile()) return [entry];

  const out = [];
  for (const item of await readdir(abs, { withFileTypes: true })) {
    const filho = join(entry, item.name);
    if (item.isDirectory()) out.push(...(await listFiles(root, filho)));
    else if (item.isFile()) out.push(filho);
  }
  return out;
}

/**
 * Resolve o plano de cópia **antes** de escrever qualquer coisa.
 *
 * Separar plano de execução é o que torna a recusa por conflito possível: descobrir o terceiro
 * conflito no meio da escrita deixaria o projeto do usuário com metade do template dentro, que é
 * pior que não ter começado.
 */
export async function planCopy({ from, to, entries, filter = () => true }) {
  const plan = [];
  const conflicts = [];

  for (const entry of entries) {
    for (const arquivo of (await listFiles(from, entry)).filter(filter)) {
      const destino = join(to, arquivo);
      if (await exists(destino)) conflicts.push(arquivo);
      else plan.push({ from: join(from, arquivo), to: destino, rel: arquivo });
    }
  }

  return { plan, conflicts };
}

/**
 * Recusa antes de escrever, e escreve tudo ou nada.
 *
 * `force` sobrescreve, e existe porque reinstalar por cima é caso legítimo — mas ele nunca é o
 * padrão: sobrescrever em silêncio apaga trabalho que ninguém pediu para apagar.
 */
export async function copyTemplate({ from, to, entries, force = false, filter }) {
  const { plan, conflicts } = await planCopy({ from, to, entries, filter });

  if (conflicts.length > 0 && !force) {
    throw new InitRefused(
      'ARQUIVO_EXISTENTE',
      `${conflicts.length} arquivo(s) já existem no destino. Nada foi escrito.`,
      { conflicts },
    );
  }

  const todos = force
    ? plan.concat(conflicts.map((rel) => ({ from: join(from, rel), to: join(to, rel), rel })))
    : plan;

  for (const item of todos) {
    await mkdir(join(item.to, '..'), { recursive: true });
    await copyFile(item.from, item.to);
  }

  return { written: todos.map((i) => i.rel).sort(), overwritten: force ? conflicts.sort() : [] };
}

/** Installs Codex aliases from the agent-neutral Claude source without duplicating templates. */
export async function codexAliasPaths(from) {
  return ['AGENTS.md', ...(await listFiles(from, '.claude/skills')).map((rel) => rel.replace('.claude/skills/', '.agents/skills/'))];
}

export async function installCodexAliases({ target, written, force = false }) {
  const aliases = [];
  const claude = join(target, 'CLAUDE.md');
  if (await exists(claude)) {
    const destination = join(target, 'AGENTS.md');
    if (force || !(await exists(destination))) {
      const text = (await readFile(claude, 'utf8')).replaceAll('.claude/skills/', '.agents/skills/');
      await writeFile(destination, text);
      aliases.push('AGENTS.md');
    }
  }

  for (const rel of written.filter((item) => item.startsWith('.claude/skills/'))) {
    const destinationRel = rel.replace('.claude/skills/', '.agents/skills/');
    const destination = join(target, destinationRel);
    if (!force && await exists(destination)) continue;
    await mkdir(join(destination, '..'), { recursive: true });
    const text = (await readFile(join(target, rel), 'utf8')).replaceAll('.claude/skills/', '.agents/skills/');
    await writeFile(destination, text);
    aliases.push(destinationRel);
  }
  return aliases;
}

/**
 * O projeto já é gerido por este fluxo?
 *
 * A pergunta é sobre `.specs/`, e não sobre um arquivo qualquer: `.specs/` é a fila de trabalho, e
 * escrever por cima dela é apagar decisão registrada — o dano que este scaffolder nunca pode causar.
 */
export async function alreadyInitialized(target) {
  return exists(join(target, '.specs'));
}

export { exists, listFiles, relative };
