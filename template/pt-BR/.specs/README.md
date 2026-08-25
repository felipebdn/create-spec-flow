# .specs — Desenvolvimento guiado por especificação

Este diretório é a fonte de verdade sobre **o que** o projeto faz e **por que** ele
faz assim. O código responde "como está implementado hoje"; o `.specs/` responde
tudo o que o código não consegue expressar: intenção, alternativas descartadas,
critérios de aceite e a ordem em que o trabalho deve acontecer.

Regra central: **contexto vira arquivo, não conversa**. Uma sessão nova de agente
reconstrói todo o contexto lendo este diretório.

## Estrutura

| Pasta | Papel |
|---|---|
| `changes/` | Fila de mudanças numeradas. Cada pasta é uma unidade de trabalho especificada antes de codar. |
| `archive/` | Mudanças concluídas e verificadas. Saem da fila ativa, mas continuam legíveis como histórico de decisões. |
| `memory/` | Contexto que atravessa mudanças: decisões arquiteturais, stack escolhida, restrições. |
| `shared/` | Contratos e convenções que várias mudanças consomem: nomenclatura, formato de erro, glossário de domínio. |
| `domain/` | Regra de produto por domínio, mais invariantes e fórmulas. **Lido seletivamente** — só o domínio que a mudança toca — e por isso sem teto. |
| `templates/` | Moldes de `spec.md`, `plan.md` e `tasks.md`. Toda mudança nova nasce daqui. |
| `EXECUTAR-TODAS.md` | Orquestrador. Roda a fila inteira em ordem, com validação entre mudanças. |

## Anatomia de uma mudança

```
.specs/changes/007-cadastro-de-ideia/
├── spec.md    # O QUÊ e o PORQUÊ — requisitos e critérios de aceite. Sem código.
├── plan.md    # O COMO — arquivos tocados, sequência técnica, riscos.
└── tasks.md   # A EXECUÇÃO — checklist marcável, mais o registro de sabotagem.
```

O `tasks.md` é o único dos três que se escreve **durante** o trabalho. É lá que fica o registro de
sabotagem: para todo critério de aceite que afirma uma garantia, o que foi removido e o nome de cada
teste que caiu. Suíte verde não distingue "protegido" de "nunca testado" — a rodada de sabotagem é o
que fecha essa diferença, e o nome do teste é a única prova que sobrevive, porque a sabotagem é
desfeita antes do commit.

O `status` fica no frontmatter do `spec.md`: `todo`, `in-progress`, `done`.

## Convenção de numeração

- Prefixo de 3 dígitos, ordem de execução: `001-`, `002-`, ...
- Sufixo de letra quando uma feature é fatiada por camada e as fatias precisam
  rodar em sequência: `012a-dashboard-backend`, `012b-dashboard-frontend`.
- O slug é descritivo e em português, separado por hífen.

O contador sequencial pressupõe uma pessoa mantendo a fila. Se o projeto virar
trabalho de time, troque o prefixo numérico por um ID estável (data ou ticket)
para evitar dois `007` conflitantes em branches diferentes.

## Tetos

Todo arquivo lido por inteiro em toda sessão impõe o próprio tamanho a todo trabalho futuro. Por
isso estes números não são preferência de estilo: são o que impede o custo por sessão de crescer
sozinho.

| Arquivo | Estourou o teto |
|---|---|
| `spec.md` de uma mudança | parte em duas mudanças, encadeadas por `depende_de` |
| `memory/decisoes.md` e `memory/stack.md` | poda na próxima leitura |

A conferência acontece **na leitura**, nunca na escrita — esses arquivos são lidos sempre e escritos
raramente, e checar na escrita os deixaria crescer sem ninguém olhando. **Quem poda é só a skill
`spec-nova-mudanca`**; execução, arquivamento e verificação conferem e avisam.

**Os números vivem em um lugar só: a skill `spec-tetos-e-poda`.** É lá também que estão como partir
uma mudança sem errar o corte, o que sai na poda, e por que só quem planeja poda.

## Fluxo

```
pedido ──► PORTÃO ──► changes/NNN-slug/ ──► execução ──► verificação ──► archive/
              ▲                                               │
              └──────────── memory/ + shared/ ◄───────────────┘
```

O **portão** é a checagem de prontidão da skill `spec-nova-mudanca`: antes de qualquer arquivo ser
criado, o que ainda está vago, o que foi inferido em silêncio, o que veio do `memory/` e do
`shared/`, quais skills são o molde e quais critérios vão exigir sabotagem vão para uma mensagem
visível — e a mudança só é escrita depois de o usuário responder. Ele não é pulável nem quando o
pedido parece óbvio; nesse caso ele é curto, não ausente.

## Skills relacionadas

As skills em `.claude/skills/` são o "como fazer" operacional deste fluxo:

- `spec-nova-mudanca` — cria uma pasta de mudança a partir dos templates.
- `spec-executar-mudanca` — implementa uma mudança já especificada.
- `spec-verificar-mudanca` — confere implementação contra os critérios de aceite.
- `spec-arquivar-mudanca` — move a mudança concluída e registra o aprendizado.
