import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inspect, diffCounts } from '../src/parity.js';
import { LOCK_PATH } from '../scripts/parity-lock.js';

/**
 * Tradução defasada, detectada sem comparador semântico.
 *
 * O teste de forma que já existia pega arquivo faltando e mais nada: editar `template/pt-BR/` sem
 * editar `template/en/` passava verde. As três camadas abaixo medem o que **não** se traduz.
 *
 * Elas não são redundantes. A forma pega seção acrescentada; o número pega teto ou código de status
 * trocado de um lado; o lock pega reescrita pura, que nenhuma das outras duas alcança.
 */
let dados;
let lock;

before(async () => {
  dados = await inspect();
  lock = JSON.parse(await readFile(LOCK_PATH, 'utf8'));
});

describe('paridade — nenhum arquivo órfão', () => {
  test('todo arquivo de pt-BR tem par em en', () => {
    assert.deepEqual(
      dados.orphansPt,
      [],
      'arquivos sem tradução — acrescente o par ou o mapa de nome em ROLE_NAMES',
    );
  });

  test('todo arquivo de en tem par em pt-BR', () => {
    assert.deepEqual(
      dados.orphansEn,
      [],
      'arquivos que só existem em inglês — o pt-BR ficou para trás',
    );
  });
});

describe('paridade — forma', () => {
  test('a árvore de títulos, os blocos de código, as tabelas e os checkboxes batem', () => {
    const divergentes = dados.rows
      .filter((r) => JSON.stringify(r.ptShape) !== JSON.stringify(r.enShape))
      .map((r) => {
        const campos = Object.keys(r.ptShape)
          .filter((k) => r.ptShape[k] !== r.enShape[k])
          .map((k) => `${k}: pt=${r.ptShape[k]} en=${r.enShape[k]}`);
        return `${r.pt}\n      ${campos.join('\n      ')}`;
      });

    assert.deepEqual(
      divergentes,
      [],
      `forma divergente entre idiomas:\n    ${divergentes.join('\n    ')}`,
    );
  });
});

describe('paridade — números que carregam regra', () => {
  test('teto, código de status e identificador numérico batem nos dois idiomas', () => {
    const divergentes = dados.rows
      .map((r) => ({ r, d: diffCounts(r.ptNumbers, r.enNumbers) }))
      .filter(({ d }) => d.soA.length > 0 || d.soB.length > 0)
      .map(({ r, d }) => `${r.pt} — só em pt-BR: [${d.soA}] · só em en: [${d.soB}]`);

    assert.deepEqual(
      divergentes,
      [],
      `números divergentes entre idiomas:\n    ${divergentes.join('\n    ')}`,
    );
  });
});

describe('paridade — lock de hash', () => {
  test('o lock cobre exatamente os pares que existem', () => {
    assert.deepEqual(
      Object.keys(lock.pairs).sort(),
      dados.rows.map((r) => r.pt).sort(),
      'o lock está dessincronizado da árvore — rode `npm run i18n:sync`',
    );
  });

  test('nenhum lado mudou desde a última declaração de sincronia', () => {
    const problemas = [];
    for (const r of dados.rows) {
      const registrado = lock.pairs[r.pt];
      if (!registrado) continue;

      const ptMudou = registrado.ptSha !== r.ptSha;
      const enMudou = registrado.enSha !== r.enSha;

      // A distinção é o achado: um lado só é o defeito que se procura; os dois é só o lock velho.
      if (ptMudou && !enMudou) {
        problemas.push(`${r.pt} — pt-BR mudou e o inglês NÃO. A tradução ficou defasada.`);
      } else if (enMudou && !ptMudou) {
        problemas.push(`${r.en} — o inglês mudou e o pt-BR NÃO. O português ficou defasado.`);
      } else if (ptMudou && enMudou) {
        problemas.push(
          `${r.pt} — os dois mudaram. Confirme que continuam dizendo o mesmo e rode \`npm run i18n:sync\`.`,
        );
      }
    }

    assert.deepEqual(problemas, [], `\n    ${problemas.join('\n    ')}\n`);
  });
});
