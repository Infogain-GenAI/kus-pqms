# 01 — Project Structure and Architecture
**Tier:** 1
**Status:** APPROVED — REVISION 8

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Context: this is a deliberate target structure
This file specifies how the React app is organized. It is written as a
**target structure to build to**, not as a set of corrections to an
existing tree — there is no prior React code in this repository to
correct.

Several rules below were derived from a prior Vue implementation of
this product (repo `kus-pqms`), where the same organizing questions had
been answered inconsistently across sibling features. That
inconsistency is the *reason* certain rules here are stated as firmly
as they are — notably the feature-folder depth rule, the single
`shared/` location, and the `ui-library` category placement. Where a
rule below carries such provenance, it is cited inline so the rule's
basis is checkable rather than asserted.

Provenance for this section specifically — the inconsistencies these
rules exist to prevent, observed in `kus-pqms`:

- Sibling features under `components/IssueManagement/` were grouped at
  wildly different depths: one fully flat, one flat-with-one-exception,
  one subdivided six levels of folders deep.
- `composables/` and `services/` were flat despite holding
  feature-specific code — of 14 service files, 12 belonged to one
  feature and 2 to another, with none genuinely shared.
- `ui-library` had category folders but two components sitting
  uncategorized directly under `components/`.

None of that is a description of this repository. It is why the rules
below are rules.

## Build sequencing: dependency order, nothing more
There is no framework transition here, no coexistence window, and no
build-boundary problem. `ui-library` and `design-tokens` are **created
fresh from these standards**, not converted in place. Sequencing is
therefore ordinary dependency ordering.

**Package build order** — each depends on the one above it:

1. **`packages/design-tokens`** — token values only. Nothing depends on
   anything else, so it goes first. `ui-library` cannot be styled
   without it.
2. **`packages/ui-library`** — in dependency order internally:
   `base/` primitives first (everything else composes them), then
   `composite/`, `data/`, `feedback/`, `layout/`, `navigation/`,
   `overlay/`, and `pqms/`.
3. **`apps/portal`** — feature screens, which consume both
   packages.

**The portal shell runs in parallel, not after.** It does not import
`ui-library`, so it is not gated on it: routing and layouts (per
07-routing-and-layouts.md), auth middleware (per
08-authentication-and-authorization.md), Zustand and TanStack Query
setup (per 04-state-management.md), Vite/ESLint/test-harness
scaffolding (per 00, 02, 10, 14), and the HTTP client with its
`registerAccessTokenGetter` seam (per
05-api-integration-and-data-fetching.md).

Start the shell early regardless of library progress. It carries the
most unfamiliar work in the project — middleware chains, auth
bootstrap, the fixtures-mode auth bypass — and that work is far cheaper
to get wrong in week one than in the week before shipping.

**The only real gate is per-component, not per-phase**: a portal screen
cannot import a `ui-library` component that has not been built yet. It
is not blocked on the library being *finished*. Build the primitives a
screen needs, then build the screen.

**No build step in either package.** `design-tokens` and `ui-library`
both type-check only (`tsc --noEmit`) and their `exports` fields point
directly at source; whatever bundles the app compiles them. Carried
forward as a deliberate choice from `kus-pqms`, where both packages
worked this way — it keeps the packages editable without a watch step
and matches the entry points specified under "Package ownership" below.

**Storybook is the component verification surface**, and it needs
setting up: configure `@storybook/react-vite` as part of `ui-library`'s
work. Provenance: `kus-pqms` ran Storybook for its Vue components via
root `storybook`/`build-storybook` scripts, so the practice carries
forward — but the React builder is new work here, not an inherited
capability.

## Feature-folder depth rule (`apps/portal` components)
A feature folder **stays flat** until either:
- (a) it exceeds **~15 files**, or
- (b) it contains **2+ genuinely distinct sub-concerns** — different
  parts of a screen, not just "many components" of the same concern.

When either threshold is crossed, group **by sub-area/concern**, not by
component type and not by UI tab.

If a screen has real tabs, **tab folders stay thin wrapper components
only** — the actual components live in their sub-area folder and get
imported by the tab wrapper, never duplicated into the tab folder.

So for Issue Details: `tabs/InvestigationTab/InvestigationTab.tsx` is a
thin wrapper, while the real investigation UI (forms, pickers, cards)
lives in a sibling `investigation/` folder and is imported by that
wrapper. Provenance: this is the one part of `kus-pqms`'s
`IssueDetails/tabs/` structure that worked well and is carried forward
deliberately — there, it emerged by accident rather than from a stated
rule, which is why it is stated as a rule here.

## Shared components — one location only
`src/components/shared/` is the **only** folder allowed to be named
`shared`, and it holds only genuinely reusable components — used by 2+
features.

Two consequences that follow directly:

- **Feature-specific constants go in a folder named for what they are**,
  not in a "shared" folder — e.g.
  `components/IssueManagement/constants/`.
- **A component used by one feature stays in that feature's folder.**
  `IssueLinkSearchModal` is used only within Issue Management, so it is
  a normal Issue Management component. Being reusable *in principle* is
  not the bar; being used by 2+ features is.

Provenance: `kus-pqms` had a second, feature-scoped
`IssueManagement/shared/` folder holding constants and one modal, which
collided with the app-wide `shared/` and made "is this shared?"
unanswerable from a path. Hence the exclusivity rule above.

**General principle**: any category folder name (`constants/`, `types/`,
`components/`, etc.) may exist at multiple nesting levels — app-wide at
`src/` root, or feature-scoped inside that feature's folder — because
the path itself disambiguates scope. Never invent a prefixed name (e.g.
`issueManagementConstants/`) to fake uniqueness. The one exception:
**`shared` itself is reserved exclusively for the single app-wide
`src/components/shared/` location** — no other folder anywhere may be
named `shared`.

## `ui-library` category structure
Every component lives in exactly one of these category folders under
`packages/ui-library/src/components/` — none sit at `components/` root:

- **`base/`** — single-element primitives.
- **`composite/`** — embeddable, multi-part input-like widgets.
- **`data/`** — complex data-grid/table components and their dedicated
  cell-renderer sub-components.
- **`feedback/`** — non-interactive status communication.
- **`layout/`** — structural containers.
- **`navigation/`** — wayfinding controls.
- **`overlay/`** — content that escapes normal document flow/stacking
  context, rendered via `ReactDOM.createPortal`.
- **`pqms/`** — domain-specific, non-generic components.

**Not a component category, but a required sibling folder**:
`packages/ui-library/src/types/` holds the shared variant/state/size
type vocabulary (`variant.types.ts`, `state.types.ts`,
`size.types.ts`) that the `Base*` components' own `.types.ts` files
alias — the `Pqms*`-prefixed types owned by
06-styling-and-design-tokens.md's "Component naming". It sits alongside
`components/`, not inside it.

**Two placements that are easy to get wrong, so they are stated
explicitly:**

- **`BaseModal` belongs in `overlay/`.** It uses the same
  escape-the-flow mechanism as `BaseTooltip` and `BaseReasonGate`
  (portal to the document root, positioned above the normal stacking
  context). `BaseReasonGate` is built directly on top of `BaseModal`,
  so the two must not end up in different categories.
- **`BaseDataTable` belongs in `data/`**, not `composite/` — it does
  not fit `composite/` by complexity or role. Its dedicated
  cell-renderer sub-components (`MultiValueCell`, `TruncatedTextCell`)
  go in `data/` alongside it, not in a separate folder.

Provenance for both: in `kus-pqms` these two components sat
uncategorized at `components/` root while every other component was
filed under a category. They are called out here because that is the
default failure mode for exactly these two — a modal and a table both
feel like they belong "everywhere," which is how they end up nowhere.

### This file does not enumerate the components — and nothing else does yet
**Read this before acting on the categories above.** You now have eight
category folders and no inventory to put in them. That is a real gap,
not an omission you should fill by inference.

**What is missing, in two parts:**

1. **No component list.** No file in this corpus enumerates the
   `ui-library` component set. Components are named here and there — in
   this file, in 06-styling-and-design-tokens.md, in
   11-accessibility-standards.md — always incidentally, as examples of
   some other rule. (An earlier revision of this paragraph put counts
   on those mentions — "four", "seven", "about six" — and every count
   was wrong; the real distinct counts are 5, 13 and 8. The counts are
   dropped rather than corrected: see the generated distribution
   document's derived index for the current figures, computed from the
   corpus rather than remembered from it.) Those mentions are **not**
   an inventory and must not be assembled into one: a list stitched
   together from scattered examples would be missing whatever no rule
   happened to mention, and nobody would know which.
2. **No component APIs — this is the larger half.** Even a complete
   list of names would not be buildable. Nothing in this corpus
   specifies what a component's interface *is*: `BaseSelect`'s options
   shape, whether it is controlled or uncontrolled, what a
   `BaseDataTable` column definition contains, which props are
   required. This file governs **where** components live and how they
   are grouped; 03-react-component-patterns-and-naming.md governs
   **prop-naming conventions and composition patterns**;
   06-styling-and-design-tokens.md governs **styling and the headless
   primitive**. Three files of conventions. None of them is a
   specification, and conventions do not compose into one.

**Source and trigger**: both are derived from **the prototype** — see
17-domain-glossary-and-business-context.md's "Prototype register" —
because the prototype shows which components the real screens actually
use and how they behave. That derivation is **pass-4 work**, not a
decision anyone makes in advance and not something to shortcut here.

**A candidate inventory exists and is not the derivation.**
`PQMS_docs/component-specs/INVENTORY.md` lists ~69 components with a
confidence per row, derived from the **BRD's** screen inventory and
functional requirements rather than from the prototype. It is useful for
sizing, for build ordering, and for the reconciliation pass — and it is
**not** a substitute for reading the prototype. Its own header says so.

The distinction matters for the same reason this section exists: a list
assembled from a source that does not govern is confidently wrong in
unknown places. The BRD governs behaviour, so it can tell you a
keyboard-navigable combobox is required; it cannot tell you the screen
also contains an icon-only dismiss button, because that is a visual fact
and only the prototype has it.

### Where component specifications live
**This file owns the placement and naming of component specifications**
— they are files in a folder, which is what this file governs.
`component-specs/TEMPLATE.md` owns what goes *inside* one.
10-testing-standards.md owns nothing here: it governs where a
`.spec.tsx` **test** file lives, and a markdown contract is not a test
file. Keeping the two apart is deliberate — the word "spec" doing two
jobs is exactly the conflation to avoid.

- **Location**: `PQMS_docs/component-specs/`, a sibling of
  `PQMS_docs/standards/`.
- **One file per component, named for the component**: `BaseSelect.md`,
  `BaseDataTable.md`. The filename matches the component's name exactly,
  including case — so the spec for a component is findable from its name
  without an index.
- **Sub-components**: a sub-component with its own public API gets its
  own file (`MultiValueCell.md`). One that is purely internal to its
  parent is described inside the parent's spec, not given a file.
- **Flat, not mirrored.** The folder does not reproduce the eight
  category folders above. A component's category is a field inside its
  spec; duplicating the taxonomy in the filesystem would give a
  recategorised component two places to be wrong.

**A spec's lifecycle is its component's.** Renaming a component renames
its spec in the same change; **deleting a component deletes its spec**,
in the same change and not into an archive folder. A spec left behind
for a component that no longer exists is worse than no spec at all — it
does not read as history, it reads as a contract, and the next person
will build against it.

**Specs are for `ui-library` only.** App-level components in
`apps/portal` — screens, page wrappers, layouts, feature
components — do not get specs. The argument for a spec is a public API
with an unbounded, unknown set of call sites: a shared component cannot
see its consumers, so its contract has to exist somewhere they can both
read. An app component has **one** caller, usually the route that
renders it, and its contract can live where it is used. Writing specs
for them would produce documents whose only reader is the person who
just wrote the component.

07-routing-and-layouts.md is the working precedent: it specifies
`DefaultLayout`, `FixedHeightLayout` and `BlankLayout` inline, next to
the route tree that mounts them, because that is their one call site and
their whole contract is a few sentences about height and scrolling.
That is the right shape, and this rule generalises it rather than
overriding it.

**What that does not mean**: the prototype still governs app screens,
and more of them than it governs components. But what it governs there
is layout, copy, which components appear and which states exist — a
description of a screen, not an API contract. So app screens do have a
written source; it is a different artifact, in a different folder.

### `PQMS_docs/screen-descriptions/` — the sibling folder
**One file per screen**, a sibling of `standards/` and
`component-specs/`. A **screen description says what a screen contains
and what it does**; a **component spec says what a component's API
is**. The first is an input to the second — you cannot specify
`BaseDataTable`'s API without knowing what Issue List does with it, and
the component inventory itself is derived the same way: read a screen,
see which controls it contains.

Each description records **which prototype file and which reading it
came from**, and is current as of that reading rather than permanently
— the same caveat 17's Prototype register carries, and for the same
reason.

**29-screen-description-authoring.md owns what one must answer.** It is
deliberately not a template — 18-project-context-and-implementation-
status.md's decision was that the *shape* should follow from the first
prototype read rather than precede it, and 29 respects that by listing
the questions a description must answer rather than the form it takes.
Write the first description, then write the template from it if one is
still wanted.

**Not a tier file.** A spec is a per-component contract revised when the
prototype changes, on a different clock from a standards file, and it
**never overrides a standard**. If a component cannot satisfy a
standard, that is a standards question raised against the standards
file — not a local exception written into a spec.

So this gap now points at a real location with a known shape, which is
the most that can be done before the derivation itself.

**Until it lands**: do not build `ui-library` components speculatively
from these conventions. The conventions tell you a component is
correctly *placed*, *named*, and *styled* — they cannot tell you it is
the right component with the right interface. Tracked in
18-project-context-and-implementation-status.md.

## `hooks/` and `services/` — feature grouping

**`services/`**: group entirely by feature — `issue-management/` and
`notification/` subfolders. **Do not create a shared `services/`
folder** until a genuinely cross-feature service exists. Provenance: in
`kus-pqms`, of 14 service files 12 belonged to Issue Management and 2 to
Notifications, with zero shared — a flat `services/` folder implied a
sharing that was not there.

**`hooks/`** — the folder is `hooks/`, matching React's terminology.
Split into feature-scoped and generic:

- **Feature-specific hooks nest under their feature folder** —
  e.g. `useIssueLock`, `useWorkspaceTabs`, `useExpandAll`.
- **Genuinely generic, cross-feature hooks live in a top-level
  `hooks/` folder** — e.g. `useDebouncedCallback` and `usePermissions`
  (renamed from `useCapability` — see
  08-authentication-and-authorization.md's "Permission model").

**Do not build a generic async-state wrapper.** A hook that returns
`{ data, loading, error, run }` around an arbitrary async function is
superseded entirely by TanStack Query (per 04-state-management.md),
which does the same job with caching, deduplication, and background
refetch that a hand-rolled wrapper will not have. Provenance:
`kus-pqms` had exactly such a hook (`useAsyncQuery`); it is deliberately
not recreated here. If you find yourself writing one, you are
reimplementing the query library.

## Package ownership
- **`packages/ui-library`**: framework-level, reusable components only.
  No feature-specific logic, no direct API calls, no state-management
  library usage inside base components. (A headless accessibility
  primitive is none of those — see 06-styling-and-design-tokens.md's
  scoped exception.)
- **`packages/design-tokens`**: token source of truth. No component
  logic.
- **`apps/portal`**: feature/screen implementation. Consumes
  `ui-library` and `design-tokens`, owns state, routing, API
  integration.

**Package entry points** — build these exactly:
- `@pqms/ui-library` exports `"."` (main barrel),
  `"./markdown-editor"` (heavy-dependency subpath, per
  14-code-style-and-linting.md's barrel-exclusion convention), and
  `"./styles"` (`tokens.css`).
- `@pqms/design-tokens` exports `"."` and `"./styles"`.

Provenance: this is the entry-point shape `kus-pqms` used
(`packages/ui-library/package.json`, `packages/design-tokens/
package.json`), carried forward unchanged — the `markdown-editor`
subpath in particular is what keeps the editor's dependency weight out
of every consumer's bundle.

## Placeholders
The folder name for any feature not named above — Overview, QIR
Management, TSB Management — is [PLACEHOLDER — to be resolved when that
feature is actually built].

## Four folder rules the shipped Vue portal settles

The prior repository was audited file by file on 2026-08-24
(`../analysis/vue-baseline-audit.md`). Four of its findings are structural
and belong here rather than in the audit, because they are rules.

### `config/` — the declarative-configuration layer, and it is owned here
The prior portal has a folder this file's ownership table had no row for:

| File | What it holds |
|---|---|
| `config/navigation.ts` | nav items, plus the capability filter over them |
| `config/issue-columns.config.ts` | table column definitions |
| `config/issue-kpis.config.ts` | KPI strip definitions |
| `config/notification-categories.config.ts` | a notification taxonomy |
| `config/data-source.ts` | the fixtures predicate |

These describe **what a screen shows**, not how it renders — extracted out of
the components that consume them. It is not an optional layer once a table has
fifteen columns and three roles see different subsets of them, and
27-forms-tables-and-overlays-review.md's table checklist already assumes column
definitions live somewhere nameable.

**The rule.** Declarative screen configuration is a real layer and takes the
`<domain>.config.ts` suffix. **It is feature-scoped, not app-scoped** — it goes
in `features/<feature>/config/`, for the same reason `hooks/` and `services/`
are feature-grouped above. A flat app-level `src/config/` is what this file
exists to replace; only genuinely app-wide configuration (navigation) sits at
the app level.

### A folder is not created before something lives in it
The prior portal has **six empty directories** in its working tree —
`src/modules/`, `src/plugins/`, `src/shared/modules/`,
`src/shared/composables/`, `src/shared/directives/`, `src/shared/components/` —
and separately has both `src/composables/` (populated) and
`src/shared/composables/` (empty), which is two plausible homes for one file
kind.

**An empty folder is a claim about architecture that nothing is honouring**, and
it is worse than no folder: the next person files something there because it
exists, not because it belongs. Do not scaffold folders ahead of content. If a
location genuinely must be reserved, reserve it in this file, not in the tree.

30-restructuring-an-existing-react-project.md's Phase 2 deletes any it inherits.

### Categories that nothing checks are suggestions
The prior `ui-library` has seven category folders where its own architecture
document specifies six — **and `BaseDataTable` and `BaseModal` sit directly
under `components/`, in no category at all.** Those are the two largest and
most-used components in the library. They arrived first, never got filed, and
nothing failed.

So: the eight categories this file specifies need a check, not just a
paragraph. Either the barrel enumerates by category, or a lint rule constrains
the path depth under `components/`. **Absent a check, expect the same
outcome.**

### An escape-hatch category is better than the two alternatives
The prior library has a `pqms/` category holding `BaseCommentCard` — a
component that is product-specific but still purely presentational. It is the
honest answer to a primitive that turns out to be domain-shaped, and it beats
both alternatives: forcing it into `base/` (which corrupts the meaning of
`base/`) or duplicating it per feature.

**Adopt the escape hatch.** A component qualifies only if it is presentational —
no data fetching, no store access, no routing. Domain *shape* is permitted;
domain *behaviour* is not.

## Where this package is going — the shared-package target
The prior repository's ADR 0001 records a target the React repository should
decide about **on day one rather than inherit as an interim**: the HTTP client
lifts to a `packages/api-client`, and the auth stack to a
`packages/infrastructure/auth`. Both were built app-level there because there
was one app and no backend, with barrel imports (`@/shared/http`) as the
extraction seam so call sites would not move later.

**The seam is worth copying regardless of the destination.** Consumers import
from a barrel, never from the module that will move.

**[PLACEHOLDER — whether `api-client` and `auth` are workspace packages from
the start or app-level behind a barrel. Trigger: before the HTTP client is
written. Owner: Frontend Lead.]** Under `DEC-08` (one monolith backend, one
origin) the case for a separate package is weaker than it was under three
services.

## Splitting a flat project into the workspace — the observed case

ADR 0001 settles it: **`frontend/` is always a pnpm workspace; the project is
never flat.** Where an existing project arrives flat — one `src/` directly under
`frontend/`, no `apps/`, no `packages/` — the split is Phase 2 work
(30-restructuring-an-existing-react-project.md) and this section is its map.

| Currently | Goes to |
|---|---|
| `src/components/**` (the design-system port, behind a barrel) | `packages/ui-library` |
| `src/icons/**` — the only sanctioned icon path, generic | `packages/ui-library` |
| `src/styles/design-system/**` + its manifest + both token scripts | `packages/design-tokens` |
| `src/tokens/*.generated.ts` | `packages/design-tokens` |
| `src/app/**`, `src/features/**`, `src/data/**`, `src/styles/global.css` | `apps/portal` |

**App-wide shared primitives stay in the app.** A `chrome.tsx`-style module
holding `PageContainer`, `Modal` and `SectionCard` is generic enough to argue
for `ui-library` and is also the app's own chrome. This file's
`src/components/shared/` location exists for exactly that case. Moving it later
is a separate decision.

### The split changes what tooling can see, and two failures are silent

**This is the part that costs a release if missed.** Any tool keyed on a path or
an import specifier stops matching when the code moves — and a lint rule whose
glob matches nothing **does not error. It reports zero violations and the build
goes green.**

| Keyed on | On the move |
|---|---|
| A file glob like `src/**/*.{ts,tsx}` | now several `src/` roots — **fails silently** |
| Import-restriction patterns like `components/**` | components are now `@scope/ui-library` — **fails silently** |
| A CSS scrape path | **fails loudly** — the gate errors |
| A generated-file output path | **fails loudly** |

**So the rule is: the move and the tool re-pointing land in the same commit, and
the commit records the violation count before and after.** An unchanged count is
the evidence the tooling still sees the code.

**A count that drops to zero is not success.** It is the silent failure above,
and it looks exactly like a clean result.

### Where the adaptation goes
A vendored ruleset is a byte-copy and is never edited
(00-core-rules.md, and the same rule that governs vendored token CSS). **Alias
and specifier twinning belongs in the app-side wrapper that executes it** —
adding a package-specifier pattern beside the existing bare and `@/` ones leaves
the vendored file byte-identical, which is what keeps it re-verifiable against
its source.

### The acceptance test for the split
**A workspace split is a pure move**, so any screenshot or fidelity comparison
should be **byte-identical before and after**. Where such a harness exists it is
the strongest available proof that the move changed nothing, and it belongs in
the Phase 2 acceptance criteria alongside an unchanged test count.

One ordering constraint that survives the move and gets less obvious: **where a
stylesheet import must come first** — because the bundler emits CSS in import
order and a component import above it inverts the cascade — **that constraint is
unchanged when the path becomes a package specifier.** Restate the reason in the
moved file; it stops looking local, and the next reader tidies it.
