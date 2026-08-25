---
name: spec-adopt-context
description: Brings context that already exists — README, ADRs, wiki, tickets, specs from another tool — into `.specs/`, and checks that nothing was lost on the way. Use when adopting this flow on a project that already has documentation, or when porting material from any other source.
---

# Adopt context that already exists

The flow assumes the project's context lives in `.specs/`. On a project that already exists, it is
scattered — README, ADRs, wiki, code comments, someone's head. Bringing that here is **translation**,
not copying, and translation loses things silently.

This skill is the procedure, plus the way to check that it worked.

## Where each thing goes

| What you have | Where it lives |
|---|---|
| what the project is, what stage it is at | `CLAUDE.md`, the state section |
| technology, versions, build and test commands | `memory/stack.md` |
| an architectural decision with a reason — an ADR, a "why not X" | `memory/decisions.md` |
| naming, error shape, commit convention | `shared/conventions.md` |
| domain vocabulary, a term the code freezes | `shared/glossary.md` |
| product rules per area, numbered invariants, formulas | `domain/<area>.md` |
| pending work | `changes/`, through the `spec-new-change` skill |

**What has no home probably should not be ported.** A record of finished work already lives in the
code and in the history; rewriting it as prose is a duplicate paid for on every read.

## The ceilings apply to what arrives

`memory/` and `shared/` are read on every change. Old context usually arrives large, and dropping it
in whole blows the ceiling on day one — rules in `spec-ceilings-and-pruning`.

What does not fit is domain rules, and it goes into `domain/`, which is read selectively and has no
ceiling. If it does not fit there either, the material is mixing decisions with historical record:
only the decision crosses over.

## Checking that nothing was lost

Mechanical comparison fails in three ways, and it is worth knowing all three before trusting a result.

### Normalize whitespace before comparing

Wrapped prose destroys line-by-line comparison: the same sentence written across two lines does not
match itself written on one, and the tool returns "missing" without warning you the problem is its own.

Join the text, collapse whitespace, compare afterwards:

```
target = collapse_whitespace(concatenate(all_the_md)).lowercase()
```

### The matcher raises candidates, not conclusions

Three outcomes are **indistinguishable** to a literal comparison, and only one is a defect:

| What happened | The comparison says | Is it a loss? |
|---|---|---|
| the sentence is gone | missing | **yes** |
| the sentence was rewritten | missing | no — same fact, other words |
| the question was settled | missing | no — it became a decision, and going missing is correct |

Every reported absence needs a **second pass by content**. Concluding straight from the first pass
reintroduces dead text and reopens settled decisions — the damage runs both ways, not only towards
losing.

### Cut by length, or you audit noise

Compare sentence by sentence, ignoring short lines: headings, table separators and bullets say
nothing and fill the result with false positives.

## Declared absence

Content you choose **not** to port is written down with the reason, in the place where it would have
lived. A silent absence passes for coverage, here as everywhere else in the flow.

The most common case: an old convention the flow already covers. Do not port it — say that you did
not, and why.

## When you finish

Report how many absences the comparison reported, how many were actual losses, and what you chose to
leave out with the reason for each.
