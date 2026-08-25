# Instruções do projeto

Este projeto usa desenvolvimento guiado por especificação. O contexto vive em
arquivo, não na conversa.

## Antes de qualquer trabalho

Leia, nesta ordem:

1. `.specs/README.md` — como o fluxo funciona.
2. `.specs/memory/stack.md` — tecnologias e comandos permitidos.
3. `.specs/memory/decisoes.md` — decisões arquiteturais já fechadas.
4. `.specs/shared/` — convenções de código e glossário de domínio.
5. `.specs/domain/` — **só o domínio que a tarefa toca**, quando houver.

## Regras

- **Especificação antes de código.** Trabalho novo vira uma mudança em
  `.specs/changes/` antes de virar implementação. Use a skill
  `spec-nova-mudanca`.
- **Portão antes de spec.** Nenhum arquivo é criado em `.specs/changes/` antes da
  checagem de prontidão ter sido escrita para o usuário **e** respondida por ele.
  Vale mesmo quando o pedido parece óbvio — aí a checagem é curta, não ausente.
- **Padrão antes de preferência.** Antes de escrever código de um tipo já
  padronizado, procure a skill correspondente em `.claude/skills/` e aplique o
  molde dela.
- **Vocabulário único.** Use os termos de `.specs/shared/glossario.md` na spec,
  no código, no banco e na interface.
- **Sem dependência nova por conta própria.** Biblioteca fora de
  `.specs/memory/stack.md` exige decisão registrada em `decisoes.md`.
- **Escopo é contrato.** Trabalho necessário que não está no `spec.md` da mudança
  corrente vira uma nova mudança no fim da fila.
- **Arquivo lido sempre tem teto.** `spec.md` vai até ~600 linhas ou ~10 critérios
  de aceite, o que estourar primeiro; `memory/decisoes.md` e `memory/stack.md`, até
  ~150 linhas. A poda acontece na leitura e só na skill `spec-nova-mudanca` — quem
  executa ou arquiva confere e avisa, nunca poda.
- **Validação é executada, não presumida.** Marque um critério de aceite só
  depois de tê-lo verificado de fato.
- **Garantia só está protegida se removê-la derrubar teste nomeado.** Critério de
  aceite que afirma uma recusa, restrição, validação ou guard passa pela rodada de
  sabotagem antes de ser marcado, e o nome de cada teste caído vai para o
  `tasks.md`. Garantia deixada sem rodada é declarada com o motivo, nunca calada.

## Comandos do fluxo

| Intenção | Como |
|---|---|
| Especificar trabalho novo | skill `spec-nova-mudanca` |
| Implementar uma mudança | skill `spec-executar-mudanca` |
| Rodar a fila inteira | `Siga @.specs/EXECUTAR-TODAS.md` |
| Auditar o que foi feito | skill `spec-verificar-mudanca` |
| Fechar mudança concluída | skill `spec-arquivar-mudanca` |
| Congelar um padrão que se repete | skill `spec-nova-skill` |

## Estado atual

Preencha esta seção com o que o projeto é, em que estágio está e o que o bloqueia
agora. É a primeira coisa que um agente lê, e uma resposta desatualizada aqui custa
mais do que uma vazia.
