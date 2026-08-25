# create-spec-flow

Instancia um fluxo de desenvolvimento guiado por especificação em qualquer projeto.

```bash
npx create-spec-flow
```

Disponível em português e inglês — `--lang pt-BR` ou `--lang en`, ou escolha no prompt.

## O problema

Contexto de agente morre no fim da sessão. Na sessão seguinte, a decisão que você discutiu por vinte
minutos não existe mais, e o agente reconstrói por adivinhação — geralmente diferente. Ao longo de
dez features, a arquitetura deriva sem ninguém ter decidido que devia derivar.

O fluxo que este pacote instala põe esse contexto em arquivo, com regras que impedem os três jeitos
conhecidos de o registro apodrecer: spec escrita sem perguntar, arquivo crescendo até ninguém ler, e
critério de aceite marcado sem ter sido verificado.

## O que ele escreve no seu projeto

```
CLAUDE.md          as regras que todo agente lê primeiro
.specs/
├── changes/       a fila de mudanças, numerada. Nasce vazia
├── archive/       o que já fechou, legível como histórico
├── memory/        decisões arquiteturais e stack — o que atravessa mudanças
├── shared/        convenções de código e glossário de domínio
├── templates/     os moldes de spec.md, plan.md e tasks.md
└── EXECUTAR-TODAS.md   o orquestrador da fila
.claude/skills/    as seis skills do fluxo
```

Nada mais. Nenhum arquivo do próprio pacote, nenhuma configuração de máquina.

## As quatro ideias

**Especificação antes de código.** Trabalho novo vira uma mudança em `.specs/changes/NNN-slug/` com
três arquivos — `spec.md` (o quê e o porquê), `plan.md` (o como) e `tasks.md` (a execução) — antes de
virar implementação.

**Portão antes de spec.** Nenhum arquivo é criado antes de uma checagem de prontidão ter sido escrita
para você **e** respondida: o que ainda está vago, o que o agente inferiu em silêncio, o que veio do
contexto do projeto, e qual vocabulário ele ia inventar. Não é pulável nem quando o pedido parece
óbvio — aí ela é curta, não ausente.

**Teto em todo arquivo que é sempre lido.** `spec.md` vai até ~600 linhas ou ~10 critérios de aceite;
`memory/` até ~150 linhas por arquivo. Estourou, parte a mudança ou poda a memória. A poda acontece
na leitura, e só na skill de planejamento — quem executa confere e avisa, porque escolher o que sai
exige contexto que quem executa não tem.

**Garantia só está protegida se removê-la derrubar teste nomeado.** Critério de aceite que afirma uma
recusa, uma restrição ou um guard passa por uma rodada de sabotagem: remove a proteção, roda a suíte
inteira, anota **o nome de cada teste que caiu**, restaura. Nada caiu significa que a garantia não
está protegida por teste nenhum — suíte verde não distingue "protegido" de "nunca testado".

## Uso

```bash
npx create-spec-flow                     # no diretório atual, perguntando o idioma
npx create-spec-flow ./meu-projeto       # em outro diretório
npx create-spec-flow --lang en --yes     # sem perguntar nada
npx create-spec-flow --force             # instala por cima de um .specs/ existente
npx create-spec-flow init ./meu-projeto  # a mesma coisa, com o subcomando explícito
```

O `init` **recusa** rodar onde já existe `.specs/`, e recusa se qualquer arquivo do template já
existir — sem escrever nenhum. Sobrescrever em silêncio apagaria trabalho que ninguém pediu para
apagar.

## Depois de instalar

Comece pelo `CLAUDE.md` e pelo `.specs/README.md`. Preencha `memory/stack.md` com a stack real do
projeto, porque é dela que saem os comandos de validação de toda mudança.

A primeira mudança entra pela skill `spec-nova-mudanca` (`spec-new-change` em inglês).

## Feito para

Claude Code, pela convenção de `CLAUDE.md` e `.claude/skills/`. O `.specs/` em si é markdown puro e
serve a qualquer agente que consiga ler arquivo.

## Contribuindo

O que se distribui vive em `template/pt-BR/` e `template/en/` — fora da raiz de propósito.
`CLAUDE.md` e `.claude/skills/` têm autoridade automática sobre um agente: com o template na raiz,
quem abrisse este repositório para mexer no pacote herdava as instruções e as skills de um fluxo que
o pacote não usa.

Os dois idiomas mudam juntos, e a suíte cobra: alterar um lado sem o outro fica vermelho. Três
camadas detectam tradução defasada sem comparador semântico — forma (títulos, tabelas, checkboxes),
número carregado (tetos, códigos de status) e um lock de hash que pega até reescrita pura. Depois de
alterar os dois, `npm run i18n:sync` declara que continuam dizendo a mesma coisa.

Nome de arquivo e de skill é conteúdo traduzível, não embalagem: `ROLE_NAMES` em `src/parity.js` diz
o nome de cada papel em cada idioma.

Detalhes em `CLAUDE.md`, que aqui é do pacote e não do template.

## Licença

MIT
