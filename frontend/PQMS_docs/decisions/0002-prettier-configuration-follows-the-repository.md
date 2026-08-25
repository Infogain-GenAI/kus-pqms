# ADR 0002 — Prettier configuration follows the repository, not the corpus

- **Status:** Accepted, 2026-08-25
- **Deciders:** Prisilla Ghadi
- **Related:** `../standards/14-code-style-and-linting.md` (Prettier section —
  corrected by this ADR), `../standards/00-core-rules.md` (Source precedence,
  case 5), `../standards/30-restructuring-an-existing-react-project.md`
  ("What to do when the existing project conflicts"),
  `../../RESTRUCTURE-BASELINE.md` (the measurement), `../steps-for-new-repo.md`
  Step 5

---

## Context

Two documents specify Prettier for this project and they disagree on every
setting that has a visible effect.

`14-code-style-and-linting.md` states, under "Prettier":

> Real settings, verbatim:
> `printWidth: 100`, `tabWidth: 2`, `semi: true`, `singleQuote: false`,
> `trailingComma: "all"`, `endOfLine: "lf"`
> … Provenance: carried forward verbatim from `kus-pqms`
> (`frontend/.prettierrc.json`).

`frontend/.prettierrc`, present in this repository since before the corpus
arrived, states:

```json
{ "semi": false, "singleQuote": true, "trailingComma": "all",
  "printWidth": 120, "tabWidth": 2 }
```

They agree on `tabWidth` and `trailingComma` and disagree on `printWidth`
(120 vs 100), `semi` (false vs true) and `singleQuote` (true vs false).

**The code matches the local file.** `src/main.tsx` and every other module are
written without semicolons and with single quotes. This is not a codebase that
drifted from a standard; it is a codebase that has consistently followed a
different one.

The measurement, recorded in `RESTRUCTURE-BASELINE.md` and re-run for this
decision: with the *local* config, 42 files under `src/` differ from Prettier's
output. With `14`'s values the figure would be every file, because `semi` and
`singleQuote` change essentially every line of every module.

## Decision

**`frontend/.prettierrc` governs. `14`'s stated values are withdrawn and the
file is corrected to record the repository's values as authoritative for this
repository.**

`14`'s values are not replaced with a different absolute — the corrected text
says that a consuming repository's existing, consistently-followed formatter
configuration wins, and records these values as this repository's.

**Prettier is declared as a devDependency and no format gate is added yet.**
The formatting baseline — one commit that changes nothing else, with its SHA in
`/.git-blame-ignore-revs` — is deferred, because Phase 1's acceptance criterion
is every gate green on unmodified source and 42 files currently differ.

## Consequences

### This is the same precedence that already settled two other questions

`00-core-rules.md`'s source precedence has produced this answer twice already,
and both times the local artefact won over the written standard:

- **The ordinal spacing scale.** `--space-8` meant 8px in the prior Vue
  repository and means 32px in the current prototype. Trusting the carried-over
  value would have shipped spacing wrong by 4×.
- **The seven-status vocabulary.** The BRD's canonical eight were superseded by
  the prototype's seven per the 2026-08-23 directive, and `statusMap.ts`
  implements seven.

`30`'s conflict table names this case directly: *"a convention the existing
project follows consistently and well, that this corpus contradicts — raise it
as a question against the standard. A consistent convention is evidence; a rule
that contradicts one deserves to be re-argued rather than mechanically
applied."* This ADR is that question, answered.

### The provenance defect matters more than the values

`14` did not derive its Prettier settings from anything in this project. It
carried them "verbatim from `kus-pqms`" — a different repository, in a different
framework, for a different product — and presented them with the same confidence
as a sourced value.

**That is `00`'s source-precedence case 5 violated inside the corpus itself.**
Case 5 exists because "a value that was already sourced and cited … can silently
stop matching the current prototype", and it instructs: *"before finalizing any
design-token literal value, re-derive it directly from the current prototype …
never trust a prior citation's value, however well-sourced it looked at the
time, including citations from this corpus's own earlier revisions or from the
legacy Vue codebase."*

Case 5 is written about *token literals*. **It generalises, and this is the
evidence that it must**: the same failure mode — a value carried forward from
`kus-pqms` without re-derivation, wearing a provenance line that makes it look
checked — produced a wrong answer about formatter configuration, which is not a
token value at all. `14`'s own "Export conventions" and "Two compiler flags"
sections cite `kus-pqms` in the same way and were **not** re-examined here; they
may be right, and they have not been checked. That is recorded as an open row
in `18`'s register rather than asserted either way.

**A provenance line is a record of where a value came from. It is not evidence
that the value is correct here.**

### What does not change

`14`'s Prettier *rules* all stand: exactly one config, no per-package overrides,
Prettier ignores `**/*.md`, `eslint-config-prettier` last in the chain, and the
`.gitattributes`/`eol=lf` requirement. Only the six literal values move.

## Options rejected

**Adopt `14`'s values and reformat the codebase.** Rejected on cost and on
timing, not on principle. It rewrites every line of every file; it must be a
single mechanical commit with a blame-ignore entry; and Phase 1 forbids touching
`src/` at all. It is also the option that would have been chosen by mechanical
rule-following, which is exactly what `30` warns against.

**Delete `.prettierrc` and leave the question open.** This was the initial
recommendation and it was wrong. Editors format-on-save with their own bundled
Prettier regardless of project dependencies, so with no config present it falls
back to Prettier's **defaults** — 80 columns, semicolons, double quotes — which
is a more destructive rewrite than the config that is there. Deleting the config
does not remove the formatter; it removes the only thing constraining it.

**Keep both and scope them per-directory.** Rejected: `14` requires exactly one
config with no per-package overrides, and a two-tier formatting policy inside one
package is the "codebase people stop reasoning about" that `30` names.

**Leave `14` uncorrected and note the deviation locally.** Rejected because of
precedence. `14` is Tier 1 and would keep asserting values that contradict the
code; the next person to apply the corpus mechanically would reformat the tree
on its authority. `00` records this exact failure — "a stale value in Tier 0
outranks every file that has it right" — one tier up.
