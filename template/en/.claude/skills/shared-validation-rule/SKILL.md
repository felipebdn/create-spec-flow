---
name: shared-validation-rule
description: The project's pattern for validating external input at the system boundary — where to validate, how to name the schema, how to shape the error. Use when creating or changing any endpoint, form, queue handler or CLI command that receives data from outside.
---

# Validation rule

An implementation mold. It also serves as an example of how a code-pattern skill is written in this
project: one rule, one mold, and the list of what not to do.

> **State:** generic while the stack is not defined in `.specs/memory/stack.md`. Once the stack is
> settled, rewrite the examples with the library actually chosen.

## Rule

External data is validated **once, at the boundary**, before touching business logic. Past the
boundary, the domain core assumes valid, typed data, and does not re-validate.

The boundary is every entry point: an HTTP handler, a form action, a queue consumer, a scheduled job,
a CLI command, a webhook.

## Where it lives

One schema file per resource, next to the resource's code — not in a global `validators/` folder. The
schema is part of the resource, not a separate layer.

```
src/<resource>/
├── <resource>.schema.<ext>   # input schemas and the type derived from them
└── <resource>.<boundary>.<ext>  # handler: validate, delegate, shape the response
```

## Mold

```
// <resource>.schema.<ext>
// One schema per operation. Name: <Operation><Resource>Input.
CreateIdeaInput = object({
  title:       text().min(1).max(120),
  description: text().max(2000).optional(),
})

// The domain type DERIVES from the schema. Never declare both by hand in parallel:
// they diverge at the first change and the compiler will not warn you.
type CreateIdeaInput = infer<typeof CreateIdeaInput>
```

```
// <resource>.<boundary>.<ext>
handler(request) {
  result = CreateIdeaInput.validate(request.body)
  if (!result.ok) return errorResponse(422, formatErrors(result.errors))

  // from here down, valid and typed data
  idea = createIdea(result.data)
  return response(201, idea)
}
```

## Error shape

One shape, across the whole project:

```json
{
  "error": "validation",
  "message": "Invalid data.",
  "fields": [
    { "field": "title", "message": "Required." }
  ]
}
```

- `422` for malformed input; `400` stays for a broken request.
- The per-field message is written for whoever is filling in the form, not for whoever wrote the code.
- Never leak internal detail — a column name, SQL, a stack, a file path.

## Rules

- Validate the shape, not the business rule. "well-formed email" is validation; "email already
  registered" is a business rule and lives in the domain, with its own error.
- Validate on input **and** on output from an external system. A third-party API response is external
  data just as much as user input.
- Bound the length of every free-text field. A field with no limit is an abuse vector.
- Frontend validation is an interface convenience and does not replace the backend one. Both use the
  same schema when the stack allows sharing.

## Do not

- Re-validate the same data at every layer — it hides where the source of truth is.
- Validate inside the business rule, mixing shape and meaning.
- Return only the first failure: return all of them at once.
- Coerce silently (`"12"` becoming `12`) unless the schema says it coerces.
- Declare the domain type by hand in parallel with the schema.
