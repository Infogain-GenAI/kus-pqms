# 00 — Core Rules
**Tier:** 0
**Status:** APPROVED — REVISION 13

## Purpose
Non-negotiable rules that apply to all React code generation in this
repository, regardless of feature or screen. This file is always loaded
before any Tier 1 or Tier 2 file. If anything in a Tier 1/2 file conflicts
with this file, this file wins. If two Tier 1/2 files conflict with each
other, stop and flag it to Yogesh — do not guess which one is correct.

## ⚠️ READ THIS FIRST — this corpus was authored for a different repository

**These standards were written for a React portal that does not exist yet, and
they are being reconciled against one that does.** Until every row of the table
below is dispositioned, **"Confirmed stack" below is not confirmed** — it is a
target inherited from another project.

That matters more here than anywhere else in the corpus, because this is Tier 0
and this file wins every tie. A stack list that is aspirational but *labelled*
confirmed will silently outrank the repository on every question it touches.
**This file already records that exact failure happening to its own `ES2020`
value**, where two Tier 1 files were right and Tier 0's stale value won.

### The divergence table

| Corpus asserts | Reality here | Disposition |
|---|---|---|
| React 19+, React Router v8, Vite 7+ | React **18.3**, `react-router-dom` **6.30**, Vite **5.4** | **architect decision required** — and see the measured consequence below |
| Tailwind CSS with a `@theme` block | **none** — inline style objects + CSS custom properties | **architect decision required** |
| Vitest + React Testing Library; coverage 90/90/90/80 | **adopted 2026-08-26 — but on Vitest 2, not 4**, because Vite 5.4 bounds it | **partly closed**; the version ceiling is the Vite row above |
| TanStack Query + Zustand | **no state library** — one React context over a seed array | **architect decision required** |
| Node 24 pinned via `.nvmrc` | no `.nvmrc`; Node 24.19.0 in use, unpinned | **repo is behind and will adopt** |
| Turborepo | **not used** — pnpm workspaces only | **architect decision required** |

**Why each disposition, stated so it can be argued with:**

- **React/Router/Vite versions — architect decision.** Not simply "behind":
  React Router v8 removes the `react-router-dom` package entirely, so this is a
  breaking migration against a codebase whose acceptance test is
  pixel-fidelity to a prototype. Whether to upgrade, and when, is a scheduling
  and risk judgement nobody has made.
- **Tailwind — architect decision.** The app styles with the design system's own
  CSS custom properties, which ADR-0003 establishes as the token *value* source.
  Adopting Tailwind means rewriting every component's styling with the fidelity
  captures as the only check — and that check is currently broken (see 18).
  There is a real argument on both sides and no decision on record.
- **Testing — repo is behind.** There is no argument for zero tests, and 10 and
  26 already own the target. The direction is settled; only sequencing is open.
- **State libraries — architect decision.** Already tracked as open decision 2
  in `../steps-for-new-repo.md`, owned by the architect, and blocked on a
  backend existing at all.
- **`.nvmrc` — repo is behind.** 15 requires an exact `major.minor.patch` pin;
  the running version already satisfies the intended floor. Adding it is
  mechanical.
- **Turborepo — architect decision.** One app and two packages may not justify
  it. Adopting or dropping it from the corpus is a deliberate choice, not an
  oversight to correct.

### The first MEASURED consequence — the Vite row is not abstract

**Vite 5.4 bounds this project to Vitest 2. Vitest 4 requires Vite 6+ and does not
run here** — verified, not inferred: installing it fails at startup with
`ERR_PACKAGE_PATH_NOT_EXPORTED` on `vite/module-runner`.

This is worth stating in the table's own evidence rather than a commit message,
because it converts the React/Router/Vite row from a question about *versions*
into a question with a **priced consequence**:

| | |
|---|---|
| **Staying on Vite 5.4** | the test framework is pinned **two majors behind**, and every future dev-dependency inherits the same ceiling |
| **Upgrading Vite** | unlocks the current Vitest major — and drags in the React 19 / Router v8 migration, since the corpus specifies them together |

**The architect deciding that row should see this.** It is the first case where
the divergence has cost something concrete rather than merely differing from a
document, and it will not be the last: **a version ceiling propagates to every
tool that depends on it.**

**And it means 10-testing-standards.md assumes a Vitest this project cannot
run.** Its guidance is not wrong, but anything in it that depends on Vitest 3+
behaviour — reporter options, the `coverage.thresholds` shape, workspace config
syntax — must be checked against v2 before being applied. The suite adopted on
2026-08-26 runs on **Vitest 2** for this reason, recorded in
18-project-context-and-implementation-status.md.

**The whole table is ONE open placeholder, not six.** Splitting it into separate
per-row placeholders is what produced the current state: each row looks small
on its own, and collectively they mean the corpus describes a different project.
See 18-project-context-and-implementation-status.md's register — **owner:
architect.**

**Rows dispositioned "architect decision required" are NOT settled by this
file's authority in the meantime.** Where such a row conflicts with the
repository, follow the repository, record the conflict, and do not resolve it by
citing Tier 0 — that is precisely what Tier 0 is currently wrong about.

## Path convention
**Every path in these standards is relative to the pnpm workspace root** —
the directory holding `pnpm-workspace.yaml`, `turbo.json` and
`tsconfig.base.json`. The three workspace packages are therefore always
written:
- `apps/portal`
- `packages/ui-library`
- `packages/design-tokens`

**CORRECTED 2026-08-25 — in this repository the workspace root is
`frontend/`**, one level below the git root. So `apps/portal/vite.config.ts`
resolves to `frontend/apps/portal/vite.config.ts` on disk.

An earlier revision said `pqms-portal/`. That was the *prior* repository's
directory name, carried forward without being re-derived — the same provenance
defect ADR-0002 records against this file's Prettier values. There is no
`pqms-portal/` directory anywhere in this repository.

Two further details of the real root, because the rule above names files that
do not all exist here: `frontend/` holds `pnpm-workspace.yaml` and
`tsconfig.base.json`, and **there is no `turbo.json`** — Turborepo is not used
(see the divergence table below). The three packages named above are real as of
the Phase 2 split: `apps/portal`, `packages/ui-library`, `packages/design-tokens`.
18-project-context-and-implementation-status.md records the structure.

**Two places where the git-root prefix must be written out, because the
tool reads from the git root and not from the workspace root:**
- GitHub Actions workflow files and every *action input* inside them —
  see 15-devsecops-and-ci-cd.md, which explains the trap (an action input
  is not affected by `working-directory`).
- `.github/dependabot.yml`'s `directory:` values.

**An earlier revision of this rule required the `pqms-portal/` prefix on
every path anywhere in the corpus, and it is withdrawn.** Two reasons, and
the second is the load-bearing one:

- It was never honoured. Three consecutive review rounds found unprefixed
  paths in at least 15 of the then-21 files — **including twice inside
  this file, the one that stated the rule.** A rule the file stating it
  cannot follow is not a rule; it is a source of findings.
- **It hard-codes this repository's layout into a document set intended to
  be used against others.** These standards are written to govern a
  React portal, not a directory. A consuming repository whose workspace
  root is its git root would have to strip a prefix from every path in
  the corpus to use it — and 30-restructuring-an-existing-react-project.md
  exists precisely for that case. Relative-to-workspace-root is portable;
  `pqms-portal/`-prefixed is not.

Where a path could be read as either, say which root it is relative to.
That is cheaper than a prefix nobody applies consistently.

## Confirmed stack (do not deviate without explicit sign-off)

> ⚠️ **Six entries in this list are not confirmed for this repository.** See the
> divergence table at the top of this file before treating any of the following
> as settled: the React/Router/Vite versions, Tailwind, the test stack, the state
> libraries, `.nvmrc`, and Turborepo. The rest of the list — icons, i18n library,
> auth protocol, the ESLint-flat-config-only rule, the Redux prohibition — is
> unaffected and stands.
- Monorepo tooling: Turborepo + pnpm
- Target framework: React 19+ (migrating from Vue 3 — migration in
  progress, not yet scaffolded as of this writing)
- Node: 24 (`.nvmrc`), package manager: pnpm
- Routing: React Router v8, which requires Node 22.22.0+ (`.nvmrc`
  pins 24, already clears this — floor correction only, no environment
  change needed; `pqms-portal/package.json`'s declared `engines.node` was
  below this floor and has been corrected to `>=22.22.0` to match),
  React 19.2.7+ (the specific patch floor v8 requires, within the
  React 19+ target already stated above), and Vite 7+ (repo is already
  on `^8.0.13` across root, `apps/portal`, and
  `packages/ui-library` — comfortably clears this, no change needed).
  **ESM-only**: React Router v8 "is now published as an ESM-only
  module" — that is a statement about **React Router's own published
  output**, so whatever bundles or imports it must consume ESM. An
  earlier revision of this file extended this to "no CommonJS output
  permitted anywhere in the dependency chain React Router v8 touches";
  that is broader than the source supports and is **withdrawn** — the
  upstream release notes say nothing about transitive CommonJS
  dependencies. Vite handles CJS deps elsewhere in the graph as it
  always has. `react-router-dom` no longer exists as a package in v8 —
  import `RouterProvider`/`HydratedRouter` from `react-router/dom`, and
  everything else from `react-router` directly.
  Also from the same release: v8 sets its tsconfig `target`/`lib` to
  **ES2022** "across the board". **`tsconfig.base.json` sets
  `target`/`lib` to `ES2022` directly** — not `ES2020` with a
  per-package override. See 02-typescript-standards.md's Baseline
  section, where this is the **second of four** changes from the
  Vue-era values, with the reasoning: React Router v8 targets ES2022,
  the verified Node 22.22.0+ and Vite 7+ floors both support it
  natively, and no package in this repository has a legacy consumer to
  downlevel for.

  **An earlier revision of this clause said the base config "stays
  `ES2020`" while the React app overrode it per package, and called
  this "the third of three" tsconfig changes. Both are withdrawn.** The
  ES2020 value was carried over from the Vue-era arrangement, where the
  base config was shared with Vue packages and could not move; there
  are no Vue packages here, so the constraint that produced it does not
  exist. The count was simply wrong — 02 lists four changes, and
  `target`/`lib` is the second.

  Recorded rather than corrected silently, because of how this one
  failed: 02 and 20 both stated ES2022-in-the-base correctly, and this
  file — Tier 0 — held the superseded value, so **the precedence rule
  below selected the wrong one**. A stale value in Tier 0 outranks
  every file that has it right.

  **Sourcing for the four floors above** (Node 22.22.0+, React 19.2.7+,
  Vite 7+, ESM-only): verified against React Router's own v8.0.0
  changelog (`reactrouter.com/changelog`) and the official v8 release
  post (`remix.run/blog/react-router-v8`), which state the baselines
  identically — "Node 22.22.0+, React 19.2.7+, Vite 7+" — and, for the
  package removal: "Removed `react-router-dom`. It was just a mirror of
  `react-router`… Use `react-router` and `react-router/dom` instead."
  The Vite floor is attributed there to the Vite Environment API that
  v8's build and pre-rendering pipeline now requires. These were
  previously uncited; they are load-bearing, because every floor here
  is a precondition of the router choice that
  08-authentication-and-authorization.md's middleware architecture is
  built on.
- Linting: ESLint flat config only (`eslint.config.js` at the workspace
  root) — never create or reference `.eslintrc.*`
- Testing: Vitest + React Testing Library for unit/component tests,
  Playwright for e2e — never Jest, never Cypress
- Styling: Tailwind CSS with design tokens wired into a `@theme` block —
  never CSS Modules, never raw hex/rgb values in component code
- i18n: react-i18next, co-located per-component files
  (`ComponentName.i18n.ts` next to `ComponentName.tsx`), built-in ICU
  pluralization — never hand-rolled singular/plural key pairs
- Auth: Azure AD OIDC+PKCE, capability-based RBAC — see rule below
- State management: TanStack Query for server/async state, Zustand for
  client/UI state — never Redux, never Redux Toolkit, never RTK Query
- **Icons: `lucide-react`.** One icon library, no second one, and no
  hand-drawn SVG where a Lucide icon exists. Provenance: the prototype
  uses Lucide via `data-lucide="..."` hundreds of times, and the prior Vue
  implementation used the direct equivalent (`@lucide/vue`). Recorded here
  rather than left implicit because the choice was originally made inside
  one component's build (`AppHeader`) and 18-project-context-and-
  implementation-status.md flagged it as needing a real owner — the next
  component to need an icon could as easily have reached for a different
  library and contradicted nothing written down. Sizes, semantic mappings
  and status mappings are 06-styling-and-design-tokens.md's, not this
  file's.
- **Dates and formatting:** `Intl` for formatting; the date-arithmetic
  library is an open decision recorded in
  21-logging-formatting-and-client-diagnostics.md. No component formats a
  date, number or unit inline.
- **Error monitoring:** a single client behind an interface, per
  25-observability-and-client-telemetry.md. The vendor is an open
  decision; the seam is not.

## RBAC rule
Never check `user.role === 'X'` anywhere in application code. Always
check a named permission — `hasPermission(permissions, action)`, or a
named boolean from `usePermissions()`. (An earlier revision of this
file specified this as `hasCapability`/`useCapability` against a
two-value `"read"`/`"override"` capability; that model is superseded —
see 08-authentication-and-authorization.md's "Permission model" for the
BRD-derived five-role, named-permission replacement.) Permission
resolution comes from the server (BRD FR-SEC-011's resolved-permissions
endpoint), consumed via `usePermissions()`/`hasPermission()` — see that
file for the full model and what the current call sites actually gate.

## Folder ownership
- `packages/ui-library`: framework-level, reusable components only. No
  feature-specific logic, no direct API calls, no state-management
  library usage inside base components.

  *(An earlier revision named Pinia here — a Vue-only library not in the
  confirmed stack — while 01-project-structure-and-architecture.md's
  parallel rule already read correctly. It was flagged in three
  consecutive review rounds and survived each one, in the Tier-0 file that
  wins all ties. Corrected.)*
- `packages/design-tokens`: token source of truth (colors, spacing,
  typography, etc.). No component logic.
- `apps/portal`: feature/screen implementation. Consumes
  `ui-library` and `design-tokens`, owns state, routing, API integration.

## Do-not list
- Never hardcode a color, copy string, or business value. Every visual
  value traces to a design token; every user-facing string traces to an
  i18n key. If no matching token/key exists, stop and ask — do not
  fabricate one.
- Never guess a value (color, endpoint, copy, config) when a source
  doesn't have an exact match. Say so explicitly and ask.
- Any change to a shared/global component (anything in `ui-library`)
  requires a blast-radius check — identify every consumer — before
  the change ships. This is a repeat-mistake area; a past layout fix
  broke an unrelated screen.
- Never commit, stage, or push. All git operations are performed by
  Yogesh manually.
- Never generate an implementation prompt or write to any doc without
  Yogesh's explicit go-ahead first.
- If the dev environment or build throws an error unrelated to the
  current task (missing package, port conflict, tool crash), treat it
  as its own diagnostic task. Do not assume it was caused by the
  current change without checking first.
- Never introduce Redux, Redux Toolkit, or RTK Query — confirmed stack
  is TanStack Query + Zustand.

## Precedence
1. This file (Tier 0) overrides any Tier 1 or Tier 2 file.
2. If two Tier 1 files conflict, do not resolve it silently — flag the
   conflict back to Yogesh.
3. The tier files under `standards/` are the **only** source of these
   standards. The concatenated distribution document **is generated**
   from them by `pqms-portal/scripts/build-standards-doc.mjs`, run as
   **`pnpm docs:standards`**, and written to
   `PQMS_docs/Frontend-Development-Standards-v1.0.md`. **That output is
   never hand-edited.** Edits go to the tier file that owns the rule,
   and the document is regenerated. **`pnpm docs:standards:check`**
   verifies the committed output matches the sources and exits non-zero
   if it does not, so this rule is enforceable rather than trusted.

   **The same script also computes a derived cross-reference appendix**
   — glossary-term usage, inbound-citation counts, `Base*`-mention
   counts — from every tier file, appended to the generated document only.
   This exists because those three facts were previously hand-maintained
   *inside* tier files (20's glossary, 18's self-description, 01's
   component-mention paragraph) and were wrong when checked: a fact
   about a set of files that change independently of it cannot be kept
   correct by hand. **A fact about the corpus that changes when any tier
   file changes belongs in the generated appendix, not in a tier
   file** — the same boundary this clause already draws between
   authored rules and generated output, applied one level down.
4. **`Frontend-Development-Standards-v1.0.md` is the generated output
   above — this is a filename reused deliberately, not a coincidence,
   and not the same document it used to be.** Until this revision, that
   exact filename held the pre-migration generic first draft these tier
   files replace — the document that contradicted the confirmed stack
   throughout (Redux Toolkit, Jest, Cypress, WCAG 2.1 AA) and carried a
   `SUPERSEDED` banner for exactly that reason. **That draft is deleted.**
   It was never in version control (`PQMS_docs/` isn't yet), so deletion
   was backed up to a session scratchpad and verified byte-for-byte
   first, then removed rather than left to accumulate as dead weight
   once its replacement existed under the same name.

   **State this plainly because the name is what makes it dangerous, not
   the content**: anyone who has a copy of this file cached, linked, or
   quoted from before this revision has the superseded Redux/Jest/
   Cypress/WCAG-2.1 draft — a document this corpus has spent several
   revisions correcting citations *away* from. The filename alone no
   longer disambiguates which one that is; only the date and the content
   do. **If it names Redux Toolkit, Jest, Cypress, or WCAG 2.1 AA
   anywhere, it is the old file, not this one, regardless of where it
   was found.** From this revision forward, this filename refers only to
   the generated, `docs:standards:check`-verified output — nothing else
   is ever written under it.

## Source precedence — which source governs what
The rule above resolves standards against standards. This one resolves
**sources against each other**, one level up. Building this app reads
three, and each is authoritative **only in its own domain**:

- **These standards govern code shape** — file placement, naming,
  typing, API conventions, testing, accessibility enforcement, styling
  mechanism. Nothing outside this corpus overrides them on those.
- **The prototype governs visual structure and user-facing copy** —
  what a screen contains, what it looks like, what the text says. See
  17-domain-glossary-and-business-context.md's Prototype register for
  which file, and which reading of it.
- **The BRD and HLD govern behaviour and requirements** — what the
  system must do, who may do it, which requirements are committed.
  BRD/NPQMS-ISM-customized-BRD.md (C1.0, draft for ratification) is the
  current source — see 17's and 18's entries on its draft status.
  **§7.2–§7.3** (cited in 08-authentication-and-authorization.md) and
  **FR-ENT-005/NFR-U-002** (cited in 11-accessibility-standards.md) are
  the worked examples already in the corpus. (This retires the prior
  citations to BRD v1.3's NFR-05/NFR-08, whose numbering does not carry
  over to C1.0.)

**The rule: each source wins in its own domain and loses outside it.**

**A collision is usually a category mistake** — one source being read
for something it does not govern. So the first question on any apparent
conflict is not "which wins" but "which of these actually governs this
kind of thing". That question resolves most of them, and the five cases
below are what it looks like when applied.

### 1. Prototype component names are labels, not code names
The prototype was produced in Claude Design, and its bundle carries a
design-system manifest naming components `Button`, `Select`,
`DataTable`, `Input`, `Tabs`, `Badge`. **Those are visual references.**
This codebase names them `BaseButton`, `BaseSelect`, `BaseDataTable`
and so on, per 06-styling-and-design-tokens.md — **naming is code
shape, so 06 governs.**

A component spec titled `BaseX.md` corresponds to the prototype's `X`.
That is a mapping, not a disagreement, and nothing needs reconciling.

### 2. The prototype shows less than a requirement demands — BRD governs
A select rendered with no keyboard affordance is not evidence that
keyboard support is out of scope. **BRD FR-ENT-005 commits to a
keyboard-navigable combobox** (retiring the prior citation to BRD
v1.3's NFR-08), and a committed requirement outranks a static picture.
**The prototype shows appearance, not an interaction contract** — it
has no way to express one.

Generalised: absence in the prototype is not a decision. It is the
absence of information about something the prototype does not govern.

### 3. A standard and the prototype disagree on a visual — prototype governs
A colour, a spacing value, a label. In every such case the standard is
either being misread or needs amending — and amending it is the normal
outcome, not an escalation.

06's rule that a hardcoded value must trace to a real source exists
precisely to make this checkable: a value with a cited source can be
compared against the prototype, and one without cannot be defended at
all.

### 4. When no source governs it — say so and decide deliberately
**This is the most common case and the one most likely to be answered
by invention.** Three sources between them do not cover everything a
working app has to settle.

When nothing governs a question: **say that nothing does, decide it
deliberately, and record the reasoning** — the same discipline these
standards use on themselves. A decision with its argument attached can
be revisited by someone who disagrees with the argument. A decision
stated flatly cannot be told apart from a fact.

**Do not fill the gap from any of the three by analogy.** Not from the
prototype ("it looks like this elsewhere, so probably here too"), not
from the BRD ("a similar requirement exists, so this must be implied"),
and not from these standards ("the convention for X presumably extends
to Y"). Each of those produces something that reads as sourced and is
not. This corpus has caught four such values — a permission call that
did not exist, a hex colour that was not the brand colour, a status
value not in the real set, a service namespace never implemented — and
every one of them was arrived at by exactly that move.

### 5. A prior citation's value disagrees with the current prototype — re-derive, don't trust the citation
A different failure mode from case 3. Case 3 is a standard asserting a
visual value that the prototype contradicts, fixed by reading the
current prototype and correcting the standard. This case is narrower
and easier to miss: a value that was **already** sourced and cited —
from an earlier revision of this corpus, from carried-forward code in
the prior Vue implementation (`kus-pqms`), or from this file's own
prior citations — can silently stop matching the **current** prototype
export, because the prototype is revised and regenerated (see
17-domain-glossary-and-business-context.md's "moving target" warning)
while the citation is not. A token's **name** can stay stable across
regenerations while its **value** drifts underneath it — the two are
independent facts, and both must be re-checked, not just one.

Two confirmed instances, found while building BaseButton:
- `--space-8` meant 8px in `kus-pqms`'s token file; the current
  prototype's own `--space-8` means 32px (both use Tailwind-style
  numeric spacing steps, but the two systems diverged between the Vue
  implementation and this prototype revision). Trusting the old value
  would have shipped spacing wrong by 4x.
- BaseButton's disabled-background token was cited as neutral-400
  (`#9AA5AE`) on the strength of a prior mapping; the current
  prototype's real computed disabled styles (`background:#EAEEF2` /
  `#EEF1F4` on disabled buttons) resolve to neutral-100, not
  neutral-400 — a different token entirely. The citation looked sourced
  and wasn't current.

**The rule**: before finalizing any design-token literal value,
re-derive it directly from the current prototype's actual embedded or
computed styles — never trust a prior citation's value, however
well-sourced it looked at the time, including citations from this
corpus's own earlier revisions or from the legacy Vue codebase. A
citation records where a value *was* confirmed, not that it still *is*
correct.

**Name and value are two separate checks.** A token name that matches
the prototype's own semantic vocabulary (`--hover-overlay`,
`--disabled-bg`) is not evidence its value is current, and a correct
value under an invented name is not evidence the naming is right
either — `--color-surface-hover` looked like plausible prototype
vocabulary and was not; the prototype's own name for that concept is
`--hover-overlay`. Verify both independently.

**If a value can't be directly verified against a real
current-prototype instance** — no matching element exists to check it
against — mark it explicitly as inferred/unverified rather than
presenting it with the same confidence as a directly-verified one. An
unmarked guess and a verified fact are indistinguishable to the next
reader unless the gap is stated.

## Corpus map — which file owns what

The tier files are not a reading list; they are a set of owners. Find the
owner, read that file, and do not look for the same rule twice. Tier 0
wins all ties; a Tier 1 file conflicting with another Tier 1 file is
escalated, never resolved silently.

| Concern | Owner |
|---|---|
| Non-negotiables, confirmed stack, source precedence | **00** (this file) |
| Where code lives, package boundaries, build sequencing | 01 |
| TypeScript configuration, `any`, domain unions, type placement | 02 |
| Hooks, callback props, composition, error boundaries, the Compiler | 03 |
| What is server state vs client state; store shapes | 04 |
| HTTP client, services, mappers, Zod, query configuration, fixtures data | 05 |
| Tailwind, design tokens, headless primitives, component naming | 06 |
| Router, layouts, the route tree, lazy loading | 07 |
| Auth protocol, token storage, permissions, route guards, fixtures auth | 08 |
| i18n library, per-component messages, pluralization | 09 |
| Test runner, coverage, placement, query priority, MSW, axe | 10 |
| WCAG target, per-component a11y, lint severities, focus management | 11 |
| Web Vitals, bundle budget, code splitting, memoization verification | 12 |
| CSP, XSS, environment variables, secrets, CSRF | 13 |
| ESLint composition, Prettier, exports, barrels, naming | 14 |
| CI workflows, coverage enforcement, Dependabot, Sonar, branch protection | 15 |
| The reviewer's checklist | 16 |
| Domain vocabulary, roles, screens, statuses, the prototype register | 17 |
| Open obligations, tracked decisions, implementation status | 18 |
| Local setup, dev workflow, troubleshooting | 19 |
| Technical glossary, commands, config snippets | 20 |
| Logging, log prohibitions, date/number/unit formatting | 21 |
| Error surfaces, toasts, screen states, error-code copy | 22 |
| Branching, commits, hooks, pull-request shape | 23 |
| Storybook authoring | 24 |
| Monitoring sink, telemetry, business-event instrumentation | 25 |
| Fixture data, test scope per layer, security and i18n tests | 26 |
| Forms, tables and overlays — review checks | 27 |
| Definition of Done | 28 |
| Screen-description authoring | 29 |
| **Restructuring an existing React project onto this corpus** | **30** |
| **Document classes, ADR format and lifecycle, generated documents** | **31** |
| **Operating inside the MoAI-ADK SPEC workflow; TRUST 5 reconciliation** | **32** |
| **The frontend's boundary in the polyglot monorepo; infra-owned requirements** | **33** |

Two entries are also the answer to "where do I write this down?":

- A per-component contract goes in `PQMS_docs/component-specs/`, never in
  a tier file. See 01 for placement and `component-specs/TEMPLATE.md` for
  contents.
- A per-screen description goes in `PQMS_docs/screen-descriptions/`. See
  29 for what one must answer.

## Using this corpus against a different repository

These standards were written for one React portal and are deliberately
portable to another. Three things a consuming repository must settle
before the rules resolve cleanly, all of them covered by
30-restructuring-an-existing-react-project.md:

1. **Where its workspace root is**, per the Path convention above.
2. **Which of the three sources exists for it** — these standards always
   apply; a prototype and a BRD may not. Where a source does not exist,
   Source precedence case 4 governs: say that nothing governs it, decide
   deliberately, and record the reasoning.
3. **What it already has that conflicts.** A repository with existing code
   is not a blank target, and 01's structure is written as a target to
   build to rather than a set of corrections. 30 owns the difference.

## The audited prior implementation — a fourth source, and its rank

`../analysis/vue-baseline-audit.md` is an audit of the shipped Vue portal's
**code**, read file by file on 2026-08-24. It exists because this corpus was
written from the BRD, the prototype and the prior repository's *written*
guidelines — never from what that team actually built. Where a guideline and an
implementation differ, the implementation is the better evidence about what this
domain costs.

**It ranks below all three existing sources and it is not a source of
authority at all.** It supplies evidence that a tier file may cite. Where it
disagrees with a tier file, **the tier file wins**, and the disagreement is a
reason to re-open the tier file — never a licence to follow the audit.

Three failure modes it is written to prevent, and which apply to reading it:

- **Copying a workaround for a problem that no longer exists.** The prior
  `tsconfig` disables two compiler flags for a reason that is specific to a
  template compiler this repository does not use. 14-code-style-and-linting.md
  turns both on.
- **Copying a model because you are copying a rule.** The prior capability
  indirection is exactly right and its two-level role model cannot express the
  BRD's matrix. 08-authentication-and-authorization.md separates them.
- **Copying a default that was defending something else.** Fixtures default on
  there and fail closed here, and both are correct in their own repository.
  05-api-integration-and-data-fetching.md explains why.

**Case 5 still governs values.** Nothing in the audit is a value to lift — token
literals, sizes, colours and thresholds are re-derived from the prototype, every
time, regardless of what the prior code contains.

## Where documents live

| Folder | Class | Rule |
|---|---|---|
| `standards/` | Standard | Hand-written, tiered, one owner per concern |
| `component-specs/` | Specification | Against `TEMPLATE.md` |
| `screen-descriptions/` | Specification | Against 29's ten questions |
| `decisions/` | Decision record | Numbered, dated, immutable once accepted |
| `analysis/` | Reference | Dated, method stated, **regenerated not patched** |
| `Frontend-Development-Standards-v1.0.md` | Reference | **Generated. Never hand-edited.** |

31-documentation-standards-and-decision-records.md owns all of it, including
what happens when a `[PLACEHOLDER]` closes: an ADR, a tier-file edit and a
register move, **in one commit or not at all**.

## The target repository — and eight corrections to the stack above

The corpus was written against a two-package pnpm workspace on GitHub. The
repository it will actually govern is the client's **`project-template-java`
polyglot monorepo**, and it differs in ways that invalidate specific rules
rather than merely re-scoping them.

```
project-template-java/
├─ backend/    Spring Boot 4.0.6 · Java 21 · Gradle 9.3.0
├─ frontend/   React 19 · React Router 8 · Vite 8 · pnpm 11   <- this corpus governs here
├─ infra/      AWS CDK 2.x (TypeScript)
├─ docs/       STACK.md · DEVELOPER_GUIDE.md · CI-ANALYSIS.md · TEST-REVIEW.md · conventions/
├─ .claude/    MoAI-ADK harness — agents, skills, rules, hooks
└─ .moai/      MoAI-ADK config and SPEC artifacts
```

**`docs/STACK.md` is the client's source of truth for versions.** Where it and
this file disagree about a version, **STACK.md wins** — it is verified against
the manifests and re-verified on every bump. This corpus governs *code shape*,
not the toolchain inventory.

### The eight corrections

| # | This corpus said | The target repository is | Consequence |
|---|---|---|---|
| 1 | GitHub Actions | **GitLab CI** + AWS CodeBuild | 15 is rewritten — see its GitLab section |
| 2 | Husky + lint-staged | **Lefthook** | 23's hook mechanics are replaced |
| 3 | TypeScript 6 | **TypeScript 5.9.3**, target ES2024 | 02's TS-7 placeholder is premature; `baseUrl`/`paths` are not deprecated here |
| 4 | `.npmrc` carries settings | **pnpm 11 reads non-auth settings from `pnpm-workspace.yaml`** | 14's `engine-strict` guidance moves file |
| 5 | Coverage 85/85/85/85 | **90/90/90 + branches 80** | a real conflict — 10 resolves it |
| 6 | Zustand + TanStack Query | **no state library at all today** | adopting them is a decision, not a restructure |
| 7 | GitHub branch protection | **GitLab protected branches, documented as intent and not enforced** | 15 cannot assume a gate exists |
| 8 | Ad-hoc development | **MoAI-ADK SPEC workflow** (`/moai plan → run → sync`) | new: 32 owns how this corpus operates inside it |

### Things the target repository already has, and this corpus should not re-specify

**MSW ^2.7.5 is already a dependency.** 10 and 26 specify it; it exists.
**React Router 8, React 19, Vite 8, Node 24.15.0, pnpm 11** all match. **The
`us-west-2` / `us-east-1` discrepancy between `TEAM-GUIDE.md` and `STACK.md`
is the client's to resolve** — it is not a frontend concern and this corpus
states no region.

### Two stale artifacts the restructure inherits

`STACK.md` §8 records both, and both are directly in this corpus's path:

- **`frontend/.storybook/` exists on disk; `storybook` is not a declared
  dependency.** 24-storybook-authoring.md assumes a working Storybook.
- **Lefthook invokes `prettier --write`; `prettier` is not a declared
  dependency.** 14-code-style-and-linting.md makes Prettier the formatter.

**Neither is a restructure task — both are Phase 0 findings.** A hook that
invokes a binary nobody installed either fails or silently no-ops, and which of
those it does is the first thing to establish.

### Source precedence, extended

The client's `docs/` set is a **fifth source**, and it ranks differently
depending on what is being asked:

| Question | Authority |
|---|---|
| Toolchain versions, ports, environment variables | **`docs/STACK.md` / `DEVELOPER_GUIDE.md`** — above this corpus |
| CI platform, security scanning, quality gates | **the client's pipeline** — above this corpus |
| Code shape, structure, naming, testing discipline | **this corpus** |
| Behaviour and requirements | **the BRD**, unchanged |
| Visual structure and copy | **the prototype**, unchanged |

Where the client's documents disagree with each other — and `STACK.md` §8
records several — **that is a finding to report, never a choice to make
silently.**

## Correction to the corrections — the real target repository, 2026-08-25

The eight corrections above were derived from the client's
`project-template-java` **template documentation**. The repository this corpus
will actually govern has now been inspected, and **four of those corrections
were themselves wrong.** Observed root:

```
KUS-PQMS/
├─ _bmad/ _bmad-output/   BMAD harness — NOT MoAI-ADK
├─ .claude/
├─ .githooks/             plain git hooks via core.hooksPath — NOT Husky, NOT Lefthook
├─ automation/ backend/ frontend/ infrastructure/    ORDINARY DIRECTORIES
├─ docs/ issues/ scripts/
├─ .gitattributes         already present
└─ .gitignore  README.md
```

| # | Template doc said | This repository is | Effect |
|---|---|---|---|
| 2 | Lefthook | **`.githooks/`** — plain hooks, `core.hooksPath` | 23's Lefthook section is superseded in turn |
| 8 | MoAI-ADK, `/moai plan\|run\|sync` | **BMAD** — PRD → architecture → epics/stories → story → dev-story → code-review | 32 is rewritten for BMAD |
| — | `.gitlab-ci.yml` at root | **no CI configuration at the root at all** | 15's platform is unresolved — see below |
| — | ~~one repository~~ | ~~**four git submodules**~~ | **WITHDRAWN — see below. This row was wrong; it IS one repository** |

**Corrections 1, 3, 4, 5, 6 and 7 are unaffected** — they came from
`frontend/package.json` and `STACK.md`-class facts, not from the harness or
hook tooling.

### WITHDRAWN 2026-08-25 — the submodule row above was wrong

**`backend/`, `frontend/`, `automation/` and `infrastructure/` are NOT git
submodules. They are four ordinary directories in one git repository.**

Measured, not read: `git submodule status` is empty, there is no `.gitmodules`,
no `frontend/.git` exists, and the index contains no gitlink (mode `160000`)
entries. `RESTRUCTURE-BASELINE.md` carries the commands and their output.

**33-polyglot-monorepo-integration.md owns the full withdrawal** — what it
changes back, and the one thing that gets *worse* rather than better. Not
restated here; read it there.

The single consequence that belongs in Tier 0, because it changes a rule rather
than a fact: **the component boundary is real but is not enforced by git.** In
one repository a glob that escapes its directory reaches every other component
immediately. The boundary is upheld by review and by each tool's own path
scoping, and by nothing structural.

**This correction is recorded here rather than only in 33 because of the
precedence rule this file already states about itself**: *"A stale value in
Tier 0 outranks every file that has it right."* 33 was corrected first, and
leaving the same falsehood in Tier 0 would have meant the wrong claim winning
every tie — the exact failure this file records against its own `ES2020` value.

### The lesson, and it is the same one three times now
The template documentation described a *template*, not this repository. The
prior audit made the same class of error in the other direction — assuming the
prior team's written guidelines described their code. **And the submodule claim
above was asserted about a repository nobody had run one command against.**

**`00`'s source precedence needs one more line: a document about a repository
ranks below the repository.** Read the tree before trusting the description of
the tree, every time. Both errors cost a full revision.

### Three things now unresolved rather than resolved

- **[PLACEHOLDER — the CI platform.** No `.gitlab-ci.yml`, no
  `.github/workflows/` at the root, and none inside any component directory. Either it
  is not stood up yet. 15-devsecops-and-ci-cd.md currently carries a GitHub
  Actions body and a superseding GitLab section, and **neither is confirmed.**
  **Trigger:** Phase 0 baseline. **Owner:** Frontend Lead.]**
- **RESOLVED 2026-08-25 — pnpm. See ADR 0004.** `package-lock.json` is deleted
  and `pnpm-lock.yaml` replaces it, converted with **`pnpm import`** so every
  pinned resolution carried over unchanged — verified, 336 `name@version` pairs
  on each side, identical. `pnpm install` was **not** used: it re-resolves every
  `^` range, and the fidelity captures that are Step 6's acceptance test cannot
  be compared across two dependency graphs. Settings (`allowBuilds.esbuild`,
  `engineStrict`) live in `pnpm-workspace.yaml`, **not `.npmrc`**, which pnpm 11
  no longer reads for non-auth settings.

  The hazard this placeholder named arrived in a form it did not predict. It
  warned that "CI will install whichever its command picks" — but there is no CI.
  What actually happened is that **one `pnpm` command, run to answer a read-only
  question, silently re-resolved the whole tree**: pnpm's auto-install preflight
  adopted the npm-installed `node_modules`, wrote two lockfiles and re-resolved
  every range **before the requested script ran at all**. Recovery took deleting
  both files, `rm -rf node_modules` and `npm ci`. **The general form is worth
  keeping: a package manager that is intended but not adopted is not a neutral
  state — the un-adopted one still runs, and it acts on being invoked.**
- **RESOLVED — `frontend/` is always a pnpm workspace. See ADR 0001.** The
  observed flat tree is a **defect to be corrected in Phase 2**, not a
  constraint the corpus adapts to. Every path here stays relative to the
  workspace root, and 01-project-structure-and-architecture.md carries the
  split map. **The hazard is tooling, not code**: a lint glob or an
  import-restriction pattern that stops matching after the move reports zero
  violations rather than an error, so the gate goes green while enforcing
  nothing.

### And two facts worth acting on immediately

**`.gitattributes` already exists at the root.** Verify it contains
`* text=auto eol=lf`. If it does, the most order-sensitive item in
30-restructuring-an-existing-react-project.md is already done. If it does not,
fixing it now is far cheaper than after the formatting baseline.

**`commit-msg.rules` is per-component**, and each component's differs. That is
not Conventional Commits enforced by `commitlint` — it is a bespoke convention
per component directory. 23-git-workflow-hooks-and-commits.md treats the
frontend's file as authoritative for the frontend and reaches into no other.
