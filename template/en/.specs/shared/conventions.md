# Conventions

Rules **every** change respects. When a change's `plan.md` contradicts this file, either the plan is
wrong or this file needs updating first — never the two versions coexisting.

## Naming

| Element | Pattern | Example |
|---|---|---|
| Code file | kebab-case | `create-user.ts` |
| Directory | kebab-case | `use-cases/` |
| Class / type | PascalCase | `UserRepository` |
| Function / variable | camelCase | `findByEmail` |
| Module constant | SCREAMING_SNAKE_CASE | `ATTEMPT_LIMIT` |
| Database table | snake_case, plural | `users` |
| Column | snake_case | `created_at` |
| Environment variable | SCREAMING_SNAKE_CASE | `DATABASE_URL` |

## Directory structure

Organize by feature, not by file type. A resource gathers what belongs to it, instead of scattering
it across parallel `controllers/`, `services/`, `models/` folders.

```
src/
└── <resource>/
    ├── …
    └── …
```

Settle the concrete design in the first change and bring it back here once it is closed.

## Errors

- An expected error is a return value or a typed domain exception — never a bare thrown string.
- An error message describes what failed and what to do, without leaking internal detail (stack, SQL,
  credentials) to the response.
- Every external boundary (HTTP, queue, cron) has explicit error handling.

## Validation

External input is validated at the boundary, once, before touching business logic. The domain core
may assume already-validated data. See the `shared-validation-rule` skill for the concrete pattern.

## Tests

- Every mandatory requirement in a `spec.md` has at least one test.
- The test name describes the behaviour, not the method: `rejects duplicate email`, not
  `testCreateUser2`.
- Tests do not reach the external network. External dependencies are replaced at the boundary.

## Comments

A comment explains **why**, not **what**. What the code does, the code already says. If a comment has
to explain what the line does, it is the line that is confusing.

## Commits

`<type>: <description in the imperative>`, with types `feat`, `fix`, `refactor`, `test`, `docs`,
`chore`. When a commit closes a change, cite its ID: `feat: idea registration (007)`.

## Secrets

No credential in code or in a versioned file. Everything through environment variables, documented in
`.env.example` with no real values.
