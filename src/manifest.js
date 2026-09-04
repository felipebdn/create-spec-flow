import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

/** Raiz do pacote instalado — o diretório que contém package.json. */
export const packageRoot = resolve(here, '..');

/**
 * Onde moram os templates distribuídos.
 *
 * Fora da raiz de propósito. `CLAUDE.md` e `.claude/skills/` têm **autoridade automática**: o agente
 * carrega os dois sem ninguém pedir. Com o template na raiz, quem abrisse este repositório para
 * mexer no **pacote** herdava as instruções e as skills de um fluxo que o pacote não usa — e a skill
 * de criar mudança chega a disparar por descrição, escrevendo dentro do template alheio.
 */
export const templateRoot = join(packageRoot, 'template');

/**
 * O que o `init` copia, e **só** isto.
 *
 * A lista é explícita em vez de "copie tudo menos X" de propósito: uma regra de exclusão erra por
 * omissão — arquivo novo entraria no projeto de quem instala sem ninguém decidir que devia.
 *
 * `.claude/settings.local.json` nunca esteve aqui: é configuração de máquina, e uma lista de
 * permissões herdada por um projeto alheio é decisão que não nos cabe tomar.
 */
export const TEMPLATE_ENTRIES = ['CLAUDE.md', '.specs', '.claude/skills'];

export const ORCHESTRATOR_PROFILES = Object.freeze(['none', 'manual', 'mcp']);
export const DEFAULT_ORCHESTRATOR = 'manual';

/** Files omitted from profiles that deliberately do not install an orchestrator. */
export function templateFilter(profile = DEFAULT_ORCHESTRATOR) {
  return (rel) => {
    if (profile === 'none' && /\.specs\/(EXECUTAR-TODAS|RUN-ALL)\.md$/.test(rel)) return false;
    if (profile !== 'mcp' && rel === '.specs/orchestrator.json') return false;
    return true;
  };
}

/**
 * Os idiomas disponíveis, e o papel de cada arquivo cujo **nome** muda entre eles.
 *
 * Nome de arquivo e de skill é conteúdo, não embalagem: uma skill chamada `spec-nova-mudanca` num
 * template em inglês obrigaria quem usa a ler português para saber o que invocar. Por isso os dois
 * lados têm a mesma **forma** e caminhos diferentes — e a paridade é conferida por papel, nunca por
 * igualdade de caminho.
 */
export const LANGUAGES = {
  'pt-BR': {
    label: 'português do Brasil',
    root: join(templateRoot, 'pt-BR'),
    orchestrator: '.specs/EXECUTAR-TODAS.md',
  },
  en: {
    label: 'English',
    root: join(templateRoot, 'en'),
    orchestrator: '.specs/RUN-ALL.md',
  },
};

export const DEFAULT_LANGUAGE = 'pt-BR';

export function languageRoot(lang) {
  const entry = LANGUAGES[lang];
  if (!entry) {
    const known = Object.keys(LANGUAGES).join(', ');
    throw new Error(`Idioma desconhecido: ${lang}. Disponíveis: ${known}.`);
  }
  return entry.root;
}
