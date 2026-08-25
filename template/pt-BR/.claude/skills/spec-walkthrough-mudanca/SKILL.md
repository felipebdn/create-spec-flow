---
name: spec-walkthrough-mudanca
description: Escreve o walkthrough de fechamento de uma mudança — o que fechou, em que ordem revisar por risco, as decisões e os gotchas. Use ao fechar uma mudança, depois de os critérios estarem marcados e antes de arquivar.
---

# Walkthrough de fechamento

Mora em `.specs/changes/NNN-slug/walkthrough.md`, e viaja com a mudança para `archive/`.

## O que ele é, e o que ele não é

Os outros três arquivos já registram tudo. O `spec.md` diz o quê e por quê, o `plan.md` diz o como, e
as Notas de execução do `tasks.md` dizem o que aconteceu. **O walkthrough não repete nada disso.**

O que falta neles é **síntese ordenada por risco**. As notas são cronológicas e fragmentárias —
"descobri X na fase 3", "desviei do plano na fase 5". Quem chega para revisar não quer a ordem em que
as coisas aconteceram; quer saber **onde olhar primeiro porque é onde o erro seria mais caro**.

Se o seu walkthrough puder ser gerado concatenando os outros três, ele não devia existir.

## Por que ele é passo, e não cortesia

**Explicar é uma lente diferente de auditar.** A verificação pergunta "isto está certo?"; o
walkthrough pergunta "isto faz sentido junto?". São perguntas diferentes e pegam defeitos diferentes.

Incoerência de narrativa é o sintoma clássico de rastro de correção: um trecho consertado e outro,
que dizia a mesma coisa, deixado para trás. Auditoria de critério contra código não vê isso, porque
não é código contra critério — é texto contra texto.

Achado que aparecer aqui **não vira nota de rodapé**: volta e conserta o arquivo errado, e o
walkthrough registra que voltou.

## A forma

Ordem sugerida. Omita seção sem conteúdo real — seção vazia é ruído.

```markdown
# NNN — Walkthrough de fechamento

Commits, e o estado da mudança.

## O que fechou
Duas ou três frases. **A propriedade que a mudança existe para garantir**, não a lista do que foi
feito — a lista está no plano.

## Áreas de mudança
Tabela: área, onde, o que carrega. O suficiente para orientar, não para substituir a leitura.

## Ordem de revisão
**Por risco, do maior para o menor**, com o porquê de cada posição. É a seção que justifica o
arquivo existir. Erro silencioso vem primeiro; texto e configuração vêm por último.

## Decisões importantes
As que não se leem no diff, e as que teriam alternativa plausível. Cada uma com o motivo — e, quando
houver, com o número medido que a sustenta.

## Gotchas
O que a implementação revelou e o planejamento não previa. Comportamento surpreendente de
ferramenta, versão, ambiente. É o que a próxima pessoa ia redescobrir sozinha.

## Verificação medida
Comando e resultado real. As rodadas de sabotagem, com o nome do que caiu.
**Afirmação sem número não fecha mudança.**

## O que fica
Pendência declarada, contrato que a próxima mudança consome, dívida registrada.
```

## Regras

- **Ordem de revisão é por risco, nunca por ordem de implementação.** Se as duas coincidirem, diga
  que coincidem; se você não sabe qual é a de maior risco, o walkthrough ainda não está pronto.
- **Número, não adjetivo.** "A suíte passou" não é verificação; "5 suítes, 15 testes, 0,98 s" é.
- **Gotcha é o que custou tempo.** Se você teve que medir para descobrir, escreva o que mediu.
- **Erro registrado vale mais que erro escondido.** Rodada de sabotagem refeita, teste que estava
  errado, critério marcado antes da hora — tudo isso entra. É o que impede a próxima pessoa de
  concluir que foi tudo tranquilo e baixar a guarda.
- **Não invente síntese.** Se a mudança foi mecânica e não tem gotcha nem decisão, o walkthrough é
  curto. Curto é resultado legítimo; inflado não.

## Não faça

- Repetir a lista de arquivos do `plan.md`.
- Reescrever as Notas de execução em outra ordem.
- Escrever antes de os critérios estarem marcados — o walkthrough descreve o que fechou, e nada
  fechou ainda.
- Deixar achado seu como observação. Volte e conserte.

## Ao terminar

Reporte o caminho e, se escrever o walkthrough tiver revelado algo, o que você consertou por causa
disso.
