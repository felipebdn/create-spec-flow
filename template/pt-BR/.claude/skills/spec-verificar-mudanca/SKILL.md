---
name: spec-verificar-mudanca
description: Confere o código implementado contra os critérios de aceite de uma mudança em .specs/changes/ e produz um relatório por severidade. Use quando o usuário pedir para verificar, revisar ou auditar uma mudança já implementada, ou antes de arquivá-la.
---

# Verificar mudança

Auditoria de uma mudança implementada contra a especificação dela. O trabalho é
procurar divergência, não confirmar que está tudo bem.

## Postura

Você está verificando, provavelmente, código que o próprio fluxo escreveu.
Comece do princípio de que **algum** critério de aceite está marcado sem ter sido
realmente verificado — é a falha mais comum deste tipo de fluxo. Ache qual.

Não repare nada aqui. Verificação só relata; a correção é passo separado, com o
usuário decidindo.

## Procedimento

1. Leia `spec.md` (critérios de aceite e requisitos) e `plan.md` (contratos e
   comandos de validação).
2. Leia o código que a mudança tocou. Compare com os arquivos que o `plan.md`
   dizia que seriam tocados: arquivo alterado fora da lista é escopo vazado e
   entra no relatório.
3. Rode os comandos de "Como validar". Rode de verdade. Se um comando não existe
   ou não roda, isso já é um achado alto.
4. Percorra os critérios de aceite um a um e verifique cada um de forma
   independente do teste que o implementador escreveu.
5. **Confira a coerência interna da mudança** e **audite o registro de sabotagem** — as duas seções seguintes.
6. Confira aderência a `.specs/shared/convencoes.md`.
7. Confira se `memory/` e `shared/` foram atualizados quando deveriam.
8. Confira os tetos da skill `spec-tetos-e-poda` — `wc -l` em `decisoes.md`, `stack.md` e no
   `spec.md` da mudança, mais a contagem de critérios de aceite. Arquivo acima do teto é achado de
   severidade **média**: não quebra nada hoje, e encarece toda sessão futura. Você não poda —
   relata, e a poda vence na próxima `spec-nova-mudanca`.

## Coerência interna da mudança

Antes de olhar código. `spec.md`, `plan.md` e `tasks.md` têm de concordar **entre si**, e a
conferência é de tabela cruzada — não de leitura corrida.

| Pergunta | Severidade quando falha |
|---|---|
| Todo critério de aceite tem tarefa que o produz? | **alta** — critério sem tarefa fica marcado por engano ou nunca fecha |
| Todo critério que afirma garantia tem rodada de sabotagem, ou declaração com motivo? | **alta** |
| Toda tarefa serve a algum critério? | **média** — o que sobra é escopo que ninguém pediu |
| Todo arquivo listado no `plan.md` tem tarefa que o toca? | **média** |
| Toda citação de `CAn` aponta para o critério que ela descreve? | **alta** |

**As duas primeiras perguntas são a direção que se esquece.** Conferir que toda citação de `CAn`
resolve é fácil e passa verde com facilidade; conferir que todo critério é **alcançado** por alguma
tarefa é a direção contrária, e é onde o buraco mora. Medido: uma revisão consertou `spec.md` e
`plan.md` sem descer para o `tasks.md`, dois critérios ficaram sem nada que os produzisse, e a
conferência de citações não viu — todas existiam.

**Renumerar é o que quebra a última.** Citação a critério que **existe** mas mudou de significado
sobrevive a qualquer conferência mecânica, porque o número resolve. Só releitura do texto do critério
pega.

**Isto é mais barato antes de implementar.** Rodado depois, ainda pega — mas o trabalho já foi feito
sobre um plano incoerente.

## Auditoria da sabotagem

**Você não executa sabotagem.** Sabotar é editar código, e verificação não escreve — nem para
desfazer depois. O que você audita é o **registro**: a seção `## Sabotagem` do `tasks.md`, que diz o
que foi removido, o que caiu e por qual motivo caiu. Ela é a única prova que sobrevive, porque a
sabotagem foi desfeita antes do commit.

Monte três listas e feche-as uma contra a outra:

1. Os critérios de aceite do `spec.md` que **afirmam garantia** — recusa, restrição, validação,
   guard, isolamento, caminho de erro. Você decide quais são; não confie na lista do implementador.
2. As rodadas que a tabela de `## Sabotagem` registra.
3. As garantias que a seção "Garantias sem rodada" declara, com motivo.

Cada buraco entre as três tem um destino:

| Situação | Severidade |
|---|---|
| Critério afirma garantia, marcado como atendido, e nenhuma rodada o cobre | **alta** |
| Rodada registrada sem **nome** de teste caído | **alta** — "a suíte caiu" não prova que caiu a proteção certa |
| A rodada diz que **nada caiu** | **alta** — a garantia não está protegida por teste nenhum |
| A rodada caiu por motivo que não bate com o que o critério afirma | **alta** — conta como ruído, não como proteção |
| A rodada removeu comentário, arquivo morto ou código não executado | **alta** — mediu nada |
| Garantia deixada de fora **com motivo escrito** | — legítimo; repita a declaração no relatório para continuar revisável |
| Garantia deixada de fora **sem dizer nada** | **média** — ausência calada passa por cobertura |
| Repositório ou suíte deixados no estado sabotado | **alta** |

**Cite a linha do registro** que sustenta cada veredito — `tasks.md:<linha>` e o nome do teste —,
como o relatório exige de qualquer achado.

Sabotagem que a mudança previa para um critério ainda não atendido não é achado: é trabalho restante.

## Severidade

| Nível | Significado |
|---|---|
| **alta** | Critério de aceite marcado que não se sustenta; requisito obrigatório não atendido; comando de validação que falha ou não existe. |
| **média** | Requisito opcional ignorado sem registro; violação de convenção; contrato divergente do `plan.md`; escopo vazado. |
| **baixa** | Ruído de estilo, nome fora do padrão, comentário que explica o "o quê". |

Estilo que não muda comportamento é sempre baixa. Não infle severidade para dar
peso ao relatório.

## Relatório

Uma linha por achado:

```
<caminho>:<linha> — [alta|média|baixa] <o problema>. <o que fazer>.
```

Depois da lista, uma tabela dos critérios de aceite:

| Critério | Situação | Evidência |
|---|---|---|
| CA1 | atendido / não atendido / não verificável | comando rodado e saída, ou o que falta |

"Não verificável" é um resultado legítimo e importante: significa que o critério
foi escrito de forma que não dá para checar, e a spec é que precisa mudar.

Depois dela, uma tabela do registro de sabotagem — **sempre**, mesmo quando ele está completo. É a
única saída visível da auditoria do registro, e auditoria sem saída visível é auditoria que não
aconteceu.

| Garantia | Rodada registrada | Testes nomeados | Veredito |
|---|---|---|---|
| CA1 — ... | sim / não / declarada sem rodada | os nomes, ou o que falta | provado / não provado / declarado |

Se nada foi encontrado, diga isso em uma linha e liste o que você de fato
executou para chegar nessa conclusão. Aprovação sem evidência do que foi rodado
não vale nada.
