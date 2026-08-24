# 03 — React Component Patterns and Naming
**Tier:** 1
**Status:** APPROVED — REVISION 9

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
Hook return shape, callback-prop conventions, content-composition
patterns, error-boundary placement, TanStack Query's interaction with
those boundaries, and the React Compiler's effect on manual
memoization.

This file owns **conventions** — how a component's surface is shaped and
named. It does not specify any individual component's API; see
01-project-structure-and-architecture.md's "This file does not enumerate
the components" for what that gap is and who fills it.

## Custom hook return shape
**A named object of values/functions is the default shape.** Return
`{ ... }` even when there is only one thing to return today, so the
surface can grow a second member without breaking every call site.

**The one exception**: a hook whose entire purpose is producing a single
callback for direct use returns **the callback bare**, not wrapped in an
object. A hook is in this category when its return value has exactly
one meaningful use — being called — not when it merely happens to have
one field today. If the surface could plausibly grow a second
value/function later, it stays object-shaped from the start.

`useDebouncedCallback` is the live instance of that exception, and it is
a hook this repo builds: a generic, cross-feature hook in the top-level
`hooks/` folder per 01, required by 12-performance-guidelines.md for
search-input debouncing. It takes the callback and a delay and returns
the debounced callback directly. It is **not** part of 01's
component-specification gap — that gap covers `ui-library` components,
and this is an app-level hook whose contract is fully determined by the
rule above plus 12's stated use.

Provenance for the default: in the prior Vue implementation of this
product (repo `kus-pqms`, `frontend/apps/pqms-portal/src/composables/`),
6 of 7 composables returned objects — including one with only a single
function to return — and exactly one, `useDebouncedCallback`, returned
its callback bare. The split is not an accident of that codebase; it is
the distinction this rule generalises.

## Callback props
Every event a component raises is a **callback prop**. Four conventions
apply, in order of how often they're needed:

**Standard case**: `onEventName` props — `onClick`, `onChange`,
`onSubmit` — one callback per distinct event.

**Two-way-bound values**: a `<name>` value prop paired with its own
`on<Name>Change` callback, once per independent piece of state — **not**
a single generic `value`/`onChange` pair carrying several. So `selected`
+ `onSelectedChange`, `open` + `onOpenChange`. This is the Radix/shadcn
precedent, named here so it isn't relitigated component-by-component.

A component exposing **several** such pairs is fine and the rule scales
to it — one prop/callback pair per binding, no consolidation into a
generic pair. `BaseDataTable` is the likely first case, where pagination
and sort state are the plausible candidates, but its API is not
specified in this corpus (see "Parameterized content" below).

Provenance: `kus-pqms` used Vue's `v-model:x` for this, with exactly
two named bindings across the whole codebase — `v-model:selected` and
`v-model:open`, three usages total — and no single component exposing
more than one. So the two React pairs named above are the ones with a
direct antecedent; the multi-binding case is the rule extending
forward, not a translation of something that existed.

**Native-event collision**: when a component needs to expose both a
semantic callback (e.g. "the selected value changed") and forward the
underlying native DOM event, the semantic callback is named
`onValueChange` and **receives the value directly, never the event**. A
separately named prop carries the raw native event only if a consumer
genuinely needs it.

This one is worth stating as firmly as it is because the failure is
silent: a callback named `onChange` that hands its consumer an event
object where a value was expected type-checks in plenty of call sites
and breaks at runtime. Provenance: in Vue, `@change="handler"` on a
native input passes the raw DOM event by default, so this was the
single most common defect when adapting a form component — the name
survived and the payload didn't.

**Payload shape**: more than one meaningful argument collapses into a
single object parameter — `onSelect({ row, index, event })`, not
positional `onSelect(row, index, event)`. A positional multi-argument
callback can't grow a new field later without breaking every existing
call site's argument order; an object parameter can.

**Every forwarded prop is declared explicitly.** A wrapper component
passes through only what it declares — there is no implicit
pass-through of unlisted props or handlers to a root element. Declare
and thread each one.

This is stated because it is a real, easily-underestimated cost on
every wrapper-shaped component, not a naming decision made once.
Provenance: Vue's `$attrs` fallthrough did this implicitly, so a
wrapper could re-emit a prop it never named. React has no equivalent,
which means each such prop becomes a line of code that did not
previously exist. Budget for it per wrapper.

## Content composition
How a component accepts content from its consumer, in four tiers of
increasing structure:

**Simple, single-region content** maps to the **`children` prop**. This
is the common case and needs no convention beyond standard React
`children` typing.

**Multiple distinct named regions** map to **named props accepting
`ReactNode`** — `<BaseModal header={...} footer={...}>` — not a
children-based slot API. Each region is just a prop. Provenance: this
replaces Vue's named slots, which `kus-pqms` used for exactly this
(`BaseModal` had `title`, default, and `footer` slots); the three
regions carry forward, the mechanism does not.

**Parameterized content** — where the component hands data back to the
content it is rendering — maps to a **render-function prop**. For
tabular data specifically, that means a **column-definition array,
where each column carries its own render function** receiving the row,
rather than the component owning cell markup. A column with no render
function falls back to rendering the raw cell value.

This is the pattern class, and it matches how table libraries such as
TanStack Table express the same thing — it is not a bespoke invention.
Provenance: `kus-pqms`'s `BaseDataTable` did this with a per-column
scoped slot (`` `cell-${column.key}` ``) receiving
`{ row, value, column }`, falling back to the raw value when the
consumer supplied none. The shape of the idea carries forward; the slot
mechanism does not.

### `BaseDataTable`'s column API is a specification this corpus does not contain
**Read this before building it.** The paragraph above gives you a
*direction* — column-definition array, per-column render function — and
that is genuinely all it gives you. It is not a contract, and it should
not be treated as one.

What is **not** specified anywhere in this corpus: what fields a column
object carries beyond a key and a renderer; whether a column declares
its own header or receives one; how sorting is expressed (per-column
flag? comparator? server-driven sort key?); how row selection is
expressed and whether it is single or multi; how column visibility is
declared; what the render function receives beyond the row; whether
rows need a stable id and where it comes from.

**And the three non-row states — empty, loading, error — are entirely
unaccounted for.** A table renders four things, not one, and only rows
have been discussed. For each of the other three, whether it is a prop,
`children`, or built-in behaviour is a genuine API decision.

The error state in particular is load-bearing rather than cosmetic,
because this file has already decided something that constrains it: per
"TanStack Query and error boundaries" below, **inline error UI driven by
`useQuery`'s own `error` state is the default**, and `throwOnError` is
the narrow exception. Inline means the error renders *inside* the
screen's layout, next to or in place of the table — which implies the
table is what renders it, not the screen wrapping it. If instead the
screen owns the error state, then every consumer of `BaseDataTable`
reimplements it. Pick one deliberately; both are defensible and they
are not equivalent.

**This is a component specification, owed by pass 4** — the same gap
01-project-structure-and-architecture.md records for the `ui-library`
set as a whole, and `BaseDataTable` is its largest single instance. It
is written as a file in `PQMS_docs/component-specs/`, against the
required sections in that folder's `TEMPLATE.md` — a template this list
effectively drafted, since the questions below are the ones every
component spec has to answer. The
source is the prototype (see 17-domain-glossary-and-business-context.md's
Prototype register), because the answers are facts about what the Issue
List screen actually does, not conventions derivable from this file.

**Do not fill this in by inference.** The corpus mentions table-adjacent
facts in several places, and stitching them into a contract would
produce something confidently wrong. Those mentions are **inputs the
eventual specification must account for**, not the specification:

- Sort, page, page-size, and column-visibility state are all client
  state, held per 04-state-management.md's issue-filters store — so the
  table is a controlled component for at least those four concerns, and
  each needs a prop/callback pair per the two-way-binding rule above.
- Sticky headers and sticky columns are in scope, and
  11-accessibility-standards.md flags them against WCAG 2.4.11 (focus
  not obscured) as needing explicit verification.
- Dedicated cell-renderer sub-components live in `data/` alongside the
  table, per 01 — so the render-function shape has to be usable by a
  standalone component, not only an inline arrow.
- 06-styling-and-design-tokens.md's headless-primitive exception does
  **not** currently list `BaseDataTable`; if the eventual API needs
  grid keyboard navigation, that is a row to add there, not a decision
  to make here.
- **Virtualization is deferred, and if it lands it changes the
  row-rendering contract.** 12-performance-guidelines.md defers its
  large-lists guidance because the approach depends on this component's
  implementation — row height, cell content — while this file defers the
  API. The two deferrals run in opposite directions and could deadlock,
  so **12 states its side explicitly**: its section "Large lists and
  tables — what this file needs from `BaseDataTable`'s API" lists the
  API facts whose answers decide which strategies stay available, and
  the reason each matters. **Read that section before finalizing this
  API**, not after. Its first question — the maximum page size — may
  close the item outright, since sort/page/page-size are already client
  state. If it does not, note what is at stake: a render-function
  contract permitting arbitrary cell content, arbitrary row heights and
  previous-row dependence cannot be windowed later without a breaking
  change.

Until the specification exists, `BaseDataTable` is not buildable, and
the direction above is not a licence to start.

**Compound components** (`Component.SubComponent`, sharing implicit
context) are **in scope, but reserved** for multi-part components where
subcomponents genuinely need shared state without manually prop-
drilling it — not a default composition style to reach for elsewhere.
The one identified candidate is `BaseTabs`, and it has a real open
choice between two shapes: **config-driven** (an array of tab configs,
with panel content rendered outside the component by the consumer
switching on the active tab key — see 01's `IssueDetails/tabs/` thin-
wrapper pattern, which is what consumes it) or a **compound-component
API** (`Tabs.List` / `Tabs.Trigger` / `Tabs.Panel`).

[PLACEHOLDER — decide when `BaseTabs` is specified.] Provenance for why
config-driven is the incumbent option rather than a new proposal:
`kus-pqms`'s `BaseTabs` was purely config-driven with zero slots, and
that approach shipped and worked. It is the lower-risk default; the
compound API is the more idiomatic-React alternative. Note this choice
interacts with 06's headless-primitive exception, which lists
`BaseTabs` as a candidate **only** if the compound API is chosen.

Do **not** default to compound components anywhere else without the
same multi-part-with-shared-context justification. `BaseTabs` is a
candidate because of what it is, not because compound components are
generally preferred.

## Forms and validation
**Form validation is Zod schemas, never hand-rolled per-field checks.**
Do not write a validation function that runs a sequence of `if`-checks
and returns `{ valid, errors }` — that is the shape a schema replaces.
The Zod version is pinned in 05-api-integration-and-data-fetching.md;
this file owns form-level usage, 05 owns the version pin and the
API-response validation policy, and a version bump on either side must
be checked against the other.

Provenance: `kus-pqms` validated Issue Entry exactly that way
(`useIssueEntryValidation.ts`, a manual `if`-sequence returning
`{ valid, errors }`), which is the concrete thing this rule exists to
prevent recreating.

**Co-location**: a form's schema lives alongside its form component,
following this file's existing type-organization convention (per
02-typescript-standards.md's `ComponentName.types.ts` co-location
pattern) — e.g. `IssueEntryForm.schema.ts` alongside `IssueEntryForm.tsx`,
not a shared, cross-feature schemas folder.

**Error display**: a Zod parse failure produces structured, per-field
issues via `ZodError.issues` — drive field-level error messages from
that directly, rather than reconstructing a parallel error shape by
hand.

**But Issue Entry needs errors grouped per step, and Zod will not give
you that.** It is a multi-step wizard, and a `ZodError.issues` array is
flat and schema-shaped, not step-shaped. An adapter from Zod issues to
per-step error display is therefore **real, required work** — not
something Zod's output format makes automatic, and not something to
discover late. Provenance: `kus-pqms` carried a
`{ step, fieldKey, message }` error shape for precisely this reason;
the shape is replaced, the requirement it served is not.

Field-level grounding for the eventual schema, carried forward from
`kus-pqms`
(`frontend/apps/pqms-portal/src/components/IssueManagement/IssueEntry/
useIssueEntryValidation.ts`), where the required fields across three
steps were: `title` and `description`; `modelCodes` (at least one);
years per selected model code (at least one per code, keyed
`year:${code}`); and `system` / `subsystem` / `component` / `symptom`.

[PLACEHOLDER — the concrete Zod schema and the step-grouping adapter
over `ZodError.issues` are written when Issue Entry is specified. The
field list above is provenance to check the specification against, not
the specification itself — the prototype governs what the form actually
contains.]

## Error boundaries
React Router v8 exposes an `ErrorBoundary` property on a route object —
a component reference assigned per route (e.g. `{ path: "/", Component:
Root, ErrorBoundary: RootErrorBoundary }`, per
reactrouter.com/how-to/error-boundary) — scoped to the closest such
boundary in the route tree above where the error occurred.

**The boundary's real scope in this app is narrow, and that should be
stated plainly rather than oversold.** Per 08-authentication-and-
authorization.md's middleware architecture, most routes carry no
loader — the middleware chain handles auth/permissions, not data
loading. So loader-error coverage is not a major benefit here, because
most routes have no loader to throw from. What the boundary actually,
reliably covers in this app is two failure classes: a render error (a
component throwing during render) and a chunk-load failure (a
lazy-loaded route's bundle 404ing after a deploy, when a client still
on the old build requests a since-removed hashed file).

**Middleware throws are caught by the same `ErrorBoundary` mechanism**
(verified directly against reactrouter.com/how-to/middleware: "if a
middleware throws it will be caught and handled at the appropriate
`ErrorBoundary`"), but *which* boundary catches it depends on timing
relative to that middleware's own `next()` call:
- A throw **after** `next()` has been called bubbles like a normal
  loader error, to the nearest boundary above the route.
- A throw **before** `next()` has no `loaderData` available yet, and
  bubbles instead to "the highest route with a loader" — which, given
  how sparse loaders are in this app, may land much higher in the tree
  than the route where the throw actually occurred.

This was a real, confirmed bug, not a documentation ambiguity: issue
no. 14145 (filed August 2025, against v7.8.0) reported exactly this —
middleware errors bypassing all nested boundaries, including
layout-level ones, and landing at the root boundary even when the
throwing route had its own `ErrorBoundary`. It was closed via PR
no. 14150, with further related fixes in the same area afterward
(PR no. 14138, and a later changelog entry: "Ensure client middleware
errors load lazy route error boundaries before bubbling"). Given React
Router
v8 stabilized in June 2026 — roughly ten months after this specific
fix, with continued refinement in between — this is likely resolved in
the version this project targets, though no v8-specific release note
was found confirming it directly. Verify this behavior empirically
once middleware is actually implemented in this app, as a confirmation
step rather than an open architectural risk.

Chunk-load-failure detection needs to be a specific, named case, and
WHERE the ErrorBoundary is declared determines whether it can catch
its own route's load failure. React Router's lazy-route architecture
(confirmed directly against remix-run/react-router's own ADR 0002 and
its error-handling discussion threads) allows ErrorBoundary to be
declared two ways: statically on the route config object itself, or
lazily, exported from inside the module the route dynamically imports.
Only the static declaration can catch that same route's own load
failure — a lazily-exported boundary was never obtained if the module
failed to load in the first place, so that failure bubbles to a
PARENT route's boundary instead (confirmed: this exact class of bug
was reported and fixed once already in React Router's history, per
issues no. 10194 and no. 10201).

Given this project's routes are configured as an explicit array (not
framework-mode file-based routing), declare ErrorBoundary statically
on each route's config object, not exported from the lazily-imported
component's own file.

**Write one shared chunk-load-detector boundary component** and
reference it from the `ErrorBoundary` property of **every lazily-loaded
route** — 07-routing-and-layouts.md's tree marks which those are, and
notes the three kinds of route that carry no boundary because they have
no chunk to fail. Its behaviour:
match the error against `'Failed to fetch dynamically imported module'`
and trigger a hard reload; any other error is logged, not reloaded —
reloading on every error risks masking a real bug or looping.

Provenance: `kus-pqms` achieved the same outcome with a single global
`router.onError` hook doing that regex match
(`frontend/apps/pqms-portal/src/router/index.ts`). React Router's
mechanism is per-route rather than global, so one shared component
referenced from every route is the equivalent — a translation of intent,
not a 1:1 port. **Do not assume a lazily-exported ErrorBoundary covers
this case**; per the paragraph above, it cannot.

The splitting/lazy-loading strategy itself belongs to
12-performance-guidelines.md — this section owns only how the boundary
reacts to that failure class once it happens, not how or when code gets
split.

## TanStack Query and error boundaries
Error boundaries and TanStack Query are not disjoint concerns — they're
designed to interlock via `throwOnError`, and the default for each
query should be chosen deliberately:

- **Default**: inline error UI driven by `useQuery`'s own `error`
  state. This is recoverable in place and keeps the rest of the screen
  alive around the failed piece.
- **`throwOnError: true`** only for queries where the route is
  genuinely meaningless without the data — the concrete example is
  Issue Detail's core issue fetch: no issue, no screen, so letting it
  throw to the route boundary is correct there.
- **Mutations: never `throwOnError`.** Mutation errors surface at the
  form/toast level, not the route level — a failed save must never blank
  the screen the user was typing into.
  This is not a hypothetical ranking: mutation failure is expected to be
  the highest-traffic real error path in this app, because of the known
  backend gaps documented in 05-api-integration-and-data-fetching.md's
  three named schema-leniency exceptions (`ownerUserId` not persisted;
  Vehicle Info / System Classification edits with no matching
  update-endpoint field; no linked-issues batch endpoint). Those gaps
  are carried forward from `kus-pqms` and are not known to be fixed.

**What the user actually sees in each of these three cases is
22-error-handling-and-user-feedback.md's**, not this file's. This section
decides *where* an error surfaces; 22 decides what it looks like, what it
says, and how an Appendix E error code becomes a message.

Stated explicitly so it isn't confused with what boundaries cover:
**event-handler throws and unawaited promise rejections are genuinely
uncatchable by any error boundary** — that's a React limitation, not a
gap in this design, and no boundary placement fixes it.

## Memoization and the React Compiler
The React Compiler is confirmed stable (v1.0, October 2025) and enabled
for this project. This changes the default posture on manual
memoization:

- Manual `useMemo`/`useCallback`/`React.memo` are **discouraged by
  default** — the Compiler handles this automatically, including cases
  manual memoization can't reliably cover today, such as values used
  after an early return.
- **Correctness carve-outs remain regardless of the Compiler**, because
  these are bugs, not performance tuning, and the Compiler doesn't fix
  bugs: an unstable value in a `useEffect` dependency array (causing an
  infinite re-render loop) and an unmemoized context-provider `value`
  object (causing every consumer to re-render on every parent render)
  both still need to be handled by hand.
- The Compiler's lint rules — bundled in `eslint-plugin-react-hooks`'s
  `recommended` preset, per 14-code-style-and-linting.md, which lists
  the rule set — are a **hard requirement, not optional**. Code that
  violates the Rules of React generally doesn't fail the build; the
  Compiler "safely skips optimization rather than risk changing your
  app's behavior," silently leaving that component unoptimized.
  Build-time compiler errors are possible but **rare**, precisely
  because skipping is the designed response — so a green build is not
  evidence of anything. That's worse than a build failure, because it's
  invisible: nothing tells you the component stopped being optimized.
- **The lint preset narrows this problem; it does not close it.** React's
  own debugging guidance directs you to look for "Rules of React
  violations in the affected components **that were not detected by the
  ESLint rule**" — an explicit statement that some bail-outs are
  lint-invisible. So the preset is simultaneously a hard requirement
  *and* an incomplete detector, and a clean lint run must never be read
  as proof a component is being optimized. The verification that
  actually covers the residue —
  `react-compiler-healthcheck` plus the React DevTools Compiler badge —
  is owned by 12-performance-guidelines.md's "Review checklist" and is
  the real detector for this class, not a redundant second check on top
  of lint.
