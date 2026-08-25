---
name: spec-tetos-e-poda
description: Os tetos de tamanho do fluxo .specs e a disciplina de poda do memory/ — quanto cabe em um spec.md, quanto cabe em decisoes.md e stack.md, quem poda e quem apenas avisa. Use ao criar ou partir uma mudança, ao ler ou acrescentar em .specs/memory/, e sempre que um desses arquivos parecer grande.
---

# Tetos e poda

Todo arquivo lido por inteiro em toda sessão impõe o próprio tamanho a **todo** trabalho futuro. Os
tetos abaixo não são preferência de estilo: são o que impede o custo por sessão de crescer sozinho,
sem ninguém decidir que devia crescer.

## Os dois tetos

| Arquivo | Teto | Quando estoura |
|---|---|---|
| `spec.md` de uma mudança | ~600 linhas **ou** ~10 critérios de aceite | parta em duas mudanças |
| `memory/decisoes.md` | ~150 linhas | pode na próxima leitura |
| `memory/stack.md` | ~150 linhas | pode na próxima leitura |

## O teto do `spec.md` é duplo

Vale o que estourar primeiro. **Contar só critérios não segura nada:** o critério engorda no lugar da
mudança, e o custo por sessão sobe igual.

Estourou qualquer um dos dois, parta em duas mudanças, encadeadas por `depende_de`, e **diga isso ao
propor** — não parta em silêncio. Parta **pelo que a segunda precisa da primeira**, nunca pelo meio
da contagem: mudança grande costuma estourar o teto de linhas antes do de critérios, e é exatamente
aí que a partição é mais fácil de errar.

Um critério de aceite que afirma mais de um fato verificável é dois critérios.

**Nunca encolha cortando critério de aceite verificável ou comando de validação do `plan.md`.** São
os dois campos que fazem a mudança se sustentar sozinha; cortá-los custa um ciclo de execução
inteiro, não algumas linhas. Se o `spec.md` está grande, o excesso quase sempre é prosa já dita em
outro lugar, ou escopo que pertence a outra mudança.

## `.specs/domain/` não tem teto, e isso é decisão, não esquecimento

O teto existe porque o arquivo é lido em **toda** sessão. `domain/` é lido **seletivamente** — só o
domínio que a mudança toca —, então o tamanho dele não é imposto a todo trabalho futuro. Um arquivo
de domínio com 300 linhas custa nas poucas mudanças que o tocam, e nada nas outras.

A contrapartida é a disciplina de leitura: quem lê `domain/` inteiro "por garantia" reintroduz
exatamente o custo que a isenção pressupõe que não existe.

## A poda do `memory/`

`decisoes.md` e `stack.md` são lidos em **toda** mudança e escritos em poucas.

### A conferência acontece na leitura, não na escrita

Checar na escrita deixaria o arquivo crescer sem ninguém olhando — porque escrever é raro e ler é
sempre. Leu, passou do teto, resolva ali, antes de seguir.

### Quem poda, e quem só avisa

| Etapa | Ao ler ou escrever no `memory/` |
|---|---|
| `spec-nova-mudanca` | **poda**, ali mesmo, antes de seguir para a exploração |
| `spec-executar-mudanca` | `wc -l`, avisa no resumo final. **Não poda** |
| `EXECUTAR-TODAS.md` | `wc -l`, registra no relatório final. **Não poda** |
| `spec-arquivar-mudanca` | acrescenta, confere, avisa no relatório. **Não poda** |
| `spec-verificar-mudanca` | relata arquivo estourado como achado de severidade **média** |

**Só quem planeja poda.** Escolher o que sai exige o contexto do planejamento, que quem executa não
tem. **Mas conferir é obrigação de todos**, porque uma fila inteira roda sem planejamento no meio:
cada mudança acrescenta pouco ao `decisoes.md`, catorze acrescentam muito, e ninguém vê.

### O que sai

- Decisão que **já virou código** — o código passou a ser a fonte, e a entrada virou duplicata que
  se paga em toda leitura.
- Decisão revertida ou superada — fica só a que vale hoje.
- Convenção que o projeto passou a impor por **lint, tipo ou teste** — a ferramenta virou a fonte.

Fica o que ainda governa escolha futura e não é dedutível do código.

Se a poda não bastar para voltar ao teto, **avise** em vez de deixar crescer em silêncio.

## Não faça

- **Não edite entrada existente do `decisoes.md` para "atualizar" uma decisão.** Decisão que mudou
  entra como entrada nova no fim; a antiga sai na poda seguinte. O histórico do porquê é o valor do
  arquivo.
- **Não pode fora da leitura.** Poda é a única reescrita permitida nesses arquivos, e ela acontece
  em um lugar só do fluxo.
- **Não pode quando você está executando ou arquivando.** Avise. Podar sem o contexto do
  planejamento tira o que ainda governa escolha futura.
- **Não encolha um `spec.md` grande cortando o que o torna verificável.** Corte prosa repetida ou
  parta a mudança.
- **Não deixe estourar em silêncio.** Arquivo acima do teto que ninguém mencionou é custo que todo
  planejamento futuro paga sem saber.
