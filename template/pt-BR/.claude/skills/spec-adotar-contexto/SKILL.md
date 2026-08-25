---
name: spec-adotar-contexto
description: Traz contexto que já existe — README, ADRs, wiki, tickets, specs de outra ferramenta — para dentro do `.specs/`, e confere que nada se perdeu no caminho. Use ao adotar este fluxo num projeto que já tem documentação, ou ao portar material de qualquer outra fonte.
---

# Adotar contexto que já existe

O fluxo pressupõe que o contexto do projeto está em `.specs/`. Num projeto que já existe, ele está
espalhado — README, ADRs, wiki, comentário de código, a cabeça de alguém. Trazer isso para cá é
**tradução**, não cópia, e tradução perde coisa em silêncio.

Esta skill é o procedimento, e o modo de conferir que ele funcionou.

## Onde cada coisa vai

| O que você tem | Onde mora |
|---|---|
| o que o projeto é, em que estágio está | `CLAUDE.md`, seção de estado |
| tecnologia, versão, comando de build e teste | `memory/stack.md` |
| decisão arquitetural com motivo — ADR, "por que não X" | `memory/decisoes.md` |
| nomenclatura, formato de erro, padrão de commit | `shared/convencoes.md` |
| vocabulário de domínio, termo que o código congela | `shared/glossario.md` |
| regra de produto por área, invariante numerada, fórmula | `domain/<area>.md` |
| trabalho pendente | `changes/`, pela skill `spec-nova-mudanca` |

**O que não tem casa provavelmente não devia estar sendo portado.** Registro de trabalho concluído
já está no código e no histórico; refazê-lo em prosa é duplicata que se paga em toda leitura.

## Os tetos valem no que chega

`memory/` e `shared/` são lidos em toda mudança. Contexto antigo costuma vir grande, e enfiá-lo ali
inteiro fura o teto no primeiro dia — regras em `spec-tetos-e-poda`.

O que não couber é regra de domínio, e vai para `domain/`, que é lido seletivamente e não tem teto.
Se nem lá couber, é sinal de que o material mistura decisão com registro histórico: só a decisão
atravessa.

## Conferir que nada se perdeu

Comparação mecânica erra de três jeitos, e vale conhecer os três antes de confiar no resultado.

### Normalize o espaço antes de comparar

Prosa com quebra de linha destrói comparação linha a linha: a mesma frase escrita em duas linhas não
casa com ela escrita em uma, e a ferramenta devolve "ausente" sem avisar que o problema é dela.

Junte o texto, colapse espaço em branco, compare depois:

```
alvo = colapsar_espaco(concatenar(todos_os_md)).minusculas()
```

### O matcher levanta candidato, não conclusão

Três resultados são **indistinguíveis** para comparação literal, e só um é defeito:

| O que aconteceu | A comparação diz | É perda? |
|---|---|---|
| a frase sumiu | ausente | **sim** |
| a frase foi reescrita | ausente | não — mesmo fato, outras palavras |
| a questão foi resolvida | ausente | não — virou decisão, e sumir é o certo |

Toda ausência acusada precisa de uma **segunda passada por conteúdo**. Concluir direto da primeira
reintroduz texto morto e reabre decisão fechada — o dano é nos dois sentidos, não só o de perder.

### Corte por tamanho, ou você audita ruído

Compare frase por frase, ignorando linhas curtas: título, separador de tabela e marcador não dizem
nada e enchem o resultado de falso positivo.

## Ausência declarada

Conteúdo que você escolher **não** portar é escrito com o motivo, no lugar onde estaria se tivesse
vindo. Ausência calada passa por cobertura, aqui como no resto do fluxo.

O caso mais comum: convenção antiga que o próprio fluxo já cobre. Não porte — diga que não portou e
por quê.

## Ao terminar

Reporte quantas ausências a comparação acusou, quantas eram perda de fato, e o que você escolheu
deixar de fora com o motivo de cada uma.
