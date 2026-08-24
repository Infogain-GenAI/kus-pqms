# 12 — Performance Guidelines
**Tier:** 1
**Status:** APPROVED — REVISION 2

Assumes 00-core-rules.md; where the two conflict, 00 wins.

**Incoming obligation (from 03-react-component-patterns-and-naming.md):**
this file's eventual content must define the lazy-loading/code-splitting
strategy for routes and heavy components. 03's error-boundary section
already specifies how the boundary must REACT to a chunk-load failure
(hard reload, not reset/retry) — this file owns whether and how routes
are actually split, which determines how often that failure mode is
even possible.

That obligation is discharged below: route splitting is already settled
by 07-routing-and-layouts.md — **every route-target page component is
lazily imported**, with no named chunks and no prefetch hints, while
layout components are static because they are needed on every render
within their branch. 03 owns how the boundary reacts when such a chunk
fails. This file does not relitigate either.

**React Router v8's default-on `splitRouteModules` does not change
this**, and does not add a splitting mechanism this file needs to
account for: it is Framework Mode only and this app is data mode. Full
reasoning is recorded once in 07's "Lazy loading" section — see there
rather than re-investigating. Per-route `lazy: () => import(...)` plus
the one non-route case below remains the complete splitting surface.

What this file owns is bundle measurement, the one non-route
code-splitting case this corpus identifies, what it needs from
`BaseDataTable`'s API before large-list guidance can be written, and the
framework-agnostic performance practices not already claimed by another
tier-1 file.

## Performance goals: Core Web Vitals as a floor
- **LCP (Largest Contentful Paint)**: under 2.5s.
- **INP (Interaction to Next Paint)**: under 200ms.
- **CLS (Cumulative Layout Shift)**: under 0.1.

**These three carry no provenance, deliberately.** They are not
carried forward from anywhere and they are not this project's numbers
to negotiate — they are the published Web Vitals "good" thresholds,
which mean the same thing for this app as for any other. A threshold
taken from an external standard needs a citation, not a history; the
rest of this file's numbers are a different case and are labelled as
such.

They are a **floor, not an aspiration to grow into**. A screen that
regresses any of the three is a screen with a defect to fix before it
is considered done — not a number to revisit "once things settle."

## Bundle analysis and budget
**Add `rollup-plugin-visualizer`** as a dev dependency of the portal
app. It plugs into Vite's Rollup build directly, so there is no second
build pipeline to maintain. This is scaffold-time work: none of the
budget below is checkable without it.

Provenance: `kus-pqms` had no bundle-analysis tooling of any kind — no
`rollup-plugin-visualizer`, `vite-bundle-visualizer`, `size-limit` or
`bundlesize` in any manifest, and no CI step running one. Which is
directly relevant to the next paragraph: there is no measured
antecedent for a budget, because nothing was ever measured.

### The budget numbers
- **Initial JS bundle** (everything loaded before the first
  route-level split): under **300KB gzipped**.
- **Per-route lazy chunk**: under **150KB gzipped**.

**The initial-bundle figure is the BRD's, and it replaces a stricter one
this file had chosen.** BRD `NFR-P-012` commits to "initial SPA JavaScript
bundle ≤ 300 KB gzipped; each route chunk ≤ 150 KB gzipped", with a
build-time budget check as its gate. An earlier revision of this section
specified **200KB** and said plainly that the number "was not a
measurement of anything" — a conventional starting figure chosen so that
"review this later" had something to review against.

Given a self-described arbitrary 200KB and a committed 300KB, **the
committed number governs.** Per 00's Source precedence, a quantified NFR
is the BRD's to set. Two numbers cannot both be the gate, and the one
nobody signed is the one that goes.

**This is a relaxation, and it should not be read as permission.** 300KB
is a ceiling that fails the build, not a target to grow into. The
per-route figure is unchanged and is still this file's own.

**Said plainly, because this corpus has caught invented values before:
neither number is a measurement of anything.** The 300KB is the BRD's and
the BRD does not state how it was derived; the 150KB per-route figure is a
conventional starting budget chosen here. Neither was derived from the Vue
app's output, neither is a vendor recommendation, and no build exists in
this repository to have measured either.

Three consequences of that, none of which is "treat them loosely":

- **Binding until re-derived, not provisional.** A budget you may
  ignore because it was not measured is not a budget.
- **Re-derive once real output exists** — after the first few routes
  and the component library produce actual gzipped chunks. Trigger:
  the first build with `rollup-plugin-visualizer` installed and more
  than one route implemented. **Re-derivation may only tighten the
  initial-bundle figure, never loosen it**: 300KB is a committed NFR and
  raising it is a BRD change, not a build fix.
- **Raising the per-route figure is a decision with a recorded reason,
  not a build fix.** "The chunk came out at 240KB, so the budget is
  240KB" is how a budget stops existing.

## Code splitting beyond routes: `BaseMarkdownEditor`
The one non-route code-splitting case this corpus identifies. Rich-text
editing pulls in a large dependency — **TipTap**, which carries
ProseMirror as its engine via `@tiptap/pm` rather than as a direct
dependency.

Two other files already own parts of this and are not restated here:
14-code-style-and-linting.md owns the barrel-exclusion rule that keeps
the editor out of `ui-library`'s main value export, and
13-security-standards.md owns the TipTap-versus-ProseMirror package
distinction and what it means for sanitization. **This file owns only
where the load boundary sits and how tightly it is scoped.**

**[PLACEHOLDER — the editor's weight is unmeasured. A "~350 KB raw"
figure travelled through this corpus attributed to ProseMirror, which
is not the package that gets installed, and it was never verified
against an actual `@tiptap/*` install. Re-measure. Trigger:
`rollup-plugin-visualizer` installed and the editor built once.]** Do
not quote 350KB as a fact in the meantime — the weight is real, its
size is not known.

**Requirement: the editor loads when its tab opens, not when its route
does.** Wrap the editor's own import in `React.lazy()` + `Suspense`
inside the Communication tab. Route-level lazy loading alone defers it
only as far as "Issue Detail was opened"; tab-level deferral means a
user who opens Issue Detail and never visits the Communication tab
never pays for the editor at all.

Provenance, and why this is written as an improvement rather than a
fix: `kus-pqms` reached the editor through a dedicated subpath
(`@pqms/ui-library/markdown-editor`) from exactly one consumer
(`CommunicationTab.vue`), which itself sat inside an already
lazily-loaded route, via a plain static import. **That arrangement
worked.** The subpath split kept the weight out of every consumer that
was not Issue Detail, and the static import inside that route was a
deliberate choice, not an oversight. The requirement above narrows the
boundary one level further; it does not correct a mistake.

**The narrower boundary comes with a required constraint, not an
optional one.** The editor sits inside a form, so a user may already
have typed into other fields on the screen at the moment the editor's
chunk is requested. Per 03's chunk-load-failure design, a failed chunk
load is a real possibility rather than a theoretical one — and here it
would happen while the surrounding form is holding unsaved input.
Given that:

- The `Suspense` boundary **and** the statically-declared
  `ErrorBoundary` (per 03's static-declaration requirement) must both
  be scoped **narrowly around the editor component itself** —
  not around the whole `CommunicationTab`, and not around the
  surrounding form.
- A load failure renders a small, inline "couldn't load editor — retry"
  state **in the editor's own slot only**. It must never blank the
  surrounding form or discard input the user already entered in any
  other field on the same screen.

This is stated as a hard requirement, not a suggestion: trading a
smaller initial chunk for a path where a transient network blip can
wipe out a user's in-progress form data is not an acceptable trade
under any circumstance. **This same narrow-boundary pattern is the
standard for any future heavy-dependency component excluded from a main
barrel** per 14-code-style-and-linting.md's reusable
heavy-dependency-exclusion convention — see that file for the
barrel-exclusion rule itself; this file only owns how the boundary
around the lazy-loaded result must be scoped once such a component is
used inside a form or other stateful surface.

## Caching
**TanStack Query's query cache is this app's data-caching layer** (per
04-state-management.md and 05-api-integration-and-data-fetching.md).
There is no separate server-data caching mechanism to design: every
`useQuery` caches, dedupes and background-refetches per TanStack
Query's defaults, and 04/05 own what gets queried and how.

**No service worker, no PWA manifest, and no HTTP-level cache layer is
specified — and none is to be added speculatively.** If offline support
or HTTP caching becomes a real requirement, it gets designed then,
against that requirement.

Provenance: `kus-pqms` had none of these either — no `workbox`, no
`vite-plugin-pwa`, no hand-rolled `sw.js`, no `Cache-Control`
configuration, no web app manifest. So this is not a capability being
dropped in the rewrite. It never existed, and nobody reported its
absence as a problem, which is the evidence that building one now would
be speculative.

## Package and dependency evaluation
Before adding any dependency, answer two questions: **what it costs in
bundle size, and whether it tree-shakes.** Both are answerable before
the install, and neither is framework-specific — the point was never
"prefer the framework's built-ins", it was knowing what a dependency
costs before it ships. Provenance: `kus-pqms`'s dependency review asked
the same two questions.

## Images and icons
- **Icons**: SVG. Provenance: `BaseIcon` in `kus-pqms`'s `ui-library`
  was SVG-based, so this is the established approach rather than a new
  one.
- **Photographic content**: modern compressed formats (WebP/AVIF)
  where supported.
- **Below-the-fold images**: the native `loading="lazy"` attribute —
  no library needed for this.

## CSS performance
This file does not restate 06-styling-and-design-tokens.md's
Tailwind/`@theme` decision — see that file for the approach itself. One
addition from a different angle: 06 bans arbitrary-value Tailwind
classes (`bg-[#18468F]`) because they mean a value was written instead
of resolved to a token. The same classes also carry a minor JIT
compilation cost that token-backed utility classes do not. That is a
second, independent reason to follow 06's rule — not a new rule of this
file's own.

## Animation performance
Animate `transform` and `opacity`, not layout-triggering properties
(`width`, `height`, `top`, `left`).

**Every component with a transition or animation respects
`prefers-reduced-motion`** via `@media (prefers-reduced-motion)`. This
is a per-component requirement, not a global stylesheet rule — a
component that animates and does not honour the query is incomplete.

Provenance for stating it as a blanket requirement rather than a
suggestion: five components in `kus-pqms`'s `ui-library` already
implemented it (`BaseSwitch`, `BaseTooltip`, `BaseDateRangePicker`,
`BaseToast`, `BaseSkeleton`). The practice was established there, so
the bar is "all of them", not "the ones someone remembered".

## Memory management
Every effect that registers an interval, timeout, subscription or event
listener returns a cleanup function that removes it. The cleanup runs
on unmount and before the effect re-runs; that is the whole discipline.

**One case where the requirement is that there is nothing to clean
up**: the notifications poll is TanStack Query's `refetchInterval` (per
04 and 05), not a hand-rolled `setInterval`. Query starts and stops the
poll itself, tied to the query's own mount and unmount, so there is no
`startPolling()`/`stopPolling()` pair in application code — **and none
is to be written.** A manual polling pair alongside a query that
already polls is two schedulers for one job.

Provenance: `kus-pqms`'s notifications store hand-rolled exactly that
pair, which is why the prohibition is written out rather than assumed
obvious.

## Search performance
Debounce search input with the shared **`useDebouncedCallback`** hook,
which lives in `hooks/` per 01-project-structure-and-architecture.md
and is — per 03-react-component-patterns-and-naming.md's
hook-return-shape convention — the one hook that returns its callback
bare rather than object-wrapped. One shared hook, not a `setTimeout` in
each search field.

Provenance: `kus-pqms` had it as a composable
(`src/composables/useDebouncedCallback.ts`); both the hook and its
exemption from the return-shape convention carry forward from there.

## Forms
General form-performance principles. Issue Entry-specific details are
deliberately absent — those belong to that screen's specification, not
here:

- Avoid validating on every keystroke where the validation itself is
  non-trivial (an async lookup, a cross-field rule) — validate on
  blur or submit instead, reserving keystroke-level feedback for
  genuinely cheap checks (e.g. a required-field emptiness check).
- Prefer uncontrolled inputs (via `ref`) for simple fields where
  per-keystroke re-render cost matters and no other part of the
  screen needs to react to that field's value on every keystroke.
- Use controlled inputs where state genuinely needs to be
  TanStack-Query- or Zustand-synced — e.g. a field that drives a
  dependent query or another field's visibility. Controlled vs.
  uncontrolled is a per-field decision based on whether something
  else actually depends on that keystroke, not a blanket rule for
  the whole form.

## Review checklist
In addition to standard verification, the following is a **required**
step before any component's React Compiler optimization counts as
verified — not optional, not satisfied by the component working
correctly at runtime, **and not satisfied by a clean ESLint run
either**:

- Run `react-compiler-healthcheck` (the CLI diagnostic tool) against
  the component.
- Check React DevTools' Compiler badge on the component as ongoing
  verification that it is actually being optimized, not just that it
  renders correctly. A component without the badge is one the Compiler
  gave up on.

**This step is the actual detector, not a redundant one.** The
`eslint-plugin-react-hooks` `recommended` preset (per 14, required per
03) does **not** catch every Rules-of-React violation that makes the
Compiler skip a component — React's own debugging guidance points at
violations "that were not detected by the ESLint rule." Lint is the
first net and it has holes; this checklist is what covers them. Anyone
treating lint as sufficient and skipping this step has no way to know a
component silently stopped being optimized.

**The specific violation to watch for is direct prop mutation.**
Mutating a prop object in place is idiomatic Vue and a Rules-of-React
violation, and per 03, a Rules-of-React violation does not fail the
build — it silently opts the component out of Compiler optimization
with nothing announcing it. This corpus exists because the same product
was built once in Vue; anyone arriving from that codebase brings the
habit even though none of the code comes with them. Stated as a caution
worth naming, not a prediction about anyone in particular — the
requirement above stands on the lint-has-holes argument alone.

## Anti-patterns
Consolidated by reference rather than restated, so a rule lives in
exactly one place:

- Manual `useMemo`/`useCallback`/`React.memo` used where the Compiler
  already handles it, and the correctness carve-outs where manual
  handling is still required — see
  03-react-component-patterns-and-naming.md's "Memoization and the
  React Compiler" section.
- Arbitrary-value Tailwind classes masking token drift — see
  06-styling-and-design-tokens.md's "Every hardcoded value gets
  resolved, not written" section.
- Shipping past the bundle budget (initial bundle over 300KB gzipped, a
  lazy route chunk over 150KB gzipped) without a deliberate, recorded
  exception — see the budget section above for what raising one requires,
  and note that the initial figure is a **BRD-committed NFR**, not this
  file's to relax.

## Large lists and tables — what this file needs from `BaseDataTable`'s API
Large-list guidance cannot be written until `BaseDataTable`'s API
exists, and that API is deferred to pass 4. Both halves of that
deferral are recorded, so it cannot deadlock silently: 03 defers the
API and instructs pass 4 to check **this** file before finalizing it.
**Which means this file has to say what it needs, or that instruction
is empty.**

What follows is not a virtualization decision. It is the set of API
facts whose answers determine which strategies remain available, with
the reason each one matters.

**Question 0, which may close the whole item: what is the maximum page
size?** Sort, page, page-size and column-visibility are already client
state in 04's issue-filters store (per 03), so the table receives a
bounded page rather than a full result set. **If a page never exceeds a
few hundred rows, virtualization is not needed** and this section
reduces to "paginate", which the design already does. Virtualization
only becomes a live question if the API permits an unbounded or very
large page. Answer this first — the four below only matter if the
answer leaves the door open.

1. **Are row heights fixed or variable?** Fixed heights make windowing
   straightforward: a constant item size, nothing to measure. Variable
   heights force either a measure-then-position pass or an estimator
   plus reflow, which is where windowed tables get janky. Note that
   **row height is variable by construction if a cell may hold wrapping
   text, a multi-line value, or an expandable row** — so this is decided
   by the cell-content contract rather than answered separately.
2. **Can the row renderer be called for an arbitrary, non-contiguous
   slice?** A windowed table mounts only the visible rows. Any render
   function that depends on the row before it — a running total, a group
   header emitted when a value changes, striping computed by iteration —
   breaks, because the previous row may not be mounted. If the API
   permits that shape, windowing is unavailable unless the contract
   changes.
3. **Who owns the scroll container?** Windowing needs a viewport of
   known height. If the table scrolls the page — which is what
   `DefaultLayout` gives it, per 07 — a windowing library needs
   window-scroll mode or an explicit height. If the table owns an
   internally-scrolling region instead, it needs a height from its
   consumer, which is a prop the API must carry. 07 already contains
   both shapes: Issue List sits under `DefaultLayout`, while
   `FixedHeightLayout` exists specifically to give a screen an
   internally-scrolling `<main>`.
4. **Must the rendered DOM stay a real `<table>`?** Most windowing
   approaches position rows absolutely or switch to
   `<div role="grid">`. A semantic `<table>` can be windowed, but
   sticky columns — in scope per 03, and flagged by 11 against WCAG
   2.4.11 — are where the two constraints collide hardest.

**The consequence, stated so pass 4 can act on it**: a render-function
contract that permits arbitrary cell content, arbitrary row heights and
previous-row dependence **cannot** be windowed later without a breaking
change. If Question 0 leaves virtualization possible, the API is
written with 1–4 in mind from the start. If Question 0 closes it, the
API says so and this section is discharged.

Trigger: pass 4, `BaseDataTable`'s specification. Tracked in
18-project-context-and-implementation-status.md.

## Deferred to 18, not drafted here
Two further performance-relevant areas are deliberately not drafted,
because each is blocked on something that does not exist yet:

- **File uploads** — blocked on the attachment components being
  specified. Provenance: `kus-pqms` had `AttachmentsDropzone` and
  `SourceFieldAttachments`, so equivalents are expected, but neither is
  specified in this corpus.
- **Charts and analytics** — blocked on a charting library, which has
  never been chosen for this project. There is nothing to write
  performance guidance against, and 11 defers chart accessibility on the
  same gate.

Both are tracked as incoming obligations on
18-project-context-and-implementation-status.md rather than drafted
here.

**Storybook performance is not a separate item.**
01-project-structure-and-architecture.md already owns standing
Storybook up with `@storybook/react-vite` as part of `ui-library`'s
work; see that file rather than treating Storybook build performance as
a fresh concern here.

## Delivery is CloudFront over S3 — three consequences for this file

`docs/STACK.md` §7 records the frontend as a static SPA in an S3 bucket behind
CloudFront, with `/api/*` split off to API Gateway at the distribution.
Production builds emit hashed assets (`dist/assets/[name].[hash].[ext]`).

**Content-hashed filenames plus a CDN change what the budget in this file is
measuring**, and two of the three points below are cheap wins that no amount of
bundle-splitting substitutes for.

### 1. Cache headers are a performance control, and nobody owns them
Hashed assets are **immutable by construction** and should be served
`Cache-Control: public, max-age=31536000, immutable`. `index.html` must be the
opposite — `no-cache` — or a deploy ships new assets that no browser asks for.

**Getting this backwards is the single most common SPA-on-CloudFront defect**,
and it presents as "users are on the old version and hard-refresh fixes it",
which sounds like a frontend bug and is not.

It is set in the CDK stack, in `infra/` — **outside this corpus's boundary.**
So this file does not specify it; it **requires that someone has**, and
16-code-review-checklist.md asks the question at deploy-configuration review.

### 2. Compression, likewise
Brotli at the distribution, on by default in CloudFront but worth verifying
rather than assuming. A 300KB budget measured uncompressed against a target
delivered compressed is measuring the wrong number in the wrong direction.

**State which the budget is.** This file's figure is **uncompressed initial
JavaScript**, and the CI check measures the same thing, so the two agree.

### 3. SPA routing needs a 404-to-`index.html` rewrite
A deep link to `/issues/123` is a key that does not exist in the bucket. Without
the rewrite, CloudFront returns S3's error document and the router never boots —
so **every route except `/` 404s on a cold load**, while working perfectly in
development and in every test.

Also `infra/`-owned, also a question rather than a rule here — but
07-routing-and-layouts.md's route tree is meaningless without it, and it is
found late because nobody deep-links during development.
