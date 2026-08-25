# Plano técnico — NNN-slug

Complemento do `spec.md`. Aqui entra o **como**. Se algo aqui contradiz o
`spec.md`, o `spec.md` vence — ou o `spec.md` precisa ser corrigido antes de
começar a implementação.

## Abordagem

Dois ou três parágrafos sobre o desenho escolhido. Cite o padrão que já existe no
projeto e que esta mudança segue (a skill correspondente em `.claude/skills/`,
quando houver).

## Arquivos afetados

| Arquivo | Ação | O que muda |
|---|---|---|
| `src/...` | criar | ... |
| `src/...` | editar | ... |

## Sequência

1. Passo técnico, na ordem em que precisa acontecer.
2. ...

## Contratos

Assinaturas, formatos de request/response, schema de tabela — o que outra mudança
vai depender. O que for estável e reutilizável deve subir para `.specs/shared/`.

```
// exemplo de contrato
```

## Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| ... | ... | ... |

## Como validar

Comandos exatos que provam que a mudança funciona.

```bash
# ex.: npm run test -- caminho/do/teste
# ex.: npm run build
```
