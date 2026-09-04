#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, argv, cwd } from 'node:process';
import {
  init, InitRefused, LANGUAGES, DEFAULT_LANGUAGE,
  ORCHESTRATOR_PROFILES, DEFAULT_ORCHESTRATOR,
} from '../src/init.js';
import { upgrade } from '../src/upgrade.js';
import { doctor } from '../src/doctor.js';

// A largura da coluna sai da opção mais longa, e não de espaços contados à mão: o rótulo de `--lang`
// cresce com `LANGUAGES`, então padding fixo desalinha sozinho no dia em que entrar um terceiro
// idioma — e ninguém revisa alinhamento de `--help`.
const OPCOES = [
  [`--lang <${Object.keys(LANGUAGES).join('|')}>`, `idioma do template (padrão: ${DEFAULT_LANGUAGE})`],
  [`--orchestrator <${ORCHESTRATOR_PROFILES.join('|')}>`, `perfil (padrão: ${DEFAULT_ORCHESTRATOR})`],
  ['--dry-run', 'mostra um upgrade sem escrever'],
  ['--from <versão>', 'informa a versão de origem quando não há manifesto'],
  ['--force', 'sobrescreve arquivos existentes'],
  ['--yes, -y', 'não pergunta nada; usa os padrões'],
  ['--help, -h', 'esta mensagem'],
];
const COLUNA = Math.max(...OPCOES.map(([rotulo]) => rotulo.length)) + 2;

const USO = `
create-spec-flow — instancia um fluxo de desenvolvimento guiado por especificação

  npx create-spec-flow [init] [diretório]
  npx create-spec-flow upgrade [diretório]
  npx create-spec-flow doctor [diretório]

Opções
${OPCOES.map(([rotulo, texto]) => `  ${rotulo.padEnd(COLUNA)}${texto}`).join('\n')}

O que é escrito no projeto
  CLAUDE.md          as regras que todo agente lê primeiro
  .specs/            fila de mudanças, memória, convenções, templates, orquestrador
  .claude/skills/    as skills do fluxo — portão, tetos e poda, sabotagem, arquivamento
  AGENTS.md          as mesmas regras para Codex
  .agents/skills/    aliases das skills para Codex
`;

const write = (text) => new Promise((resolve, reject) => {
  stdout.write(text, (error) => error ? reject(error) : resolve());
});

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
        orchestrator: { type: 'string' },
        'dry-run': { type: 'boolean', default: false },
        from: { type: 'string' },
        force: { type: 'boolean', default: false },
        yes: { type: 'boolean', short: 'y', default: false },
        help: { type: 'boolean', short: 'h', default: false },
      },
    }));
  } catch (erro) {
    await write(`${erro.message}\n${USO}`);
    return 2;
  }

  if (opts.help) {
    await write(USO);
    return 0;
  }

  // `npm create spec-flow ./meu-app` invoca o pacote **sem** o subcomando: o primeiro posicional já
  // é o diretório. `create-spec-flow init ./meu-app` traz os dois. Aceitar as duas formas é o que
  // faz a mesma ferramenta servir aos dois caminhos de invocação.
  //
  // Posicional que não é `init` vale como diretório, e não como comando desconhecido. Com um comando
  // só, "recusar o que não conheço" custaria mais do que entrega: recusaria justamente a forma que o
  // `npm create` usa.
  const [primeiro, segundo] = positionals;
  const command = ['init', 'upgrade', 'doctor'].includes(primeiro) ? primeiro : 'init';
  const dir = command === 'init' && primeiro !== 'init' ? primeiro : segundo;
  const target = dir ? dir : cwd();

  if (command === 'upgrade') {
    const result = await upgrade({
      target,
      dryRun: opts['dry-run'],
      lang: opts.lang,
      orchestrator: opts.orchestrator,
      fromVersion: opts.from,
    });
    await write(`\nUpgrade${result.dryRun ? ' (dry-run)' : ''} em ${result.target}\n`);
    await write(`${result.added.length} novo(s), ${result.updated.length} atualizado(s), ${result.conflicts.length} conflito(s).\n`);
    for (const conflict of result.conflicts) await write(`  conflito: ${conflict}\n`);
    return result.conflicts.length > 0 ? 1 : 0;
  }

  if (command === 'doctor') {
    const result = await doctor({ target });
    for (const check of result.checks) await write(`${check.ok ? 'ok' : 'erro'}  ${check.name}${check.detail ? ` — ${check.detail}` : ''}\n`);
    return result.ok ? 0 : 1;
  }

  // Sem TTY o prompt travaria para sempre num pipe ou numa esteira de CI.
  const interativo = Boolean(stdin.isTTY) && !opts.yes;
  const lang = opts.lang ?? (await perguntarIdioma(interativo));
  const orchestrator = opts.orchestrator ?? DEFAULT_ORCHESTRATOR;

  const { target: destino, written, overwritten } = await init({
    target,
    lang,
    force: opts.force,
    orchestrator,
  });

  await write(`\n${written.length} arquivo(s) escritos em ${destino}\n`);
  if (overwritten.length > 0) {
    await write(`${overwritten.length} sobrescrito(s) por --force\n`);
  }
  await write(`Perfil de orquestração: ${orchestrator}\n`);
  await write('\nComece por CLAUDE.md (ou AGENTS.md) e .specs/README.md.\n');
  return 0;
}

try {
  process.exitCode = await main();
} catch (erro) {
  if (erro instanceof InitRefused) {
    await write(`\n${erro.message}\n`);
    if (erro.code === 'JA_INICIALIZADO') {
      await write('Use --force para instalar por cima, ciente de que arquivos serão sobrescritos.\n');
    }
    if (erro.details.conflicts) {
      for (const c of erro.details.conflicts.slice(0, 10)) await write(`  ${c}\n`);
      const resto = erro.details.conflicts.length - 10;
      if (resto > 0) await write(`  … e mais ${resto}\n`);
    }
    process.exitCode = 1;
  } else {
    throw erro;
  }
}
