---
name: spec-executar-mudanca
description: Implementa uma mudança já especificada em .specs/changes/, seguindo plan.md e marcando tasks.md. Use quando o usuário pedir para executar, implementar ou "fazer" uma mudança da fila (por número ou por nome). Para rodar a fila inteira, use .specs/EXECUTAR-TODAS.md.
---

# Executar mudança

Implementa **uma** mudança da fila, do começo ao fim, com validação real.

## 1. Carregar contexto

Nesta ordem:

1. `.specs/memory/` — stack e decisões.
2. `.specs/shared/` — convenções e glossário.
3. `spec.md`, `plan.md`, `tasks.md` da mudança.
4. As skills citadas no `plan.md`.

**Confira o tamanho do `memory/` — `wc -l`, nada além disso.** Passou do teto, **avise no resumo
final** que a poda vence na próxima `spec-nova-mudanca`. **Podar não é sua função**, e conferir é —
os números e o porquê da assimetria estão na skill `spec-tetos-e-poda`.

## 2. Checar bloqueios

- `depende_de` com alguma mudança que não está `done`: pare e avise.
- Questão em aberto que afeta requisito obrigatório: pare e pergunte. Não
  adivinhe.
- Questão em aberto que não afeta requisito obrigatório: siga com a opção mais
  conservadora e anote a suposição em **Notas de execução**.
- `spec.md` e `plan.md` se contradizem: `spec.md` vence; corrija o `plan.md`
  antes de começar.

## 3. Marcar início

`status: todo` vira `status: in-progress` no `spec.md`.

## 4. Implementar

- Siga a sequência do `plan.md`.
- Antes de escrever qualquer código de um tipo já padronizado, procure a skill
  correspondente em `.claude/skills/` e aplique o molde dela. Consistência com o
  padrão existente vale mais do que a sua preferência pessoal de desenho.
- Se não houver skill para um padrão que vai se repetir, implemente e sinalize no
  relatório final que vale criar a skill.
- Marque cada tarefa `[x]` no `tasks.md` no momento em que ela termina — não tudo
  no final.

## 5. Escopo

O `spec.md` é o contrato. Trabalho necessário que apareceu no caminho e não está
lá **não entra nesta mudança**: crie uma nova mudança no fim da fila e siga. Uma
exceção só: correção trivial que é pré-requisito imediato do passo atual — faça,
e registre em **Notas de execução**.

Reduzir escopo também não é decisão sua. Se uma parte estiver bloqueada, entregue
todo o resto por completo e diga explicitamente o que ficou de fora e por quê.

## 6. Validar

- Rode os comandos de "Como validar" do `plan.md`. Rodar de verdade — não assuma
  que passa porque o código parece certo.
- Confira cada critério de aceite do `spec.md` e marque só os que você verificou.
- Falhou: corrija e rode de novo, até 3 tentativas. Persistindo, pare, deixe em
  `in-progress` e relate a linha decisiva do erro.

Teste que você mesmo escreveu e que passa não prova que o critério de aceite foi
atendido — confira o critério, não o teste.

## 6b. Sabotar

Todo critério de aceite que afirma uma **garantia** — recusa, restrição, validação, guard,
isolamento, caminho de erro — passa pela rodada de sabotagem antes de ser marcado. O procedimento
completo está no passo 6 do `.specs/EXECUTAR-TODAS.md`, e vale igual aqui: remover a proteção, rodar
a suíte inteira, **anotar o nome de cada teste que caiu** na seção `## Sabotagem` do `tasks.md`,
desfazer, confirmar verde.

Suíte verde não distingue "protegido" de "nunca testado". Nada caiu, ou caiu pelo motivo errado: o
critério não fecha. Garantia que se escolheu não sabotar entra em "Garantias sem rodada" com o
motivo — declarada, nunca calada.

## 7. Fechar

Só com todos os critérios de aceite marcados:

- **Notas de execução** no `tasks.md`: desvios, suposições, surpresas.
- Decisão nova que o `spec.md` não previa vai para `.specs/memory/decisoes.md`.
- Contrato que a próxima mudança vai consumir sobe para `.specs/shared/`.
- `status: done` no `spec.md`.
- Não arquive. Arquivamento é decisão do usuário, via `spec-arquivar-mudanca`.

## 8. Reportar

- O que foi implementado, em uma ou duas frases.
- Comandos rodados e resultado real de cada um.
- Suposições assumidas.
- O que ficou fora e por quê.
- Skills que valeria criar, se você repetiu um padrão sem molde.

Se algo falhou, diga que falhou, com a saída. Relatório otimista sobre código
quebrado é o pior resultado possível deste fluxo.
