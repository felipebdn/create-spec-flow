# Tarefas — NNN-slug

Checklist de execução. Cada linha é um passo pequeno o suficiente para ser feito
e verificado de uma vez. Marque `[x]` assim que o passo estiver concluído **e**
validado — nunca antes.

## Implementação

- [ ] T1 — ...
- [ ] T2 — ...

## Validação

- [ ] V1 — Rodar `<comando>` e confirmar que passa.
- [ ] V2 — Conferir cada critério de aceite do `spec.md` e marcá-lo lá também.

## Sabotagem

Obrigatória, e é a única prova que a suíte verde não dá. Todo critério de aceite que afirma uma
**garantia** — uma recusa, uma restrição, uma validação, um guard, uma regra de isolamento — só está
protegido se **removê-la derrubar teste nomeado**. Sem a rodada, "protegido" e "nunca testado" são
o mesmo verde.

Uma linha por rodada, preenchida no momento em que a rodada acontece — não no fim.

| # | Garantia | O que foi removido | Testes que caíram |
|---|---|---|---|
| S1 | CA_ — ... | `arquivo:linha` | `nome exato do teste`, `outro` |

**O nome do teste é o registro.** "Sabotei e a suíte caiu" não prova nada: não dá para saber se caiu
a proteção certa, e o teste que o critério afirma proteger pode nem existir. A sabotagem é desfeita
antes do commit, então esta tabela é a única prova que sobrevive.

- [ ] S0 — Toda rodada desfeita, suíte verde de novo, repositório limpo.

### Garantias sem rodada

Ausência declarada é revisável; ausência calada passa por cobertura. Uma linha por garantia que se
escolheu **não** sabotar, com o motivo.

- ...

## Registro

- [ ] L1 — Anotar em `.specs/memory/decisoes.md` qualquer decisão nova tomada
      durante a implementação que o `spec.md` não previa.
- [ ] L2 — Atualizar `.specs/shared/` se algum contrato virou reutilizável.
- [ ] L3 — Trocar o `status` do `spec.md` para `done`.

## Notas de execução

Espaço livre para o que apareceu no caminho: desvio do plano, bug encontrado,
suposição assumida. É isto que a próxima sessão vai ler para entender o porquê.
