---
name: spec-nova-skill
description: Cria uma nova skill em .claude/skills/ capturando um padrão de código que se repete no projeto. Use quando um padrão foi implementado duas ou mais vezes, ou quando o usuário pedir para transformar uma convenção em skill.
---

# Nova skill

Skill é padrão de código congelado. Ela existe para o agente **aplicar um molde
já decidido** em vez de reinventar arquitetura a cada feature. É o que mantém a
sétima feature com a mesma cara da primeira.

## Quando criar

Crie quando o padrão já apareceu **duas vezes** e vai aparecer de novo. Não crie
por antecipação: skill escrita antes do segundo caso real congela um desenho que
ainda não foi testado pelo uso.

Sinais de que é hora:

- Você copiou a estrutura de um arquivo existente para escrever outro.
- O `spec-verificar-mudanca` apontou desvio de padrão duas vezes no mesmo tipo de
  código.
- O `plan.md` de uma mudança descreveu passo a passo algo que outro `plan.md` já
  descrevia.

## Nomenclatura

`<escopo>-<coisa>`, kebab-case, batendo com o nome do diretório:

| Escopo | Para quê | Exemplos |
|---|---|---|
| `backend-` | Padrão de uma camada do servidor | `backend-controller`, `backend-repository` |
| `frontend-` | Padrão de interface | `frontend-formulario`, `frontend-tabela` |
| `shared-` | Regra que vale nos dois lados | `shared-validation-rule` |
| `config-` | Configuração de ferramenta ou ambiente | `config-lint`, `config-env` |
| `spec-` | Operação do próprio fluxo de especificação | `spec-nova-mudanca` |

## Formato

```markdown
---
name: <igual ao nome do diretório>
description: <o que faz> + <quando usar>. Terceira pessoa, uma ou duas frases.
---

# Título

## Regra
A decisão em uma ou duas frases. O que sempre vale.

## Onde fica
Caminho e organização dos arquivos.

## Molde
Bloco de código real, do projeto, funcionando.

## Regras
Lista curta de restrições que o molde não mostra sozinho.

## Não faça
Os erros concretos que esta skill existe para impedir.
```

A `description` é o que decide se a skill vai ser carregada na hora certa. Ela
precisa dizer **quando usar**, não só o que a skill faz — descrição vaga é skill
que nunca dispara.

## Qualidade

- **Molde vem de código real** que existe no repositório e funciona. Exemplo
  inventado vira mentira na primeira divergência.
- **Uma skill, um padrão.** Se o título precisa de "e", são duas skills.
- **Curta.** Meta: caber em uma tela e meia. Skill longa é lida por diagonal e o
  detalhe que importava se perde.
- **Diga o "não faça".** A parte mais útil costuma ser a lista de erros que o
  padrão existe para evitar.
- **Não repita convenção geral.** Nomenclatura e estilo já estão em
  `.specs/shared/convencoes.md`; aponte para lá em vez de duplicar — duas cópias
  divergem.

## Manutenção

Skill descreve o padrão vigente, não o histórico. Quando o padrão muda, **edite a
skill** e registre a mudança em `.specs/memory/decisoes.md`. Skill desatualizada é
pior que skill ausente: o agente aplica com confiança um molde que o projeto
abandonou.

## Ao terminar

Reporte o caminho criado, o padrão capturado e os arquivos existentes de onde o
molde foi extraído.
