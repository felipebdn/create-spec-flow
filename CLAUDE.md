# create-spec-flow — instruções do repositório

Este repositório é o **pacote** `create-spec-flow`, que instala um fluxo de desenvolvimento guiado por
especificação em outros projetos.

> **Este arquivo é do pacote, não do template.** O `CLAUDE.md` que vai para o projeto de quem
> instala mora em `template/pt-BR/CLAUDE.md` e `template/en/CLAUDE.md`. Editar um não edita o outro,
> e é assim de propósito: as regras de construir a ferramenta não são as regras de usar o fluxo que ela instala.

## O que este repositório não faz

**Não usa o próprio fluxo que distribui.** Não existe `.specs/` na raiz e não há fila de mudanças
para o pacote. Uma pasta em `.specs/changes/` aqui viraria trabalho pendente dentro do projeto de
todo mundo que instalasse. O registro de decisões do pacote vive em artefatos Traycer.

**As skills em `template/*/.claude/skills/` não valem aqui.** Elas são conteúdo distribuído. Se
alguma aparecer na sua lista de skills disponíveis enquanto você trabalha no pacote, é vazamento —
foi exatamente o defeito que motivou tirar o template da raiz.

## Estrutura

```
bin/create-spec-flow.js  conversa com o terminal — argv, prompt, mensagens, código de saída
src/init.js         a operação; pura em relação à interface, não lê argv nem escreve em stdout
src/copy.js         plano de cópia, recusas, cópia tudo-ou-nada
src/manifest.js     o que se copia, e onde mora cada idioma
template/pt-BR/     o template distribuído, em português
template/en/        o mesmo template, em inglês
test/               node:test
```

## Stack

Node ESM, **zero dependências**, sem passo de build. Um scaffolder rodado por `npx` paga a latência
de instalar as dependências dele em toda execução, e a lógica inteira é cópia de arquivo mais um
prompt. `parseArgs` e `readline/promises` vêm do próprio Node.

Dependência nova exige justificativa escrita. A ausência delas é uma propriedade do produto, não um
acidente.

| Intenção | Comando |
|---|---|
| Testes | `npm test` |
| Conferir o tarball | `npm run pack:check` |
| Declarar os dois idiomas em sincronia | `npm run i18n:sync` |

## Como a paridade entre idiomas é detectada

Sem comparador semântico. Três camadas em `src/parity.js`, que medem o que **não** se traduz:

| Camada | Pega | Não pega |
|---|---|---|
| **Forma** — árvore de títulos, blocos de código, linhas de tabela, checkboxes, nº de campos do frontmatter | seção, regra ou checkbox acrescentado de um lado só | reescrita dentro de um parágrafo |
| **Número carregado** — dígito dentro de crase, prefixado por `~`, ou seguido de `%` | teto, código de status ou identificador trocado de um lado | qualquer coisa sem número |
| **Lock de hash** — `PARITY.lock.json` | **tudo**, inclusive reescrita pura | nada — mas não diz *o quê* mudou |

As duas primeiras dão o diagnóstico; a terceira é a rede. Nenhuma é redundante: uma reescrita que não
mexe em título nem em número só existe para o lock.

**Número soletrado fica de fora de propósito.** `3 dígitos` versus `three-digit` é tradução legítima,
e foi o único falso positivo quando a regra era "todo dígito". A crase pode atravessar quebra de
linha — prosa com wrap produz isso o tempo todo, e um extrator linha a linha desalinha o pareamento
do arquivo inteiro a partir da primeira ocorrência.

**Nome de arquivo e de skill é conteúdo traduzível**, não embalagem. O mapa está em `ROLE_NAMES`, em
`src/parity.js`. Papel novo com nome diferente entre idiomas entra lá, ou vira órfão.

## Regras

- **Os dois idiomas mudam juntos, e a suíte cobra.** Alteração em `template/pt-BR/` sem a
  correspondente em `template/en/` fica vermelha. Editou os dois, leia os dois e rode
  `npm run i18n:sync` — regravar o lock é um **ato de declaração**: você está afirmando que os dois
  dizem a mesma coisa. O mecanismo não impede a mentira; ele obriga a mentira a ser escrita e datada
  em vez de acontecer por omissão. Mesmo desenho da regra de sabotagem do fluxo que distribuímos.
- **A paridade entre idiomas é por papel, não por caminho.** Nome de arquivo e de skill é conteúdo
  traduzível: `EXECUTAR-TODAS.md` é `RUN-ALL.md`, `spec-nova-mudanca` é `spec-new-change`. Quem
  precisar do nome de um papel lê `LANGUAGES` em `src/manifest.js`.
- **O que se copia é lista explícita** em `TEMPLATE_ENTRIES`, nunca regra de exclusão. Regra de
  exclusão erra por omissão, e o erro dela é vazar arquivo para o projeto de quem instala.
- **`init` não conversa com o terminal.** Quem lê `argv` e escreve em `stdout` é `bin/create-spec-flow.js`.
  É o que torna as recusas testáveis sem simular TTY.
- **Toda recusa tem teste, e todo teste de recusa afirma que nada foi escrito.** Recusar depois de
  escrever metade é pior que não ter começado.
- **O tarball se testa contra o `npm pack`, não contra o disco.** `init` copia da árvore de trabalho
  e fica verde mesmo quando o pacote publicado sai sem o template — quem instalasse receberia um
  comando que roda, não acusa nada e não escreve arquivo nenhum.
- **Garantia só está protegida se removê-la derrubar teste nomeado.** Vale aqui como vale no template
  que distribuímos: antes de considerar uma recusa entregue, remova-a, rode a suíte inteira e anote o
  nome de cada teste que caiu.
