import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, relative, sep } from 'node:path';
import { packageRoot, templateRoot } from '../src/manifest.js';

const run = promisify(execFile);

/**
 * O template inteiro chega em quem clona o repositório.
 *
 * Esta garantia existe por um defeito real e silencioso. O `.gitignore` **global** de quem trabalha
 * com agentes costuma trazer `.claude/` e `CLAUDE.md`, para não versionar configuração pessoal de
 * editor. Aqui os dois são o produto — e sem reinclusão explícita, 17 arquivos ficavam de fora do
 * repositório sem uma linha de aviso.
 *
 * **Nenhum outro teste pega isso.** O `npm pack` não consulta gitignore: ele obedece ao campo
 * `files` do package.json. O tarball saía correto, a suíte inteira ficava verde, e só o clone saía
 * quebrado — o pior formato possível de defeito, porque quem publica nunca é quem clona.
 *
 * São duas perguntas diferentes, e as duas precisam ser feitas:
 *
 * 1. **O que já está no disco está rastreado?** Pega o arquivo que escorregou — alguém criou, o
 *    ignore engoliu, o `git add -A` não reclamou.
 * 2. **Alguma regra de ignore alcança o template?** Pega a regressão **antes** do estrago: um
 *    arquivo já rastreado mascara a regra que o alcançaria, então a primeira pergunta fica verde
 *    enquanto o próximo arquivo novo é engolido em silêncio. Só `--no-index` enxerga isso.
 */

/** Arquivos que precisam sobreviver ao clone, mesmo contra um gitignore global hostil. */
const FORA_DO_TEMPLATE = ['CLAUDE.md'];

let repo = true;
let noDisco = [];
let rastreados = new Set();

async function walk(dir) {
  const out = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, item.name);
    if (item.isDirectory()) out.push(...(await walk(p)));
    else if (item.isFile()) out.push(p);
  }
  return out;
}

before(async () => {
  try {
    await run('git', ['rev-parse', '--git-dir'], { cwd: packageRoot });
  } catch {
    repo = false;
    return;
  }

  noDisco = (await walk(templateRoot))
    .map((p) => relative(packageRoot, p).split(sep).join('/'))
    .concat(FORA_DO_TEMPLATE)
    .sort();

  const { stdout } = await run('git', ['ls-files', '--', 'template', ...FORA_DO_TEMPLATE], {
    cwd: packageRoot,
    maxBuffer: 1024 * 1024 * 8,
  });
  rastreados = new Set(stdout.split('\n').filter(Boolean));
});

/**
 * `check-ignore` sai com 1 quando **nenhum** caminho casa com regra de ignore. Para nós isso é o
 * resultado desejado, não uma falha do comando.
 */
async function ignorados(paths) {
  try {
    const { stdout } = await run(
      'git',
      ['check-ignore', '--no-index', '--', ...paths],
      { cwd: packageRoot, maxBuffer: 1024 * 1024 * 8 },
    );
    return stdout.split('\n').filter(Boolean);
  } catch (erro) {
    if (erro.code === 1) return [];
    throw erro;
  }
}

describe('git — o template sobrevive ao clone', () => {
  test('todo arquivo do template está rastreado', (t) => {
    if (!repo) {
      t.skip('fora de um repositório git — a garantia não pode ser avaliada aqui');
      return;
    }

    const faltando = noDisco.filter((p) => !rastreados.has(p));
    assert.deepEqual(
      faltando,
      [],
      `arquivos que existem no disco e não no git — quem clonar não vai recebê-los:\n    ${faltando.join('\n    ')}`,
    );
    assert.ok(noDisco.length > 30, 'o walk parou de achar arquivos — caminho errado?');
  });

  test('nada rastreado sob template/ sumiu do disco', (t) => {
    if (!repo) {
      t.skip('fora de um repositório git');
      return;
    }

    const naoDisco = [...rastreados].filter((p) => !noDisco.includes(p)).sort();
    assert.deepEqual(
      naoDisco,
      [],
      `rastreados que não existem mais no disco — apagados sem "git rm":\n    ${naoDisco.join('\n    ')}`,
    );
  });

  test('nenhuma regra de ignore alcança o template', async (t) => {
    if (!repo) {
      t.skip('fora de um repositório git');
      return;
    }

    // `--no-index` é obrigatório: sem ele, um arquivo já rastreado mascara a regra que o alcança, e
    // a armadilha só aparece no próximo arquivo novo — quando ninguém está olhando.
    const alcancados = await ignorados(noDisco);
    assert.deepEqual(
      alcancados,
      [],
      `regra de ignore alcança arquivo do template. Rastreado hoje, mas o próximo arquivo novo nesses\n` +
        `    caminhos some em silêncio. Reinclua no .gitignore do repositório:\n    ${alcancados.join('\n    ')}`,
    );
  });

  test('um arquivo novo em qualquer canto do template seria versionado', async (t) => {
    if (!repo) {
      t.skip('fora de um repositório git');
      return;
    }

    // Caminhos hipotéticos, nos lugares exatos que o gitignore global costuma engolir. Não tocam o
    // disco: `--no-index` responde só pelas regras.
    const hipoteticos = [
      'template/pt-BR/.claude/skills/skill-nova/SKILL.md',
      'template/en/.claude/skills/new-skill/SKILL.md',
      'template/pt-BR/CLAUDE.md',
      'template/en/CLAUDE.md',
      'template/pt-BR/.specs/changes/001-x/spec.md',
    ];

    const alcancados = await ignorados(hipoteticos);
    assert.deepEqual(
      alcancados,
      [],
      `estes caminhos seriam engolidos por regra de ignore ao serem criados:\n    ${alcancados.join('\n    ')}`,
    );
  });
});
