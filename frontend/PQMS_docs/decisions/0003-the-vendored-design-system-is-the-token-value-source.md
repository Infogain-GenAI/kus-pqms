# ADR 0003 — The vendored design system is the token value source

- **Status:** Accepted, 2026-08-25
- **Deciders:** Prisilla Ghadi
- **Related:** `../standards/06-styling-and-design-tokens.md` (token values),
  `../standards/00-core-rules.md` (Source precedence, case 5),
  `../steps-for-new-repo.md` decision 1,
  `../../RESTRUCTURE-BASELINE.md` (the measurements),
  `0001-frontend-is-always-a-pnpm-workspace.md` (which package these files move
  into)

---

## Context

`06-styling-and-design-tokens.md` was written expecting token values to be
*authored* — derived from the prototype, reviewed, and written into a
`packages/design-tokens` package that did not yet exist. Its rules are about how
to author them well and how to keep them honest afterwards.

The repository turned out to already have something stronger, and it arrived
before the corpus did:

- **`design-system-manifest.json`** — 156 tokens with names and literal values,
  vendored from the design system's own shipped output.
- **`src/styles/design-system/tokens/*.css`** — five CSS files defining the same
  156 custom properties, a **byte-copy** of the same source.
- **`scripts/check-tokens.mjs`** — a drift gate asserting the CSS matches the
  manifest, token by token.
- **`scripts/gen-tokens.mjs`** — generates a typed `tokens.generated.ts` map and
  a `cssVar()` helper from the manifest.

Measured for this decision (`RESTRUCTURE-BASELINE.md`, re-run):

- **156 manifest tokens; 156 CSS custom properties; 0 defined in CSS but absent
  from the manifest.** Coverage is complete in both directions today.
- **`tokens:check` passes.**
- **`tokens.generated.ts` is byte-identical to what the manifest regenerates.**
- **1,829 `var(--x)` references across 119 distinct names, 0 unresolved.**

Two facts made the question live rather than obvious. `tokens:check` was **not in
`build`** and the hooks that could run it were stubs — *"a gate that has never
failed is indistinguishable from a gate that does not run"*. And `cssVar()`, the
typed accessor that would make a bad token name a compile error, has **zero
adoption**: 0 call sites against 1,829 raw `var()` uses.

## Decision

**The vendored design system is the token value source. `06`'s authoring rules
yield to it.**

Concretely:

- **`design-system-manifest.json` is the source of truth for token values.** Not
  the CSS, not `tokens.generated.ts`, not a value read off the prototype.
- **The CSS and the typed map are downstream artefacts**, both verified against
  the manifest by gates, both byte-copies or generated, and **neither is ever
  hand-edited**.
- **A token value is changed by re-vendoring the design system**, never by
  editing a file in this repository.
- **`06` continues to govern everything else** — naming, the ordinal scale's
  meaning, semantic mapping, and its rule that a hardcoded value must trace to a
  real source.

The gates that make this enforceable were built in Phase 1: `tokens:check` and a
new `tokens:drift` are in `build` and in `pre-commit`, and `lint:css-vars`
validates every `var(--x)` against the manifest.

## Consequences

### This is a stronger source than the corpus assumed existed

`06` is written for a repository that must *decide* its token values. This one
receives them, with a manifest and a drift gate attached. **A value with a
machine-checkable provenance beats a value with a well-argued derivation**, and
that inverts the usual direction: the corpus normally corrects the repository,
and here the repository supplies something the corpus was planning to build.

### It closes 00's case-5 hazard for this class of value entirely

`00`'s source-precedence case 5 warns that a token literal cited from an earlier
revision or from `kus-pqms` "can silently stop matching the current prototype",
and requires re-deriving values rather than trusting citations. Two confirmed
instances are recorded there: `--space-8` meaning 8px in the prior repository and
32px in the current prototype, and a disabled-background token cited as
neutral-400 when the prototype computes neutral-100.

**With the manifest as the source and a drift gate on it, that failure cannot
occur silently for these 156 values** — a re-vendor that changes a value fails
`tokens:check` until the CSS is updated with it. The hazard remains for any value
*not* in the manifest, which is exactly the residue Step 8 has to give a home.

### What it does not solve

- **Values the design system does not express.** `#DDE3E9` control borders,
  11.5/12.5px type, the 186px label column, `#F0F2F5`. These are **prototype
  constants, not token failures**, and Step 8 gives them one named module rather
  than leaving forty magic numbers scattered.
- **The ordinal-scale trap survives.** `--space-4` is 16px and `--space-8` is
  32px. Nothing in the manifest stops someone reading `--space-8` as 8px, and
  `06` still owns that warning.
- **`cssVar()` adoption stays at zero, deliberately.** Converting 1,829 call
  sites is a large, fidelity-risky change to source. `lint:css-vars` gets the
  same property — every name validated — more cheaply and more broadly, because
  it also reaches plain CSS where `cssVar()` cannot.

### Phase 2 moves all of it into one package

Per ADR 0001, `src/styles/design-system/**`, `design-system-manifest.json`, both
token scripts and `src/tokens/` become `packages/design-tokens`. **Both token
gates fail loudly when their paths break**, which makes them the easy half of
that move — unlike the lint globs, which fail silently.

## Options rejected

**Author token values in the corpus and treat the vendored files as one input.**
Rejected. It would replace a machine-checked source with a hand-maintained one
and re-open exactly the drift `00`'s case 5 exists to prevent. It is also more
work for a worse guarantee.

**Treat the CSS byte-copy as the source and the manifest as documentation.**
Rejected on tooling: the manifest is what `gen-tokens.mjs` and `check-tokens.mjs`
both read, and it carries structured names and values that CSS parsing would have
to reconstruct. Making the CSS primary would mean rewriting both gates to parse
the artefact rather than read the source.

**Drive `cssVar()` adoption so the type system enforces token names.** Rejected
for now, and recorded because it is the obvious counter-proposal. It is strictly
better where it applies — a bad name becomes a compile error — but it applies
only in TypeScript, requires touching 1,829 call sites during a phase where the
fidelity captures are the acceptance test, and `lint:css-vars` already covers
every occurrence including CSS files. **Revisit when the captures are no longer
the primary proof of correctness.**

**Defer the decision until a real design-system release process exists.**
Rejected: the files, the manifest and the gate already exist and are already
being relied on. Deferring would leave the most-used values in the codebase
formally unsourced while informally sourced from exactly these files.
