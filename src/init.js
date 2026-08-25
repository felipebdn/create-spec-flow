import { resolve } from 'node:path';
import { copyTemplate, alreadyInitialized, InitRefused } from './copy.js';
import { TEMPLATE_ENTRIES, LANGUAGES, DEFAULT_LANGUAGE, languageRoot } from './manifest.js';

/**
 * Instala o fluxo em um projeto.
 *
 * Puro em relação à interface: não lê `process.argv`, não escreve em `stdout`, não pergunta nada.
 * Quem conversa com o usuário é `bin/create-spec-flow.js`. É o que torna as recusas testáveis sem simular
 * terminal.
 */
export async function init({ target = process.cwd(), lang = DEFAULT_LANGUAGE, force = false } = {}) {
  const destino = resolve(target);

  if (!LANGUAGES[lang]) {
    throw new InitRefused(
      'IDIOMA_DESCONHECIDO',
      `Idioma desconhecido: ${lang}. Disponíveis: ${Object.keys(LANGUAGES).join(', ')}.`,
      { lang },
    );
  }

  if ((await alreadyInitialized(destino)) && !force) {
    throw new InitRefused(
      'JA_INICIALIZADO',
      'Este projeto já tem `.specs/`. Nada foi escrito.',
      { target: destino },
    );
  }

  const { written, overwritten } = await copyTemplate({
    from: languageRoot(lang),
    to: destino,
    entries: TEMPLATE_ENTRIES,
    force,
  });

  return { target: destino, lang, written, overwritten };
}

export { InitRefused, LANGUAGES, DEFAULT_LANGUAGE, TEMPLATE_ENTRIES };
