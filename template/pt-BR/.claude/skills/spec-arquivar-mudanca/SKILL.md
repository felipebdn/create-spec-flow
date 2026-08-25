---
name: spec-arquivar-mudanca
description: Move uma mudança concluída de .specs/changes/ para .specs/archive/, promovendo antes o aprendizado para memory/ e shared/. Use quando o usuário pedir para arquivar, fechar ou limpar mudanças já concluídas da fila.
---

# Arquivar mudança

Tira da fila ativa o que já acabou, sem perder o porquê.

Arquivar não é apagar. É mover para onde não polui a fila, mas continua legível
como histórico. Nunca delete uma pasta de mudança.

## Pré-condições

Não arquive sem todas estas:

- [ ] `status: done` no `spec.md`.
- [ ] Todos os critérios de aceite marcados.
- [ ] Todas as tarefas do `tasks.md` marcadas.
- [ ] Toda garantia ou sabotada com teste nomeado, ou declarada sem rodada e com o motivo.
- [ ] `walkthrough.md` escrito, com ordem de revisão por risco e verificação medida.
- [ ] Nenhuma questão em aberto pendente.
- [ ] Nenhuma outra mudança em `todo` declara `depende_de` esta e ainda precisa
      consultá-la ativamente (arquivar não quebra a dependência, mas confirme que
      a dependente já tem o contrato de que precisa em `shared/`).

Faltando qualquer uma: pare, diga qual falta, não arquive.

## Promoção antes de mover

Este é o passo que dá valor ao arquivamento. Antes de mover, extraia o que
sobrevive à mudança:

1. **Decisões** — o que foi decidido e vale para além desta mudança vai para
   `.specs/memory/decisoes.md`, com data, alternativa descartada e motivo.
2. **Contratos** — assinatura, formato de erro, schema que outra mudança vai
   consumir sobe para `.specs/shared/`.
3. **Regra de domínio** — regra que passa a valer além desta mudança sobe para o arquivo do domínio
   em `.specs/domain/`, criando o arquivo se ele não existir. Invariante nova ganha número, e o
   número é congelado a partir daí.
4. **Vocabulário** — termo de domínio novo entra em `.specs/shared/glossario.md`.
4. **Stack** — dependência nova entra em `.specs/memory/stack.md`.
5. **Padrão repetido** — se a implementação criou um molde que vai se repetir,
   sugira criar uma skill em `.claude/skills/`. Sugira; não crie sem aprovação.

Depois de arquivada, ninguém vai procurar contrato dentro da pasta arquivada. O
que não subir agora, some na prática.

**Ao acrescentar em `memory/`, confira o tamanho** — `wc -l`. Passou do teto, acrescente mesmo assim
e **avise no relatório** que a poda vence na próxima `spec-nova-mudanca`. Não pode aqui: promover é
acrescentar, e escolher o que sai é outra decisão. Ver skill `spec-tetos-e-poda`.

## Mover

```bash
mv .specs/changes/NNN-slug .specs/archive/NNN-slug
```

Mantenha o prefixo numérico. O número **não** é reaproveitado por mudanças
futuras.

## Ao terminar

Reporte: o que foi arquivado, o que foi promovido para `memory/` e `shared/`,
e o que continua na fila ativa.
