# Convenções

Regras que **toda** mudança respeita. Quando o `plan.md` de uma mudança contradiz
este arquivo, ou o plano está errado, ou este arquivo precisa ser atualizado
antes — nunca as duas versões convivendo.

## Nomenclatura

| Elemento | Padrão | Exemplo |
|---|---|---|
| Arquivo de código | kebab-case | `criar-usuario.ts` |
| Diretório | kebab-case | `casos-de-uso/` |
| Classe / tipo | PascalCase | `RepositorioDeUsuario` |
| Função / variável | camelCase | `buscarPorEmail` |
| Constante de módulo | SCREAMING_SNAKE_CASE | `LIMITE_DE_TENTATIVAS` |
| Tabela de banco | snake_case, plural | `usuarios` |
| Coluna | snake_case | `criado_em` |
| Variável de ambiente | SCREAMING_SNAKE_CASE | `DATABASE_URL` |

Nomes de domínio ficam em português; termos da linguagem e da biblioteca ficam
como a linguagem manda. Não traduza `getServerSideProps` nem invente `pegarProps`.

## Estrutura de diretórios

Organize por funcionalidade, não por tipo de arquivo. Um recurso reúne o que
pertence a ele, em vez de espalhar por pastas `controllers/`, `services/`,
`models/` paralelas.

```
src/
└── <recurso>/
    ├── ...
    └── ...
```

Feche o desenho concreto na primeira mudança e traga-o de volta para cá quando estiver fechado.

## Erros

- Erro esperado é valor de retorno ou exceção tipada do domínio — nunca `throw`
  de string solta.
- Mensagem de erro descreve o que falhou e o que fazer, sem vazar detalhe interno
  (stack, SQL, credencial) para a resposta ao cliente.
- Toda borda externa (HTTP, fila, cron) tem tratamento de erro explícito.

## Validação

Entrada externa é validada na borda, uma vez, antes de tocar regra de negócio. O
núcleo do domínio pode assumir dado já validado. Ver a skill
`shared-validation-rule` para o padrão concreto.

## Testes

- Todo requisito obrigatório de um `spec.md` tem pelo menos um teste.
- Nome do teste descreve o comportamento, não o método: `rejeita e-mail
  duplicado`, não `testCriarUsuario2`.
- Teste não acessa rede externa. Dependência externa é substituída na fronteira.

## Comentários

Comentário explica **porquê**, não **o quê**. O que o código faz, o código já diz.
Se um comentário precisa explicar o que a linha faz, a linha é que está confusa.

## Commits

`<tipo>: <descrição no imperativo>`, com tipos `feat`, `fix`, `refactor`, `test`,
`docs`, `chore`. Quando o commit fecha uma mudança, cite o ID: `feat: cadastro de
ideia (007)`.

## Segredos

Nada de credencial em código ou em arquivo versionado. Tudo por variável de
ambiente, documentado em `.env.example` sem valor real.
