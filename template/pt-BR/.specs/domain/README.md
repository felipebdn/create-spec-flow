# domain

Regra de produto por domínio, e o que vale em todos eles: invariantes numeradas, fórmulas,
convenções de cálculo.

Nasce vazio. Um arquivo por domínio, criado quando houver regra que atravesse mudanças e não caiba
em `spec.md` de uma só — `razao.md`, `credito.md`, `assinaturas.md`, o que o projeto tiver. Regra que
vale para uma mudança apenas fica no `spec.md` dela.

## Por que esta camada existe

`memory/` guarda decisão transversal e tem teto, porque é lido em toda mudança. `shared/` guarda
convenção e glossário, e é lido em toda mudança pelo mesmo motivo. Regra de domínio não cabe em
nenhum dos dois: ela é grande, e é relevante em poucas mudanças de cada vez.

**Esta camada é lida seletivamente** — só o arquivo do domínio que a mudança toca, escolhido pelo
nome. É isso que a isenta de teto: ela não é custo fixo por sessão.

## Quem lê, e quem não lê

| Etapa | `.specs/domain/` |
|---|---|
| `spec-nova-mudanca` | **lê** o domínio que a mudança toca, e **destila por extenso** na spec |
| `spec-executar-mudanca` | **não abre** — a spec já destilou |
| `EXECUTAR-TODAS.md` | lê seletivamente, na carga de contexto |
| `spec-arquivar-mudanca` | **escreve** aqui, quando a mudança fecha uma regra de domínio |
| `spec-verificar-mudanca` | não audita contra o domínio — audita contra a spec aprovada |

**Destilar, não referenciar.** Quem implementa não vai abrir este diretório. Regra que governa uma
tarefa entra escrita por extenso no `spec.md` dela; "conforme o domínio de crédito" não sobrevive à
troca de sessão.

## Numeração de invariante

Se o projeto numerar invariantes, o número é **congelado**: código e migração passam a citá-lo.
Numeração com lacunas é normal e não se conserta — renumerar quebra toda referência escrita.
