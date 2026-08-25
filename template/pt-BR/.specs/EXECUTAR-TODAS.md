# EXECUTAR-TODAS

Orquestrador da fila de mudanças. Aponte o agente para este arquivo e ele executa
`.specs/changes/` inteiro, em ordem, parando onde precisa parar.

**Como disparar:** `Siga @.specs/EXECUTAR-TODAS.md`

## Contexto obrigatório antes de começar

Leia, nesta ordem, e não comece nada antes de terminar a leitura:

1. `.specs/README.md` — como este fluxo funciona.
2. `.specs/memory/` — decisões arquiteturais e stack já fechadas.
3. `.specs/shared/` — convenções e contratos que todas as mudanças respeitam.
4. `CLAUDE.md` na raiz, se existir.

**Confira o tamanho do `memory/` ao ler** — `wc -l` em `decisoes.md` e `stack.md`, contra o teto da
skill `spec-tetos-e-poda`. Passou de qualquer um, **registre no relatório final** que a poda vence
na próxima `spec-nova-mudanca`. **Não pode aqui.**

A conferência é obrigação desta etapa justamente porque uma fila inteira roda sem planejamento no
meio: cada mudança acrescenta pouco ao `decisoes.md`, e catorze acrescentam muito sem ninguém ver.

## Seleção

1. Liste `.specs/changes/` e ordene pelo prefixo numérico. Sufixos de letra
   ordenam dentro do mesmo número: `012a` antes de `012b`.
2. Descarte as pastas cujo `spec.md` tem `status: done`.
3. A primeira pasta restante é a mudança atual.

## Ciclo por mudança

Para cada mudança selecionada, na ordem:

### 1. Verificar dependências

Leia `depende_de` no frontmatter do `spec.md`. Se alguma dependência não estiver
`done`, **pule esta mudança** e registre o motivo no relatório final. Não tente
adiantar a dependência fora de ordem.

### 2. Verificar bloqueio

Se o `spec.md` tem itens não resolvidos em **Questões em aberto** que afetam os
requisitos obrigatórios, **pare a fila inteira** e pergunte ao usuário. Adivinhar
resposta de questão em aberto é o único erro que este fluxo não perdoa — a
mudança errada contamina todas as seguintes.

Questão em aberto que não afeta requisito obrigatório: siga, assuma o padrão mais
conservador e anote a suposição em **Notas de execução** no `tasks.md`.

### 3. Marcar início

Troque `status: todo` para `status: in-progress` no `spec.md`.

### 4. Implementar

- Siga o `plan.md` na sequência definida.
- Antes de escrever código de um tipo já padronizado, procure a skill
  correspondente em `.claude/skills/` e aplique o padrão dela. Não invente
  arquitetura nova para algo que já tem molde.
- Marque cada tarefa do `tasks.md` como `[x]` no momento em que ela conclui.

### 5. Validar

- Rode os comandos da seção **Como validar** do `plan.md`.
- Confira um a um os **Critérios de aceite** do `spec.md` e marque os que passam.
- Se um comando falhar: corrija e rode de novo, até 3 tentativas. Persistindo a
  falha, **pare a fila**, deixe a mudança em `in-progress` e relate exatamente o
  que falhou, com a linha decisiva do erro.

### 6. Sabotar

**Suíte verde não distingue "protegido" de "nunca testado".** Um critério de aceite que afirma uma
garantia só está provado se **removê-la derrubar teste nomeado**. Este passo é o que fecha essa
diferença, e é a razão de o passo 5 sozinho não bastar.

**O que conta como garantia.** Qualquer critério cujo modo de falha seja **silencioso**: uma recusa,
uma restrição de banco, uma validação de entrada, um guard, uma regra de isolamento, um caminho de
erro. Critério que só descreve um caminho feliz — "a tela lista os itens" — não é garantia: se
quebrar, quebra visível, e o teste normal já basta.

**Uma rodada por garantia, uma de cada vez:**

1. Remova a proteção — a restrição, a validação, a linha do guard. **Remova código executado**, não
   comentário e não arquivo morto: comentário removido não derruba teste nenhum, e a rodada mediria
   nada.
2. Rode a suíte **inteira**, nunca só o arquivo da garantia. É a suíte inteira que mostra a diferença
   entre proteção e ruído — uma rodada que derruba trinta testes em dez arquivos diz outra coisa de
   uma que derruba dois no arquivo esperado.
3. **Anote o nome de cada teste que caiu** na tabela de `## Sabotagem` do `tasks.md`.
4. Desfaça, rode a suíte de novo, confirme verde.

**Duas rodadas não fecham a fase, e nenhuma se resolve seguindo em frente:**

- **Nada caiu.** A garantia não está protegida por teste nenhum. Escreva o teste que faltava e
  repita a rodada. Não marque o critério de aceite.
- **Caiu pelo motivo errado** — o alvo já não estava lá, o teste quebrou por efeito colateral, a
  mensagem de erro é de outra coisa. Conta como ruído, não como proteção. Corrija até o motivo bater
  com o que o critério afirma.

**Cuidado ao desfazer.** `git restore` **apaga** arquivo não rastreado em vez de devolvê-lo, e desfaz
junto qualquer outra mudança que a própria tarefa tenha feito naquele arquivo. Quando o alvo for
arquivo novo, ou arquivo já modificado por esta mudança, guarde uma cópia byte a byte **antes** de
editar e restaure a partir dela, conferindo com `diff`.

**Garantia que se escolheu não sabotar é legítima, mas tem que ser dita.** Escreva na seção
"Garantias sem rodada" do `tasks.md` o que ficou de fora e por quê. Ausência declarada é revisável;
ausência calada passa por cobertura.

**Terminar com o repositório sabotado é não ter terminado.** A fase fecha com a suíte verde e a
árvore limpa.

### 7. Fechar

Só quando todos os critérios de aceite estiverem marcados:

- Preencha **Notas de execução** no `tasks.md` com desvios, suposições e
  surpresas.
- Registre em `.specs/memory/decisoes.md` toda decisão nova que o `spec.md` não
  previa.
- Promova para `.specs/shared/` qualquer contrato que a próxima mudança vai
  consumir.
- Troque `status` para `done` no `spec.md`.
- Não mova nada para `.specs/archive/` aqui. Arquivamento é passo separado, feito
  por decisão do usuário via skill `spec-arquivar-mudanca`.

### 8. Avançar

Vá para a próxima mudança da fila e repita a partir do passo 1.

## Regras que valem para a fila inteira

- **Uma mudança por vez.** Nada de implementar `008` enquanto `007` está aberta.
- **Não altere o escopo.** Se durante a execução aparecer trabalho necessário que
  não está no `spec.md` atual, crie uma nova mudança no fim da fila e siga. Não
  amplie a mudança corrente por conta própria.
- **Não pule validação nem sabotagem** para chegar mais rápido ao fim da fila. A sabotagem é o passo
  que mais parece dispensável quando a suíte está verde, e é exatamente por isso que ela existe.
- **Pare de verdade quando as regras mandam parar.** Uma fila interrompida com
  diagnóstico honesto vale mais do que uma fila "concluída" sobre código quebrado.

## Relatório final

Ao terminar ou ao parar, entregue:

| Mudança | Resultado | Observação |
|---|---|---|
| `001-...` | concluída / pulada / falhou / não iniciada | motivo, quando não concluída |

Depois da tabela, liste em texto:

- Suposições assumidas durante a execução.
- Decisões novas gravadas em `memory/`.
- Mudanças criadas durante a execução, se houve.
- O que ficou fora e por quê.
