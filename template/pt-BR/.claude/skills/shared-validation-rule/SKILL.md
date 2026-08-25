---
name: shared-validation-rule
description: Padrão do projeto para validar entrada externa na borda do sistema — onde validar, como nomear o schema, como formatar o erro. Use ao criar ou alterar qualquer endpoint, formulário, handler de fila ou comando de CLI que receba dado de fora.
---

# Regra de validação

Molde de implementação. Serve de exemplo de como uma skill de padrão de código é
escrita neste projeto: uma regra, um molde, e a lista do que não fazer.

> **Estado:** genérica enquanto a stack não estiver definida em
> `.specs/memory/stack.md`. Ao fechar a stack, reescreva os exemplos com a biblioteca real
> escolhida.

## Regra

Dado externo é validado **uma vez, na borda**, antes de tocar regra de negócio.
Depois da borda, o núcleo do domínio assume dado válido e tipado, e não revalida.

Borda é todo ponto de entrada: handler HTTP, ação de formulário, consumidor de
fila, job agendado, comando de CLI, webhook.

## Onde fica

Um arquivo de schema por recurso, ao lado do código do recurso — não numa pasta
`validators/` global. O schema é parte do recurso, não uma camada separada.

```
src/<recurso>/
├── <recurso>.schema.<ext>   # schemas de entrada e o tipo derivado deles
└── <recurso>.<borda>.<ext>  # handler: valida, delega, formata resposta
```

## Molde

```
// <recurso>.schema.<ext>
// Um schema por operação. Nome: <Operacao><Recurso>Entrada.
CriarIdeiaEntrada = objeto({
  titulo:    texto().min(1).max(120),
  descricao: texto().max(2000).opcional(),
})

// O tipo do domínio DERIVA do schema. Nunca declare os dois à mão em paralelo:
// eles divergem na primeira alteração e o compilador não avisa.
tipo CriarIdeiaEntrada = inferir<typeof CriarIdeiaEntrada>
```

```
// <recurso>.<borda>.<ext>
handler(requisicao) {
  resultado = CriarIdeiaEntrada.validar(requisicao.corpo)
  se (!resultado.ok) retornar respostaDeErro(422, formatarErros(resultado.erros))

  // daqui para baixo, dado válido e tipado
  ideia = criarIdeia(resultado.dados)
  retornar resposta(201, ideia)
}
```

## Formato do erro

Um formato só, em todo o projeto:

```json
{
  "erro": "validacao",
  "mensagem": "Dados inválidos.",
  "campos": [
    { "campo": "titulo", "mensagem": "Obrigatório." }
  ]
}
```

- Status `422` para entrada malformada; `400` fica para requisição quebrada.
- A mensagem por campo é escrita para quem preenche o formulário, não para quem
  escreveu o código.
- Nunca vaze detalhe interno — nome de coluna, SQL, stack, caminho de arquivo.

## Regras

- Valide o formato, não a regra de negócio. "e-mail bem formado" é validação;
  "e-mail já cadastrado" é regra de negócio e mora no domínio, com erro próprio.
- Valide na entrada **e** na saída de sistema externo. Resposta de API de
  terceiro é dado externo tanto quanto entrada de usuário.
- Limite tamanho em todo texto livre. Campo sem limite é vetor de abuso.
- Validação de frontend é conveniência de interface e não substitui a de backend.
  As duas usam o mesmo schema quando a stack permitir compartilhar.

## Não faça

- Revalidar o mesmo dado em cada camada — esconde onde está a fonte da verdade.
- Validar dentro da regra de negócio, misturando forma e semântica.
- Retornar apenas a primeira falha: devolva todas de uma vez.
- Coagir silenciosamente (`"12"` virando `12`) sem que o schema diga que coage.
- Declarar o tipo do domínio à mão em paralelo ao schema.
