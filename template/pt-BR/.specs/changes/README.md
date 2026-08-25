# changes

A fila. Cada pasta aqui é uma unidade de trabalho especificada **antes** de virar código.

Ela nasce vazia de propósito: um projeto novo não herda o trabalho de ninguém. A primeira mudança
entra pela skill `spec-nova-mudanca`, e nada é criado aqui antes da checagem de prontidão ter sido
escrita para o usuário e respondida por ele.

```
.specs/changes/007-cadastro-de-ideia/
├── spec.md    # O QUÊ e o PORQUÊ — requisitos e critérios de aceite. Sem código.
├── plan.md    # O COMO — arquivos tocados, sequência técnica, riscos.
└── tasks.md   # A EXECUÇÃO — checklist marcável, mais o registro de sabotagem.
```

Ordem de execução pelo prefixo numérico. Sufixo de letra quando uma feature é fatiada em partes que
rodam em sequência — `012a-dashboard-backend`, `012b-dashboard-frontend`.

Mudança concluída sai daqui pela skill `spec-arquivar-mudanca`, nunca por remoção.
