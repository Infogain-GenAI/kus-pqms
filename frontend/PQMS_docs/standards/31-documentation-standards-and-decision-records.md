# 31 — Documentation Standards and Decision Records
**Tier:** 2
**Status:** DRAFT — new in this revision; the ADR format is adopted from a
working precedent, the register rules are not yet exercised
**Purpose:** What documents exist, where they live, how a decision is recorded
once it is made, and which documents are generated rather than written
**Extends:** 18-project-context-and-implementation-status.md (the register),
00-core-rules.md (source precedence)
---

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Why this file exists

This corpus has decisions everywhere. The BRD ratifies thirteen. Tier 18's
register tracks thirty-six open placeholders. Every tier file carries paragraphs
that are, in substance, decisions with their reasoning attached.

**What it has never had is a rule for what happens when one closes.** A
placeholder resolves into a paragraph edit, in whichever file happened to carry
the marker, and the reasoning — the options considered, who decided, what would
reopen it — is lost at the moment it becomes most valuable. Six months later
somebody proposes the rejected option and nothing in the repository can say it
was already rejected, or why.

The prior repository solved this and this corpus did not notice: it has a
numbered, dated architecture decision record with named deciders, and a
generated reference folder with an explicit regenerate-don't-hand-edit rule.
Both are adopted below.

## Document classes — four, and they behave differently

| Class | Examples | Rule |
|---|---|---|
| **Standard** | every tier file in this folder | Hand-written. Governs code shape. Tiered; ties break by tier. |
| **Specification** | `component-specs/*.md`, `screen-descriptions/*.md` | Hand-written against a template. Governs one artefact. |
| **Decision record** | `decisions/NNNN-*.md` | Hand-written once, then **immutable except for status**. |
| **Reference** | `analysis/vue-baseline-audit.md`, tier 18's status section, the generated distribution document | **Regenerated, never hand-edited.** Evidence, never authority. |

The distinction that matters is the last one. **A reference document records what
was true at a moment; a standard records what must be true.** Confusing them is
how a snapshot becomes a rule nobody voted for.

### Reference documents carry three things, always

1. **A date.** Undated evidence is unfalsifiable.
2. **The method, and its limit.** "Read from files; nothing was executed" is a
   complete and honest method statement, and it tells a reader exactly which
   claims to re-verify.
3. **A precedence disclaimer.** Where a reference disagrees with a standard, the
   standard wins and the disagreement is a reason to re-open the standard — not
   a licence to follow the reference.

Tier 18's implementation-status section and `analysis/vue-baseline-audit.md`
both carry all three. Any new reference document does too.

### Regenerate rather than patch

> This is a point-in-time snapshot, not a live sync. If the repository changes
> significantly, this folder should be regenerated rather than hand-edited
> piecemeal, to avoid it silently drifting out of sync the same way it
> identified drift in other documents.

That is the prior repository's rule for its generated reference folder, and it
is exactly the rule this corpus already enforces for its own distribution
document via `pnpm docs:standards:check`. **Generalise it:** a half-updated
snapshot is worse than a stale one, because a stale one is visibly stale and a
half-updated one is not.

## Architecture decision records

### When one is required

**Whenever a `[PLACEHOLDER]` in tier 18's register closes, and the answer was
not obvious.** Also whenever a choice is made between two defensible
architectures, whenever a standard in this corpus is deliberately not followed,
and whenever an interim implementation is accepted with a different target.

Not for: a value that the prototype or the BRD supplies (that is a lookup, not a
decision), or a preference with no consequence (record it in the tier file and
move on).

### Location and naming

```
PQMS_docs/decisions/NNNN-short-kebab-title.md
```

Four digits, zero-padded, allocated in order and **never reused**. The number is
the citation handle: tier files reference `ADR-0007`, not a filename.

### Required structure

```markdown
# ADR NNNN — Title

- **Status:** Proposed | Accepted | Accepted (interim) | Superseded by ADR-NNNN
- **Date:** YYYY-MM-DD
- **Deciders:** named people, not a team name
- **Related:** the tier files, BRD sections and placeholders this touches

## Context
## Decision
## Consequences
## Options rejected
```

Four rules about the content, each of which the precedent gets right:

- **Context quotes the conflicting sources by path.** ADR 0001's context names
  two of its own documents that pointed in different directions and quotes
  both. That is what makes it re-readable by someone who was not there.
- **Deciders are people.** "The team" cannot be asked a follow-up question.
- **`Accepted (interim)` is a first-class status**, and an interim decision must
  state what the target is and what closes the gap. ADR 0001 does this with a
  table mapping each interim file to the package it later lifts into.
- **Options rejected is not optional.** It is the section that stops the
  rejected option coming back, and it is the only part of the document that is
  hard to reconstruct later.

### Lifecycle

An ADR is **immutable once accepted**, except for its `Status` line. A decision
that changes gets a **new** ADR that supersedes the old one, and the old one's
status is updated to point forward. Editing an accepted ADR in place destroys
the thing it exists to preserve.

### Wiring back into the corpus

Closing a placeholder is **three edits in one commit**:

1. The ADR is written.
2. The owning tier file replaces its `[PLACEHOLDER]` marker with the
   decision, citing the ADR.
3. Tier 18's register moves the row to its "Closed since the last revision"
   table with the ADR number.

**All three, or none.** A closed placeholder with no ADR loses the reasoning; an
ADR with the marker still in place means two files disagree about whether the
question is open.

## What a tier file is, structurally

Every file in `standards/` opens with the same block — H1 as `NN — Title`, then
`**Tier:**`, `**Status:**`, `**Purpose:**`, and optionally `**Extends:**` or
`**Supersedes / absorbs:**` — followed by `---` and the precedence line naming
00. This is not decoration: `scripts/build-standards-doc.mjs` parses it, and a
malformed header produces a malformed distribution document.

Four conventions the generator and the reader both depend on:

- **Numbering is contiguous.** A gap means a file was deleted, and a deleted
  standard leaves dangling citations.
- **Cross-references use the full filename**, so they resolve as links and so a
  rename is greppable. A bare number is ambiguous — `14` has meant both this
  corpus's tier 14 and the BRD's §14 in the same sentence, and did.
- **Prose is hand-wrapped at roughly 76 characters** and Prettier does not touch
  Markdown (14-code-style-and-linting.md), so wrapping stays a semantic choice.
- **Status is one of** `DRAFT`, `APPROVED — REVISION n`, `LIVE`, `SKELETON`. A
  status is changed by a review, never by an edit that happens to touch the
  file.

## One owner per concern

00-core-rules.md's corpus map assigns every concern to exactly one tier file.
The rule this file adds is what to do when a concern has **no** owner.

**Do not put it in the nearest file.** That is how a tier file becomes a
grab-bag and how the corpus map stops being true. Either it is a new tier file,
or it is a genuine sub-concern of an existing owner and goes there with the
owner's name attached.

`analysis/vue-baseline-audit.md` §19 lists fourteen concerns the prior
repository handles, or visibly fails to handle, that no tier file claimed. Some
have since been assigned. **The remainder are open and are tracked as
placeholders in tier 18's register, not as prose in this file** — a list of
unowned concerns living in the file about documentation is itself an ownership
failure.

## The distribution document is generated

`Frontend-Development-Standards-v1.0.md` is built from the tier files by
`scripts/build-standards-doc.mjs` and **is never hand-edited**. Edit a tier
file, regenerate, commit both. `pnpm docs:standards:check` fails CI when they
diverge.

This is the concrete instance of the reference-document rule at the top of this
file, and it is the one that is already enforced.
