# Decisões arquiteturais

Registro append-only. Cada decisão entra uma vez, com data e motivo. Decisão que
for revertida **não é apagada**: acrescenta-se uma nova entrada que a substitui,
com link para a original. O histórico do porquê é o valor deste arquivo.

Só entra aqui o que atravessa mudanças. Detalhe que vale para uma mudança só fica
no `spec.md` dela.

> **Este arquivo tem teto — skill `spec-tetos-e-poda`.** Ele é lido em toda mudança, então o tamanho
> dele é imposto a todo trabalho futuro. A poda acontece **na leitura**, e só na skill
> `spec-nova-mudanca`. Execução e arquivamento conferem e avisam, nunca podam.

---

## D001 — Adotar desenvolvimento guiado por especificação

- **Data:** 2026-08-24
- **Contexto:** Projeto novo, trabalho conduzido majoritariamente por agente. Sem
  um registro externo, o contexto de cada decisão morre no fim da sessão e a
  sessão seguinte reconstrói tudo por adivinhação.
- **Decisão:** Toda unidade de trabalho é especificada em `.specs/changes/` antes
  de virar código. Padrões recorrentes de implementação viram skills em
  `.claude/skills/`.
- **Alternativas descartadas:**
  - *Prompt livre por sessão* — rápido no começo, mas o projeto perde
    rastreabilidade e a arquitetura deriva a cada sessão.
  - *Só issues do repositório* — descrevem a tarefa, mas não o padrão de código
    que a implementação deve seguir.
- **Consequência:** Custo fixo por mudança (escrever a spec antes). Em troca:
  execução reproduzível, revisão possível antes do código existir, e contexto que
  sobrevive à troca de sessão ou de pessoa.

---

## D002 — <título da próxima decisão>

- **Data:**
- **Contexto:**
- **Decisão:**
- **Alternativas descartadas:**
- **Consequência:**
