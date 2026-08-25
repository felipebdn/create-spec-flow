#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, argv, exit, cwd } from 'node:process';
import { init, InitRefused, LANGUAGES, DEFAULT_LANGUAGE } from '../src/init.js';

const USO = `
specflow — instancia um fluxo de desenvolvimento guiado por especificação

  npx specflow init [diretório]

Opções
  --lang <${Object.keys(LANGUAGES).join('|')}>   idioma do template (padrão: ${DEFAULT_LANGUAGE})
  --force                       sobrescreve arquivos existentes
  --yes, -y                     não pergunta nada; usa os padrões
  --help, -h                    esta mensagem

O que é escrito no projeto
  CLAUDE.md          as regras que todo agente lê primeiro
  .specs/            fila de mudanças, memória, convenções, templates, orquestrador
  .claude/skills/    as skills do fluxo — portão, tetos e poda, sabotagem, arquivamento
`;

async function perguntarIdioma(interativo) {
  if (!interativo) return DEFAULT_LANGUAGE;

  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const opcoes = Object.entries(LANGUAGES)
      .map(([code, { label }], i) => `  ${i + 1}) ${label} (${code})`)
      .join('\n');
    const codes = Object.keys(LANGUAGES);
    const resposta = (
      await rl.question(`Idioma do template:\n${opcoes}\n> [1] `)
    ).trim();

    if (resposta === '') return codes[0];
    const porNumero = codes[Number(resposta) - 1];
    if (porNumero) return porNumero;
    if (codes.includes(resposta)) return resposta;
    return codes[0];
  } finally {
    rl.close();
  }
}

async function main() {
  let opts;
  let positionals;
  try {
    ({ values: opts, positionals } = parseArgs({
      args: argv.slice(2),
      allowPositionals: true,
      options: {
        lang: { type: 'string' },
        force: { type: 'boolean', default: false },
        yes: { type: 'boolean', short: 'y', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    }));
  } catch (erro) {
    stdout.write(`${erro.message}\n${USO}`);
    return 2;
  }

  if (opts.help) {
    stdout.write(USO);
    return 0;
  }

  const [comando = 'init', dir] = positionals;
  if (comando !== 'init') {
    stdout.write(`Comando desconhecido: ${comando}\n${USO}`);
    return 2;
  }

  // Sem TTY o prompt travaria para sempre num pipe ou numa esteira de CI.
  const interativo = Boolean(stdin.isTTY) && !opts.yes;
  const lang = opts.lang ?? (await perguntarIdioma(interativo));
  const target = dir ? dir : cwd();

  const { target: destino, written, overwritten } = await init({
    target,
    lang,
    force: opts.force,
  });

  stdout.write(`\n${written.length} arquivo(s) escritos em ${destino}\n`);
  if (overwritten.length > 0) {
    stdout.write(`${overwritten.length} sobrescrito(s) por --force\n`);
  }
  stdout.write('\nComece por CLAUDE.md e .specs/README.md.\n');
  return 0;
}

try {
  exit(await main());
} catch (erro) {
  if (erro instanceof InitRefused) {
    stdout.write(`\n${erro.message}\n`);
    if (erro.code === 'JA_INICIALIZADO') {
      stdout.write('Use --force para instalar por cima, ciente de que arquivos serão sobrescritos.\n');
    }
    if (erro.details.conflicts) {
      for (const c of erro.details.conflicts.slice(0, 10)) stdout.write(`  ${c}\n`);
      const resto = erro.details.conflicts.length - 10;
      if (resto > 0) stdout.write(`  … e mais ${resto}\n`);
    }
    exit(1);
  }
  throw erro;
}
