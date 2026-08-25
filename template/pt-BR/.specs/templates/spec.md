---
id: NNN-slug
titulo: "Título legível da mudança"
status: todo # todo | in-progress | done
depende_de: [] # ex.: ["002-registrar-usuario"]
criado_em: AAAA-MM-DD
---

# NNN — Título legível da mudança

> **Este arquivo tem teto, em linhas e em número de critérios de aceite — skill
> `spec-tetos-e-poda`.** Estourou, são duas mudanças, encadeadas por `depende_de`. Não encolha
> cortando critério verificável nem comando de validação: o excesso quase sempre é prosa já dita em
> outro lugar, ou escopo de outra mudança. Apague esta nota ao preencher.

## Problema

Qual é a situação hoje e por que ela não serve. Descreva o problema do ponto de
vista de quem usa o sistema, não da solução técnica.

## Objetivo

Uma frase: qual é o estado desejado depois desta mudança.

## Escopo

**Dentro:**

- Item concreto que esta mudança entrega.

**Fora:**

- Item explicitamente adiado, com o motivo ou a mudança futura que cuida dele.

## Requisitos

| # | Requisito | Obrigatório |
|---|---|---|
| R1 | O sistema deve ... | sim |
| R2 | O sistema deve ... | não |

## Critérios de aceite

Escreva cada critério como algo verificável — um comando que roda, uma tela que
aparece, uma resposta de API com formato conhecido. Se não dá para checar, não é
critério de aceite.

- [ ] CA1: dado ..., quando ..., então ...
- [ ] CA2: dado ..., quando ..., então ...

## Decisões

Registre aqui apenas o que já está fechado. Questão em aberto se escreve como
questão em aberto, nunca como decisão.

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| ... | ... | ... |

## Questões em aberto

- [ ] Pergunta que ainda bloqueia ou pode mudar o desenho.

## Referências

- `.specs/shared/convencoes.md`
- `.specs/memory/decisoes.md`
