# EXECUTAR-TODAS

Orquestrador manual da fila. Use com `Siga @.specs/EXECUTAR-TODAS.md`. Cada papel recebe contexto
frio; nenhum agente executor vira o próprio revisor.

## Contexto obrigatório

Leia `CLAUDE.md` ou `AGENTS.md`, `.specs/README.md`, `memory/`, convenções e glossário. Leia apenas
os arquivos de `shared/contratos/` e `domain/` relacionados à mudança atual.

## Papéis

| Papel | Responsabilidade | Escrita permitida |
|---|---|---|
| Orquestrador | Selecionar, transicionar, persistir relatórios e parar nos portões | Artefatos do fluxo |
| Executor | Implementar `spec.md`, `plan.md` e `tasks.md`; validar e sabotar | Código e `tasks.md` |
| Revisor | Auditar o commit contra todos os critérios | Nenhuma |
| Remediador | Corrigir somente os achados da revisão | Código e `tasks.md` |
| Arquivador | Produzir walkthrough, promover aprendizado e mover a mudança | `.specs/` |

Use processos ou subagentes novos para cada papel. Não faça fork do contexto do executor para o
revisor. Se `.specs/orchestrator.json` existir, respeite o mapeamento de adaptadores; sem ele, use
agentes frios disponíveis no cliente atual.

## Seleção e dependências

1. Ordene `.specs/changes/` pelo prefixo numérico e sufixo de letra.
2. Escolha a primeira mudança em `ready`, `changes-requested` ou `blocked` explicitamente retomada.
3. Considere satisfeita somente dependência `verified`, `archive-approved` ou já em `archive/`.
4. Questão em aberto que altera requisito obrigatório interrompe a fila e volta ao usuário.

## Ciclo por mudança

1. Transicione `ready` ou `changes-requested` para `executing` e incremente `attempt`.
2. Entregue ao executor apenas instruções do projeto, arquivos da mudança e contexto seletivo.
3. O executor implementa, valida e sabota. O orquestrador grava o resultado em
   `execution-report.md` e copia o arquivo para `runs/NNN/execution-report.md`.
4. Em falha recuperável, transicione para `blocked`; em sucesso, para `awaiting-review`.
5. Transicione para `reviewing` e entregue a um revisor frio o commit, a spec, o plano, as tarefas e
   o relatório. O orquestrador grava `review.md` e `runs/NNN/review.md`.
6. Veredito `changes-requested` volta a um remediador frio. Depois de 3 remediações sem aprovação,
   transicione para `blocked` e pare.
7. Veredito aprovado transiciona para `verified`. Só então produza `walkthrough.md`.
8. Pare no portão humano. Após aprovação explícita, transicione para `archive-approved`, execute a
   skill `spec-arquivar-mudanca` com agente frio e finalize em `archived`.

Toda transição deve ser persistida antes de disparar o próximo papel. Em retomada, confie nos
artefatos e commits, não na conversa anterior. Nunca trate `awaiting-review` como conclusão.

## Relatório final

| Mudança | Estado | Tentativa | Commit | Observação |
|---|---|---|---|---|

Liste também suposições, decisões promovidas, mudanças criadas, bloqueios e o próximo portão.
