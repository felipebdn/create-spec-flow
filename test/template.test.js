import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { LANGUAGES } from '../src/manifest.js';
import { pairs } from '../src/parity.js';

/**
 * Consistência interna de cada template, dentro do próprio idioma.
 *
 * O teste de paridade compara os dois lados um com o outro; este pergunta se **cada lado faz
 * sentido sozinho**. São coisas diferentes: dois templates podem estar perfeitamente paritários e
 * os dois citarem um arquivo que não existe.
 *
 * O que apodrece aqui é caminho e nome de skill. Renomear uma skill é editar um diretório e um
 * campo de frontmatter, e as cinco citações dela em prosa continuam apontando para o nome velho sem
 * ninguém notar — os nomes são diferentes em cada idioma, então a chance de errar é dobrada.
 */
async function existe(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Todo caminho `.specs/…` ou `.claude/…` citado dentro de crase em qualquer arquivo do template. */
async function citedPaths(root, files) {
  const citados = [];
  for (const rel of files) {
    const texto = await readFile(join(root, rel), 'utf8');
    for (const [, caminho] of texto.matchAll(/`(\.specs\/[^`\s]+|\.claude\/[^`\s]+)`/g)) {
      const limpo = caminho.replace(/[.,;:]+$/, '');
      // `NNN-slug`, `<area>` e afins são **espaço reservado**, não caminho: o template mostra a
      // forma de um caminho que só existe no projeto de quem instala. Conferir a existência deles
      // aqui exigiria criar uma mudança de mentira dentro do template.
      const reservado = /NNN|<[^>]+>|\.\.\./.test(limpo);
      if (!limpo.endsWith('/') && !reservado) citados.push({ de: rel, caminho: limpo });
    }
  }
  return citados;
}

for (const [lang, { root, orchestrator }] of Object.entries(LANGUAGES)) {
  describe(`template ${lang} — consistência interna`, () => {
    test('todo caminho citado no texto existe de fato', async () => {
      const { matched } = await pairs();
      const files = matched.map((m) => (lang === 'pt-BR' ? m.pt : m.en));
      const citados = await citedPaths(root, files);

      const quebrados = [];
      for (const { de, caminho } of citados) {
        if (!(await existe(join(root, caminho)))) quebrados.push(`${caminho} (citado em ${de})`);
      }

      assert.deepEqual(quebrados, [], `caminhos citados que não existem:\n    ${quebrados.join('\n    ')}`);
      assert.ok(citados.length > 20, 'o extrator parou de achar caminhos — regex quebrada?');
    });

    test('o `name` de cada skill bate com o diretório dela', async () => {
      const { matched } = await pairs();
      const skills = matched
        .map((m) => (lang === 'pt-BR' ? m.pt : m.en))
        .filter((f) => f.endsWith('/SKILL.md'));

      const errados = [];
      for (const rel of skills) {
        const dir = rel.split('/').at(-2);
        const declarado = /^name:\s*(\S+)/m.exec(await readFile(join(root, rel), 'utf8'))?.[1];
        if (declarado !== dir) errados.push(`${dir} declara name: ${declarado}`);
      }

      assert.deepEqual(errados, [], `skill cujo name não bate com o diretório:\n    ${errados.join('\n    ')}`);
      assert.ok(skills.length >= 6, 'sumiu skill do template');
    });

    test('o orquestrador existe com o nome deste idioma', async () => {
      assert.ok(
        await existe(join(root, orchestrator)),
        `${orchestrator} não existe em ${lang} — LANGUAGES e a árvore divergiram`,
      );
    });
  });
}
