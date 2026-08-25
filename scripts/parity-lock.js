#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { stdout, exit } from 'node:process';
import { inspect } from '../src/parity.js';
import { packageRoot } from '../src/manifest.js';

/**
 * Regrava `template/PARITY.lock.json` com o hash atual dos dois lados de cada par.
 *
 * Rodar isto é um **ato de declaração**, não um passo de build: você está afirmando que leu os dois
 * arquivos e que eles dizem a mesma coisa. É o mesmo desenho da regra de sabotagem do fluxo — o
 * mecanismo não impede a mentira, ele obriga a mentira a ser escrita e datada em vez de acontecer
 * por omissão.
 */
export const LOCK_PATH = join(packageRoot, 'template', 'PARITY.lock.json');

export async function writeLock() {
  const { rows } = await inspect();
  const lock = {
    comment:
      'Hash dos dois lados de cada par no momento em que alguém declarou que dizem a mesma coisa. Regrave com `npm run i18n:sync` — e só depois de ter lido os dois.',
    pairs: Object.fromEntries(rows.map((r) => [r.pt, { en: r.en, ptSha: r.ptSha, enSha: r.enSha }])),
  };
  await writeFile(LOCK_PATH, `${JSON.stringify(lock, null, 2)}\n`);
  return lock;
}

if (import.meta.filename === process.argv[1]) {
  const lock = await writeLock();
  stdout.write(`${Object.keys(lock.pairs).length} pares declarados em sincronia.\n`);
  exit(0);
}
