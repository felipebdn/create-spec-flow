import { readdir, readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { LANGUAGES } from './manifest.js';

/**
 * Detecção de tradução defasada **sem comparador semântico**.
 *
 * O problema: `template/pt-BR/` e `template/en/` têm que dizer a mesma coisa, e nada obriga quem
 * edita um a editar o outro. Um teste que conte arquivos pega arquivo faltando e mais nada — edição
 * de conteúdo em um lado só passa verde.
 *
 * A saída não é entender o texto. É medir o que **não** se traduz:
 *
 * 1. **Forma** — títulos, blocos de código, linhas de tabela, checkboxes, chaves do frontmatter.
 *    Prosa se traduz; estrutura não. Seção acrescentada de um lado só aparece aqui.
 * 2. **Número carregado** — dígito dentro de crase, prefixado por `~`, ou seguido de `%`. São
 *    tetos, códigos de status, identificadores. `3 dígitos` versus `three-digit` é prosa e fica de
 *    fora de propósito: soletrar um número é tradução legítima.
 * 3. **Lock de hash** — o único que pega reescrita pura. Guarda o sha de cada lado no momento em que
 *    alguém **declarou** que os dois diziam a mesma coisa. Editou um lado, fica vermelho até a
 *    declaração ser refeita.
 *
 * As três medem coisas diferentes, e nenhuma sozinha basta.
 */

/** Papéis cujo **nome** muda entre idiomas. Nome de arquivo e de skill é conteúdo, não embalagem. */
export const ROLE_NAMES = [
  ['EXECUTAR-TODAS.md', 'RUN-ALL.md'],
  ['decisoes.md', 'decisions.md'],
  ['convencoes.md', 'conventions.md'],
  ['glossario.md', 'glossary.md'],
  ['spec-nova-mudanca', 'spec-new-change'],
  ['spec-executar-mudanca', 'spec-run-change'],
  ['spec-verificar-mudanca', 'spec-verify-change'],
  ['spec-arquivar-mudanca', 'spec-archive-change'],
  ['spec-tetos-e-poda', 'spec-ceilings-and-pruning'],
  ['spec-nova-skill', 'spec-new-skill'],
];

/** Traduz um caminho de pt-BR para o caminho equivalente em inglês. */
export function toEnglishPath(path) {
  return ROLE_NAMES.reduce((acc, [pt, en]) => acc.split(pt).join(en), path);
}

async function walk(root, prefix = '') {
  const out = [];
  for (const item of await readdir(join(root, prefix), { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.isDirectory()) out.push(...(await walk(root, rel)));
    else if (item.isFile()) out.push(rel);
  }
  return out;
}

/** Os pares de arquivo dos dois idiomas, mais os órfãos de cada lado. */
export async function pairs() {
  const ptRoot = LANGUAGES['pt-BR'].root;
  const enRoot = LANGUAGES.en.root;
  const pt = (await walk(ptRoot)).sort();
  const en = new Set(await walk(enRoot));

  const matched = [];
  const orphansPt = [];
  for (const rel of pt) {
    const alvo = toEnglishPath(rel);
    if (en.has(alvo)) {
      matched.push({ pt: rel, en: alvo, ptPath: join(ptRoot, rel), enPath: join(enRoot, alvo) });
      en.delete(alvo);
    } else {
      orphansPt.push(rel);
    }
  }
  return { matched, orphansPt, orphansEn: [...en].sort() };
}

/**
 * Traços de forma. Nenhum deles muda ao traduzir prosa.
 *
 * O nível de cada título entra na conta, e não só a contagem: trocar um `##` por `###` de um lado só
 * reorganiza o documento, e contagem pura não veria.
 */
export function shape(text) {
  const headings = [...text.matchAll(/^(#{1,6}) /gm)].map((m) => m[1].length);

  // Só o bloco do topo, e **contando** chaves em vez de nomeá-las: `titulo`/`title` e
  // `depende_de`/`depends_on` são conteúdo traduzido, igual a nome de skill. O que é estrutura é
  // quantos campos existem — campo acrescentado de um lado só aparece aqui.
  const bloco = /^---\n([\s\S]*?)\n---\n/.exec(text);
  const frontmatterKeys = bloco ? (bloco[1].match(/^[a-z_]+:/gm) ?? []).length : 0;

  return {
    headings: headings.join(','),
    fences: (text.match(/^```/gm) ?? []).length,
    tableRows: (text.match(/^\|/gm) ?? []).length,
    checkboxes: (text.match(/^\s*- \[[ x]\]/gm) ?? []).length,
    frontmatterKeys,
  };
}

/**
 * Números que carregam regra, e só eles.
 *
 * A crase pode atravessar quebra de linha — prosa com wrap produz isso o tempo todo, e um extrator
 * linha a linha desalinha o pareamento das crases do arquivo inteiro a partir da primeira.
 */
export function loadedNumbers(text) {
  const conta = new Map();
  const add = (n) => conta.set(n, (conta.get(n) ?? 0) + 1);
  for (const [span] of text.matchAll(/`[^`]{0,400}?`/gs)) {
    for (const [n] of span.matchAll(/\d+/g)) add(n);
  }
  for (const [, n] of text.matchAll(/~(\d+)/g)) add(n);
  for (const [, n] of text.matchAll(/(\d+)%/g)) add(n);
  return conta;
}

export function diffCounts(a, b) {
  const soA = [];
  const soB = [];
  for (const [k, v] of a) {
    const outro = b.get(k) ?? 0;
    if (v > outro) soA.push(`${k}×${v - outro}`);
  }
  for (const [k, v] of b) {
    const outro = a.get(k) ?? 0;
    if (v > outro) soB.push(`${k}×${v - outro}`);
  }
  return { soA: soA.sort(), soB: soB.sort() };
}

export function sha(text) {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

/** Lê os dois lados de cada par e devolve forma, números e hash de cada um. */
export async function inspect() {
  const { matched, orphansPt, orphansEn } = await pairs();
  const rows = [];
  for (const p of matched) {
    const ptText = await readFile(p.ptPath, 'utf8');
    const enText = await readFile(p.enPath, 'utf8');
    rows.push({
      ...p,
      ptShape: shape(ptText),
      enShape: shape(enText),
      ptNumbers: loadedNumbers(ptText),
      enNumbers: loadedNumbers(enText),
      ptSha: sha(ptText),
      enSha: sha(enText),
    });
  }
  return { rows, orphansPt, orphansEn };
}

export { relative, stat };
