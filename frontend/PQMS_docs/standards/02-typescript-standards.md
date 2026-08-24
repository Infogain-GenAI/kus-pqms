# 02 — TypeScript Standards
**Tier:** 1
**Status:** APPROVED — REVISION 2

## Purpose
TypeScript conventions for this React app.

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Baseline: required `tsconfig.base.json` values
`tsconfig.base.json` at the workspace root is the shared base, extended by all three
packages. Build it with these values:

| Option | Value | Note |
|---|---|---|
| `strict` | `true` | Non-negotiable |
| `noUncheckedIndexedAccess` | `true` | See below |
| `target` | `"ES2022"` | See below |
| `lib` | `["ES2022", "DOM", "DOM.Iterable"]` | |
| `jsx` | `"react-jsx"` | No JSX pragma import needed |
| `noUnusedLocals` | `true` | See below |
| `noUnusedParameters` | `true` | See below |
| `moduleResolution` | `"bundler"` | |
| `allowImportingTsExtensions` | `true` | |
| `isolatedModules` | `true` | |
| `noEmit` | `true` | Type-check only; the bundler emits |
| `skipLibCheck` | `true` | |
| `esModuleInterop` | `true` | |

Provenance: `strict`, `moduleResolution: "bundler"`,
`allowImportingTsExtensions`, `isolatedModules`, `noEmit`,
`skipLibCheck`, and `esModuleInterop` are carried forward from the prior
Vue implementation of this product (repo `kus-pqms`,
`frontend/tsconfig.base.json`), where they were already
bundler-appropriate and needed no revisiting. The four that are **not**
carried forward as-is are called out below, because each is a
deliberate change rather than an inheritance.

**`noUncheckedIndexedAccess: true` — new, stricter than the
provenance.** `kus-pqms` did not set this anywhere. Expect it to
surface real errors on array and record access (`arr[i]` becomes
`T | undefined`) the first time it applies to any given file. Treat
those as real bugs to fix, not noise to suppress — an unchecked index
is how a runtime `undefined` reaches a component.

**`target` / `lib`: `ES2022`, in the base config directly.** Three
reasons, and this is the one baseline value that changes emitted syntax
rather than only type-checking:

- **React Router v8 itself targets ES2022.** Its v8.0.0 release sets
  tsconfig `target`/`lib` to ES2022 "across the board" (see
  00-core-rules.md's sourcing note). Consuming an ES2022-targeted ESM
  library from an ES2020 project is the kind of mismatch that surfaces
  as a confusing downlevel-iteration or unexpected-syntax error during
  scaffolding — not at install time, when it would be cheap to
  diagnose.
- **The verified floors already guarantee the runtime.** Per 00, the
  stack requires Node 22.22.0+ and Vite 7+, both of which support
  ES2022 natively. There is no runtime that can reach this code and not
  understand ES2022.
- **Nothing here needs downlevelling.** Every package in this
  repository is new and every one of them targets React. There is no
  legacy consumer, so there is no reason to emit older syntax.

`kus-pqms` used `ES2020`, which is where an earlier revision of this
file inherited it from. That value existed because its base config was
shared with Vue packages; **that constraint does not exist here**, so
the base config goes to ES2022 directly rather than being overridden
per package.

**`noUnusedLocals` / `noUnusedParameters`: both `true`.** Provenance
worth recording because it explains why you may see them disabled in
older PQMS configs: `kus-pqms` deliberately left both unset, and its
`tsconfig.base.json` carried a comment explaining that `vue-tsc` cannot
see `<script setup>` bindings used only in a `<template>` as reads, so
the flags produced false positives on legitimate component state. That
reasoning is **Vue-specific and does not apply here** — in React, JSX
usage is ordinary TypeScript usage and the compiler sees it. Set both
to `true`. If scaffolding turns up a concrete conflict, flag it rather
than silently dropping the setting.

**Path aliases** — `@pqms/design-tokens` and `@pqms/ui-library` are
declared via `paths`. **RESOLVED: declared once, in `tsconfig.base.json`,
alongside `baseUrl: "."`.** Each package's own `tsconfig.json` extends the
base and re-declares nothing.

This was previously a `[PLACEHOLDER]`, on the grounds that `paths`
resolves relative to `baseUrl` and that `baseUrl` inheritance through
`extends` had bitten this project before — `kus-pqms` hand-duplicated the
declarations per package with adjusted relative depth, which read like a
workaround for exactly that. **Declaring once was tried and it works**, so
the duplication is not carried forward.

**One thing the resolution turned up that the placeholder did not
anticipate.** TypeScript 6.0 deprecates `baseUrl`/`paths` ahead of removal
in 7.0 (TS5101), so the base config carries
`"ignoreDeprecations": "6.0"` to suppress the warning rather than
switching mechanisms mid-scaffold. **That is a deferral, not a
resolution**, and it has a real trigger: a TypeScript 7 upgrade removes
the mechanism entirely and the aliases move to `imports` (Node subpath
imports) or to the bundler's own resolution. **[PLACEHOLDER — the
TypeScript 7 alias mechanism. Trigger: a TypeScript 7 upgrade being
considered. Owner: Frontend Lead.]**

## `any` — hard ban, no exceptions
`any` is never used in application code. This applies to variables,
function parameters, return types, and generic defaults, with no
carve-out for "it's just a quick script" or "third-party lib."

### Untyped third-party libraries
When a package has no types and no `@types/*` package exists:
1. Check for `@types/<package-name>` first — install it if it exists.
2. If none exists, write a minimal ambient declaration in a `.d.ts` file
   scoped to that package, e.g.
   `apps/portal/src/types/vendor.d.ts`:
```typescript
   declare module 'untyped-package-name' {
     export function someFunctionYouActuallyUse(arg: string): void;
   }
```
   Only declare the shape you actually consume — not a full guess at
   the library's entire API surface.
3. If the shape genuinely can't be known ahead of use (e.g. a plugin
   returning fully dynamic data), the import boundary uses `unknown`,
   never `any`, followed immediately by a narrowing function
   (type guard or schema parse) before the value is used anywhere else.

**There is no precedent to copy for this, in this corpus or its
provenance.** `kus-pqms` had exactly one `@types/*` package
(`@types/node`) and three `.d.ts` files (`env.d.ts` ×2,
`route-meta.d.ts`), all of them first-party Vite/Vue-Router ambient
types or module augmentation — none was an untyped-third-party-lib
shim. So the three-step procedure above is the specification, not a
description of something already done. Follow it as written the first
time it is needed.

## Domain types: string literal unions, not `enum`
Use string literal unions with `as const`, not TypeScript `enum`, for
all domain values (issue status, system classification levels, channel
types, DTC-related codes, etc.).

```typescript
export const ISSUE_STATUS = [
  "OPEN",
  "INVESTIGATING",
  "MONITORING",
  "QIR_ESCALATION",
  "TOP_ISSUE",
  "RESOLVED",
  "OUT_OF_SCOPE",
  "CLOSED",
] as const;
export type IssueStatus = (typeof ISSUE_STATUS)[number];
```

**These are the real eight values**, not an illustrative subset —
BRD/NPQMS-ISM-customized-BRD.md (C1.0, draft for ratification,
2026-08-20) **§9.1**, ratified as `DEC-01`. Each is documented with its
label and meaning in 17-domain-glossary-and-business-context.md.

### This replaces a ten-value set, and the correction is worth recording
An earlier revision of this section gave **ten** lowercase values —
`draft, open, review, pendingApproval, monitoring, escalated, topissue,
resolved, outofscope, closed` — carried forward from the prior Vue
implementation (`kus-pqms`, `src/api/issues.ts`) and asserted as "the real
ten values". **That set is superseded.**

- **The provenance was real and the conclusion was wrong.** The ten values
  genuinely existed in shipped code. But `kus-pqms`'s status union was
  never a committed business requirement — its own source comment
  describes the set as a deliberate superset of a UX mockup's eight
  statuses, with `draft` and `pendingApproval` added by the implementation.
  A shipped value is evidence of what was built, not of what was agreed.
- **Per 00's Source precedence, the BRD governs behaviour** — and which
  states an issue may occupy is behaviour, not code shape. This file
  governs how the union is *expressed*; it does not get to choose its
  members.
- **`DEC-01` removes two of them deliberately, with mitigations.**
  `DRAFT` is gone because an issue exists only once registered — the
  entry-form working copy is a per-user draft artifact with no Issue ID,
  in no list and no count (BRD `FR-ENT-030`…`034`), and it is **not** an
  `IssueStatus`. `PENDING_APPROVAL` is gone because approval is a property
  of a *transition*, not a state: a gated transition creates a proposal
  record and the issue's own status does not change until it is approved.
- **Do not add either back to this union to model those two cases.** They
  are separate types. A `DRAFT` member would put a non-record in the same
  vocabulary as a record, and a `PENDING_APPROVAL` member would make the
  transition matrix in BRD `§9.3` unrepresentable.

**Two files must not disagree about the same domain type: if this union
changes, 17 changes with it.** That rule is why this correction touches
both, and it is also how the earlier defect would have been caught sooner
had anyone applied it in the other direction.

**The casing changed too, and deliberately.** The BRD writes these as
`SCREAMING_SNAKE`; the wire format is whatever the API returns. Use the
BRD's spelling as the union's members so a reader can match a value to
`§9.1` without a mapping step — and if the backend's wire format differs,
that difference is a **mapper's** job per
05-api-integration-and-data-fetching.md, never a second vocabulary.

### Two shapes, and which one to use
Both shapes are legitimate. The choice is not stylistic — it turns on a
single question, *does anything read these values at runtime?*

- **`as const` array + derived type** — when anything needs the values
  at **runtime**: a filter dropdown or picker that renders one option
  per value, a Zod enum built from the list, a validation check, a test
  fixture that iterates every case, or an exhaustiveness guard that
  needs the array. `IssueStatus` is squarely in this category — the
  Issue List filter drawer renders its values — which is why the
  example above uses it.
- **Bare `type X = "a" | "b"` union** — when the values are only ever
  needed at **type-check time**. Component-prop vocabularies are the
  common case: a size, a placement, a tint variant. These are consumed
  as prop types and nothing iterates them, so the array buys nothing.

**Apply the test per union, every time. Do not default to the array
form.** A reviewer can answer the runtime question from the call sites,
and two people answering it independently get the same result — which
is the point of framing it as a test rather than a preference.

Provenance for why this is a test and not a blanket mandate: in
`kus-pqms` there were **71 bare string-literal unions across 31 files**,
and roughly 65 of them had no runtime consumer at all. A rule requiring
the array form everywhere would have delivered an unused runtime list to
the large majority of them. That ratio is the evidence the test exists
to respect — expect the same shape of distribution here, with bare
unions the common case and the array form the deliberate exception.

Note this is deliberately unlike the consolidate-on-one-approach
decisions elsewhere in these standards, such as
10-testing-standards.md's single test-placement convention. Those exist
where two patterns had no principled distinction between them. Here
there is one, so two shapes is the correct end state rather than debt.

Reasoning, not just assertion:
- API payloads are plain strings. A `enum` requires a mapping step in
  both directions (enum member ↔ wire value); a string literal union
  *is* the wire value, no translation layer.
- i18n keys are plain strings already, so a union member interpolates
  straight into a key lookup:
  ```ts
  title: t(`${key}Title`),
  description: t(`${key}Description`),
  ```
  A string literal type lines up directly with that; an enum member
  does not. Note the key is built **inside the component's own
  namespace**, per 09-i18n-and-localization.md's per-component
  convention — never a global `issueStatus.*`-style namespace, which is
  the shared-default-namespace shape 09 explicitly forbids. Keys are
  per-component and camelCase, e.g. `statusOpen` / `statusPending`.

  Provenance: this interpolation pattern is carried forward from
  `kus-pqms`
  (`frontend/apps/pqms-portal/src/components/IssueManagement/
  IssueDetails/resolution/ResolutionSectionSelector.vue`), where it was
  the working precedent for building a key from a union member inside a
  component namespace.
- Cascading/dependent dropdowns (System Classification, Model Code) pass
  the selected value straight through to filtering logic and API calls —
  string unions avoid an enum-to-string conversion at every one of those
  boundaries.

This is a deliberate standard for this project's domain shape, not a
blanket "enums are always wrong" claim — documented here so it isn't
re-litigated per-component.

## Type organization: co-located per component
Mirroring the i18n convention (`ComponentName.i18n.ts` next to
`ComponentName.tsx`), component-specific types live in
`ComponentName.types.ts` next to the component file.

**Shared/cross-cutting domain types** (the string-union types above, API
response shapes used by more than one feature) live in
`apps/portal/src/types/`. Types shared *within* one feature but not
across features live in a `types/` folder inside that feature's own
folder — e.g. `src/components/IssueManagement/types/`.

**This file owns the types path**, not 01. 01 deliberately grants the
general permission and stops there — "any category folder name
(`constants/`, `types/`, `components/`, etc.) may exist at multiple
nesting levels — app-wide at `src/` root, or feature-scoped inside that
feature's folder — because the path itself disambiguates scope" — so the
specific path is settled here, in the file that owns type conventions.
It is consistent with 01 rather than a deviation from it, and it matches
the `src/types/` location this file already uses for vendor ambient
declarations above.

Two constraints from 01 that apply directly:
- **Never name either folder `shared`.** 01 reserves that name
  exclusively for the single app-wide `src/components/shared/`.
- **Never prefix for uniqueness** (`issueManagementTypes/`) — the path
  already disambiguates scope.

The bar for promoting a type to `src/types/` is real use by 2+ features,
matching 01's bar for shared components. A type used by one feature
stays in that feature, and a type used by one component stays in its
`ComponentName.types.ts`.

## Common type patterns
[To be filled in with concrete examples once the first real components
are built — API response wrapper, async/query state shape (aligned with
TanStack Query's own return shape, not a custom `AsyncState<T>`
reinvention), form state typing. Placeholder — do not draft generic
examples divorced from an actual PQMS screen; ground each example in a
real Issue Entry / Issue Detail type once available.]

## TypeScript version — the target repository runs 5.9, not 6

This file carries a placeholder about the TypeScript 7 path-alias mechanism,
written on the assumption that the repository runs TypeScript 6 where
`baseUrl`/`paths` are deprecated.

**`docs/STACK.md` records TypeScript 5.9.3, target ES2024**, across both
`frontend/` and `infra/`. On 5.9:

- **`baseUrl` and `paths` are not deprecated.** The alias declaration this file
  specifies is current, supported, and raises no warning.
- **The TS 7 placeholder is premature, not wrong.** It stays open — the upgrade
  will come — but its trigger changes from "a TS 6 upgrade being considered" to
  **"a TypeScript 6 or 7 upgrade being considered"**, and nothing about the
  current configuration needs to anticipate it.

**`target`/`lib`.** This file and 00 specify ES2022 on React Router v8's
authority. The target repository is on **ES2024**, which is strictly higher and
therefore satisfies the floor. **Do not downlevel it to ES2022** — the floor is
a minimum, and lowering a working target to match a document is the wrong
direction. Record ES2024 as the value and ES2022 as the constraint it clears.

**Strictness.** `STACK.md` confirms `strict` is on and `tsc --noEmit` runs as
part of the build. 14-code-style-and-linting.md's rule that `noUnusedLocals` and
`noUnusedParameters` belong in the compiler still applies and is still unmet —
verify in Phase 0 rather than assuming either way.
