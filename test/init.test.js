import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { init, InitRefused } from '../src/init.js';
import { TEMPLATE_ENTRIES, LANGUAGES } from '../src/manifest.js';

let destino;

beforeEach(async () => {
  destino = await mkdtemp(join(tmpdir(), 'create-spec-flow-'));
});

afterEach(async () => {
  await rm(destino, { recursive: true, force: true });
});

describe('init — o caminho comum', () => {
  test('escreve CLAUDE.md, .specs/ e .claude/skills/ num diretório vazio', async () => {
    const { written } = await init({ target: destino });

    assert.ok(written.includes('CLAUDE.md'), 'CLAUDE.md não foi escrito');
    assert.ok(
      written.some((f) => f.startsWith('.specs/')),
      'nenhum arquivo de .specs/ foi escrito',
    );
    assert.ok(
      written.some((f) => f.startsWith('.claude/skills/')),
      'nenhuma skill foi escrita',
    );
  });

  test('o EXECUTAR-TODAS.md e as seis skills do fluxo chegam no projeto', async () => {
    const { written } = await init({ target: destino });

    assert.ok(written.includes('.specs/EXECUTAR-TODAS.md'));
    for (const skill of [
      'spec-nova-mudanca',
      'spec-executar-mudanca',
      'spec-verificar-mudanca',
      'spec-arquivar-mudanca',
      'spec-tetos-e-poda',
      'spec-nova-skill',
    ]) {
      assert.ok(
        written.includes(`.claude/skills/${skill}/SKILL.md`),
        `skill ausente no template: ${skill}`,
      );
    }
  });

  test('a fila nasce vazia — o projeto novo não herda mudança de ninguém', async () => {
    const { written } = await init({ target: destino });
    const naFila = written.filter((f) => f.startsWith('.specs/changes/'));
    assert.deepEqual(
      naFila,
      ['.specs/changes/README.md'],
      `a fila veio com trabalho dentro: ${naFila.join(', ')}`,
    );
  });

  test('não leva arquivo do próprio pacote para o projeto de quem instala', async () => {
    const { written } = await init({ target: destino });
    for (const proibido of ['package.json', 'bin/create-spec-flow.js', 'src/init.js', 'README.md']) {
      assert.ok(!written.includes(proibido), `vazou arquivo do pacote: ${proibido}`);
    }
    assert.ok(
      !written.some((f) => f.startsWith('template/')),
      'vazou a árvore de templates para dentro do projeto',
    );
    assert.ok(
      !written.some((f) => f.startsWith('test/')),
      'vazou os testes do pacote para o projeto',
    );
    assert.ok(
      !written.includes('.claude/settings.local.json'),
      'vazou configuração de máquina para o projeto',
    );
  });

  test('o CLAUDE.md entregue é o do template, e não o do repositório do pacote', async () => {
    await init({ target: destino });
    const texto = await readFile(join(destino, 'CLAUDE.md'), 'utf8');

    assert.ok(
      texto.includes('.specs/changes/'),
      'o CLAUDE.md entregue não fala do fluxo — veio o arquivo errado',
    );
    assert.ok(
      !texto.includes('create-spec-flow — instruções do repositório'),
      'o CLAUDE.md do pacote vazou para o projeto de quem instala',
    );
  });
});

describe('init — recusa em projeto já inicializado', () => {
  test('recusa quando o destino já tem .specs/, e não escreve nada', async () => {
    await mkdir(join(destino, '.specs'), { recursive: true });
    await writeFile(join(destino, '.specs', 'meu.md'), 'trabalho de alguém');

    await assert.rejects(
      () => init({ target: destino }),
      (erro) => erro instanceof InitRefused && erro.code === 'JA_INICIALIZADO',
    );

    assert.equal(
      await readFile(join(destino, '.specs', 'meu.md'), 'utf8'),
      'trabalho de alguém',
      'o conteúdo anterior foi tocado apesar da recusa',
    );
  });

  test('--force instala por cima de .specs/ existente', async () => {
    await mkdir(join(destino, '.specs'), { recursive: true });
    const { written } = await init({ target: destino, force: true });
    assert.ok(written.length > 0);
  });
});

describe('init — recusa por arquivo existente', () => {
  test('recusa quando um arquivo do template já existe, e não escreve nenhum', async () => {
    await writeFile(join(destino, 'CLAUDE.md'), 'as minhas regras');

    await assert.rejects(
      () => init({ target: destino }),
      (erro) => erro instanceof InitRefused && erro.code === 'ARQUIVO_EXISTENTE',
    );

    assert.equal(
      await readFile(join(destino, 'CLAUDE.md'), 'utf8'),
      'as minhas regras',
      'o arquivo do usuário foi sobrescrito',
    );
  });

  test('a recusa é tudo ou nada — nenhum arquivo do template sobra no destino', async () => {
    await writeFile(join(destino, 'CLAUDE.md'), 'as minhas regras');

    await assert.rejects(() => init({ target: destino }));

    await assert.rejects(
      () => readFile(join(destino, '.specs', 'README.md'), 'utf8'),
      (erro) => erro.code === 'ENOENT',
      'escreveu parte do template antes de recusar',
    );
  });

  test('a recusa nomeia os arquivos em conflito', async () => {
    await writeFile(join(destino, 'CLAUDE.md'), 'x');
    try {
      await init({ target: destino });
      assert.fail('deveria ter recusado');
    } catch (erro) {
      assert.ok(erro.details.conflicts.includes('CLAUDE.md'));
    }
  });
});

describe('init — idioma', () => {
  test('recusa idioma que não existe, e não escreve nada', async () => {
    await assert.rejects(
      () => init({ target: destino, lang: 'tlh' }),
      (erro) => erro instanceof InitRefused && erro.code === 'IDIOMA_DESCONHECIDO',
    );
    await assert.rejects(
      () => readFile(join(destino, 'CLAUDE.md'), 'utf8'),
      (erro) => erro.code === 'ENOENT',
    );
  });

  test('os dois idiomas entregam a mesma forma — nenhuma tradução fica pelo caminho', async () => {
    const ptBR = await init({ target: destino });
    await rm(destino, { recursive: true, force: true });
    await mkdir(destino, { recursive: true });
    const en = await init({ target: destino, lang: 'en' });

    // Paridade por **papel**, não por caminho: nome de arquivo e de skill é conteúdo traduzível.
    const forma = (r) => ({
      arquivos: r.written.length,
      claudeMd: r.written.includes('CLAUDE.md'),
      orquestrador: r.written.includes(LANGUAGES[r.lang].orchestrator),
      skills: r.written.filter((f) => f.endsWith('/SKILL.md')).length,
      templates: r.written.filter((f) => f.startsWith('.specs/templates/')).length,
      memory: r.written.filter((f) => f.startsWith('.specs/memory/')).length,
      shared: r.written.filter((f) => f.startsWith('.specs/shared/')).length,
    });

    assert.deepEqual(forma(en), forma(ptBR), 'as duas árvores de idioma divergiram em forma');
  });
});

describe('linha de comando — as duas formas de invocação', () => {
  const BIN = new URL('../bin/create-spec-flow.js', import.meta.url).pathname;
  const run = (args) =>
    new Promise((resolve) => {
      execFile(process.execPath, [BIN, ...args], (erro, stdout) =>
        resolve({ code: erro?.code ?? 0, stdout }),
      );
    });

  test('`npm create spec-flow <dir>` — sem subcomando, o posicional é o diretório', async () => {
    const alvo = join(destino, 'app');
    await mkdir(alvo, { recursive: true });

    const { code, stdout } = await run([alvo, '--yes']);

    assert.equal(code, 0, `saiu ${code}: ${stdout}`);
    assert.match(stdout, /20 arquivo\(s\) escritos/);
    await readFile(join(alvo, 'CLAUDE.md'), 'utf8');
  });

  test('`create-spec-flow init <dir>` — a forma longa continua valendo', async () => {
    const alvo = join(destino, 'app2');
    await mkdir(alvo, { recursive: true });

    const { code } = await run(['init', alvo, '--yes']);

    assert.equal(code, 0);
    await readFile(join(alvo, '.specs', 'README.md'), 'utf8');
  });

  test('a recusa por projeto já inicializado sai com 1 pelas duas formas', async () => {
    const alvo = join(destino, 'app3');
    await mkdir(join(alvo, '.specs'), { recursive: true });

    assert.equal((await run([alvo, '--yes'])).code, 1);
    assert.equal((await run(['init', alvo, '--yes'])).code, 1);
  });
});

describe('manifesto', () => {
  test('o que se copia é lista explícita, não regra de exclusão', () => {
    assert.deepEqual(TEMPLATE_ENTRIES, ['CLAUDE.md', '.specs', '.claude/skills']);
  });
});

describe('--help', () => {
  const BIN = new URL('../bin/create-spec-flow.js', import.meta.url).pathname;
  const ajuda = () =>
    new Promise((resolve) => {
      execFile(process.execPath, [BIN, '--help'], (_e, stdout) => resolve(stdout));
    });

  test('mostra uma forma de invocação só, a mesma do README', async () => {
    const texto = await ajuda();
    assert.match(texto, /npx create-spec-flow \[diretório\]/);
    assert.ok(
      !texto.includes('npm create'),
      'o --help voltou a mostrar `npm create`, que prefixa `create-` e confunde',
    );
  });

  test('a coluna das opções é calculada, não contada à mão', async () => {
    const linhas = (await ajuda()).split('\n').filter((l) => l.startsWith('  --'));
    assert.ok(linhas.length >= 4, 'sumiram opções do --help');

    // O rótulo de `--lang` cresce com LANGUAGES; padding fixo desalinharia ao entrar um idioma.
    const colunas = new Set(linhas.map((l) => /^( {2}--.*?)( {2,})\S/.exec(l)[2].length + /^( {2}--.*?)( {2,})\S/.exec(l)[1].length));
    assert.equal(colunas.size, 1, `descrições em colunas diferentes: ${[...colunas].sort()}`);
  });
});
