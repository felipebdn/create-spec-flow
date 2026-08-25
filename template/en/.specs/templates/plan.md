# Technical plan — NNN-slug

Companion to `spec.md`. This is where the **how** goes. If anything here contradicts `spec.md`,
`spec.md` wins — or `spec.md` needs fixing before implementation starts.

## Approach

Two or three paragraphs about the chosen design. Name the pattern that already exists in the project
and that this change follows (the matching skill in `.claude/skills/`, when there is one).

## Files affected

| File | Action | What changes |
|---|---|---|
| `src/…` | create | … |
| `src/…` | edit | … |

## Sequence

1. A technical step, in the order it has to happen.
2. …

## Contracts

Signatures, request/response shapes, table schema — whatever another change will depend on. Anything
stable and reusable should be promoted to `.specs/shared/`.

```
// contract example
```

## Risks and mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| … | … | … |

## How to validate

The exact commands that prove the change works. Take them from `.specs/memory/stack.md` — do not
invent a test command the project does not have configured.

```bash
# e.g. npm run test -- path/to/test
# e.g. npm run build
```
