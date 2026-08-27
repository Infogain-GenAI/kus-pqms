# 18 — Project Context and Implementation Status
**Tier:** 2
**Status:** LIVE — both halves are drafted: the implementation snapshot below is dated and regenerated, the registers beneath it are authoritative
**Purpose:** Living snapshot of what's built vs. planned for React app, periodically regenerated
**Supersedes / absorbs:** ai/README.md, implementation-status.md, monorepo-tooling-reference.md, portal-runtime-reference.md, ui-library-component-reference.md, SuggestedUpdated.md
---

Assumes 00-core-rules.md; where the two conflict, 00 wins.

**Read the status line above carefully — this file has two halves and
both are load-bearing.** Earlier revisions were marked first
`EMPTY — pending draft` and then `PARTIAL`, and both understated it: the
tracked-decisions section below already carried substantive entries, and
**other files point at it as the live tracking home** — several defer
obligations here by name. An earlier revision of this sentence hand-
counted that list as "four", naming 11, 12, 13 and 15; the real count
was already seven (01, 08, 11, 12, 13, 15, 17), because files kept
citing this one after the sentence was written and the count was never
re-run. **The count is not maintained here for that reason** — see the
generated distribution document's derived cross-reference index for
who currently cites this file, computed fresh on every regeneration
rather than fixed at some past revision. A reader trusting an `EMPTY`
label would skip the corpus's only obligation register.

**The snapshot half is now drafted** — see "Implementation status"
immediately below. It is dated, states its method and that method's
limits, and is meant to be **regenerated rather than edited in place**.

What is still genuinely outstanding is narrower: the content absorbed
from the six superseded `docs/ai/` files. Those are marked superseded by
this file and their substance has not been taken. The
`ui-library-component-reference.md` case is the one that matters —
`component-specs/INVENTORY.md` now carries a candidate inventory, which
is a partial answer, but the prior document's per-component detail has
not been read across.

## Implementation status — what exists, as of 2026-08-24

**This is the snapshot half this file's Purpose describes and has never
contained.** An earlier revision said it was "still pending"; it is now
drafted, and the honest caveat comes first.

**Method, and its limit.** Everything below is from **reading files**.
No command was run — no install, no build, no test, no coverage report.
So placement, presence and configuration are verified; behaviour,
bundle size, coverage percentages and install resolution are **not**.
Where a claim would need execution, it says so.

**Regenerate this section rather than editing it in place.** It is a
report on a moving target, and a half-updated snapshot is worse than a
dated one.

### Summary

| | Conforming | Partial | Absent |
|---|---|---|---|
| Root configuration | 8 | 3 | 2 |
| CI / DevSecOps | 0 | 0 | 6 |
| `apps/portal` configuration | 4 | 4 | 3 |
| `apps/portal` source layers | 4 | 3 | 5 |
| `packages/ui-library` | 8 | 3 | 4 |
| `packages/design-tokens` | 3 | 2 | 1 |
| `PQMS_docs` | 4 | 0 | 1 |

**The pattern is worth more than the counts.** Nothing that exists is
wrong — the ESLint chain is in 14's specified order with its deviations
commented, the tsconfig carries all four of 02's changes, Prettier
matches verbatim, and every token in the token file carries a sourcing
comment. What is missing is either infrastructure the first screen
cannot do without, or **the enforcement layer that makes these rules real
rather than aspirational.**

### Built and conforming
- Workspace shape: three packages, `pnpm-workspace.yaml`, `turbo.json`,
  `tsconfig.base.json` with every value 02 requires
- `eslint.config.js` — the five-position chain per 14, a11y severities
  per 11, `control-has-associated-label` enabled explicitly with the
  preset's own option object
- `.prettierrc.json` — all six settings verbatim per 14
- `packages/ui-library` — all eight category folders, the three
  entry points 01 specifies including the heavy-dependency subpath,
  `cn()`, and the `Pqms*` shared type vocabulary with an explicit
  no-speculation note
- `BaseButton` — four files in the shape 03/06/14 require, native
  `<button>` per 06's exception table, token classes only, and an honest
  "no direct evidence" flag on its `sm` size
- `AppHeader` and its spec test, mirrored per 10
- `design-tokens` — ~40 tokens, each with a sourcing comment citing the
  prototype
- `main.css` — the `@theme` mapping per 06, plus an empirically-verified
  `@source` directive for the workspace-symlinked library
- `i18n.ts` — matches 09 exactly
- The standards generator and its `--check` gate

### Absent — the enforcement layer
**This is the group that matters most**, because every other rule in this
corpus is enforced by CI and by nothing else.

| Missing | Specified by |
|---|---|
| **The entire `.github/` directory** | 15 |
| `pqms-portal-ci.yml` — `quality` and `e2e` jobs | 15 |
| `pqms-portal-sonarqube.yml` | 15 |
| `dependabot.yml` | 15 |
| `sonar-project.properties` | 15 |
| **The 85/85/85/85 coverage gate — present but commented out** in both `vitest.config.ts` files, with a rationale ("no source file exists yet") that is now stale | 10 |
| Storybook — no builder, no addon, no story for either existing component | 01, 10, 24 |
| MSW | 10, 26 |
| `rollup-plugin-visualizer`, and therefore any bundle-budget check | 12 |
| Git hooks — Husky, `lint-staged`, commitlint | 23 |
| The log-hygiene scan | 21, 15 |

### Absent — the environment contract
Three artifacts that other standards depend on for *their* enforcement:

- **`env.d.ts` has no `ImportMetaEnv` interface.** 13 makes that
  interface the authoritative `VITE_*` inventory and builds its whole
  mechanism on it, so **nothing currently enforces the `VITE_*` rule.**
- **No `.env.example`.** 13 calls it the only file a new developer reads.
- **No dev-server proxy** in `vite.config.ts`, which 20 quotes verbatim
  with an ordering warning.

### Absent — application layers
Expected at this stage, but recorded because 01 says the portal shell
"runs in parallel, not after" and should "start early regardless of
library progress":

HTTP client and the `ApiError` shape (05) · fixtures predicate and data
layer (05) · TanStack Query provider and `queryKeys` (04, 05) · both
Zustand stores (04) · MSAL bootstrap, `authReady`, permission layer (08)
· the route tree, three layouts, `ChunkLoadErrorBoundary` (07, 03) ·
route-change focus management (11) · `useDebouncedCallback` (03, 12).

`main.tsx` currently renders a demo — `AppHeader` in a `MemoryRouter`
plus six `BaseButton` variants — with a comment saying why. Correct for a
scaffold; it is what the real shell replaces.

### Divergences worth naming
Neither is a defect; both are undocumented deviations from a table this
corpus calls authoritative, which is the same class round 3 raised.

| Divergence | Detail |
|---|---|
| Package scripts | `clean`, `prepare` (root); `test:unit`, `storybook`, `build-storybook` (portal); `build`, `storybook`, `build-storybook` (`ui-library`); `build` (`design-tokens`) are all specified in 20 and absent. **`turbo.json`'s `typecheck` declares `dependsOn: ["^build"]`, which resolves to nothing for two of three packages** until the missing `build` scripts exist. |
| ESLint `ignores` | The actual array uses `**/*.css` and `PQMS_docs/**`; 20 specifies the two token-file paths individually plus three others. The actual version is arguably better and is still an undocumented deviation. |

### Two open questions this snapshot raised
- **`AppHeader` lives under `src/layouts/`**, which 07 reserves for the
  three layout components. `AppHeader` is a component the layouts render.
  01's app-wide shared location is `src/components/shared/`. Nothing
  places it. **[PLACEHOLDER — where `AppHeader` belongs. Trigger: when
  the layouts are built. Owner: Frontend Lead.]**
- **Two `tokens.css` files exist** — `design-tokens/src/tokens.css` and
  `ui-library/src/styles/tokens.css` — with no stated relationship in
  either. 01 says `ui-library` exports `"./styles"`; 06 says
  `design-tokens` is the source of truth. Both can be true; nobody has
  said how. **[PLACEHOLDER — the relationship between the two token
  files. Trigger: before the token scales are authored. Owner: Frontend
  Lead.]**

### One unresolved provenance question
Review round 3 records reading "`BaseButton`…and its spec" and
"`AppHeader`…and its spec". **`PQMS_docs/component-specs/` contains only
`TEMPLATE.md` and `INVENTORY.md`.** Either those specs were removed, or
they live somewhere this reading did not look. Unresolved, and worth
resolving — a spec that existed and was deleted is a different situation
from one that never did.

## Register scope — widened
**This register now tracks every `[PLACEHOLDER]` in the corpus, not only
the subset blocked on the React port.** Round 3 found that it covered a
minority of them and correctly noted that whether that boundary was
deliberate was itself unstated. It was not deliberate. The narrower
scoping meant a placeholder with no owner and no trigger could sit in a
tier file indefinitely, visible only to whoever happened to read that
file.

**Two rules follow, and they are enforceable rather than aspirational:**

1. **Every `[PLACEHOLDER]` states a trigger and an owner.** A placeholder
   with neither is not a deferral, it is an omission wearing a deferral's
   syntax.
2. **Every `[PLACEHOLDER]` appears in the table below.** Adding one to a
   tier file without adding a row here is the same defect class as
   hand-editing the generated distribution document: the corpus acquires
   an obligation nothing tracks.

### Open placeholders, by owning file

| File | Placeholder | Trigger | Owner |
|---|---|---|---|
| 01 | Folder name for the Overview / QIR / TSB features | when that feature is built | Frontend Lead |
| 01 | Whether `api-client` and `auth` are workspace packages or app-level behind a barrel | before the HTTP client is written | Frontend Lead |
| 21 | Whether the error report carries a sanitised route pattern or no location at all | when the monitoring transport is written | Frontend Lead + security |
| 02 | The TypeScript 7 path-alias mechanism (`baseUrl`/`paths` are deprecated in 6.0, removed in 7.0) | a TS 7 upgrade being considered | Frontend Lead |
| 03 | `BaseTabs` — config-driven or compound API | when `BaseTabs` is specified | Frontend Lead |
| 03 | The Issue Entry Zod schema and its step-grouping adapter | when Issue Entry is specified | Frontend Lead |
| 05 | The number of backend origins, and therefore of HTTP-client instances | BRD `DEC-08` being signed | Architect |
| 05 | Query-key conventions | first real hooks | Frontend Lead |
| 06 | React Aria — does any CSS ship | scaffold time | Frontend Lead |
| 06 | React Aria — bundle cost, and whether 14's barrel exclusion applies | same check | Frontend Lead |
| 06 | Hues for `TOP_ISSUE` and `OUT_OF_SCOPE`, which the prototype's status palette has no counterpart for | before `BaseStatusPill` is specified | the designer, via the prototype |
| 00 | The CI platform — no root pipeline definition found | Phase 0 baseline | Frontend Lead |
| 00 | The frontend package manager — `package-lock.json` present, pnpm intended | before the gates epic | Frontend Lead |
| 04 | Whether TanStack Query and Zustand are adopted, and in which SPEC | before the first screen with server data is restructured | Frontend Lead + client architect |
| 07 | `AdminLayout` — distinct chrome, or only a route branch | first admin screen | Frontend Lead |
| 08 | The identity provider, and therefore whether MSAL is the client library | before the auth SPEC is planned | client architect |
| 33 | Whether an OpenAPI spec exists and can generate types | before the first API integration SPEC | backend lead |
| 07 | `AuthLayout` — build only when a route needs it | before auth implementation | Frontend Lead |
| 07 | Whether legacy Workspace deep links must keep resolving | before the Workspace shell ships | PQM |
| 08 | The `ResolvedPermissions` response shape | the real FR-SEC-011 contract | Backend Lead *(unassigned — BRD Q7)* |
| 08 | `redirectUri` — dedicated callback route or the app root | before auth implementation | Yogesh, with the client |
| 08 | Does a Sharing surface exist in Phase 1 at all | before the Workspace tab set is implemented | PQM, via the BRD |
| 08 | Fixtures-mode default role | a dev-workflow decision | Yogesh |
| 10 | MSW handler organisation | first real test implementation | Test Architect |
| 10 | Which axe binding, given `vitest-axe@0.1.0`'s packaging defects | test-harness setup | Test Architect |
| 12 | The markdown editor's real weight (the "~350 KB" figure was misattributed and unverified) | visualizer installed and the editor built once | Frontend Lead |
| 13 | CSP `connect-src` — the real production API origins | real backend URLs existing | Architect |
| 17 | Whether Scoring is a sixth Workspace section, a sub-route of Detail, or a modal | before the Workspace shell is built | PQM |
| 18 | Where `AppHeader` belongs — 07 reserves `src/layouts/` for layouts | when the layouts are built | Frontend Lead |
| 18 | The relationship between the two `tokens.css` files | before the token scales are authored | Frontend Lead |
| 21 | The date-arithmetic library | first screen needing date arithmetic | Frontend Lead |
| 25 | The monitoring vendor | before go-live | Architect + Ops |
*(30 carries no placeholder of its own: its open items belong to the
consuming repository, not to this corpus.)*

**Two files restate a placeholder rather than owning it** — 23 on the
default branch name and 24 on whether CI builds Storybook. Both are 15's,
counted once, above.

**Closed since the last revision, and why**, so the list is not read as
only growing:

| Was | Resolution |
|---|---|
| 02 — declare path aliases once, or per package? | **Once, in the base config.** Verified working; the feared `baseUrl`-through-`extends` problem did not materialise. |
| 05 — where fixture modules live | **`apps/portal/src/fixtures/`, feature-grouped.** Decided in 05, in the file that owns the data layer. |
| 07 — is a skip-link in scope, and what does it target | **Yes; it targets `id="main-content"`.** 11 now owns WCAG 2.4.1 and requires one per layout. |
| 12 — initial bundle budget | **300KB gzipped**, the BRD's `NFR-P-012` figure, replacing a self-described arbitrary 200KB. |
| 20 — the Husky `prepare` script | **Ownership moved to 23**, which states the git-root dependency rather than leaving it inside a commands reference. **The value itself is still open** — see 23's row in the placeholder table above. |
| The icon library | **`lucide-react`, ratified in 00's Confirmed stack.** |
| Logging, error UX, git workflow, Storybook authoring, observability, test data, form/table/overlay review, Definition of Done, screen descriptions | **Nine new tier files, 21–29.** Each was a topic the Vue corpus covered and this one did not. |
| Using this corpus against another repository | **30-restructuring-an-existing-react-project.md.** |

## Decisions blocked on React port (tracked here, not scattered)

- **`ui-library` component inventory AND component APIs — the corpus
  specifies neither.** Two gaps, the second larger than the first.
  Raised from 01-project-structure-and-architecture.md's "This file
  does not enumerate the components" section, which is where a reader
  hits it.

  **No component list.** No file enumerates the `ui-library` component
  set. Components appear incidentally as examples of other rules — in
  01, in 06, in 11 — and those mentions must **not** be assembled into
  an inventory: a list stitched from scattered examples silently omits
  whatever no rule happened to mention. (This entry used to attach
  counts to those three files and got all three wrong; see 01's
  matching paragraph and the generated document's derived index for why
  the counts are gone rather than corrected in place.)

  **No component APIs.** Even a complete list of names would not be
  buildable. Nothing specifies what a component's interface *is*:
  `BaseSelect`'s options shape, controlled vs uncontrolled,
  `BaseDataTable`'s column-definition contents, which props are
  required. 01 governs placement, 03 governs prop-naming and
  composition patterns, 06 governs styling and the headless primitive.
  Three files of conventions — none is a specification, and conventions
  do not compose into one.

  **Source: the prototype**, per 17's Prototype register — it shows
  which components the real SE screens use and how they behave.
  **Trigger: pass 4**, which derives both from it. **Destination:**
  `PQMS_docs/component-specs/`, one file per component, against
  `TEMPLATE.md` there — the required sections are settled even though
  no spec is written. This is a derivation
  from an artifact, not a decision Yogesh makes in advance, so it is
  not waiting on an answer — it is waiting on the pass that does the
  work.

  **Consequence until then**: do not build `ui-library` components
  speculatively from the conventions. They can tell you a component is
  correctly placed, named, and styled; they cannot tell you it is the
  right component with the right interface.

- **A distinct icon-only "small square button" pattern exists in the
  prototype, unspecified anywhere in this corpus** (found while building
  BaseButton, cross-referenced against the component-inventory gap
  above): `requirements/ISM SE Role.html` contains 10+ raw `<button>`
  elements sized continuously from 20px to 40px (20/22/24/26/28/30/32/
  34/36/40px, appearing 1–21 times each), every one icon-only (a single
  `<i data-lucide>` child, no visible text), labeled via `title="..."`
  rather than visible content, with no shared variant vocabulary and no
  `x-import` reference to the design-system `Button` component.
  Confirmed **not** an instance of the real `Button` component:
  exhaustive search of the prototype finds exactly two
  `component-from-global-scope=` usages in the whole file (`Logo`, and
  one `Button` at `variant="secondary" size="md"`) — none of these
  icon-only buttons is either. **This is a separate,
  currently-unspecified component** (an icon/dismiss-button concept),
  not `BaseButton` at a small size. **Source: the prototype, same as the
  component-inventory gap above. Trigger: pass 4**, when it should be
  enumerated and specified alongside the rest of the `ui-library` set,
  same destination (`PQMS_docs/component-specs/`).

- **`BaseButton`'s `sm` size (36px) coincidentally lands on the
  prototype's generic `--control-md` step, not `--control-sm`** — worth
  resolving when the icon-button item above is specified, not a defect
  in `BaseButton` as it stands today. The prototype's own generic
  control-height scale is `--control-sm: 28px`, `--control-md: 36px`,
  `--control-lg: 44px`. `BaseButton`'s `sm=36px` has no direct prototype
  evidence of its own and happens to equal `--control-md`, while
  `--control-sm` (28px) instead sits inside the icon-only
  square-button cluster described above (28px is that cluster's
  second-most-common size, 10 occurrences). This raises the possibility
  `--control-sm` was intended for that icon-button component rather than
  for `BaseButton`, and that `BaseButton`'s sizes may need renumbering
  once that component exists — not something to act on now. **Trigger:
  same pass-4 work as the item above.**

- **No standard names an icon library for React — AppHeader installed
  `lucide-react` without one existing.** Justified by direct provenance:
  the prototype uses Lucide icons via `data-lucide="..."` hundreds of
  times, and the prior Vue implementation (`kus-pqms`) used the direct
  equivalent, `@lucide/vue`. That provenance is real, but the decision
  itself was made inside one component's build, not recorded anywhere a
  second component could find it — the next component to need an icon
  could as easily reach for a different library, or re-derive the same
  choice from scratch, and neither would contradict anything written
  down today. **Needs a real owner**: whichever tier file ends up owning
  dependency/library choices for this stack — 00-core-rules.md's
  "Confirmed stack" section is the closest existing precedent, since
  TanStack Query, Zustand, and react-i18next are all recorded there the
  same way. **Trigger: before a second component needs an icon**, so
  the choice is confirmed rather than silently repeated or contradicted.

- **No standard specifies keyboard or disclosure-pattern behavior for
  dropdowns/popovers** — the same shape of gap as the icon-only-button
  finding above: 11-accessibility-standards.md's per-component list
  covers `BaseModal`, `BaseTooltip`, `BaseSelect`, `BaseSwitch`,
  `BaseCheckbox`, `BaseTextarea`, and nothing resembling a dismissible
  popover. AppHeader's notification dropdown added Escape-to-close
  (returning focus to the trigger) and click-outside-to-close as
  sensible defaults, because nothing governs this and the prototype's
  static export cannot show interaction behavior at all — there is no
  keyboard trace to read there. **This is case 4 of 00-core-rules.md's
  Source precedence** (nothing governs, decide deliberately and record
  the reasoning) — that is what happened here, just not written down
  until now. Worth a real requirement once a second dropdown- or
  popover-shaped component exists, so the two don't diverge on which
  keys do what.

- **`AppHeader` hard-depends on a `Router` context to render at all** —
  it uses `react-router`'s `NavLink`/`Link` directly, and no routing is
  wired up anywhere else in this app yet (07-routing-and-layouts.md's
  route tree is specified but not built). This is a deliberate choice,
  not an oversight: it gives real `aria-current="page"` marking for
  free, which is more correct than the prototype's own nav (which has
  no current-page indication at all). **The cost**: every future test,
  Storybook story, or standalone dev preview of `AppHeader` needs a
  `MemoryRouter` (or equivalent) wrapper — confirmed necessary in
  `AppHeader.spec.tsx` and in `main.tsx`'s dev preview. **Recorded as a
  known coupling cost, not a defect. Trigger: revisit once real routing
  exists** in the app shell, to confirm the dependency resolves cleanly
  rather than needing a wrapper everywhere it's used.

- **`apps/portal/src/i18n.ts` (the i18next bootstrap) is
  foundational portal-shell infrastructure, built as a side effect of
  AppHeader's task rather than as its own decision.** Nothing
  initialized i18next anywhere in this app before AppHeader needed it,
  so the bootstrap was written to unblock one component's `.i18n.ts`
  file — matching 09-i18n-and-localization.md's convention, but the
  bootstrap itself (its `lng`/`fallbackLng`/`supportedLngs`
  configuration, where it lives, whether it needs anything beyond what
  one component required) has not been reviewed as shell-level
  infrastructure the way 01-project-structure-and-architecture.md
  frames Zustand/TanStack Query/Vite setup ("the portal shell runs in
  parallel... Vite/ESLint/test-harness scaffolding"). **Needs a
  deliberate owner and review once a second component needs
  translation**, not just a side effect of the first one that happened
  to need it.

- **Screen descriptions: permanent artifact or working notes?** —
  **CLOSED. Decision: a permanent artifact.**

  **Location**: `PQMS_docs/screen-descriptions/`, one file per screen,
  a sibling of `standards/` and `component-specs/`.

  **Why pass 4 needs them at all**: pass 4 derives component specs from
  the prototype, but the path runs through screens. You cannot specify
  `BaseDataTable`'s API without knowing what Issue List does with it —
  which columns, which states, whether rows are selectable. The
  component **inventory** is derived the same way: read a screen, see
  which controls it contains. So the screen-level knowledge exists
  either way; the only question was whether it survives the pass that
  produces it.

  **Three reasons it survives, recorded so this is not relitigated:**

  - **The staleness argument cuts the other way.** A screen description
    records **structure** — Issue List has a filter drawer, a scope tab
    row with counts, a table with these columns. Prototype revisions
    mostly change detail, not structure. An unreviewable inventory, by
    contrast, is **permanently** unreviewable: there is no later moment
    at which it becomes checkable. A description that has drifted can be
    re-checked against the prototype; a derivation that happened in
    someone's head cannot.
  - **It matches how everything else in this corpus earned trust.** The
    four fabrications this corpus caught — a permission call that did
    not exist, a hex colour that was not the brand colour, a status
    value not in the real set, a service namespace never implemented —
    were caught because a source existed to check against. A component
    inventory derived in someone's head has no source, so nothing about
    it is checkable in the way everything else here has had to be.
  - **The staleness cost is lower than it looks, because these are
    read-once artifacts.** Pass 4 consumes them; afterwards they are
    reference. A stale screen description does not misdirect
    implementation the way a stale component spec does, because nobody
    builds from it directly — which is also why 01 deletes a spec with
    its component but no equivalent rule is needed here.

  **Currency, carrying 17's register caveat**: each description records
  **which prototype file and which reading it came from**, and is
  current as of that reading — not permanently. The prototype has been
  revised and renamed three or more times; a description that does not
  say which reading produced it cannot be re-checked, which would
  forfeit the first reason above.

  **The boundary against component specs, since the two are adjacent**:
  a **screen description says what a screen contains and what it does.**
  A **component spec says what a component's API is.** The first is an
  input to the second. A screen description does not specify props, and
  a component spec does not describe a screen's layout.

  **No template, deliberately, and no descriptions yet.** Their shape
  should follow from the first prototype read rather than precede it —
  writing a template now would specify a form for content nobody has
  seen, which is the opposite of how `component-specs/TEMPLATE.md`
  came about (that one was derived from 03's `BaseDataTable` gap list,
  i.e. from real accumulated questions). **Trigger for the template, if
  one is wanted at all: after the first screen is described.**

- **When the `e2e` CI job first runs** — **OPEN. Owner: Yogesh.
  Trigger: first CI setup.** (From 15-devsecops-and-ci-cd.md, which
  carries the placeholder.)

  Per 10-testing-standards.md no Playwright spec carries forward, so on
  day one this repo has **zero** e2e tests, and `playwright test`
  matching nothing is an error condition rather than a pass. So the job
  15 specifies fails from the first commit unless something is decided:
  introduce it alongside the first spec, or introduce it now with an
  explicit, commented allowance until then.

  Recorded here rather than left to scaffold time because **the
  available wrong fix is the one that happens under time pressure** —
  softening the job (`continue-on-error`, a `|| true`, a passthrough)
  until it is green and meaningless. That is the same failure 10 names
  for coverage thresholds on an empty repo, and it is silent
  afterwards: a permanently green job that runs nothing looks identical
  to a passing one.

- **Whether Storybook builds in CI** — **OPEN. Owner: Yogesh. Trigger:
  when the Storybook builder is set up per
  01-project-structure-and-architecture.md.** (From 15, which carries
  the placeholder.)

  **No precedent either way**: `kus-pqms` had `storybook` and
  `build-storybook` scripts at the root and in both `ui-library` and the
  app, and neither workflow invoked either one. The question was never
  asked there.

  The trade is a build-time cost on every PR against discovering, weeks
  late, that Storybook has stopped building — 01 makes Storybook the
  component verification surface, so a broken one is a broken gate on
  component review. **One limit already recorded in 15 and worth
  keeping attached to the decision**: a `build-storybook` step catches
  **build breakage only, not accessibility regressions**, because the
  a11y addon's checks are manual per 10. So this is not a way to get
  a11y coverage into CI; 10's axe assertions remain the only automated
  a11y surface.

- **BaseTabs' composition API** (from 03-react-component-patterns-and-
  naming.md): config-driven (an array of tab configs, with panel
  content rendered outside the component by the consumer switching on
  the active tab key) or a compound-component API
  (Tabs.List/Tabs.Trigger/Tabs.Panel). Config-driven is the incumbent
  option — provenance: it is what `kus-pqms` shipped, and it worked.
  Full framing in 03; this entry is the tracking record. Decided when
  BaseTabs is specified, not at the standards level.

- **Large Lists/Tables performance guidance** (from 12-performance-
  guidelines.md): depends on `BaseDataTable`'s API, which is part of the
  component-specification gap above. **12 now states its side**: its
  "Large lists and tables — what this file needs from `BaseDataTable`'s
  API" section lists the five API facts that determine which strategies
  remain available, starting with maximum page size — an answer that may
  close the item entirely, since pagination is already in the state
  model. **Trigger: pass 4**, which must read that section before
  finalizing the API rather than after.

- **File Uploads performance guidance** (from 12-performance-
  guidelines.md): chunked-upload and client-side-compression approach
  depends on the attachment components, which are not specified in this
  corpus. Trigger: those components being specified.

- **Charts and Analytics performance guidance** (from 12-performance-
  guidelines.md): no charting library has been chosen for this project
  at any point — this isn't blocked on a port, it's blocked on a
  decision that hasn't been made yet. Flag if/when a charting need
  actually arises.

- **Dashboard Accessibility guidance** (from 11-accessibility-
  standards.md): chart alternatives (text summary, data table
  alternative) depend on a charting library being chosen — same
  blocker as the performance item above, not a separate decision.

- **Workflow Accessibility guidance** (from 11-accessibility-
  standards.md): workflow-timeline text-alternative requirements,
  blocked on a workflow-timeline component existing at all — none does
  in this app today.

- **Frontend deployment target and its header behavior** (from
  13-security-standards.md): no deployment target (Static Web Apps,
  App Service, container, or otherwise) has been chosen anywhere in
  this repo for the frontend — confirmed absent, not just undocumented.
  13's CSP design assumes no competing headers are injected elsewhere;
  this must be revisited once a real deployment target exists, since
  it could override or conflict with what 13 specifies.

- ~~**DTC's expansion**~~ **RESOLVED.** BRD C1.0 (Appendix A — Glossary)
  defines DTC as "Diagnostic Trouble Code." Trivial, closed out. Full
  detail in 17's "Core Entities" section.

- ~~**ASM naming**~~ **RESOLVED.** BRD C1.0 Appendix A defines `ASM` as
  "After-Sales Manager / Service Engineer Manager" — a deliberate
  compound title, per contradiction X-2 (§0.6). Full detail in 17's
  "Roles & Capabilities" and 08's "Permission model" → "ASM naming".

- **CE/DM naming and scope — still open.** Not resolved by BRD C1.0. C1.0
  was checked directly (full glossary, Appendix A, and the role-mapping
  appendix, B.1) and defines neither term — this is a genuine gap in
  the consolidated document, not a case of an answer sitting in a
  newer source nobody checked. The HLD-vs-old-glossary conflict this
  entry originally tracked stands unchanged. Full detail lives in 17
  (terms) — this entry exists only as a pointer, not a restatement.

- ~~**Whether BRD v1.5 should replace the v1.3 the corpus cites**~~
  **RESOLVED — for now.** A consolidated baseline,
  BRD/NPQMS-ISM-customized-BRD.md (**C1.0**, dated 2026-08-20), now
  exists — it merges v1.5 and a parallel "Greenfield BRD v1.0" and
  states plainly it is **"Draft for ratification,"** superseding both
  source documents only on ratification. This corpus now cites C1.0 as
  the current best source (see 00's source-precedence section and the
  updated citations throughout 06, 08, 11, 17), while stating its draft
  status rather than treating it as more settled than it is. If
  ratification changes anything in C1.0, those citations need a second
  pass — this entry stays open in that narrow sense, not resolved
  permanently.

- ~~**2-vs-4-tier capability model**~~ **RESOLVED — with a bigger answer
  than either option this question originally posed.** The question was
  framed as a choice between the implemented two-value
  `"read"`/`"override"` model and a four-tier expansion suggested by
  BRD NFR-05 prose. BRD C1.0 supersedes both options: §7.2–§7.4 commit
  to five system roles and a 38-row per-action authorization matrix
  (§7.3), consumed by the frontend as server-resolved named permissions
  (FR-SEC-011), not a client-side capability-ordering gate at any tier
  count. See 08-authentication-and-authorization.md's "Permission
  model" for the full rewrite — this entry is the tracking pointer, not
  a restatement.

- **Whether "QE" (BRD/HLD) and the real implemented "SE" role are the
  same persona renamed, or genuinely different roles** (from
  17-domain-glossary-and-business-context.md): SE appears under that
  abbreviation in neither the BRD's stakeholder table nor the HLD's
  role table — the only resemblance is a description-level similarity
  to QE in both documents. Needs Yogesh to confirm.

  These three are blocked on a stakeholder/business answer, not a React
  port — kept here as the closest existing tracking home per Yogesh's
  own steer, not because they fit this list's original framing.

- **Fixtures mode — CLOSED. Ownership assigned; one item still open.**
  This entry existed because no file owned fixtures-mode behaviour. Every
  half now has an owner:

  | Concern | Owner |
  |---|---|
  | Auth behaviour (MSAL bypass, PROD fuse, seeded identity via `setUser`) | 08's "Fixtures-mode authentication" |
  | `isFixtureMode()` predicate, opt-in default, what a service returns | 05's "Fixtures mode" |
  | `use*`-prefix naming rule for non-hook predicates | 14's naming conventions |
  | `VITE_USE_FIXTURES` contract across `.env`, `.env.example`, `env.d.ts` | 13's `VITE_*` inventory |
  | Store-layer behaviour (unchanged in both modes) | 04, pointer only |

  **The question this entry was opened to prevent is answered**: a
  service returns **fixture data** in fixtures mode and calls HTTP in
  real mode, with the switch inside the service function and nothing
  above it changing. Queries, hooks and components are identical in both
  modes. The one exception is a query whose purpose is to observe change
  over time — notifications — which is disabled rather than fed static
  data. 05 carries the test for when a new exception qualifies.

  **Still open, narrowly — but the blocker has changed shape.** The
  role model itself is no longer unsettled (BRD §7.2 defines five
  roles: SE/ASM/PQM/ADMIN/VIEWER). What remains is a separate,
  narrower question: which of the five roles a fixtures-mode
  environment should default to for local development. That is a
  dev-workflow convenience decision, not a spec gap, and CE/DM's
  still-open status doesn't gate it — CE/DM are not part of the
  five-role model. Deferred as a `[PLACEHOLDER]` in 08's "Fixtures-mode
  authentication" section 4. **Trigger**: a dev-workflow decision, not
  a spec resolution. **Owner**: Yogesh.

  **Also open, smaller**: where fixture modules live. 01 names
  `services/`, `hooks/`, `components/` and `types/` but no location for
  fixture data. (Page-host placement is 07's; Zustand store
  organization is 04's — 01 owns neither, correcting an earlier
  revision of this entry that attributed both to it.) `kus-pqms` used
  `src/api/`, which also held domain types that 02 now places
  elsewhere. Recorded as a `[PLACEHOLDER]` in 05; resolve when 01 is
  next revised or at scaffold time.

- **Prototype register — CLOSED, with a standing maintenance
  obligation.** Both halves of this item are answered: 17-domain-
  glossary-and-business-context.md owns prototype provenance and
  carries a "Prototype register" section, and the SE prototype's path
  is confirmed and recorded in it. No path is repeated here — the
  register is the single place it lives.

  The convention: every file needing a prototype cites it **by role
  through the register, never by filename**, so a designer rename is a
  one-cell edit. Role-specific prototypes are planned and arrive as
  **new rows, not replacements**. Per-role UI differences remain useful
  confirming evidence against the BRD's §7.3 authorization matrix — see
  the resolved "2-vs-4-tier capability model" entry below for the
  larger answer this question turned into.

  **What remains is maintenance, not a decision.** The prototype is
  under active revision and has been renamed at least three times, so
  the register needs updating as the designer renames files and adds
  per-role prototypes. This is the standing cost of treating a moving
  artifact as a source of truth; the register exists to hold that cost
  at one row per change. No owner assignment needed — whoever notices
  the rename updates the row.

  **Related standing note, recorded in the register**: file
  modification dates are not evidence of currency anywhere in this
  repository, because `git pull` rewrites mtimes on every changed file.
  An earlier analysis of this item drew a wrong conclusion from exactly
  that inference. It is noted in 17 rather than here because it applies
  to every file in the repo, not just prototypes.

- ~~**Whether the browser holds an auth token at all**~~ **RESOLVED —
  previously the highest-consequence open item in this list.** BRD
  AR-06/DEC-07 confirm: authentication is OIDC Authorization Code +
  PKCE against the enterprise identity provider, with the token
  validated **in-process** — "no separate gateway is needed to validate
  one token for one application" (AR-06). Kia's SSO does not terminate
  at a gateway or reverse proxy in front of this app. 08's entire
  token-storage decision (`cacheLocation`, the accepted XSS cost, the
  CSP condition) stands as written — it is **confirmed valid, not
  voided**, and so is the underlying choice of MSAL. Full detail in
  08's "Token storage" section; this entry is the tracking record, not
  a restatement.

- **The cross-reference claim-level audit is incomplete — a known
  verification gap, not a clean bill of health.** Two independent
  reviews of this corpus have each said the same thing about their own
  cross-reference checks: the first verified that ~30 of 207 citations
  named a real target file; the second verified 21 section-naming
  citations and all of 20's 25 `(used in:)` attributions completely,
  but its own broader attributive-claim pass covered only a fraction of
  the corpus's 217 filename-style citations before the checking method
  stopped being precise enough to trust its output as findings. **Every
  report to date is a floor, not a ceiling, and each has said so
  explicitly rather than implying completeness.**

  What is confirmed clean, so this entry does not overstate the risk:
  all 21 section-naming citations verified; all of 20's acronym
  attributions checked (14 of 25 were wrong — fixed, and no longer
  hand-maintained, see 20's glossary note); every citation *into* 18 or
  20 from another file checked and correct; all 13 of 18's own outbound
  citations checked and correct. The defects found so far are 18 and 20
  describing themselves and each other by stale or underived counts —
  not the rule tier's cross-references to one another.

  **What remains unverified**: whether a citing file's *prose claim*
  about a target — not just the filename, and not just a quoted section
  title, but a paraphrased assertion of what the target says — actually
  matches the target, across the full 217-citation set. M1 (05 and 18
  both mischaracterizing what 01 names) was found this way, by hand, on
  two citations; nothing has swept the rest by any method precise
  enough to report findings from.

  **Trigger: build a tool that tests this precisely, not another manual
  or heuristic pass.** A heuristic that flags "a token near this
  citation is absent from the target" was tried during this review and
  discarded — it returned ~74 candidates from noise, mostly citing
  sentences quoting the *citing* file's own code rather than the
  target's. The right tool extracts each citation's actual attributed
  claim (a quoted phrase, a named rule, a stated fact) and checks it
  against the target with enough precision to report a verdict per
  citation, not a candidate list to re-read by hand. Until it exists,
  treat every "cross-references verified" claim about this corpus,
  including this one, as bounded by what was actually checked. **Owner:
  whoever builds that tool. No date trigger — this is a capability gap,
  not a scheduled task.**

- **Root `lint` script — CLOSED. Decision: `turbo lint`, not a bare
  `eslint .`.** Round-3 review flagged that the repo's root `lint`
  script (`turbo lint`, fanning out to each package's own `lint`) had
  drifted from 20-glossary-and-appendix.md's Commands Reference, which
  specified a bare `eslint .`/`eslint . --fix` and was never updated
  once `build`, `test`, and `typecheck` all moved to the same
  Turbo-delegation pattern. Decided in favor of the repo's `turbo
  lint`: there is no reason for `lint` alone to skip the caching and
  parallelism the other three commands already get, and every package
  already carries its own scoped `eslint .`. 20 is updated to state
  this as current. The two previously undocumented root scripts,
  `lint:eslint` and `lint:eslint:fix`, are kept and now documented as a
  deliberate escape hatch, not drift: a package-scoped `turbo lint` run
  never reaches root-only files (`eslint.config.js`, `scripts/*.mjs`),
  since no workspace package's `eslint .` is rooted there. Both pairs
  are required; neither is redundant with the other.

- **AppHeader notification trigger — CLOSED. Decision: drop
  `aria-haspopup`.** Companion to the dropdown/popover gap above (no
  standard specifies keyboard or disclosure-pattern behavior). Round-3
  review flagged that the trigger button carried `aria-haspopup="true"`
  over a panel whose rows are plain `<button type="button">` — no
  `role="menuitem"`, no roving tabindex, no arrow-key navigation —
  reachable only by Tab. That combination promises assistive tech an
  interaction model (a real ARIA menu) the markup doesn't implement.
  Decided in favor of dropping `aria-haspopup` entirely rather than
  building a real menu: the panel is a disclosure region, already
  correctly described by `aria-expanded`/`aria-controls` on the trigger
  and `aria-labelledby` on the panel, and those alone are sufficient —
  a disclosure region doesn't need `aria-haspopup`. Implementing a true
  ARIA menu instead would mean adding roving tabindex and arrow-key
  handling across `NotificationRow`, a materially bigger interaction-
  model change that nothing here calls for. If a future revision turns
  this panel into an actual keyboard-navigable menu, `aria-haspopup`
  and the missing menu semantics should be added back together, not
  `aria-haspopup` alone.

## A fourth source, and what it did to this register

`../analysis/vue-baseline-audit.md` (2026-08-24) audits the shipped Vue
portal's **code**, which no previous revision of this corpus had read.
00-core-rules.md ranks it: evidence, below all three existing sources, never
authority. It is a **reference** document under
31-documentation-standards-and-decision-records.md — dated, method-stated,
regenerated rather than patched.

It raised **four new placeholders**, all now in the table above, and it changed
the status of one already there.

### Two `tokens.css` files — the ambiguity is inherited, not introduced
This file has carried an open placeholder asking how `design-tokens`' token file
relates to `ui-library`'s. The audit answers a different and more useful
question: **the prior repository has exactly the same two files, with the same
absent explanation**, both listed in its formatter and lint ignores as "owned by
the token pipeline, not hand-formatted" — describing a pipeline that does not
appear to exist there either.

So the scaffold did not invent this. It inherited it, which means:

- **Nobody on the current team can resolve it by reading the code**, because
  nobody on the current team decided it.
- **It is a prerequisite of the restructure, not a cleanup task inside one.**
  30-restructuring-an-existing-react-project.md's Phase 0 now separates inherited
  questions from introduced defects for exactly this reason.

The placeholder stays open and its trigger is unchanged — before the token
scales are authored.

### One unresolved provenance question, still unresolved
The audit did not find the missing `BaseButton` and `AppHeader` component specs
recorded by review round 3. `component-specs/` still holds only `TEMPLATE.md`
and `INVENTORY.md`. Whether those specs were deleted or never existed remains
open, and remains worth resolving.

### What the audit did **not** change
No status in the summary table above. The audit read a different repository; it
says nothing about what this scaffold contains. **That section is still
regenerated by re-reading this repository, and it is still dated 2026-08-24 on
the strength of that reading, not this one.**

## Closed in this revision — nine placeholders, and how each closed

Two of these closed on **evidence** (someone looked) and seven on a **stated
default** (someone decided, and wrote down what would change it). The
distinction matters: an evidence closure is settled, a default closure is a
position that a reader may overturn with an argument.

31-documentation-standards-and-decision-records.md requires an ADR for each of
the seven. **Those ADRs are not yet written** — that is the outstanding half of
this closure, and it is tracked here rather than being quietly skipped.

| File | Question | Closed as | Basis |
|---|---|---|---|
| 07 | Fixed-height layout — fourth layout or variant | **A fourth layout.** The two differ in where the scroll container lives, and a boolean prop that relocates it changes sticky positioning, focus restoration and `scrollIntoView` invisibly at the call site | default |
| 15 | The default branch's name | **`main`** — trigger on `[main]` only, not the `[master, main]` hedge | **evidence** — the repository's branch |
| 15 | `.nvmrc` pin granularity | **Exact `major.minor.patch`.** `engines` stays a floor; `.nvmrc` pins; `engine-strict=true` enforces the floor | default |
| 15 | When the `e2e` job first runs | **With the first spec, in the same PR.** Five jobs until then, stated rather than omitted | default |
| 15 | Does Sonar gate a merge | **Advisory for 30 days, then blocking on PRs only.** Date recorded in the workflow file | default |
| 15 | `pnpm audit` severity floor | **Fail at `high`, warn below.** Allowlist entries carry an advisory ID, a reason, a **required expiry ≤90 days** and an owner; an expired entry fails the build | default |
| 15 | Does CI build Storybook | **Yes, path-filtered to the library and story files.** Catches build breakage only — **not** accessibility | default |
| 23 | Husky install path | `prepare` = `cd .. && husky pqms-portal/.husky`; `core.hooksPath` = `pqms-portal/.husky/_` | **evidence** — `.git` sits one level above the pnpm workspace root |
| 23 | Standalone or polyglot monorepo | **Sub-directory shape.** The git root holds `BRD/` and `requirements/` beside `pqms-portal/`, so all three hook guards are required | **evidence** — the directory listing |

**The 23 closure also closes the matching placeholder in
20-glossary-and-appendix.md**, which restated the same question.

### What this changed about the corpus

15-devsecops-and-ci-cd.md carried **six** open questions — the most of any file
— and the pipeline could not be built without answering three of them. It now
carries none. 23-git-workflow-hooks-and-commits.md's two questions blocked all
three hooks and both were answerable by looking at the repository, which is the
uncomfortable part: **they were open because nobody had looked, not because the
answer was hard.**

The general lesson for the remaining open rows above: **before deferring a
question to a person, check whether the repository already answers it.**

## The target repository changed — what that did to this register

The client's `project-template-java` documentation (`TEAM-GUIDE.md`,
`STACK.md`, `DEVELOPER_GUIDE.md`) arrived after the corpus was written, and it
describes a materially different target: **GitLab CI not GitHub Actions,
Lefthook not Husky, TypeScript 5.9 not 6, a split coverage floor, no state
library, and a SPEC-driven harness.** 00-core-rules.md lists all eight
corrections.

### Placeholders this closed on client evidence

| File | Question | Closed as |
|---|---|---|
| 08 | Does the browser hold a token | **Yes.** `STACK.md` §7: OAuth2 JWT **Bearer** with an API Gateway JWT authorizer — the gateway validates, it does not terminate |
| 07 | `AuthLayout` — build it or not | **Build it.** A Bearer flow has a redirect callback, so the layout has a consumer |
| 05 | The number of origins and clients | **One.** One Spring Boot service behind one gateway; the second client and the proxy-ordering hazard both disappear |

### Placeholders this opened

Three, all in the table above: the state-library adoption (04), the identity
provider (08), and whether an OpenAPI spec exists (33). **All three are the
client's to answer, not the Frontend Lead's**, which is a different escalation
path from every other row in this register.

### Two stale artifacts, and they are Phase 0 findings

`STACK.md` §8 item 5 records both: **`frontend/.storybook/` exists with no
`storybook` dependency**, and **Lefthook invokes `prettier` which is not a
declared dependency**. Tiers 24 and 14 both assume working installations.

Neither is a restructure task. **Establish first whether each is failing or
silently no-opping** — a hook calling a binary nobody installed does one of
those two things, and which one determines whether the format gate has ever run.

### Four contradictions inside the client's own documents

Region, Node version, backend port, and the backend package root all have two
different values across `TEAM-GUIDE.md` and `STACK.md`.
33-polyglot-monorepo-integration.md tabulates them.

**Only the Node one blocks a frontend developer** — following the prerequisites
table installs Node 20, which React Router v8 will not run on. **Report all
four; resolve none.** A document corrected in passing by someone outside the
team that owns it is how the drift `STACK.md` §8 records began.

### What this section does not claim
**The implementation-status snapshot above is unchanged and still describes the
scaffold in this repository**, not the client's `frontend/`. Nothing here was
verified against the target repository — it was read from the client's
documentation, which is itself dated 2026-08-20 and carries its own drift
warnings. **A fresh Phase 0 baseline against the real `frontend/` supersedes all
of it**, and is the first SPEC.

### Closed 2026-08-25 — the workspace question, and the corpus's first ADR

**`frontend/` is always a pnpm workspace** (ADR 0001, decided by Prisilla
Ghadi). The observed flat tree is a defect corrected in Phase 2, not a layout
the corpus adapts to.

This is the **first decision record written to the format**
31-documentation-standards-and-decision-records.md specifies — numbered,
dated, named decider, and an *options rejected* section. Three alternatives
were considered and recorded rather than lost: staying flat, splitting after
conformance, and splitting into more than three packages. **That section is the
one that pays for itself**, because staying flat was genuinely defensible and
someone will propose it again.

### The consequence worth carrying forward is not about structure

A workspace split **silently disables any tool keyed on a path or an import
specifier.** A lint glob that matches nothing reports **zero violations**, not
an error.

So: the move and the tool re-pointing land in **one commit**, and that commit
records the violation count on both sides. **A count that drops to zero is the
failure, not the success** — and it is indistinguishable from a clean result
unless someone wrote the before-number down.

This generalises past this decision. Any gate keyed on a location — coverage
path configuration, Sonar source roots, a formatter ignore list, a CSS scrape —
has the same property, and Phase 2 moves all of them at once.

## Closed 2026-08-25 (second pass) — Prettier configuration, and a provenance defect

**`frontend/.prettierrc` governs; 14-code-style-and-linting.md's stated values
are withdrawn** (ADR-0002, decided by Prisilla Ghadi).

| File | Question | Closed as | Basis |
|---|---|---|---|
| 14 | Which Prettier configuration governs | **The repository's own.** `printWidth` 120, `semi` false, `singleQuote` true — and the code matches it | **evidence** — 42 files differ from the local config; every file would differ from 14's |

**The reason this needed an ADR rather than an edit** is that it is a standard
being deliberately not followed, which
31-documentation-standards-and-decision-records.md names as a trigger. It is also
the third time source precedence has resolved the same way — the ordinal spacing
scale (`--space-8` is 32px, not 8px) and the seven-status vocabulary were both
settled by the local artefact over the written standard.

### The open row this opens

14's Prettier values were "carried forward verbatim from `kus-pqms`", the prior
Vue repository, and were never re-derived against this project. **Two further
sections of 14 cite `kus-pqms` the same way and have not been checked:**

- **[PLACEHOLDER — 14's "Export conventions".** Default-export-per-component and
  named-exports-for-everything-else are justified entirely by a count of `.vue`
  files in `kus-pqms`. Whether this React port follows it is unverified.
  **Trigger:** before any lint rule enforces export style. **Owner:** Frontend
  Lead.]
- **[PLACEHOLDER — 14's "Two compiler flags the prior config turns off".** The
  reasoning is sound and framework-specific; the claim that `noUnusedLocals` and
  `noUnusedParameters` are both on in this repository is unverified.
  **Trigger:** the TypeScript baseline story. **Owner:** Frontend Lead.]

**This is 00-core-rules.md's source-precedence case 5 occurring inside the
corpus.** Case 5 is written about design-token literals; a formatter setting is
not a token value, and it failed the same way. **A provenance line records where
a value came from, not that it is correct here.** Any corpus statement whose only
support is "carried forward from `kus-pqms`" is unverified until someone checks
it against this repository.

## Enforcement layer — built 2026-08-25, and its numbers

The "Absent — the enforcement layer" section above is superseded for the gates
listed here. This is the reference half of this file: **a dated snapshot, not a
standard.** Where it disagrees with a tier file, the tier file wins.

**Method:** every number produced by running the gate, on commit `4259b33`,
against unmodified `src/`. Nothing is quoted from a plan.

### The three adherence ceilings

Ceilings live in `frontend/.ds-ceilings.json` and are **written by
`scripts/ds-gate.mjs`, not by a human**: a count that drops rewrites the file, a
count that rises fails, and raising means editing a tracked file by hand.

| Family | Count | Ceiling | Nature |
|---|---:|---:|---|
| `values` — raw px / hex / font literals | **467** | 467 | ratchet; falls as Step 8 converts to tokens |
| `numeric` — hard-coded numeric dimensions | **348** | 348 | ratchet; newly visible |
| `imports` — restricted imports | **0** | 0 | regression guard, already clean |

**Per-component prop/enum selectors: NOT EXECUTED.** They were 195 permanent
false positives — regex prop allowlists written against the design system's
plain-JS source where `Button` declared six props, while this port's
`Button extends ButtonHTMLAttributes` makes `onClick`/`disabled`/`aria-*` correct
and type-safe. `tsc --noEmit` checks props against the real interfaces and is
strictly stronger. Filtered in `eslint.adherence.config.mjs`;
`_adherence.oxlintrc.json` remains a byte-copy.

### 815 is not a regression

The single number moved 662 → 467 when the false positives stopped executing,
and the newly-closed numeric loophole then added 348 previously-unobserved
violations to the tracked total.

**467 + 348 = 815 is 467 real signals plus 348 that were always present in the
code and are now counted.** Nothing was introduced. The earlier 662 was smaller
because it included 195 warnings that were wrong and excluded 348 that were real.

**Any comparison against 662 is a comparison against a number of a different
kind**, and Step 6's "the adherence count is unchanged and non-zero" acceptance
must be read against the per-family ceilings above, never against 662.

### Other gates now enforced

| Gate | Result | Where it runs |
|---|---|---|
| `tokens:check` | 156 tokens, passes | build + pre-commit |
| `tokens:drift` | generated map matches the manifest | build + pre-commit |
| `lint:css-vars` | 1,829 `var()` refs, 119 names, **0 unresolved** | build + pre-commit |
| `typecheck` | `tsc --noEmit`, exit 0 | build + pre-push |

Every one was proved to **fail** as well as pass, by breaking it deliberately and
reverting. A gate that has never failed is indistinguishable from one that does
not run.

### What is still absent

- **CI. There is none, anywhere in the repository.** Every gate above is local,
  so all of them reach one machine. The `[PLACEHOLDER — the CI platform]` in
  00-core-rules.md stays open; the Phase 0 baseline that was its trigger has run
  and found nothing to identify a platform with.
- **Tests.** Zero, no runner, no coverage. 10-testing-standards.md's ratchet has
  a floor of 0 and nothing to ratchet.
- **A repository-wide hooks bootstrap.** `frontend/scripts/setup-hooks.mjs`
  covers anyone who installs in `frontend/`; `core.hooksPath` is a single
  repository-level value, so someone working only in `backend/` still gets no
  hooks. **[PLACEHOLDER — a root-level hooks bootstrap.** Needs a root
  `package.json`, a documented clone step, or a checked-in setup script that the
  README makes unavoidable. **Trigger:** the next component to add real hook
  checks. **Owner:** repo owner — it cannot be decided inside `frontend/`.]**

## Closed 2026-08-25 (third pass) — the two decisions that had no record

`steps-for-new-repo.md`'s decision log listed both as settled with the note
*"needs ADR"*. 31-documentation-standards-and-decision-records.md is explicit
that a closed placeholder with no ADR loses the reasoning, so both are now
written.

| File | Question | Closed as | Record | Basis |
|---|---|---|---|---|
| 06 | Token **value** source | **The vendored design system.** `design-system-manifest.json` (156 tokens) is the source of truth; the CSS is a byte-copy and the typed map is generated, both gated. A value changes by re-vendoring | **ADR-0003** | **evidence** — 156 = 156 with 0 unchecked, `tokens:check` passes, generated map byte-identical, 1,829 `var()` refs with 0 unresolved |
| 00 | Frontend package manager | **pnpm.** `package-lock.json` deleted; converted with `pnpm import` preserving all 336 resolutions exactly | **ADR-0004** | **evidence** — resolution sets identical after normalisation; `engineStrict` proved by forcing an impossible `engines.node` |

**Both closed on evidence rather than a stated default**, which is the stronger
of the two closure kinds this file distinguishes.

### What ADR-0003 changes about 06's role

06 was written for a repository that must *decide* its token values. This one
receives them with a manifest and a drift gate attached. **A value with a
machine-checkable provenance beats a value with a well-argued derivation**, so
06 yields on the values and keeps everything else — naming, the ordinal scale,
semantic mapping, and the rule that a hardcoded value traces to a real source.

This also closes 00's source-precedence **case 5** for these 156 values
specifically: a re-vendor that changes a value now fails `tokens:check` rather
than drifting silently. The hazard remains for every value *not* in the manifest
— the prototype constants Step 8 has to give a named home.

### What ADR-0004's placeholder got wrong, and why that is worth keeping

00's placeholder warned that two lockfiles mean "CI will install whichever its
command picks". **There is no CI.** The hazard arrived by a different route: one
`pnpm` command, run to answer a read-only question, hit pnpm's auto-install
preflight, which adopted the npm-installed `node_modules`, wrote two lockfiles
and **re-resolved every `^` range before the requested script ran at all**.

**The general form is the part to carry forward: a package manager that is
intended but not adopted is not a neutral state. The un-adopted one still runs,
and it acts on being invoked.** The placeholder was right that it was a hazard
and wrong about the mechanism — which is an argument for naming hazards by their
cause rather than by the scenario you first imagine for them.

## Phase 2 workspace split — completed 2026-08-25

**Reference, not standard.** Dated snapshot; the method is "every number below
was produced by running the gate". Where it disagrees with a tier file, the tier
file wins.

### The structure that now exists

```
frontend/                      pnpm workspace root (not a package)
├─ apps/portal/                @pqms/portal
├─ packages/ui-library/        @pqms/ui-library
├─ packages/design-tokens/     @pqms/design-tokens
├─ tsconfig.base.json
└─ scripts/                    workspace-level gates
```

ADR 0001's split map was followed exactly, including its judgement call that
`chrome.tsx` stays in the app. **`frontend/` is now the workspace root and is no
longer itself a package** — which is also the corrected answer to
00-core-rules.md's Path convention, whose earlier `pqms-portal/` was the prior
repository's directory name carried forward without re-derivation.

### Before and after — the acceptance evidence

| Measure | Before | After |
|---|---:|---:|
| `values` (raw px / hex / font literals) | 467 | **467** |
| `numeric` (hard-coded dimensions) | 348 | **348** |
| `imports` (restricted imports) | 0 | **0** |
| tokens verified | 156 | **156** |
| `var()` refs / distinct names / unresolved | 1829 / 119 / 0 | **1829 / 119 / 0** |
| JS bundle | `index-BDNeyRad.js` | **`index-BDNeyRad.js`** |
| CSS bundle | `index-fURKnrD4.css` | **`index-fURKnrD4.css`** |

**Counts unchanged AND non-zero**, which is the acceptance criterion. A drop to
zero would have been the failure, not the success.

**The bundle hashes are identical.** Vite content-hashes output filenames, so
identical hashes mean byte-identical bundles. See the fidelity section below for
why that substituted for the screenshot comparison here, and why it cannot
substitute again at Step 8.

### The gate the counts could not vouch for

The `imports` family was 0 before the split, and would have been 0 after it
while checking nothing — its patterns match `components/**`, and the code now
imports `@pqms/ui-library`. **Two identical numbers, one meaning "clean" and one
meaning "dead".**

Closed with a third alias twin in `eslint.adherence.config.mjs` **and** a
positive control, `scripts/check-import-rule.mjs`, which feeds the live
configuration deliberately-violating imports and fails if they are not reported.
15-devsecops-and-ci-cd.md now carries this as a standing rule.

### Two mid-course corrections, both worth keeping

- **`packages/ui-library` lost its CSS-module type declarations.**
  `vite-env.d.ts` moved to `apps/portal` with the app, and eight components then
  failed `tsc --noEmit` on `*.module.css`. One ambient declaration file had
  covered every file; three tsc programs need three. Fixed by adding one to the
  package.
- **Vite aliases mapping package NAMES to their `index.ts` FILES broke subpath
  exports.** `@pqms/design-tokens/styles.css` resolved to
  `.../src/index.ts/styles.css` and the build failed with ENOENT — **an alias to
  a file cannot have children.** The aliases were removed entirely: pnpm symlinks
  each workspace package, and their `package.json` `exports` handle both the root
  entry and subpaths. **The reasoning is kept as a comment in
  `apps/portal/vite.config.ts`**, because deleting an alias looks like a
  regression to anyone who assumes workspace packages require one.

## There is no test framework, and that has consequences

**Measured: zero test files, no runner, no coverage, no configuration.**
`playwright` is a devDependency used only by the two screenshot capture scripts;
there is no `@playwright/test`, no Vitest, no React Testing Library, no MSW.

**What this makes vacuous:**

- **10-testing-standards.md describes nothing that exists.** Its coverage
  thresholds, the mirrored `src/tests/` tree, the RTL query priority, the MSW
  handlers and the axe assertions all govern a suite nobody has written. The file
  is a target and should be read as one.
- **The coverage ratchet has a floor of 0 and nothing to ratchet.**
- **Any acceptance criterion phrased "test count identical before and after" is
  satisfied by 0 = 0 and proves nothing.**
  30-restructuring-an-existing-react-project.md states exactly that for Phase 2,
  and `../steps-for-new-repo.md` Step 6 repeats it. It passed for the workspace
  split without exercising a single line of code.

**So a structural move in this repository is a higher-risk operation than the
runbook implies.** The runbook's confidence rests on two instruments — a
characterization suite and byte-identical fidelity captures — and **neither
exists today.** What actually carried Step 6 was the unchanged bundle hashes,
which is a narrower guarantee than either.

**[PLACEHOLDER — the test framework.** Vitest + React Testing Library per 10,
with a coverage ratchet seeded at 0. Until it exists this project has no
behavioural test of any kind. **Trigger:** before Step 8 token conversion, the
first phase that changes rendered output by design. **Owner:** Frontend Lead.]**

## The fidelity harness is broken, and it is the only behavioural test

`FIDELITY-REPORT.md` records a passing comparison dated 2026-08-22. **The harness
that produced it does not run on current hardware.** Three independent defects,
each verified:

1. **The prototype path is hardcoded to a drive that does not exist.**
   `scripts/fidelity-capture.mjs` sets `PROTO_URL` to
   `file:///D:/workspace-II/...`; there is no `D:` drive. The prototype *does*
   exist locally under `_bmad-output/`, so this is a one-line path defect that
   happens to be machine-specific and committed.
2. **The Playwright browser revision is wrong.** `playwright@1.62.1` requires
   chromium revision **1234**; the cache holds **1228**, so `chromium.launch()`
   fails outright. Needs `npx playwright install`.
3. **`APP_URL` targets an address the server does not listen on.** The harness
   uses `http://127.0.0.1:4173`, and `vite preview` binds **`[::1]` only** on
   this machine — a TCP probe returns `ECONNREFUSED` on `127.0.0.1` while
   `localhost` and `::1` connect. Every app-side capture would fail.

**A fourth problem is worse than those three: the harness has no verdict.**
Neither capture script contains any comparison, assertion or non-zero exit.
`fidelity-capture.mjs` wraps each screen in `try/catch`, prints `✗` on failure,
and **exits 0 regardless**. A CI job calling it would go green with every capture
missing. The 2026-08-22 comparison was made by a person looking at images.

### Why unchanged bundle hashes worked at Step 6 and CANNOT work at Step 8

Step 6 was a **pure move**: no source byte was meant to change meaning, so
byte-identical bundles proved byte-identical rendering. That was a legitimate —
and in fact stronger — substitute for a screenshot diff.

**Step 8 is the opposite case by construction.** Token conversion rewrites
`padding: '20px'` to `padding: 'var(--space-5)'`. **The source bytes change on
purpose, so the bundle hash MUST change, while the rendered pixels must not.**
The hash therefore carries no information about the only property that matters,
and this is precisely the case where nothing but a screenshot comparison will do.

**[PLACEHOLDER — repair the fidelity harness.** Four pieces: run
`npx playwright install`; make `PROTO_URL` relative; use `localhost` or bind
preview to `0.0.0.0`; and **add a real comparison with a non-zero exit**.
Capture determinism across two consecutive runs must also be demonstrated before
"byte-identical" is relied on as a gate — fixed `waitForTimeout`s, `networkidle`
and font rasterisation are all sources of noise, and this was never verified
because the harness does not run. **Trigger:** prerequisite of Step 8, not
optional. **Owner:** Frontend Lead.]**

**`FIDELITY-REPORT.md` itself is deliberately not patched.**
31-documentation-standards-and-decision-records.md classes it as `analysis/` —
regenerated, never hand-edited. It is stale in two known ways: it states
`.fidelity/` is gitignored (it is **tracked** — 91 files, 11.3 MB) and it cites
the 8-status canonical set (the code implements **seven**, per the 2026-08-23
directive that post-dates the report by one day). **It needs regeneration, which
is blocked on the harness repair above.**

## The corpus was authored for a different repository — one placeholder, not six

00-core-rules.md now opens with a divergence table: six entries in its "Confirmed
stack" are not confirmed for this repository. **That table is tracked here as a
single open row rather than six**, because splitting it is what allowed the
current state — each row looks minor alone, and together they mean Tier 0
describes a different project.

**[PLACEHOLDER — reconcile the confirmed stack.** See 00-core-rules.md's
divergence table for the six rows and their dispositions. Two are
"repo is behind and will adopt" (a test framework, `.nvmrc`); **four require an
architect decision** — the React/Router/Vite versions, Tailwind, the state
libraries, and Turborepo. None may be resolved by citing Tier 0, because Tier 0
is what is currently wrong. **Trigger:** before any phase that would adopt one of
them — Step 8 for Tailwind, Step 10 for the state libraries. **Owner:
architect.]**

**[PLACEHOLDER — general-purpose ESLint.** 14-code-style-and-linting.md mandates
`eslint.config.js` at the workspace root with a five-position chain and ESLint
`^10.7.0`. None of it exists: ESLint is **9.39.5** and the only configuration is
`eslint.adherence.config.mjs`, the vendored design-system runner. **There is no
general lint at all** — no `no-unused-vars`, no rules-of-hooks, no accessibility
rules, which also means 11-accessibility-standards.md's severities describe a
plugin that is not installed. Adoption arrives with 30's Phase 1 mechanism —
baseline the count, ratchet down — not as a documentation fix. **Trigger:** the
gates follow-up epic. **Owner:** Frontend Lead.]**

**[PLACEHOLDER — a repository-wide hooks bootstrap.**
`frontend/scripts/setup-hooks.mjs` covers anyone who installs in `frontend/`.
`core.hooksPath` is a single repository-level value, so someone working only in
`backend/` still gets no hooks, and with no CI that clone has zero enforcement.
Needs a root `package.json`, a documented clone step, or a checked-in setup
script the root README makes unavoidable. **Trigger:** the next component to add
real hook checks. **Owner:** repo owner — it cannot be decided inside
`frontend/`.]**

## Step 7 structural assessment — 2026-08-25

**Reference, not standard.** Method: 01 and 07 read in full, then measured
against `apps/portal/src` file by file. Where this disagrees with a tier file,
the tier file wins.

**Outcome: one deletion, zero moves.** Step 6 had already done the structural
work; what remained in Step 7's description was either already satisfied,
forbidden by 01's own anti-scaffolding rule, or a content edit rather than a move.

### What already conforms — recorded because positive evidence stops re-litigation

These five were checked against 01 and found **already correct**. They are listed
so the next pass does not re-open settled structure looking for work.

| Requirement | Evidence |
|---|---|
| **`components/shared/` only for 2+-feature components** (01) | No `shared/` folder exists, and **zero cross-feature component imports** — `LinkIssuesSection` and `ModelCodeYearPicker` are used only by `CreateIssueScreen`, `PriorityTab` only by `IssueWorkspaceScreen`. Correctly absent rather than missing |
| **Feature folders stay flat until ~15 files or 2+ sub-concerns** (01) | `features/issues/` holds **6** files; every other feature holds 1. Flat is the correct state, not a deferral |
| **Tab folders are thin wrappers; real UI in a sibling folder** (01) | Satisfied in substance — `PriorityTab.tsx` is a sibling module imported by `IssueWorkspaceScreen`, not duplicated into a tab folder |
| **`chrome.tsx` stays in the app** (ADR 0001) | Confirmed still correct. It imports `useNavigate`, and 01's package-ownership rule forbids router dependencies in `ui-library`. No second consumer exists |
| **`ui-library` categories; nothing at `components/` root** (01) | Six category folders, **zero files at root**. 01 records that the prior library failed exactly here (`BaseDataTable`/`BaseModal` uncategorised); this port did not |

### What was assessed and deliberately not applied

| Requirement | Disposition |
|---|---|
| **`pages/` route hosts** (07) | **Deferred — ADR-0005.** 07's benefit is testable and unreachable by adding hosts alone: six of seven screens call `useNavigate` for in-screen actions, so a host leaves them router-dependent. Reachable via a callback-props refactor across six screens, which has **no beneficiary today** (no Storybook, no tests, no second consumer). 07 now carries the precondition |
| **Feature-scoped `services/`** (01) | **Not applied.** No services exist. `data/store.tsx` is deliberately the whole data layer and encodes three domain invariants; splitting it by feature fights its design. Unblocks at Step 10, when a backend exists |
| **Feature-scoped `hooks/`** (01) | **Not applied.** Zero custom hooks in the application. 01's own rule governs: *"a folder is not created before something lives in it"* |

### Deleted

`frontend/public/` — empty, unreferenced, and **already dead before this pass**:
Step 6 moved the Vite root to `apps/portal`, so Vite's default `publicDir`
resolves to `apps/portal/public`, which does not exist. Verified unreferenced
against `index.html`, `vite.config.ts` and all three `src` roots (no
absolute-root asset paths anywhere), and a dev-server load produced **no new
non-200 responses**. Git never tracked it — empty directories cannot be — so the
deletion appears in no diff.

That closes 01's *"a folder is not created before something lives in it"* and
30 Phase 2's inherited-empty-directory rule. **No empty directories remain
anywhere in `frontend/`.**

### Acceptance — all four checks plus both positive controls

| Check | Result |
|---|---|
| Bundle hashes | **`index-BDNeyRad.js`, `index-fURKnrD4.css`** — identical |
| `values` / `numeric` / `imports` | **467 / 348 / 0** — unchanged |
| tokens / css-vars | **156** / **1829 refs, 119 names, 0 unresolved** |
| `tsc --noEmit` | **exit 0** across all three packages |
| `check-import-rule.mjs` | 3 violating shapes reported, barrel allowed |
| `ds-gate` zero-file guard | fails on a missing target *and* on an existing-but-non-matching one |

**[PLACEHOLDER — extract declarative screen configuration to `config/`.**
01's `config/` rule fits: `AdminScreen` alone holds `JOBS`, `KPIS`, `SOURCES`,
`AUDIT`, `CLASS_TREE`, `CLASS_COUNTS`, `MODULE_TINT` and `FREQ_OPTS` inline, and
`IssueListScreen` holds `PAGE_SIZES` and `DEFAULT_COLS`. Not done in Step 7
because **it edits file contents**, and that phase was moves-and-renames only.

**An open design question comes with it, and it should be answered before the
extraction rather than during:** much of that data is **prototype-shaped display
data**, not configuration — `JOBS`, `SOURCES`, `AUDIT` and `CLASS_TREE` are
sample rows the prototype displays, closer in kind to `data/seed.ts` than to
`config/issue-columns.config.ts`. Splitting on the wrong axis produces a
`config/` folder that is really a second seed file. `PAGE_SIZES`, `DEFAULT_COLS`
and `MODULE_TINT` are unambiguously configuration; the rest needs a decision.

**Trigger:** after the fidelity harness is repaired — moving display constants
can move pixels, and there is currently no check that would catch it.
**Owner:** Frontend Lead.]**

### Two places this application is a counter-example to the corpus

- **07's `pages/` convention had an unstated floor.** Recorded in 07 with this
  app as the worked example, and in ADR-0005. Its provenance is `kus-pqms`, a
  124-SFC application — the size at which route-concern leakage is a real cost.
- **07's route tree names modules that are out of scope here.** `/qir` and
  `/tsb` are absent by design, with the nav items rendered **disabled** for
  fidelity to the prototype; `frontend/README.md`'s guardrails govern scope.
  `/overview` versus `/dashboard` and `/issue-management` versus `/issues` are
  naming only. **No route was changed** — route paths are behavioural. The
  divergence table is in 07.

## The pixel harness — CORRECTED 2026-08-26

**Reference, not standard.** Dated; method is "every number was produced by
running the gate". Where this disagrees with a tier file, the tier file wins.

> ### ⚠️ CORRECTION — the previous version of this section was wrong
>
> It stated that a pixel comparison is **structurally blind** to the change
> Step 8 makes, because its necessary tolerance exceeds its signal, and concluded
> that the harness should be replaced rather than repaired.
>
> **That conclusion does not follow from the measurement it cited.** The
> 0.66–2.14% figure is **cross-machine** drift — the current machine against
> baselines captured elsewhere, on a different browser revision. It is not a
> property of pixel comparison as a method.
>
> **The method requires no tolerance at all here.** Same-machine, same-browser,
> back-to-back capture measured **0.0000% across all nine screens — byte-identical,
> every pixel.** With a fixed machine and a pinned browser revision, **threshold
> zero is correct and any non-zero diff is signal.**
>
> The error was attributing an artefact of the *baselines* to the *instrument*.
> The instrument was never the problem, which the determinism result had already
> shown in the same session.
>
> **15-devsecops-and-ci-cd.md's structural-blindness rule stands** — it is sound
> and generally useful. **Its worked example was this harness, and that example is
> withdrawn there.**

### The measurement, and the condition it depends on

| Comparison | Drift | Meaning |
|---|---|---|
| Same machine, same browser, back-to-back | **0.0000%** (9/9 byte-identical) | the instrument is exact |
| This machine vs baselines captured elsewhere | 0.66–2.14% on unchanged screens | **baseline provenance**, not method noise |
| A screen with a genuine source change | 4.61% | signal, well clear of same-machine noise |

**THE CONDITION, and it is load-bearing: this holds because the browser revision
and the machine are fixed.** Chromium's text shaping and rasterisation change
between builds, so a revision bump moves pixels on screens nobody touched.

Two consequences that must travel with any use of this gate:

1. **The browser revision is pinned in `package.json`.** Revision drift then
   becomes a loud install failure instead of silent pixel drift — the single
   change that makes this gate durable, and the absence of which produced the
   0.66–2.14% that cost a day to diagnose.
2. **Every machine needs its own baseline until that pin is repo-wide and CI
   runs in a fixed image.** A baseline is valid for the environment that produced
   it and no other. That is a real limitation and it is not fatal: there is one
   machine and no CI today.

### The diagnostic layer beneath the gate

**Three tools, and only two of them are gates.** The distinction matters and is
recorded in each file per 14's rule that anything below full strength carries its
reason and trigger where it lives.

| Tool | Answers | Wired into | Cross-machine |
|---|---|---|---|
| `scripts/fidelity-gate.mjs` | **did anything change?** — exact pixel comparison, threshold **zero** | `build`, `pre-push` | machine + browser pinned |
| `scripts/check-token-equivalence.mjs` | **does this substitution preserve the value?** — manifest lookup, no rendering | Step 8, per conversion | **Yes** — compares two strings |
| `scripts/style-gate.mjs` | **which declaration changed?** | **nothing — run by hand** | styles yes, geometry no |

**`style-gate.mjs` is a DIAGNOSTIC, not a gate, and is deliberately not wired
in.** It is the layer beneath the pixel gate: the gate says *something moved*, this
says *`row-gap: 10px -> 14px` on the breadcrumb row*. On a screen carrying forty
token conversions that difference is the whole cost of triage.

**It is not promoted because it is strictly narrower.** It sees only whitelisted
properties on elements present in both snapshots, so it is blind to a changed SVG
path, a swapped image, or a font that failed to load — all of which the pixel
comparison catches. **Trigger to promote:** the pixel comparison proving
unreliable in practice. **Owner:** Frontend Lead.

**Its two halves are diffed separately and must stay that way.**
`getComputedStyle` returns *used* values for `width`/`height`/`top`/`left`, which
depend on layout and therefore on text metrics. Admitting even one to the
whitelist would make the styles half machine-dependent **while still looking
cross-machine**. Audited 2026-08-26: **31 properties whitelisted, zero
layout-dependent.** One caveat recorded in the file — a percentage padding or
margin resolves against the containing block's width, so if percentage box values
ever appear the machine-independence claim needs re-checking.

Baseline: `.style-baseline/`, 6 routes, **1,441 elements**, regenerable with
`--write`.

**Positive control, per 15:** perturbing `chrome.tsx` `gap: 10 → 14` produced
`row-gap: 10px -> 14px` naming the element, on all six routes, plus 30 geometry
consequences. Reverted; clean, and the bundle hash returned to
`index-BDNeyRad.js`.

### The 91 baselines are superseded as a gate — and RETAINED on disk

**The parameters that produced them were never recorded, so they could not be
reproduced or trusted.** Evidence, not inference:

- **Seven distinct viewports** across 91 files: 1600×1000 (38), 1280×900 (21),
  1920×1080 (21), 1280×1000 (3), 1920×1000 (3), and **1600×2926 and 1600×2922 —
  the same screen, 4px apart**, which is two runs of one capture that disagreed.
- **53 files are `dev-*`/`dc-*` names matching no committed code path**, including
  `dev-dashboard-r9` and `dev-dashboard-recheck` — ad-hoc runs whose inputs exist
  nowhere.
- No record of browser revision, timezone, font state or app commit for any of
  them.

**A baseline whose capture conditions are unknown cannot be a gate.** A diff
against it is uninterpretable: there is no way to tell a regression from a
different viewport.

**They are nonetheless RETAINED on disk.** Deletion was carried out on 2026-08-25
and **reversed on 2026-08-26**; all 91 files are restored and tracked.

The distinction that matters: **unusable as a gate is not the same as
worthless.** They are the only visual record of what this application looked like
on 2026-08-22, they are the reference the human "Aligned" verdict in
`FIDELITY-REPORT.md` was reached against, and once the harness is repaired they
may be worth a one-off eyeball comparison — even though they can never be a
pass/fail input.

**The cost of keeping them is 11.3 MB of tracked binaries, plus the risk that
someone mistakes them for a live baseline.** That second risk is the reason this
section stays where it is: **nothing reads `.fidelity/` any more.**
`.style-baseline/` is what the gates use.

**[PLACEHOLDER — decide the fate of `.fidelity/`.** Keep as a dated visual
archive, or delete once the harness repair produces a reproducible replacement.
**Trigger:** the harness repair, sequenced after Step 8. **Owner:** Frontend
Lead.]**

## Application defect — dates shift by a day with the developer's timezone

**This is a user-facing defect, not a screenshot problem**, and it is recorded
separately for that reason.

`apps/portal/src/data/util.ts` — `fmtMDY` and `fmtHM` call `getMonth()`,
`getDate()`, `getFullYear()`, `getHours()` and `getMinutes()`. Those are
**local-time getters**, applied to **UTC-anchored ISO strings** from the seed.

Measured with the frozen seed anchor `2026-07-09T02:00:00Z`:

| Timezone | `fmtMDY` renders |
|---|---|
| UTC | `07/09/2026` |
| Asia/Kolkata (+5:30) | `07/09/2026` |
| **America/New_York (−4)** | **`07/08/2026`** |

**The date column is wrong for users**, not merely unstable for captures. An issue
raised late on the 9th UTC displays as the 8th to a US-East viewer, which is a
reporting error in a quality-management system where dates carry process meaning.

It is also why pinning `timezoneId` is a precondition of any future screenshot
comparison: without it, two correct machines produce two different renderings.

**[PLACEHOLDER — timezone-correct date rendering.** `fmtMDY`/`fmtHM` must use UTC
getters, or `Intl.DateTimeFormat` with an explicit `timeZone`, per
21-logging-formatting-and-client-diagnostics.md's rule that no component formats a
date inline. **Do not fix this in a structural phase — it changes rendered output
and belongs in its own change with its own verification.** **Trigger:** its own
change, after the style gate exists to verify it. **Owner:** Frontend Lead.]**

## Two hygiene items closed

- **`FIDELITY-REPORT.md:3` claimed `.fidelity/` was gitignored.** Nothing ignored
  it; all 91 files were tracked. Corrected in place — a one-line factual fix, not
  a regeneration, so 31's regenerate-don't-patch rule for `analysis/` documents is
  not engaged. The report's other staleness (the 8-status set) still requires
  regeneration and is unchanged.
- **`dc-compare.mjs` wrote into the tracked UX design-source export — and the
  write ALREADY HAPPENED.** See D17 in the baseline addendum.
  `_boot-admin.dc.html` was committed in `fa25e69` and is tracked today, so this
  was never a future risk; it is an existing condition.

  **`.gitignore` does not untrack an already-tracked file**, so the entry added to
  the root `.gitignore` prevents a recurrence elsewhere and does **not** close the
  existing one. Fully closing it needs `git rm --cached` on that path — a
  deliberate staged change, not made here.

  Also closed: the `existsSync` guard is removed. Because the file is tracked,
  that guard meant **every clone would serve the committed boot copy forever**,
  silently comparing the app against whichever design revision produced it.

  **Relocating to a temp directory was tried and reverted**: the `.dc.html`
  resolves `support.js`/`_ds/` by relative path and must sit beside them to load.

  **[PLACEHOLDER — untrack `_boot-admin.dc.html`.** `git rm --cached` it, leaving
  the `.gitignore` entry to keep it out. **Trigger:** the harness repair, which is
  sequenced after Step 8. **Owner:** Frontend Lead.]**

## Dead code found while building the gates

**`IssueCard` is exported from the `ui-library` barrel and imported by nothing.**
It is tree-shaken out of the bundle: editing `padding: 16 → 20` produced an
**identical bundle hash**, and it appears zero times in `dist`.

Recorded as D16. The consequence beyond one component: **"bundle hash unchanged"
is blind to any change in code that does not reach the bundle.** That does not
weaken Step 6's conclusion — moving unreachable code changes nothing by
definition — but it is a second reason the hash is not a general substitute for a
behavioural check, alongside the already-recorded one that Step 8 changes source
bytes deliberately.

## The harness is repaired — 2026-08-26

All four defects closed. `scripts/fidelity-gate.mjs` replaces
`fidelity-capture.mjs` as the gate.

| # | Defect | Repair |
|---|---|---|
| 1 | `PROTO_URL` hardcoded to `file:///D:/...` | resolved relatively from the script |
| 2 | chromium revision 1228 vs required 1234 | browsers installed; **`playwright` pinned EXACTLY (`1.62.1`, no caret)** so the revision cannot drift |
| 3 | `127.0.0.1` vs `[::1]` | `localhost` |
| 4 | **no verdict, exits 0 regardless** | `pixelmatch` + `pngjs` as real workspace devDependencies, per-screen diff images, **non-zero exit**, and a capture failure is now a hard failure instead of a logged `✗` |

Also pinned in the capture context: `timezoneId: 'UTC'`, `locale`,
`reducedMotion`, `colorScheme`, `deviceScaleFactor` — everything that can move a
pixel without the code changing.

**Threshold is ZERO.** Verified: `--write` then `--check` returns
"10 screens, pixel-identical".

**Positive control — and it settles the tolerance question empirically.**
Perturbing `chrome.tsx` `gap: 10 → 11` — a **one-pixel** change — was caught on
**9 of 10 screens**, at **0.0207 – 0.0819%** of frame.

**That is an order of magnitude BELOW the 0.66–2.14% cross-machine drift.** A
tolerance sized to absorb that drift would have missed this change completely.
It is the clearest possible demonstration that the answer was never a threshold —
it was fixing the baseline provenance so no threshold is needed.

**The live baseline lives in `.pixel-baseline/`, not `.fidelity/`, and is
gitignored.** They were briefly the same directory, and a `--write` **silently
overwrote seven tracked archive images** before it was caught and reverted. The
2026-08-22 archive and the live baseline are different artefacts with different
lifetimes; keeping them in one directory guaranteed that collision.

## The app-vs-prototype delta — measured for the first time, 2026-08-26

**This number did not previously exist.** The old harness captured `dc-*` from the
**dev server** and `app-*` from **`vite preview`**, at different viewports on
different days — the two families were never mutually comparable, so no delta was
ever computed. The 2026-08-22 "Aligned" verdict was a human comparing images.

Captured with `scripts/measure-prototype-delta.mjs`: both halves, one browser
context, one viewport, one timezone, back to back.

| Screen | Differing px | % of frame |
|---|---:|---:|
| dashboard | 70,536 | **6.12%** |
| issues list | 66,147 | **5.74%** |
| workspace detail | 52,926 | **4.59%** |
| create issue | 54,969 | **4.77%** |
| **mean** | | **5.31%** |

> ⚠️ **This measured `PQMS_SE.html`, superseded 2026-08-26.** It remains a valid
> REGRESSION signal — same baseline both times, so "unchanged to the digit across
> 274 conversions" still holds — but it is **not** a fidelity measurement. See
> "What the 5.31% figure is" below.

**Read this as a good result.** The app renders its own deterministic seed while
the prototype renders its own sample rows, so **a large share of every number
above is DATA, not layout** — different issue IDs, different titles, different
dates, all of which differ pixel-for-pixel while the structure matches. Against
that floor, 4.6–6.1% means the port is structurally close to the prototype.

**It is not a gate and must never become one.** There is no threshold at which
"the app matches the prototype" is a pass/fail question while the two render
different data.

**Why it was worth taking now:** Step 8 performs ~815 token conversions. After
that, any deviation from the prototype that exists today becomes
**indistinguishable from one Step 8 caused**. This was the last moment the two
could be told apart cheaply, and the figure is now on record.

## Static token-equivalence — coverage of the 467

`scripts/check-token-equivalence.mjs`. Asserts that a proposed
`'<literal>' → var(--token)` substitution matches the token's **declared value in
the manifest**. No browser. For anything it passes, the computed value the browser
resolves is character-for-character what it resolved before — **a proof, not a
test**.

| Bucket | Count | % |
|---|---:|---:|
| exact match — one literal, one token, right family | 9 | 1.9% |
| decomposable — shorthand, every part matched, right family | 95 | 20.3% |
| already tokenised — only zeros/keywords/`var()` remain | 10 | 2.1% |
| **TRANCHE 1 — statically provable** | **114** | **24.4%** |
| value-only match — **wrong token family** | 76 | 16.3% |
| unknown property | 23 | 4.9% |
| unmatched — no token has this value | 254 | 54.4% |

**The exact-match tranche the runbook assumed is nearly absent.** Only 9 warnings
are a bare literal with a right-family token. Tranche 1 is dominated by
*shorthands* — `1px solid var(--border-subtle)` (41×) → `--border-width`. So the
467 are largely **already-tokenised shorthands tripping on a stray `1px`**, not
raw values awaiting conversion.

**Value preservation is necessary and not sufficient, and the check enforces
both.** `padding: '14px 16px'` value-matches `--fs-body-md`/`--fs-body-lg` —
**font-size tokens on a padding property**. Pixel-identical and wrong to write,
and it breaks the moment the type scale moves independently of spacing. Without
the family check tranche 1 reads 213 (45.6%); with it, **114**. The 76
"value-only" rows are safe to render and need a human to choose the token.

**What it cannot cover:** the 254 unmatched, blocked by values no token has —
`10px` (31×), `#fff` (24×), `11px` (22×), `#f0f2f5` (19×), `12.5px`, `10.5px`,
`11.5px`, `#dde3e9`. Those are prototype constants and need the pixel gate.

## Step 8 tranche 1 — converted 2026-08-26

**103 substitutions across 20 files. Values ceiling 467 → 363.**

Every one was proved value-preserving *and* family-appropriate by
`scripts/check-token-equivalence.mjs` before being written. Dominated by
`'1px solid var(--border-subtle)'` → `'var(--border-width) solid …'` — declarations
already 90% tokenised that tripped on a stray `1px`.

### The bucket arithmetic, reconciled

An earlier summary presented 114 + 76 + 254 = 444 against 467, leaving 23
unexplained. **There is no remainder.** The 23 are the `unknown property` bucket,
omitted from that sum. Verified independently:

```
total raw-value warnings           : 467
  property determinable on the line: 412
  NO property on the line          :  55
      every part matched           :  23   -> bucket "unknown property"
      a part unmatched             :  32   -> bucket "unmatched"
```

**What the 23 actually are:** literals inside **ternary branches** (39 of the 55)
and JSX props (16), where the CSS property sits before the `?` and the
same-line regex cannot see it — `boxShadow: isActive ? 'inset 0 -2px …' : …`.
They are convertible in principle; a real AST walk would recover the property.
Held back deliberately rather than guessed at.

### The rehearsal found two defects — which is what it was for

1. **The codemod double-applied.** One literal can raise TWO warnings — `'1px
   dashed #DCE1E6'` trips both `Raw px` and `Raw hex` — and both point at the
   **same node**. Applying both produced
   `'…var(--neutral-200)' dashed var(--neutral-200)'` and broke the parse.
   Caught by `tsc`, reverted, fixed by keying edits on the node range. **Had this
   run unattended over 350 conversions it would have corrupted dozens of files.**
2. **`#fff` is not matched to `--neutral-0`.** The equivalence check compares
   hex strings exactly, so 3-digit hex never matches the manifest's 6-digit form.
   **24 warnings are convertible today and are being reported as unmatched.**
   That is a defect in the tool, not a gap in the design system.

### The end-to-end confirmation, and why it matters

| Check | Result |
|---|---|
| `tsc --noEmit` | exit 0 |
| values ceiling | **467 → 363**, ratcheted automatically |
| numeric / imports | 348 / 0 — unchanged |
| **JS bundle hash** | **CHANGED** `index-BDNeyRad` → `index-CAOysY3E` (403.94 → 405.38 kB) |
| **pixel gate** | **10 screens, pixel-identical** |
| **app-vs-prototype delta** | **unchanged to the pixel** — 70536 / 66147 / 52926 / 54969 |

**This is the case that justifies the whole gate design.** The bundle hash changed
— `var(--space-3)` is longer than `12px` — while the render did not move by one
pixel. Step 6's acceptance rested on identical hashes; **that evidence is
unavailable for Step 8 by construction**, and only a pixel comparison can settle
it. The first real batch demonstrated exactly that.

The delta re-measurement is the stronger of the two. The seed is fixed, so a
value-preserving conversion must leave the app-vs-prototype relationship
**byte-identical** — and all four screens returned the same pixel counts to the
digit. A changed delta after a value-preserving conversion would mean something
went wrong that a per-screen self-comparison could miss.

## The remaining 353 — analysis, not a recommendation

**No conversion is proposed here.** This is a decision for the designer and the
architect, because **the design system is a byte-copy with a drift gate: adding a
token is not an edit this project can make.**

| Bucket | Count |
|---|---:|
| unmatched — no token has the value | 254 |
| value-only — token exists, **wrong family** | 76 |
| unknown property — ternary/JSX context | 23 |
| **total** | **353** |

### Category A — values that cluster, and probably should be tokens

| Value | Uses | Note |
|---|---:|---|
| `#fff` | 24 | **already a token** (`--neutral-0`); blocked only by the tool's hex-normalisation defect |
| `2px` | 14 | a second border width; `--border-width` is 1px |
| `#7c5cdb14`, `#2a6fdb14`, … | ~15 | **token colours at 8% alpha** — the base hues ARE tokens; the tint is not |
| `3px`, `5px`, `7px` | 14 | off-grid spacing near `--space-1` (4px) / `--space-2` (8px) |

**The alpha cluster is the most systemic.** Every one is an existing token with
an alpha suffix, so the design system already owns the hue and not the tint. That
is a missing *layer*, not missing values.

### Category B — prototype constants

| Value | Uses |
|---|---:|
| `12.5px`, `10.5px`, `13.5px`, `11.5px` | **42** |
| `10px`, `11px`, `9px` | **63** |
| `#f0f2f5`, `#f6f8fa`, `#f4e2c0`, `#dde3e9` | **36** |

Half-pixel type sizes and off-scale greys with no systemic meaning — the values
`steps-for-new-repo.md` Step 8 already names as prototype constants.

### Category C — genuinely arbitrary

The long tail below the top blockers. Individually one- or two-use values that
fit no scale and repeat nowhere.

### The options, and their cost

| Option | Cost | Consequence |
|---|---|---|
| **App-owned `--proto-*` layer** | ~1 day | Values become named and greppable; the ceiling can fall to near zero. **But they are NOT design-system tokens** and must never be mistaken for them — a second vocabulary to maintain |
| **Upstream request** | weeks, external dependency | The only option that makes them real tokens. Needs a design-system owner and a release; unknown whether that channel exists |
| **Accept permanently** | zero | **The values ceiling stops at roughly 353 forever.** Honest, and it means the ratchet stops being a burn-down and becomes a fixed regression guard |

**No single recommendation, because the evidence does not support one.** Category
A's alpha cluster argues for upstream; Category B argues for `--proto-*` or
acceptance; and whether the upstream channel exists at all is unknown here.
**This is the point where the design system either grows or the ceiling stops,
and that is not this project's call.**

### On the 76 wrong-family — converting them would be worse than leaving them

**Recommend they stay literal** unless a correct-family token exists.

`padding: '14px 16px'` value-matches `--fs-body-md` / `--fs-body-lg`. Substituting
those is **false tokenisation**: it looks compliant, it renders identically today,
and it **breaks the moment the type scale moves independently of spacing** — which
is the entire reason the two scales are separate. It is also *harder to find* than
the literal was, because it now reads as intentional.

A literal is honest about being unresolved. A wrong-family token is not.

**[PLACEHOLDER — decide the fate of the remaining 353.** Options and costs above.
**Trigger:** before any further Step 8 tranche. **Owner:** designer + architect
jointly — one owns whether the design system grows, the other owns whether the
app carries a `--proto-*` layer.]**

**[PLACEHOLDER — two defects in `check-token-equivalence.mjs`.** (1) 3-digit hex
is not normalised, hiding ~24 convertible warnings. (2) The property is read by a
same-line regex, so 55 literals in ternary/JSX position are unclassifiable — an
AST walk would recover them. Both understate tranche 1. **Trigger:** before
tranche 2. **Owner:** Frontend Lead.]**

## The app-vs-prototype delta — a measurement, not a verdict

**Mean 5.31% across four paired screens**, captured 2026-08-26 with
`scripts/measure-prototype-delta.mjs`.

| Screen | Differing px | % of frame |
|---|---:|---:|
| dashboard | 70,536 | 6.12% |
| issues list | 66,147 | 5.74% |
| workspace detail | 52,926 | 4.59% |
| create issue | 54,969 | 4.77% |

### ⚠️ 2026-08-26 — WHAT THE 5.31% FIGURE IS, NOW THAT THE PROTOTYPE IT MEASURED IS SUPERSEDED

`measure-prototype-delta.mjs` — like `fidelity-gate.mjs` and
`fidelity-capture.mjs` — reads
`…/pqms-bundled-page-2026-08-16/PQMS_SE.html`, **dated 2026-08-11 and two design
generations behind** the canonical prototype now named in `00-core-rules.md`.
That changes what the number above supports, and the change is precise rather
than fatal. **Two claims were being made with one figure. Only one of them
survives.**

#### ✅ STILL VALID — it is a regression signal, and a good one

**"Unchanged to the digit across 274 token conversions" still holds and still
means what it meant.** The claim is a *difference between two runs*, and both
runs used the **same baseline**. A stale baseline is still a fixed baseline:

- 70,536 / 66,147 / 52,926 / 54,969 before the conversions,
- the same four integers after.

Whatever `PQMS_SE.html` is, the app's rendered distance from it **did not move by
one pixel** across 274 conversions. That is exactly the property the measurement
was taken for — *did this refactor change anything?* — and it is unaffected by
which artefact sits on the other side. **Nothing about the token work needs
re-verifying.**

#### ❌ NO LONGER SUPPORTED — it is not a fidelity measurement

**"4.6–6.1% means the port is structurally close to the prototype" is withdrawn.**
It measures distance from the **wrong artefact**, and the differences between the
two artefacts are structural, not incidental:

| | `PQMS_SE.html` (measured) | Canonical (not measured) |
|---|---|---|
| Sixth KPI tile | "Resolved", green | **"Closed"**, dark grey |
| KPI tiles | static read-outs | **status filters**, with a selection border |
| Relationship column | **present**, default-visible, with a cell | **removed** |
| KPI icons | `triangle-alert` / `flame` | `workflow` / `focus` |
| Issue list rows | flat | **grouped** — Parent rows with nested children |

**The app matches the canonical file on three of those five.** So part of the
5.31% is the app being *correct* — penalised for implementing the current design
against a picture of an older one. The number is therefore **not a lower bound,
not an upper bound, and not comparable to any future measurement taken against
the canonical file.**

#### The distinction, stated once so it is not lost

> **A regression signal needs a *fixed* baseline. A fidelity measurement needs a
> *correct* one.** The same figure can be the first and not the second, and this
> one is. They are different claims and only one is supported.

#### How to quote it until the harness is repointed

- ✅ *"app-vs-`PQMS_SE.html`, unchanged across 274 conversions"* — correct, useful,
  and the reason the token work is trustworthy.
- ❌ *"the port is 94.7% faithful to the UX prototype"* — **not supported by any
  measurement this project has taken.** No app-vs-canonical figure exists.

**[PLACEHOLDER — an app-vs-canonical fidelity number does not exist.** It requires
repointing the harness, which is the open item recorded below: the canonical
`.dc.html` resolves `support.js` / `lucide-local.js` / `_ds/` by relative path and
cannot be loaded as a `file://` URL, so it needs the static-server capture shape
`dc-compare.mjs` already uses. **Owner:** Frontend Lead. **Trigger:** the next
time a *fidelity* claim — as opposed to a regression claim — is made.]**


**Method:** both halves in ONE browser context — same viewport (1280×900), same
`timezoneId`, same browser build, back to back. The previous harness captured
`dc-*` from the **dev server** and `app-*` from **`vite preview`** on different
days, so the two families were never mutually comparable and this number had
never been computed.

**This is a measurement, NOT a verdict, and it must never become a gate.**

**The data-versus-layout split is INFERRED AND UNMEASURED.** The app renders its
own deterministic seed while the prototype renders its own sample rows — different
IDs, titles and dates — so some share of every figure is text differing
pixel-for-pixel while the structure matches. **How large that share is has not
been measured**, so "4.59% means the workspace is 95% faithful" is not a claim
this number supports.

**Its value is as a BEFORE number.** The seed is frozen, so re-running it after a
value-preserving conversion must return **the same figures**. It already has: the
tranche-1 batch left all four counts identical to the digit.

**A changed delta after a value-preserving conversion means something went
wrong** — and it is a stronger end-to-end check than any per-screen
self-comparison, because it compares against an artefact the conversion cannot
touch.

## Step 8 tranche 1b, and the numeric family — 2026-08-26

### Two tool defects fixed, 30 more conversions unlocked

Both were in `check-token-equivalence.mjs`; neither was a design-system gap.

1. **3-digit hex was never normalised**, so `#fff` never matched the manifest's
   `#FFFFFF`. **24 warnings were reported as unmatched while being convertible.**
2. **The property was read by a same-line regex**, so 55 literals in ternary
   branches and JSX props were unclassifiable. Now resolved for the two
   unambiguous forms — direct assignment, and a *single* ternary with no
   intervening `{`/`}`/`;`/`,`. **Nested ternaries still return null**: the rule
   is convert what resolves unambiguously, never what has to be guessed.

Effect: exact 0 → 18, decomposable 0 → 12, unknown-property 23 → 15,
unmatched 254 → 230.

### Tranche 1b converted — values ceiling 363 → 333

30 substitutions. Same discipline, same result:

| Check | Result |
|---|---|
| `tsc --noEmit` | 0 |
| values ceiling | **363 → 333** |
| bundle hash | changed (`index-CAOysY3E` → `index-L81UZtc8`) |
| **pixel gate** | **10 screens, pixel-identical** |
| **prototype delta** | **unchanged to the digit** — 70536 / 66147 / 52926 / 54969 |

**Running total: 133 conversions, ceiling 467 → 333, every screen
pixel-identical, and the prototype delta never moved.**

### The numeric family — 348 warnings, analysed, NOT converted

This family had never been analysed. It is **far richer than the string family**,
and it reorders the rest of Step 8.

| Bucket | Count | % |
|---|---:|---:|
| **exact match, right family** | **141** | **40.5%** |
| wrong family | 77 | 22.1% |
| no exact token | 130 | 37.4% |
| property unresolved | 0 | 0.0% |

**40.5% exact, against roughly 5% for the strings.** The reason is structural: a
bare number in a React style object **is** px, and these sit on the 4px grid in a
way the string shorthands never did.

Top conversions available:

| Uses | Conversion |
|---:|---|
| 33 | `gap: 8` → `--space-2` |
| 23 | `gap: 12` → `--space-3` |
| 9 | `gap: 16` → `--space-4` |
| 6 | `gap: 4` → `--space-1` |
| 5 | `height: 40` → `--row-height-compact` |
| 5 | `height: 16` → `--icon-sm` |
| 4 | `height: 28` → `--control-sm` |

**One difference from the string family, and the pixel gate is what settles it.**
Converting `gap: 8` to `gap: 'var(--space-2)'` **changes the value's type from
number to string.** React accepts both — it appends `px` to a bare number and
passes a string through — so the rendered result should be identical. **That is a
real change and an assumption, not a proof**, which is exactly the case the pixel
gate exists for. The static equivalence check cannot see it, because it compares
values and not types.

**No conversion performed.** Reported first, as instructed, because the hit rate
reorders the work: **141 provable conversions here versus 40 remaining in the
string family.**

**[PLACEHOLDER — convert the numeric family.** 141 exact matches available. The
77 wrong-family cases get the same treatment as the strings — leave them literal
(23 of them are `6px` on `gap`, which has no `--space-` token at 6px). The 130
unmatched cluster on `10px` (30), `7px` (16), `9px` (13), `2px` (11) and belong in
the same decision packet as the string residue. **Trigger:** after the design-token
decision returns, since the two residues overlap. **Owner:** Frontend Lead.]**

## Numeric tranche converted, and the test framework adopted — 2026-08-26

### Numeric exact-match tranche — ceiling 348 → 207

**141 conversions.** `gap: 8` → `var(--space-2)` (33×), `gap: 12` →
`var(--space-3)` (23×), `height: 40` → `var(--row-height-compact)` (5×).

| Check | Result |
|---|---|
| `tsc --noEmit` | 0 |
| numeric ceiling | **348 → 207** |
| values ceiling | 333, untouched |
| pixel gate | **10 screens, pixel-identical** |
| prototype delta | **unchanged to the digit** |

**Running total: 274 conversions. values 467 → 333, numeric 348 → 207.** Every
batch pixel-identical; the prototype delta has never moved.

### The unitless-property guard, and why it exists

React appends `px` to a bare number for most style properties **but not for its
unitless list** — `lineHeight`, `fontWeight`, `opacity`, `zIndex`, `flex`,
`flexGrow`, `order`, `columnCount`, `strokeWidth` and the rest. For those,
`lineHeight: 20` renders as `line-height: 20` — **twenty times the font size, not
twenty pixels.** Converting one to `var(--space-5)` would substitute a length for
a multiplier and change the render dramatically.

**The current adherence selector contains none of them, so this is not a live
bug.** It is encoded as an explicit exclusion list in the codemod, with the
reason, so that **widening the selector later cannot silently introduce one**. It
**fails loudly** rather than skipping: a silent skip would let someone widen the
selector, see no conversions, and conclude there was nothing to convert.

Verified by positive control: marking `gap` unitless makes the codemod abort with
155 named occurrences and exit 1.

### On the number → string change

Converting `gap: 8` to `gap: 'var(--space-2)'` changes the value's **type**.
React accepts both, so the render should be identical — **but that is an
assumption, not a proof, and the static equivalence check cannot see it** because
it compares values, not types.

Two things settle it: **the pixel gate**, which confirmed all ten screens
unchanged; and **`tsc --noEmit`**, which would catch any site where a style value
is read back and used arithmetically. Both passed.

## Test framework adopted — first slice, 2026-08-26

**Vitest + React Testing Library per 10-testing-standards.md.** This closes the
only row in 00's divergence table dispositioned *repo is behind* with no
counter-argument.

**47 tests, all passing, 3 files.** Characterisation tests, not specification
tests: they pin CURRENT behaviour so a later phase can prove it did not change
them — the store's equivalent of what the pixel gate does for rendering.

### Coverage, measured — and the proposed floor

Over `apps/portal/src/data/**`:

| Metric | Measured |
|---|---:|
| Statements | **76.83%** (408/531) |
| Branches | **85.38%** (111/130) |
| Functions | **90.90%** (20/22) |
| Lines | **76.83%** (408/531) |

**Proposed starting ratchet floor: 75 / 84 / 90 / 75** — the measured values
rounded down, so the gate is green on the day it is switched on and can only move
upward.

**NO THRESHOLD IS SET YET, deliberately.** A gate at 0% enforces nothing, and
10's 90/90/90/80 describes a repository that already has tests. The order is
adopt → write → measure → set the floor at the measurement. That is the ratchet
principle applied honestly rather than aspirationally, and it is the same
discipline the adherence ceilings already use.

### What is pinned

The three domain rules `steps-for-new-repo.md` Step 10 says must survive any
rewrite, all previously untested:

- **Links are reciprocal** — both sides written on link and unlink, no duplicates
  on a repeat link.
- **Propose → approve** — a proposal parks the target in side fields and does
  **not** move the visible status; approve moves it and clears the fields;
  reject clears without moving; a terminal status stamps `closedAt`.
- **Every mutation appends an audit entry** — asserted per mutation, plus the
  actor name and role on the entry.

Plus the A/B/C thresholds at every boundary, the manual-override path, and the
pure helpers in `util.ts`.

**Positive control, per 15:** breaking reciprocity so only one side is written
fails exactly `INVARIANT 1 > linkIssue writes both sides` and nothing else.
Reverted; 47 pass.

### NOT wired into pre-push yet

The suite takes ~5 s wall-clock, most of it jsdom environment setup (the tests
themselves run in ~160 ms). 23's rule is that a hook slow enough to be resented
gets bypassed with `--no-verify`. **Left out of the hook until the startup cost is
addressed**, and recorded here rather than silently deferred.

### Two findings from writing the tests

**1. `addComment` appends NO audit entry.** Every other mutation calls
`appendAudit()`. `addComment` writes a comment row and, on an `@mention`, a
notification — and nothing else. **A user-visible change to an issue's
communication history leaves no audit trail.**

Step 10 says "a state change without an audit entry is a bug", and the
Communication tab is presented as immutable in the UI, which makes the omission
harder to defend. **Whether a comment counts as an auditable state change is a
DOMAIN question**, so it is pinned as current behaviour and recorded, not fixed —
fixing it in the same change would destroy the evidence of what the behaviour was.

**[PLACEHOLDER — should `addComment` append an audit entry?** Pinned as "does
not" in `tests/store.test.tsx`. **Trigger:** the Step 9 data-access slice.
**Owner:** architect, with the domain owner.]**

**2. `approveProposal` with no proposal outstanding is a silent no-op.** It falls
back to the current status rather than erroring. Pinned; whether it should throw
is an open question of the same kind.

### One stack constraint discovered

**Vitest 4 requires Vite 6+; this project is pinned to Vite 5.4**, so the suite
runs on **Vitest 2**. A concrete instance of 00's divergence table having
consequences beyond documentation: the corpus specifies Vite 7+, and the actual
version bounds which test-framework major can be adopted. Recorded because it
will recur with every dev-dependency added.

## Step 7 row 4 — `config/` extraction is now UNBLOCKED

The placeholder was triggered on the fidelity harness being repaired. **It is
repaired and produces a real verdict**, so the blocker is cleared.

**Not done, and it should wait behind the test framework.** It is a content
change — moving `JOBS`, `KPIS`, `SOURCES`, `AUDIT`, `CLASS_TREE`, `CLASS_COUNTS`,
`MODULE_TINT`, `FREQ_OPTS` out of `AdminScreen.tsx`, and `PAGE_SIZES` /
`DEFAULT_COLS` out of `IssueListScreen.tsx`.

**The open design question stands and should be answered before the extraction,
not during it:** much of that data is **prototype-shaped display data**, not
configuration. `JOBS`, `SOURCES`, `AUDIT` and `CLASS_TREE` are sample rows the
prototype displays — closer in kind to `data/seed.ts` than to
`config/issue-columns.config.ts`. Splitting on the wrong axis produces a `config/`
folder that is really a second seed file. `PAGE_SIZES`, `DEFAULT_COLS` and
`MODULE_TINT` are unambiguously configuration; the rest needs a decision.

## Coverage floors set, and the denominator pinned — 2026-08-26

**Floors seeded at the MEASURED values, not a round number below them:**

| Metric | Floor |
|---|---:|
| statements | **76.83%** |
| branches | **85.38%** |
| functions | **90.90%** |
| lines | **76.83%** |

Seeding at 75 would have donated 1.83 points of future regression for nothing.
The ratchet exists so the floor can sit flush against the actual.

**Managed by `scripts/coverage-gate.mjs`, the same mechanism as the adherence
ceilings** — a committed number, automatic when it rises, a tracked hand-edit
when it falls. 15's rule is not suspended for coverage; 10 records the prior
repository's split floors drifting down for months to 79.82% functions under a
static threshold. Both directions tested: forcing the floor to 90 exits 1;
lowering it to 50 ratchets back to 76.83 and rewrites the file.

### ⚠️ THE DENOMINATOR IS THE DATA LAYER ONLY

`vitest.config.ts` includes **`apps/portal/src/data/**` and nothing else** — 8
files, 531 statements. Outside the measurement:

- `apps/portal/src/{app,features}/**` — **11** screen and shell components
- `packages/ui-library/src/**` — **30** components
- `packages/design-tokens/src/**` — generated and byte-copied

**So 76.83% is a data-layer figure, not a project figure.** Measured across the
whole app it would be a small fraction of that, because 41 untested component
files would enter the denominator.

**Widening the glob WILL fail the gate, and that is not the fault of whoever
widens it.** The scope, the consequence and the remedy — re-measure and re-seed
in the same change — are recorded in `vitest.config.ts` next to the glob, so the
person who hits it finds the explanation where they are looking.

The scope is `data/**` because that is where the invariants live that Step 10
says must survive any rewrite. Component coverage is a later slice.

### Wired into pre-push — and the hook is now at the limit

**Measured end to end: 89 s for the whole hook.** That is **already past** the
~80 s suite 23's bypass rule was written against.

Recorded rather than smoothed over, because the number is the point of that rule:

| | |
|---|---|
| typecheck + 3 ratchets + selftest | ~40 s |
| `vitest run --coverage` | ~16 s |
| **measured individually** | **~56 s** |
| **actual hook wall-clock** | **89 s** |

**The gap is per-check process startup** — every line spawns `npx`/`pnpm` afresh,
roughly a third of the total. **Measuring checks individually understates the
hook by about 50%**, which is worth knowing before adding anything else to it.

**The first thing to move out if this grows again** is the coverage run: plain
`vitest run` is ~13 s, and the ratchet could live in `build`/CI. Not taken now
because the ratchet is new and its value is being somewhere people cannot skip.

**A correction to an earlier note in this file:** the suite was recorded as
"~5 s". That was Vitest's self-reported Duration, which excludes process startup.
Real wall-clock is ~13 s plain, ~16 s instrumented.

## Application defects consolidated — 2026-08-26

Four defects were scattered across this register, which is mostly about
documentation and tooling status. **That is where defects go to be forgotten.**

They are now in **`PQMS_docs/APPLICATION-DEFECTS.md`** — self-contained, with
reproduction steps and owners:

| # | Defect | Owner | Fix proposed? |
|---|---|---|---|
| D-1 | dates shift a day by timezone (`util.ts`) | Frontend Lead | **yes** |
| D-2 | `addComment` writes no audit entry | architect + domain | no — domain question |
| D-3 | `approveProposal` no-ops silently | architect + domain | no — domain question |
| D-4 | `/admin` has no route guard | architect | no — blocked on the auth model |

**The rule that governs all four:** fixing any of them changes rendered or stored
behaviour, so each belongs in its **own change with its own verification** —
never folded into a conformance slice or a token batch. The token work depends on
the pixel gate staying at threshold zero, and a legitimate behavioural fix would
be indistinguishable from a conversion that broke something.

**Two are pinned by tests asserting the CURRENT, defective behaviour.** Those
tests are expected to fail when the defect is fixed; that failure is the signal,
and the expectations move in the same change.

## Screen tests, the a11y sweep, and D-5 — 2026-08-26

**105 tests across 7 files.** Coverage denominator widened twice in this session;
each widening re-seeded the floors, per 15's ratchet-denominator rule.

| Stage | Denominator | Statements | Branches | Functions |
|---|---|---:|---:|---:|
| data layer only | 8 files | 76.83% | 85.38% | 90.90% |
| + IssueListScreen | 9 files | 82.45% | 69.46% | 51.19% |
| **+ 2 screens + all of ui-library** | **~50 files** | **76.35%** | **58.42%** | **42.92%** |

**Falling numbers here are scope growth, not regression** — the denominator went
from 531 statements to 3,992. Each re-seed was visible because the widening was
the change.

**Still a floor over a subset.** Outside it: `apps/portal/src/app/**`,
`features/{admin,dashboard,notifications}/**`, and `packages/design-tokens`.
The end goal is all of `apps/portal/src` and `packages/ui-library/src`.

### What the screen tests pinned

**IssueWorkspaceScreen (8 tests)** — the propose→approve flow through the UI,
previously pinned only at the store layer. The store tests prove the reducer is
right; they say nothing about whether the screen wires it correctly or **who can
see the approval affordance**. Now pinned: an SE sees "Change status" and does
**not** see Approve/Reject; override roles do; the affordance disables once a
proposal exists.

Also pinned: **tab state is local, not routed** — 07 records this as a deliberate
divergence, so if the tabs ever become routes the test says what changed rather
than the change being invisible.

**CreateIssueScreen (7 tests)** — the other draft/commit form. Typing does not
touch the store; Clear discards; model code gates the dependent selects; the
seven-source chip vocabulary is pinned as a set, because adding or renaming one
is a domain change.

### The accessibility sweep — 31 of 32 components, one test file

10 specifies axe in the test run. The obvious reading is a test per component;
that is 30 places to forget, and the one forgotten is the component added last.
**The sweep enumerates the barrel instead**, so a component added tomorrow is
checked tomorrow with no test written for it.

**Result: 31/32 rendered and checked, ZERO violations.** The one skip is
`SourceBadge`, which needs more than minimal props — recorded by the sweep itself
rather than silently passed, because a sweep that quietly skips components reads
as full coverage.

**What it cannot see, stated so the number is not over-read:** each component is
rendered in ONE default state. A violation that appears only when a menu opens, a
row is selected, or an error state renders is out of reach. It is a floor, not a
guarantee.

**Positive control, per 15:** removing `aria-label` from `IconButton` fails the
sweep naming that component and the `button-name` rule. Reverted; 34 pass.

**Compatibility checked before use:** `vitest-axe@0.1.0` peers `vitest >=0.16.0`,
so it runs on the Vitest 2 this project is pinned to. **This one is NOT another
instance of the Vite 5 ceiling** — worth stating, because the previous
test-tooling choice was.

### D-5 recorded

The pagination-reset defect is now `PQMS_docs/APPLICATION-DEFECTS.md` D-5, with a
proposed fix — it is unambiguous, unlike D-2 and D-3. **Three call sites already
reset the page and three do not**, which is what makes it read as intentional and
survive review. `pageClamped` masks it: the user lands on the wrong results
rather than an error, which is why it has never been reported.

**The characterisation test already exists to flip.** The fix becomes "invert two
assertions and state why" — reviewable in a way a behavioural fix with no prior
test never is.

## Step 11 / pass 4 — first screen description — 2026-08-26

**One screen of seven: the Issue List.** Written from the prototype per 29's ten
questions, then reconciled against the implementation and against
`component-specs/INVENTORY.md`.

New files: `PQMS_docs/screen-descriptions/issue-list.md`,
`PQMS_docs/component-specs/RECONCILIATION-issue-list.md`.

### The delta count — what pass 4 exists to produce

> **For the Issue List, pass 4 confirmed 9 components, added 2, could not confirm
> 2, and reshaped 1.** 64% confirmed in both existence and shape.

**How much to trust the remaining CANDIDATE rows:**

- **Existence is reliable** — 11 of 14 implied components have a row.
- **The misses are the predicted kind** — a KPI tile and a result-count band, both
  layout-adjacent and named by no requirement. `INVENTORY.md` predicted exactly
  this, which is evidence its method is sound where its output was incomplete.
- **Shape is the risk, and 1 in 14 is not small.**

**The confidence ratings do not predict correctness.** `LinkedCountCell` is rated
**Medium** and is the one that is wrong; `BaseAttentionBanner` is rated **High**
and could not be confirmed. **Rows should be rated by whether a PROTOTYPE reading
confirmed them, not by how firmly the BRD asserts them.**

Extrapolating from one screen — a weak base — predicts roughly **10–15 missed
components and 5–7 shape disagreements** across the app.

### The shape disagreement, which is a requirements question

`LinkedCountCell` is specified as *"count chip, or an em dash at zero; opens
ISM-LNK"* — **numeric**. The prototype shows **"Standalone"** with the tooltip
*"Standalone issue. Click to view history."* — **categorical**, whose zero-state
is a named state rather than a dash, and whose action is history rather than link
management.

**A build specifying the BRD's shape would produce a cell that cannot display
"Standalone".** Per `INVENTORY.md` this is a `00` case 4 — stop, do not pick.

**[PLACEHOLDER — is the Relationship cell a link count or a relationship
category?** **Owner:** architect with the domain owner. **Trigger:** before
`BaseDataTable`'s cell API is specified.]**

### Three implementation divergences found

| # | Prototype | App | Verdict |
|---|---|---|---|
| 1 | KPI "Resolved" | "Closed" | app is probably right — the *live* prototype says CLOSED; this export is stale |
| 2 | Relationship column visible | not in defaults | stale export; the live prototype agrees with the app |
| 3 | **"Showing 7 of 33 issues"** | **"Showing 7 of 7 issues"** | ⚠️ **app diverges, and it matters** |

**Divergence 3 is the substantive one.** The prototype counts the narrowed set
against the **unnarrowed total** — "there are 33 issues, you are seeing 7". The
app counts the scoped set against **itself**, which tells the user nothing. Under
00's source precedence the prototype governs copy, so the app is wrong. It is one
string with a real consequence: a user who has narrowed cannot tell whether they
are seeing everything.

**Related to but distinct from D-5.** Both concern the user's sense of position in
a result set; D-5 is the page index, this is the denominator. Both are one-line
changes in the same band and should be fixed together.

### Two findings about the METHOD, not the screen

**1. Naming the artefact read is load-bearing, not bookkeeping.** Two of the three
divergences dissolve once you know this was the *flattened 2026-08-16 export*
rather than the live `.dc.html`, which `FIDELITY-REPORT.md` round 4 already
recorded as disagreeing. A reader comparing against the export alone would file
two bugs that have already been decided. **29's question 1 earns its place.**

**2. The two-empty-states question is unanswerable from this prototype, and that
is the answer.** Neither empty state appears. They are not the same screen: a user
with no data needs orientation and a "New issue" action; a user whose filters
exclude everything needs recovery and a "Clear filters" action — and offering
"New issue" there is actively wrong. Recorded as UNSPECIFIED with an owner rather
than resolved by analogy.

---

## 2026-08-26 — the canonical prototype is settled, and pass 4's first screen was withdrawn and re-run

### What was wrong

The entry immediately above reasoned about *"the live `.dc.html`"* as though the
repository held one. **It holds nine distinct ISM candidates across four
directories**, two of them byte-identical duplicates of two others. The first
screen description named the 2026-08-11 flattened export; its "corrections"
against "the live file" were reasoning about a *third* file nobody had
identified.

### What is settled — full disposition in `00-core-rules.md`

> **`docs/ux-prototype/ism-qir-se-role/ISM + QIR SE Role - P_C.dc.html`**,
> md5 `8dca6a22f65b5dda7906a77945c12435`, Claude Design project Kia N-PQMS V4-V5,
> synced 2026-08-24.

**Established by content lineage, deliberately not by date** — this file is the
only candidate carrying `PRI_MATRIX`, `_resetPageState`, `_priorityInherited` and
`caretStyle()`, the delta against the previous sync is diffed hunk by hunk in
`issues/ism-v4-v5-gap-analysis.md`, and **the app already implements three of
those items**. This file's own rule against mtime inference (17's Prototype
register) is why none of that argument uses a modification date.

### The corrections to the entry above

| Above says | Canonical source |
|---|---|
| KPI "Resolved" — *"app is probably right"* | **App is right, and now proven.** Sixth tile is `closed` / "Closed". And the tiles are **status filters** (`_kpiSel`), which no reading had noticed |
| Relationship column — *"the live prototype agrees with the app"* | **True, for the wrong reason.** The column was **removed** in V4–V5: no header, no cell, and `colGroupDefault` omits it from the Columns chooser. `colRelationship` occurs 3× in the export and **1×** in the canonical — the state binding alone |
| "Showing 7 of 33" | **Unchanged, and now recorded as D-6** with the fix and the mechanism: there are **two** "Showing" strings with **different denominators**, and the app gets the footer right and the band wrong |

### Three findings that only a SOURCE read could produce

Recorded because each one a render would have hidden:

1. **The Issue List is a grouped table.** One top-level row per group, anchored
   on the Parent, others nested, filters matching at group level. The rule is
   stated in a source comment and appears in no pixel. **The app implements none
   of it.**
2. **The prototype is not single-role.** Three role-dependent subtitles on the
   list and a **seventh, role-gated tab** (`Sharing`, ASM/PQM) on the workspace —
   **unreachable in the rendered file**, because the prototype ships no role
   switch.
3. **`_loadCols()` restores column visibility from `sessionStorage`.** What a
   browser shows depends on that browser's history, which is why the first
   reading's "correction" about the Columns chooser was itself wrong.

**Rule, now in `00`:** structural questions are answered from the source, never
from a render.

### The consequence for the fidelity harness

**`fidelity-gate.mjs`, `measure-prototype-delta.mjs` and `fidelity-capture.mjs`
all point at `PQMS_SE.html`** — the 2026-08-11 export, two generations behind.
Every app-vs-prototype number they have produced is inflated by design changes
the app **correctly** implemented.

**Not repointed in the same change, and the reason is recorded in both scripts:**
the canonical file resolves `support.js` / `lucide-local.js` / `_ds/` by relative
path, so it cannot be loaded as a `file://` URL the way the flattened export can.
It needs a static server — the shape `dc-compare.mjs` already uses on `:8123` —
which is a capture-harness change, not a path edit.

**[PLACEHOLDER — repoint the fidelity harness at the canonical prototype.**
**Owner:** Frontend Lead. **Trigger:** the next time a fidelity number is quoted
in a decision. Until then those numbers are quoted as app-vs-`PQMS_SE.html`, and
both scripts say so at the top.]**

### Two escalations, both lifecycle contracts, both open

1. **The relationship model** — BRD `FR-LST-001` asserts a link-count column; the
   canonical prototype removed that column and expresses relationship as **row
   hierarchy**. It spans the Issue List (renders it) and Create Issue (creates
   the groups, and holds two rules the list does not express: a new issue can
   only ever be a **Child**, and a future-dated linked member **blocks
   registration**). `RECONCILIATION-issue-list.md`.
2. **The status vocabulary does not contain its own lifecycle's values.**
   `proposeDisposition` writes `pending` and `approveDisposition` writes
   `disposed`; the seven-value `STATUS` map contains **neither**, and
   `statusBits()` falls back to `STATUS.open` — so an issue awaiting approval
   **renders as "Open"** and is counted by **no KPI tile**. The app models this
   as a boolean flag instead, which may be the better design and is exactly why
   it must be decided rather than inherited. **This also unsettles the
   2026-08-23 directive**, which adopted the prototype's status vocabulary
   verbatim from the same file that writes outside it.
   `RECONCILIATION-workspace-and-create.md`.

### What pass 4 has established about `INVENTORY.md`, over three screens

**49 components implied, 42 confirmed (86%), 7 added, 4 not confirmed, 3 reshaped
into 2 questions.** Per screen: list 12/15, workspace 16/19, create 14/15.

- **Existence prediction is reliable and improves as screens get less
  structural** — 80% → 84% → 93%.
- **All seven misses are layout-adjacent and named by no requirement.** Seven for
  seven; this is now a rule rather than a hypothesis.
- **Both shape disagreements are lifecycle questions**, not component questions.
- **The confidence rating was retired**, on evidence: `LinkedCountCell` was
  Medium and its subject no longer exists; `BaseStepRail`, `BaseFileDropzone` and
  `CorrelationSuggestionCard` are all **High** and all unconfirmed; `BaseDrawer`
  was **Low** and was answered outright by one line of source. It is replaced by
  a `Confirmed` field with three states, populated **only** by a reconciliation.

### The reassessment of the remaining screens, with three screens of evidence

**Size does not predict value; owning a lifecycle contract does.** Create Issue is
a 15-component screen that produced **no new** question, because its rules belong
to a contract already open.

| Screen | Writes domain state? | Decision |
|---|---|---|
| **Admin** | **yes — scoring weights, aging thresholds, source on/off, a second approval workflow** | **full description** |
| Notifications | no — a read-marker map | component derivation |
| Dashboard / Overview | no — aggregation and navigation | component derivation |

**Admin is reclassified upward and it is not close.** It holds
`weights:{claimFreq:35, repairCost:30, claimsCount:20, detect:15}` — the inputs
to the severity score every other screen renders — `sources.fpqr:false`, meaning
Create Issue's seven channels are a **configured** set rather than a fixed one,
and `approveCr()`, which substitutes `ASM` when the acting role is `SE`.

---

## 2026-08-26 (later) — pass 4 complete, and two corrections to the entry above

### Two things the entry above got wrong

**1 · "The app models it as `pendingApproval?: boolean`" — wrong, and the truth is
stronger.** `pendingApproval?: boolean` is a field on **`ClassificationNode`**,
the taxonomy-proposal flag behind the *Pending Admin Approval* badge. It has
nothing to do with issue status, and nothing on `Issue` uses it. The app's actual
mechanism is `proposedStatus` / `proposalRationale` / `proposedBy`, cleared on
approve or reject — **which is `DEC-01`'s mitigation implemented exactly**, not
merely something adjacent to it. Recorded in
`DECISION-REQUEST-status-vocabulary.md`.

**2 · "`approveCr()` is on the Admin screen" — wrong.** It keys on `fid`, a
*finding* id, mutates `_mutFindings` and logs to `crLog[issueId]`. **It is the
Issue Workspace's Investigation tab.** Admin's own approval surface is the
taxonomy queue, a different mechanism. The consequence is worse than the
mislocation: **the Issue Workspace has two approval workflows with contradictory
rules**, and `screen-descriptions/issue-workspace.md` covered only one of them.

### The status contradiction is escalated, not resolved

**`PQMS_docs/DECISION-REQUEST-status-vocabulary.md`** — self-contained, to the
architect and the domain owner. It is the third decision document and, like the
others, **must not be resolved in the repository**.

It records a fourth authority nobody had cited: **the vendored design system's
own colour tokens carry an eight-status list of their own** — `--status-draft`,
`--status-pending`, `--status-disposed` among them, captioned *"The 8 canonical
N-PQMS workflow statuses"*. **It has colours for exactly the two values the
prototype writes and the prototype's own status map lacks**, and **no** colour
for two values the app does render (`topissue`, `outofscope`). So the open
placeholder in `06` asks the designer for hues for two `DEC-01` names this
application does not use — that placeholder cannot be actioned until the
vocabulary question is answered.

**Blast radius: `02`'s union, `17`'s table, `06`'s colour mapping and its hue
placeholder, `statusMap.ts`, every KPI tile that filters by status, and
`StatusChangeDialog` — which cannot be specified at all** while two lifecycle
values sit outside the vocabulary. `02` and `17` already disagree with the
shipped code today.

### Admin — the scope boundary runs through the middle of a screen

Reclassified from *component derivation* to *full description*, and it earned it.
`screen-descriptions/admin.md`.

**Checked directly, as the weights are inputs to a number every screen renders.
The result was not the expected one:** the app's weights do not *differ* from the
prototype's — **the app has no severity scoring at all.**
`apps/portal/src/data/types.ts` records it as out of scope, `autoScore` appears
nowhere, `IssueWorkspaceScreen.tsx` contains zero occurrences of "severity".

The prototype devotes a gated, audited, reset-able section to it: four weights
(`claimFreq 35 · repairCost 30 · claimsCount 20 · detect 15`) that **must total
exactly 100** before the save enables, with their own change history. The app
ships §1, §3, §4, §5 and §6 of that screen and simply **has no §2**.

**The finding is not "the weights are wrong". It is that a scope boundary runs
through the middle of a screen and nothing says so** — and it invalidates a
**High**-confidence `INVENTORY.md` row (`ScoreBreakdown`) that three earlier
screens left standing. **[UNSPECIFIED — is severity scoring in scope, and if not
does §2 render at all?** A 1:1 port and "no severity scoring" cannot both be true
of this screen. **Owner:** Frontend Lead, with the architect. **Trigger:** before
`ScoreBreakdown` or `BaseSeverityIndicator` is specified.]**

Two smaller Admin facts that reach other screens:

- **`sources.fpqr:false`.** Create Issue's seven channels are a **vocabulary**;
  the **available set** is whatever Admin last saved. The app already models the
  toggle (`sourceOn` seeds `fpqr:false`) but Create Issue does not read it. The
  pinned seven-source test therefore asserts the vocabulary correctly and the
  rendered set only accidentally — **it will fail, correctly, the day Create Issue
  honours the toggle**, and the note in the test says not to re-enable `fpqr` to
  make it pass.
- **The app adds an `ADMIN` role gate the prototype has no role for.** The
  prototype's `USERS` has SE / ASM / PQM and attributes every Admin action to
  *"M. Singh (Admin)"* — a person outside its own user model. That is a **fourth**
  role set (Vue's, the BRD's five, the prototype's three, the app's four) and it
  is the requirements half of **D-4** (`/admin` has no route guard).

### A second approval workflow, contradicting the first, on the same screen

| | Disposition approval | Field change-request approval |
|---|---|---|
| Who may approve | **ASM or PQM only** — an SE never sees the bar | **anyone, including an SE** — no gate |
| Recorded actor | the acting role | **`(role==='SE') ? 'ASM' : role`** |
| Reject | no comment required | **comment required** |
| Audit | one entry | **two** — `approved` by the actor, then `applied` by `'N-PQMS'`/`System` |

**When an SE approves a change request, the audit trail records Park Soo-jin
(ASM).** Fifty lines away the same file refuses to *show* an SE the disposition
approval bar. **Both cannot be the intended rule**, and an audit entry naming
someone other than the actor is a compliance question in a system feeding TSBs
and safety campaigns. The charitable reading — demo scaffolding for a
single-role prototype — is plausible and does not settle it; distinguishing
scaffolding from specification is exactly what `00` case 2 says the prototype
cannot do for us. **[UNSPECIFIED — owner: architect with the domain owner.
Trigger: before the Investigation tab's change-request surface is specified.]**
**Not filed as an application defect** — the app implements neither the flow nor
the substitution.

### Pass 4's final numbers, six screens

| Screen | Implied | Confirmed | Added | Not confirmed | Reshaped |
|---|---:|---:|---:|---:|---:|
| Issue List | 15 | 12 (80%) | 3 | 1 | 2 *(one question)* |
| Issue Workspace | 19 | 16 (84%) | 3 | 0 | 1 |
| Create Issue | 15 | 14 (93%) | 1 | 3 | 0 |
| Admin | 15 | 12 (80%) | 3 | 1 | 0 |
| Notifications | 5 | 4 (80%) | 1 | 0 | 0 |
| Dashboard | 7 | 4 (57%) | 2 | 1 | 0 |
| **Total** | **76** | **62 (82%)** | **13** | **6** | **3 → 2 questions** |

- **All thirteen additions are layout-adjacent and named by no requirement.**
  Thirteen for thirteen — a law of this list, not a tendency.
- **Both shape disagreements came from lifecycle-owning screens.** Create Issue,
  Admin, Notifications and Dashboard produced none between them, despite two of
  them being large. **Size was the wrong predictor; owning a lifecycle contract
  was the right one** — and Admin, which owns configuration rather than
  lifecycle, produced no component reshape but **two requirements questions**,
  which a derivation would have missed.
- **Five distinct chip vocabularies** surfaced: issue status, severity tier,
  priority letter (A/B/C), urgency (Critical/High/Medium/**Routine**) and job
  status. Severity and urgency share three of four labels and are **different
  scales**. **Merging them is a domain error that looks like a refactor.**

`INVENTORY.md` now carries 82 rows, 63 with a `Confirmed` state. QIR is
deliberately unread — the app ships no QIR screens.
