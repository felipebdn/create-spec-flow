---
name: spec-nova-mudanca
description: Cria uma nova pasta de mudança em .specs/changes/ a partir dos templates, com spec.md, plan.md e tasks.md preenchidos. Use quando o usuário pedir uma nova feature, correção ou tarefa que ainda não tem especificação — antes de escrever qualquer código.
---

# Nova mudança

Transforma um pedido em linguagem natural numa mudança especificada na fila.

Esta skill **não escreve código de produção**. Ela produz a especificação que
depois será executada. Se o usuário pedir para já implementar, crie a
especificação primeiro e só então siga para `spec-executar-mudanca`.

## Antes de escrever

Leia, para não especificar contra o que já existe:

1. `.specs/memory/` — stack e decisões já fechadas.
2. `.specs/shared/` — convenções e glossário. Use o vocabulário de lá.
3. `.specs/domain/` — **só o domínio que a mudança toca**. É de lá que sai a regra de produto que a
   spec precisa **destilar por extenso**: quem implementa não vai abrir `domain/`, e
   "conforme o domínio de crédito" não sobrevive à troca de sessão.
4. `.specs/changes/` — a fila atual, para descobrir o próximo número e para
   detectar sobreposição com uma mudança já especificada.

Se o pedido se sobrepõe a uma mudança existente que ainda está `ready`, proponha
editar aquela em vez de criar uma nova, e espere a resposta.

### Podar o `memory/` — aqui, e só aqui

**Confira o tamanho no momento em que ler**, e pode **agora**, antes de seguir para a exploração.
Esta skill é o único ponto do fluxo onde a poda acontece; as outras etapas conferem e avisam.

Aplique a skill `spec-tetos-e-poda` — ela traz os números, o que sai e o que fica.

## Numeração

- Próximo número livre, 3 dígitos, sem reaproveitar número de mudança arquivada.
- Sufixo de letra apenas quando a mesma feature é fatiada em partes que precisam
  rodar em sequência: `012a-dashboard-backend`, `012b-dashboard-frontend`. A
  parte `b` declara `depende_de: ["012a-..."]`.
- Slug curto, descritivo, em português, kebab-case.

## Fatiamento

Uma mudança deve caber numa sessão de trabalho e ser validável sozinha. Fatie
quando o pedido:

- cruza backend e frontend — separe em `NNNa` e `NNNb`;
- tem partes que entregam valor independente;
- passa de ~8 tarefas no `tasks.md`.

Não fatie ao ponto de criar mudanças que não podem ser validadas isoladamente.

### O teto do `spec.md`

Duplo: linhas **e** número de critérios de aceite, valendo o que estourar primeiro. Os números, como
partir sem errar o corte e o que nunca cortar para caber estão na skill `spec-tetos-e-poda` —
aplique-a antes de decidir o fatiamento.

Estourou, parta em duas mudanças encadeadas por `depende_de` e **diga isso ao propor**: a partição
entra na checagem de prontidão, nunca acontece em silêncio.

## Checagem de prontidão — o portão

**Nada é escrito em `.specs/changes/` antes deste passo.** Ele é uma mensagem visível ao usuário,
não um checklist interno: entrega a ele a decisão de rascunhar. Escreva-a, proponha escrever a
mudança, e **espere a confirmação**.

Cubra o que fizer sentido para a situação — são ângulos, não cota a preencher:

- **Ainda vago:** o que eu teria que inventar por conta própria se começasse a implementar agora.
- **Respostas que deixaram espaço aberto:** pontos onde implementações materialmente diferentes
  ainda cabem no que foi dito. Escolha que já fechou bem não volta à mesa.
- **Inferências silenciosas:** decisões que dobrei para dentro e o usuário ainda não viu de forma
  concreta. Não conta o que já foi mostrado e passou sem objeção.
- **O que veio do contexto do projeto — sempre uma linha, mesmo quando a resposta é "não há nada
  em `memory/` que governe isto".** Quais decisões do `decisoes.md`, restrições do `stack.md` e
  convenções do `shared/` governaram esta mudança. É a única saída visível da leitura do contexto, e
  passo sem saída visível é passo que não acontece.
- **Quais skills de `.claude/skills/` são o molde** de cada parte, e o que ficou **sem** molde. Parte
  sem skill é onde a arquitetura vai divergir do resto do projeto; dizer isso agora é mais barato que
  descobrir na revisão.
- **Quais critérios de aceite afirmam garantia**, e portanto vão exigir rodada de sabotagem. Critério
  que afirma recusa, restrição, validação, guard ou isolamento entra nesta lista. Garantia que você
  já sabe que não será sabotada entra com o motivo — a decisão de não proteger é do usuário, não sua.
- **Vocabulário fora do glossário:** termo que a mudança precisa e que não está em
  `shared/glossario.md` é **pergunta**, não escolha sua. Nome inventado vira identificador congelado
  em código e banco no primeiro commit.
- **Partição, quando o escopo estoura o teto:** diga que vai virar duas mudanças e qual é o corte.

### As regras do portão

**Não é pulável.** Ele acontece mesmo quando o pedido parece óbvio — nesse caso ele é **curto**
("nada material em aberto"), não ausente. A tentação de ir direto para a spec é exatamente o que ele
existe para conter: mudança errada custa um ciclo de execução inteiro, a pergunta custa três linhas.

**Antes de criar a pasta da mudança, confira duas coisas:** a checagem foi escrita para o usuário
nesta conversa, **e** ele respondeu? Se a resposta for não para qualquer uma das duas, você ainda não
pode escrever.

**Lista longa quase sempre significa que o pensamento não terminou** — continue a conversa em vez de
empilhar pontas soltas no portão. Lista curta ou vazia é resultado legítimo quando a conversa já
cobriu o que importava.

**Decisão que fechar aqui vai para `.specs/memory/decisoes.md`**, no formato do arquivo, com o
motivo. Só entra o que **governa trabalho futuro**: uma escolha de arquitetura, um não-objetivo, um
limite de escopo. O que vale só para esta mudança fica no `spec.md`. Antes de acrescentar, aplique a
poda se o arquivo estiver perto do teto.

## Preenchimento

Só depois da confirmação do usuário no portão acima.

Copie os três templates de `.specs/templates/` e preencha:

**`spec.md`** — o quê e o porquê. Sem nome de arquivo, sem assinatura de função,
sem biblioteca. Se você está escrevendo código aqui, o conteúdo pertence ao
`plan.md`.

**`plan.md`** — o como. Cite explicitamente qual skill de `.claude/skills/`
implementa cada parte, quando houver molde. Liste os arquivos afetados. A seção
"Como validar" precisa conter comandos reais que existem no projeto, copiados de
`.specs/memory/stack.md` — não invente um comando de teste que não está
configurado.

**`tasks.md`** — a execução. Cada tarefa é um passo pequeno e verificável.

## Critérios de aceite

É a parte que mais importa e a que mais falha. Cada critério precisa de um jeito
concreto de checar: um comando que roda, uma resposta com formato conhecido, uma
tela com um elemento específico. "Deve funcionar bem" e "deve ter boa
performance" não são critérios — ou vire número, ou tire.

## Questões em aberto

Esta seção do `spec.md` guarda o que **sobrou** do portão: a ambiguidade que foi levada ao usuário e
que ele deixou em aberto de propósito, ou que depende de algo que ainda não existe.

Ambiguidade que você percebeu e **não** levou ao portão não pertence aqui — pertence ao portão, e
você ainda não podia estar escrevendo.

Se alguma questão em aberto afeta requisito obrigatório, diga na resposta que a mudança está
bloqueada: o `EXECUTAR-TODAS.md` vai parar a fila nela.

Nunca resolva a ambiguidade sozinho inventando uma decisão e registrando na tabela de decisões —
decisão só entra ali depois de fechada com o usuário, e o lugar de fechá-la é o portão.

## Ao terminar

Reporte em uma tela: caminho criado, resumo do escopo, o que ficou fora, e as
questões em aberto que bloqueiam a execução. Não marque nada como `executing`.

Se alguma decisão fechou no portão, diga que ela foi para o `decisoes.md` e qual foi.
