import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { packageRoot } from '../src/manifest.js';

const run = promisify(execFile);

/**
 * A garantia mais cara de errar deste pacote, e a única que a suíte comum não pega.
 *
 * `init` copia da árvore de trabalho, então ele fica verde mesmo que o tarball publicado não traga
 * o template. Quem instalasse receberia um comando que roda, não acusa nada e não escreve arquivo
 * nenhum. Por isso este teste pergunta ao `npm pack`, e não ao disco.
 *
 * O risco é concreto: `.specs` e `.claude` começam com ponto, e a inclusão delas depende de o
 * diretório que as contém estar nomeado em `files` do package.json.
 */
describe('tarball publicado', () => {
  let arquivosPromise;

  async function listar() {
    if (!arquivosPromise) arquivosPromise = run('npm', ['pack', '--dry-run', '--json'], {
      cwd: packageRoot,
      maxBuffer: 1024 * 1024 * 16,
    }).then(({ stdout }) => JSON.parse(stdout)[0].files.map((f) => f.path));
    return arquivosPromise;
  }

  test('traz o CLAUDE.md dos dois templates', async () => {
    const f = await listar();
    assert.ok(f.includes('template/pt-BR/CLAUDE.md'));
    assert.ok(f.includes('template/en/CLAUDE.md'));
  });

  test('não publica o CLAUDE.md do próprio repositório como se fosse template', async () => {
    assert.ok(
      !(await listar()).includes('CLAUDE.md'),
      'o CLAUDE.md do pacote foi para o tarball — ele fala das regras de construir, não de usar',
    );
  });

  test('traz o .specs/ inteiro, inclusive o orquestrador', async () => {
    const f = await listar();
    assert.ok(
      f.includes('template/pt-BR/.specs/README.md'),
      '.specs/README.md ficou fora do tarball',
    );
    assert.ok(
      f.includes('template/pt-BR/.specs/EXECUTAR-TODAS.md'),
      'o orquestrador ficou fora do tarball',
    );
    assert.ok(
      f.some((p) => p.startsWith('template/pt-BR/.specs/templates/')),
      'os templates de mudança ficaram fora do tarball',
    );
  });

  test('traz as skills', async () => {
    const f = await listar();
    assert.ok(
      f.filter((p) => p.startsWith('template/pt-BR/.claude/skills/') && p.endsWith('SKILL.md'))
        .length >= 6,
      'faltou skill no tarball',
    );
  });

  test('traz a árvore em inglês', async () => {
    const f = await listar();
    assert.ok(
      f.filter((p) => p.startsWith('template/en/.claude/skills/') && p.endsWith('SKILL.md'))
        .length >= 6,
      'faltou skill em inglês no tarball',
    );
    assert.ok(
      f.some((p) => p.startsWith('template/en/.specs/')),
      'o .specs/ em inglês ficou fora do tarball',
    );
  });

  test('não publica configuração de máquina', async () => {
    const f = await listar();
    assert.ok(!f.some((p) => p.endsWith('settings.local.json')));
  });

  test('não publica os testes do próprio pacote', async () => {
    assert.ok(!(await listar()).some((p) => p.startsWith('test/')));
  });

  test('não publica o lock de paridade', async () => {
    // Metadado de desenvolvimento sobre os templates, não um template. Ele mora na raiz justamente
    // para ficar fora daqui por consequência de `files`, e não por exceção escrita — exceção é o
    // tipo de linha que alguém apaga sem entender.
    assert.ok(
      !(await listar()).some((p) => p.includes('PARITY.lock.json')),
      'o lock de paridade voltou para o tarball — ele saiu de template/ para não estar aqui',
    );
  });
});
