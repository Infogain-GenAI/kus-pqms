# PQMS Frontend Standards — distribution document

> **GENERATED FILE — DO NOT EDIT.**
>
> Generated from the tier files in `PQMS_docs/standards/` by
> `scripts/build-standards-doc.mjs`. Every edit goes to the tier file that
> owns the rule; this document is then regenerated with
> `pnpm docs:standards`. An edit made here is lost on the next
> regeneration and, worse, is invisible to anyone reading the source.

**No generation timestamp, deliberately.** A timestamp would make every
regeneration a diff even when no rule changed, and it answers the wrong
question: what matters is whether this file matches its sources, which
`pnpm docs:standards:check` answers exactly. When it was generated is
already recorded, more reliably, by git.

**Cross-references are left exactly as the tier files write them.** A
reference reading `see 08-authentication-and-authorization.md` still names a
file rather than a section of this document. That is intentional: the
filename is where an edit has to be made, so a reader following a reference
lands on the editable source rather than on read-only output.

**Headings are demoted one level** so this document has a single H1 — its
own — and each tier file becomes an H2. Nothing else about the sources is
altered.

**One section at the end is not a tier file: the Appendix.** Everything
above it is a concatenation of a source file, one-to-one. The appendix is
computed by this script directly from all 34 files — cross-reference
counts that were previously hand-maintained inside tier files and found
to be wrong. It has no source file of its own for the same reason the
Contents table below doesn't: both are reports on the sources, not one of
them.

## Contents

| # | File | Tier | Status |
| --- | --- | --- | --- |
| 00 | [00 — Core Rules](#00--core-rules) | 0 | APPROVED — REVISION 15 |
| 01 | [01 — Project Structure and Architecture](#01--project-structure-and-architecture) | 1 | APPROVED — REVISION 8 |
| 02 | [02 — TypeScript Standards](#02--typescript-standards) | 1 | APPROVED — REVISION 2 |
| 03 | [03 — React Component Patterns and Naming](#03--react-component-patterns-and-naming) | 1 | APPROVED — REVISION 9 |
| 04 | [04 — State Management](#04--state-management) | 1 | APPROVED — REVISION 7 |
| 05 | [05 — API Integration and Data Fetching](#05--api-integration-and-data-fetching) | 1 | APPROVED — REVISION 6 |
| 06 | [06 — Styling and Design Tokens](#06--styling-and-design-tokens) | 1 | APPROVED — REVISION 7 |
| 07 | [07 — Routing and Layouts](#07--routing-and-layouts) | 1 | APPROVED — REVISION 2 |
| 08 | [08 — Authentication and Authorization](#08--authentication-and-authorization) | 1 | APPROVED — REVISION 12 |
| 09 | [09 — i18n and Localization](#09--i18n-and-localization) | 1 | APPROVED — REVISION 2 |
| 10 | [10 — Testing Standards](#10--testing-standards) | 1 | APPROVED — REVISION 5 |
| 11 | [11 — Accessibility Standards](#11--accessibility-standards) | 1 | APPROVED — REVISION 5 |
| 12 | [12 — Performance Guidelines](#12--performance-guidelines) | 1 | APPROVED — REVISION 2 |
| 13 | [13 — Security Standards](#13--security-standards) | 1 | APPROVED — REVISION 2 |
| 14 | [14 — Code Style and Linting](#14--code-style-and-linting) | 1 | APPROVED — REVISION 2 |
| 15 | [15 — DevSecOps and CI/CD](#15--devsecops-and-cicd) | 1 | APPROVED — REVISION 2 |
| 16 | [16 — Code Review Checklist](#16--code-review-checklist) | 1 | APPROVED — REVISION 2 |
| 17 | [17 — Domain Glossary and Business Context](#17--domain-glossary-and-business-context) | 2 | DRAFT — pending Yogesh AND Claude review |
| 18 | [18 — Project Context and Implementation Status](#18--project-context-and-implementation-status) | 2 | LIVE — both halves are drafted: the implementation snapshot below is dated and regenerated, the registers beneath it are authoritative |
| 19 | [19 — Onboarding and Dev Workflow](#19--onboarding-and-dev-workflow) | 2 | SKELETON — the sections and the capture rule are live; the content is written by whoever first runs the setup |
| 20 | [20 — Glossary and Appendix](#20--glossary-and-appendix) | 2 | APPROVED — REVISION 2 |
| 21 | [21 — Logging, Formatting and Client Diagnostics](#21--logging-formatting-and-client-diagnostics) | 1 | DRAFT — proposed addition, pending review |
| 22 | [22 — Error Handling and User Feedback](#22--error-handling-and-user-feedback) | 1 | DRAFT — proposed addition, pending review |
| 23 | [23 — Git Workflow, Hooks and Commit Conventions](#23--git-workflow-hooks-and-commit-conventions) | 1 | DRAFT — proposed addition, pending review |
| 24 | [24 — Storybook Authoring](#24--storybook-authoring) | 1 | DRAFT — proposed addition, pending review |
| 25 | [25 — Observability and Client Telemetry](#25--observability-and-client-telemetry) | 1 | DRAFT — proposed addition, pending review |
| 26 | [26 — Test Data, Fixtures and Test-Scope Rules](#26--test-data-fixtures-and-test-scope-rules) | 1 | DRAFT — proposed addition, pending review |
| 27 | [27 — Forms, Tables and Overlays — Review Checks](#27--forms-tables-and-overlays--review-checks) | 1 | DRAFT — proposed addition, pending review |
| 28 | [28 — Definition of Done](#28--definition-of-done) | 1 | DRAFT — proposed addition, pending review |
| 29 | [29 — Screen Description Authoring](#29--screen-description-authoring) | 2 | DRAFT — proposed addition, pending review |
| 30 | [30 — Restructuring an Existing React Project](#30--restructuring-an-existing-react-project) | 1 | DRAFT — proposed addition, pending review |
| 31 | [31 — Documentation Standards and Decision Records](#31--documentation-standards-and-decision-records) | 2 | DRAFT — new in this revision; the ADR format is adopted from a |
| 32 | [32 — Working Within the MoAI-ADK SPEC Workflow](#32--working-within-the-moai-adk-spec-workflow) | 2 | DRAFT — written from the client's harness documentation, not from a |
| 33 | [33 — Polyglot Monorepo Integration](#33--polyglot-monorepo-integration) | 1 | DRAFT — derived from the client's `docs/STACK.md`, `TEAM-GUIDE.md` |
| — | [Appendix: Derived Cross-Reference Index](#appendix-derived-cross-reference-index) | — | computed |

---

## 00 — Core Rules
**Tier:** 0
**Status:** APPROVED — REVISION 15

### Purpose
Non-negotiable rules that apply to all React code generation in this
repository, regardless of feature or screen. This file is always loaded
before any Tier 1 or Tier 2 file. If anything in a Tier 1/2 file conflicts
with this file, this file wins. If two Tier 1/2 files conflict with each
other, stop and flag it to Yogesh — do not guess which one is correct.

### ⚠️ READ THIS FIRST — this corpus was authored for a different repository

**These standards were written for a React portal that does not exist yet, and
they are being reconciled against one that does.** Until every row of the table
below is dispositioned, **"Confirmed stack" below is not confirmed** — it is a
target inherited from another project.

That matters more here than anywhere else in the corpus, because this is Tier 0
and this file wins every tie. A stack list that is aspirational but *labelled*
confirmed will silently outrank the repository on every question it touches.
**This file already records that exact failure happening to its own `ES2020`
value**, where two Tier 1 files were right and Tier 0's stale value won.

#### The divergence table

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

#### The first MEASURED consequence — the Vite row is not abstract

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

### Path convention
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

### Confirmed stack (do not deviate without explicit sign-off)

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

### RBAC rule
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

### Folder ownership
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

### Do-not list
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

### Precedence
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

### Source precedence — which source governs what
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

#### 0. WHICH FILE IS THE PROTOTYPE — settled 2026-08-26

The bullet above says the prototype governs visual structure and copy. It
did not say **which file**, and it deferred to 17's Prototype register,
which names `ISM SE Role.html` in a `requirements/` folder that no longer
exists. That gap produced measurable damage: two false findings in the
first screen reconciliation, and four fidelity scripts pointed at a
superseded artefact. It is closed here, in Tier 0, because every screen
description depends on it.

##### The canonical prototype

> **`docs/ux-prototype/ism-qir-se-role/ISM + QIR SE Role - P_C.dc.html`**
> — 1,837,340 bytes, md5 `8dca6a22f65b5dda7906a77945c12435`.
> Exported from Claude Design project **Kia N-PQMS V4-V5**
> (`6a717b29-4059-4d43-b115-34f7a7936c8e`), synced 2026-08-24.
> It ships with its runtime in the same folder — `support.js`,
> `lucide-local.js`, `_ds/` — and resolves them by relative path, so it
> renders only from that directory.

**What makes it canonical is content lineage, not its date.** This file
carries `PRI_MATRIX`, `_resetPageState`, `_priorityInherited` and the
`caretStyle()` helper; **no other candidate in this repository contains any
of them.** The delta against the previous sync was split into template and
logic halves and diffed hunk by hunk in
`issues/ism-v4-v5-gap-analysis.md` — +6,243 bytes of template across 28
hunks, +14,172 of logic across 34 — so the relationship between the two is
established exhaustively rather than asserted.

**And the app has already implemented three of those items** — the Issue
Priority tab (`apps/portal/src/features/issues/PriorityTab.tsx`,
`data/priorityMatrix.ts`), the QIR gate on saved priority, and the header
priority chip. A screen description written from any other candidate would
describe an application that no longer exists.

**This deliberately does not use modification dates.** 17 records that an
earlier prototype-identity analysis reached a wrong conclusion by ranking
candidates on mtime, and that a `git pull` rewrites mtimes wholesale. The
determination above rests on markers present in one file and absent from
all others, on a hunk-level diff, and on which features the application
already ships. Every one of those survives a `git pull`.

##### Superseded — named, so nobody opens one again

| File | What it is | Why it is not canonical |
|---|---|---|
| `_bmad-output/planning-artifacts/ux/design-source/exports/kia-npqms-v4-v5/ISM + QIR SE Role - P-C.dc.html` | The **previous sync** of the same design file (2026-08-22, 1,816,882 B, md5 `232c8800…`) | Superseded by the canonical; delta fully enumerated in `issues/ism-v4-v5-gap-analysis.md`. No Priority matrix. **Still the file `dc-compare.mjs`, `extract-dc-data.mjs` and `extract-dc-source.mjs` read** |
| `_bmad-output/planning-artifacts/ux/design-source/prototypes/ISM SE+QIR Role (latest, V4-V5).dc.html` | **Byte-identical duplicate** of the row above (same md5) | Not a distinct candidate. Its filename says "latest" and it is not — the word is misleading, which is why it is named here |
| `docs/ux-prototype/ism-qir-se-role/exports/ISM-QIR-SE-Role-PC-standalone.html` | Self-contained flattening (6,839,504 B, md5 `b6556c6b…`) | **Flattened from the 2026-08-22 generation, not the canonical** — carries no `PRI_MATRIX`. Convenient to open, wrong to read |
| `docs/ux-prototype/PQMS.html/PQMS.html` | **Byte-identical duplicate** of the standalone above (same md5) | Not a distinct candidate. A directory named `PQMS.html` containing a file named `PQMS.html` is an unpacking artefact |
| `_bmad-output/planning-artifacts/ux/design-source/exports/pqms-bundled-page-2026-08-16/PQMS_SE.html` | Flattened bundled page, **2026-08-11** — the oldest ISM candidate, in a folder whose name says 08-16 | Two generations behind. **This is the file that produced the false findings** — see the table below. **Read by `fidelity-gate.mjs`, `measure-prototype-delta.mjs` and `fidelity-capture.mjs`** |
| `…/pqms-bundled-page-2026-08-16/PQMS_SEM.html` | The SEM-role sibling of the row above | Same generation, different role. Not the SE prototype |
| `…/exports/kia-npqms-v2-v3/ISM SE Role.dc.html` and its byte-identical twin `…/prototypes/ISM SE Role (ISM-only, V2-V3).dc.html` | The **V2–V3** design generation | Superseded by V4–V5 wholesale. No `MC_MASTER`, no relationship vocabulary |
| `…/kia-npqms-v4-v5/_boot-admin.dc.html` | **Not a prototype.** A side effect written by `dc-compare.mjs`, committed in `fa25e69` | Tracked by accident. Untracking it is an open placeholder in 18 |
| `…/Admin Module Prototype.dc.html`, `ISM ASM Role.dc.html`, `ISM SEM Role - P_C.dc.html`, `SingleDatePicker.dc.html`, `ISM-print-*.dc.html` | Other modules and roles | **Siblings, not successors** — 17's rule. None is the SE prototype |

##### What reading the wrong file already cost

Both findings in the first screen reconciliation that were attributed to a
BRD/prototype disagreement came from `PQMS_SE.html`, and both are settled
by reading the canonical source:

| Question | `PQMS_SE.html` (2026-08-11) | **Canonical (2026-08-24)** | The app today |
|---|---|---|---|
| Sixth KPI tile | `{key:'resolved', label:'Resolved', accent:'#1F8A5B'}` | `{key:'closed', label:'Closed', accent:'#344049'}` | **Closed** — matches canonical |
| KPI tiles as filters | **absent** — tiles are static, no `_kpiSel` | `_kpiSel` selects a single status; the tile takes a selection border | clickable — matches canonical |
| Relationship column | Default-visible column; the cell renders `Standalone` with tooltip *"Standalone issue. Click to view history."* (`relLabel`/`relTooltip`/`relStandalone`/`relClickable`) | **The column does not exist.** No header, no cell, and `colGroupDefault` omits it from the Columns chooser. `visibleCols.relationship:true` survives as **dead state** | no Relationship column |
| QIR / Top Issue KPI icons | `triangle-alert` / `flame` | `workflow` / `focus` | still `triangle-alert` / `flame` — a known open gap |

The Relationship row is the important one, and it is worth stating
precisely because the first reading got it wrong twice. The column is not
hidden-by-default and it is not behind the Columns chooser: **the V4–V5
generation removed it.** `colRelationship` appears three times in
`PQMS_SE.html` — header, cell, binding, exactly like every other column —
and **once** in the canonical, the binding alone.

##### Rules that follow

1. **Every screen description and every reconciliation cites the canonical
   file by path and md5.** A description that names a different file is
   evidence about a superseded design, and is withdrawn rather than
   corrected.
2. **Read the source, not a render, for anything structural.** The live
   `.dc.html` restores column visibility from `sessionStorage`
   (`npqms.issueCols.v3`), so what a browser shows depends on that
   browser's history. `DEFAULT_COLS()` in the source does not.
3. **The fidelity scripts are pointed at a superseded artefact, so their
   app-vs-prototype numbers are not evidence about the current design.**
   Repointing them is tracked in 18; until it happens, quote those numbers
   only as app-vs-`PQMS_SE.html`.
4. **A new sync does not silently become canonical.** It supersedes this
   entry only once its delta is diffed the way `ism-v4-v5-gap-analysis.md`
   diffs this one, and this section is updated with the new md5.

#### 0b. A STRUCTURAL QUESTION IS ANSWERED FROM THE SOURCE, NEVER FROM A RENDER

The rule above says *which file*. This one says *how to read it*, and it is the
half that was missing.

> **A structural question is answered from the prototype's source. Never from a
> render, a screenshot, or a running copy.**

**Structural** means anything that is *specified* rather than *displayed*: which
columns exist, which statuses exist, what a default is, what a validation rule
requires, which regions are conditional and on what. A render answers *"what did
this browser show me"*. A specification needs *"what does the design specify"*.
Those are different questions, and the gap between them is not small.

##### The worked example, because this is the kind nobody predicts

`FIDELITY-REPORT.md` round 4 recorded, as a resolved finding, that the Issue
List's **Relationship column is hidden by default and offered through the Columns
chooser**. That statement is false in both halves:

- `colGroupDefault` — the chooser's own list — **omits `relationship` entirely**.
  It is not offered.
- The column has **no header and no cell** in the template. `colRelationship`
  appears three times in the superseded export (header, cell, binding) and
  **once** in the canonical file — the binding alone.

**The column was removed. It is not hidden.**

**Where the false claim came from.** It came from looking at a rendered page. And
the render is not deterministic:

```js
_loadCols(){ try{ const raw = sessionStorage.getItem('npqms.issueCols.v3');
                  if(raw){ … this.setState({ visibleCols:{ …DEFAULT_COLS(), …JSON.parse(raw) } }) } }
             catch(e){} }
```

**Column visibility is restored from `sessionStorage`.** What the prototype shows
depends on what that browser did earlier. `DEFAULT_COLS()` in the source does
not.

##### Why this failure mode is worse than being wrong

**A render-derived finding is reproducible for the person who made it and false
for everyone else.** An ordinary mistake fails the moment somebody checks it.
This one *passes* when its author re-checks — same browser, same session storage,
same wrong picture — and fails silently for every reader who cannot reproduce the
state. It survives review by being locally true.

**And it did survive review.** This is the **second** time a render-derived claim
has been recorded as fact in this project, and the **first time one survived a
correction pass**: the first screen description read a superseded file, was
corrected — and the correction *itself* was a render-derived claim about "the
live file", which then had to be corrected a second time. Two of the three
findings in the first reconciliation were artefacts, and the fix for one of them
was a third artefact.

##### What this rule requires in practice

1. **Cite the symbol, not the screenshot.** A structural claim names the
   construct that carries it — `DEFAULT_COLS()`, `STATUS`, `kpiDefs`,
   `validateForm()`, `tabDefs`. A claim that cannot name one is an observation
   about a render and is recorded as such.
2. **Counting occurrences is evidence.** *"`colRelationship` occurs 3× in the
   superseded file and 1× in the canonical, where every other column occurs 3×"*
   is checkable by anyone, on any machine, forever. *"I opened it and the column
   was not there"* is not.
3. **Suspect any browser-persisted state.** `sessionStorage`, `localStorage`,
   cookies and URL state all make a render depend on history. This prototype uses
   `npqms.issueCols.v3` for columns and `npqms.issueFilters.v5` for filters —
   **both** silently reshape what a reader sees.
4. **A render still answers rendering questions.** Colour, spacing, type,
   alignment, what something *looks* like — those are what pixels are for, and
   the fidelity harness exists for exactly them. The rule is a boundary, not a
   ban.

##### What a render could not have found, in one pass

Recorded as the positive case, because the rule reads as pure caution otherwise.
Reading the source produced, in a single pass:

- **The Issue List is a grouped table** — one row per group, anchored on the
  Parent, filters matching at group level. Stated in a source comment; present in
  no pixel.
- **The prototype is not single-role** — three role-dependent subtitles and a
  seventh, role-gated tab, all **unreachable in the rendered file**, because the
  prototype ships no role switch.
- **The status vocabulary omits two values its own workflow writes**, which the
  render actively conceals by falling back to "Open".

#### 1. Prototype component names are labels, not code names
The prototype was produced in Claude Design, and its bundle carries a
design-system manifest naming components `Button`, `Select`,
`DataTable`, `Input`, `Tabs`, `Badge`. **Those are visual references.**
This codebase names them `BaseButton`, `BaseSelect`, `BaseDataTable`
and so on, per 06-styling-and-design-tokens.md — **naming is code
shape, so 06 governs.**

A component spec titled `BaseX.md` corresponds to the prototype's `X`.
That is a mapping, not a disagreement, and nothing needs reconciling.

#### 2. The prototype shows less than a requirement demands — BRD governs
A select rendered with no keyboard affordance is not evidence that
keyboard support is out of scope. **BRD FR-ENT-005 commits to a
keyboard-navigable combobox** (retiring the prior citation to BRD
v1.3's NFR-08), and a committed requirement outranks a static picture.
**The prototype shows appearance, not an interaction contract** — it
has no way to express one.

Generalised: absence in the prototype is not a decision. It is the
absence of information about something the prototype does not govern.

#### 3. A standard and the prototype disagree on a visual — prototype governs
A colour, a spacing value, a label. In every such case the standard is
either being misread or needs amending — and amending it is the normal
outcome, not an escalation.

06's rule that a hardcoded value must trace to a real source exists
precisely to make this checkable: a value with a cited source can be
compared against the prototype, and one without cannot be defended at
all.

#### 4. When no source governs it — say so and decide deliberately
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

#### 5. A prior citation's value disagrees with the current prototype — re-derive, don't trust the citation
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

### Corpus map — which file owns what

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

### Using this corpus against a different repository

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

### The audited prior implementation — a fourth source, and its rank

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

### Where documents live

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

### The target repository — and eight corrections to the stack above

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

#### The eight corrections

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

#### Things the target repository already has, and this corpus should not re-specify

**MSW ^2.7.5 is already a dependency.** 10 and 26 specify it; it exists.
**React Router 8, React 19, Vite 8, Node 24.15.0, pnpm 11** all match. **The
`us-west-2` / `us-east-1` discrepancy between `TEAM-GUIDE.md` and `STACK.md`
is the client's to resolve** — it is not a frontend concern and this corpus
states no region.

#### Two stale artifacts the restructure inherits

`STACK.md` §8 records both, and both are directly in this corpus's path:

- **`frontend/.storybook/` exists on disk; `storybook` is not a declared
  dependency.** 24-storybook-authoring.md assumes a working Storybook.
- **Lefthook invokes `prettier --write`; `prettier` is not a declared
  dependency.** 14-code-style-and-linting.md makes Prettier the formatter.

**Neither is a restructure task — both are Phase 0 findings.** A hook that
invokes a binary nobody installed either fails or silently no-ops, and which of
those it does is the first thing to establish.

#### Source precedence, extended

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

### Correction to the corrections — the real target repository, 2026-08-25

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

#### WITHDRAWN 2026-08-25 — the submodule row above was wrong

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

#### The lesson, and it is the same one three times now
The template documentation described a *template*, not this repository. The
prior audit made the same class of error in the other direction — assuming the
prior team's written guidelines described their code. **And the submodule claim
above was asserted about a repository nobody had run one command against.**

**`00`'s source precedence needs one more line: a document about a repository
ranks below the repository.** Read the tree before trusting the description of
the tree, every time. Both errors cost a full revision.

#### Three things now unresolved rather than resolved

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

#### And two facts worth acting on immediately

**`.gitattributes` already exists at the root.** Verify it contains
`* text=auto eol=lf`. If it does, the most order-sensitive item in
30-restructuring-an-existing-react-project.md is already done. If it does not,
fixing it now is far cheaper than after the formatting baseline.

**`commit-msg.rules` is per-component**, and each component's differs. That is
not Conventional Commits enforced by `commitlint` — it is a bespoke convention
per component directory. 23-git-workflow-hooks-and-commits.md treats the
frontend's file as authoritative for the frontend and reaches into no other.

---

## 01 — Project Structure and Architecture
**Tier:** 1
**Status:** APPROVED — REVISION 8

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Context: this is a deliberate target structure
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

### Build sequencing: dependency order, nothing more
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

### Feature-folder depth rule (`apps/portal` components)
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

### Shared components — one location only
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

### `ui-library` category structure
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

#### This file does not enumerate the components — and nothing else does yet
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

#### Where component specifications live
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

#### `PQMS_docs/screen-descriptions/` — the sibling folder
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

### `hooks/` and `services/` — feature grouping

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

### Package ownership
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

### Placeholders
The folder name for any feature not named above — Overview, QIR
Management, TSB Management — is [PLACEHOLDER — to be resolved when that
feature is actually built].

### Four folder rules the shipped Vue portal settles

The prior repository was audited file by file on 2026-08-24
(`../analysis/vue-baseline-audit.md`). Four of its findings are structural
and belong here rather than in the audit, because they are rules.

#### `config/` — the declarative-configuration layer, and it is owned here
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

#### A folder is not created before something lives in it
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

#### Categories that nothing checks are suggestions
The prior `ui-library` has seven category folders where its own architecture
document specifies six — **and `BaseDataTable` and `BaseModal` sit directly
under `components/`, in no category at all.** Those are the two largest and
most-used components in the library. They arrived first, never got filed, and
nothing failed.

So: the eight categories this file specifies need a check, not just a
paragraph. Either the barrel enumerates by category, or a lint rule constrains
the path depth under `components/`. **Absent a check, expect the same
outcome.**

#### An escape-hatch category is better than the two alternatives
The prior library has a `pqms/` category holding `BaseCommentCard` — a
component that is product-specific but still purely presentational. It is the
honest answer to a primitive that turns out to be domain-shaped, and it beats
both alternatives: forcing it into `base/` (which corrupts the meaning of
`base/`) or duplicating it per feature.

**Adopt the escape hatch.** A component qualifies only if it is presentational —
no data fetching, no store access, no routing. Domain *shape* is permitted;
domain *behaviour* is not.

### Where this package is going — the shared-package target
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

### Splitting a flat project into the workspace — the observed case

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

#### The split changes what tooling can see, and two failures are silent

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

#### Where the adaptation goes
A vendored ruleset is a byte-copy and is never edited
(00-core-rules.md, and the same rule that governs vendored token CSS). **Alias
and specifier twinning belongs in the app-side wrapper that executes it** —
adding a package-specifier pattern beside the existing bare and `@/` ones leaves
the vendored file byte-identical, which is what keeps it re-verifiable against
its source.

#### The acceptance test for the split
**A workspace split is a pure move**, so any screenshot or fidelity comparison
should be **byte-identical before and after**. Where such a harness exists it is
the strongest available proof that the move changed nothing, and it belongs in
the Phase 2 acceptance criteria alongside an unchanged test count.

One ordering constraint that survives the move and gets less obvious: **where a
stylesheet import must come first** — because the bundler emits CSS in import
order and a component import above it inverts the cascade — **that constraint is
unchanged when the path becomes a package specifier.** Restate the reason in the
moved file; it stops looking local, and the next reader tidies it.

---

## 02 — TypeScript Standards
**Tier:** 1
**Status:** APPROVED — REVISION 2

### Purpose
TypeScript conventions for this React app.

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Baseline: required `tsconfig.base.json` values
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

### `any` — hard ban, no exceptions
`any` is never used in application code. This applies to variables,
function parameters, return types, and generic defaults, with no
carve-out for "it's just a quick script" or "third-party lib."

#### Untyped third-party libraries
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

### Domain types: string literal unions, not `enum`
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

#### This replaces a ten-value set, and the correction is worth recording
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

#### Two shapes, and which one to use
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

### Type organization: co-located per component
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

### Common type patterns
[To be filled in with concrete examples once the first real components
are built — API response wrapper, async/query state shape (aligned with
TanStack Query's own return shape, not a custom `AsyncState<T>`
reinvention), form state typing. Placeholder — do not draft generic
examples divorced from an actual PQMS screen; ground each example in a
real Issue Entry / Issue Detail type once available.]

### TypeScript version — the target repository runs 5.9, not 6

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

---

## 03 — React Component Patterns and Naming
**Tier:** 1
**Status:** APPROVED — REVISION 9

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
Hook return shape, callback-prop conventions, content-composition
patterns, error-boundary placement, TanStack Query's interaction with
those boundaries, and the React Compiler's effect on manual
memoization.

This file owns **conventions** — how a component's surface is shaped and
named. It does not specify any individual component's API; see
01-project-structure-and-architecture.md's "This file does not enumerate
the components" for what that gap is and who fills it.

### Custom hook return shape
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

### Callback props
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

### Content composition
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

#### `BaseDataTable`'s column API is a specification this corpus does not contain
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

### Forms and validation
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

### Error boundaries
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
match the error against the dynamic-import failure message **of every
browser this app runs in** and trigger a hard reload; any other error is
logged, not reloaded — reloading on every error risks masking a real bug
or looping.

**The message is the browser's, not the bundler's, and each engine words
it differently.** An earlier revision of this file specified only
`'Failed to fetch dynamically imported module'`. That string is
**V8/Chromium's**, so a boundary matching only it recovers only Chromium
users; Firefox and Safari fall through to the log-and-render path and a
user holding a stale bundle after a deploy gets a dead end instead of
the reload this section exists to trigger. Match all three:

| Engine | Message |
|---|---|
| V8 / Chromium | `Failed to fetch dynamically imported module` |
| SpiderMonkey / Firefox | `error loading dynamically imported module` |
| JavaScriptCore / Safari | `Importing a module script failed` |

**Do not attribute the string to Vite.** It is emitted by the browser's
module loader; grepping the bundler's source for it is a dead end, and a
comment naming the wrong emitter sends the next reader debugging in the
wrong repository. (Recorded because exactly that happened: a code comment
in this project called it "Vite's own message", and the mistake was
caught only by an independent review pass grepping Vite's `dist` and
finding nothing.)

Widening the match adds no risk of a spurious reload loop: all three
strings denote the same failure class — a module script that could not be
fetched or parsed — so nothing newly matches that was not already a
chunk-load failure.

**[PLACEHOLDER — this app declares no browser support target: there is no
`browserslist` key and no Vite build `target`. So "Chromium-only is
acceptable" is not a conclusion available from the repository, which is
why all three engines are matched rather than one. If a support target is
ever declared and excludes an engine, its row above can go. Trigger:
whenever a browser support target is set. Owner: Frontend Lead.]**

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

### TanStack Query and error boundaries
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

### Memoization and the React Compiler
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

---

## 04 — State Management
**Tier:** 1
**Status:** APPROVED — REVISION 7

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Confirmed stack
**TanStack Query** for server/async state. **Zustand** for client/UI
state. Never Redux, Redux Toolkit, or RTK Query — per 00-core-rules.md.

### Classification rule
**Every piece of state is classified once, before it is written:**

- **Does it come from a server, or is it a cache of something a server
  owns?** → TanStack Query. Never a Zustand store.
- **Is it purely a property of this client's session — a filter
  selection, a panel's open state, a sort direction?** → Zustand.

The test is ownership, not shape. A list of records fetched over HTTP is
server state even if you only read it once; a sort direction is client
state even if you send it to the server as a query parameter.

Three worked examples follow. Each is a real feature this app needs, and
each is provenance from the prior Vue implementation of this product
(repo `kus-pqms`, `frontend/apps/pqms-portal/src/stores/`), where the
same three concerns were all Pinia stores — the classification below is
the correction, not a description of that structure.

#### Notifications → TanStack Query
Server-data cache, unambiguously: a notifications list, an unread count,
background polling, and optimistic mark-read writes. **This is not a
Zustand store.** Loading and error state come from `useQuery` itself
rather than being fields you maintain.

Required behaviour, with the values carried forward from `kus-pqms`
(`frontend/apps/pqms-portal/src/stores/notification/
notifications.store.ts`):
- **Data**: a notifications list and an unread count.
- **Operations**: load a page, mark one read, mark all read — the last
  two optimistic.
- **Page sizes**: **6** for the header dropdown, **50** for the
  full-page list.
- **Poll cadence**: every **60 seconds** — see "Notifications polling"
  below, and 05 for the configuration that expresses it.

#### Issue-list filters → Zustand
100% client/UI state, no server data at all. Required fields:
`search`, `filters`, `scope`, `sort`, `page`, `pageSize`,
`visibleColumns` — with actions to set each, plus `clearAll` and
`resetVisibleColumns`.

Provenance: carried forward from `kus-pqms`
(`frontend/apps/pqms-portal/src/stores/issue-management/
issue-filters.store.ts`), which held exactly
this field set with actions `applyFilter`, `clearAll`, `setSearch`,
`setSort`, `setPage`, `setPageSize`, `setScope`, `setVisibleColumns`,
`resetVisibleColumns`. Note four of these fields — `sort`, `page`,
`pageSize`, `visibleColumns` — are what make `BaseDataTable` a
controlled component; see 03-react-component-patterns-and-naming.md's
note on its unspecified API.

#### Auth → Zustand
Required shape: `currentUser`, plus `role` and `permissions`.

**`role` is derived, not independently written.** `setUser()` writes
`currentUser` and `permissions`; `role` is read off `currentUser` and no
action assigns it. Stated explicitly because an earlier revision named
three fields and then accounted for writing only two, leaving a reader to
infer which — while 08-authentication-and-authorization.md already
described both as "derived `role`/`permissions`". Two files agreed and
this one was silent, which is the harder defect to notice.

**How it gets populated is 08's**, not this file's — the FR-SEC-011
resolved-permissions response in real mode, a seeded identity in fixtures
mode. This file owns the shape and the writer discipline below.

**`switchRole()` is required, and it is load-bearing rather than a
convenience.** A dev-only role switcher, gated so that it throws in a
production build.

It is required because of 08-authentication-and-authorization.md's
"Fixtures-mode authentication" decision: fixtures mode bypasses MSAL
entirely and `authReady` resolves immediately against a seeded identity
in this store, so `switchRole()` is how a developer changes who they are
logged in as. That makes it **the only identity mechanism available
during all local development** until a real Entra tenant exists — every
RBAC behaviour any developer sees, and every permission-gated screen
they test, runs through it.

Provenance: `kus-pqms` had this as a prototype role switch — a
convenience it could have dropped. Here it cannot be dropped, which is
why it is specified rather than merely permitted.

Two things that follow:
- **Without it, fixtures mode has exactly one identity** — one
  hardcoded user, and no way to exercise the permission-gated call
  sites at all (see 08's call-site table). Dropping `switchRole()`
  means those access controls can never be tested locally across the
  five BRD roles (SE/ASM/PQM/ADMIN/VIEWER).
- **Its prod-build gate is a security control, not hygiene.** 08 pairs
  `isFixtureMode()` with `import.meta.env.PROD === false` as a hard
  fuse on the auth bypass; `switchRole()`'s own throws-in-production
  behaviour is the second layer of that same defence. Both layers are
  required.

Its writer discipline is the single-writer rule immediately below:
`switchRole()` routes through `setUser()` like every other writer and
never touches `currentUser` or `permissions` directly.

No action may write `currentUser` directly. The only writer is an
internal `setUser(user: AuthUser)` action, which derives `permissions`
(in fixtures mode, from a fixtures-only `ROLE_PERMISSIONS_MAP` — see
08's "Permission model"; in real mode, from the FR-SEC-011
resolved-permissions response) and sets both `currentUser` and
`permissions` in the same `set()` call.

`switchRole()`, MSAL hydration, and logout all route through
`setUser()` — none of them touch `currentUser` directly. This guarantees
`permissions` is always a plain, directly-readable field on the store's
state object (safe for `getState().permissions` to read from
middleware, outside React), never a hook-time-only derived selector.

**Export the `AuthUser` type**: `export interface AuthUser`. The
`setUser(user: AuthUser)` signature above cannot typecheck against a
module-private type once callers live outside the store module, and per
the paragraph above they will. Provenance for why a one-word detail is
called out at all: in `kus-pqms` this interface was declared without
`export`, which worked only because every writer lived in the same file
— a structure this file's single-writer rule deliberately changes.

### Notifications polling — classification, not configuration
Notifications poll on a **60-second cadence**, and in **fixtures mode
the query is disabled entirely** rather than fetching and discarding.
Those are the two product-level facts this file owns.

**How they are expressed is 05-api-integration-and-data-fetching.md's**
— see its "Polling: the notifications query" section for the query
configuration (`refetchInterval`, the `refetchIntervalInBackground`
default that gives focus-based pausing, and the `enabled` condition
including the call-the-parens trap). Not restated here: query
configuration lives in one file, and 05 is that file.

What this file adds is the classification that makes any of it apply:
notifications are **server state**, so they are a query and not a
Zustand store, and their loading and error states come from the query
rather than being fields anyone maintains. Get that wrong and no amount
of correct query configuration helps.

### Fixtures mode — owned by 05
`isFixtureMode()`, the `VITE_USE_FIXTURES` opt-in default, and what a
service returns in fixtures mode are all specified in
05-api-integration-and-data-fetching.md's "Fixtures mode" section. Not
restated here.

The only part that touches this file: **fixtures mode does not change
the store layer.** Client state is client state in both modes — the
issue-filters store behaves identically, and `switchRole()` remains the
identity selector (see "Auth → Zustand" above, and 08 for why). What
changes is where *server* data comes from, which is a question about
services and queries, not stores.

### Issue-filters persistence — Zustand `persist` middleware
The issue-filters store persists to `sessionStorage` via Zustand's
`persist` middleware. **Adding `persist` alone is not sufficient** — all
three behaviours below are required, and none of them is the
middleware's default:

- **`partialize` to exclude `scope` from the persisted payload.** Scope
  always resets to the role-derived default on mount, never restores
  from a previous session. This is deliberate: scope is derived from who
  you are, so restoring a stale one would show a returning user a scope
  their current role may not warrant.
- **A custom `merge` (or `onRehydrateStorage`) for per-field defensive
  fallback.** On partially-malformed saved data, each field falls back
  to its default **independently** — one bad field must not discard the
  rest. `persist`'s default shallow-spread merge does not do this.
- **A custom `storage` handler for corrupted-JSON recovery.** On a parse
  failure: catch it and **delete** the corrupted `sessionStorage` key,
  so the next load starts clean. `persist`'s default is a console error
  with no cleanup, which leaves the bad key in place to fail again on
  every subsequent load.

Provenance: all three behaviours are carried forward from `kus-pqms`
(`frontend/apps/pqms-portal/src/stores/issue-management/
issue-filters.store.ts`), which implemented
persistence by hand and therefore had them explicitly. They are spelled
out here because `persist` supplies none of them and the gap is silent
— you get working persistence that quietly loses the whole filter set on
one malformed field, or wedges on a corrupted key. The `scope` exclusion
in particular was an explicit, reaffirmed decision there rather than an
oversight.

### The target repository has no state library — and that is a decision, not a gap

`docs/STACK.md` §3 records the frontend as "**No state-management library** —
React hooks only", with a single route and a scaffold-sized surface.

This file specifies Zustand for client state and TanStack Query for server
state. **Adopting either is an addition to the dependency graph, which makes it
a decision the client owns — not something a restructure performs quietly.**

Two things follow, and the order matters:

- **TanStack Query first, and it is the one that is hard to defer.** Server
  state hand-rolled with `useEffect` is the single largest source of the bugs
  10-testing-standards.md's coverage gate will not catch — stale closures,
  request races, missing cancellation, refetch storms. The prior Vue repository
  built `useAsyncQuery` for exactly this reason and it is the clearest
  carry-forward in `../analysis/vue-baseline-audit.md`.
- **Zustand second, and it may not be needed at the current size.** Its two
  stores here are auth/session and notifications. If the auth model is thin
  and notifications are server state, context plus the query client may cover
  it. **Do not add a store because this file names one.**

**[PLACEHOLDER — whether TanStack Query and Zustand are adopted, and in which
SPEC. Trigger: before the first screen with server data is restructured. Owner:
Frontend Lead + client architect.]** Until answered, the boundary rule in this
file still governs: **server state and client state are never held in the same
place**, whatever the mechanism.

30-restructuring-an-existing-react-project.md Phase 3.5 already warns this is
where estimates go wrong. On a codebase with no query layer at all, that warning
is not a caution — it is the plan.

---

## 05 — API Integration and Data Fetching
**Tier:** 1
**Status:** APPROVED — REVISION 6

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### HTTP client
One Axios setup at `apps/portal/src/shared/http/apiClient.ts` (paths are
workspace-root-relative, per 00's Path convention).
Build it with all five properties below.

Provenance: this is carried forward nearly 1:1 from the prior Vue
implementation of this product (repo `kus-pqms`, same path), where it
was already framework-agnostic — it is plain Axios plus interceptors,
with nothing Vue-specific to translate. Treat the list below as a
specification rather than a summary.

- **One factory, `createHttpClient(baseURL, envVarName)`, and as many
  named instances as there are backend origins.** `kus-pqms` had two —
  `apiClient` (`VITE_API_BASE_URL`) and `notificationApiClient`
  (`VITE_NOTIFICATION_API_BASE_URL`) — because notifications were a
  separate deployed service.

  **How many instances this app needs is not settled, and the factory is
  what makes that survivable.** BRD `AR-01`/`DEC-08` commit to a **single
  backend deployable behind a single `/api/v1/**` surface**; under that
  topology there is **one** origin and therefore one instance, and a
  second would be a distinction with nothing behind it. The two-instance
  shape above is carried from the prior microservices topology, which
  `DEC-08` replaces.

  **[PLACEHOLDER — the number of origins. Resolved by `DEC-08` being
  signed. Trigger: before the HTTP client is built. Owner: Architect.]**
  Build the factory regardless; instantiate against however many origins
  the answer produces. Do not hard-code two.

  **This is not only a `05` question.** The same assumption is encoded in
  13-security-standards.md's `VITE_*` inventory (three of its seven
  variables are per-service proxy targets) and in
  20-glossary-and-appendix.md's four-path dev-proxy snippet. All three
  move together or none of them does — check the other two when this
  resolves.
- **Request interceptor**: `Authorization: Bearer <token>` attached only
  if a token exists (via a pluggable `getAccessToken` getter), plus an
  always-attached `X-Correlation-ID` (`crypto.randomUUID()`, with a
  manual fallback).
- **Response interceptor**: normalizes all errors into one `ApiError`
  shape — `{ status, code, message, correlationId, details? }`.
  `ECONNABORTED` → `"TIMEOUT"`; no response → `"NETWORK_ERROR"`;
  otherwise the HTTP status as `code` plus an extracted message
  (including a `Blob`-response special case). Includes an
  `isApiError()` type guard, used consistently for error handling (e.g.
  appending `correlationId` to toasts).
- **Auth token wiring**: two pluggable seams,
  `registerAccessTokenGetter` and `registerUnauthorizedHandler`. This
  file owns the **seams**; the Azure AD OIDC+PKCE token source that
  fills them is 08-authentication-and-authorization.md's. Build the
  seams even before there is a token source to register — 08 records
  that wiring as real unbuilt work, and an unregistered seam is the
  correct intermediate state, not a gap.
- **Production HTTPS tripwire**: throw at boot if a production build's
  base URL is not HTTPS. Cheap, and it catches a misconfigured
  environment at startup rather than on the first request.

### Services/mappers layer
**"Service calls → mapper translates → service returns domain shape"**
is the standard pattern. Three rules:

- **A service function returns already-mapped domain data** in the
  general case. Callers do not see backend field names.
- **Three deliberate exceptions return the raw backend envelope**:
  search-, `filterOptions`-, and `columnOptions`-style methods, which
  defer mapping to the caller. **This is by design, not an
  inconsistency to fix** — these endpoints return option lists and
  result envelopes whose shape the caller needs to interpret in
  context, and forcing them through a domain mapper would flatten away
  what the caller is actually deciding on. See the hook layer below for
  where their mapping happens instead.
- **Mapping lives in a separate sibling `.mappers.ts` file**, never
  inline in the service file.

Provenance: all three are carried forward from `kus-pqms`, where the
split and the three raw-envelope exceptions were already established
and deliberate. The pattern is framework-agnostic; nothing about it was
Vue-specific.

### Input validation and schema parsing
**Zod v4** (pin `"zod": "^4.0.0"` explicitly — v3 and v4 have
incompatible generic internals, so this is not a loose `^3 || ^4`
range) is the schema library for validating API responses at the
mapper boundary — the same `.mappers.ts` files established above as
this file's translation layer are where a response schema is parsed,
before the mapper produces the domain shape a hook returns.

**Default: schemas are strict** — an unexpected shape is rejected, not
silently passed through.

This is the point of having Zod here at all. A mapper without schema
validation does not fail when the backend drifts; it produces
`undefined` deep inside a component, far from the cause. A strict
schema fails loudly, at the boundary, naming the field. Provenance:
`kus-pqms`'s mappers did no validation, and that silent-`undefined`
failure mode is what this replaces.

**Named exceptions, and only these three** — each tied to a specific
backend gap, not a general leniency policy.

**These are live constraints on the backend this app talks to, not
history.** Each one exists because the API does not yet do something
the client sends or expects. They are stated as present-tense
requirements deliberately:

- **`ownerUserId`** — marked `.optional()` on the relevant response
  schema, with an inline comment citing the gap: the field is sent in
  the request payload but not yet persisted by the real backend, so a
  strict schema would reject every response that omits it.
- **Vehicle Info / System Classification edit-response fields** (Edit
  Issue) — marked lenient the same way, with an inline comment noting
  there is no matching update-endpoint field yet for these edits to
  round-trip through.
- **Linked-issues batch-response schema** — built loosely throughout,
  with an inline comment noting no real batch endpoint exists yet to
  validate a strict shape against.

Do not generalize leniency beyond these three named cases — a fourth
field discovered to be unreliable gets its own schema fix or its own
explicitly documented exception, not a broadening of an existing one.

**Re-verify each of the three before writing its exception.** They were
identified by investigation against the backend as it behaved during
`kus-pqms`'s development; the backend has continued to exist since, and
any of the three may have been fixed. A lenient schema against a field
the backend now reliably returns is worse than no exception at all — it
permanently hides a working field behind an `.optional()` nobody
revisits. Confirm the gap is still real, then write the exception with
an inline comment citing it. If a gap has closed, delete the exception
rather than leaving it.

**Cross-reference**: 03-react-component-patterns-and-naming.md's "Forms
and validation" section uses this same Zod version for client-side form
schemas. This file owns the version pin and the API-response validation
policy; 03 owns form-level usage — a version bump here must be checked
against 03, and vice versa.

### TanStack Query hook layer — how services connect to components
**This file owns query configuration.** 04-state-management.md decides
*what is server state* and therefore belongs in a query at all; once
that classification is made, how the query is configured is specified
here. 04 cites this section rather than restating it.

- **Each feature gets custom hooks** wrapping `useQuery`/`useMutation`
  around the corresponding service function — e.g. `useIssueList()`,
  `useIssueDetail(id)`, `useMarkNotificationRead()`. Components call
  the hook, never the service directly.
- **For the three raw-envelope exceptions** (search, `filterOptions`,
  `columnOptions`), mapping happens via TanStack Query's **`select`**
  option inside the custom hook. This keeps the caller-does-the-mapping
  convention from the services layer above, with the query hook as the
  caller — and `select` means the mapping is memoized and does not
  re-run on every render.
- Query key conventions: [PLACEHOLDER — to be finalized once the first
  real hooks are written; should follow TanStack Query's recommended
  array-based key structure scoped by feature].

#### Polling: the notifications query
The one query in this app that polls. Configuration:

- **`refetchInterval: 60_000`** — a 60-second poll.
- **Leave `refetchIntervalInBackground` at its default (`false`).**
  This is what gives you focus-based pausing: polling stops when the
  tab is not focused and resumes when it is. Do not set it to `true`,
  and do not hand-roll the pausing.
- **`enabled: !isFixtureMode()`** — in fixtures mode the query is
  disabled entirely rather than fetching and discarding. **Call the
  predicate**: `!isFixtureMode` without parens evaluates a function
  reference, which is always truthy, permanently disabling the query
  in every mode with no error and no network call.

**Never hand-roll an interval for this.** Provenance: `kus-pqms` used a
`setInterval` that never stopped, skipping the network call via a
`document.hidden` check on each tick. `refetchInterval` plus the
default background behaviour achieves the same outcome with none of the
lifecycle code — and none of the risk of an interval outliving its
component.

04-state-management.md owns *why* notifications are a query rather than
a store, and the domain values (page sizes, the 60-second cadence as a
product decision). This section owns how that is expressed.

**See also**: 07-routing-and-layouts.md builds directly on this file's
TanStack-Query-owns-server-state architecture to establish that loaders
never fetch view data — a change to this file's data-fetching ownership
should be checked against 07.

### Fixtures mode
**This file owns fixtures-mode data behaviour** — the predicate, where
the switch happens, and what a service returns. The *auth* half is
08-authentication-and-authorization.md's ("Fixtures-mode
authentication"); the `use*` naming rule is
14-code-style-and-linting.md's; the `VITE_USE_FIXTURES` contract across
`.env`, `.env.example` and `env.d.ts` is 13-security-standards.md's.
This section owns everything else about it.

#### The predicate
**Fixtures mode is explicit opt-in. Write it as an exact equality:**

```ts
export function isFixtureMode(): boolean {
  return import.meta.env.VITE_USE_FIXTURES === "true";
}
```

**`=== "true"`, not `!== "false"`.** An absent variable, a typo, `"0"`,
`"off"`, `"FALSE"` — every one of those means **real mode**. Fail
closed.

The reason is 08's decision, not tidiness. Default-on is a defensible
convenience while the flag gates only *data*: unset then means "don't
fire HTTP at a backend that may not be running," which is the safe
direction. But the same flag also gates an **authentication bypass**,
and an auth bypass must never be what you get by forgetting to set a
variable. Once one flag governs both, the safe direction inverts.

**Name it `isFixtureMode()`, never `useFixtures()`.** It is not a hook —
it reads `import.meta.env` and returns a boolean. A `use*`-named
non-hook called conditionally, inside a callback, or inside a
query-options object trips `rules-of-hooks` under the lint preset 14
mandates. Provenance: `kus-pqms` named it `useFixtures()` and
implemented it as `!== "false"`, with a source comment arguing the
data-only case above. That reasoning was sound for what the flag gated
there; it is not sound here.

**A fresh clone with no `.env` gets real mode**, and therefore real
auth, and therefore — with no Entra tenant reachable — nothing renders.
That is intended, and it means fixtures mode must be documented where a
new developer will look rather than left to be inferred.

#### What a service returns in fixtures mode
**The service layer is the seam. A service function returns fixture
data in fixtures mode and calls HTTP in real mode. Nothing above it
changes.**

That means, concretely:

- **Queries, hooks, and components are identical in both modes.** They
  call the same service function, receive the same domain shape, and
  render the same way. No `isFixtureMode()` checks in a component, a
  hook, or a screen.
- **Fixture data goes through the same mapper and the same schema** as a
  real response. A fixture that would fail the Zod schema is a broken
  fixture, and finding that out in fixtures mode is the point.
- **`isFixtureMode()` is called in exactly one kind of place**: inside a
  service function, choosing its data source. If you are calling it
  anywhere else, the switch is in the wrong layer.

**Why the seam is the service and not the query**: fixtures mode exists
so screens can be built and reviewed with no backend running. If the
switch were at the query layer — disable the query, render an empty
state — then no screen would show anything in fixtures mode and the
mode would have no purpose. Putting it in the service means every
screen renders with realistic data, and the code path above the service
is the same one production uses.

**The one documented exception: a query whose purpose is to observe
change over time.** Polling fixture data is pointless churn — it
re-fetches the same static array every interval forever. For those,
disable the query instead:

- **Notifications** is the instance. Its query takes
  `enabled: !isFixtureMode()` (see "Polling: the notifications query"
  above) and does not fetch at all in fixtures mode.

**The test for a new exception**: does this query exist to *notice
something changing*? If yes, fixture data makes it meaningless — disable
it. If no — it exists to *show* something — return fixture data. Anything
else is a screen-by-screen decision, which is what this section exists
to prevent.

Provenance: `kus-pqms` worked this way. Its `api/*.ts` modules were a
fixture-backed data layer that services read from, with
`VITE_USE_FIXTURES=false` switching them to real endpoints — and its
notifications store was the one full no-op. The convention above is
that behaviour stated as a rule rather than left implicit.

#### Where fixture modules live — RESOLVED
**`apps/portal/src/fixtures/`, grouped by feature** — `fixtures/issue-management/`,
`fixtures/notification/` — mirroring the feature grouping this file already
requires of `services/`.

This closes a placeholder that previously deferred to "01's next revision,
or scaffold time". The constraint that produced the deferral is what
decides it: `kus-pqms` used `src/api/`, which **also** held the domain
types that 02-typescript-standards.md now places in `src/types/` and in
per-feature `types/` folders. Copying that folder wholesale would drag two
concerns into one place; a dedicated folder separates them and needs no
exception from any existing rule.

**Decided here rather than in 01**, deliberately: 01 grants the general
permission ("any category folder name may exist at multiple nesting
levels — the path itself disambiguates scope") and stops. Fixture data is
a data-layer concern, and this file owns the data layer — the same
reasoning by which 02 owns the `types/` path and 07 owns the `pages/`
path rather than 01 owning all three.

**Everything 26-test-data-fixtures-and-test-scope.md requires of a fixture
applies to these modules**, including the rule that the *same* modules
serve fixtures mode and the test suite. Two sets drift, and the drift
surfaces as "it works in the app but the test fails".

### Testing note
Mocking these API calls in tests uses MSW, per 10-testing-standards.md.
See that file for the MSW setup — not restated here.

### The transport / domain split, and `.mappers.ts`
This file describes a services-and-mappers layer. The prior repository ships a
sharper version of it, audited in `../analysis/vue-baseline-audit.md`, and the
sharper version is the one to build.

**Two layers, not one:**

| Layer | Responsibility | Knows about |
|---|---|---|
| **Transport** | one module per backend resource; issues the request, returns the wire shape | the HTTP client, URLs, query params |
| **Domain** | `X.service.ts` + `X.mappers.ts`; translates wire to domain and back | domain types only |

**`X.mappers.ts` is a file kind.** Every wire-format-to-domain translation lives
in one, sibling to the service that uses it, and **it is where the tests go** —
a mapper is a pure function over a fixture and is the cheapest meaningful test
in the codebase. In the prior repository `issue-detail.mappers.spec.ts` exists
and the service it serves has no spec of its own, which is the right ratio.

**Status vocabulary gets its own module.** 02-typescript-standards.md ratifies
eight statuses and defers wire-format differences "to mappers". The concrete
form of that deferral is a dedicated `issue-status-vocabulary.ts` — wire values,
display values, and the mapping between them, isolated from both transport and
components, so that a backend renaming a status is a one-file change.

**Folder placement differs from the prior repository on purpose.** It has a flat
`src/api/` beside a flat `src/services/`; 01-project-structure-and-architecture.md
groups both by feature. **Keep the layering, move it inside the feature folder.**

### Fixtures — two details the prior implementation earned

#### The predicate is a function, never an exported constant
```ts
export function useFixtures(): boolean { /* reads import.meta.env here */ }
```

**A constant freezes the value at import time and silently ignores a spec's
`vi.stubEnv`** — which makes a live-branch test pass for the wrong reason. That
is a real trap, it costs an afternoon, and it is invisible in review because the
test is green. The predicate must read `import.meta.env` per call.

#### It centralises the reading, not the decision
Each consumer still branches locally. That keeps *which call sites have
migrated* visible in the code, and makes each cutover revertible on its own. A
single global switch does the opposite: it looks tidier and makes a partial
migration unobservable.

#### The default direction is deliberately the opposite of the prior repository
The prior portal defaults **fixtures ON** — only the literal string `"false"`
opts out, so a missing or misspelled value falls back to the safe path.

**This corpus specifies the opposite: the predicate fails closed.** A fresh
clone with no `.env` gets real mode, therefore real authentication, therefore
nothing rendered.

Both defaults are safe; they are protecting different things. The prior one
protects a developer from a backend that is not running. This one protects
production from an **authentication bypass reached by forgetting a variable** —
because here the same flag gates data *and* identity, which it did not there.

**The direction does not change.** But it means every developer arriving from
the prior repository sees a blank screen and concludes the app is broken, so
19-onboarding-and-dev-workflow.md must say the default *reversed*, not merely
what the default is.

### Binary responses and downloads — owned here
BRD-committed Excel export means the app receives bytes the server produced and
has to put them on disk. That is a transport concern and nothing else claimed
it.

**One helper, app-wide**, taking a `Blob` and a filename. Two rules from the
prior implementation, both learned the hard way:

- **Revoke the object URL immediately after the synthetic click.** The browser
  has taken its reference by then; leaving it alive pins the whole blob in
  memory for the life of the document.
- **It is content-type agnostic.** The prior repository's version was
  xlsx-shaped by name and default filename, and had to be generalised the moment
  a second caller (evidence download) appeared. Write it generic once.

The filename comes from the server's `Content-Disposition` where one is sent;
a client-invented filename is a fallback, not the design.

### The backend is one Spring Boot service — the topology question is closed

`docs/STACK.md` §7 records the runtime path:

```
CloudFront ─┬─ (static SPA) ─→ S3
            └─ (/api/*)     ─→ API Gateway HTTP API → VPC Link → ALB → ECS Fargate (Spring Boot)
```

**One backend, one origin, one base path.** So:

- **One HTTP client, not two.** This file's two-instance design and the
  `notificationApiClient` it names both belong to the three-service topology
  `DEC-08` replaces. Delete the second instance; do not port it.
- **One dev-proxy entry**, not four, and **no ordering hazard** — the prior
  repository's specific-paths-before-`/api` warning has nothing to order.
- **One environment variable.** The target repository already uses
  **`VITE_API_BASE`** (`docs/STACK.md` §3), proxying `/api/*`. That is the name;
  do not introduce `VITE_API_BASE_URL` alongside it. 13-security-standards.md's
  `ImportMetaEnv` inventory records it.

#### A live defect the restructure must not inherit
`STACK.md` §8 item 1: **the Vite proxy defaults to `http://localhost:8080` while
the backend runs on `18080`.** So `/api/*` does not reach the backend locally
until one side is aligned.

**This is not ours to fix unilaterally** — it spans both components. But it is
the first thing a developer hits, it looks exactly like a broken frontend, and
19-onboarding-and-dev-workflow.md's troubleshooting table needs it on day one
with the real error text.

#### Contract source
The API contract comes from the Spring Boot service, not from this corpus. Zod
schemas at the boundary (this file's rule) become **more** important, not less:
they are what turns a backend field rename into a caught error at one seam
rather than `undefined` rendering three components deep.

**MSW ^2.7.5 is already installed** (`docs/STACK.md` §3), so the mocking layer
10-testing-standards.md and 26-test-data-fixtures-and-test-scope.md specify
needs wiring, not adopting.

---

## 06 — Styling and Design Tokens
**Tier:** 1
**Status:** APPROVED — REVISION 7

### Purpose
Styling approach and design-token consumption rules for this app.
Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Approach: Tailwind utility classes only
**Every component in both packages — `ui-library` and `portal` —
styles itself with Tailwind utility classes written directly in JSX.**

Ruled out, in all components and both packages:

- **No CSS Modules.**
- **No BEM**, and no class-naming scheme of any kind.
- **No scoped or co-located component stylesheets.**
- **No component library's own CSS**, theme, or preset — see the scoped
  exception below for the one thing that is allowed in, and what it is
  not allowed to bring with it.

**The "both packages" part is the load-bearing half.** The obvious
failure is not someone reaching for CSS Modules; it is someone
reasoning that a shared component library is a different kind of thing
from an app and therefore deserves its own styling approach. It does
not. One system, both packages, no exceptions by package.

Provenance for why that is stated so flatly: `kus-pqms` ran **two
parallel systems in one monorepo** — BEM plus scoped `<style>` blocks
in `ui-library`, Tailwind in `pqms-portal`. Every shared value then had
two possible homes and a reviewer had two places to look. That is the
specific outcome this rule exists to prevent, and it arrived by
drift rather than by anyone choosing it.

### Scoped exception: headless primitives for complex keyboard interaction
**This section owns the headless-primitive decision.** It is a
deliberate, bounded exception to the no-component-library posture
above — recorded explicitly rather than left as a quiet allowance,
because an unbounded version of it would dissolve the Tailwind-only
rule entirely.

#### Why an exception exists at all
Three grounds, in order of weight:

- **FR-ENT-005 is a committed contractual requirement, not a WCAG
  inference.** BRD/NPQMS-ISM-customized-BRD.md (C1.0, draft for
  ratification, 2026-08-20), FR-ENT-005, states: "Classification fields
  shall be searchable comboboxes with type-ahead, fully
  keyboard-operable (arrow keys, Enter, Escape) and screen-reader
  accessible." (Retires the prior citation to BRD v1.3's NFR-08.)
- **An accessible listbox is where hand-rolled implementations go
  subtly wrong.** Roving focus, `aria-activedescendant` tracking,
  typeahead, Enter/Space/Escape semantics, and correct screen-reader
  announcement are individually simple and collectively easy to get
  almost-right. Against a contractual requirement, "almost" is the
  wrong risk to accept.
- **Per 11-accessibility-standards.md, the a11y lint rules start at
  `"error"`.** A half-correct hand-rolled implementation therefore
  **fails the build**, not a warning someone triages later — the
  component cannot ship until the keyboard interaction is actually
  complete.

#### 1. Which primitive library
**Recommendation: React Aria — `react-aria-components`** (Adobe).
Justified against this project's specific constraints:

- **Explicitly unstyled.** Its own documentation states: "React Aria
  does not include any styles by default." Nothing about visual output
  is imported, so the rule above still governs everything visible.
- **First-class Tailwind support, on the right major version.** Adobe
  ships `tailwindcss-react-aria-components`, a plugin turning state
  data-attributes into short modifiers (`selected:` rather than
  `data-[selected]:`), documented as compatible with Tailwind v3 **and
  v4** — v4 being what this project's `@theme` approach requires.
- **It matches the specific mechanism 11 specifies.** 11 requires
  `aria-activedescendant` tracking for `BaseSelect`; React Aria's
  collection components implement that model rather than moving real
  DOM focus. Choosing a primitive whose focus model differs would put
  06 and 11 in conflict before a line is written.
- **Accessibility is the library's entire premise** — behavior, ARIA
  semantics, internationalization, and keyboard handling across a
  large set of patterns, from a team whose output is the reference
  implementation for several ARIA patterns.

Candidates considered and not chosen: **Radix Primitives** (mature and
widely used, but its stewardship changed hands and per-component update
cadence has reportedly slowed; several React 19 render-loop issues were
reported and fixed during 2026) and **Base UI** (MUI's primitive layer,
actively maintained but younger and less battle-tested for this
purpose). Neither is disqualified. If the verification items below go
badly for React Aria, Base UI is the first fallback to evaluate — do
not silently substitute one without re-running the checks.

**React 19 compatibility — verified, not blocking.** This was checked
because it looked like a blocker and would have invalidated the
recommendation. It is not one. `react-aria-components@1.20.0` (current
`latest`) declares, verbatim from the npm registry:

```
"react": "^16.8.0 || ^17.0.0-rc.1 || ^18.0.0 || ^19.0.0-rc.1"
```

The `^19.0.0-rc.1` comparator looks like it excludes React 19 stable.
It does not. Tested against npm's own bundled `semver` (v7.8.1 — the
resolver npm and pnpm both use), `^19.0.0-rc.1` desugars to
`>=19.0.0-rc.1 <20.0.0-0`, and React **19.2.7 satisfies it** (as do
19.0.0, 19.2.0, and 19.9.9; 20.0.0 does not). A prerelease tag inside a
*range* does not restrict *stable* versions from matching — that rule
applies only when the version being tested carries a prerelease. So the
project's React 19.2.7+ floor installs cleanly, including under pnpm's
strict peer handling, which only objects to peers that are genuinely
unsatisfied.

Two notes rather than open items: third-party claims that React 19
stable fails this range are **wrong** and should not be re-litigated
without running the semver check; and the range's upper bound is
`<20.0.0-0`, so a future React 20 floor bump would need a new peer
range from upstream.

**[PLACEHOLDER — two properties still unverified; confirm at scaffold
time, before the first primitive-backed component is built. Trigger:
React scaffolding begins. Neither is expected to fail, but if one does,
reopen this recommendation rather than working around it.]**
- **Whether any CSS ships.** The documentation's "no styles by default"
  claim is quoted above and is a primary source, but the package's
  `sideEffects` field is `["*.css"]`, which at minimum means CSS files
  exist in the published artifact. These are not necessarily in
  conflict — but confirm no stylesheet import is required, because
  importing one would breach the rule this exception is scoped against.
- **Bundle cost.** Not measured. Relevant to
  12-performance-guidelines.md's budgets (300KB gzipped initial — the
  BRD's `NFR-P-012` figure — and 150KB per-route chunk) and to the barrel question in
  14-code-style-and-linting.md — see "What this changes elsewhere"
  below.

#### 2. Which components may use it
**This table is a specification, not an audit.** None of these
components exists yet — see
01-project-structure-and-architecture.md's component-specification gap.
Each row says whether that component, **when it is built**, is built on
a primitive or by hand.

The bar is a documented ARIA pattern requiring focus management — not
"a component that would be convenient to build this way":

| Component | Pattern | Build on a primitive? |
|---|---|---|
| `BaseSelect` | listbox / combobox | **Yes — definite, and first.** FR-ENT-005 makes its keyboard behaviour contractual |
| `BaseModal` | dialog | **Yes.** Focus trap, initial focus, and focus restore on close are the primitive's whole job; hand-rolling all three is the classic source of a dialog that traps a screen reader |
| `BaseTooltip` | tooltip | **Probably not.** The requirement (per 11) is `aria-describedby` bound while open, `role="tooltip"`, and triggering on **both** hover and focus — small enough to write correctly by hand |
| `BaseDateRangePicker` | date picker / grid | **Undecided.** Grid keyboard navigation is genuinely complex; assess when the component is specified |
| `BaseTabs` | tabs | **Only if** 03's open choice lands on the compound-component API. The config-driven form does not need one |

**A component not in this table does not get a primitive.** Adding a
row is a decision, not an implementation detail: it requires naming the
ARIA pattern and why hand-rolling it is a real risk.

**Explicitly out**: `BaseButton`, `BaseBadge`, `BaseInput`,
`BaseTextarea`, `BaseCheckbox`, `BaseSwitch`. For the last two, 11
specifies native elements plus native ARIA — a real `<input
type="checkbox">` with a `<label for=…>`, and `role="switch"` with
`aria-checked` on a real `<button>`. A primitive there would add
dependency weight for no accessibility gain, and would replace a
native control that browsers and assistive technology already handle
correctly.

Provenance for two of these rows: in `kus-pqms`, `BaseSelect`'s
keyboard support was **Escape-only** — no arrow keys, no
Enter-to-select, no typeahead — and `BaseModal` had a hand-rolled focus
trap. The first is why `BaseSelect` is the definite case rather than a
candidate; the second is evidence the work is real rather than
theoretical, since someone had already done it by hand once.

#### 3. What remains this file's, unchanged
The primitive supplies **behavior and ARIA wiring only**. Specifically:

- **All styling remains Tailwind utility classes.** No component
  library's own CSS, theme, preset, or styled variants are used — not
  as a starting point, not "just for the dropdown panel."
- **Design tokens still flow through `@theme`**, and the arbitrary-value
  ban below still applies inside primitive-backed components.
- **`cn()` still composes conditional classes** in these components, as
  in every other.
- **The `Base*` naming convention still applies to the wrapper the app
  consumes.** Consumers import `BaseSelect`; they never import the
  primitive directly. The primitive is an implementation detail of the
  wrapper, which means it can be swapped without touching call sites —
  the same seam discipline ADR 0001 applies to auth.

#### Why this is not a hole in the Tailwind-only rule
The Tailwind-only rule exists to keep **visual output under one
system**, so that a colour or spacing value has exactly one source and
a reviewer has one place to look. A headless primitive contributes
**no visual output** — it contributes keyboard event handling, focus
management, and ARIA attributes. Nothing it provides competes with
Tailwind for control of appearance, so the rule's purpose is untouched.

The rule that would be breached is a different one — "no component
library" — and *that* is what this exception is scoped against, which
is why it is bounded by an explicit component table rather than stated
as a general permission.

#### What this changes elsewhere
Recorded here so the consequences are not discovered piecemeal:

- **11-accessibility-standards.md** cites this section for the
  approach and does not restate which library or which components —
  this file owns both. Same ownership topology as the `Base*`/`Pqms*`
  split below.
- **01-project-structure-and-architecture.md**: no boundary breach.
  01's `ui-library` rule bars feature-specific logic, direct API calls,
  and state-management library usage inside base components; a headless
  a11y primitive is none of those. Nor is it an unusual kind of
  dependency for that package — provenance: `kus-pqms`'s `ui-library`
  carried eight runtime dependencies, including a five-package editor
  stack and an icon library, so a primitive is not a new category.
- **14-code-style-and-linting.md**: the open question is whether the
  primitive is "heavy" enough to trigger 14's heavy-dependency barrel
  exclusion — value export moved to a subpath, types kept in the main
  entry — the treatment 14 specifies for `BaseMarkdownEditor`. React
  Aria is tree-shakeable per component, so the likely answer is no, but
  that depends on the unmeasured bundle cost above. **[PLACEHOLDER —
  decide once bundle cost is measured. Trigger: same scaffold-time
  check.]**
- **12-performance-guidelines.md**: the primitive lands in whichever
  chunk its consuming component lands in, and counts against that
  chunk's budget. No new splitting mechanism is implied.

### Design tokens via `@theme`

> **RESOLVED 2026-08-25 — the token VALUE source is the vendored design system.
> See `decisions/0003-the-vendored-design-system-is-the-token-value-source.md`.**
>
> This section describes authoring token values into a `design-tokens` package.
> This repository does not author them: it receives them.
> **`design-system-manifest.json` (156 tokens) is the source of truth for every
> token value**, `src/styles/design-system/tokens/*.css` is a byte-copy of the
> same source, and `src/tokens/tokens.generated.ts` is generated from the
> manifest. A value is changed by **re-vendoring**, never by editing a file here.
>
> Measured: 156 manifest tokens, 156 CSS custom properties, **0** defined in CSS
> but absent from the manifest; `tokens:check` passes; the generated map is
> byte-identical to a fresh regeneration; 1,829 `var(--x)` references across 119
> names, **0 unresolved**.
>
> **This section still governs everything else** — naming, the ordinal scale's
> meaning, semantic mapping, and the rule that a hardcoded value must trace to a
> real source. Only the question "where do the literal values come from" is
> settled elsewhere.
>
> Two carried-forward warnings are unaffected and still bite. **The spacing scale
> is ordinal, not pixel-named**: `--space-4` is 16px and `--space-8` is 32px, and
> nothing in the manifest prevents misreading `--space-8` as 8px. And the
> `@theme`/Tailwind mechanism below **does not exist in this repository** —
> there is no Tailwind; styling is inline style objects plus these custom
> properties.

**`packages/design-tokens` is the source of truth for every design
value.** Two layers, and the separation between them is deliberate:

1. **`design-tokens` emits plain CSS custom properties** in a generated
   `tokens.css` — e.g. `--color-accent-700: #18468F;`. Nothing in this
   layer knows about Tailwind.
2. **The app's entry stylesheet declares a `@theme` block** that maps
   those custom properties into Tailwind's theme, so Tailwind generates
   real utility classes from them — `bg-accent-700`,
   `text-accent-700` — rather than forcing arbitrary-value syntax like
   `bg-[var(--color-accent-700)]` at every call site.

**Why two layers rather than having `design-tokens` emit the `@theme`
block directly**, since that would be fewer moving parts: it would make
the token package consumable *only* by Tailwind. Keeping layer 1 as
plain custom properties means the tokens stay readable by anything —
Storybook, a future email template, a non-Tailwind consumer, plain CSS
in a one-off — and the Tailwind-specific mapping lives in the one place
that has already committed to Tailwind. **The app owns the Tailwind
mapping; the token package stays tool-agnostic.**

Note on provenance, because an earlier revision framed this as "a
bridge, not a pipeline rewrite": in `kus-pqms` the two-layer shape
existed for a weaker reason — `tokens.css` was already generated and
there was no appetite to rewrite a working generator. **That reason
does not apply here**, since nothing is generated yet. The shape
carries forward anyway, on the tool-agnostic argument above, which is
the stronger one. Same design, different justification.

**Never use arbitrary-value syntax for a value that has a real token
equivalent** (`bg-[#18468F]` or `bg-[var(--color-accent-700)]` when
`bg-accent-700` exists once `@theme` is wired up). Arbitrary values are
only acceptable for genuinely one-off values with no token equivalent —
and per 00-core-rules.md, if you're reaching for an arbitrary value,
stop and check whether a token should exist first, rather than assuming
none does.

### The Vue design-system documents are retired as a value source
**`frontend/docs/design-system/` in the prior repository contains a
complete, internally consistent token system** — a 10-step grayscale, 8
status colours, 4 state colours, a 14-step type scale, a 12-step spacing
scale, a 5-step radius scale, 3 elevations, a 12-column 1440px grid, and
4 icon sizes with 24 semantic mappings. It is real design work and it is
still on disk and still reads as authoritative.

**No value in it may be adopted.** Per 00's Source precedence case 3, the
prototype governs visual values, and that document set **disagrees with
the prototype** in at least four confirmed places:

| Concern | The Vue documents say | The prototype says |
|---|---|---|
| Primary action colour | `#002C5F`, "Hyundai Blue" | `#2A6FDB`, accent-500 |
| Button radius | `radius.md` = 8px | ~9px |
| **`--space-8`** | **8px** | **32px** |
| Card elevation | `0 1px 60px rgb(26 26 26 / 0.05)` | `0 1px 2px rgba(5,20,31,.04)` |

The third row is the one that makes this a rule rather than a note. It is
the confirmed instance 00's case 5 already records: **the names matched
and the values differed by 4×.** Adopting that scale on the strength of
its name would have shipped every spacing value wrong.

**What is retained is the *structure*, not the numbers.** The prototype
exports values; it does not tell you there should be twelve spacing steps
or fourteen type styles. So:

- **The Vue documents may be read for the *shape* of a scale** — how many
  steps, what each step is for, what a semantic layer over a palette
  looks like.
- **Every literal is re-derived from the current prototype**, with a
  sourcing comment, per the checklist in "Every hardcoded value gets
  resolved, not written" below.
- **A value copied from those documents without re-derivation is a
  blocking review finding**, not a shortcut.

**One document in that set is worth more than the others and is treated
differently:** `icons.md` names the icon library (now ratified in 00),
gives a size scale, and maps 16 semantic and 8 status icons. The
**semantic** mappings are adoptable as-is — `Plus` for add, `Trash2` for
delete, and so on carry no visual value to drift. The **size** scale is
not (the prototype uses 13–19px inline and 24px nav at ~1.75px stroke,
not 16/20/24/32 at 1.5px), and the **status** mappings are keyed to the
prototype's status set rather than the BRD's, so four of the eight have
no target and four BRD statuses have no icon.

### Token scales are authored whole, not one component at a time
**Author each *scale* completely, in one pass, the first time any
component needs any step of it.**

The incremental method — add the two colours this component needs, move
on — is correct discipline for a first trial component and wrong for a
screen. A screen needs the whole spacing scale before its first layout
decision, and deriving step 5 while building a card guarantees it will
not relate to steps 4 and 6. The token file's job is to make a value
*findable*; a file containing 40 tokens chosen by whichever component was
built first is a file you cannot find anything in.

**One consequence to plan for.** The app's `@theme` block currently
carries one line per token, added per component. A complete spacing scale
adds twelve lines and a complete type scale fourteen. At that point the
block stops being a readable list of what is in use and becomes a mapping
table — **group it by scale with a comment per group** when that happens,
or it becomes unreviewable.

### What to author, scale by scale
The list below is the **shape** of the token set — how many scales there
are and what each is for. **Every literal in it is re-derived from the
current prototype**, per the checklist below and 00's Source precedence
case 5. Nothing here is a value.

| Scale | Shape | Notes |
|---|---|---|
| Brand | `kia-midnight` plus hover and active | Already authored. Verify unchanged. |
| Neutral | A full ramp | The current file has 0, 25, 50, 100, 200, 400, 600, 800 — a ladder with gaps. **Author whatever ramp the prototype has, whole.** Do not fill the gaps by interpolation. |
| Accent | 50, 500, 600, 700 | |
| Feedback | `danger`, `warning`, `success`, `info` — each a 500 and a 50 tint | |
| Surface and border | surface, hover overlay, subtle border, default border, focus ring, disabled background, page background | |
| **Status** | One per lifecycle status — **eight**, per the ratified set | See the remap below. This is the one scale that cannot be lifted from the prototype directly. |
| **Severity tier** | Five: Critical / High / Medium / Low / Info | The prototype and BRD `BR-S03` agree on both hues and thresholds. Author directly. |
| Spacing | A step scale on a 4px grid | See the naming trap below. |
| Radius | One value per surface class — control, card, modal, pill | |
| Elevation | Card, card-hover, dropdown, modal | The shadow colour derives from the brand hue; encode it as a token rather than repeating the triplet. |
| Typography | Families (display, body, **mono**), a size/weight/line-height scale, and the uppercase-label style | `--font-mono` is **required** and currently absent: BRD §8.4 mandates monospace for every identifier and numeric. |
| Control heights | sm / md / lg | Gated — see below. |
| Motion | Two durations and one easing curve | 11 caps animation at 240ms; the tokens encode the cap. |
| Breakpoints | **Three, and only three** | 1024 (the usability floor), 1280 and 1600 (the optimisation band), per BRD `NFR-U-008`. A breakpoint token no layout uses is an invitation to build a layout nobody asked for. |

#### The spacing-name trap
Two naming schemes exist and **they are indistinguishable by name while
differing by 4×**: naming by pixel value (`--space-16` = 16px) and naming
by Tailwind-style ordinal (`--space-8` = 32px). This is the confirmed
drift 00's case 5 records.

**Name by pixel value**, and state the convention at the top of the token
file. It is self-describing, and the ordinal scheme already exists in
Tailwind's own scale, which the app consumes directly for utility classes.

#### The status-colour remap — the one place a direct lift is wrong
The prototype's status palette is keyed to the **prototype's** status
set. The ratified set (BRD §9.1) is different. The hues mostly carry
across; the keys do not.

| Ratified status | Nearest prototype status | Confidence |
|---|---|---|
| `OPEN` | Open | High — same name, same meaning |
| `INVESTIGATING` | In Review | Medium — the prior code's own comment labels `review` as "Investigating" |
| `MONITORING` | Monitoring | High |
| `QIR_ESCALATION` | Escalated | Medium — the prior code labels `escalated` as "QIR" |
| `TOP_ISSUE` | *(none)* | **needs a hue** |
| `RESOLVED` | Disposed | Medium — different words, same lifecycle position |
| `OUT_OF_SCOPE` | *(none)* | **needs a hue** |
| `CLOSED` | Closed | High |

Two prototype statuses have **no** ratified counterpart — `Draft` and
`Pending Approval`, both removed by `DEC-01` — and two ratified statuses
have **no** hue.

**Do not reuse Draft's grey for `OUT_OF_SCOPE` and Pending Approval's
amber for `TOP_ISSUE`.** That is exactly the reasoning-by-analogy 00's
case 4 forbids: `TOP_ISSUE` is the highest-urgency state in the
lifecycle, and an amber inherited from an unrelated approval state is not
a decision, it is a leftover. **[PLACEHOLDER — hues for `TOP_ISSUE` and
`OUT_OF_SCOPE`. Trigger: before `BaseStatusPill` is specified. Owner: the
designer, via the prototype.]** Mark both `[UNSPECIFIED]` in the token
file until answered.

#### Control heights are gated by WCAG, and the gate is here
11-accessibility-standards.md makes SC 2.5.8 (Target Size, 24×24 CSS px)
**a token-authoring requirement**: every interactive-control height token
clears 24px, checked while the scale is authored. A height token found
short after components consume it cannot be fixed in one place — raising
it changes the layout of everything built on it.

One known conflict to resolve rather than inherit: the prototype's
generic control scale is 28 / 36 / 44px, while `BaseButton`'s md is 40px
(the real design-system Button's own rendered height) and its sm is 36px,
which coincides with the generic **md** step rather than sm.
18-project-context-and-implementation-status.md records the hypothesis
that the 28px step belongs to the icon-only square-button component
rather than to `BaseButton`. **Resolve when that component is specified;
do not renumber `BaseButton` before then.**

**One value fails the gate outright**: the prototype's icon-button
cluster includes 20px and 22px instances. Any interactive control at
those sizes fails SC 2.5.8 unless its hit area is padded to 24px. That is
a requirement on the eventual icon-button component and it is recorded
nowhere else.

#### Icons
00 ratifies the library. The **semantic** mappings from the prior
repository's icon standard are adoptable as-is — one icon per meaning,
with no visual value in them to drift. The **size** scale is not: the
prototype uses 13–19px inline and 24px nav at roughly 1.75px stroke, not
the prior 16/20/24/32 at 1.5px. The **status** mappings need the same
remap as the colours above.

**Source-channel icons are not in the prior standard and are in the
prototype** — one per channel, always the same one, across list, entry,
workspace and export (BRD §8.4). The `MANUAL` channel has none specified
and needs one.

### Every hardcoded value gets resolved, not written
**Using Tailwind is not the same as being token-clean.** A component can
be entirely Tailwind utility classes and still bypass the token system
completely — `bg-slate-950` is a Tailwind class and it is not a token.

**Three ways to handle a value, and only three:**
- **A token exists for it** → use the token class (`bg-accent-700`).
- **No token exists, but the value is clearly a design-system value**
  (a spacing step, a semantic colour) → **flag it to Yogesh as a
  missing-token gap.** Do not invent a token name, and do not leave the
  literal in place unremarked.
- **The value is genuinely one-off** (a specific pixel offset with no
  broader meaning) → a literal is acceptable, **but document why** in a
  dated inline comment.

**The two failure modes to watch for**, both of which look fine in
review:
- **Raw Tailwind palette classes standing in for tokens** —
  `bg-slate-950`, `text-slate-950` and friends. These pass any
  "is it Tailwind?" check and silently fork the palette.
- **An undocumented literal.** A hardcoded hex with no comment is
  indistinguishable from an oversight six months later, which is how it
  survives.

Provenance: both failure modes were found throughout `kus-pqms`,
including in the two components that were *already* on Tailwind rather
than BEM — being on the right styling system had not made them
token-clean. Its dated-comment convention (`§23 (2026-08-13)`-style) is
the one worth copying, and it is what the third bullet above asks for.

**A third failure mode, not about which of the three ways above a value
takes, but about whether its literal is still correct**: a token value
copied from a prior citation — an earlier revision of this corpus, or
carried-forward `kus-pqms` code — can drift silently out of date against
a regenerated prototype export even when its name still looks right.
00-core-rules.md's Source precedence, case 5, owns this; not restated
here.

**On test coupling**: a consumer test that asserts against a shared
component's class names creates coupling that makes restyling that
component a multi-package change. 10-testing-standards.md's query
priority already prevents this — query by role and label, never by
class. Provenance: in `kus-pqms` seven `ui-library` components had
consumer specs asserting class names or structure from outside the
package, which is exactly the coupling that priority exists to avoid.

### Component naming
`ui-library` components use `Base*` naming — `BaseButton`,
`BaseSelect`, and so on.

The prototype's own design system names the same components without a
prefix (`Button`, `Select`, `DataTable`): those are design-system
labels, and this file governs code naming per 00's source-precedence
rule. See there, not here, for why.

**`Base*` and `Pqms*` are two live conventions covering two different
things — do not collapse them.** The split:

- **Components → `Base*`.** Note that
  `frontend/docs/design-system/component-standards.md` prescribes
  `Pqms*` for *components* (`PqmsButton`, `PqmsInput`, even
  `PqmsButton.types.ts`). **That document is stale on this point — do
  not follow it.** It is called out because it is a real document
  someone will find, and it contradicts this rule directly.
- **Shared variant/state/size types → `Pqms*`**, in
  `packages/ui-library/src/types/` (`variant.types.ts`,
  `state.types.ts`, `size.types.ts`). This convention is **live**, not
  the stale one.

The two are wired together deliberately: **a `Base*` component's own
types alias the shared `Pqms*` vocabulary rather than redeclaring it.**
So `BaseButton.types.ts` contains
`export type BaseButtonVariant = PqmsButtonVariant;` — the shared type
is the single source of the variant vocabulary, and the
component-facing name stays local to the component. Redeclaring the
union in the component's own file is the thing this prevents.

Provenance: `kus-pqms` had at least 12 of these — `PqmsButtonVariant`,
`PqmsTagVariant`, `PqmsPillVariant`, `PqmsBadgeVariant`,
`PqmsInputType`, `PqmsIconSize`, `PqmsDateSelectorMode`,
`PqmsValidationState`, `PqmsSize`, `PqmsSelectionState`,
`PqmsLoadingState`, `PqmsInteractionState` — consumed by `Base*`
components through exactly that aliasing. The names are worth carrying
forward as-is; a new shared type follows the same prefix.

**Both conventions apply.** Do not treat the `Pqms*` type layer as
though it were the stale component convention and rename it — that
breaks the aliasing relationship above for no benefit.

**This section owns the split.** 14-code-style-and-linting.md states
the two prefixes as checkable naming rules and points here for the
reasoning; 01-project-structure-and-architecture.md points here when
listing `packages/ui-library/src/types/`. Neither restates it, so a
change to the split is a change to this section only.

### Component configuration: enumerated variants, not a theme
**A `ui-library` component declares its visual options as literal
unions — variant, size, state — and a consumer configures it by
choosing from them.** There is no theme layer, no style-override prop,
and no consumer-side customization mechanism. The set of looks a
component can have is the set of values in its unions, and that set is
enumerated in the component's specification.

The `Pqms*` shared types above are the mechanism; this section is the
reasoning behind it. `PqmsButtonVariant`, `PqmsSize`,
`PqmsValidationState` and the rest *are* the configuration surface.

**Three reasons for this shape rather than the alternatives:**

- **A theme layer would be indirection with nothing behind it.**
  Material's model exists because Material serves thousands of
  unrelated applications with different brands, and a theme is how one
  library survives that. This library serves **one** app with **one**
  design system, defined by the prototype. A theme contract here would
  be a configuration surface with exactly one configuration, and every
  component would pay for it in complexity while no consumer ever used
  it for its purpose.
- **Enumerated variants are what Tailwind is natively good at.** Each
  variant maps to a fixed set of utility classes, resolved when the
  component is written. Nothing is computed at runtime, nothing is
  injected, and the classes are readable in the source of the component
  that uses them. A theme system puts a runtime lookup between the
  token and the rendered class — the layer the `@theme` token design
  below exists to avoid.
- **It makes the prototype sufficient as a source.** You can read a
  prototype and enumerate what it shows: three button treatments, two
  input sizes, four tag colours. You cannot read a prototype and derive
  a theme contract, because that requires knowing which of the values
  it shows are meant to be configurable and which are fixed, and a
  prototype does not say. This is the reason that matters most in
  practice — it is what lets a component specification be *derived*
  from the prototype rather than invented alongside it.

**Consequence for specification authoring**: a component's variant set
is what the prototype shows and no more. That is stated as a rule about
spec authoring in `PQMS_docs/component-specs/TEMPLATE.md`, which this
section grounds.

### The `className` boundary
**`className` is not part of any `ui-library` component's public API.**
Consumers do not pass classes into a shared component.

**The rule people will want to break, stated as the thing it is**: a
screen that needs a look the variants do not cover **adds a variant to
the component**. It does not style around the component from the call
site.

That is deliberately the more expensive path. Adding a variant is a
change to the design system and is meant to be visible as one — it
lands in the component, in its spec, and in Storybook, where the next
person building a similar screen finds it. A `className` passed from a
call site is invisible in all three places: the design system acquires
a variation that nothing records, and the second screen needing that
same look either re-derives the override or, more often, derives one
slightly different from it. That is how a library ends up with one
component and six looks nobody chose.

Two things follow.

**`cn()` is internal to a library component, not a consumer-facing
mechanism.** It composes a component's *own* classes. The next section
specifies it and previously left unstated which side of this boundary
it belongs on.

**App-level components in `apps/portal` are not bound by this.**
An app component is not a shared API: it has one consumer — its own
screen — and no unknown second call site whose expectations an incoming
class could break. Accepting a `className` there, or writing
conditional Tailwind directly, is ordinary app code. The rule above
exists because a `ui-library` component's call sites are unbounded and
unknown to it, and that reasoning does not transfer to a component with
exactly one caller. Do not over-apply it and end up with screens that
cannot lay out their own children.

### Conditional class composition

Tailwind utility classes don't compose safely via plain string
concatenation or template literals when conditions conflict on the
same CSS property. Two classes targeting the same property (e.g. a
default `bg-white` and a conditional `bg-accent-700` override) don't
resolve by which one appears later in the className string — they
resolve by which rule appears later in Tailwind's COMPILED stylesheet,
which depends on Tailwind's internal ordering, not source order. A
naive `` `bg-white ${isActive ? 'bg-accent-700' : ''}` `` can silently
lose the override.

Use `clsx` for conditional class inclusion logic, composed with
`tailwind-merge` for resolving Tailwind-specific conflicts (deduplicating
competing utility classes so the last logically-intended one wins,
regardless of Tailwind's internal stylesheet order). Wrap both in a
single shared `cn()` utility — the common pattern:

```ts
cn(...inputs: ClassValue[]) => twMerge(clsx(inputs))
```

**Where `cn()` applies**: inside a component, composing that
component's own classes — its base classes, plus whatever its
`variant`, `size` and `state` props resolve to, plus any conditional
class. For a `ui-library` component that is the whole of it, because
per the `className` boundary above no classes arrive from outside.

**An earlier revision of this section ended by describing `cn()` as
what "lets a consumer safely override a specific utility without
fighting the component's own defaults." That is withdrawn** — it
described a consumer-override mechanism the boundary above rules out
for `ui-library`. Where a component in `apps/portal` does accept a
`className`, merging it through `cn()` rather than concatenating is
still correct, and the conflict-resolution reasoning above is exactly
why.

**Both are new dependencies to add** — `clsx` and `tailwind-merge`.
Neither has an antecedent: `kus-pqms` had no need for either, because
Vue's native `:class` binding handled conditional classes and the
compiled-stylesheet ordering problem above does not arise the same way.
So there is nothing to carry forward here; add both, and write `cn()`
once as a shared utility rather than per-component.

### Two scales the table above omits, and one thing to do with all of them
The prior repository's `design-tokens` package has nine value modules. Seven map
onto rows above. **Two do not, and both have real design documentation behind
them:**

| Scale | Shape | Why it is a token scale |
|---|---|---|
| **Grid** | columns, gutter, container max-widths | A layout grid stated in three components is three grids. It also interacts with the three ratified breakpoints — the grid is what those breakpoints switch between. |
| **Logo** | dimensions per placement | The brand mark appears in the header, on the auth screen and in exports at different sizes. Those are values, they are decided once, and they drift the moment they are inline. |

Author both. Neither is large.

### Token values are asserted, not only authored
The prior `design-tokens` package ships a `tokens.spec.ts` — **the token values
are under test.** This file has so far treated tokens as data to author; they
are also data to *assert*, and two of the rules above are mechanically checkable
rather than review-checkable:

- **Every interactive-control-height token clears 24px** (SC 2.5.8). This is
  stated above as a gate applied while the scale is authored. A review catches
  it once; a spec catches it every time, including on the change six months
  later that shaves 2px off `sm`.
- **Every status in the ratified eight has a colour token**, and no token exists
  for a status outside the set. That single assertion is what stops the removed
  `draft` and `pendingApproval` hues surviving as orphans, and what fails loudly
  while `TOP_ISSUE` and `OUT_OF_SCOPE` are still `[UNSPECIFIED]`.

Contrast-ratio assertions on the feedback and status pairs are worth adding at
the same time — they are arithmetic, and 11-accessibility-standards.md's AA
requirement is otherwise enforced only by someone remembering to check.

---

## 07 — Routing and Layouts
**Tier:** 1
**Status:** APPROVED — REVISION 2

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
Router architecture, the middleware/loader division of responsibility,
the layout components and how routes attach to them, the concrete route
tree, and where route-target components live.

**This file owns the route tree**, and three other files depend on it:
08-authentication-and-authorization.md for where its middleware
attaches, 03-react-component-patterns-and-naming.md for where
`ErrorBoundary` is declared, and 12-performance-guidelines.md for the
lazy-loading claim it builds on. A change here is a change to all
three — check them.

### Router: React Router v8, data mode, nested layout routes
**Layouts are parent routes in the tree.** A layout wraps its children
via `<Outlet />`, and which layout a screen gets is expressed by where
that screen sits in the tree — not by a field on the route, and not by
a runtime lookup.

**Do not implement layout selection as a route-metadata field.** A
`meta.layout`-style string resolved against a registry at render time
is flat by construction, and two mechanisms this corpus already commits
to are **non-functional** against a flat structure — not degraded,
non-functional:

- **08's middleware chain nests.** `requirePermission` attaches per
  route and executes root → parent → child, with a child's middleware
  running only after its parent calls `next()`. A flat set of routes
  under one shared slot has no parent/child relationship for that chain
  to walk.
- **03's `ErrorBoundary` resolves by tree position.** It is scoped to
  "the closest such boundary in the route tree above where the error
  occurred". There is no closest-boundary-above when every route sits
  at the same depth.

Provenance for the prohibition rather than the rule: `kus-pqms` did use
a `meta.layout` string looked up in a `layoutRegistry` and rendered by
`App.vue`, giving exactly one layout slot for the whole app. That
worked there because Vue Router offered no per-route middleware chain
and no route-level error boundary — neither mechanism existed to
conflict with it. Both exist here, which is why the pattern is ruled
out rather than carried forward.

### The middleware/loader ownership rule
Neither 05-api-integration-and-data-fetching.md nor
08-authentication-and-authorization.md draws this line, so it is
established here:

**Middleware** — the root middleware and `requirePermission`, per 08 —
handles authentication and authorization only. It decides whether a
navigation is allowed to proceed; it does not fetch or shape any data a
screen displays.

**Loaders**, where a route has one at all, are for route-param
validation and redirects only (e.g. confirming an `:id` segment is
well-formed before the route renders, or performing a redirect like the
`/issues` back-compat case below). A loader is never the place view data
comes from.

**All server state is owned by TanStack Query hooks called from
components**, per 05-api-integration-and-data-fetching.md — never from
a loader. A component's own `useQuery` call is what fetches the issue
record, the notification list, the QIR data, or anything else a screen
displays, regardless of whether that component's route also happens to
have a loader for an unrelated reason.

One direct consequence, stated plainly so it isn't mistaken for a gap:
**most routes in this app have no loader at all.** Given the division
of labour — middleware owns auth, TanStack Query owns data, loaders own
neither — a route needs a loader only when it requires param validation
or a redirect, and most routes in the tree below require neither. A
route with no `loader` is the correct, intended shape of this design,
not something left unfinished.

### The layout components
**These are app-level components in `apps/portal/src/layouts/`,
not `ui-library` components** — so they fall *outside*
01-project-structure-and-architecture.md's component-specification gap,
and this file specifies them. They are also part of the portal shell,
which 01 says starts immediately, so they cannot wait on a later pass.

Three are specified here. Two are not, and that is stated rather than
implied.

#### `DefaultLayout` — the standard app chrome
The layout almost every screen uses. Renders the shared app header,
then the page content inside a `<main>` element carrying
`id="main-content"`.

- **`min-height: 100vh`** — the page grows naturally and the window
  scrolls. This is the normal behaviour.
- **Exactly one `id="main-content"` per rendered page.** This is the
  `<main>` landmark's own id.

  **Not what 11's focus hook targets — an earlier revision of this
  passage said it was.** 11-accessibility-standards.md's route-change
  focus management moves focus to **the new route's main heading**
  (e.g. the page's own `<h1>`), not to this id — 11 was read for a
  claim it does not make. A duplicate `id="main-content"` is still
  worth avoiding: two elements sharing an id is invalid HTML and breaks
  any other consumer that queries by it. That is this file's own
  reason, not 11's.

  **What else this id is for — RESOLVED.** It is the **skip-link
  target**. 11-accessibility-standards.md now owns WCAG 2.4.1 Bypass
  Blocks and requires every layout to render a skip-link, visually hidden
  until focused, pointing here. So this id is load-bearing for two things
  — the `<main>` landmark and the skip-link — and for neither of the
  route-change focus behaviours, which target the page's main heading.

  The earlier revision that called this "the target for skip-links" was
  therefore **right about the id and wrong about its sourcing**: no file
  specified a skip-link at the time, so the claim was unsupported when it
  was made. It is supported now.

#### `FixedHeightLayout` — viewport-locked, internally scrolling
A screen that pins its own header and action row while its body scrolls
independently. Renders the same app header and the same
`<main id="main-content">`, but:

- **`height: 100vh`**, not `min-height` — the layout is exactly one
  viewport tall.
- **`<main>` scrolls internally.** The window itself does not scroll.

**This is a real UI requirement, not a workaround.** A screen that pins
its own chrome while a region inside it scrolls has to have somewhere for
that scroll container to live. Stating it as a requirement matters
because the temptation is to treat it as a variant of `DefaultLayout` and
add a prop.

#### Which screen gets it — RESOLVED, and this file contradicted itself
**Two passages of this file named two different screens, and neither was
right for the N-PQMS ISM port.** Recorded rather than silently corrected,
because both readings were acted on before the conflict was noticed:

- This section previously named **Issue Entry** ("a long multi-section
  form with a persistent action row"), and the route tree below attaches
  `FixedHeightLayout` to `/issue-management/new` accordingly.
- "Layouts: how many, and the registry" below names the **issue list**
  ("the issue list is the screen that needs it", "Use it for the issue
  list").

**Checked against the port on 2026-08-27: neither screen had the property
either passage describes.** `CreateIssueScreen.tsx` contained no
`sticky`, no `position`, no `100vh` and no `overflow` rule.
`IssueListScreen.tsx`'s only internal scroll is its filter drawer, not
the table; the list is pure document scroll with no sticky header.

**⚠️ THAT CHECK WAS RUN AGAINST THE WRONG ARTEFACT, AND HALF ITS
CONCLUSION WAS WRONG. Corrected 2026-08-29.** It read the *implementation*
and recorded the result as a fact about the *design*. Those are different
questions, and this file governs the second one. Re-checked against the UX
prototype (`docs/ux-prototype/PQMS.html`, Issue Entry screen, markup lines
2091–2502 of the unpacked `__bundler/template` payload):

- **Issue Entry DOES have the property, and this file was right about
  it.** The prototype renders a sticky action row —
  `position:sticky;top:42px;z-index:38`, carrying Clear and Register
  Issue — above an internal scroll port, `data-createport` with
  `overflow-y:auto`. That is precisely "pins its own chrome while a region
  inside it scrolls". The port simply had not built it yet.
- **The issue list verdict stands.** Nothing in the prototype contradicts
  it, and it stays on `DefaultLayout`.

So this section's original naming of Issue Entry was correct and was
withdrawn on bad evidence. The reasoning that withdrew it was sound — a
structure signalling a property the code does not have IS worse than its
absence — but it was applied to a premise obtained by grepping our own
source. **An absence in the implementation is evidence about the
implementation, never about the design.** That is the durable lesson here,
and it is why this correction is recorded rather than quietly applied.

**The screen that actually needs it is the Issue Workspace**
(`/issues/:id`), per a requirement from Yogesh, 2026-08-27:

> "Navigating to a Workspace section resets scroll to the top of the
> scrolling region. Only the workspace body scrolls; the page itself
> never does."

That is a genuine viewport-lock: the Workspace shell — breadcrumb, header
card, tab strip, approval banner — stays pinned while the section content
scrolls, which is exactly the "pins its own chrome, scrolls a region
inside it" shape. It also depends on the section child routes this file
specifies: **the scrolling region is the section `<Outlet />`**, so the
layout cannot be attached before the shell/section split exists — there
would be nothing to own the scroll.

**Implementation note that belongs with the requirement.** React Router's
`<ScrollRestoration />` operates on the **window**, so it does nothing for
a scroll container inside `<main>`. The scroll-reset-on-section-change
must be a ref on the scrolling region plus an effect keyed on the section
pathname. Verify it by scrolling a long section and switching tabs, not
by assuming the component did it.

**Two screens use `FixedHeightLayout`: the Issue Workspace and Issue
Entry.** The issue list stays on `DefaultLayout` — its table is document
scroll with no pinned chrome, in the prototype and in the port.

The trigger this passage used to carry — "until one of them grows a real
scroll region" — is **answered for Issue Entry**: the design already
specifies one, so there was never anything to wait for. The rule it
invoked still holds for anything else that might be added here: per
`decisions/0005-no-page-host-layer-in-this-application.md`'s reasoning
applied to layouts, a structure signalling a property the code does not
have is worse than its absence. Note the order that makes it safe — build
the behaviour the design specifies, then attach the layout that supports
it. Attaching the layout to a screen with no scroll region of its own
produces exactly the empty signal 0005 warns about.

**Do not do that — keep it a separate layout.** Provenance for why the
warning is this emphatic: in `kus-pqms`, this behaviour was first
applied directly to the shared default layout, and it **broke Issue
List's scrolling** by introducing a nested scrollbar on every screen
that shared that layout. It was reverted and rebuilt as a separate
opt-in layout. The regression has not happened in this repo and cannot,
as long as the two stay separate — which is the entire reason they are
separate.

#### `BlankLayout` — no chrome
No header, no `<main>` wrapper beyond what the page provides. Used for
the catch-all 404 route, where app chrome around a "not found" message
is noise.

#### `AdminLayout` — specified shape, no routes yet
Exists as a layout route in the tree with **no children yet**. When
admin screens are built they attach here, not under `DefaultLayout`.
Its chrome is **[PLACEHOLDER — whether admin screens need distinct
chrome from `DefaultLayout`, or whether `AdminLayout` is a separate
layout purely for the route-tree branch, is unspecified. Decide when
the first admin screen is specified.]**

#### `AuthLayout` — purpose unspecified; this is a real gap
**No route uses this layout, and no route is specified that would.**
This is not "a layout waiting for its screens" — it is a layout whose
reason to exist has never been established, and it should not be built
until it has one.

The reason for doubt is specific: **this app has no login screen.** Per
08 the entire authentication surface is Entra's own hosted sign-in UI,
reached by redirect — and 11 confirms it, stating that this app never
implements its own credential-entry screen. A layout for a login page
has nothing to wrap.

**What would give it a purpose** — and neither is settled:

- **A redirect-callback route.** MSAL's redirect flow returns to a
  configured `redirectUri`, and 08 specifies
  `handleRedirectPromise()` handling it. If that `redirectUri` is a
  dedicated route (`/auth/callback`), it needs a chrome-less layout —
  though `BlankLayout` would serve. If it is the app root, no route is
  needed at all. **08 now records this as a placeholder** — see its
  "`redirectUri` — unspecified, and it gates the callback route"
  section, which also states the hard requirement that whatever the
  target is, it must be reachable without passing the auth middleware.
- **A signed-out or session-expired screen.** Nothing in this corpus
  calls for one.

**[PLACEHOLDER — do not build `AuthLayout` until a route needs it.
Resolving it requires 08 to specify the MSAL `redirectUri` and whether
a callback route exists. That in turn depends on 08's open question
about whether the browser holds a token at all — if authentication
terminates at a gateway, there is no redirect callback to handle.
Trigger: before auth implementation begins, alongside that question.]**

Provenance: `kus-pqms` had five layout components including `AuthLayout`
and `AdminLayout`, both fully built with zero routes pointing at them.
That is why they appear here at all — but "it existed there" is not a
reason to build something, which is why the two unused ones are treated
differently from the three above.

### Route tree
**The route tree to build.** Route-target names are the thin
`src/pages/` wrapper components per the "Route/page folder convention"
section below, hence the uniform `*Page` suffix — the real feature UI
they render lives under `components/<Module>/<Feature>/`.

Provenance: the paths, the module set, the `/issues` back-compat
redirect and the `/` → `/overview` landing all come from `kus-pqms`'s
router. Two things in that router are **deliberately not carried
forward**, recorded so their absence is not read as an oversight:

- **No `/ui-kit` route.** `kus-pqms` had one — an in-app component
  gallery. It is **redundant here**: per
  01-project-structure-and-architecture.md, Storybook is this project's
  component verification surface, and a second gallery route inside the
  app would be a parallel thing to maintain, ship, and keep in sync.
  Build the Storybook builder instead. If a reason for an in-app
  gallery emerges later, it is a new decision and needs one.
- **No landing page component.** `/` is a redirect to `/overview`, not
  a screen. `kus-pqms` retained an unrouted home-page component from an
  earlier navigation structure; there is nothing to carry forward.

```
Root (pathless root route)
  middleware: [authMiddleware]        ← 08's root-level auth middleware
  [EB]

  /                                  → redirect → /overview

  DefaultLayout (layout route)
    /overview                        → OverviewPage                [EB]
    /qir                             → QirManagementPage           [EB]
    /tsb                             → TsbManagementPage           [EB]
    /notifications                   → NotificationsPage           [EB]
    /issue-management                (parent route)
      (index)                        → IssueListPage               [EB]
      /issue-management/:id          → IssueWorkspacePage          [EB]

  FixedHeightLayout (layout route — SIBLING of DefaultLayout)
    /issue-management/new            → IssueEntryPage              [EB]
                                       middleware: [requirePermission("issue:create")]

  /issues                            → redirect → /issue-management (back-compat)

  AdminLayout (layout route — third sibling, no children yet)
    (no routes)                      → admin screens attach HERE when built,
                                        as children of AdminLayout — never
                                        under DefaultLayout

  BlankLayout (layout route, registered last)
    /*  (catch-all)                  → NotFoundPage                [EB]
```

#### Divergence — the N-PQMS ISM port's actual routes, 2026-08-25

The tree above is the target. **The shipped application differs, and the
differences are deliberate rather than drift.** Recorded so the gap is visible;
**no route was changed to match this file**, because route paths are behavioural
and scope is governed elsewhere.

| This file specifies | The application has | Why |
|---|---|---|
| `/overview` | `/dashboard` | naming only; same screen |
| `/issue-management`, `/issue-management/:id`, `/issue-management/new` | `/issues`, `/issues/:id`, `/issues/new` | naming only; same three screens, same shapes |
| `/issues` → redirect to `/issue-management` | *(no redirect — `/issues` is canonical here)* | the back-compat alias is inverted, so it is unnecessary |
| `/qir` → `QirManagementPage` | **no route** — nav item rendered and disabled | **out of scope**, per `frontend/README.md` |
| `/tsb` → `TsbManagementPage` | **no route** — nav item rendered and disabled | **out of scope**, per `frontend/README.md` |
| `AdminLayout` with no children | `/admin` under the single layout route | one layout exists, not four |
| `/notifications` | `/notifications` | ✅ matches |
| `/` → redirect, `/*` → catch-all | both present | ✅ matches |

**QIR and TSB are the substantive rows, and they are not omissions.** The
README's guardrails name them explicitly as out of scope alongside issue
scoring/severity, EWS/GQIS ingestion and cross-org sharing. The prototype shows
the nav items, so the port renders them **disabled** — which is fidelity to the
design, not an unfinished route. **The README governs scope; this file governs
route shape.** Where they meet, scope wins, and a route this corpus names does
not become in-scope by being named here.

**The naming rows are cosmetic and are not worth a rename.** `/issues` versus
`/issue-management` changes every link, every `useNavigate` call and every
bookmark, in a port whose acceptance test is pixel-fidelity — for no behavioural
gain. If the names are ever unified, that is a deliberate migration with the
back-compat redirect this file already specifies, not a tidy-up.

`AdminLayout` appears in the tree with no children rather than being
omitted, because leaving it out would force whoever adds the first
admin screen to infer where it goes — and the likely wrong guess is
`DefaultLayout`. It is a **sibling** of `DefaultLayout` and
`FixedHeightLayout`, for the same reason those two are siblings of each
other: a screen gets one layout, not two nested ones.

`AuthLayout` is **absent from the tree entirely**, which is deliberate —
see "The layout components" above for why its purpose is unspecified.
If a route ever needs it, it becomes a fourth sibling, never a nested
route.

`[EB]` = `ErrorBoundary: ChunkLoadErrorBoundary`, declared statically on
that route's own config object.

**`[EB]` marks every lazily-loaded route, and only those.** Only a
route's own static declaration can catch that route's own chunk-load
failure, per 03-react-component-patterns-and-naming.md's
"Chunk-load-failure detection" — a boundary inherited from a parent
cannot, because the parent's boundary is reached only after the child's
module has already failed to load.

Three kinds of route in the tree carry no `[EB]`, all deliberately:

- **The layout routes** (`DefaultLayout`, `FixedHeightLayout`,
  `AdminLayout`, `BlankLayout`). Their components are **statically
  imported**, not lazy — see "Lazy loading" below — so they have no
  chunk to fail. The **root route keeps its boundary**, because it is
  the catch-all for everything that bubbles.
- **The two redirect routes** (`/` and `/issues`). No component, no
  chunk. They do have a loader, and a loader can throw — that throw
  bubbles to the root boundary, which exists. Covered, just not by a
  boundary of their own, which would be dead code.
- **The `/issue-management` parent route.** A pathless-content parent
  that only renders an `<Outlet />`; its children carry their own.

Everything with a lazily-imported page component has one.

**The root route exists so the authentication middleware has somewhere
to attach.** 08-authentication-and-authorization.md's root-level
authentication middleware is attached via a route's `middleware` array,
and its `requirePermission` middleware runs as a nested chain that
executes only after its parent's `next()`. A flat set of top-level
siblings gives neither mechanism anything to attach to or nest through;
per 08's own statement of the failure mode, a `requirePermission`
middleware whose parent never ran "reads an empty context and denies
every protected route." The root route is pathless — it contributes no
URL segment and renders only an `<Outlet />` — so it changes no path in
the tree while giving the chain its required root.

**`FixedHeightLayout` is a sibling of `DefaultLayout`, never nested
inside it.** A screen gets exactly one layout. Nested layout routes do
not work that way — a parent layout route and a child layout route
**both** render, the child inside the parent's `<Outlet />`.

Nesting these two would therefore produce, on every Issue Entry
render: two app headers, two elements carrying `id="main-content"` —
invalid HTML, and a defect for any code that queries by that id (11's
own focus-management hook is not one of them: per its "Focus
management on route navigation" section, it targets the page's main
heading, not this id) — and `FixedHeightLayout`'s `height: 100vh`
inside `DefaultLayout`'s `min-height: 100vh` — which is the
nested-scrollbar failure "The layout components" above exists to
prevent. Siblings, not parent and child.

Because the two layouts are now separate branches,
`/issue-management/new` is written as an absolute path under
`FixedHeightLayout` rather than as a child of the `/issue-management`
parent route. **This does not change match priority, and the reason is
worth recording rather than re-deriving, because getting it wrong makes
Issue Entry unreachable** — `:id` would swallow the literal `"new"` and
render Issue Detail with `id === "new"`.

**Route ranking is global across the whole tree, not per-branch.**
Verified against React Router's matching implementation
(`packages/react-router/lib/router/utils.ts`): `flattenRoutes` first
flattens the config into a flat list of branches, each carrying the
**full** path built by `joinPaths([parentPath, relativePath])` — so a
branch's score is computed from its complete root-to-leaf path, not
from its position among siblings. `rankRouteBranches` then sorts
**every** branch against every other by that score:

```
branches.sort((a, b) =>
  a.score !== b.score
    ? b.score - a.score                    // higher score first, globally
    : compareIndexes(/* sibling order */)  // tie-break only
);
```

Sibling order (`compareIndexes`) is consulted **only when two branches
score equal** — its own source comment scopes it to "routes with
identical paths." Scoring weights static segments far above dynamic
ones (`staticSegmentValue = 10` vs `dynamicSegmentValue = 3`), so
`/issue-management/new` (two static segments) outranks
`/issue-management/:id` (one static, one dynamic) by a wide margin.
Different branches, different parents, and registration order are all
irrelevant to that comparison.

Two things that make this hold for the tree above specifically: the
layout routes are **pathless**, so they contribute no segment to either
joined path (both resolve to exactly the two paths compared above), and
the scores differ, so the sibling tie-breaker never engages. **Net: the
static segment wins on specificity, with no dependence on declaration
order** — which means the two can live in different branches safely.

*(An earlier revision left a dangling `Net` on its own line, an editing
artifact that survived three review rounds. Repaired.)*

Provenance, stated precisely: this is verified against the
**implementation** and against React Router's authored routing-concepts
documentation ("Static segments (highest priority)… Dynamic segments…
Splat routes (lowest priority)"; "**Order matters less** — the router
ranks by specificity automatically"; and its own `/teams/new` before
`/teams/:id` before `/teams/*` example, which is this exact case).
`reactrouter.com`'s `matchRoutes` API page and framework routing guide
do **not** document the ranking algorithm, so neither can be cited for
it. Re-confirm empirically when the router is actually built — a
reachability test for `/issue-management/new` is the cheap check.

**Concrete route config**:
08-authentication-and-authorization.md fully specifies the
requirePermission mechanism itself; this file provides the concrete
route-object instantiation against this app's actual paths, layouts,
and lazy imports, which 08 does not include. Per 08's settled design, attaching
the `requirePermission` middleware to a route's `middleware` array *is*
the declaration of the requirement — there is no separate metadata
field alongside it. Provenance: `kus-pqms` declared the requirement in
a `meta.requiresCapability` value read by a global guard — that
metadata field is **not** carried forward; attachment is the
declaration.

The root route and the two sibling layout routes, with `issue-entry` as
the one route that carries a permission requirement:

```ts
{
  // Pathless root: the attachment point for 08's authentication
  // middleware, and the parent whose next() the child chain runs after.
  middleware: [authMiddleware],
  ErrorBoundary: ChunkLoadErrorBoundary,
  children: [
    {
      // No ErrorBoundary: statically imported, so no chunk to fail.
      Component: DefaultLayout,
      children: [
        /* /overview, /qir, /tsb, /notifications,
           /issue-management (+ index, :id) — each page with its own
           lazy import and its own ErrorBoundary */
      ],
    },
    {
      // Sibling of DefaultLayout, not nested inside it. No
      // ErrorBoundary, for the same reason.
      Component: FixedHeightLayout,
      children: [
        {
          path: "/issue-management/new",
          lazy: () => import("../pages/IssueEntryPage").then((m) => ({
            Component: m.default,
          })),
          middleware: [requirePermission("issue:create")],
          ErrorBoundary: ChunkLoadErrorBoundary,
        },
      ],
    },
  ],
}
```

`ErrorBoundary` is set directly on the route object, alongside
`middleware` — both are known before the lazily-imported module ever
resolves, which is exactly the property this needs per 03's
static-declaration requirement.

**An earlier revision of this config set `ErrorBoundary` on
`DefaultLayout` and `FixedHeightLayout` too, contradicting the `[EB]`
legend above. The config was wrong and has been corrected; the legend
stands.** Recorded because the opposite conclusion is reachable — a
layout route *is* the nearest boundary for render errors in its
subtree, which looks like a reason to give it one. Three things make it
the wrong call here:

- **`ChunkLoadErrorBoundary` is chunk-specific.** A statically imported
  layout has no chunk, so on a layout route it is dead code wearing an
  authoritative name.
- **Every page route already has its own.** Nothing in the subtree is
  unprotected, and the root boundary catches anything that bubbles past
  them.
- **A layout-level boundary is actively worse when it fires.** A
  route's boundary replaces that route's own element, so a boundary on
  `DefaultLayout` takes the app chrome down with the error. The
  page-level boundary keeps the header and nav and replaces only the
  page — which is the better failure mode, and the reason per-page
  boundaries are the rule rather than a redundancy.

### Workspace sections are a route segment, not component state
**The Issue Workspace has five sections and BRD `NAV-01` requires the
active one to be addressable**: "every screen is addressable by URL and
deep-linkable… filter state, active section and pagination are
URL-encoded, so a copied link reproduces exactly what the sender saw."
The tree above has `/issue-management/:id` and no way to say which
section.

**The scheme: a child route per section**, with an index route for the
default.

```
/issue-management/:id                 (parent, renders the Workspace shell)
  (index)          → redirect → detail
  /detail          → DetailSection            [EB]
  /investigation   → InvestigationSection     [EB]
  /resolution      → ResolutionSection        [EB]
  /communication   → CommunicationSection     [EB]
  /history         → HistorySection           [EB]
```

**Child routes rather than a search parameter, for three reasons:**

- **A section is a place, not a filter.** A search parameter is the right
  shape for state that modifies what a screen shows; a section changes
  what screen you are on. Filter state on the Issue List is a search
  parameter for exactly the opposite reason.
- **It gives each section its own lazy chunk**, so opening an issue does
  not download the markdown editor that only Communication needs. That
  matters here specifically —
  12-performance-guidelines.md requires the editor to load when its
  section opens rather than when the route does, and a child route is the
  natural boundary for it.
- **It gives each section its own `ErrorBoundary`**, so a failure in
  History does not blank the Workspace header and the other four tabs.

**The tab strip is navigation, not state.** Each tab is a `NavLink` to
its sibling route, which means `aria-current` is correct for free and
browser Back moves between sections — both of which a component-state tab
strip has to reimplement badly.

**Legacy deep links.** Two earlier generations of section keys exist —
see 17-domain-glossary-and-business-context.md's note on
`LEGACY_TAB_REMAP`. **[PLACEHOLDER — whether old Workspace deep links
must keep resolving. If yes, it is a redirect route per legacy key, added
here. Trigger: before the Workspace shell ships. Owner: PQM.]** Decide it;
do not discover it from a support ticket.

### Lazy loading
**Every route-target page component is lazily imported.** No page
component ships as a static import, regardless of how small it is, and
there are no named chunks and no prefetch hints.

**Layout components are the exception, and they are static.** A layout
wraps every navigation within its branch, so it is needed on the first
render and every render after — lazily loading it buys nothing and adds
a loading state on every entry to that branch. So in the **Concrete route
config** block above, `Component: DefaultLayout` is a static reference
while every page component uses `lazy: () => import(...)`. *(An earlier
revision said "the config below"; that block is above this section.)*

That distinction is why the `[EB]` legend above marks page routes and
not layout routes: only the lazily-imported ones have a chunk that can
fail.

Provenance: `kus-pqms` was 100% consistent on the page-component half —
every route across every route file used
`component: () => import(...)`, with zero named chunks and zero
prefetch hints. That consistency is worth preserving; it is what makes
the chunk-load boundary a uniform rule rather than a per-route
judgement.

#### `splitRouteModules` does not apply to this app — settled, do not re-investigate
React Router v8 promotes `future.v8_splitRouteModules` to a default-on
top-level `splitRouteModules` config option. **It has no effect here,
and it changes nothing about the section above or about
12-performance-guidelines.md's splitting strategy.** Recorded once, with
the reason, so this doesn't get re-opened every time someone reads the
v8 promoted-flags list:

- **It is Framework Mode only.** React Router's own "Automatic Code
  Splitting" page marks it ✅ Framework / ❌ Data / ❌ Declarative. This
  app is **data mode** with an explicit route array (see this file's
  router section, and 03-react-component-patterns-and-naming.md's
  "Given this project's routes are configured as an explicit array (not
  framework-mode file-based routing)"). The feature is not available in
  the mode this app uses.
- **What it splits does not exist here.** It splits the Framework Mode
  route-module exports `clientLoader`, `clientAction`,
  `clientMiddleware`, and `HydrateFallback` into chunks separate from
  the component. This app's route objects have none of those — data
  mode uses `loader`, `Component`, `middleware`, and `ErrorBoundary` on
  a route object, and per "The middleware/loader ownership rule" above
  most routes here have no loader at all.
- **It is configured somewhere this app has no file.** The option lives
  in `react-router.config.ts`, the Framework Mode config consumed by
  the `@react-router/dev` plugin. There is no such file and no reason
  to add one.

So per-route `lazy: () => import(...)` remains the whole of this app's
route-level splitting, exactly as stated above. If this app ever adopts
Framework Mode, this becomes live and both this section and 12 need
revisiting — that is the only trigger.

### Chunk-load-failure handling
This file does not restate the reasoning for how a chunk-load failure
is detected or recovered from — that's fully owned by
03-react-component-patterns-and-naming.md's "Chunk-load-failure
detection" section. What this file owns is only that every
component-bearing route in the tree above references that same shared,
statically-declared `ErrorBoundary` component, per the concrete example
above — not a per-route reimplementation, and not a lazily-exported
`ErrorBoundary` from inside any route's own module. (The two redirect
routes are the sole exception, and only because they have no component
and therefore no chunk to fail — see the `[EB]` legend under "Route
tree" above.)

### Route/page folder convention
01-project-structure-and-architecture.md has zero coverage of where
route files or page components live — confirmed by direct read; it
discusses `components/`, `ui-library` category folders, and
`composables`/`hooks`/`services` grouping, but never a routing or page
folder. Rather than reopening 01 for this, the convention is stated
here:

A `src/pages/` folder holds thin route-target wrapper components —
with the real feature UI living under
`components/<Module>/<Feature>/` — so
`pages/IssueListPage.tsx` renders
`components/IssueManagement/IssueList/IssueList.tsx` and contains no
feature logic of its own.

**The split earns its keep by keeping route concerns out of feature
components.** A page wrapper is where route params, redirects and
layout assumptions live; the feature component underneath can then be
rendered anywhere, including in Storybook, without a router.

Provenance: `kus-pqms` used exactly this split — one thin host component
per route target in `pages/`, real screens under
`components/<Module>/<Feature>/`.

#### The precondition — hosts alone do not deliver the benefit

**The split delivers its stated benefit only in combination with a
callback-props refactor. Adopt both, or neither. Adding hosts alone is
ceremony.**

The justification above is *testable*: "the feature component can be rendered
anywhere, without a router." A host does not by itself make that true. If the
screen still calls `useNavigate` for its own in-screen actions — a row click, an
"Open" button, a post-submit redirect — **it still depends on the router, and the
host has bought nothing.** Making it true means lifting those calls into the host
and passing them down as callback props (`onSelectIssue`, `onCreated`), which is
a **content refactor of every screen**, not a folder move.

So the check before applying this convention is not "do we have `pages/`" but:
**would the screens actually be router-free afterwards, and is there a consumer
that benefits?** A test suite, Storybook, or a second embedding all count. If
none exists, the split is structure signalling a property the code does not have
— and that is worse than its absence, because the next reader sees `pages/` and
assumes the decoupling is done.

**Worked counter-example — the N-PQMS ISM port** (see
`decisions/0005-no-page-host-layer-in-this-application.md`). Seven routes, no
nested sub-routes, one layout route. **One** `useParams` in the whole
application; both redirects already in the route table where this file wants
them. But **six of seven screens call `useNavigate`**, and there is no Storybook,
no test suite and no second consumer. Seven host files would have delivered
nothing, so the convention is deferred there rather than applied.

**Scale is the variable, and it is worth naming.** This convention's provenance
is `kus-pqms`, a **124-SFC** application. That is the size at which route-concern
leakage is a real cost and the indirection pays for itself. At seven routes it is
overhead. The rule is not wrong; it had an unstated floor.

### Route metadata is typed, and the type is closed
The prior repository does this and it is the single most valuable routing
pattern to carry forward. It augments the router's metadata interface with
exactly two fields:

```ts
declare module "vue-router" {
  interface RouteMeta {
    layout?: AppLayoutName;
    requiresCapability?: Capability;
  }
}
```

Two consequences, both of which this corpus wants:

- **A typo in a capability name is a compile error**, not a route that silently
  admits everyone. Given that 08-authentication-and-authorization.md gates on a
  38-row matrix, an untyped string here is a security defect waiting for a
  rename.
- **The set of legal layouts is closed.** You cannot reference a layout that
  does not exist.

**React Router's `handle` is `unknown` by default.** That is the gap. Declare a
single `RouteHandle` interface in the route module, type every `handle` against
it, and read it through one typed accessor rather than casting at each call
site. The accessor is also where the "no `handle` at all" case is decided once.

Keep the field set **small and closed**. The prior repository has two fields
after a year of development. A metadata object that grows a field per feature
becomes a second, untyped state container hanging off the route tree.

### Layouts: how many, and the registry
The prior repository built **five** layouts — `default`, `auth`, `admin`,
`blank`, `fixed-height` — and its own architecture notes record that **only
`default` is wired to real routes; `auth`/`admin`/`blank` exist but are
unused.** That is the more useful lesson than the count: four of five were
speculative, and 01-project-structure-and-architecture.md's rule against
scaffolding ahead of content applies to layouts too.

**One of the five is genuinely load-bearing and has no counterpart here.**
`fixed-height`: a full-viewport shell where the page itself does not scroll and
a region inside it does. That is what a data table with a sticky header and its
own scroll container needs, and it cannot be retrofitted onto a
document-scrolling layout without moving the scroll container — which changes
focus behaviour, sticky positioning and `scrollIntoView` everywhere at once.

**Decide this before the issue list is built**, because the issue list is the
screen that needs it.

> **⚠️ SUPERSEDED — the issue list is NOT the screen that needs it.** Verified
> against the port on 2026-08-27: `IssueListScreen.tsx` has no sticky header and
> no internal scroll region (its only `overflow-y` is the filter drawer), so the
> premise above is false for this application. The screen that needs
> `FixedHeightLayout` is the **Issue Workspace**. See "Which screen gets it —
> RESOLVED, and this file contradicted itself" under "The layout components"
> above, which also records that this passage and that one named two different
> screens. The paragraphs below about scroll-container relocation remain correct
> and are why this is a separate layout rather than a prop — only the choice of
> screen was wrong.
>
> **Amended 2026-08-29 — the issue-list half of this stands, the rest was
> under-stated.** The 2026-08-27 check that produced this note read the
> implementation, not the design, and that is the wrong instrument for a
> question this file governs. Re-checked against the UX prototype, **Issue
> Entry does have a sticky action row and an internal scroll port**, so it
> takes `FixedHeightLayout` alongside the Workspace. The issue list remains
> excluded. Full record in "Which screen gets it" above.

**RESOLVED — a fourth layout, not a variant.**

A prop on `DefaultLayout` looks cheaper and is not, because the two differ in
**where the scroll container lives**, not in styling:

| | `DefaultLayout` | `FixedHeightLayout` |
|---|---|---|
| Scroll container | the document | a region inside `<main>` |
| `<main>` height | content | `100dvh` minus the header |
| Sticky positioning | resolves against the viewport | resolves against the scroll region |
| `scrollIntoView`, focus restoration, virtualisation | operate on the document | operate on the region |

**A boolean prop that relocates the scroll container is not a variant.** Every
child that positions, scrolls or restores focus behaves differently under it,
and the difference is invisible at the call site — which is the failure mode a
separate, named layout prevents.

Use it for any screen that owns its own scroll region — the Issue Workspace and
Issue Entry today; a table with a sticky header, a split pane or a chat-style
timeline would qualify equally. Everything else stays on `DefaultLayout`.

**Attach it to a screen only once that screen actually has its own scroll
region**, and build the two together. Retrofitting means moving the scroll
container under components that already assumed the document, and attaching it
to a screen that has no such region signals a property the code does not have —
which is the failure `decisions/0005` names.

#### The registry, and why it is not a `switch`
Where layouts are selected by metadata rather than by nesting, the mapping is a
single object asserted against the closed name union:

```ts
export const layoutRegistry = { /* ... */ } as const satisfies Record<AppLayoutName, Component>;
```

`satisfies Record<Name, Component>` makes **adding a name without a component a
compile error**, which a `switch` with a `default` branch does not. Use the same
construction for any other closed name-to-component map.

### `pages/` holds hosts; screens are components
This file reserves the `Page` suffix for `src/pages/`. The prior repository
states the rule this reservation comes from, and the rule is the useful half:

> `pages/` holds thin route hosts. `components/` holds all real UI — including
> every feature screen. A feature module has exactly ONE host page; its screens
> live under `components/<Module>/<Feature>/` and are wired as nested child
> routes.

So a screen component **drops** the `Page` suffix — it is a component, not a
page — and a module gets exactly one page file no matter how many screens it
has. That is why `pages/` stays a readable map of the route surface instead of
becoming a second component folder.

Mapped onto this corpus's feature-folder structure: the host is the route-level
element, the screens are its children, and both live in the feature folder
except the one thin host that lives in `pages/`.

### Relaxing this file's own rules — the shape of a permitted exception
The prior repository routes four top-nav modules when only one is built; the
other three render a "coming soon" empty state. Its architecture document does
not hide this — it names it:

> This intentionally relaxes the repo's usual *"no speculative/placeholder
> feature routes before the feature exists"* rule — **for top-nav targets
> only**, so all four nav links resolve cleanly. When a module is built, replace
> its stub page's body — keep the route `name`. Do **not** create speculative
> routes for anything that isn't a visible top-nav destination.

**That is the template for relaxing any rule in this corpus**: name the rule,
scope the exception narrowly, say what it buys, and say what closes it. An
exception written that way is reviewable. "We made an exception" is not.

### Navigation is data
Nav items are a configuration array filtered by capability — not markup, and not
a component that hard-codes four links. It is the same capability model
08-authentication-and-authorization.md defines, applied to visibility, and it is
what makes a fifth module a one-line change. 01-project-structure-and-architecture.md
owns where the array lives.

---

## 08 — Authentication and Authorization
**Tier:** 1
**Status:** APPROVED — REVISION 12

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Context
**This file is a specification, and most of what it specifies has never
been built.** That is unusual for this corpus and worth stating up
front, because it changes how the citations below should be read.

Four kinds of statement appear here, and they carry different weight:

1. **Implemented and working** in the prior Vue implementation of this
   product (repo `kus-pqms`) — the three-role, two-capability model and
   its four call sites, the `?denied=1` redirect, the dev role
   switcher. Cited as provenance, checkable, but **superseded** as of
   this revision by the BRD's real role and permission model (see
   "Permission model" below) — kept in the text only where it explains
   *why* something looked the way it did, not as current design.
2. **Committed customer requirements** — BRD/NPQMS-ISM-customized-BRD.md
   (C1.0, **draft for ratification**, 2026-08-20), §7.1–§7.4 (roles,
   capability role model, authorization matrix, data-scope rules),
   AR-06/DEC-07 (auth architecture) and FR-SEC-011 (the
   resolved-permissions endpoint). Binding regardless of what was
   built, and treated as the current best source for this file even
   while its ratification is pending — see 18's BRD-version entry for
   the draft-status caveat. This retires the earlier BRD NFR-05/NFR-08
   citations, which pointed at a prior draft's numbering.
3. **Prior decision records** — ADR 0001 (interim vs. target package
   placement, migration triggers) and
   `frontend/docs/architecture/security/authentication.md`
   (token-storage preference order, auth-store responsibilities). These
   are decisions already taken, which this file either applies or
   explicitly departs from.
4. **Specified here for the first time, with no prior implementation** —
   the MSAL configuration, the middleware chain, the fixtures-mode auth
   bypass, and the `hasPermission`/`usePermissions` API. These carry
   **no provenance qualifier**, because there is nothing to carry
   forward. They are designs to build and to verify against reality the
   first time they run.

**No longer out of scope**: a finer-grained permission-string model
(e.g. `"issue:create"`-style permissions) was previously deferred as
target-state, pending a stable backend/IdP contract. The BRD's
FR-SEC-011 resolved-permissions endpoint and its named-permission
gating model (§7.2's "the matrix is authoritative, the capability
ordering is not") **is** that contract, at the level this file needs.
See "Permission model" below.

### Protocol
**OIDC Authorization Code Flow + PKCE**, IdP **Azure AD / Microsoft
Entra ID**. Redirect-based flow, **not popup**. The sequence:

```
Redirect to Enterprise SSO → Authorization Code → PKCE Validation
→ Exchange Code → Access Token + Refresh Token → Load User/Permissions
→ Navigate
```

Never Implicit, Password, or Client-Credentials flows. No client secret
in the frontend, ever.

Provenance: protocol, IdP and this sequence are all from ADR 0001 and
`authentication.md` — decided before any implementation existed, and
unchanged here.

### Library
**`@azure/msal-browser` + `@azure/msal-react`** — the official
Microsoft libraries for Entra ID in a React SPA.

**No provenance: this is a first specification.** The protocol and IdP
were decided long before (see above), but no OIDC library was ever
installed in any implementation of this product — so every MSAL detail
in this file, including the token-storage decision below, is being
specified rather than described. Verify each against MSAL's own
behaviour the first time it runs.

### Token storage
- The target/eventual preference (per `authentication.md`) is an
  HTTP-only secure cookie, but this requires backend cooperation (a
  BFF/proxy pattern) that doesn't exist in this interim, still-no-real-
  backend state.
- `@azure/msal-browser` itself only supports `cacheLocation` values of
  `sessionStorage`, `localStorage`, or `memoryStorage` — it cannot set
  an HTTP-only cookie, since MSAL runs entirely client-side.
- **Real decision for this interim implementation**:
  `cacheLocation: BrowserCacheLocation.SessionStorage`. Use MSAL's own
  typed `BrowserCacheLocation` enum, not the bare string literal
  `"sessionStorage"`.
  - **This reverses an earlier in-memory specification, and the
    reversal is deliberate.** An earlier decision record specified
    in-memory storage for the interim. That was written before a
    library was chosen, and it is not implementable alongside the
    redirect flow this file commits to (see the `memoryStorage`
    ground below). **Yogesh has approved this reversal** on that
    evidence. It is recorded here rather than left implicit so that
    nobody reading this file later mistakes it for an oversight, and
    so the earlier record's in-memory clause is not re-applied.
  - **`authentication.md` classifies Session Storage as "Last Option
    (Only if approved)".** That qualifier is acknowledged, not
    sidestepped: this section is the record of that approval, granted
    on the grounds and conditions stated here. It is not a free choice
    among equals.
  - `sessionStorage` reduces silent-refresh frequency to roughly hourly
    (Entra access token lifetime) rather than eliminating silent
    refresh entirely — the Safari-ITP-blocked hidden-iframe path still
    exists, just less frequent than with `memoryStorage`'s
    every-refresh trigger. Do not claim the iframe path is gone.
  - Per-tab scope: `sessionStorage` is not shared across tabs, and
    there is no cross-tab logout (no storage event fires). State this
    as known, accepted behavior.
  - New-tab cold-start is specifically a Safari-ITP problem, not
    universal: on Chrome/Edge, a new tab can typically re-authenticate
    silently against the still-valid IdP session cookie; on Safari, the
    hidden-iframe silent-auth path is blocked, producing a full-page
    redirect instead.
  - **Accepted cost, stated plainly**: `sessionStorage` exposes the
    **refresh token** to XSS — not merely a short-lived access token.
    This is the real tradeoff versus `memoryStorage` and it is accepted
    knowingly, not overlooked. MSAL's own guidance is explicit that
    session/local storage is secure "as long as your application
    doesn't have cross-site scripting (XSS) and related
    vulnerabilities," and recommends `memoryStorage` for anyone who
    remains concerned — a recommendation this app cannot take without
    abandoning the redirect flow.
  - **Condition 1 — strict CSP is load-bearing, not hygiene.** The CSP
    specified in 13-security-standards.md's "Content Security Policy"
    section is what makes the above tradeoff acceptable. Any
    relaxation of `script-src` — in particular any move to
    `'unsafe-inline'` or `'unsafe-eval'` — **invalidates the basis of
    this decision** and must come back here for re-decision, not be
    treated as an independent CSP tweak.
  - **Condition 2 — interim only.** This decision is scoped to the
    current no-real-backend state and is revisited when a real
    backend/Entra tenant lands, at which point the cookie/BFF option
    becomes available and is preferred.
  - **`memoryStorage` is ruled out on structural grounds, not
    preference.** MSAL's own documentation lists `memoryStorage` as
    **not supporting the redirect flow** — the flow already committed
    to earlier in this file. The cause is structural rather than
    incidental: the redirect flow's ephemeral artifacts (the PKCE code
    verifier, `state`, and `nonce`) must survive the full-page
    navigation out to Entra and back, and `memoryStorage` is cleared
    on exactly that navigation. Both former workarounds — cookie
    storage for temporary artifacts, and the `temporaryCacheLocation`
    override — are **deprecated in MSAL.js v4**, so there is no escape
    hatch that would let in-memory storage coexist with a redirect
    flow. In-memory and redirect are mutually exclusive under v4; one
    of the two had to give, and the redirect flow was kept.
- **Set `cacheRetentionDays: 0` explicitly.** MSAL v4 retains
  superseded cache artifacts for **5 days by default** to permit a
  rollback. A default that keeps auth artifacts around for five days
  contradicts a storage decision justified on minimizing the exposure
  window, so it is set to `0` — old cache is dropped immediately on
  upgrade. This is a deliberate value, not a default to leave unset.
- Never `localStorage`, per both the old doc and 00-core-rules.md's
  general sensitive-data handling principle. **MSAL v4's localStorage
  encryption does not change this**: MSAL states the encryption exists
  "to reduce the persistence of auth artifacts, **not** to provide
  additional security," and that a bad actor with browser-storage
  access would hold the key anyway. The ban stands.
- The HTTP-only-cookie preference **remains the eventual target** once
  a real backend/BFF exists — this is a documented future migration,
  not a rejected idea. **Escalation trigger**: if new-tab or
  Safari-redirect friction proves unacceptable in UAT, that triggers
  prioritizing the cookie/BFF migration — not a fallback to
  `localStorage`.
- `ssoSilent`-on-boot with an explicit redirect fallback is part of the
  `authReady` bootstrap sequence — see Route-level guards' "Cold-start
  handling" below.

### Permission model
**BRD C1.0 §7.2–§7.4 supersedes this file's prior 3-role/2-value
design.** The prior model (`SE`/`ASM`/`PQM`, `"read"`/`"override"`) was
`kus-pqms`'s implemented shape, carried forward without a committed
requirement behind it — the BRD NFR-05/NFR-08 citations that used to
back it pointed at a prior draft's numbering and are retired.

Five system roles:

```ts
type Role = "SE" | "ASM" | "PQM" | "ADMIN" | "VIEWER";
```

Provenance: BRD/NPQMS-ISM-customized-BRD.md (C1.0, draft for
ratification, 2026-08-20) §7.2.

**Option A (decided): the frontend does not reimplement §7.3's
authorization matrix (38 rows).** It consumes a resolved-permissions
object from the FR-SEC-011 endpoint — "the current user's identity,
roles and resolved permissions... the authoritative source for
client-side gating" — and checks named permission flags against it.
§7.2 states this directly: "the matrix is authoritative, the capability
ordering is not." A coarse role-ordering gate (the old `hasCapability`
model) is exactly the kind of client-side reimplementation this
forecloses, so it is dropped rather than adapted.

**Hard rule, not implicit:** client-side permission checks are
UI-affordance hints only. Server-side enforcement at the
application-service layer is the actual boundary. The BRD states this
as an enforcement rule and calls client-only enforcement "a blocking
review finding" (§7.3, §18.3). This file's job is to gate what the UI
*offers*, never what the backend *allows*.

#### ASM naming
`ASM` is "After-Sales Manager / Service Engineer Manager" — a
deliberate compound title, not an unresolved ambiguity (BRD Appendix A;
contradiction X-2 in §0.6). The three-way naming conflict this file
previously tracked (BRD stakeholder table vs. HLD role table vs.
`kus-pqms`'s shipped label) is resolved by the BRD's own consolidation:
one capability role model with a normative organisational-role mapping
(Appendix B.1). `ASM` holds override-equivalent authority — in the new
model, the resolved-permissions set the BRD's `override` capability
implies — not a value this file has to re-derive.

### Permission-checking API
Two-tier, serving the same two calling contexts as before, renamed to
match the vocabulary the BRD actually uses:

- **`hasPermission(permissions: ResolvedPermissions, action: string): boolean`**
  — a bare exported function. It takes the resolved-permissions object
  as an argument and **never reaches into a store internally**, which
  is precisely what makes it callable from both contexts below.
- **`usePermissions()`** — a hook that reads the resolved-permissions
  object from the reactive Zustand store and returns `hasPermission`
  bound to the current user, plus named booleans for components that
  need one.
- **`requirePermission`** — the route middleware (see "Route-level
  guards"), which calls `hasPermission()` supplying the resolved
  permissions from the router context, because middleware runs outside
  React and cannot use hooks.

Both check **named permission keys** (e.g. `"issue:create"`), never
enum comparison against a role or a coarse capability value — that
ordering is exactly what §7.2 says is not authoritative.

**[PLACEHOLDER — resolved-permissions response shape.]** FR-SEC-011
commits to the endpoint's existence and its authority, not its exact
TypeScript shape. Do not invent field names as confirmed. A plausible
shape to verify against the real contract once it exists:

```ts
type ResolvedPermissions = {
  role: Role;
  permissions: string[]; // e.g. ["issue:create", "issue:edit:own", ...]
};
```

**Trigger to resolve:** the real FR-SEC-011 API contract landing.
**Owner:** whoever owns backend/API-contract work — the BRD names no
Backend Lead yet (BRD Q7, a G1 blocker).

#### Call sites — build these, and no more
**RBAC threading stays shallow and targeted. Do not add permission
checks to components preemptively "just in case."**

| Call site | Permission checked | Matrix row (BRD §7.3) |
|---|---|---|
| Create-issue button / `issue-entry` route | `"issue:create"` | Create issue: SE/ASM/PQM/ADMIN ✓, VIEWER ✗ |
| ~~Sharing tab config (`useWorkspaceTabs`)~~ | — | **See the note below: this call site probably does not exist under C1.0.** |
| Nav-tab visibility filter (`getVisibleNavItems`) | per nav item | — no navigation item currently declares a permission, so it filters nothing |

Do not describe or test a call site as an access control until its
matrix row is confirmed and server-side enforcement exists behind it —
the client check is the affordance hint, never the control.

##### The Sharing tab: a scope question before a matrix question
An earlier revision of the table above carried a Sharing-tab row with a
placeholder asking *which* §7.3 row it enforces. **That asked the second
question first.**

**BRD C1.0 names no Sharing screen and no Sharing row.** Its Issue
Workspace is **five** sections — Detail, Investigation, Resolution,
Communication, History (§1's proposed solution, §8.1's screen inventory) —
and "Sharing" appears nowhere in §7, §8 or the glossary. The sixth tab
this call site assumed is
17-domain-glossary-and-business-context.md's description of the **prior**
`kus-pqms` six-tab model, which 17 is explicit about describing rather
than committing to.

So there are three possible answers and only one of them is "pick a row":

- **Folded into Communication.** Its "Post an external comment" row is
  already ASM/PQM/ADMIN-gated, which is what the old placeholder's own
  guess pointed at. Most likely.
- **Dropped from Phase 1.** Also fine; nothing depends on it.
- **Still in scope and simply unwritten in C1.0.** Then it needs a matrix
  row *added to the BRD*, not inferred here.

**Do not resolve this by choosing a matrix row.** A row chosen for a
screen that may not exist papers over the scope question underneath it.
**[PLACEHOLDER — does a Sharing surface exist in Phase 1 at all?
Trigger: before the Workspace tab set is implemented. Owner: PQM, via the
BRD.]**

### Token refresh
The refresh **strategy** is now decided: `ssoSilent` on boot (see
Route-level guards' "Cold-start handling" below), `acquireTokenSilent`
for per-request token needs, and `InteractionRequiredAuthError` caught
and converted to a login redirect (see "Two distinct redirect targets"
below) — never left as an uncaught throw.

**All of it is unbuilt, including the wiring.** The strategy above
connects to the HTTP client through the `registerAccessTokenGetter`
seam that 05-api-integration-and-data-fetching.md specifies — and
neither the getter nor the `registerUnauthorizedHandler` handler has an
implementation to register yet.

No provenance: token refresh, expiry detection and silent
re-authentication have never existed in any implementation of this
product. `kus-pqms` declared both seams and registered neither. So
treat this section as a design to verify against MSAL's actual
behaviour, not a description of something that works.

### Auth store (Zustand)
Shape already documented in 04-state-management.md (`currentUser`,
derived `role`/`permissions`, `switchRole` dev-tool kept) — not
duplicated here.

What this file adds is the store's **responsibility boundary**, taken
from `authentication.md`'s target responsibilities list — a prior
decision record, and one that holds regardless of framework:

- **The store holds**: User, Login State, Authentication Status, Roles,
  Permissions, Session Status.
- **The store does not**: call the HTTP client, parse JWTs, or handle
  raw HTTP. Those are MSAL's job and the API client's job
  respectively.

That boundary is what keeps `getState().permissions` a plain readable
field — see "Identity source of truth" below, which depends on it.

### Route-level guards
Two middleware functions: a root-level authentication middleware, and a
`requirePermission` factory attached per route. **Not a loader, not a
wrapper component, and not a route-metadata field** — this is a settled
design, not an open choice.

No provenance for the mechanism: `kus-pqms` used a single global
`router.beforeEach` guard (`capabilityGuard`) because Vue Router
offered no per-route middleware chain. The *outcome* carries forward —
a permission checked before a protected route renders — but the
mechanism below is specified here for the first time, so its
execution-order rules matter more than they would if this were a
translation of something already working.

#### Middleware is default in v8 — no future flag required
This whole section rests on middleware being stable and available
without opt-in, so it is verified and cited rather than assumed. React
Router's own v8.0.0 changelog, under Major Changes:

> "Remove `future.v8_middleware` flag — middleware is always enabled in
> v8 (#15078)"
> - "The `future.v8_middleware` flag has been removed; middleware is
>   now always enabled"
> - "The `context` parameter passed to `loader`, `action`, and
>   `middleware` functions is always a `RouterContextProvider`
>   instance"
> - "The `MiddlewareEnabled` type (previously exported as
>   `UNSAFE_MiddlewareEnabled`) has been removed since the conditional
>   it gated is now unconditional"
> - "The `Future` module augmentation pattern (`interface Future {
>   v8_middleware: true }`) is no longer needed to type `context` in
>   Data Mode"

Concrete consequences for this app, each the opposite of what a v7-era
example would show:

- **Do not add a `future` flag block for middleware.** No
  `future: { v8_middleware: true }` in the router config —
  the flag no longer exists, and setting a removed flag is at best
  noise. 07-routing-and-layouts.md's route tree correctly shows none.
- **Do not add the `Future` module augmentation** to type `context`.
  It is unnecessary in Data Mode, which is this app's mode.
- **Do not reference `MiddlewareEnabled`/`UNSAFE_MiddlewareEnabled`.**
  Removed.
- `middleware` is a plain array property on a route object, per the
  same docs: `{ path: "/", middleware: [authMiddleware], … }`.

`future.v8_middleware` was one of five v7 flags promoted to default in
v8. Any v7-era snippet enabling any of them should be read as obsolete
rather than copied. Middleware is the only one of the five that bears
on this app; the other four are dispositioned here so the list doesn't
invite four separate investigations:

- **`v8_splitRouteModules`** — no effect on this app. Framework Mode
  only, and it splits route-module exports this app doesn't have. Full
  reasoning in 07-routing-and-layouts.md's "Lazy loading" section; that
  is the single record, don't re-derive it.
- **`v8_passThroughRequests`** — no bearing on this app. It stops
  React Router normalizing `request.url` for server-side
  `loader`/`action`/`middleware` (leaving `.data` suffixes and internal
  `?index`/`?_routes` params in place). Framework Mode only, and the
  concern is server request handling — this app has no server, and its
  middleware runs client-side.
- **`v8_trailingSlashAwareDataRequests`** — no bearing on this app. It
  changes the URL format React Router generates for **Framework mode**
  `.data` requests (`/a/b/c.data` → `/a/b/c/_.data`). Framework Mode
  only; a client-side data-mode SPA issues no `.data` requests at all.
- **`v8_viteEnvironmentApi`** — not a runtime concern; it is why the
  Vite 7+ floor exists (see 00-core-rules.md).

All three of the Framework-Mode-only flags above are marked ❌ Data in
React Router's own docs, and this app is data mode. This was checked
rather than assumed, because "probably irrelevant" was also the first
read on middleware — which turned out to be load-bearing.

#### Authentication middleware (root-level)
A root-level React Router v8 middleware function, attached via the
route tree's `middleware` array property, calling MSAL to resolve the
session identity before any child route executes.

#### Authorization middleware (`requirePermission`)
A `requirePermission(action: string)` middleware factory, attached only
to the specific protected routes (or a shared protected-layout route)
that need it — **not** a loader, **not** a generic route-metadata
field. The requirement is declared by which middleware is attached to
which route. (Renamed from `requireCapability`/`Capability` — see
"Permission model" above; the mechanism is unchanged, only the value it
checks.)

#### Execution order
Middleware runs in a nested chain (per React Router's own docs): root
middleware start → parent → child → loaders/actions → child end →
parent end → root end. A child's `requirePermission` middleware only
executes after its parent's `next()` is called — meaning the root auth
middleware **must** call `context.set()` **before** its own `await
next()`, never after, or the child middleware reads an empty context
and denies every protected route.

#### Identity source of truth
Zustand's auth store (per 04-state-management.md) is authoritative.
Root middleware does **not** call MSAL to populate context directly —
it reads `useAuthStore.getState().permissions` (the resolved-permissions
object — see "Permission model" above) and writes that into a typed
router context. This preserves 04's dev-only `switchRole()` working
unchanged, since middleware and the hook both read the same store
instance.

The concrete context API, stated precisely because an earlier revision
of this file described it loosely as "a typed `RouterContext` key":

- **Create** the context object once, at module level, with
  `createContext` imported from `react-router`:
  `export const permissionsContext = createContext<ResolvedPermissions | null>(null)`.
  It is a context *object*, not a string key.
- **Write** it in root middleware: `context.set(permissionsContext, permissions)`.
- **Read** it in `requirePermission`: `context.get(permissionsContext)`.

The `context` parameter handed to `middleware`, `loader`, and `action`
is always a `RouterContextProvider` instance in v8 (per the changelog
quoted above) — middleware receives it, it does not construct one.
Constructing a `RouterContextProvider` directly is for seeding context
in a custom server's `getLoadContext`, which this app has none of.
`context.get()` is the read half that the execution-order rule below
depends on: it is what returns empty if the root middleware has not yet
called `context.set()`.

#### Cold-start handling
Export a module-level `authReady: Promise<void>` from the same
auth-bootstrap module that exports the MSAL `PublicClientApplication`
singleton, resolving once MSAL's `initialize()` +
`handleRedirectPromise()` + an initial `ssoSilent` attempt complete and
the Zustand store is populated. Root middleware's first line is `await
authReady;` before reading `getState()` or calling `context.set()` —
otherwise a hard refresh with an expired token races middleware against
async store hydration and denies every route. The router's own
pending-navigation state covers the UX for this wait — no bespoke
spinner needed.

#### `redirectUri` — unspecified, and it gates the callback route
This file requires `handleRedirectPromise()`, which processes Entra's
return from the redirect flow. **It never says where Entra redirects
to.** That value — MSAL's `redirectUri` — is unspecified, and it
determines whether this app needs a callback route at all.

**The gateway question this was previously blocked on is resolved (see
"Resolved — the browser does hold a token" below): there is no gateway
terminating auth in front of this app, per BRD AR-06/DEC-07, so the
callback question does not dissolve — it needs an actual answer.**

**[PLACEHOLDER — which of the two options below, still open.** Trigger:
before auth implementation begins. Owner: Yogesh, with the client.]**

The two options, per 07-routing-and-layouts.md's `AuthLayout` section:

- **A dedicated route** (e.g. `/auth/callback`) — needs a chrome-less
  layout, and 07's route tree currently contains no such route. Adding
  one is a change to that tree, not a local addition.
- **The app root** — no route needed; `handleRedirectPromise()` runs
  during the `authReady` bootstrap on whatever route the user landed
  on. Fewer moving parts.

**One hard requirement on whichever option is chosen, which neither
file currently states: the `redirectUri` target must be reachable
WITHOUT passing the authentication middleware.** A callback route
sitting behind the auth guard requires the very session it exists to
establish — the middleware would redirect to Entra, Entra would return
to the callback, the middleware would redirect again. That is an
infinite loop, and it is the single most likely way to get this wrong.

Concretely: if the choice is a dedicated route, it attaches **outside**
the root middleware's protected subtree or is explicitly exempted; if
the choice is the app root, the bootstrap must complete before the
middleware's `await authReady` resolves, which the "Cold-start
handling" sequence above already arranges.

**Also note this is an Entra app-registration value, not only code.**
`redirectUri` must be registered against the app in Entra, and the
values must match exactly. Changing it later is therefore a
configuration request to whoever administers the tenant — not a
code-only change — so the cost of choosing wrong is external and slow.
Decide it once, with the client.

The MSAL `PublicClientApplication` singleton is exported from this one
auth-bootstrap module and is the same instance both the root middleware
and `authReady` consume — never a second instance constructed
elsewhere.

**See also**: 07-routing-and-layouts.md provides the concrete
route-tree instantiation of this file's middleware architecture
(`requirePermission` attachment, execution order) — a change to this
file's middleware design should be checked against 07.

For context: **exactly one route currently declares a permission
requirement** — `issue-entry`, requiring `"issue:create"`. Per BRD §7.3,
that row admits SE, ASM, PQM and ADMIN, and excludes only VIEWER — a
real, if narrow, restriction, unlike the prior model's `"read"` gate
that passed for every authenticated role. This governs which routes get
`requirePermission` attached; it says nothing about how the mechanism
works.

#### `issue-entry` requires `"issue:create"` — from the real matrix row
Previously this file argued its way to `"read"` (a gate that restricted
nobody) from BRD NFR-05 prose and an inference about the two-value
capability model. That reasoning is retired along with the model it
supported. The BRD's real authorization matrix (§7.3) states the answer
directly, with no inference needed:

> **Create issue**: SE ✓, ASM ✓, PQM ✓, ADMIN ✓, VIEWER ✗

`VIEWER` is excluded because it is a read-only stakeholder role by
definition (§7.2), not because of any capability-ordering argument. No
other role is excluded — `SE`, the primary Issue Entry user, keeps
access, so this is not a repeat of the old "raising the gate locks out
the primary user" problem; the matrix row itself already reflects that
constraint.

### Fixtures-mode authentication
**This is a blocker on the first screen built, not a documentation
nicety.** The `authReady` bootstrap above gates the root middleware on
MSAL `initialize()` + `handleRedirectPromise()` + an initial
`ssoSilent` attempt, and the root middleware then reads the Zustand
auth store. In fixtures mode there is no Entra tenant to reach, so
without an explicit bypass every authenticated route either hangs on
`await authReady` or resolves to an empty store and denies. That means
**no screen behind a route renders at all** — which is every screen.

#### Two layers, one flag — read this with 05
`VITE_USE_FIXTURES` gates **two independent bypasses at two different
layers**, and they were specified in separate passes. They are one
mechanism and should be understood as one:

| Layer | What the flag does | Owner |
|---|---|---|
| **Identity** | MSAL is not constructed; `authReady` resolves immediately against a seeded identity in the Zustand store | **this file**, below |
| **Data** | Each service function returns fixture data instead of calling HTTP | **05-api-integration-and-data-fetching.md**'s "Fixtures mode" |

They are deliberately symmetrical: **each swaps a source at a boundary
and leaves everything above it untouched.** The identity bypass changes
where the user comes from, not how routing or middleware behave. The
data bypass changes where records come from, not how queries, hooks or
components behave. In both cases the layers above run the same code
they run in production — which is the point, because those layers are
where the bugs are.

Two consequences of that symmetry:

- **Neither bypass is allowed to leak upward.** No `isFixtureMode()`
  check in a component, hook, query, or middleware. If you find
  yourself adding one, the bypass is in the wrong layer.
- **A screen in fixtures mode is fully functional**: real routing, real
  middleware, real permission checks against a seeded identity, and
  realistic data. It is not a degraded mode, and that is what makes it
  usable for building and reviewing screens with no backend.

The rest of this section covers the identity layer only. For the data
layer — including what a service returns, and the one query that is
disabled rather than stubbed — see 05.

#### 1. Fixtures mode bypasses MSAL entirely
No `initialize()`, no `handleRedirectPromise()`, no `ssoSilent`, no
`PublicClientApplication` interaction of any kind. Do not construct the
singleton at all on this path.

`authReady` instead **resolves immediately**, with a seeded identity
already written into the Zustand auth store. The root middleware then
finds a populated store, its `context.set(permissionsContext, permissions)`
writes a real resolved-permissions object, and the `requirePermission`
chain behaves exactly as it does in real mode.

**The middleware architecture is unchanged — only the source of the
identity differs.** There is no second code path through the router, no
conditional middleware, and no fixtures-specific guard. Everything
under "Route-level guards" above applies verbatim in both modes. This
is deliberate: a fixtures mode that skipped the middleware chain would
mean local development never exercises the thing most likely to be
wrong in production.

#### 2. `import.meta.env.PROD` is a hard fuse on the auth bypass
The condition for the fixtures auth path is **both** of:

```ts
isFixtureMode() && import.meta.env.PROD === false
```

**Why the second guard exists**, stated because it looks redundant and
is not: `isFixtureMode()` reads an environment variable, and a
misconfigured environment variable in a production build would
otherwise ship an application **with authentication disabled and a
seeded identity already logged in**. That is the worst failure this
file can produce, and one stray value in a deploy pipeline is enough to
cause it. `import.meta.env.PROD` is not readable from `.env` and cannot
be set by an environment variable — Vite sets it from the build command
itself — so it is a fuse the environment cannot bridge. With both
guards, the fixtures auth path is structurally unreachable in a
production build rather than merely unlikely.

**Only the auth bypass needs this.** The *data* fixtures path does not
take the second guard: shipping fixture data to production is a visible,
recoverable bug, whereas shipping a disabled authentication system is
not. Do not "consistency-fix" the data path to match.

#### 3. The seeded identity must be a complete `AuthUser`
Never a partial object, and never assembled field by field. It is
written through **`setUser()`**, per 04-state-management.md's
single-writer rule — which derives `permissions` from a fixtures-only
`ROLE_PERMISSIONS_MAP` (a local dev-mode substitute for the real
FR-SEC-011 endpoint, not a production data source) and sets both
`currentUser` and `permissions` in the same `set()` call.

A fixtures path that seeds only a role, or writes `currentUser`
directly, bypasses `setUser()` and leaves `permissions` unset. That
produces exactly the silent-deny failure 04's single-writer rule exists
to prevent: the store looks populated, `authReady` resolves, the root
middleware reads `undefined`, and every protected route denies with no
error anywhere. Seed through `setUser()` and this cannot happen.

#### 4. Which identity is seeded by default
**[PLACEHOLDER — role model is settled (BRD §7.2 defines 5 roles: SE,
ASM, PQM, ADMIN, VIEWER); which role local dev defaults to is a
separate, still-open call.]**

The blocker this placeholder previously cited — "role model unsettled"
— is resolved by the BRD. What remains open is narrower: which of the
five roles a fixtures-mode environment should default to for local
development. That is a dev-workflow convenience decision, not a
spec gap, and it doesn't block anything else in this file. (CE/DM
remain separately open — see 18 — but they are not role questions and
don't gate this placeholder.)

**Trigger**: a dev-workflow decision, not a spec resolution.
**Owner**: Yogesh.

**Do not pick a default now.** Choosing which role local development
sees by default is still a real decision — it is the answer every
developer would then build against, which makes it stickier than a
placeholder. The mechanism above is fully specified and can be built;
only the seeded value waits.

### Two distinct redirect targets — do not conflate
- **Authorization failure** (authenticated, permission check fails) →
  `redirect("/?denied=1")`. **Do not invent a dedicated "access denied"
  page** — the query-param redirect is the specified behaviour, and a
  new page is scope nobody has asked for.
  *Provenance: this is `kus-pqms`'s behaviour, unchanged — its
  `capabilityGuard` returned exactly this redirect. It was a
  placeholder there and remains one here; when a real denied
  experience is wanted, that is a decision, not a gap to fill
  quietly.*
- **Authentication failure** (`InteractionRequiredAuthError` thrown by
  `acquireTokenSilent`, or no valid session) → redirect to the Entra
  login flow — a different target. `InteractionRequiredAuthError` must
  be caught inside middleware and converted to this redirect — never an
  uncaught throw that would reach the route `ErrorBoundary`.

### Interim vs. target package placement
**Auth code lives app-level inside `apps/portal`**, with clean
seams so it can later be lifted into a shared
`packages/infrastructure/auth` package without touching call sites.

**Do not build the shared package now.** Extraction happens when a
migration trigger fires: a second app in the monorepo needing auth, the
real backend and Entra tenant stabilising, or micro-frontend work
beginning.

Provenance: this is ADR 0001's decision — placement and all three
triggers — applied unchanged. Note it predates this repository, so
"interim" refers to the state of the product, not to anything about
this codebase's age.

### Explicitly out of scope
These are deliberate deferrals, not oversights, and come from ADR 0001's
own deferred list:
- Multi-tab session sync.
- Silent-refresh-at-80%-lifetime logic.
- **Multi-IdP abstraction.** Deferred, not dropped. The target
  architecture lists "Multiple Identity Providers" among its required
  capabilities; this interim implementation targets Azure AD / Entra ID
  only, with no abstraction layer over the IdP. Recorded here so the
  deferral has somewhere to live.

**No longer on this list**: a fine-grained permission-string model.
This file previously deferred it as unbuilt target-state; the BRD's
FR-SEC-011 resolved-permissions endpoint and named-permission gating
model **is** that model, at the level this file needs — see "Permission
model" above. What remains genuinely unbuilt is the real backend
contract behind FR-SEC-011, tracked as a `[PLACEHOLDER]` there, not the
frontend's consumption of it.

**Also no longer on this list, and this one was a genuine conflict rather
than a supersession: the idle/session-timeout warning dialog.** It is
**in scope and required**. BRD `FR-SEC-005` commits to it in terms:

> The session shall expire after 30 minutes of inactivity, with a warning
> at 25 minutes and an option to extend.

with the acceptance criterion that unsaved entry drafts survive expiry.

**Why this file was wrong and the correction matters more than the
feature.** The deferral came from ADR 0001, which predates the BRD. Per
00-core-rules.md's Source precedence, **the BRD governs behaviour and
these standards govern code shape** — and whether a user is warned before
losing their session is behaviour. A standard cannot defer a committed
requirement out of existence; it can only say how the requirement is
built. This is the only place in the corpus where a standard was found
directly contradicting a numbered BRD requirement, and it is recorded
rather than quietly edited because the *class* of defect will recur every
time the BRD moves.

**What the requirement needs, so the deferral is not simply reversed into
a vacuum:**

- An inactivity timer measured against **user interaction**, not against
  token lifetime. The two are unrelated: MSAL's `acquireTokenSilent` will
  happily keep a token fresh for a user who walked away.
- A warning surface at 25 minutes offering **Extend** — which is an
  interaction, so it resets the timer — and **Sign out now**.
- Expiry routes to the Entra login flow, per "Two distinct redirect
  targets" above. It is an authentication failure, not an authorization
  one; do not send it to `?denied=1`.
- Entry drafts survive, per BRD `FR-ENT-030`…`034`. They are server-side
  per-user records, so this costs nothing extra — but it must be verified
  rather than assumed, because a draft held only in component state does
  not survive a redirect.
- The 30- and 25-minute values are **configuration**, not literals.

**Multi-tab session sync stays deferred and that is now visibly
awkward**, because `sessionStorage` is per-tab (see "Token storage"): a
user with two tabs open gets two independent inactivity timers. Accepted,
and stated so it is a known behaviour rather than a surprise.

### Resolved — the browser does hold a token
**Previously the highest-consequence open question in this file.**
Everything in this file's "Token storage" section assumes the browser
receives and holds tokens — that is what makes `cacheLocation`, XSS
exposure, and the CSP condition meaningful at all. That assumption
depended on whether Kia's SSO infrastructure terminates authentication
at a gateway or reverse proxy in front of this app; if it did, the
application would never hold a token in browser storage and the entire
token-storage decision above would be void, not merely adjusted.

BRD AR-06/DEC-07 resolve this: authentication is **OIDC Authorization
Code + PKCE against the enterprise identity provider, with the token
validated in-process** — "no separate gateway is needed to validate one
token for one application" (AR-06). There is no gateway terminating
auth in front of this app. The token-storage decision above is
**confirmed valid, not voided** — `cacheLocation`, the accepted XSS
cost, and the CSP condition all stand as specified — and MSAL remains
the right library. Also tracked in
18-project-context-and-implementation-status.md.

### Carry the rule, discard the model
The prior repository enforces exactly the indirection this file specifies, and
states it twice — at the top of the auth store and again at the top of the
permissions hook:

> no `role === 'X'`-style literal role comparison is permitted anywhere in this
> codebase outside `ROLE_CAPABILITY_MAP`

Consumers read named capability booleans, never a role string. **That rule is
proven in shipped code and transfers unchanged.** So does 04-state-management.md's
corollary that `role` is derived rather than independently written.

**The model underneath it does not transfer, and porting it shape-first would be
a mistake:**

| | Prior implementation | BRD C1.0 |
|---|---|---|
| Roles | 3 — `SE`, `ASM`, `PQM` | 5 — adds `ADMIN`, `VIEWER` |
| Capabilities | 2 — `read`, `override` | the 38-row matrix |
| Resolution | a static `Record<Role, Capability>` | IdP claims |

The prior `hasCapability()` reduces to `required === "read" || current ===
"override"`, and all four of its permission booleans are that same test written
four times. **A two-level ladder cannot express a 38-row matrix**, and it will
fail first on `VIEWER` — a role that is not "read" in the prior sense but a
strictly narrower one — and on `ADMIN`, which is not the same override that
`ASM` has.

So: **the permission surface is derived from the matrix, not from a hand-written
list of booleans.** A named permission per matrix row, generated or table-driven,
is the shape that survives; four hand-maintained booleans are the shape that
looks fine until the fifth role.

### Build mode as a fuse — used here, and not only here
The prior repository fuses `switchRole()` to throw under `import.meta.env.PROD`,
describing it in the code as "a prototype-only mechanism". This corpus already
requires the same fuse on the fixtures-mode authentication bypass.

**These are two instances of one pattern, and 13-security-standards.md now owns
it.** Anything that exists for local development and would be a vulnerability in
production does not get a comment saying so — it gets a build-mode assertion
that makes shipping it impossible.

### The HTTP client learns about auth; auth does not import the client
The prior `apiClient` exposes `registerAccessTokenGetter()` and
`registerUnauthorizedHandler()` so the auth layer plugs in without the transport
module importing it.

The recorded reason there was sequencing — auth arrived later. **The durable
reason is different and better:** it keeps the dependency pointing one way, and
it makes the HTTP client testable with no identity provider, no MSAL instance
and no token. Register the token source and the 401 handler at bootstrap; do not
import the auth store from the transport layer.

### The browser does hold a token — the topology question is answered

This file carries an open question about whether authentication terminates at a
gateway, in which case the browser would hold no token and there would be no
redirect callback to handle. 07-routing-and-layouts.md defers its `AuthLayout`
placeholder to that same question.

**`docs/STACK.md` §7 answers it:**

> **Auth:** OAuth2 JWT Bearer (JWKS via `oauth2.jwksUri`); API Gateway JWT
> authorizer.

A JWT **Bearer** scheme means the browser obtains a token and attaches it per
request. The API Gateway authorizer **validates** it; it does not mint it and it
does not terminate the flow. So:

- **The browser holds a token.** Every rule in this file about token storage
  applies — in memory, never `localStorage`.
- **There is a redirect callback**, therefore a callback route, therefore
  `AuthLayout` has a consumer. 07's placeholder can close once the redirect URI
  is registered.
- **The HTTP client's `Authorization` header is real**, which is what makes
  05-api-integration-and-data-fetching.md's `registerAccessTokenGetter` seam
  load-bearing rather than speculative.

**What is still open is the identity provider.** This corpus specifies MSAL /
Microsoft Entra. `STACK.md` names a generic JWKS endpoint and an API Gateway
authorizer without naming an IdP, and the backend loads secrets from AWS Secrets
Manager — which is consistent with Entra, with Cognito, or with neither.

**[PLACEHOLDER — the identity provider, and therefore whether MSAL is the client
library. Trigger: before the auth SPEC is planned. Owner: client architect.]**
The distinction matters more than it looks: MSAL is Entra-specific, and if the
IdP is Cognito or a generic OIDC provider then `oidc-client-ts` or the AWS
Amplify auth module is the equivalent — same protocol, entirely different
package, different bootstrap, different token cache.

**The capability model is unaffected either way.** Claims arrive in a JWT
regardless of who issued it, and the no-literal-role-comparison rule above
governs what happens to them.

---

## 09 — i18n and Localization
**Tier:** 1
**Status:** APPROVED — REVISION 2

### Purpose
Internationalization conventions for this React app.

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Library: react-i18next
Use **react-i18next**, wrapping the i18next core. Do not write a custom
i18n implementation or an app-specific wrapper around the library — see
"Runtime consumption" below for the one exception (namespace
registration).

Provenance: the prior Vue implementation of this product (repo
`kus-pqms`, `frontend/apps/pqms-portal/src/i18n/index.ts`) used a thin
wrapper around vue-i18n rather than anything bespoke; react-i18next is
the direct equivalent and the same thin-wrapper posture carries
forward.

### Co-located per-component message files
**One `.i18n.ts` file per component**, holding that component's own
message keys, imported directly by the component:

  ComponentName.tsx
  ComponentName.i18n.ts

**Do not centralize into a single global locale bundle.** Each component
owns its own keys.

Provenance: this was a deliberate, dated team decision in `kus-pqms`
(recorded at `frontend/apps/pqms-portal/src/i18n/index.ts:6` as "team
decision, 2026-07-21", and in `frontend/CLAUDE.md`) — not an accident
or a gap someone failed to centralize. It carries forward as a decision,
not as inertia.

### Pluralization: library ICU variants, never hand-rolled key pairs
Use react-i18next's built-in plural handling — **one key with
count-based variant suffixes** (`_one`, `_other`, and so on) — and pass
the count. The library selects the variant.

  issuesLinkedToast_one: "1 issue linked — linked to this new issue.",
  issuesLinkedToast_other: "{{count}} issues linked — linked to this new issue.",

**Never write separate singular/plural keys by hand.** Provenance:
`kus-pqms` did exactly that (`issuesLinkedToastSingular` /
`issuesLinkedToastPlural`), which is the shape this rule exists to
prevent recreating. The example above is that same message expressed
correctly.

This also matters for the locale that does not exist yet: Korean's
plural rules do not map onto English's singular/plural split, so a
hand-rolled key pair would need Korean-specific branching logic that
the library's variant selection handles for free.

### Interpolation: double-brace placeholders
react-i18next uses **double-brace** placeholders — `{{issueId}}`, not
`{issueId}`. Single braces do not interpolate; they render literally.

Worth stating because it is the most likely defect when transcribing
copy from the prototype or from `kus-pqms`, where vue-i18n's
single-brace syntax was used throughout. A single-brace placeholder
produces a string with visible braces in the UI rather than an error.

### Locale scaffolding
`en` only. **`SUPPORTED_LOCALES` stays `['en']`** and no `ko` key exists
in any messages object until real Korean translation content is ready.

**Do not scaffold empty `ko` keys or objects in advance.** An
empty-string locale risks silently rendering blank UI if
`SUPPORTED_LOCALES` is ever extended before real content exists. Adding
Korean means adding the `ko` key *with* real content at that time, not
filling in a pre-existing placeholder.

### Type shape
`Record<string, Record<string, string>>` — a generic locale→key→string
shape, not a per-component type.

**Settled against the first real component rather than invented.**
`AppHeader.i18n.ts` declares a plain object literal, registers it, and
exports it as default:

```ts
import i18n from "../../i18n";

const messages = {
  en: {
    navOverview: "Overview",
    notificationsNewBadge_one: "{{count}} new",
    notificationsNewBadge_other: "{{count}} new",
  },
};

i18n.addResourceBundle("en", "AppHeader", messages.en);

export default messages;
```

Three things that shape is doing, each of which matters:

- **The namespace string appears exactly once**, in the
  `addResourceBundle` call. The component's `useTranslation("AppHeader")`
  must match it, and a mismatch fails silently — so keeping it to one
  literal per file is the only defence available.
- **Registration is a side effect of import.** Nothing else imports the
  messages; the component imports the file for its side effect and calls
  `useTranslation`. That is why 26-test-data-fixtures-and-test-scope.md
  requires every component test to import the real component module.
- **The default export exists for tests**, not for the component. A test
  asserting on user-facing text asserts against `messages.en.someKey`
  rather than a hardcoded string, so a copy change breaks one place.

Provenance: the generic shape is carried forward from `kus-pqms`
(`frontend/apps/pqms-portal/src/i18n/index.ts`); the registration
mechanism is new here, because vue-i18n's local-scope option had no
equivalent and 09 replaced it with explicit namespace registration.

### Runtime consumption
One named call shape, not an alternative:

- **`useTranslation(componentNamespaceKey)` — ALWAYS called with an
  explicit namespace argument, never bare.** Bare `useTranslation()`
  reads from a shared default namespace, which breaks the
  per-component message isolation this file commits to.
- **Namespace registration**: each `ComponentName.i18n.ts`
  self-registers its namespace as a side effect of being imported, via
  `i18n.addResourceBundle(locale, 'ComponentName', messages[locale])`.
  No separate build-time registry file — consistent with the
  static-import, no-central-bundle convention above.
- **Hard rule**: the namespace string passed to `addResourceBundle` and
  the string passed to `useTranslation()` must be identical — use the
  component's own name exactly (e.g. `'IssueEntry'`, `'BaseButton'`). A
  mismatch **fails silently**, falling back rather than throwing. This
  is a manual-discipline risk worth a lint rule or a thin wrapper
  helper later; it is not solved now.

#### One namespace is not per-component, and it is deliberate
**`ApiError` is a shared namespace**, owned by the single error-message
module that 22-error-handling-and-user-feedback.md requires. It is the
one exception to the per-component rule above.

The reason is that its strings belong to no component: an Appendix E
error code can surface in a toast, in an inline field error, on a 403
route, or in a retry panel, and the message must be the same in all four.
A per-component copy would produce four wordings of one error, which is
precisely the drift the per-component convention exists to prevent
everywhere else.

**Do not generalise from this.** A second shared namespace requires the
same argument — that the strings are genuinely owned by no component —
and "several components use similar words" is not that argument.

Beyond that namespace-registration mechanism, **do not introduce an
app-specific i18n hook** unless a real cross-cutting need emerges that
the library does not already handle. Provenance: `kus-pqms` had no
app-authored i18n hook at all — components called vue-i18n's own
`useI18n({ useScope: 'local', messages })` directly — and that
no-custom-wrapper posture is deliberate.

### Fallback locale
A global fallback to the default locale (`en`). Provenance: carried
forward from `kus-pqms`'s `fallbackLocale: DEFAULT_LOCALE` setup.

### Testing
**26-test-data-fixtures-and-test-scope.md owns the i18n test rules**, and
they exist because this file's registration mechanism has a silent
failure mode. Not restated here; the two that matter most:

- Every component test imports the **real** component module, so its
  `.i18n.ts` side effect runs. A mocked component gets fallback text and
  the test passes for the wrong reason.
- A test asserting on user-facing text asserts against the `en` value in
  that component's own `.i18n.ts`, never a hardcoded string.

### Lazy loading
**None.** Every `.i18n.ts` is statically imported by its sibling
component. Do not introduce lazy-loading complexity speculatively;
revisit only if bundle-size analysis (per
12-performance-guidelines.md) shows a real need. Provenance:
`kus-pqms` had no i18n lazy loading either, and no evidence it needed
any.

---

## 10 — Testing Standards
**Tier:** 1
**Status:** APPROVED — REVISION 5

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
Testing conventions for this app: test runner, coverage gates, file
placement, query priority, API mocking, and automated accessibility
assertions.

### Test runner: Vitest + React Testing Library, Playwright for e2e
Unit and component tests use **Vitest** + **React Testing Library (RTL)**.
End-to-end tests use **Playwright**.

**Jest and Cypress are not used anywhere in this stack**, and neither
is to be introduced. Vitest shares Vite's config and transform pipeline,
so there is one build story rather than two.

Called out because a superseded generic standards draft, at this
exact path, once assumed Jest and Cypress throughout. **That draft no
longer exists at `Frontend-Development-Standards-v1.0.md`, and the
filename is not a reliable pointer to it any more.** Per 00's Precedence
clause, that path now holds this corpus's own generated distribution
document — regenerated, verified, and in agreement with this section,
not in conflict with it. Anyone still holding a cached or linked copy
of the old draft under this filename has stale content regardless of
the path; see 00 for how to tell the two apart. Provenance: `kus-pqms`
used Vitest and Playwright, so the choice here also has a working
precedent rather than being a fresh preference.

### Coverage thresholds
**85 on all four metrics, uniform:**

```
statements: 85
branches:   85
functions:  85
lines:      85
```

**Enabled from the first commit that adds a covered source file — not
ramped.** A ramp sounds prudent and is a trap: a threshold that starts
low has to be raised by someone, at a moment when raising it fails the
build, and that moment never arrives. The number that ships is the
number that was set on day one.

**What makes 85-from-the-start achievable** is the `exclude` list, not
leniency. Config files, story files, spec files, the app entry point and
type declarations are excluded from the denominator (see
20-glossary-and-appendix.md for the block), so scaffolding commits add
no uncovered lines. The first commit that adds real source code is the
first commit that must carry tests — which is the intended discipline,
not a side effect.

**One edge case to handle at scaffold time, not by lowering the
number**: a coverage run with **zero** covered files may report 0% and
fail, or behave oddly, depending on the provider. Verify the behaviour
when the harness is set up and configure around it — for instance by
enabling thresholds alongside the first real source file. **Do not
lower a threshold to get a green build on an empty repo**; that is the
exact move that makes the number permanent.

**Uniform 85 rather than a split floor is deliberate.** Provenance:
`kus-pqms` ran a split floor (85 statements / 78 branches / 80
functions / 85 lines) and it let branch and function coverage drift
downward while statements looked healthy — until a PR failed at 79.82%
functions. It was then raised to uniform 85. Do not reintroduce a split
floor: one number for four metrics removes the ambiguity about which
one is allowed to slip.

**No PR lowers a threshold to pass CI.** If coverage is short, the
missing tests are the work.

### Test file placement: mirrored `src/tests/` tree
Test files live in a **mirrored `src/tests/` tree**, not co-located next
to the component or module they test.

**One convention, no exceptions.** Provenance for why that is stated so
firmly: `kus-pqms` had both patterns running at once — of 125 spec
files, roughly 59% sat in a mirrored `src/tests/` tree, 38% were
co-located beside their component, and 3% beside a non-component source
file. Nobody chose that; it accumulated. The result is that "where is
this component's test?" had no answer you could rely on.

**Expected shape** (extension becomes `.spec.tsx` for a component test,
`.spec.ts` for a non-component module):

```
src/components/IssueManagement/IssueList/IssueList.tsx
src/tests/components/IssueManagement/IssueList/IssueList.spec.tsx

src/pages/IssueListPage.tsx
src/tests/pages/IssueListPage.spec.tsx
```

**Two examples, because there are two kinds of file and an earlier
revision of this section conflated them.** It showed `IssueListPage.tsx`
living under `src/components/…`, which contradicts
07-routing-and-layouts.md's convention: `*Page` is reserved for the thin
route-target wrappers in `src/pages/`, and the real screen underneath
drops the suffix. The mirroring rule is unaffected — whatever the source
path is, the test path mirrors it exactly — but the example was
misleading about which path a screen has.

The path under `src/tests/` mirrors the path under `src/` exactly,
including the full feature-module nesting (e.g. `IssueManagement/
IssueList/...`, `IssueManagement/IssueDetails/tabs/...`).

### Query priority (React Testing Library)
Default preference order, standard RTL guidance — query by what a user
perceives, not by implementation detail:

1. `getByRole`
2. `getByLabelText`
3. `getByText`
4. `getByTestId` (last resort)

#### `data-testid`: the priority order applies uniformly. No pinned values.
**Do not add `data-testid` preemptively to anything.** Query by role,
label, or text. A `data-testid` is added only when an element has no
stable accessible name or role to query by — and adding one is a signal
worth a second look, because an element with no accessible name is
often an accessibility defect rather than a testing inconvenience.

**Seven specific `data-testid` values are deliberately not carried
forward.** `kus-pqms` pinned `header-export`, `result-line`,
`scope-tab-all`, `scope-tab-my`, `scope-count-all`, `toolbar-filter`
and `filter-drawer` as non-negotiable, because its Playwright spec
(`e2e/issue-list.spec.ts`) queried them and dropping one would have
broken e2e coverage silently — no unit test would catch it, since only
the e2e spec exercised those hooks end to end.

**That constraint lapses here, and the reasoning is worth recording so
it is not reinstated by reflex:**

- **The consumer does not exist.** That spec is not being carried
  forward. Pinning seven values with nothing querying them is a
  constraint with no consumer — and one that would then be cited as
  binding by whoever found it.
- **It contradicts the priority order above.** Most of those seven mark
  elements that *do* have an accessible name — an export button, filter
  tabs. Those are `getByRole` targets. Pre-attaching a testid to them
  inverts the order this section just established.
- **The values presume markup nobody has designed.** `scope-tab-all`
  and `scope-count-all` assume a specific scope-tab-with-count control.
  Whether Issue List has that shape is a question for the prototype
  (see 17's Prototype register), not something to fix in advance by
  naming test hooks for it.

**What does carry forward is the underlying rule, which is durable and
applies the moment a real e2e spec exists:**

> Once an e2e spec queries a `data-testid`, that attribute is
> **load-bearing**. Renaming or removing it breaks e2e coverage and no
> unit test will catch it, because the component's own tests pass in
> isolation. So a testid an e2e spec depends on is changed only
> together with that spec.

Which means: when the first Playwright spec is written, whoever writes
it chooses selectors following the priority order — role and label
first, testid only where nothing stable exists — and from that point
those specific testids are pinned by the spec that uses them. The
pinning is real; it just has to be earned by an actual consumer rather
than inherited.

### Mocking API calls: MSW
**MSW (Mock Service Worker)** is the standard for mocking network
requests in component/integration tests. MSW intercepts at the network
layer, so it pairs naturally with TanStack Query (the confirmed
server-state library per 04-state-management.md) — the query client
itself is never mocked; the underlying request is.

MSW handler organization pattern: [PLACEHOLDER — to be finalized during
first real test implementation].

### Automated accessibility assertions — axe in the test run
**This file owns the a11y assertion convention** (it owns test
tooling); 11-accessibility-standards.md cites it and does not restate
it.

**The assertion pattern**: mount the component, run axe against the
rendered element, assert no violations —
`expect(await axe(element)).toHaveNoViolations()`. This runs in the
normal test suite, not as a separate job.

Two setup items, both real work rather than boilerplate:

- **An axe-for-Vitest binding is a new dependency to add.**
  **[PLACEHOLDER — which binding. `vitest-axe` is the obvious
  candidate, but at `0.1.0` it had packaging defects worth checking
  before adopting: an empty `extend-expect` entry and a matcher
  declared as a type-only export, which together meant matchers had to
  be registered per-spec with `expect.extend(axeMatchers)` and cast
  past the broken types. Check whether that is still true, or pick a
  maintained alternative. Trigger: React test-harness setup.]**
- **Register the matcher once via `setupFiles`**, not per spec — unless
  the chosen binding makes that impossible, in which case say so in a
  comment at the registration site.

**Storybook's a11y addon is a second, separate surface.** Wire
`@storybook/addon-a11y` into the Storybook config for manual inspection
during component review. It is not part of the test run and does not
substitute for the assertions above.

Provenance: `kus-pqms` had exactly this arrangement — `vitest-axe` as a
`ui-library` devDependency, `@storybook/addon-a11y` in its Storybook
config, and a single axe spec covering one component (`BaseButton`) as
a seed rather than a suite. The packaging workaround above is quoted
from that spec's own comment.

**Axe assertions are not a staging area for lint.** `kus-pqms` planned
to expand axe coverage first and only then escalate its a11y lint rules
from `warn` to `error`. 11 does the opposite here: those rules **start**
at `"error"`, so remediation happens when a component is written rather
than being deferred behind a coverage ramp. Both surfaces are at full
strictness from the beginning, and neither is waiting on the other.

**Which components get axe coverage is deliberately not specified.**
Whether it becomes a per-component convention or a targeted set of the
interactive ones is a judgement to make once there are real components
to assert against. `kus-pqms` had one, as a seed — not enough to
generalise from.

### Test naming and organization
Standard `describe`/`it` blocks. **One spec file per component or
module** — `IssueListPage.tsx` pairs with exactly one
`IssueListPage.spec.tsx`, never split across several spec files. This
follows directly from the mirrored-tree convention above: a mirrored
path has one destination, so two spec files for one source file have
nowhere consistent to live.

Provenance: one-spec-per-component was already the norm in `kus-pqms`,
so this is the established practice rather than a new constraint.

### The mirrored tree is a choice, and here is what it is chosen against
This file specifies a mirrored `src/tests/` tree. The prior repository, audited
in `../analysis/vue-baseline-audit.md`, runs **both conventions at once**:

| Location | Convention |
|---|---|
| `apps/portal/src/tests/**` | mirrored |
| `apps/portal/src/components/shared/**` | colocated |
| the transport, mapper and format modules | colocated |
| the whole component library | colocated |

That is not a tidiness complaint. It has a measurable consequence:
`sonar-project.properties` declares the mirrored tree as `sonar.tests`, so
**every colocated spec is analysed as production source** — inflating the
measured codebase, polluting duplication and complexity metrics, and applying
production rules to test code. Nobody chose that.

**The rule this corpus adopts: one location, and the quality tooling agrees with
it.** 15-devsecops-and-ci-cd.md's Sonar configuration must list exactly the
location named here. If either moves, both move in the same commit — a
disagreement between them is silent by construction.

**And the choice applies per package, not per file.** The prior library
colocates uniformly and the prior app does not; both are internally consistent,
which is why neither ever got fixed.

### Where 85/85/85/85 came from
This file states the number. The argument behind it is stronger than the number
and belongs here, because the number is what a reviewer under deadline proposes
to relax.

The prior repository ran **split floors — 85/78/80/85** — and recorded in its
own config what happened:

> The split floors this replaces let branch and function coverage drift down
> while statements looked healthy, and the gate finally failed on a PR at 79.82%
> functions. One number for all four removes the ambiguity.

with a measured actual (2026-08-10) of Stmts 92.1 / Branch 85.9 / Funcs 89.0 /
Lines 92.4, and the note that **branch coverage is the tightest of the four** —
so a failure against this gate is almost always an untested conditional, not a
missing test file.

**Split floors were tried in this domain, on this product, and failed.** That is
the answer to "can we drop functions to 80 just for this sprint".

#### The exclusion list
Concrete, and worth adopting as-is rather than rediscovering: story files, spec
files, the test tree itself, `.d.ts` files, any `*.config.*`, and the app entry
point. Nothing else. **An exclusion is a coverage decision** — adding one is a
change to the gate, and it is reviewed as such.

### One sweep beats twenty-six reminders
The prior component library ships `a11y.spec.ts` at the package root: a single
spec that enumerates the barrel and runs axe against **every** component,
alongside a second cross-cutting spec for a specific rendering rule.

This file already requires axe in the test run. **Require it as a sweep.** A
per-component assertion is easy to forget on component 27 and its absence looks
identical to a component that has no accessible surface; an enumerating sweep
cannot be forgotten, and a new component is covered the moment it is exported.

The same construction is worth reusing for any rule that must hold across a
whole category — token contrast, required display names, story presence.

### The client's coverage gate is 90/90/90/80 — reconciling it

The target repository already enforces, per `docs/STACK.md` and `TEAM-GUIDE.md`
§5: **90% lines, functions and statements; 80% branches** (Vitest v8 provider).
This file specifies a uniform **85/85/85/85**.

**Do not simply adopt one and delete the other.** They disagree in two
independent ways, and only one of them is a real conflict.

#### The height is not the conflict — 90 is above 85, and 90 wins
A floor of 90 satisfies everything this file requires. **Adopt the client's 90.**
Lowering a working gate to match a document is the wrong direction, and
15-devsecops-and-ci-cd.md's ratchet only ever moves up.

#### The **split** is the conflict, and this corpus has evidence
Branches at 80 while everything else sits at 90 is exactly the shape the prior
repository ran — 85/78/80/85 — and recorded the outcome of:

> The split floors this replaces let branch and function coverage drift down
> while statements looked healthy, and the gate finally failed on a PR at 79.82%
> functions.

Its measured actual after moving to a uniform floor was Stmts 92.1 / **Branch
85.9** / Funcs 89.0 / Lines 92.4 — with branch coverage the tightest of the
four, which is precisely why a lower branch floor is the one that gets
consumed. **A ten-point gap on the metric that binds first is a ten-point
licence to leave conditionals untested**, and untested conditionals are where
role-gated and status-gated behaviour lives in this product.

#### The resolution
**Keep 90 on the three; raise branches to 90 on a ratchet, not in one commit.**

| Step | Branch floor | Trigger |
|---|---|---|
| Today | 80 (the client's value, unchanged) | — |
| Measure | record the actual branch percentage in Phase 0 | baseline |
| Ratchet | floor = measured actual, rounded down; fails on any drop | Phase 1 |
| Target | **90, uniform with the other three** | when the ratchet reaches it |

If the measured actual is already above 80, **the client's gate is not
protecting anything today** and raising the floor to the actual costs nothing —
which is the usual case and worth checking before proposing anything harder.

**Record the target and the reasoning in the Vitest config itself**, next to the
numbers, per 14-code-style-and-linting.md. A floor with no recorded destination
is a floor nobody will ever raise.

#### Also already present
**MSW ^2.7.5 is an installed dependency.** Testing Library ^16.3.0 and Vitest
^4.1.6 likewise. Nothing in this file needs adopting — it needs wiring.

---

## 11 — Accessibility Standards
**Tier:** 1
**Status:** APPROVED — REVISION 5

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
The WCAG target and conformance scope for this app, the ARIA and
keyboard behaviour required of the shared components, the lint
configuration that enforces it, and route-change focus management.

### Target: WCAG 2.2 AA
**WCAG 2.2 AA.** Not 2.1 AA — a generic standards draft and some early
internal notes assumed 2.1, and that is the version to correct on sight.

Provenance: 2.2 AA is not a bar this corpus raised. It was already the
stated target in two independent places in `kus-pqms` that agreed with
each other — `frontend/docs/design-system/accessibility.md` ("Target
Compliance: WCAG 2.2 AA") and `frontend/eslint.config.js`'s own comment
above the a11y rules ("WCAG 2.2 AA target,
docs/design-system/accessibility.md").

**Contrast ratios are identical in 2.1 and 2.2** — 4.5:1 normal text,
3:1 large text, 3:1 UI components and graphical objects. The version
number changes nothing about contrast; only the six criteria 2.2 adds
(below) are new obligations.

### Module scope
The modules in scope are **Overview, Issue Management, QIR, TSB,
Notifications, Admin** — the six that 07-routing-and-layouts.md's route
tree defines. That tree is the source; a module added there is in scope
here without this section being edited.

An older accessibility document listed a different set ("QIR, CAPA,
Issue Management, Publication Management, User Management,
Administration, Analytics"). Two of those names are handled
differently, and the difference matters because it is not one defect
class — per
17-domain-glossary-and-business-context.md's investigation:

- **CAPA is unconfirmed — not proven fabricated, and not written
  against.** It appears in a real target-architecture document and has
  zero text match across the BRD, DRD and HLD. 17 explicitly declines
  to call it fabricated, keeping "planned business scope not yet
  captured in these artifact versions" open alongside the
  placeholder reading. An earlier revision of this file overstated 17
  as "confirmed fabricated" and equated CAPA with the superseded draft
  standards document's "Module B (Task Management)" invention — **that
  equation does not hold**, and the correction stands: Module B had no
  source anywhere, CAPA has a source and an open question.
- **Publication Management is not a missing module — it is covered
  under other names.** Its function sits inside TSB and inside Issue
  Detail's Resolution tab, both of which are in scope above. It is not
  grouped with CAPA. Provenance: `kus-pqms` had a real `tsb` route and
  a `RelatedPublicationSection.vue` in the Resolution tab, which is why
  the older list's separate "Publication Management" entry reads as a
  naming difference rather than a gap.

**The rule this section applies**: accessibility requirements are
written against a screen someone can describe. CAPA cannot be
described, so nothing is written against it — and that holds whether it
turns out to be future scope or a placeholder. When it is defined, it
comes into scope through 07's route tree like any other module.

### WCAG 2.2's new criteria beyond 2.1
Six criteria, each stated against this app's own components rather than
listed as a version-bump footnote. Three are live requirements now;
three are standing requirements that attach to a feature the moment it
is introduced.

- **2.4.11 Focus Not Obscured (Minimum)** — **live, and this app has a
  structural reason to fail it.** `BaseDataTable` is expected to have
  sticky headers, and possibly sticky columns (its column API is an
  open specification — see
  03-react-component-patterns-and-naming.md). A sticky header or column
  painted over the cell that currently has focus, as the user tabs
  across a wide table, is precisely the failure this criterion
  describes. **Requirement**: whatever scroll-and-sticky implementation
  `BaseDataTable` ends up with is verified against this criterion by
  keyboard, before the component is considered done — tab across and
  down until focus passes under each sticky region. Provenance:
  `kus-pqms`'s table had sticky headers and columns and was never
  checked against it, which is why this is written as a named
  verification step rather than left to general diligence.
- **2.5.8 Target Size (Minimum, 24×24 CSS px)** — **live, and it is a
  token-authoring requirement, not a component one.** Every
  interactive-control height in `design-tokens` — control heights,
  icon-button sizes, checkbox and radio hit areas — is at least 24 CSS
  px. **Check this while the token scale is being authored.** A height
  token found short after components consume it cannot be fixed in one
  place: raising it changes the layout of every component built on it.
  06-styling-and-design-tokens.md owns the token package; this is the
  a11y floor it has to clear.
- **2.5.7 Dragging Movements** — **no dragging interaction is specified
  anywhere in this corpus**, so nothing is in scope today. **Standing
  requirement for whoever introduces the first one** — column
  reordering, a kanban board, drag-to-upload: a single-pointer,
  non-drag alternative ships in the same change. A move-up/move-down
  pair, a position input, a file-picker button. Not a follow-up ticket;
  the alternative is part of the feature.
- **3.3.8 Accessible Authentication (Minimum)** — satisfied by the
  architecture already committed to in
  08-authentication-and-authorization.md: this app never implements its
  own password, puzzle, or cognitive-test login screen. Entra ID's own
  hosted sign-in UI is the entire authentication surface (per 08's
  OIDC+PKCE redirect flow) — meeting this criterion for that UI is
  Microsoft's compliance responsibility, not something this app's own
  code does or needs to do anything for.
- **3.2.6 Consistent Help** — **standing requirement.** This corpus
  does not specify a help mechanism, so there is nothing to place
  consistently yet. When one is added — a help link, a chat widget, a
  contact-support affordance — it belongs in the shared layout, not in
  individual pages. Putting it in `DefaultLayout` (see 07) satisfies
  this criterion structurally: every screen under that layout gets it
  at the same point in the page order, with no per-screen convention to
  maintain. Provenance and a caution: `kus-pqms`'s header carried a
  Help button (`AppHeader.vue`, `aria-label="Help"`) that did nothing —
  its own comment said the feature was unassigned. A help control that
  is present and inert is its own defect: it is announced to a screen
  reader as an available action. Ship the affordance with its
  destination or not at all.
- **3.3.7 Redundant Entry** — **live.** Issue Entry is a multi-step
  flow (per 03 and 07), and no step may require a user to re-enter a
  value already captured in an earlier one. **Requirement**: whatever
  state carries the form forward between steps (per
  04-state-management.md) makes every earlier step's value readable
  from every later step, not only from the step that captured it. The
  common failure is per-step local state, where step 4 cannot see what
  step 1 collected and asks for it again.

### Two enforcement surfaces, not one
Lint is the surface this file owns. There is a second: **automated axe
assertions in the test run**. **10-testing-standards.md owns that
convention** — the binding, the assertion pattern, and how far coverage
extends. Not restated here.

The two are complementary, not redundant. Lint catches static markup
problems before a component ever runs; axe catches violations that only
exist in rendered output — a computed accessible name, a contrast
result, an ARIA relationship resolved at runtime. Neither subsumes the
other, and neither waits for the other: both are at full strictness
from the first component.

### ESLint a11y enforcement
`eslint-plugin-jsx-a11y` is the a11y plugin.
14-code-style-and-linting.md owns its **position** in the config chain
(position 3, after the framework plugins). This file owns **which rules
are on and at what severity**.

**Use the plugin's `flatConfigs.recommended` preset, plus one explicit
addition.** The five rules this corpus cares about most, verified
against the published package (`eslint-plugin-jsx-a11y@6.10.2`,
`lib/index.js`):

| Rule | In `recommended` | Action |
| --- | --- | --- |
| `click-events-have-key-events` | `"error"` | preset; do not downgrade |
| `interactive-supports-focus` | `"error"` + a `tabbable` role list | preset; do not downgrade |
| `label-has-associated-control` | `"error"` | preset; **pass no options** — see below |
| `no-static-element-interactions` | `"error"` + `allowExpressionValues: true` and a handler list | preset; do not downgrade |
| `control-has-associated-label` | **`"off"`** — in `recommended` *and* `strict` | **enable explicitly** |

**"Error from day one" is mostly the preset, not a decision this file
is making.** Four of the five are already `"error"` in the plugin's own
`recommended`. Saying so keeps the actual decisions visible, because
there are only two:

1. **No a11y rule is set to `"warn"`.** A warning-level a11y rule is
   one nobody fixes: it does not fail a build, so it accumulates until
   someone schedules a remediation pass, and that pass is always
   cheaper to postpone than to run. Provenance for stating it this
   firmly: `kus-pqms` had exactly five a11y rules at `"warn"` with a
   documented plan to escalate them "in Phase 3", and two of the
   defects those rules exist to catch — a modal naming itself with
   `aria-label` and a select with no arrow-key support — were still
   present when that plan was written down. The plan was not the
   problem; the `"warn"` was.
2. **`control-has-associated-label` is turned on explicitly**, because
   neither preset does it. This is the one that silently goes missing:
   adopt `recommended`, assume the a11y rules are covered, and this
   rule is off. Enable it with the preset's own option object
   (`ignoreElements`, `ignoreRoles`, `includeRoles`) rather than bare —
   those defaults exist to keep the rule from firing on composite
   widgets like `grid` and `listbox`, where the label belongs to the
   container rather than the cell.

A related trap worth knowing: if you enable any of these by hand
instead of taking them from the preset, you lose the preset's options.
The `strict` preset does this to `no-static-element-interactions`,
dropping `allowExpressionValues: true`. Take the rule entries from
`recommended` and override deliberately, not by retyping them.

**Two rule-name changes from the Vue plugin, one of which is a trap:**

- `vuejs-accessibility/form-control-has-label` →
  **`jsx-a11y/control-has-associated-label`**
- `vuejs-accessibility/label-has-for` →
  **`jsx-a11y/label-has-associated-control`**

The trap: **`jsx-a11y/label-has-for` also exists.** It is deprecated
(`deprecated: true`, `replacedBy: ['label-has-associated-control']`,
deprecated in v6.1.0) and set to `"off"` in both presets. A config line
that ports the Vue rule name literally therefore parses cleanly, lints
nothing, and looks enabled in review.

#### `label-has-associated-control` takes no options
An earlier revision of this file required carrying
`{ required: { some: ["nesting", "id"] } }` across onto
`label-has-associated-control`, and warned that a bare rename "reverts
to both-required and hard-fails lint on **every** `for`/`id`-labelled
control in the app." **That warning is wrong and the requirement is
withdrawn.** The two rules have opposite defaults:

- `vuejs-accessibility/label-has-for` defaults to
  `required = { every: ["nesting", "id"] }` — **both** a nested control
  **and** a `for`/`id` pair (source: `eslint-plugin-vuejs-accessibility`,
  `dist/rules/label-has-for.js`).
- `jsx-a11y/label-has-associated-control` defaults to
  `assert: 'either'` — `var assertType = options.assert || 'either'`
  (source: `eslint-plugin-jsx-a11y@6.10.2`,
  `lib/rules/label-has-associated-control.js`).

So the relaxation was a concession to **the Vue plugin's default**, not
to existing markup. Either-suffices is already what jsx-a11y does.
**Pass no `assert` option.** Any value you could pass is worse than the
default: `'both'` makes it stricter than WCAG requires, `'htmlFor'` and
`'nesting'` each ban a legitimate labelling technique.

One genuine difference in the other direction, worth knowing before the
first lint run: **jsx-a11y's rule checks two things, not one.** Before
it evaluates `assert` at all it requires the label to have accessible
text, reporting "A form label must be associated with a control." and
"A form label must have accessible text." as separate failures (text is
searched to a JSX depth of `2` by default, adjustable via `depth`). The
Vue rule has no equivalent check. The React rule is therefore stricter
than the Vue one even with no options set — a `<label htmlFor="x" />`
whose text arrives some other way will report.

**One anticipated exception, stated as expected rather than
hypothetical**: `no-static-element-interactions` may need a per-file
disable for a wrapper component that handles click or key events
bubbling up from real interactive children inside it. When that
happens, disable it **for that file, with an inline comment naming the
interactive children the wrapper is delegating to** — never as a
project-wide relaxation, and never bare. Provenance: `kus-pqms` had
exactly two such carve-outs (`BaseSelect.vue`, `BaseTooltip.vue`), each
per-file with a written reason. Two files with reasons is the shape to
copy; the failure mode is a third and fourth added without one.

### Component-level accessibility requirements
Per-component obligations for the shared components. These are
requirements, not descriptions — a component that does not meet the one
written against it is not finished.

**`BaseModal`** must provide: a focus trap (Tab and Shift+Tab wrap
between the first and last focusable element inside the dialog),
Escape-to-close, focus moved into the dialog on open, and focus
restored to the triggering element on close.

Its accessible name comes from **`aria-labelledby` pointing at the id
of the rendered heading element** — not from `aria-label` carrying a
copy of the title string. This is a correctness requirement, not a
preference: `aria-labelledby` ties the accessible name to the one
heading a sighted user actually reads, so the two cannot drift.
Provenance: `kus-pqms`'s modal used `aria-label` duplicating the title
text, which is why the prohibition is written out rather than left
implicit.

**`BaseTooltip`** must provide: `aria-describedby` on the trigger bound
to the panel's id **only while the panel is open**, `role="tooltip"` on
the panel, and a trigger that responds to **both hover and focus** —
hover-only makes the tooltip unreachable by keyboard. The panel is
portaled with `ReactDOM.createPortal`.

**`BaseSelect`** must provide full listbox keyboard interaction:
arrow-key roving focus between options, Enter or Space to confirm a
selection, typeahead by typing, Escape to dismiss, and
`aria-activedescendant` on the listbox tracking the active option.
Escape alone is not a keyboard-accessible select. Provenance:
`kus-pqms`'s select implemented Escape and nothing else, which is the
specific shortfall this requirement exists to prevent repeating.

**The primary grounding is contractual, not a standards-level target.**
BRD/NPQMS-ISM-customized-BRD.md (C1.0, draft for ratification,
2026-08-20) **FR-ENT-005** — a numbered, committed requirement — states:
"Classification fields shall be searchable comboboxes with type-ahead,
fully keyboard-operable (arrow keys, Enter, Escape) and screen-reader
accessible." **NFR-U-002** generalises the same obligation across every
screen: "Every function operable by keyboard alone, with a visible
focus indicator that is never suppressed." Together they name the same
key behaviours this section requires. (This retires the prior citation
to BRD v1.3's NFR-08, whose numbering does not carry over to C1.0.) The
WCAG 2.2 AA target (BRD NFR-U-001) is the **secondary** grounding: it
independently requires the same thing, but a committed BRD requirement
outranks a target this corpus set for itself.

**Implementation approach: a headless primitive, not hand-rolled.**
06-styling-and-design-tokens.md's "Scoped exception: headless
primitives for complex keyboard interaction" owns that decision — which
library, which components may use it, and what stays under the
Tailwind-only rule. Not restated here; 06 is the single owner. An
earlier revision of this section deferred to a section of 06 that did
not exist yet; it exists now.

**The consequence to be clear about**: when the a11y lint rules fire on
a component like `BaseSelect`, **that is not a lint fix.** It means the
listbox keyboard interaction above has not been implemented, and lint
is refusing the component until it is. Expect that as an
implementation-sized piece of work, not a warning to triage.

**`BaseSwitch`** uses a real `<button>` with `role="switch"` and
`aria-checked`. **`BaseCheckbox`** uses a real
`<input type="checkbox">` with a `<label htmlFor=...>` association, and
sets the indeterminate state imperatively — HTML has no declarative
attribute for it. Native element plus native ARIA state, in both cases;
do not rebuild either on a `<div>`. Provenance: both were already built
this way in `kus-pqms`, so this is a known-good arrangement rather than
a preference.

**`BaseReasonGate`** gets its focus management from `BaseModal` by
composition and adds none of its own, so `BaseModal`'s requirements
above cover it — nothing further is needed for focus trapping or
restoration specifically.

**`BaseTextarea`** — and every field that can show a validation error —
must set `aria-invalid` while invalid and associate the error message
with the field via `aria-describedby`. A visible error message that is
not programmatically associated is invisible to a screen reader, which
is the whole failure mode. This is stated as a requirement rather than
the verification note an earlier revision carried, because there is no
existing implementation to verify: the underlying obligation (WCAG
3.3.1) does not depend on which component happens to render the
field.

### WCAG 2.4.1 Bypass Blocks — a skip-link is required
**Level A, and until this revision it was addressed nowhere.** The
section above covers the six criteria WCAG 2.2 *adds* to 2.1; 2.4.1 is a
2.1 criterion this corpus never revisited, and
07-routing-and-layouts.md carried a `[PLACEHOLDER]` asking whether a
skip-link was in scope while noting that no file specified one. It was a
real gap in a corpus targeting 2.2 AA, which subsumes every Level-A
criterion.

**Requirement.** Every layout renders a skip-link as the **first**
focusable element in the document, visually hidden until focused, whose
target is the layout's `<main id="main-content">`.

Three details that decide whether it actually works:

- **First in DOM order, not merely first visually.** A skip-link placed
  after the header's nav skips nothing.
- **Visible on focus.** A permanently-hidden skip-link is unreachable and
  a permanently-visible one is design debt nobody accepts. `sr-only` plus
  a `focus:not-sr-only` treatment is the standard shape.
- **It moves focus, not just scroll.** The target needs `tabIndex={-1}`
  so it can receive programmatic focus; without it the browser scrolls
  and the screen reader keeps reading from where it was.

**This settles what `id="main-content"` is for**, which 07 recorded as
unresolved: it is the `<main>` landmark's id **and** the skip-link target.
It is *not* the route-change focus target — that is the page's main
heading, per the section below. Two different mechanisms, two different
targets, and 07 was right to refuse to conflate them.

**One layout, one skip-link.** `DefaultLayout`, `FixedHeightLayout` and
`AdminLayout` each render their own; `BlankLayout` wraps a 404 with no
navigation to bypass and does not need one.

### Focus management on route navigation
**Required, and there is no prior implementation of it to lean on.** A
shared hook or effect moves focus to the new route's main heading on
every navigation. Place it at the layout level: every layout wraps
`<Outlet />` the same way (per 07-routing-and-layouts.md's route tree),
so one implementation there covers every route rather than each page
remembering to do it.

Without this, a screen-reader or keyboard user who navigates to a new
route keeps focus wherever it was on the previous page — usually a nav
link that no longer relates to what is on screen — and gets no signal
that new content loaded at all. It is the most commonly skipped SPA
accessibility requirement, which is why it has its own section here
instead of a line in a checklist.

Provenance, and the reason this is written as new work: `kus-pqms` did
not implement it. There was no programmatic focus-to-heading behaviour
in `App.vue`, `router/index.ts` or any layout. So unlike most of this
file, there is no working pattern to translate — this is built from
scratch, and it will not appear by porting anything.

### Deferred to 18, not drafted here
**Dashboard accessibility** (chart alternatives — a text summary, a
data-table equivalent) and **workflow-timeline accessibility** (text
alternatives for a visual timeline) are deliberately not drafted here.
No charting library has been chosen for this project, and no
workflow-timeline component is specified anywhere in this corpus, so
there is nothing concrete to write requirements against — and inventing
them would produce guidance whoever builds the chart has no reason to
read.

Both are tracked as incoming obligations on
18-project-context-and-implementation-status.md's "Decisions blocked on
React port" list. The trigger for each is the same: the requirement
gets written when the component it constrains is specified, and the
charting-library decision is the gate on the first one.

---

## 12 — Performance Guidelines
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

### Performance goals: Core Web Vitals as a floor
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

### Bundle analysis and budget
**Add `rollup-plugin-visualizer`** as a dev dependency of the portal
app. It plugs into Vite's Rollup build directly, so there is no second
build pipeline to maintain. This is scaffold-time work: none of the
budget below is checkable without it.

Provenance: `kus-pqms` had no bundle-analysis tooling of any kind — no
`rollup-plugin-visualizer`, `vite-bundle-visualizer`, `size-limit` or
`bundlesize` in any manifest, and no CI step running one. Which is
directly relevant to the next paragraph: there is no measured
antecedent for a budget, because nothing was ever measured.

#### The budget numbers
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

### Code splitting beyond routes: `BaseMarkdownEditor`
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

### Caching
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

### Package and dependency evaluation
Before adding any dependency, answer two questions: **what it costs in
bundle size, and whether it tree-shakes.** Both are answerable before
the install, and neither is framework-specific — the point was never
"prefer the framework's built-ins", it was knowing what a dependency
costs before it ships. Provenance: `kus-pqms`'s dependency review asked
the same two questions.

### Images and icons
- **Icons**: SVG. Provenance: `BaseIcon` in `kus-pqms`'s `ui-library`
  was SVG-based, so this is the established approach rather than a new
  one.
- **Photographic content**: modern compressed formats (WebP/AVIF)
  where supported.
- **Below-the-fold images**: the native `loading="lazy"` attribute —
  no library needed for this.

### CSS performance
This file does not restate 06-styling-and-design-tokens.md's
Tailwind/`@theme` decision — see that file for the approach itself. One
addition from a different angle: 06 bans arbitrary-value Tailwind
classes (`bg-[#18468F]`) because they mean a value was written instead
of resolved to a token. The same classes also carry a minor JIT
compilation cost that token-backed utility classes do not. That is a
second, independent reason to follow 06's rule — not a new rule of this
file's own.

### Animation performance
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

### Memory management
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

### Search performance
Debounce search input with the shared **`useDebouncedCallback`** hook,
which lives in `hooks/` per 01-project-structure-and-architecture.md
and is — per 03-react-component-patterns-and-naming.md's
hook-return-shape convention — the one hook that returns its callback
bare rather than object-wrapped. One shared hook, not a `setTimeout` in
each search field.

Provenance: `kus-pqms` had it as a composable
(`src/composables/useDebouncedCallback.ts`); both the hook and its
exemption from the return-shape convention carry forward from there.

### Forms
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

### Review checklist
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

### Anti-patterns
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

### Large lists and tables — what this file needs from `BaseDataTable`'s API
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

### Deferred to 18, not drafted here
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

### Delivery is CloudFront over S3 — three consequences for this file

`docs/STACK.md` §7 records the frontend as a static SPA in an S3 bucket behind
CloudFront, with `/api/*` split off to API Gateway at the distribution.
Production builds emit hashed assets (`dist/assets/[name].[hash].[ext]`).

**Content-hashed filenames plus a CDN change what the budget in this file is
measuring**, and two of the three points below are cheap wins that no amount of
bundle-splitting substitutes for.

#### 1. Cache headers are a performance control, and nobody owns them
Hashed assets are **immutable by construction** and should be served
`Cache-Control: public, max-age=31536000, immutable`. `index.html` must be the
opposite — `no-cache` — or a deploy ships new assets that no browser asks for.

**Getting this backwards is the single most common SPA-on-CloudFront defect**,
and it presents as "users are on the old version and hard-refresh fixes it",
which sounds like a frontend bug and is not.

It is set in the CDK stack, in `infra/` — **outside this corpus's boundary.**
So this file does not specify it; it **requires that someone has**, and
16-code-review-checklist.md asks the question at deploy-configuration review.

#### 2. Compression, likewise
Brotli at the distribution, on by default in CloudFront but worth verifying
rather than assuming. A 300KB budget measured uncompressed against a target
delivered compressed is measuring the wrong number in the wrong direction.

**State which the budget is.** This file's figure is **uncompressed initial
JavaScript**, and the CI check measures the same thing, so the two agree.

#### 3. SPA routing needs a 404-to-`index.html` rewrite
A deep link to `/issues/123` is a key that does not exist in the bucket. Without
the rewrite, CloudFront returns S3's error document and the router never boots —
so **every route except `/` 404s on a cold load**, while working perfectly in
development and in every test.

Also `infra/`-owned, also a question rather than a rule here — but
07-routing-and-layouts.md's route tree is meaningless without it, and it is
found late because nobody deep-links during development.

---

## 13 — Security Standards
**Tier:** 1
**Status:** APPROVED — REVISION 2

Assumes 00-core-rules.md; where the two conflict, 00 wins.

**Incoming obligation (from 08-authentication-and-authorization.md):**
this file's eventual CSP section must be strict enough to make
sessionStorage-based MSAL token caching an acceptable tradeoff — 08's
token-storage decision treats this as load-bearing, not optional.
Whoever drafts this file must address CSP explicitly with that
constraint in mind, not as a generic OWASP checklist item.

This obligation is discharged in the Content Security Policy section
directly below.

### Content Security Policy
**A CSP must be built. There is nothing to carry forward.** The prior
Vue implementation of this product (repo `kus-pqms`) had none — no CSP
`<meta>` tag in `apps/pqms-portal/index.html`, no `vite-plugin-csp` or
equivalent in any `package.json`, and no `staticwebapp.config.json`,
`nginx.conf`, `web.config`, or other deploy-level header configuration
anywhere. So this section is a specification, not a port, and the
policy below has never actually run.

Directives, each tied to this app's specific behaviour rather than
stated as generic hardening advice:

- **`script-src 'self'`** — this app has no inline `<script>`
  content, no `eval`/`Function`-constructor usage, and no third-party
  script origins, and must not acquire any. Nothing here requires
  `'unsafe-inline'` or `'unsafe-eval'`.
- **`connect-src 'self' https://login.microsoftonline.com` [+ real API
  origins, PLACEHOLDER — see below]** — `login.microsoftonline.com`
  must be listed explicitly, and this isn't precautionary: a CSP
  `connect-src` omitting this exact origin has caused a real, reported
  production failure — AzureAD/microsoft-authentication-library-for-js
  issue #7178, where MSAL's own token-endpoint calls were refused by
  the browser because the deploying app's CSP didn't allow them. This
  app's real API origins (`VITE_API_BASE_URL`,
  `VITE_NOTIFICATION_API_BASE_URL`, and whatever endpoint
  `VITE_MONITORING_DSN` eventually points at) are localhost values in
  development — the production values are **[PLACEHOLDER — populate
  once real backend URLs exist]**.
- **`frame-src https://login.microsoftonline.com`** — required because
  MSAL's `acquireTokenSilent`/`ssoSilent` load a hidden iframe against
  this origin before either succeeding silently or falling through to a
  redirect (verified directly against Microsoft's own MSAL
  documentation for the silent-auth flow). This is a distinct concern
  from Microsoft's own `X-Frame-Options: DENY` on its *interactive*
  login page — that header is Microsoft's own restriction on rendering
  credential-entry UI inside a frame, and it does not apply to the
  silent flow, which never renders that interactive UI before it either
  succeeds or redirects out of the frame.
- **`style-src 'self'`** — Tailwind generates static utility classes at
  build time; no runtime inline-style injection was found anywhere in
  this app. If Vite's dev-mode HMR needs a relaxation of this
  directive to function, that relaxation is dev-only and never ships to
  a production build.
- **`object-src 'none'`, `base-uri 'self'`, `form-action 'self'`** —
  standard hardening directives; nothing about this app's behaviour
  needs anything looser than these three defaults.

**Verification, stated explicitly rather than left as an assumption
that the policy "just works":**

1. **Automated**: a Playwright check asserting no browser console
   errors matching CSP-violation patterns (`"Refused to..."`) during
   normal app navigation. This runs in CI and catches directive-syntax
   errors and missing-origin mistakes long before a real Entra tenant
   exists to test the auth flow against.
2. **Manual, named trigger**: verify silent refresh succeeds against a
   live Entra tenant once one is reachable — check the
   browser console specifically during the roughly-hourly
   `acquireTokenSilent` cycle for CSP violations. This is the only way
   to catch a `connect-src`/`frame-src` mistake that would otherwise
   surface silently, in production, about an hour after a user logs in
   — well after the login flow itself already looked like it succeeded.

**No deployment target has been chosen**, so where these headers are
actually served from is undetermined — a `<meta>` tag, a static-host
config, or a reverse proxy are all still open. This is not an infra
question waiting on an answer; choosing a target is itself unstarted
work, upstream of this one. Provenance: the same was true in
`kus-pqms`, which had no Static Web Apps config, App Service reference,
Dockerfile, Kubernetes manifest, or Terraform-provisioned hosting
resource for the frontend, despite its backend having all of them.
Tracked in 18-project-context-and-implementation-status.md; revisit
this CSP's header interaction once a real target exists.

### XSS
**`dangerouslySetInnerHTML` is not itself safe or unsafe. The safety
property lives entirely in the function that produces the string handed
to it.** So the rule is about that function, not about the API:

**Never pass `dangerouslySetInnerHTML` content that has not already
been through an HTML-escaping step — full stop.** The escaping must
happen *inside* the string-producing function, before the value ever
reaches the prop. The prop grants nothing on its own.

**The one place this is expected to apply**: rendering user-authored
markdown in a comment card. The markdown renderer must HTML-escape the
whole input string before inserting any tag of its own, so that nothing
a comment author wrote can reach the DOM as markup. That renderer is
part of the unspecified `ui-library` surface — see
01-project-structure-and-architecture.md's component-specification gap
— so this rule constrains it in advance rather than describing it.

Provenance: in `kus-pqms` this was `BaseCommentCard`, the **only**
`v-html` usage in the entire codebase, and its inline comment stated
the property exactly: *"`v-html` is safe here for exactly one reason:
`renderMarkdown` HTML-escapes the whole string before inserting any tag
of its own, so nothing the comment author wrote can reach the DOM as
markup."* One usage, one guarantee, documented at the call site — that
is the standard to match, not merely the count.

**The failure mode to guard against is a later change, not the first
write.** The moment someone swaps in a different renderer without
re-establishing the escape-before-render property, this becomes a real
stored-XSS path. Whatever the renderer ends up being, state that
property in a comment at the usage site so the next person cannot
remove it accidentally.

**Cross-reference, not the same case**: `BaseMarkdownEditor` is the
other real rich-content surface in this app (a separate component,
whose lazy-loading is covered in 12-performance-guidelines.md's "Code
splitting beyond routes" section), but it's a materially different
case — it's a schema-constrained *editing* model, not a render-only
`v-html`/`dangerouslySetInnerHTML` case.

**The dependency is TipTap**, not ProseMirror directly — stated
precisely because this is a security claim and someone verifying it
will grep the manifest. In `kus-pqms`,
`packages/ui-library/package.json` had **no `prosemirror-*`
dependency**; it had five `@tiptap/*` packages, and the editor
component imported only from `@tiptap/*`. An earlier revision of this
section named ProseMirror as the dependency, which
would have led a reader checking `package.json` to find nothing and
reasonably conclude the reasoning was fabricated.

**The schema-based safety property still holds through that layer.**
TipTap is built on ProseMirror and bundles it via `@tiptap/pm`; TipTap's
extensions (`@tiptap/starter-kit` and friends, as used by this
component) *are* ProseMirror schema definitions. So the safety property
is unchanged in substance: it comes from the schema constraining what
node and mark types can exist in the document at all, not from an
escape-before-render step. What changed is only which package name is
correct — the guarantee is TipTap's schema, which is a ProseMirror
schema.

The two surfaces shouldn't be conflated when reasoning about this app's
XSS exposure. And the distinction is load-bearing for a future change:
swapping the editor for one **without** a constraining schema would
remove this guarantee entirely, and that risk attaches to the editor
library — TipTap — not to a transitive ProseMirror version.

### Input validation
This file does not restate the mechanism — it's already fully owned
elsewhere: 05-api-integration-and-data-fetching.md's "Input validation
and schema parsing" section (strict-by-default Zod schemas at the
mapper boundary, with exactly three named, documented leniency
exceptions) and 03-react-component-patterns-and-naming.md's "Forms and
validation" section (the same Zod version, used for client-side form
schemas) together are this app's actual input-validation architecture.

Stated plainly why this belongs in a security file at all, not just a
data-quality one: **strict response parsing at the trust boundary is
itself an injection/malformed-data defense**, not merely a UX nicety.
A backend response that doesn't match its expected shape is refused at
the boundary rather than silently flowing into components as
`undefined` or a mismatched type — this closes off a class of
malformed-data-reaches-the-DOM paths at the same point 05 already
requires validation to happen, not a separate control this file needs
to introduce.

### Secrets and environment variables
**The `VITE_` prefix rule, stated as an ongoing rule, not a one-time
check**: anything with this prefix is bundled into client-visible code
at build time, regardless of "it's just an env var" framing — there is
no server-side-only tier to a `VITE_`-prefixed value. This must never
receive an API key, a connection string, or any other credential-shaped
value, now or later.

#### The expected inventory: seven vars
This app is expected to need exactly these seven. Every one **must be**
declared in `env.d.ts` (see the mechanism below), and every one is
public-shaped:

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Issue-management API base |
| `VITE_NOTIFICATION_API_BASE_URL` | Notification service base — separate origin/path-space |
| `VITE_USE_FIXTURES` | Fixtures-mode flag (per 04) |
| `VITE_MONITORING_DSN` | Error-monitoring sink; unset = console-only |
| `VITE_MASTER_DATA_API_URL` | Dev-server proxy target |
| `VITE_ISSUE_MANAGEMENT_API_URL` | Dev-server proxy target |
| `VITE_NOTIFICATION_API_URL` | Dev-server proxy target — the `/api/notification` prefix, distinct from the base URL above |

**How many of these seven survive depends on a decision outside this
file.** Five of the seven are per-service origins or proxy targets, and
they exist because the backend was three services. BRD `AR-01`/`DEC-08`
commit to **one** deployable behind one `/api/v1/**` surface, under which
`VITE_NOTIFICATION_API_BASE_URL`, `VITE_MASTER_DATA_API_URL`,
`VITE_ISSUE_MANAGEMENT_API_URL` and `VITE_NOTIFICATION_API_URL` collapse
into `VITE_API_BASE_URL` plus one proxy target — **seven variables become
three.** See 05-api-integration-and-data-fetching.md's placeholder on the
origin count; this inventory and 20's dev-proxy snippet move with it.

**Do not pre-emptively collapse them.** The inventory's whole value is
that it is derived from `env.d.ts` and `vite.config.ts` rather than
remembered — re-derive it when the decision lands, exactly as the
procedure below requires.

**The last three are consumed by `vite.config.ts`, and that does not
exempt them.** They carry the `VITE_` prefix, so Vite loads them and
exposes them to client code through `import.meta.env` exactly like the
other four. The prefix rule above applies to them in full. Do not
assume a var is server-side merely because only the Vite config reads
it — the prefix, not the reader, determines exposure.

Note the near-collision in the last two notification entries:
`VITE_NOTIFICATION_API_BASE_URL` is the client's base URL and
`VITE_NOTIFICATION_API_URL` is the dev proxy target. Two names one word
apart, for two different things. That is worth flagging rather than
tidying here, because renaming either one is a change to an environment
contract, not to a document.

None of the seven is credential-shaped: five base or target URLs, one
feature flag, one monitoring endpoint.

#### How this count is derived — and why it was wrong twice
**Read `env.d.ts`'s `ImportMetaEnv` and `vite.config.ts` together.
Never enumerate this list from memory or from a previous revision of
it.** The inventory above is a *derived* artifact; the interface is the
source.

That is stated as a procedure because this section has now undercounted
twice. An earlier revision said four vars; it was corrected to six; the
real number is seven. **Each correction moved the number without
re-running the derivation** — which is the same failure the section
below exists to prevent, committed inside the section that describes
it.

The seventh, `VITE_NOTIFICATION_API_URL`, is exactly the case this
section warns about: it feeds `vite.config.ts`'s `/api/notification`
proxy, it is **not** declared in `env.d.ts`, and it was therefore
invisible to every audit that read the inventory rather than the
environment.

Provenance, corrected: `kus-pqms` used these seven, and **three** of
them — all three proxy targets — were added without the check and never
declared in `ImportMetaEnv`, which declared only four of the seven. An
earlier revision of this passage said two. No live exposure resulted,
because all three were localhost URLs. The lesson is the mechanism
below, not the vars.

#### The rule needs a mechanism, not a restatement
"Any `VITE_*` addition gets the same check before it's added" is the
right rule, and in `kus-pqms` it **failed** — three vars were added
without it, because nothing made a missed check visible. Restating it
more firmly would reproduce that failure. So the rule has a
mechanism:

**`env.d.ts`'s `ImportMetaEnv` interface is the authoritative inventory
of `VITE_*` vars.** Every `VITE_`-prefixed variable must be declared
there, with a docblock saying what it is for. Two consequences that do
the enforcing:

- **An undeclared var is a visible mismatch, not a manual audit.** A
  `VITE_*` var present in `.env` or `vite.config.ts` but absent from
  `ImportMetaEnv` is caught by reading one file against another, and any
  consumer touching `import.meta.env.X` for an undeclared `X` is a type
  error rather than a silent `any`. All three proxy targets were
  invisible in `kus-pqms` precisely because they were never declared.
- **Check the mismatch in both directions.** Declared-but-unset is the
  reverse case and matters too: it is not a security problem, but a var
  the type says exists and the environment does not provide means a
  client falls back silently. In `kus-pqms` this was
  `VITE_NOTIFICATION_API_BASE_URL` — declared, never set.

Enforcement at review time is 16-code-review-checklist.md's job — see
its Security section, which now carries this as a check. The rule lives
here; the gate lives there.

#### `VITE_USE_FIXTURES` — one contract, stated in three places
Per 04-state-management.md, fixtures mode is **explicit opt-in**: only
the exact string `"true"` enables it, and anything else — absent,
misspelled, `"0"` — means real mode. Three artifacts must state that
same contract, and they must agree:

- **`env.d.ts`** — the docblock says only `"true"` enables fixtures and
  anything else means real mode.
- **`.env.example`** — sets `VITE_USE_FIXTURES=true`, with a comment
  saying fixtures are opt-in and that this file is the
  local-development starting point.
- **`.env`** — per-developer, and **gitignored**, so it is not the file
  that communicates anything to anyone else.

**Never describe fixtures mode as "the default" in any of the three.**
There is no default: the value is load-bearing, because it also gates
the authentication bypass in 08's "Fixtures-mode authentication".

`.env.example` is the tracked file and therefore the one that must be
right — it is the only one a new developer reads. Provenance for why
this is spelled out at all: in `kus-pqms` all three described fixtures
as "(default)", and `.env` and `.env.example` disagreed on the actual
value (`=true` versus `=false`) while carrying that same comment. That
was survivable when the flag gated only data. It is not survivable now
that it gates auth.

### Secrets never reach a log or a monitoring sink
**21-logging-formatting-and-client-diagnostics.md owns the prohibition
list**; it is named here because a security reader looks for it in a
security file, and because two of its entries are this section's concern
rather than a logging convention:

- **No token, credential or `Authorization` header value** in any log
  line or telemetry event. Concretely: never log a raw request or
  response object, because either may carry one.
- **A `VITE_*` value is public** and therefore safe to log — but that is a
  consequence of the prefix rule above, not a general permission. A value
  that is public in the bundle is still not necessarily appropriate in a
  third-party sink.

**25-observability-and-client-telemetry.md carries the same prohibitions
for the monitoring sink**, and the bar there is higher rather than lower:
a sink is a third party. Note that adding one also adds a `connect-src`
origin to the CSP above — the `VITE_MONITORING_DSN` placeholder in that
section is that origin.

### CSRF
**This is not the primary threat model here, and stating why matters
more than a generic CSRF checklist item would.** The HTTP client's auth
mechanism is `Authorization: Bearer <token>`, sourced from MSAL's
`sessionStorage`-backed cache via a request interceptor (per
08-authentication-and-authorization.md) — not a cookie the browser
automatically attaches to outgoing requests. The classic CSRF
precondition (the browser silently sends a stored credential on any
request to the target origin, including ones the user didn't
knowingly initiate) does not exist in this architecture: there is no
credential the browser attaches on its own, only one this app's own
JavaScript reads from `sessionStorage` and attaches explicitly.

**Forward note, not a current action item**: this changes if 08's
cookie/BFF escalation trigger ever fires — moving to HTTP-only cookie
storage reintroduces the exact precondition CSRF protection exists for.
CSRF protection becomes relevant again at that point and should be
designed against the real backend/BFF contract that triggers it, not
built preemptively now for an architecture this app doesn't currently
have.

### Dependency security
Before adding any new dependency, evaluate its maintenance status and
known-vulnerability history — the same evaluation habit already stated
in 12-performance-guidelines.md's "Package and dependency evaluation"
section, applied here from a security angle (is this package
maintained, does it have open CVEs) rather than that file's bundle-size
angle. One evaluation, two reasons to run it — not two separate
processes.

### Build mode as a fuse — the house pattern, named
The prior repository uses one mechanism three separate times, in three unrelated
files, without ever naming it. It is worth naming, because it is the difference
between a rule and an enforced rule.

| Where | The fuse |
|---|---|
| The HTTP client | throws at construction if `import.meta.env.PROD` and the base URL is not `https://` |
| The auth store | `switchRole()` throws under `PROD` — "a prototype-only mechanism" |
| Fixtures mode | this corpus's `PROD` fuse on the authentication bypass |

**The rule.** Anything that exists for local development and would be a
vulnerability in production must be fused with a build-mode assertion that
**throws**, not warned about in a comment. Three properties make it work:

- **It fails at construction or at first call**, not at the moment of exploit.
- **It is untestable-around.** A comment is advisory; a throw is not.
- **It survives the person who wrote it.** The developer who removes the comment
  block six months later does not remove the throw, because the throw has a test.

A fuse is not a substitute for infrastructure-level enforcement — the HTTPS
tripwire above is explicitly a stopgap until a gateway enforces it. **Record
that in the fuse's own comment**, so it is retired deliberately rather than
forgotten into permanence.

### Dependency supply chain — a release-age hold
The prior repository configures a **minimum release age** for dependencies, with
a per-package exception list naming 28 packages of one library at one version.

That is a real supply-chain control and this file did not have one: a
compromised package is most dangerous in the hours after publication, and a
cooling-off period costs nothing except the ability to adopt a release the day
it lands. **Adopt it**, with the exception list as the pressure valve — an
exception names a package *and* a version, so it expires by construction rather
than granting that package permanent immunity.

Pair it with automated dependency updates (15-devsecops-and-ci-cd.md) and audit
scanning; the three answer different threats and none replaces the others.

### The environment inventory is an interface, and it is enforced by nothing else
This file makes the `ImportMetaEnv` interface the authoritative `VITE_*`
inventory. 18-project-context-and-implementation-status.md records that the
scaffold has no such interface — so **at the time of writing, nothing enforces
the rule this file's whole mechanism rests on.** That is the first thing to fix,
and it is one file.

### The scanning layer already exists — six tools, and what each covers

This file specifies dependency and secret scanning as things to adopt. In the
target repository they are configured and running
(`.gitlab-ci-templates/security.gitlab-ci.yml`, per `docs/STACK.md` §6):

| Tool | Scope | Gate |
|---|---|---|
| **OWASP Dependency-Check** | backend (Gradle) | fails on CVSS **≥ 7.0** |
| **`pnpm audit`** | frontend, against `pnpm-lock.yaml` | see below |
| **gitleaks** | whole repo | secret scanning |
| **CycloneDX SBOM** | dependency inventory | generated, not gating |
| **License compliance** | `scripts/check-forbidden-licenses.py` | fails on a forbidden licence |
| **SonarQube** | static analysis | see 15 |

**So the frontend's job is to fit into this, not to build a parallel one.**
Three specifics:

- **The `pnpm audit` severity floor still needs deciding**, and
  15-devsecops-and-ci-cd.md's resolution (fail at `high`, warn below, allowlist
  entries carrying a required ≤90-day expiry) is a **proposal to the client**
  here rather than a decision this corpus can make — the pipeline is theirs.
- **The backend's CVSS ≥ 7.0 threshold is the precedent to match.** CVSS 7.0 is
  the floor of "High", so failing frontend builds at `high` and above puts both
  components on the same line. Proposing a different frontend threshold needs an
  argument, and there isn't an obvious one.
- **gitleaks covers the whole repository**, which subsumes this file's
  secrets-never-committed rule with an actual check. What it does **not** cover
  is 21-logging-formatting-and-client-diagnostics.md's rule about secrets
  reaching a *log line or a monitoring sink* at runtime — a different failure,
  detected by a different mechanism, and still unowned by any tool.

#### The supply-chain hold moves file
This file recommends a minimum release age with a per-package exception list.
**pnpm 11 no longer reads non-auth settings from `.npmrc`** — they live in
`pnpm-workspace.yaml` (`docs/STACK.md` §3). So the hold, `autoInstallPeers` and
`strictPeerDependencies` all belong there.

That file already carries `allowBuilds: { esbuild: true, msw: true }`, and the
note attached to it is worth reading before touching anything: **pnpm does not
run dependency build scripts unless allowed, and esbuild needs its postinstall
or `vite build` fails.** An `allowBuilds` entry is a deliberate supply-chain
exception — adding one is a security decision, and removing one breaks the
build in a way that looks unrelated.

#### CSP under CloudFront
This file specifies a Content-Security-Policy. A static SPA has no server to set
one — it is a **CloudFront response-headers policy**, defined in `infra/`.
Same shape as 12-performance-guidelines.md's cache headers: this corpus states
the required policy, `infra/` implements it, and review confirms the two agree.

---

## 14 — Code Style and Linting
**Tier:** 1
**Status:** APPROVED — REVISION 2

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
ESLint, Prettier, export conventions, barrel-file patterns, and naming
conventions for this React app.

### ESLint: flat config only

> ⚠️ **NEITHER OF THE TWO FACTS BELOW IS TRUE OF THIS REPOSITORY, and they were
> never derived from it.** Same provenance defect as this file's Prettier values,
> withdrawn in `decisions/0002-prettier-configuration-follows-the-repository.md`:
> lifted from `kus-pqms` — the prior **Vue** repository — and given a provenance
> line that made them read as checked.
>
> | This file said | Reality, measured 2026-08-25 |
> |---|---|
> | `eslint.config.js` at the workspace root | **No such file.** The only ESLint config is `eslint.adherence.config.mjs`, which runs the vendored design-system ruleset |
> | ESLint `^10.7.0` or later | **9.39.5** |
> | The five-position composition chain | **Does not exist.** No `js.configs.recommended`, no `tseslint`, no `eslint-plugin-react-hooks`, no `eslint-plugin-jsx-a11y`, no `eslint-config-prettier` — none are dependencies |
>
> **The flat-config rule itself stands**, and so does "never create or reference
> `.eslintrc.*`": the one config that exists *is* flat config. What is withdrawn
> is the claim that the file, the version and the chain are present.
>
> **This is a real gap, not a documentation error.** There is no general-purpose
> lint here at all — no `no-unused-vars`, no rules-of-hooks, no accessibility
> rules. `tsc --noEmit` covers types and unused locals; nothing covers the rest.
> The a11y half is the sharpest edge, because 11-accessibility-standards.md's
> severities describe a plugin that is not installed.
>
> **Adopting the chain is not a documentation fix.** It would raise findings
> across a codebase whose acceptance test is pixel-fidelity to a prototype, so it
> arrives with 30-restructuring-an-existing-react-project.md's Phase 1 mechanism
> — baseline the count, ratchet it down — exactly like the adherence gates.
> Tracked as an open placeholder in
> 18-project-context-and-implementation-status.md. **Owner: Frontend Lead.**

One config: `eslint.config.js` at the workspace root, ESLint `^10.7.0` or
later.
**Never create or reference `.eslintrc.*`** — this repo is flat-config
only.

**Required composition order**, because the last two positions are
load-bearing:

1. Base recommended — `js.configs.recommended`, then
   `tseslint.configs.recommended`.
2. Framework plugins — `eslint-plugin-react`,
   `eslint-plugin-react-hooks`.
3. Accessibility — `eslint-plugin-jsx-a11y`.
4. Project-specific rule overrides.
5. **`eslint-config-prettier` last**, to disable any stylistic rule
   that would conflict with Prettier's own formatting.

Position 5 must be last or Prettier and ESLint will fight over
formatting. Position 4 must come after 1–3 or the overrides get
overwritten by the presets they are meant to override.

Provenance: this chain is carried forward from the prior Vue
implementation of this product (repo `kus-pqms`,
`frontend/eslint.config.js`), which used the same five-position order
with `eslint-plugin-vue` and `eslint-plugin-vuejs-accessibility` in
positions 2 and 3.

The a11y package is **`eslint-plugin-jsx-a11y`** — the full name,
including `-plugin-`. An earlier revision of this file wrote
`eslint-jsx-a11y`, which is not a real package and produces a failing
install.

This file owns the a11y plugin's **position** in the chain and nothing
else about it. **Which preset, which rules, and at what severity is
owned by 11-accessibility-standards.md** — including the one rule that
must be enabled by hand because neither of the plugin's presets turns
it on. Do not set a11y rule severities here.

### `eslint-plugin-react-hooks` rule set
Use the plugin's **`recommended`** preset. The React Compiler's lint
rules ship inside it — they are not a separate plugin or an opt-in
extra — so enabling `recommended` is what satisfies
03-react-component-patterns-and-naming.md's hard requirement on those
rules. Prefer the preset over hand-listing rules so newly added
recommended rules arrive automatically.

The `recommended` preset's rules (17), covering both the classic hooks
rules and the Compiler-derived diagnostics:

```
exhaustive-deps                rules-of-hooks
component-hook-factories       config
error-boundaries               gating
globals                        immutability
incompatible-library           preserve-manual-memoization
purity                         refs
set-state-in-effect            set-state-in-render
static-components              unsupported-syntax
use-memo
```

`recommended-latest` also exists and additionally carries experimental
Compiler rules. **Use `recommended`, not `recommended-latest`** — a new
codebase has no reason to absorb churn from an experimental rule set.

Compiler diagnostics surface through this plugin even before the
Compiler itself is adopted, so the preset is useful from the first day
of scaffolding rather than only after the Compiler is switched on.

**This preset is a necessary but incomplete detector.** It does not
catch every Rules-of-React violation that causes the Compiler to skip a
component — see 03's "Memoization and the React Compiler" section and
12-performance-guidelines.md's "Review checklist", which owns the
verification step that covers what lint misses. Do not treat a clean
lint run as proof a component was optimized.

### Prettier
Exactly one config exists, at the workspace root, applying monorepo-wide.
**No per-package overrides** — one Prettier config for the whole repo.
(In this repository the file is `frontend/.prettierrc`. An earlier revision named
it `.prettierrc.json`; that was carried from `kus-pqms` along with the values
below and is corrected here too — Prettier reads either name, so the mismatch was
invisible until someone looked for the file.)

**The values this section used to state were wrong for this repository and are
corrected — see `decisions/0002-prettier-configuration-follows-the-repository.md`.**
An earlier revision stated them as absolutes:

```json
{ "printWidth": 100, "semi": true, "singleQuote": false }
```

with the provenance "carried forward verbatim from `kus-pqms`" — the prior
**Vue** repository. They were never derived from this project, and this
project's `frontend/.prettierrc` says the opposite on all three: `printWidth`
120, `semi` false, `singleQuote` true. **The code matches the local file.**
Adopting the withdrawn values would have rewritten every line of every module.

**The rule, corrected:** where a consuming repository already has a Prettier
configuration that its code consistently follows, **that configuration wins**,
and this file records it. A formatter setting is a convention rather than a
value derived from a source, so
30-restructuring-an-existing-react-project.md's conflict rule applies: a
consistent existing convention is evidence, and a standard that contradicts one
is re-argued rather than mechanically applied.

Real settings for **this** repository (`frontend/.prettierrc`), verbatim:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 120,
  "tabWidth": 2
}
```

That is: 120-character print width, 2-space tabs, semicolons **off**, single
quotes, trailing commas everywhere valid. `endOfLine` is not set in the file;
LF is enforced by `frontend/.gitattributes` (`* text=auto eol=lf`) instead —
see "Line endings" below.

**Everything else in this section stands unchanged**: exactly one config, no
per-package overrides, Prettier ignores `**/*.md`, and `eslint-config-prettier`
stays last in the chain.

#### The provenance defect, recorded rather than quietly fixed

This value did not *become* wrong. **It was never derived from this project.**
It was lifted from another repository and given a provenance line, which made it
read as checked when nothing had been checked.

00-core-rules.md's source-precedence **case 5** is written about design-token
literals — *"never trust a prior citation's value, however well-sourced it
looked at the time, including citations from this corpus's own earlier revisions
or from the legacy Vue codebase."* This is that same failure applied to a
formatter setting, which is evidence the case is not specific to token values.
**A provenance line records where a value came from. It is not evidence that the
value is correct here.**

Two further sections of this file — "Export conventions" and "Two compiler flags
the prior config turns off" — cite `kus-pqms` in exactly the same way and
**have not been re-derived against this repository.** They may well be right;
they have not been checked. Tracked as an open row in
18-project-context-and-implementation-status.md's register rather than silently
trusted or silently changed.

### Export conventions
A settled decision, stated plainly so it is not re-litigated per-file:

**React components: default export, one component per file.**

General React community guidance often favours named exports for
components instead. That guidance is noted and **not** followed: the
tradeoff was weighed and default-export-per-component won.

Provenance: `kus-pqms` was effectively 100% default-export for
components — every SFC is the file's default export via
`<script setup>`'s implicit default, and of 124 `.vue` files, 122 used
`<script setup>`, 2 had no script block at all, and **zero** used an
explicit `defineComponent`/`export default` alternative. A codebase
that consistent is worth matching rather than diverging from on general
principle.

**Non-component modules — hooks, stores, services, utils, types: named
exports only, no default exports.** Every function, const, and type is
a named export.

Provenance: `kus-pqms` was equally consistent in the other direction —
across its composables, stores, services, and shared utils there were
**zero** default exports. The split is deliberate: default export
signals "this file is one component", named exports signal "this file
is a collection of things".

### Barrel files (`index.ts`)
Two re-export patterns, used situationally:

**Named re-export**, for component barrels:

```ts
export { default as BaseButton } from "./BaseButton";
export type { BaseButtonProps, BaseButtonVariant } from "./BaseButton.types";
```

**Wildcard re-export**, for modules that are already all-named-exports
(e.g. a `stores/index.ts` aggregating multiple store modules):

```ts
export * from "./auth";
export * from "./notification";
export * from "./issue-management";
```

#### Heavy-dependency exclusion — a reusable convention, not a one-off
`BaseMarkdownEditor` is excluded from `ui-library`'s main barrel's
**value** export, because it pulls in TipTap and its bundled ProseMirror
engine — a large third-party dependency. Re-exporting it from the main
entry point would put that weight in every consumer's bundle whether or
not they render a rich-text editor. Its value export lives only at a
separate subpath (`@pqms/ui-library/markdown-editor`); its **types**
are still exported from the main entry point, because types are erased
at build time and cost nothing to re-export.

Provenance: `kus-pqms` did exactly this, with the reasoning recorded in
a comment at the exclusion site in `packages/ui-library/src/index.ts` —
worth imitating, since the omission looks like an oversight otherwise.

**This is the standard approach for any future component with a
similarly heavy dependency** — not something that only applied to
`BaseMarkdownEditor` historically. When a new component pulls in a large
third-party library, exclude its value export from the main barrel,
re-export it from its own subpath instead, and keep its types in the
main entry point.

### Naming conventions
- **Components**: PascalCase (`IssueListPage`, `BaseButton`).
  `ui-library` components specifically use the `Base*` prefix — never
  `Pqms*`, which is stale for components (see 06-styling-and-design-
  tokens.md's "Component naming").
- **Shared variant/state/size types in `ui-library`**: PascalCase with
  the **`Pqms*`** prefix, in `packages/ui-library/src/types/`. See
  06-styling-and-design-tokens.md's "Component naming" for the
  `Base*`/`Pqms*` split and why both conventions are live — that file
  owns it, and it is not restated here.
- **Functions, variables**: camelCase.
- **Hooks**: camelCase, prefixed `use*` (`useDebouncedCallback`,
  `usePermissions`, etc.). **The `use*` prefix is reserved for real
  hooks.** A plain predicate or helper that is not a hook must not be
  `use*`-named — the `eslint-plugin-react-hooks` `recommended` preset
  above enforces the Rules of Hooks on `use*` names, so a `use*`-named
  non-hook is a lint failure, not a style choice. The fixtures-mode
  predicate is the known instance: name it `isFixtureMode()`, never
  `useFixtures()` — see 05-api-integration-and-data-fetching.md's
  "Fixtures mode", which owns that predicate.
- **True constants**: UPPER_SNAKE_CASE (e.g. `BASE_BUTTON_DEFAULT_SIZE`).
- **Non-component file names**: kebab-case for standalone
  non-component files (utils, config, services, hooks), except: (1)
  filenames a build tool or framework mandates exactly (e.g.
  `vite.config.ts`, `eslint.config.js`, `tsconfig.json`) — use the
  tool-required name as-is; (2) co-located component-companion files,
  which take the PascalCase name of the component they belong to, per
  the conventions already established in 02-typescript-standards.md
  (`ComponentName.types.ts`) and 09-i18n-and-localization.md
  (`ComponentName.i18n.ts`).

### A `warn` needs a reason and a trigger, or it is permanent
The prior repository sets its project-convention and accessibility rules to
`warn` rather than `error`, deliberately:

> Pre-existing issues start as warnings so CI stays green while they are burned
> down incrementally; tighten to "error" later.

with the accessibility block carrying a named owner and phase for the
re-escalation, and the closing line "kept visible, not silenced".

**That is the right mechanism and it needs one guardrail.** A rule at `warn`
with no recorded trigger is not on a schedule — it is a rule the project has
quietly decided not to enforce, and warnings scroll past in CI output forever.

**The rule.** Any rule configured below `error` carries, in the config file
itself: (1) why it is not `error` yet, (2) what event flips it, (3) who owns
that. A `warn` without all three is a defect in the config, and reviewable as
one. 30-restructuring-an-existing-react-project.md uses this as its primary
gate-adoption mechanism.

The same applies to a per-file or per-line disable. The prior repository's two
file-level disables carry a paragraph of evidence each — including one that
explains why an inline `eslint-disable-next-line` was not usable and cites the
observed test breakage it caused. **A disable with no recorded reason is
indistinguishable from a mistake.**

### Two compiler flags the prior config turns off, and this one turns on
The prior `tsconfig.base.json` leaves `noUnusedLocals` and `noUnusedParameters`
to ESLint rather than the compiler, with the reason recorded: its template
compiler does not count bindings used **only** in a template as reads, so both
flags raise false positives on legitimate component state.

**That reason is framework-specific and does not transfer.** In this repository,
component markup is ordinary expression code and a binding used in it is an
ordinary reference — so there are no false positives to work around.

**Turn both flags on in the compiler.** The lint rule stays too; they disagree
usefully at the edges (the compiler is stricter about parameters, the lint rule
understands the `^_` convention). This is a case where copying the prior config
forward would carry a workaround for a problem that no longer exists — worth
watching for generally, not only here.

### Line endings, and the format gate that cannot pass without them
The prior repository runs `prettier --check` as a CI gate with
`endOfLine: "lf"`, has an `.editorconfig` declaring `end_of_line = lf`, and has
**no `.gitattributes`**. On a platform that checks out CRLF, that combination
makes the format gate unsatisfiable locally while remaining green in CI — the
files in CI came from a Linux checkout.

**This repository ships a `.gitattributes` with `* text=auto eol=lf` from the
first commit**, before any formatting baseline is written. Retrofitting it later
means renormalising the whole tree, which is a diff touching every file — and
23-git-workflow-hooks-and-commits.md's blame-ignore rule then applies to it.

#### A subdirectory `.gitattributes` shadows its parent's binary pins

**Rule: any `.gitattributes` in a subdirectory that writes a bare `*` pattern
MUST re-declare every binary format it shadows.**

Attribute files in deeper directories take precedence over shallower ones for
the files beneath them. So a subdirectory file containing

```
* text=auto eol=lf
```

overrides the root's `*.png binary`, `*.jpg binary` and every other binary pin
**for everything in that subdirectory** — not just the line-ending attribute, but
the `binary` (`-text`) macro those pins exist to set. `text=auto` does sniff for
NUL bytes and will usually classify a binary correctly, so this normally works.
"Usually" is the problem: the failure is a silently corrupted asset, discovered
whenever someone next looks at it.

**Worked example, from this repository.** `frontend/.gitattributes` was added in
Phase 1 with `* text=auto eol=lf`. Beneath it sit **11.3 MB of tracked PNG
fidelity captures** (91 files, which are the acceptance test for the Phase 2
workspace split) and **8.67 MB of vendored TTF fonts**. Before the file existed,
`git check-attr` reported:

```
.fidelity/app-01-home.png            binary: set      <- from the root's *.png
…/KiaSignatureFix-Bold.ttf           text: auto       <- NOT PINNED ANYWHERE
```

**The root pins `png/jpg/gif/ico/jar/zip/pdf` and no font format at all**, so the
fonts were already relying on content sniffing before any subdirectory file
existed. The frontend file re-declares both groups explicitly, and
`git check-attr` now reports `binary: set` for each.

Two general points worth keeping:

- **Check `git check-attr` before and after adding an attributes file**, on one
  binary and one text file. It is the only way to see what the file actually did,
  as opposed to what it appears to say.
- **A parent's pins are not a safety net for a child's bare `*`.** The direction
  of precedence is the opposite of what "the root sets the defaults" suggests.

Two supporting files, both small and both easy to omit:

- **`.editorconfig`** — charset, LF, final newline, trimmed trailing whitespace,
  2-space indent. **Exempt `[*.md]` from trailing-whitespace trimming**: two
  trailing spaces are a Markdown line break, and trimming them silently reflows
  prose.
- **`.npmrc`** — `engine-strict=true`, so the `engines` range in `package.json`
  is enforced at install rather than documented and ignored. Any loosening
  (e.g. `strict-peer-dependencies=false` for a toolchain running ahead of its
  plugins' declared peer ranges) carries its reason in the file.

**Prettier ignores `**/*.md`.** Prose and tables are hand-wrapped for meaning;
reflowing them produces large diffs that mean nothing and hide the one line that
changed.

### pnpm 11 moved the configuration file

This file specifies `.npmrc` with `engine-strict=true`. **On pnpm 11 that no
longer works**: per `docs/STACK.md` §3, pnpm 11 "no longer reads non-auth
settings from `.npmrc`" and has removed `onlyBuiltDependencies`. Non-auth
settings live in **`pnpm-workspace.yaml`**; `.npmrc` carries the registry and
authentication only.

So the rule stands and the location changes:

| Setting | Where it goes now |
|---|---|
| Engine enforcement | `pnpm-workspace.yaml` |
| `autoInstallPeers`, `strictPeerDependencies` | `pnpm-workspace.yaml` |
| `allowBuilds` (replaces `onlyBuiltDependencies`) | `pnpm-workspace.yaml` |
| Registry, auth tokens | `.npmrc` |

**Verify the engine setting takes effect rather than assuming it.** A setting
written to the file pnpm no longer reads fails silently and looks identical to a
setting that is working — which is the whole reason this correction is needed.

### Prettier is invoked but not installed

`docs/STACK.md` §8 item 5: Lefthook runs `pnpm exec prettier --write` on staged
frontend files, and **`prettier` is not a declared dependency** in
`frontend/package.json`. The same paragraph records `frontend/.storybook/` on
disk with no `storybook` dependency.

This file makes Prettier the formatter and the source of the format gate, so
this is directly in its path. **Establish in Phase 0 which of two things is
happening** — `pnpm exec` resolving a hoisted transitive copy (working by
accident, will break on any dependency change) or failing and being ignored.

Then declare the dependency explicitly. **Do not delete the hook step**: a
repository with a formatter in its hooks and none in its manifest is one commit
away from a whole-tree reformat by whoever installs it globally.

### The TypeScript version is 5.9, not 6

Which means the two compiler flags this file argues for — `noUnusedLocals` and
`noUnusedParameters` — behave exactly as described, and the framework-specific
reason the prior repository disabled them still does not apply. Turn both on.
02-typescript-standards.md carries the version correction.

### Formatting is not the only per-language gate here

The frontend shares hooks with a Java backend (Spotless + google-java-format), a
TypeScript CDK project, and Python scripts (ruff). 23-git-workflow-hooks-and-commits.md
owns the mechanics. The rule that matters here: **the frontend's formatter
configuration is scoped to frontend paths**, and never reaches
`backend/`, `infra/` or `.claude/`. A Prettier glob that escapes its component
reformats another team's code, and they find out from `git blame`.

---

## 15 — DevSecOps and CI/CD
**Tier:** 1
**Status:** APPROVED — REVISION 2

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
Specifies the CI this app needs: which workflows exist, what each job
runs and in what order, which gates must fail a build, dependency
hygiene, and the CI-side secrets rule. **Nothing described here exists
yet** — this is a build target, not a description of a pipeline.

### Scope boundary
Two workflows: **`pqms-portal-ci.yml`** and **`pqms-portal-sonarqube.yml`**.

Both live in the **repository root's** `.github/workflows/`, not under
`pqms-portal/`. GitHub reads workflows only from the repo root, and the
pnpm project is `pqms-portal/`, one level down. Two consequences that
every job below depends on:

- each job sets `defaults.run.working-directory: pqms-portal`, so `run:`
  commands execute in the pnpm project;
- every *action input* that names a file is prefixed `pqms-portal/`
  (`pqms-portal/package.json`, `pqms-portal/.nvmrc`,
  `pqms-portal/pnpm-lock.yaml`) — action inputs are not affected by
  `working-directory`, which is the detail that silently breaks a
  workflow copied without it.

Provenance: `kus-pqms` was a polyglot monorepo whose git root held
`backend/` alongside `frontend/`, with three further workflows
(`backend-ci.yml`, `infrastructure-ci.yml`, `automation-tests-ci.yml`)
that had nothing to do with this app. If this repo is frontend-only and
`pqms-portal/` *is* the git root, the `paths` filters, the
`working-directory` default and every `pqms-portal/` prefix above drop
away — confirm which at scaffold time before copying any of it.

### `pqms-portal-ci.yml` — two jobs, `quality` and `e2e`
Two jobs rather than one, and not sequential steps in a single job. A
broken browser download or a flaky e2e run then cannot mask a type
error, and the Playwright browser install only happens on the path that
needs it.

#### Triggers and concurrency
- **`push`** to the default branch and **`pull_request`**, both scoped
  by `paths`: `pqms-portal/**` plus the workflow file itself. The workflow
  file is in the list deliberately — a change to CI must run CI.
- **`concurrency`**: group `pqms-portal-ci-${{ github.ref }}` with
  **`cancel-in-progress: true`**, so a rapid second push supersedes the
  first run instead of queueing behind it.
- **One Node version, no matrix.** Resolved from `.nvmrc` via
  `actions/setup-node`'s `node-version-file`, so the version lives in
  one file that local development also reads. A matrix would test
  runtimes nothing deploys on.
- `.nvmrc`'s value must satisfy 00's Node floor.

Provenance: this is `kus-pqms`'s trigger and concurrency configuration,
specified here rather than left to preference because each part earns
its place — the `paths` scoping keeps a backend-only commit from
running frontend CI, and `cancel-in-progress` is the difference between
a queue and a backlog.

**RESOLVED (2026-08-24, from the repository).** `pqms-portal-dev`'s default
branch is **`main`**. Trigger on `[main]` only — do not carry the
`[master, main]` hedge forward. A branch list naming a branch that does not
exist is indistinguishable from a typo, and it hides the case where the trigger
silently matches nothing.

**RESOLVED — pin the exact version.** `.nvmrc` currently reads `24`, a bare
major, so CI silently follows the latest 24.x and a patch-level runtime change
arrives unannounced — which is how a green pipeline turns red on a commit that
changed nothing.

Write the full `major.minor.patch`. Two supporting rules:

- **`engines.node` in `package.json` stays a floor, not a pin** (`>=22.22.0`
  today), because a consumer of this workspace should not be forced onto our
  exact patch. `.nvmrc` pins; `engines` bounds. They are different jobs.
- **`.npmrc` sets `engine-strict=true`**, so the floor is enforced at install
  rather than documented and ignored. Without it `engines` is a comment.

Bumping the pin is an ordinary PR, and it is the *only* way the runtime moves.

#### Job 1 — `quality`
Step order, which is not arbitrary:

1. `actions/checkout`
2. **Install pnpm** — `pnpm/action-setup` with
   `package_json_file: pqms-portal/package.json`, so the pnpm version
   comes from `packageManager` rather than being pinned twice.
3. **Setup Node** — `actions/setup-node` with
   `node-version-file: pqms-portal/.nvmrc`, `cache: pnpm`, and
   `cache-dependency-path: pqms-portal/pnpm-lock.yaml`.
4. **`pnpm install --frozen-lockfile`**
5. **Type-check** — `tsc --noEmit`
6. **ESLint**
7. **Prettier** — `--check`
8. **Build**
9. **Unit tests with coverage, all packages** — see below
10. **`pnpm audit`** — see Dependency management
11. **`pnpm docs:standards:check`** — fails if the generated standards
    document does not match the tier files it is generated from
11a. **Log-hygiene scan** — fails if any committed source file passes a
    prohibited field into a logger or telemetry call, per
    21-logging-formatting-and-client-diagnostics.md's prohibition list.
    BRD `NFR-O-005` is a gated non-functional requirement; a convention
    does not gate it, and no other step in this job would catch it.
11b. **Bundle-budget check** — fails if the initial bundle exceeds 300KB
    gzipped or any route chunk exceeds 150KB, per
    12-performance-guidelines.md. Requires `rollup-plugin-visualizer`,
    which 12 makes scaffold-time work
12. **Upload coverage artifact** — `if: always()`, so a failing
    threshold still produces the report that explains why

**Why the docs check is a CI step and not a convention**: 00's
precedence rule says the distribution document is generated and never
hand-edited. Without a check, that is a request. With one, a hand-edit
fails the build on the PR that made it, which is the only moment anyone
can still tell what was edited and why.

**Why that order**: cheapest and most specific failure first. Type
errors before lint, lint before formatting, all three before a build
that would fail on the same code anyway, and tests last because they
are slowest. A developer reading a red build learns the most useful
thing first.

**`--frozen-lockfile` is required, not a nicety.** It makes CI fail on
a lockfile that does not match the manifest, instead of quietly
resolving a dependency tree different from the one any developer has.

**Type-check is `tsc --noEmit`.** Nothing wraps it and nothing
substitutes for it.

Provenance, since a Vue-shaped artifact would otherwise get copied
here: `kus-pqms`'s step was named "Type-check (vue-tsc)" and its
`pnpm lint` ran `vue-tsc --noEmit` per package, because type-checking a
Vue SFC's `<script>` block needs a Vue-aware compiler. There is no such
need here and no such tool. Two things follow. **`vue-tsc` appears
nowhere in this repo** — if it turns up in a config, it was copied
without reading. And **do not carry the script names either**: in
`kus-pqms`, `lint` meant type-check while `lint:eslint` meant lint,
which makes every CI step name a small lie. Name the scripts for what
they do — `typecheck`, `lint`, `format:check`. 14-code-style-and-
linting.md owns the tools those scripts invoke; this file only requires
that the workflow step name and the script name describe the same
thing.

One related carry-over to catch: `kus-pqms`'s `format:check` glob
listed `.vue` among its extensions. The equivalent here covers `.tsx`
and must not carry `.vue` forward. 14 owns the Prettier configuration.

#### Job 2 — `e2e`
Its own `checkout` → pnpm → Node → `pnpm install --frozen-lockfile`,
then:

- **Install Playwright browsers** — `playwright install --with-deps
  chromium`. Chromium only unless a cross-browser requirement is
  stated; `--with-deps` because the runner lacks the system libraries.
- **Run the e2e suite.**
- **Upload the Playwright report** — `if: always()`, for the same
  reason as the coverage artifact.

**RESOLVED — the job lands with the first spec, not before.**

On day one there are zero e2e specs, and `playwright test` matching nothing
exits non-zero. The two available fixes are both wrong: a job that fails from
the first commit trains everyone to ignore a red check, and `--pass-with-no-tests`
softens the job permanently to avoid a problem that lasts a week.

So: **no `e2e` job until the first spec exists.** The commit that adds that spec
adds the job, in the same PR. Until then `15`'s job list is five jobs, not six,
and that is a stated position rather than an omission.

**The first spec is not a formality.** Make it the smoke path — load the issue
list in fixtures mode, assert one row renders. That exercises the router, the
layout, the query layer and the fixture predicate in one assertion, and it is
the test that tells you the app boots at all.

#### Coverage runs for every package
**The unit-test step covers every package in the workspace, not the app
alone.** A root-level coverage script fanned out by Turbo — not a
single `--filter`.

This gets its own subsection because it is the one requirement here
most likely to be quietly re-broken, and because it was in fact broken
in the implementation this file otherwise draws on.

Provenance: `kus-pqms`'s test step was

```
pnpm --filter @pqms/pqms-portal run test:coverage
```

Both `@pqms/ui-library` and `@pqms/design-tokens` had a
`"test": "vitest run"` script. Their tests existed and **never ran in
CI** — the root `pnpm test` (`turbo test`) would have run all three,
and the `--filter` excluded two of them. Nobody deleted a test; the
pipeline simply stopped asking.

The same gap reached SonarQube independently, which is the part worth
noticing: `sonar-project.properties` listed **three** source roots
(`apps/pqms-portal/src`, `packages/ui-library/src`,
`packages/design-tokens/src`) against **one** coverage report
(`apps/pqms-portal/coverage/lcov.info`). Two of the three packages were
analysed as source with zero coverage attached — so the dashboard did
not show a gap, it showed those packages as untested.

Requirements that follow:

- The coverage command fans out across the workspace.
- Every package with a `test` script emits an lcov report.
- **`sonar.javascript.lcov.reportPaths` lists every package's lcov
  path** — the property is comma-separated; one path means one measured
  package.
- The coverage artifact upload covers every package's coverage
  directory, not just the app's.
- **10's thresholds apply per package.** A package whose coverage is
  not measured has not passed a threshold; it has avoided one.

#### Coverage gate
#### Coverage on an existing codebase — the ratchet
**10's uniform 85 is the target and it is not negotiable. On a project
being restructured onto this corpus, it is not achievable on day one**,
and 30-restructuring-an-existing-react-project.md's Phase 1 says what to
do instead: **record the current coverage as the floor and fail CI on any
drop.** The floor rises with each merge that adds tests; the target stays
85.

Two constraints on that mechanism, both of which decide whether it works:

- **The floor only ever moves up.** A merge that lowers it is the defect
  this exists to prevent, not a fact to record.
- **It is a temporary state with a stated end.** A ratchet with no target
  is a permanently lowered threshold wearing a better name. The end is
  85/85/85/85, and the ratchet is deleted when it is reached.

This applies **only** to a codebase inherited below the threshold. A
greenfield package starts at 85 from its first covered file, per 10.

10-testing-standards.md owns the numbers. What this file owns is how
the gate is enforced: the check is **Vitest's own v8-provider threshold
check**, invoked as the `quality` job's test step, with **nothing
softening its exit code** — no `continue-on-error`, no second CI-side
gate layered on top, no `|| true`. A threshold violation fails the step
and therefore the job.

10 also flags a scaffold-time edge case that lands in CI: a coverage
run with zero covered files may report 0% and fail. Handle it as 10
says — by when thresholds are enabled, not by lowering a number to get
a green build.

### `pqms-portal-sonarqube.yml`
**A separate workflow, not a job inside `pqms-portal-ci.yml`**, so that a
missing or misconfigured Sonar setup can never fail the quality gate.

Required shape:

- **`checkout` with `fetch-depth: 0`.** Sonar needs full history for
  blame and new-code analysis; the default shallow clone breaks both.
- **A secret guard as the first step.** Write
  `enabled=${{ secrets.SONAR_TOKEN != '' }}` to `$GITHUB_OUTPUT` and
  make every later step conditional on it, with a final step that logs
  the skip when it is false. A fork, or a repo not yet onboarded to
  Sonar, then gets an honest green no-op instead of a permanent red
  check.
- **Generate coverage inside this workflow.** Artifacts do not cross
  workflow boundaries for free, so this workflow runs the tests it
  needs reports from.
- **`SonarSource/sonarqube-scan-action`** with
  `projectBaseDir: pqms-portal`, and `SONAR_TOKEN` / `SONAR_HOST_URL` from
  secrets.
- **`sonar-project.properties` lives in `pqms-portal/`**, alongside the
  pnpm project it describes.

Provenance: this is `kus-pqms`'s workflow, which worked and sat inert
for want of an org-level secret. It is specified here rather than left
to whoever writes it because the guard is the non-obvious part —
without it, every fork and every un-provisioned repo carries a failing
check that people learn to ignore.

Two changes the properties file needs relative to `kus-pqms`'s:

- **`sonar.test.inclusions` must cover `.spec.tsx`.** `kus-pqms`'s was
  `**/*.spec.ts` only. Per 10, React component specs are `.spec.tsx` —
  so the inherited glob would classify every component test as
  production source, inflating the source base and reporting those
  files as uncovered. The same applies to `sonar.exclusions`'
  `**/*.stories.ts`.
- **`sonar.javascript.lcov.reportPaths` lists every package**, per the
  coverage section above.

**RESOLVED — advisory first, blocking at day 30.**

Scan-and-report from the moment `SONAR_TOKEN` is provisioned, with the quality
gate **not** blocking. Then add `sonarqube-quality-gate-action` and make it
required on pull requests **thirty days later**, on a dated calendar entry, not
"when it feels stable".

The reasoning is the same as the coverage ratchet above: a gate turned on
against an unmeasured codebase fails on day one for reasons nobody has triaged,
and the first response is always to disable it. Thirty days of advisory results
tells you what the gate would have blocked, so turning it on is a decision
rather than a surprise.

**Blocking applies to pull requests only.** A push to `main` that fails the gate
should raise an alert, not prevent a deploy — by then the code is already
merged and blocking the pipeline punishes the wrong moment.

**Record the flip date in the workflow file itself**, per
14-code-style-and-linting.md's rule that a gate below full strength carries its
reason, its trigger and its owner.

### Dependency management
#### Dependabot — required configuration
At the repository root, `.github/dependabot.yml`:

- **npm ecosystem**, `directory: /pqms-portal`, `interval: weekly`,
  `open-pull-requests-limit: 10`, with **minor and patch updates
  grouped** into a single PR, and commit messages prefixed `chore` with
  the scope included.
- **github-actions ecosystem**, `directory: /`, weekly, commit prefix
  `ci`.

The ecosystem key is **`npm`, not pnpm** — the npm ecosystem reads a
pnpm lockfile, and there is no separate pnpm ecosystem to select.

**Why minor and patch are grouped**: ungrouped, one weekly run on a
workspace this size opens enough PRs to reach the 10-PR limit, and a
review queue that long gets reviewed by nobody. Grouping makes routine
bumps a single PR and leaves majors — the ones that actually need a
human — as individual PRs where they are visible.

Provenance: this is `kus-pqms`'s configuration, carried forward because
each part of it is doing work rather than because it was there.

#### Dependabot is not vulnerability scanning
Dependabot opens a PR when a newer version exists. It does not scan the
installed tree against a vulnerability database on its own schedule.
The two are easy to conflate and one does not substitute for the other.

**Requirement: a `pnpm audit` step in the `quality` job** (or a
dedicated job), so a known-vulnerable dependency fails CI rather than
waiting on whoever happens to read a Dependabot PR.
13-security-standards.md's "Dependency security" section points at
12-performance-guidelines.md's dependency-evaluation principle
(maintenance status, bundle size) but establishes no enforced step —
this is that step.

Provenance: `kus-pqms` had no vulnerability scanning of any kind — no
audit step in either workflow, no Snyk, no Socket.dev. Dependabot was
the whole of it, which is why this is written as new required work
rather than a carried-forward practice.

**RESOLVED — fail at `high`, warn below it, allowlist with an expiry.**

`pnpm audit --audit-level=high` in the gating job. Anything `moderate` or below
runs in a separate non-gating step whose output is visible but does not fail the
build.

The default (exit non-zero on *any* advisory) fails routinely on low-severity
findings in transitive dev dependencies with no available fix. A check that is
red most mornings is a check nobody reads, and it takes the high-severity
findings down with it.

**The allowlist is the pressure valve, and it expires by construction:**

| Field | Rule |
|---|---|
| Advisory ID | exact, never a package wildcard |
| Reason | why it is not actionable — usually "no fix published" or "dev-only, not in the bundle" |
| Expiry date | **required**, maximum 90 days |
| Owner | a person |

An entry past its expiry fails the build. That is the whole mechanism: it makes
forgetting impossible, and re-upping an entry is a deliberate act with a name
attached.

**A production dependency is never allowlisted at `high` or `critical`.** If
there is no fix, the dependency is the problem.

### Secrets management
Secrets are never committed to a workflow file or to source. They are
referenced through **GitHub Secrets** (`secrets.NAME`), with a presence
check before any step that needs one — the `SONAR_TOKEN` guard above is
the pattern to copy.

What counts as a secret rather than public configuration is not this
file's call: see 08-authentication-and-authorization.md for the
credential and token surface, and 13-security-standards.md for the
`VITE_*` inventory. One point from 13 worth restating because it is a
CI-time mistake: **every `VITE_*` value is compiled into the bundle and
is therefore public**, whatever it is named and wherever CI reads it
from. Putting a real secret in a `VITE_*` variable does not protect it
by routing it through GitHub Secrets.

### Storybook in CI — unspecified
Per 01-project-structure-and-architecture.md, Storybook is the
component verification surface and standing it up with
`@storybook/react-vite` is new work. **Nothing specifies whether CI
builds it.**

**RESOLVED — yes, path-filtered, non-blocking on the first failure.**

Add the step, but only on pull requests that touch `packages/ui-library/**` or
`apps/portal/**/*.stories.tsx`. That answers both sides of the trade: a broken
Storybook is caught by the commit that broke it, and PRs that cannot possibly
have broken it pay nothing.

**Be precise about what it catches.** It is a *build* check. It does not run the
a11y addon's checks — those are manual per 10-testing-standards.md — so it
catches a broken import or a missing arg type and **no accessibility
regression whatsoever**. A team that believes otherwise has a gap it cannot see,
which is worse than having no step.

24-storybook-authoring.md's story-presence rule is the complementary check, and
it belongs in review rather than in CI.

Provenance, and why there is no precedent to fall back on: `kus-pqms`
had `storybook` and `build-storybook` scripts at the root and in both
`ui-library` and the app, and **neither workflow invoked either one.**
The question was never asked there, so nothing about it carries
forward.

### Deployment target — unspecified, and this file cannot fill it in
No deployment target is chosen. This file therefore specifies **no
deploy job, no deploy step and no deploy trigger** — the target
determines the artifact shape, the authentication model, and whether
deployment is a GitHub Actions concern at all, so a deploy stage
written now would be invented rather than specified.

Provenance: `kus-pqms` had none either — no Static Web Apps config, no
App Service reference, no Dockerfile, no Kubernetes manifest, and no
Terraform-provisioned hosting resource for the frontend, while the
backend services had all of those. So the absence is longstanding
rather than something this rewrite dropped. Tracked in
18-project-context-and-implementation-status.md; a deploy stage is
added here once there is a real target to design one against. See also
13-security-standards.md, which reaches the same conclusion from the
security side.

### Branch protection — configured outside the repository
Branch protection lives in repository settings, not in a file in the
repo, so this file specifies **what to require**, and asserts nothing
about what is currently configured:

- Both the `quality` and `e2e` checks must pass.
- At least one review.
- Applied to the default branch.

Whether the Sonar check joins that list is the placeholder above.
Nothing inside the repo can verify these settings, so if it matters,
someone opens the settings page and checks — this file is the record of
what they should find, not evidence that they will.

### A gate whose "clean" is indistinguishable from its "dead" needs a positive control

**The rule.** Any gate whose passing result looks identical to the result it
gives when it has stopped checking anything **requires a positive control**: a
deliberate violation fed to it, with the check **failing if the violation is not
reported**.

This applies to every allow-list, ignore-list and path-scoped check — lint
globs, import restrictions, coverage path configuration, Sonar source roots,
formatter ignore files, CSS scrape paths. All of them share the property that
**a pattern matching nothing does not error; it reports zero.**

#### The worked example, and why no count could have caught it

`frontend/scripts/check-import-rule.mjs`. The design-system import restriction
forbids reaching into component internals instead of the barrel. Its violation
count was **0 before** the Phase 2 workspace split — because the codebase was
clean.

After the split, components moved from `src/components/**` to
`packages/ui-library`, and every consumer specifier changed from
`@/components/...` to `@pqms/ui-library`. **The rule's patterns matched nothing,
so it would have reported 0 after the split too** — because it was checking
nothing.

**0 and 0. Identical from outside. No threshold, ratchet or trend line can
separate those two states**, because the number is the same and it is the
*right* number in one case. This is not a monitoring gap that a better metric
fixes; it is a property of the measurement.

So the check does not measure the codebase. It measures **the gate**: it feeds
the live configuration three deliberately-violating import shapes and fails if
any goes unreported, plus one correct barrel import that must **not** be flagged
— because a rule that over-fires pushes people back to the deep paths it exists
to prevent.

```
v import-rule: package deep-path (post-split specifier) — reported
v import-rule: in-app alias twin — reported
v import-rule: bare vendored pattern — reported
v import-rule: barrel import — correctly allowed
```

#### The same idea applied to globs

`frontend/scripts/ds-gate.mjs` carries a **zero-file guard**: if ESLint matches
no files under the configured roots, it fails instead of reporting a count.
Without it the Phase 2 split would have taken the values family from 467 to 0 —
and because that gate *ratchets downward automatically*, *it would have written
the 0 in as an improvement.* **A ratchet without a positive control converts a
broken gate into recorded progress.**

#### Where to put one

A positive control belongs **in the gate's own tier**, not in a test suite: it
runs wherever the gate runs. These two run in `pre-push` and in `build`. When CI
exists they run there, and they are among the few checks worth running on
**every** pipeline rather than path-filtered — a gate that silently died is not
scoped to the files that killed it.

**This generalises past linting.** 30-restructuring-an-existing-react-project.md's
definition of done already requires that every Phase 1 gate "fails on a
deliberately-introduced violation". This section is that requirement stated as a
standing rule rather than a one-time acceptance step, because the failure it
prevents arrives long after the gate was accepted.

### A gate whose necessary tolerance exceeds its signal is structurally blind

**The rule.** A gate whose necessary tolerance exceeds the signal it exists to
detect **is not a weak gate — it is structurally blind.** Choose the mechanism
that asserts the invariant, not the one that looks most thorough.

This is a different failure from the positive-control rule above. There, the gate
was silently checking nothing. Here the gate runs perfectly, reports honestly, and
**still cannot separate a regression from ambient noise**, because the two overlap
in the only quantity it measures. No amount of care in operating it helps.

#### ⚠️ The worked example this section originally carried is WITHDRAWN

An earlier revision illustrated this rule with the N-PQMS ISM fidelity harness,
arguing that a pixel comparison needs a tolerance wider than the 1px change it
must detect, and is therefore structurally blind.

**The measurement did not support the claim.** The 0.66–2.14% cited was
**cross-machine** drift — the current machine against baselines captured on
another, with a different browser revision. It was an artefact of **baseline
provenance**, not of pixel comparison as a method.

**Same-machine, same-browser, back-to-back capture measured 0.0000% across all
nine screens — byte-identical.** With the machine and browser fixed, that gate
needs **no tolerance at all**: threshold zero is correct and any non-zero diff is
signal. It is now the project's fidelity gate.
`18-project-context-and-implementation-status.md` carries the corrected record.

**The rule above stands on its own and is not weakened by this.** What the
episode adds is a caution about *applying* it:

> **Measure the noise floor under the conditions the gate will actually run in.**
> Noise measured across environments says nothing about a gate that runs in one.
> Attributing an artefact of the *baseline* to the *instrument* is how a sound
> rule reaches a wrong conclusion — and the determinism result that disproved it
> was already in hand when the claim was written.

#### A worked example that does hold — coverage thresholds

A coverage floor set *below* the current measured number cannot detect a
regression that lands above the floor.
10-testing-standards.md records the prior repository's version of this: split
floors of 85/78/80/85 let branch and function coverage drift downward until a
PR finally failed at **79.82% functions**. The gate ran on every PR for months
and reported green while the thing it guarded got worse. Its tolerance — the gap
between the floor and the actual — exceeded its signal.

The remedy is the same shape in both cases: **set the threshold at the measured
actual, and move it only in the direction that tightens.**

#### The general test to apply before building a gate

Ask, in this order:

1. **What is the invariant?** For a token substitution: *this value is unchanged*.
2. **What asserts it most directly?** Compare the values. Not the rendering of the
   values, and not a photograph of the rendering.
3. **What is the noise floor of the instrument, in the same units as the signal?**
   If the noise floor is at or above the signal, **stop** — the gate is blind and
   more effort spent on it is wasted.

Step 3 is the one that gets skipped, and skipping it is how a project ends up with
a thorough-looking gate that has never once caught anything.

**A narrow check that asserts the invariant beats a broad check that observes its
consequences.** Breadth is not sensitivity, and the two are routinely confused
because breadth is the one that is easy to see.

**This applies well beyond screenshots.** A flaky end-to-end test whose retry
budget exceeds its failure rate, a performance budget wider than the regression it
guards, a coverage threshold below the current number — all the same shape.

### Guard an optional gate, and make the skip visible
The prior repository's SonarQube workflow is **separate from the main quality
pipeline**, and every step in it is conditioned on a detected secret:

```yaml
- name: Detect Sonar secret
  id: guard
  run: echo "enabled=${{ secrets.SONAR_TOKEN != '' }}" >> "$GITHUB_OUTPUT"
```

with a final step that runs only when the guard is false and prints
"SONAR_TOKEN not set — skipping SonarQube scan."

Three things to copy:

- **Separate workflow.** A missing org secret can then never break the gate that
  every PR depends on.
- **The guard.** A fork, a fresh clone or a not-yet-provisioned repository gets
  a green pipeline instead of a permanently red one that everybody learns to
  ignore.
- **The visible skip step.** This is the part that is usually omitted, and it is
  what stops "guarded" quietly becoming "never runs". A skip nobody can see is
  indistinguishable from a pass.

The scan also needs `fetch-depth: 0` — new-code analysis is blame-based and a
shallow checkout silently degrades it.

### The Sonar configuration must agree with 10, in the same commit
`sonar.tests` and `sonar.test.inclusions` name the test location.
10-testing-standards.md names the test location. **In the prior repository these
disagree**, and the result is that every colocated spec is analysed as
production source — inflating the measured codebase and applying production
rules to test code.

Nothing detects this. It is not a build failure, it is a quietly wrong metric.
**So it is a review rule:** a change to test placement and a change to
`sonar-project.properties` land together, and 16-code-review-checklist.md checks
for the pair.

Also declare, explicitly: `sonar.sources` (each package's `src`),
`sonar.exclusions` (stories, build output, `.d.ts`, generated token CSS, any
`*.config.*`), the lcov report path, and `sonar.sourceEncoding=UTF-8`.

### The quality job, in order
The prior pipeline runs, and this order is right: **type-check → lint → format
check → build → unit tests with coverage → upload coverage `if: always()`**,
with E2E as a **separate job** that installs only the browser it needs.

Type-check first because it is the fastest signal on the most common breakage.
Format check before build because it costs seconds. **Coverage uploaded even on
failure** — the run where the gate failed is the run where you most need the
report.

Supporting configuration worth stating rather than rediscovering:
path-filtering to the frontend directory, a `concurrency` group with
`cancel-in-progress` keyed on the ref, `defaults.run.working-directory`, Node
resolved from `.nvmrc` rather than pinned in the workflow, and the lockfile as
the cache key with `--frozen-lockfile` on install.

**E2E runs in fixtures mode and needs no backend.** The prior Playwright config
forces the fixtures flag in its `webServer` block, so a developer's local `.env`
cannot change what CI runs. Under CI it also sets `forbidOnly`, two retries and
trace-on-first-retry. Copy all four.

## ─────────────────────────────────────────────────────────────
### GitLab CI — this supersedes every GitHub Actions specification above

**Everything above this line describes GitHub Actions. The target repository
runs GitLab CI**, with an AWS CodeBuild path for select stages
(`docs/STACK.md` §6, `docs/CI-ANALYSIS.md`).

**The requirements above still hold; the implementation does not.** Job order,
what gates, what uploads, the Sonar guard, the coverage ratchet — all
platform-neutral and all still required. `.github/` file paths, `uses:` actions,
`secrets.` expressions and `if: always()` are not. Read the sections above for
*what must be true* and this section for *how it is expressed here*.

#### What already exists — do not rebuild it

`docs/CI-ANALYSIS.md` records this repository as the organization's
**current best-practice reference (G4 generation)**. That is a strong claim and
it changes this file's job from "specify a pipeline" to "fit into one":

```
.gitlab-ci.yml
.gitlab-ci-templates/
  ├─ environments/   per-env variables
  ├─ jobs/           reusable job templates
  ├─ pipelines/      component pipelines (frontend.gitlab-ci.yml)
  ├─ roles/          cross-account role assumption
  ├─ scripts/        e.g. check-forbidden-licenses.py
  └─ security.gitlab-ci.yml
```

Twelve sequential stages, dev auto-deploying and **stg/prd behind manual
approval**. The frontend already builds with pnpm 11 via Corepack and Node 24.

**Read `docs/CI-ANALYSIS.md` before proposing any pipeline change.** A change
that degrades a reference pipeline to match a document written for a different
platform is the worst outcome available here.

#### Path filtering — the mechanism is different and the difference is load-bearing

GitHub's `on.paths` becomes GitLab's `rules:changes`. One constraint from
`docs/STACK.md` §6 that is easy to violate:

> GitLab 14.x-compatible (no `include:rules:changes` which needs 16.4;
> **job-level `changes:` rules instead**)

**So filtering goes on the job, never on the `include`.** Writing
`include:rules:changes` produces a pipeline that is valid on modern GitLab and
fails to parse on the target version — and it fails at *pipeline creation*, so
nothing runs and the failure does not look like a syntax error in a job.

```yaml
frontend:quality:
  extends: .frontend-base
  rules:
    - changes:
        - frontend/**/*
        - .gitlab-ci-templates/pipelines/frontend.gitlab-ci.yml
```

#### Job mapping

| Requirement above | GitLab equivalent |
|---|---|
| `concurrency` + `cancel-in-progress` | `interruptible: true` + Auto-cancel redundant pipelines (a **project setting**, not YAML) |
| `defaults.run.working-directory` | `default: { before_script: [cd frontend] }`, or per-job |
| `actions/setup-node` + `.nvmrc` | an image pinned to the `.nvmrc` version, or nvm in `before_script` — the pin must still come **from `.nvmrc`**, not be duplicated in YAML |
| `pnpm/action-setup` | `corepack prepare pnpm@<version> --activate` |
| `cache: pnpm` | `cache: { key: { files: [frontend/pnpm-lock.yaml] }, paths: [.pnpm-store] }` |
| `upload-artifact` + `if: always()` | `artifacts: { when: always, paths: [...] }` |
| Coverage reporting | `artifacts:reports:coverage_report` with `coverage_format: cobertura` — **add `cobertura` to the Vitest reporter list**, which is not there today |
| Job needs | `needs:` — and it must reference a **strictly earlier stage**; `STACK.md` §6 records a same-stage `needs` that had to be fixed |

#### Two GitLab-specific facts that change the rules above

**1. The Sonar secret guard is unnecessary here — and something else is.**
The guard above exists because a GitHub fork has no secrets. GitLab CI variables
are project-scoped, so the failure mode is different: a variable that is
**protected** is unavailable on unprotected branches, so the scan silently skips
on every feature branch and runs only on `main`.

**Keep the visible-skip step regardless.** A skip nobody can see is
indistinguishable from a pass, and here it will be a skip on exactly the
branches where review happens.

**2. Branch protection is documented intent, not enforcement.**
`docs/conventions/README.md` §2 records the intended rules — 1 approval, dismiss
stale approvals, resolved threads, no force-push, passing pipelines required —
and **notes that none of it is currently enforced.**

Every "required check" in this file therefore protects nothing until someone
sets it under **Settings → Repository → Protected branches** and **Settings →
Merge requests**. **Verify in the GitLab UI, not in a document**, and treat an
unenforced gate as an open finding rather than a green tick.

#### The Sonar resolution, restated for this platform
The thirty-day advisory period and the PR-only blocking still apply. Here the
lever is **"Pipelines must succeed" plus the Sonar job's `allow_failure`**:
`allow_failure: true` during the advisory window, flipped to `false` on the
recorded date. Same decision, different switch.

#### The frontend coverage gate
10-testing-standards.md resolves the 90/90/90/80-versus-uniform-85 conflict:
**keep 90 on three, ratchet branches from their measured actual toward 90.** The
pipeline change is the reporter and the threshold; the argument is in that file.

#### What this corpus does not own here
`buildspec.yml` and the CodeBuild path, cross-account role assumption, the
twelve-stage deploy graph, SBOM and licence scanning, and every `infra/` concern
(cache headers, CSP, the SPA rewrite — see 12 and 13). **This file specifies the
frontend's jobs and the gates on them. It does not restructure the client's
pipeline.**

### A codemod keys on the node, never on the finding

**The rule.** A codemod driven by linter output must key its edits on the
**source node range**, never on the finding. One node can raise several findings,
and applying each independently writes over the same text more than once.

**Worked example, from this repository.** The Step 8 token conversion is driven by
`no-restricted-syntax` warnings. The literal

```js
border: '1px dashed #DCE1E6'
```

raises **two** — `Raw px value` for the `1px` and `Raw hex colour` for the
`#DCE1E6` — and **both report the same node with the same line, column and end
column.** The first pass rewrote the whole literal to its fully-tokenised form;
the second pass rewrote the *already rewritten* text again, producing

```js
border: 'var(--border-width) dashed var(--neutral-200)' dashed var(--neutral-200)'
```

which does not parse. Caught by `tsc --noEmit` over 103 conversions and reverted.
**Unattended over ~350 it would have damaged dozens of files**, and the damage is
not always a syntax error — a double-write that happens to stay syntactically
valid is a silent content change.

**Why this belongs beside the positive-control rule:** it is the same family. A
mechanism that looks correct, runs without error, and is silently wrong. The
defence is also the same shape — **do not trust that the tool did what it
appeared to do; verify the output independently.** Here the verification was a
type-check and a pixel comparison, and the type-check is what caught it.

Two supporting practices, both cheap:

- **Apply edits right-to-left within a line**, so earlier column offsets stay
  valid as later text changes length.
- **Dry-run first and read a sample.** The double-write was visible in the diff
  before it was applied; nobody looked.

### A bundle hash proves nothing once content changes by design

**The rule.** Identical build output is strong evidence for a change that should
produce identical output, and **no evidence at all** for a change that should not.
Choose the check by what the change is expected to do to the artefact.

**Both halves of that were demonstrated in this repository, three days apart.**

**Step 6 — the workspace split.** A pure move: no source byte was meant to change
meaning. The JS and CSS bundle hashes were **identical before and after**
(`index-BDNeyRad.js`, `index-fURKnrD4.css`), which proved byte-identical rendering
more strongly than a screenshot could. Correct use.

**Step 8 — token conversion.** `padding: '16px'` becomes
`padding: 'var(--space-4)'`. The source bytes change **on purpose**, so the hash
**must** change while the pixels **must not**:

```
index-BDNeyRad.js  403.94 kB   ->   index-CAOysY3E.js  405.38 kB   (+1.44 kB)
pixel comparison:  10 screens, IDENTICAL
```

The hash moved because `var(--space-4)` is longer than `16px`. It carries no
information about the only property that mattered.

**One further limit, found the same week:** a bundle hash is also blind to any
change in code that is **tree-shaken out**. Editing a component that nothing
imports produced an identical hash — the edit was real and never reached the
bundle.

#### The strongest end-to-end check available here, and it is not a self-comparison

Across 133 conversions the app was also compared against the **UX prototype**, an
artefact the conversion cannot touch. The per-screen pixel counts were
**unchanged to the digit** — 70536 / 66147 / 52926 / 54969.

**That is worth more than any per-screen pass against the app's own baseline.** A
self-comparison can only tell you the app matches what you just captured; a
comparison against an independent artefact tells you the *relationship* to
something external is preserved. **A changed delta after a value-preserving
conversion means something went wrong**, and it is detectable even if the app's
own baseline was regenerated at the wrong moment.

### A ratchet across a changing denominator is not a ratchet

**The rule.** A ratchet only means something while **the measured set is fixed**.
Every widening of the denominator resets what the number represents, so a floor
carried across a widening is comparing two different quantities.

**The discipline that saves it: widen the denominator in a change that does
nothing else.** The re-seed is then visible and attributable — one commit whose
entire content is "the scope grew, here is the new baseline" — rather than buried
in a change that also adds tests, where a reviewer cannot tell an improvement
from a rescoping.

#### Why this is not obvious, and the worked example

Coverage is the case where it bites, because the number moves in both directions
at once. Measured on this project:

| | Data layer only | Data layer + one screen |
|---|---:|---:|
| Statements | 76.83% | **82.45%** ⬆ |
| Branches | 85.38% | **69.46%** ⬇ |
| Functions | 90.90% | **51.19%** ⬇ |

**Adding a well-tested file made two metrics fall by thirty and forty points.**
Nothing regressed. The denominator grew from 130 branches to 298 and from 22
functions to 84, and the untested remainder of the newly-included file entered
the calculation.

A reviewer seeing `functions: 90.90 → 51.19` in a change that also added nine
tests has no way to tell whether the tests are bad or the scope grew. **In a
separate change, the same diff is unambiguous.**

The gate itself should say this where it will be read. Here the coverage
configuration names the included paths, states that widening WILL fail the gate,
and says the remedy is to re-measure and re-seed in the same change — so the
person who hits the failure finds the explanation at the point of failure rather
than in a standard.

#### State the end goal, so the interim is not mistaken for the target

**A floor over a subset is a floor over a subset, and the document that records
it must say which subset.** Otherwise the number is read as a project figure and
the first honest widening looks like a regression.

For this project the end goal is explicit: the denominator is eventually **all of
`apps/portal/src` and `packages/ui-library/src`**, reached by successive
widening. Each step is a scope change with its own re-seed, and
18-project-context-and-implementation-status.md records which subset each floor
covers at the time it was set.

**This generalises past coverage.** Any ratcheted metric over an enumerable set
has the property — lint counts scoped to a path glob, bundle budgets over an
entry list, performance budgets over a route set. **Whenever the set can grow,
the growth is its own change.**

---

## 16 — Code Review Checklist
**Tier:** 1
**Status:** APPROVED — REVISION 2

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
This is a PR-review checklist cross-referencing the other standards
files. It does not restate their reasoning — each item below is the
checkable rule itself, cited to the file that established it. If a
reviewer needs a check this file doesn't cover, that's a gap in the
source file to raise separately, not something to invent here.

**Not all cited files are approved yet, and that changes how a
reviewer should use this list.** An earlier revision described this
file as cross-referencing "every other **approved** standards file,"
which was inaccurate: items below cite 02, 07, 09, 12, 13, 14, and 15,
all of which are **DRAFT — pending Yogesh review**. Those checks are
still worth applying — they reflect real investigated decisions — but a
reviewer should raise a disagreement with one as a question against the
source file rather than treating it as settled policy. Checks citing
00, 01, 03, 04, 05, 06, 08, 10, and 11 are backed by approved files and
carry full weight. This file itself is DRAFT.

### RBAC / Security
- [ ] No `user.role === 'X'` checks anywhere — named-permission checks
  only, via `hasPermission()`/`usePermissions()` (00, 08)
- [ ] No hardcoded color/copy/business value without a token/i18n-key
  trace, or an explicit flagged exception (00)
- [ ] Any `dangerouslySetInnerHTML` usage has already been through an
  escaping step before render — never on raw content (13)
- [ ] CSP `connect-src`/`frame-src` include
  `https://login.microsoftonline.com` if this PR touches auth/MSAL
  config (13) — note this remains partially placeholder-dependent on
  real API origins, not yet fully finalized (13)
- [ ] **Any new or renamed `VITE_*` variable is declared in
  `env.d.ts`'s `ImportMetaEnv`**, with a docblock, and carries nothing
  credential-shaped — no API key, connection string, token, or secret.
  `env.d.ts` is the authoritative inventory: a `VITE_*` var in `.env`
  or `vite.config.ts` that is not declared there fails this check.
  Being consumed only in `vite.config.ts` is **not** an exemption —
  the prefix is what exposes it to the client bundle (13)
- [ ] If this PR adds a `VITE_*` var, `.env.example` gains it too —
  `.env` is gitignored and per-developer, so `.env.example` is the only
  file that communicates the contract to anyone else (13)

### TypeScript
- [ ] No `any` anywhere — `unknown` + narrowing, or a documented
  `.d.ts` shim for untyped libs (02)
- [ ] Domain values use string literal unions + `as const`, never
  `enum` (02)

### Structure / Naming
- [ ] New feature folders stay flat until ~15 files or 2+ distinct
  sub-concerns (01)
- [ ] No new folder named "shared" outside `src/components/shared/`
  (01)
- [ ] Components: default export. Non-component modules (hooks,
  stores, services, utils, types): named exports only (14)
- [ ] A new component with a heavy third-party dependency excludes its
  value export from the main barrel, keeps types in the main entry
  point (14)

### Component patterns
- [ ] Multi-value callback props use `<name>` + `on<Name>Change`
  pairs, not one generic `value`/`onChange` (03)
- [ ] No manual `useMemo`/`useCallback`/`React.memo` added without a
  specific, stated reason the Compiler can't cover (03)

### State / Auth
- [ ] `currentUser` is never written directly — only via `setUser()`
  (04)
- [ ] `cacheLocation` is **written explicitly** as
  `BrowserCacheLocation.SessionStorage`, never omitted and never left
  to fall through. `sessionStorage` *is* MSAL's own default, so an
  absent `cacheLocation` produces the right value by accident — that
  is not acceptable here: 08 ratifies the default as a deliberate,
  conditionally-approved decision, and the config must show it was
  chosen. An omitted `cacheLocation` fails this check (08)
- [ ] `cacheRetentionDays: 0` is set explicitly — MSAL v4 defaults to 5
  days of retained cache artifacts (08)
- [ ] Any change to token storage/`cacheLocation` is flagged for
  explicit review, including any CSP change to `'unsafe-inline'` or
  `'unsafe-eval'` — 08's storage decision is conditional on the strict
  CSP, so loosening the CSP reopens the storage decision (08, 13)
- [ ] Redirect targets for auth failure vs. authorization failure are
  not conflated — different destinations (08)

### API / Data
- [ ] New API response schemas are strict by default; any lenient/
  optional field cites a specific, already-documented backend gap —
  not a new blanket leniency (05)
- [ ] `useTranslation()` is never called bare — always with an
  explicit component namespace (09)
- [ ] No date, number or unit is formatted inline in a component —
  `shared/format/` owns all four (21)
- [ ] A new user-facing error message maps from an Appendix E error code
  through the single error-message module, not an ad-hoc string
  (22-error-handling-and-user-feedback.md)
- [ ] No `console.log` in committed code; a logger call carries a stable
  message key and no prohibited field (21)

### Documentation
- [ ] Any standards change was made in the **tier file** under
  `PQMS_docs/standards/`, never in the generated distribution document
  (00). If the diff touches
  `PQMS_docs/Frontend-Development-Standards-v1.0.md` and no tier file,
  that is a hand-edit and will be lost
- [ ] The generated document was regenerated in the same PR —
  `pnpm docs:standards` — so `docs:standards:check` passes (15)

### Testing
- [ ] Coverage thresholds (85/85/85/85, per 10) are met, not lowered to
  pass CI — and the run covers **all packages**, not just the portal
  (10, 15)
- [ ] A new fixture goes through the same mapper and the same Zod schema
  a real response would, and is used by both fixtures mode and the test
  suite — never a second set (26)
- [ ] A new `ui-library` component has a story per union value and per
  non-default state (24)
- [ ] No `data-testid` added preemptively — query by role, label or
  text. A new `data-testid` is justified only where an element has no
  stable accessible name, and is worth a second look when it appears,
  since that is often an a11y defect rather than a testing need (10)
- [ ] If this PR renames or removes a `data-testid` that an existing
  Playwright spec queries, **that spec was updated in the same PR**.
  No unit test catches this — the component's own tests pass in
  isolation while e2e coverage breaks silently (10)
- [ ] New a11y-plugin rule violations are fixed, not disabled — an
  `eslint-disable` on jsx-a11y rules requires an inline justification
  comment, matching the documented wrapper-component exception pattern
  (11)

### Styling
- [ ] No arbitrary-value Tailwind classes where a real token exists
  (06)
- [ ] Conditional className logic uses the shared `cn()` utility,
  never plain string concatenation (06)
- [ ] **No `className` prop on a `ui-library` component.** A screen
  needing a look the variants do not cover adds a variant to the
  component; it does not style around it from the call site (06). App
  components in `apps/portal` are not bound by this
- [ ] A new variant value exists in the prototype. Variant sets are
  enumerated from it, not extrapolated to a conventional set
  (06, `component-specs/TEMPLATE.md`)

### Performance
- [ ] Any new lazy-loaded heavy component (editor, chart, etc.) has
  its Suspense + ErrorBoundary scoped narrowly around itself, not
  around a containing form or tab (12)
- [ ] New route/lazy chunks are checked against the ~150KB gzipped
  per-chunk budget (12)

### Routing
- [ ] No data-fetching logic added inside a loader — loaders are
  param-validation/redirects only; view data comes from a TanStack
  Query hook (07)

### Forms, tables and overlays
**Owned by 27-forms-tables-and-overlays-review.md**, which carries a
checklist section for each. Not restated here: those three surfaces are
most of this product, their checks are long, and a list this file could
not keep current is worse than a pointer.

Apply 27 whenever a PR touches a form, a table, or anything portaled.

### Before the review — the author's gate
**Owned by 28-definition-of-done.md.** This file is the reviewer's list;
28 is the author's, and it runs first. A reviewer who finds a DoD item
unmet should say so and stop, rather than reviewing work that was not
ready — that is not pedantry, it is the difference between one review
round and three.

### CI / Merge
- [ ] Both `quality` and `e2e` CI jobs pass, plus at least one review
  — **stated in 15 as a policy recommendation, NOT yet a
  confirmed-active GitHub branch-protection rule** (15). This
  distinction matters for review conduct: a reviewer should still
  apply this bar by convention, but should not point to it as an
  enforced gate the platform itself guarantees.

---

## 17 — Domain Glossary and Business Context
**Tier:** 2
**Status:** DRAFT — pending Yogesh AND Claude review (this file's review
process differs from the others: it is BMAD-authored and was
cross-checked term-by-term against a real implementation of this
product; neither party should treat this version as final)

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
**The domain vocabulary this app implements**, and the authority for
what each term means. Every term below is either implemented in a prior
working implementation of this product (repo `kus-pqms`) or sourced from
the customer's own business artifacts — and each entry says which.
Anything that could not be pinned to a source is in the "Unconfirmed"
section at the end rather than folded silently into the glossary.

**Why the sourcing matters here more than in most glossaries**: this
product's business artifacts describe modules, roles, and entities that
were never built, and a previous planning-level glossary
(`frontend/docs/ai/business-domain-glossary.md`, dated 2026-07-08,
BRD/DRD/HLD-sourced) documented them all as though they were. This file
supersedes it. Terms here are labelled by whether they are
**implemented behaviour**, **committed requirement**, or
**unconfirmed** — because the three are not interchangeable and
conflating them is how fabricated scope enters a codebase.

### How to read the citations
- **"Provenance: `kus-pqms` …"** — this term was implemented and
  working in the prior Vue implementation of this product. The file
  path is given so the claim is checkable. Treat these as the domain
  model the new app implements.
- **BRD/HLD references** — a committed customer requirement, cited to
  the artifact. Binding regardless of whether anything was built.
- **"Unconfirmed"** — named in the section at the end. Not to be
  implemented on the strength of this file.

**One scoping rule that applies to every citation below.** Bare source
paths and filenames in this file — `IssueList.vue`,
`classification.service.ts`, `AppHeader.vue`, `workspace.types.ts` and
the rest — **all refer to `kus-pqms`**, the prior Vue implementation,
under `frontend/apps/pqms-portal/src/`. None of them exists in this
repository. They are cited so a domain claim can be checked against a
working implementation rather than taken on trust; they are never
instructions about where to put anything here (01 owns that). Where a
path points somewhere other than `kus-pqms`, it is written out in
full.

### Prototype register
The designer's prototype HTML is one of only two sources for visual
structure and user-facing copy (the other being this corpus itself).
**This section is the single place any prototype path is recorded.**
Every other file that needs one cites it **by role, through this
register** — never by filename.

| Role | Prototype file | Status |
|---|---|---|
| SE | `requirements/ISM SE Role.html` | Active, under revision |
| *(other roles)* | not yet produced | Planned — one per role |

**These are repo-root paths, not `pqms-portal/`-scoped ones.** The
prototypes live outside `pqms-portal/`, so 00-core-rules.md's
`pqms-portal/`-prefix convention does not apply to this table.
`pqms-portal/docs/requirements/` does not exist — prefixing these paths
would make them unresolvable.

#### Updating this register
When the designer renames the prototype, or adds a role-specific one:

- **Edit only the table row above.** Change the path cell; change
  nothing else. No other file in this corpus cites a prototype
  filename, by design, so a rename is a one-cell edit.
- **A new role prototype is a new row, never a replacement.** Add the
  role and its path. Do not overwrite an existing row, and do not
  consolidate rows into a single "latest" reference.
- Nothing in the prose around the table repeats a path, so none of it
  needs rewriting when one changes.

#### This file is a moving target, not a frozen artifact
The prototype is **actively being revised by the designer** and has
already been renamed **at least three times**. It is
current-as-of-today, not a fixed reference. **Anyone citing it must
confirm the current filename** rather than assuming a name from an
earlier document, commit, or conversation still resolves. A stale
prototype filename is the most likely broken reference in this corpus.

**Standing note: file modification dates are not evidence of currency
anywhere in this repository.** A `git pull` rewrites the mtime of every
changed file, so a file's modification date records when someone last
pulled it, not when its author last edited it. This applies to every
file in the repo, not just prototypes.

This is recorded because an earlier analysis of this very register
reached a **wrong conclusion** from exactly that inference — ranking
prototype candidates by mtime and treating the most recently stamped
file as the likely current one. It is not a reliable signal here and
must not be used as one. Confirm currency with the person who owns the
artifact instead.

#### A second file in the same folder is not a role variant
`requirements/PQMS_SE.html` sits alongside the registered SE prototype
but is **not** a role-specific variant and is **not** in this register.
It is a separate candidate left over from an earlier
prototype-identity investigation, with fewer screens than the
registered file (no QIR Analytics, no Notifications), and that
investigation was never resolved with the designer. `ISM SE Role.html`
is the file this register names as authoritative — a reader who
encounters both files should not simply pick whichever one they see
first.

#### Role-specific prototypes are planned — siblings, not replacements
The designer will produce a **separate prototype per user role**. When
a second file lands it is a **sibling** of the SE prototype, not a
successor: the SE prototype remains valid for SE, and the register
gains a row per role as they arrive. Do not treat a newer
role-prototype as superseding an earlier one, and do not consolidate
them into a single "latest" reference — that would discard exactly the
per-role distinction they exist to express.

#### Consequence for the permission model
**This question is now resolved with a bigger answer than expected.**
The BRD's real role and permission model (§7.2–§7.4, five roles:
SE/ASM/PQM/ADMIN/VIEWER, a 38-row authorization matrix, server-resolved
permissions per FR-SEC-011) supersedes the prior "is the two-value
capability model complete against NFR-05" open question tracked in
18-project-context-and-implementation-status.md — see
08-authentication-and-authorization.md's "Permission model" for the
rewritten design. If per-role prototypes land showing materially
different screens, actions, or fields, that remains useful confirming
evidence against the BRD's matrix, but the matrix itself — not the
prototypes — is now the authoritative source (BRD §7.2: "the matrix is
authoritative, the capability ordering is not").

### Core Entities

- **Issue** — the central record in Issue Management. Has a `title`,
  `part`, one or more `sources`, one or more `models`/`modelYears`, one
  or more `modelCodes`, a classification (`category`/`part`), and a
  lifecycle `status` (see Status/Lifecycle Values below). Confirmed via
  `api/issues.ts`'s `IssueListItem`/`IssueStatus` types.
- **System Classification** — the category/subsystem/component/symptom
  taxonomy used to classify an Issue. Confirmed real: a dedicated
  `classification.service.ts` calls real `/classification-keys/*`
  endpoints (`systems`, `subsystems`, `components`, `symptoms`), each
  optionally scoped by a parent code for a cascading picker (Issue
  Entry's Step 3), or called with no params to return every value at
  that level (Issue List's filter drawer).
- **Model Code** — a vehicle model-code identifier (e.g. `"MV"`,
  `"NX4"`). Confirmed real in `IssueListItem`'s `models` field: "always
  an array, even when an Issue has exactly one code," rendering as
  plain text for one code or a "{N} MC" popover trigger for multiple.
- **DTC** — **Diagnostic Trouble Code** (BRD/NPQMS-ISM-customized-BRD.md,
  C1.0, draft for ratification, 2026-08-20, Appendix A — Glossary).
  Resolved; the prior placeholder on this expansion is closed. Used
  throughout the codebase (`DtcTypeahead.vue`, `DtcOption`,
  `DtcChipValue`, `dtcCategoryColors`) as a picker/chip value tied to a
  "category" and color, attached to an Issue — consistent with the
  BRD's usage (FR-ENT-007: capture of one or more DTC codes, max 20 per
  issue).
- **Same Existing Issue** — a real, named feature: a panel/modal
  (`SameExistingIssuesPanel.vue`, `SameExistingIssuesModal.vue`,
  `SameExistingIssueCard.vue`) surfacing issues that may duplicate the
  one being entered or edited, used both during Issue Entry and inside
  Issue Details' Edit Issue flow (`SameExistingIssuesSection.vue`).
- **Linked Issues** — a real, named feature: `LinkedIssuesPanel.vue`
  under `IssueDetails/linked/`, plus `LinkedIssueCard.vue` and an
  `IssueLinkSearchModal.vue` for adding a link. Distinct from Same
  Existing Issue: Same Existing Issue surfaces likely-duplicate
  candidates at entry/edit time; Linked Issues is an explicit,
  user-created association between two already-registered Issues.

### Roles & Capabilities

**Superseded by the BRD's real role model.** The prior "real,
implemented" model here (`stores/auth/auth.store.ts`, three roles) was
`kus-pqms`'s shape, not a committed requirement. BRD C1.0 §7.2 commits
to **five** system roles:

- **`SE`** — Service Engineer. `propose` capability — creates,
  investigates, proposes; never approves. Primary issue-entry/day-to-day
  user. Default data scope: "My issues."
- **`ASM`** — **After-Sales Manager / Service Engineer Manager**. A
  deliberate compound title (BRD Appendix A; contradiction X-2 in
  §0.6) — **resolved**, not an unresolved three-way naming conflict.
  The prior conflict tracked here (BRD stakeholder table vs. HLD role
  table vs. `kus-pqms`'s shipped "After-Sales Mgr." label) is closed by
  the BRD's own consolidation: one capability role model with a
  normative organisational-role mapping (Appendix B.1). `override`
  capability. Default data scope: "All issues."
- **`PQM`** — Product Quality Manager. `override` capability, final
  disposition authority. Default data scope: "All issues."
- **`ADMIN`** — System Administrator. `administer` capability — full
  configuration and user management. **New role, not in the prior
  three-role model.**
- **`VIEWER`** — Read-only stakeholder (PQ Department Head, NAQC,
  auditor). `view` capability, all issues, read-only. **New role, not
  in the prior three-role model.**

**Permission model**: the frontend does not reimplement the BRD's
38-row authorization matrix (§7.3) as coarse capability values. It
consumes named permission flags from a server-resolved-permissions
object (FR-SEC-011). 08-authentication-and-authorization.md owns the
full design — see its "Permission model" section. This retires the
prior open question ("are two capability values sufficient against BRD
NFR-05") with a bigger answer: the real model is neither two values nor
a simple four-tier expansion of them, but a full per-action matrix
across five roles.

**The old business glossary's persona list still does not map cleanly
onto this**, but the mapping gap itself is now much smaller. BRD
Appendix B.1 is the normative organisational-role → system-role
mapping: Service Engineer → `SE`; Service Engineer Manager → `ASM`; PQ
Department Head → `VIEWER`; PQ Management (disposition authority) →
`PQM`; Administrator → `ADMIN`; NAQC → `VIEWER`. The old glossary's
`QE`/`TE`/`DE`/`CE`/`DM`/`PM`/`Director` personas and a separate `Admin`
role are not part of this mapping and remain without a confirmed
system-role equivalent.

**`CE` and `DM` remain genuinely open** — not resolved by C1.0. BRD
C1.0 was checked directly (full glossary, Appendix A, and the
role-mapping appendix, B.1) and defines neither term. This is not an
oversight in this file's reading; the terms simply are not in the
consolidated BRD. See "Unconfirmed" below.

### Screens / Workflows

The module list is **Overview, Issue Management, QIR (Management), TSB
(Management), Notifications, Admin** — six modules, matching
07-routing-and-layouts.md's route tree. Of these, **Issue Management is
the substantial one**; Overview, QIR and TSB are single stub screens,
and Admin has no routes yet.

Provenance: this list is confirmed against `kus-pqms`'s
`frontend/apps/pqms-portal/src/router/routes/*.ts` and its
`frontend/CLAUDE.md`, where the same six existed with the same
build-status split.

**Issue Management's screens and sub-areas:**

- **Issue Entry** — the issue-creation flow.
- **Issue List** — the issue-list/grid screen, with a
  `SameExistingIssue/` sub-feature for duplicate-candidate surfacing at
  list level.
- **Issue Workspace** (BRD screen `ISM-WSP`, legacy id `ISM0040`) — the
  per-issue record, in **five sections**: **Detail** (issue, vehicle,
  classification, source evidence, related records, scoring summary),
  **Investigation** (activities, evidence, parts requests, hypothesis and
  suspected root cause), **Resolution** (disposition, linked QIR, root
  cause, countermeasures, closure), **Communication** (internal and
  external comment threads, shared documents), and **History** (activity
  history and audit history, searchable and date-filtered). A
  linked-issues surface and an edit flow sit alongside these sections.
  Source: BRD C1.0 §8.1 and §8.2.

- **Five, not six — and the difference is a real correction.** An earlier
  revision of this entry described a **six-tab** model with a
  `sharing` tab. That was `kus-pqms`'s shipped structure, described
  accurately as the prior implementation, but it was then read downstream
  as current scope — 08-authentication-and-authorization.md carried a
  permission call site for a Sharing tab on the strength of it. **BRD
  C1.0 names no Sharing screen and no Sharing row**; see 08's "The
  Sharing tab: a scope question before a matrix question" for the three
  possible resolutions and why none of them is "pick a matrix row".

- **Two further naming changes from the prior model**, both worth knowing
  because deep links and code identifiers carry the old words: the prior
  `activity` tab is the BRD's **History** section, and the prior
  `overview` tab is its **Detail** section. Scoring is not a section —
  BRD `FR-WSP-006` puts a scoring **summary** in Detail with a link to a
  fuller view, and whether that view is a sixth tab, a sub-route or a
  modal is **[PLACEHOLDER — BRD §8.1 lists `ISM-WSP-S` as a Workspace
  child while §8.2's tab strip lists five sections. Resolved by: a PQM
  ruling. Trigger: before the Workspace shell is built.]**

- **The legacy deep-link remap is now a decision, not a historical
  note.** `kus-pqms` kept a `LEGACY_TAB_REMAP` in
  `workspace.constants.ts` translating an even older 9/10-tab key set
  (`qir`, `disposition` → `resolution`; `actions` → `investigation`;
  `chronology` → `activity`; `scoring` → `overview`). Under the BRD's
  five sections there are **two** generations of keys that no longer
  resolve. **If any external system, bookmark or notification email holds
  a Workspace deep link, a remap is a requirement.** Decide deliberately
  rather than by omission — see 07-routing-and-layouts.md, which owns the
  section-addressing scheme.

**QIR and TSB/Publication exist as concepts an Issue can reference,
ahead of their own screens being built.** Issue Details' Resolution tab
carries a related-QIR section and a related-publication/TSB section.
Provenance: both were real in `kus-pqms`
(`RelatedQirSection.vue`, `RelatedPublicationSection.vue`) while the
top-level QIR and TSB modules were still stubs — so the cross-reference
is the older, better-established half of each concept.

### Backend Services

Six real services exist in `infrastructure/kubernetes/` and
`backend/`, confirmed via `infrastructure/README.md`'s own Docker
table. What each one actually does, to the extent confirmable from
real frontend/infrastructure code:

- **`issue-management`** (port 9091) — confirmed real and consumed
  today: `issue.service.ts` (issues), `assignee.service.ts`
  (`/api/v1/assignees`, the person-directory the portal actually
  reaches). The frontend's catch-all `/api` proxy path routes here.
- **`master-data-management`** (port 8086) — confirmed real and
  consumed today: `master-data.service.ts` and
  `classification.service.ts` (`/classification-keys/*`) both target
  this service via the frontend's `/api/v1/master-data` and
  `/api/v1/classification-keys` proxy paths.
- **`pqms-notification-service`** (port 9095) — confirmed real and
  consumed today: `notification.service.ts`, routed via the frontend's
  distinct `/api/notification` proxy path (its own base path
  convention, `/api/notification/v1`, differs from the other two
  services').
- **`user-management`** (port 8081) — confirmed to **exist** (a real
  `/api/v1/users` API, per `assignee.service.ts`'s own comment) but
  confirmed **unreachable from the frontend today**: that same comment
  states plainly there is "no gateway routing the portal's single
  `VITE_API_BASE_URL`" to it, which is exactly why the assignee roster
  (a thinner, `issue-management`-hosted directory) exists as a
  workaround instead.
- **`pqms-configuration-server`** (port 8888) — confirmed to be a
  Spring Cloud Config Server (per `infrastructure/README.md`'s own
  environment-matrix note referencing "Spring Cloud Config Server's
  native profile documents" and the standard Spring Cloud Config
  Server port). This is configuration-management infrastructure, not a
  business-domain service — no frontend service file references it at
  all.
- **`pqms-workflow-engine`** (port 8080) — confirmed **real but
  explicitly a skeleton**: `infrastructure/README.md` states outright
  "that service is currently a skeleton (see its own README) — don't
  treat it as ready to actually deploy yet." No frontend service file
  references it. Its actual business purpose (workflow/approval
  automation, matching QIR's engineer→manager→coordinator flow
  described in the old glossary) is a plausible inference from the
  name only. No `kus-pqms` service file referenced it, so nothing
  confirms the inference — see "Unconfirmed" below.

### Status / Lifecycle Values

**Eight values, from BRD C1.0 §9.1**, ratified as `DEC-01`. This is the
customer's signed business vocabulary and it is the only lifecycle
vocabulary this app has. 02-typescript-standards.md carries the union's
declaration; this file carries what each value means.

| Value | Label | Meaning | Terminal? |
|---|---|---|---|
| `OPEN` | Open | Newly registered; not yet under active investigation. | No |
| `INVESTIGATING` | Investigating | Investigation is actively in progress. | No |
| `MONITORING` | Monitoring | The condition is being observed over time rather than actively investigated. Carries a monitoring frequency and a next review date. | No |
| `QIR_ESCALATION` | QIR Escalation | The issue has entered the QIR escalation process. | No |
| `TOP_ISSUE` | Top Issue | Escalated to the Top Issue process. | No |
| `RESOLVED` | Resolved | Resolved through countermeasure, publication or other corrective action. | No |
| `OUT_OF_SCOPE` | Out of Scope | Does not belong to PQMS — Safety, Regulatory, or another department. Carries a receiving department. | **Yes** |
| `CLOSED` | Closed | Investigation concluded, or the reported condition is not an actual issue. | **Yes** |

**Terminal means terminal.** Reopen is out of Phase-1 scope (`DEC-12`),
because it needs a records-retention ruling on whether a reopened issue
is the same record or a successor and nobody has asked Legal. Until then
the correct response to "this was closed in error" is a **new issue
linked to the closed one**.

#### This replaces a ten-value set, and the difference is not cosmetic
An earlier revision of this section documented **ten** lowercase values
from `kus-pqms`'s `api/issues.ts` — adding `draft` and `pendingApproval`
to the eight above, and using `escalated` where the BRD has
`QIR_ESCALATION`. That set was real, shipped code. It was **not** a
committed requirement, and per 00's Source precedence the BRD governs
which states an issue may occupy.

The two dropped values are dropped **with** their mitigations, not left
as gaps:

- **`draft`** modelled the entry form's working copy. Under C1.0 that is
  an **entry draft** (BRD `FR-ENT-030`…`034`): a per-user, server-persisted
  copy of the form with no Issue ID, invisible in every list, count,
  export and search, purged at 30 days. It is a different entity, not a
  status.
- **`pendingApproval`** modelled a status change awaiting sign-off. Under
  C1.0 approval is a property of the **transition**: a gated transition
  creates a `PROPOSED` lifecycle record and the issue's own status is
  unchanged until an `override` role approves it (BRD `§9.4`).

**Do not reintroduce either as a status to model those cases.** A `draft`
member puts a non-record in the same vocabulary as a record; a
`pendingApproval` member makes the BRD's `§9.3` transition matrix
unrepresentable.

**The "V5 mockup" references are retired with the ten-value set.** They
came from `api/issues.ts`'s own comments, naming a version rather than a
file, and whether "V5" was a prototype version or a separate artifact was
never established. Nothing now depends on the answer.

### What was corrected or dropped from the old glossary, and why

- **"CAPA" is unverified and unresolved — not carried forward, but not
  proven fabricated either.** Correcting an over-claim in an earlier
  revision of this file, which called it "confirmed fabricated" and
  attributed that conclusion to the old glossary. The old glossary does
  not draw that conclusion. What it states directly is the absence:
  "No 'CAPA' module appears anywhere in the BRD, DRD, or HLD documents
  (zero text matches across all three)" — and then explicitly declines
  to resolve it, saying it "is flagged as an **assumption requiring
  clarification** rather than resolved here," and listing three live
  possibilities: that "CAPA is planned business scope not yet captured
  in these artifact versions," that it is "a generic architectural
  placeholder using industry-standard terminology (Corrective and
  Preventive Action)," or that "the package name should be reconciled
  with one of the modules above (most likely QIR Management)."

  Where it does appear is `frontend/docs/architecture/security/
  authentication.md`'s target monorepo structure, as a
  `packages/features/capa/` package. So the accurate statement is:
  absent from all three business artifacts and from every line of
  `kus-pqms`, present only in one target-architecture doc, and
  **unresolved between
  planned-scope and placeholder** — needs Yogesh to say which, which is
  why it also appears under "Unconfirmed" below rather than being
  closed here. Not carried forward into this glossary, because a term
  nobody can define is not a domain term yet — but "don't carry it
  forward" is a scoping decision, not a finding of fabrication.
- **"Publication Management" is real business scope, not fabricated —
  corrected from an earlier, too-broad flag.** An earlier investigation
  (checking only routes/CLAUDE.md/standards files) flagged "Publication
  Management" alongside "CAPA" as having zero trace anywhere. That was
  too broad: the BRD/DRD/HLD-sourced glossary documents it as a real
  Phase-1 business module (TSB authoring/lifecycle), and `kus-pqms`
  referenced "Publication" and "TSB" as live concepts (the Resolution
  tab's `RelatedPublicationSection.vue`, and a real `tsb` route). What
  has never been built is a *standalone* Publication Management screen
  beyond the TSB stub — a build-status gap, not fabricated scope, and
  this file corrects the earlier over-broad flag rather than repeating
  it.
- **QE, TE, DE, CE, DM, PM, Director, and a separate `Admin` role are
  dropped from the active glossary** — none appeared in `kus-pqms`'s
  `Role` type, capability map, or any UI label. They may be real,
  planned future personas (the old glossary is a planning artifact, not
  a claim about what was built), but this glossary documents the
  implemented model; see "Unconfirmed" for how to treat them.
- **The Data Model section (USER/ROLE/FEATURE tables, ISSUE_LINK,
  SUGGESTED_ISSUE_LINK, per-source-channel tables, etc.) is not carried
  forward at all** — none of it was ever checked against a real backend
  schema (out of scope: this glossary cross-checks against
  frontend/infrastructure sources, not backend database schemas), so
  including it here would repeat the old glossary's unverified-claim
  problem rather than fix it.

### Unconfirmed / needs Yogesh input

- ~~**DTC**: expansion unconfirmed~~ **Resolved.** BRD C1.0 Appendix A
  defines DTC as "Diagnostic Trouble Code." See "Core Entities" above.
- ~~**`ASM`'s spelled-out meaning conflicts across three real sources**~~
  **Resolved.** BRD C1.0 Appendix A gives `ASM` as "After-Sales Manager
  / Service Engineer Manager" — a deliberate compound title, not a pick
  among the three prior conflicting expansions (contradiction X-2 in
  §0.6). See "Roles & Capabilities" above.
- **"CAPA" — planned scope, or an architectural placeholder?** Zero
  text matches across the BRD, DRD, and HLD, and zero trace in real
  code; its only appearance is as a `packages/features/capa/` package
  in `frontend/docs/architecture/security/authentication.md`'s target
  monorepo structure. The old glossary flagged this as "an assumption
  requiring clarification rather than resolved here." It remains
  unresolved: needs Yogesh to say whether CAPA is real planned business
  scope not yet written into the artifacts, generic industry
  terminology (Corrective and Preventive Action) that entered a
  structure diagram by habit, or a name that should be reconciled with
  QIR Management. Until then it is neither a domain term nor a
  confirmed fabrication. See "What was corrected or dropped" above.
- **`CE` and `DM` each conflict between two real sources, the same
  defect class as `ASM` above — not merely "personas with no code
  trace."** Both appear in the HLD's role table
  (`frontend/docs/artifects/PQMS-HLD-08JUN2026-2.md` §6.2.3) *and* in
  the old business-domain glossary's persona list, with materially
  different meanings in each:
  - **`CE`** — the HLD says **"Communications Editor,"** described as a
    "Technical Communications / Publications Engineer responsible for
    TSB authoring, multi-team review coordination, and publication
    management." The old glossary says **"Component Engineer,"**
    described as "mostly read-only access across ISM screens;
    component-level review." These are not two labels for one job: one
    authors and owns TSB/publication lifecycle, the other is a
    read-only reviewer. The expansion *and* the scope both conflict.
  - **`DM`** — the HLD says **"Department Manager,"** described as a
    "Senior management role responsible for final approval authority on
    QIRs and TSBs, KPI review, and escalation management." The old
    glossary gives no expansion at all and describes it as a
    "limited-access reviewer role," noting the abbreviation "appears in
    the DRD's access matrix without a full spelled-out definition in
    the BRD's stakeholder table — flagged as needing clarification."
    So one source supplies a name and top-of-hierarchy approval
    authority; the other supplies no name and minimal access. This is
    the sharpest authority-level conflict of the three, `ASM`
    included.

  **Still open — not resolved by BRD C1.0.** BRD C1.0 was checked
  directly for both terms (its full glossary, Appendix A, and its
  role-mapping appendix, B.1) and defines neither `CE` nor `DM`. Unlike
  `ASM`, which C1.0's consolidation explicitly closed, these two simply
  don't appear in the consolidated document — so this is not a case of
  "check a newer source and the conflict resolves itself." Needs Yogesh
  to confirm both, for the same reason as before: this glossary should
  not silently pick one reading among two. Note the additional caveat
  that four rows of the HLD table (`CE*`, `ASM*`, `DM*`, `PQM*`) carry
  an asterisk whose meaning is **not explained anywhere in that
  document** — so it cannot be determined from the HLD whether those
  four rows are current, proposed, or phase-2. That unexplained marker
  covers both roles above and `ASM`'s pre-C1.0 conflict.

  Tracked in 18-project-context-and-implementation-status.md; that
  entry points here for the detail, which is what this record
  supplies.
- **`pqms-workflow-engine`'s actual business purpose is unconfirmed.**
  It's real infrastructure (a Kubernetes manifest and Dockerfile exist)
  but explicitly a skeleton with no frontend consumer yet. This file's
  "matches QIR's approval flow" note is a plausible guess from the
  service's name only, not a verified fact — needs confirmation once
  the service has real functionality to check against.
- **QE/TE/DE/CE/DM/PM/Director/Admin (business personas with no code
  trace)**: are these still-planned future roles (in which case they
  belong in this glossary as explicitly future/unimplemented), or
  stale business-planning language superseded by the real
  `SE`/`ASM`/`PQM` model? Needs Yogesh to say which, since the answer
  changes whether future RBAC work should expect more roles to be
  added later. **For `CE` and `DM` this is the second of two open
  questions, not the only one** — see their conflict entry above; a
  "still planned" answer for either is incomplete until it also says
  *which* of the two conflicting definitions is the planned one.
- **Whether "QE (Quality Engineer)" in the old glossary and the real
  `SE` role are the same persona renamed, or two different roles**,
  given `SE`'s real UI label is "Service Eng./Service Engineer," not
  any variant of "Quality Engineer." Stated as an open question, not
  resolved here.

---

## 18 — Project Context and Implementation Status
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

### Implementation status — what exists, as of 2026-08-24

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

#### Summary

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

#### Built and conforming
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

#### Absent — the enforcement layer
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

#### Absent — the environment contract
Three artifacts that other standards depend on for *their* enforcement:

- **`env.d.ts` has no `ImportMetaEnv` interface.** 13 makes that
  interface the authoritative `VITE_*` inventory and builds its whole
  mechanism on it, so **nothing currently enforces the `VITE_*` rule.**
- **No `.env.example`.** 13 calls it the only file a new developer reads.
- **No dev-server proxy** in `vite.config.ts`, which 20 quotes verbatim
  with an ordering warning.

#### Absent — application layers
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

#### Divergences worth naming
Neither is a defect; both are undocumented deviations from a table this
corpus calls authoritative, which is the same class round 3 raised.

| Divergence | Detail |
|---|---|
| Package scripts | `clean`, `prepare` (root); `test:unit`, `storybook`, `build-storybook` (portal); `build`, `storybook`, `build-storybook` (`ui-library`); `build` (`design-tokens`) are all specified in 20 and absent. **`turbo.json`'s `typecheck` declares `dependsOn: ["^build"]`, which resolves to nothing for two of three packages** until the missing `build` scripts exist. |
| ESLint `ignores` | The actual array uses `**/*.css` and `PQMS_docs/**`; 20 specifies the two token-file paths individually plus three others. The actual version is arguably better and is still an undocumented deviation. |

#### Two open questions this snapshot raised
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

#### One unresolved provenance question
Review round 3 records reading "`BaseButton`…and its spec" and
"`AppHeader`…and its spec". **`PQMS_docs/component-specs/` contains only
`TEMPLATE.md` and `INVENTORY.md`.** Either those specs were removed, or
they live somewhere this reading did not look. Unresolved, and worth
resolving — a spec that existed and was deleted is a different situation
from one that never did.

### Register scope — widened
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

#### Open placeholders, by owning file

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

### Decisions blocked on React port (tracked here, not scattered)

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

### A fourth source, and what it did to this register

`../analysis/vue-baseline-audit.md` (2026-08-24) audits the shipped Vue
portal's **code**, which no previous revision of this corpus had read.
00-core-rules.md ranks it: evidence, below all three existing sources, never
authority. It is a **reference** document under
31-documentation-standards-and-decision-records.md — dated, method-stated,
regenerated rather than patched.

It raised **four new placeholders**, all now in the table above, and it changed
the status of one already there.

#### Two `tokens.css` files — the ambiguity is inherited, not introduced
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

#### One unresolved provenance question, still unresolved
The audit did not find the missing `BaseButton` and `AppHeader` component specs
recorded by review round 3. `component-specs/` still holds only `TEMPLATE.md`
and `INVENTORY.md`. Whether those specs were deleted or never existed remains
open, and remains worth resolving.

#### What the audit did **not** change
No status in the summary table above. The audit read a different repository; it
says nothing about what this scaffold contains. **That section is still
regenerated by re-reading this repository, and it is still dated 2026-08-24 on
the strength of that reading, not this one.**

### Closed in this revision — nine placeholders, and how each closed

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

#### What this changed about the corpus

15-devsecops-and-ci-cd.md carried **six** open questions — the most of any file
— and the pipeline could not be built without answering three of them. It now
carries none. 23-git-workflow-hooks-and-commits.md's two questions blocked all
three hooks and both were answerable by looking at the repository, which is the
uncomfortable part: **they were open because nobody had looked, not because the
answer was hard.**

The general lesson for the remaining open rows above: **before deferring a
question to a person, check whether the repository already answers it.**

### The target repository changed — what that did to this register

The client's `project-template-java` documentation (`TEAM-GUIDE.md`,
`STACK.md`, `DEVELOPER_GUIDE.md`) arrived after the corpus was written, and it
describes a materially different target: **GitLab CI not GitHub Actions,
Lefthook not Husky, TypeScript 5.9 not 6, a split coverage floor, no state
library, and a SPEC-driven harness.** 00-core-rules.md lists all eight
corrections.

#### Placeholders this closed on client evidence

| File | Question | Closed as |
|---|---|---|
| 08 | Does the browser hold a token | **Yes.** `STACK.md` §7: OAuth2 JWT **Bearer** with an API Gateway JWT authorizer — the gateway validates, it does not terminate |
| 07 | `AuthLayout` — build it or not | **Build it.** A Bearer flow has a redirect callback, so the layout has a consumer |
| 05 | The number of origins and clients | **One.** One Spring Boot service behind one gateway; the second client and the proxy-ordering hazard both disappear |

#### Placeholders this opened

Three, all in the table above: the state-library adoption (04), the identity
provider (08), and whether an OpenAPI spec exists (33). **All three are the
client's to answer, not the Frontend Lead's**, which is a different escalation
path from every other row in this register.

#### Two stale artifacts, and they are Phase 0 findings

`STACK.md` §8 item 5 records both: **`frontend/.storybook/` exists with no
`storybook` dependency**, and **Lefthook invokes `prettier` which is not a
declared dependency**. Tiers 24 and 14 both assume working installations.

Neither is a restructure task. **Establish first whether each is failing or
silently no-opping** — a hook calling a binary nobody installed does one of
those two things, and which one determines whether the format gate has ever run.

#### Four contradictions inside the client's own documents

Region, Node version, backend port, and the backend package root all have two
different values across `TEAM-GUIDE.md` and `STACK.md`.
33-polyglot-monorepo-integration.md tabulates them.

**Only the Node one blocks a frontend developer** — following the prerequisites
table installs Node 20, which React Router v8 will not run on. **Report all
four; resolve none.** A document corrected in passing by someone outside the
team that owns it is how the drift `STACK.md` §8 records began.

#### What this section does not claim
**The implementation-status snapshot above is unchanged and still describes the
scaffold in this repository**, not the client's `frontend/`. Nothing here was
verified against the target repository — it was read from the client's
documentation, which is itself dated 2026-08-20 and carries its own drift
warnings. **A fresh Phase 0 baseline against the real `frontend/` supersedes all
of it**, and is the first SPEC.

#### Closed 2026-08-25 — the workspace question, and the corpus's first ADR

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

#### The consequence worth carrying forward is not about structure

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

### Closed 2026-08-25 (second pass) — Prettier configuration, and a provenance defect

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

#### The open row this opens

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

### Enforcement layer — built 2026-08-25, and its numbers

The "Absent — the enforcement layer" section above is superseded for the gates
listed here. This is the reference half of this file: **a dated snapshot, not a
standard.** Where it disagrees with a tier file, the tier file wins.

**Method:** every number produced by running the gate, on commit `4259b33`,
against unmodified `src/`. Nothing is quoted from a plan.

#### The three adherence ceilings

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

#### 815 is not a regression

The single number moved 662 → 467 when the false positives stopped executing,
and the newly-closed numeric loophole then added 348 previously-unobserved
violations to the tracked total.

**467 + 348 = 815 is 467 real signals plus 348 that were always present in the
code and are now counted.** Nothing was introduced. The earlier 662 was smaller
because it included 195 warnings that were wrong and excluded 348 that were real.

**Any comparison against 662 is a comparison against a number of a different
kind**, and Step 6's "the adherence count is unchanged and non-zero" acceptance
must be read against the per-family ceilings above, never against 662.

#### Other gates now enforced

| Gate | Result | Where it runs |
|---|---|---|
| `tokens:check` | 156 tokens, passes | build + pre-commit |
| `tokens:drift` | generated map matches the manifest | build + pre-commit |
| `lint:css-vars` | 1,829 `var()` refs, 119 names, **0 unresolved** | build + pre-commit |
| `typecheck` | `tsc --noEmit`, exit 0 | build + pre-push |

Every one was proved to **fail** as well as pass, by breaking it deliberately and
reverting. A gate that has never failed is indistinguishable from one that does
not run.

#### What is still absent

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

### Closed 2026-08-25 (third pass) — the two decisions that had no record

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

#### What ADR-0003 changes about 06's role

06 was written for a repository that must *decide* its token values. This one
receives them with a manifest and a drift gate attached. **A value with a
machine-checkable provenance beats a value with a well-argued derivation**, so
06 yields on the values and keeps everything else — naming, the ordinal scale,
semantic mapping, and the rule that a hardcoded value traces to a real source.

This also closes 00's source-precedence **case 5** for these 156 values
specifically: a re-vendor that changes a value now fails `tokens:check` rather
than drifting silently. The hazard remains for every value *not* in the manifest
— the prototype constants Step 8 has to give a named home.

#### What ADR-0004's placeholder got wrong, and why that is worth keeping

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

### Phase 2 workspace split — completed 2026-08-25

**Reference, not standard.** Dated snapshot; the method is "every number below
was produced by running the gate". Where it disagrees with a tier file, the tier
file wins.

#### The structure that now exists

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

#### Before and after — the acceptance evidence

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

#### The gate the counts could not vouch for

The `imports` family was 0 before the split, and would have been 0 after it
while checking nothing — its patterns match `components/**`, and the code now
imports `@pqms/ui-library`. **Two identical numbers, one meaning "clean" and one
meaning "dead".**

Closed with a third alias twin in `eslint.adherence.config.mjs` **and** a
positive control, `scripts/check-import-rule.mjs`, which feeds the live
configuration deliberately-violating imports and fails if they are not reported.
15-devsecops-and-ci-cd.md now carries this as a standing rule.

#### Two mid-course corrections, both worth keeping

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

### There is no test framework, and that has consequences

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

### The fidelity harness is broken, and it is the only behavioural test

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

#### Why unchanged bundle hashes worked at Step 6 and CANNOT work at Step 8

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

### The corpus was authored for a different repository — one placeholder, not six

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

### Step 7 structural assessment — 2026-08-25

**Reference, not standard.** Method: 01 and 07 read in full, then measured
against `apps/portal/src` file by file. Where this disagrees with a tier file,
the tier file wins.

**Outcome: one deletion, zero moves.** Step 6 had already done the structural
work; what remained in Step 7's description was either already satisfied,
forbidden by 01's own anti-scaffolding rule, or a content edit rather than a move.

#### What already conforms — recorded because positive evidence stops re-litigation

These five were checked against 01 and found **already correct**. They are listed
so the next pass does not re-open settled structure looking for work.

| Requirement | Evidence |
|---|---|
| **`components/shared/` only for 2+-feature components** (01) | No `shared/` folder exists, and **zero cross-feature component imports** — `LinkIssuesSection` and `ModelCodeYearPicker` are used only by `CreateIssueScreen`, `PriorityTab` only by `IssueWorkspaceScreen`. Correctly absent rather than missing |
| **Feature folders stay flat until ~15 files or 2+ sub-concerns** (01) | `features/issues/` holds **6** files; every other feature holds 1. Flat is the correct state, not a deferral |
| **Tab folders are thin wrappers; real UI in a sibling folder** (01) | Satisfied in substance — `PriorityTab.tsx` is a sibling module imported by `IssueWorkspaceScreen`, not duplicated into a tab folder |
| **`chrome.tsx` stays in the app** (ADR 0001) | Confirmed still correct. It imports `useNavigate`, and 01's package-ownership rule forbids router dependencies in `ui-library`. No second consumer exists |
| **`ui-library` categories; nothing at `components/` root** (01) | Six category folders, **zero files at root**. 01 records that the prior library failed exactly here (`BaseDataTable`/`BaseModal` uncategorised); this port did not |

#### What was assessed and deliberately not applied

| Requirement | Disposition |
|---|---|
| **`pages/` route hosts** (07) | **Deferred — ADR-0005.** 07's benefit is testable and unreachable by adding hosts alone: six of seven screens call `useNavigate` for in-screen actions, so a host leaves them router-dependent. Reachable via a callback-props refactor across six screens, which has **no beneficiary today** (no Storybook, no tests, no second consumer). 07 now carries the precondition |
| **Feature-scoped `services/`** (01) | **Not applied.** No services exist. `data/store.tsx` is deliberately the whole data layer and encodes three domain invariants; splitting it by feature fights its design. Unblocks at Step 10, when a backend exists |
| **Feature-scoped `hooks/`** (01) | **Not applied.** Zero custom hooks in the application. 01's own rule governs: *"a folder is not created before something lives in it"* |

#### Deleted

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

#### Acceptance — all four checks plus both positive controls

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

#### Two places this application is a counter-example to the corpus

- **07's `pages/` convention had an unstated floor.** Recorded in 07 with this
  app as the worked example, and in ADR-0005. Its provenance is `kus-pqms`, a
  124-SFC application — the size at which route-concern leakage is a real cost.
- **07's route tree names modules that are out of scope here.** `/qir` and
  `/tsb` are absent by design, with the nav items rendered **disabled** for
  fidelity to the prototype; `frontend/README.md`'s guardrails govern scope.
  `/overview` versus `/dashboard` and `/issue-management` versus `/issues` are
  naming only. **No route was changed** — route paths are behavioural. The
  divergence table is in 07.

### The pixel harness — CORRECTED 2026-08-26

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

#### The measurement, and the condition it depends on

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

#### The diagnostic layer beneath the gate

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

#### The 91 baselines are superseded as a gate — and RETAINED on disk

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

### Application defect — dates shift by a day with the developer's timezone

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

### Two hygiene items closed

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

### Dead code found while building the gates

**`IssueCard` is exported from the `ui-library` barrel and imported by nothing.**
It is tree-shaken out of the bundle: editing `padding: 16 → 20` produced an
**identical bundle hash**, and it appears zero times in `dist`.

Recorded as D16. The consequence beyond one component: **"bundle hash unchanged"
is blind to any change in code that does not reach the bundle.** That does not
weaken Step 6's conclusion — moving unreachable code changes nothing by
definition — but it is a second reason the hash is not a general substitute for a
behavioural check, alongside the already-recorded one that Step 8 changes source
bytes deliberately.

### The harness is repaired — 2026-08-26

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

### The app-vs-prototype delta — measured for the first time, 2026-08-26

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

### Static token-equivalence — coverage of the 467

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

### Step 8 tranche 1 — converted 2026-08-26

**103 substitutions across 20 files. Values ceiling 467 → 363.**

Every one was proved value-preserving *and* family-appropriate by
`scripts/check-token-equivalence.mjs` before being written. Dominated by
`'1px solid var(--border-subtle)'` → `'var(--border-width) solid …'` — declarations
already 90% tokenised that tripped on a stray `1px`.

#### The bucket arithmetic, reconciled

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

#### The rehearsal found two defects — which is what it was for

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

#### The end-to-end confirmation, and why it matters

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

### The remaining 353 — analysis, not a recommendation

**No conversion is proposed here.** This is a decision for the designer and the
architect, because **the design system is a byte-copy with a drift gate: adding a
token is not an edit this project can make.**

| Bucket | Count |
|---|---:|
| unmatched — no token has the value | 254 |
| value-only — token exists, **wrong family** | 76 |
| unknown property — ternary/JSX context | 23 |
| **total** | **353** |

#### Category A — values that cluster, and probably should be tokens

| Value | Uses | Note |
|---|---:|---|
| `#fff` | 24 | **already a token** (`--neutral-0`); blocked only by the tool's hex-normalisation defect |
| `2px` | 14 | a second border width; `--border-width` is 1px |
| `#7c5cdb14`, `#2a6fdb14`, … | ~15 | **token colours at 8% alpha** — the base hues ARE tokens; the tint is not |
| `3px`, `5px`, `7px` | 14 | off-grid spacing near `--space-1` (4px) / `--space-2` (8px) |

**The alpha cluster is the most systemic.** Every one is an existing token with
an alpha suffix, so the design system already owns the hue and not the tint. That
is a missing *layer*, not missing values.

#### Category B — prototype constants

| Value | Uses |
|---|---:|
| `12.5px`, `10.5px`, `13.5px`, `11.5px` | **42** |
| `10px`, `11px`, `9px` | **63** |
| `#f0f2f5`, `#f6f8fa`, `#f4e2c0`, `#dde3e9` | **36** |

Half-pixel type sizes and off-scale greys with no systemic meaning — the values
`steps-for-new-repo.md` Step 8 already names as prototype constants.

#### Category C — genuinely arbitrary

The long tail below the top blockers. Individually one- or two-use values that
fit no scale and repeat nowhere.

#### The options, and their cost

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

#### On the 76 wrong-family — converting them would be worse than leaving them

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

### The app-vs-prototype delta — a measurement, not a verdict

**Mean 5.31% across four paired screens**, captured 2026-08-26 with
`scripts/measure-prototype-delta.mjs`.

| Screen | Differing px | % of frame |
|---|---:|---:|
| dashboard | 70,536 | 6.12% |
| issues list | 66,147 | 5.74% |
| workspace detail | 52,926 | 4.59% |
| create issue | 54,969 | 4.77% |

#### ⚠️ 2026-08-26 — WHAT THE 5.31% FIGURE IS, NOW THAT THE PROTOTYPE IT MEASURED IS SUPERSEDED

`measure-prototype-delta.mjs` — like `fidelity-gate.mjs` and
`fidelity-capture.mjs` — reads
`…/pqms-bundled-page-2026-08-16/PQMS_SE.html`, **dated 2026-08-11 and two design
generations behind** the canonical prototype now named in `00-core-rules.md`.
That changes what the number above supports, and the change is precise rather
than fatal. **Two claims were being made with one figure. Only one of them
survives.**

##### ✅ STILL VALID — it is a regression signal, and a good one

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

##### ❌ NO LONGER SUPPORTED — it is not a fidelity measurement

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

##### The distinction, stated once so it is not lost

> **A regression signal needs a *fixed* baseline. A fidelity measurement needs a
> *correct* one.** The same figure can be the first and not the second, and this
> one is. They are different claims and only one is supported.

##### How to quote it until the harness is repointed

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

### Step 8 tranche 1b, and the numeric family — 2026-08-26

#### Two tool defects fixed, 30 more conversions unlocked

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

#### Tranche 1b converted — values ceiling 363 → 333

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

#### The numeric family — 348 warnings, analysed, NOT converted

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

### Numeric tranche converted, and the test framework adopted — 2026-08-26

#### Numeric exact-match tranche — ceiling 348 → 207

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

#### The unitless-property guard, and why it exists

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

#### On the number → string change

Converting `gap: 8` to `gap: 'var(--space-2)'` changes the value's **type**.
React accepts both, so the render should be identical — **but that is an
assumption, not a proof, and the static equivalence check cannot see it** because
it compares values, not types.

Two things settle it: **the pixel gate**, which confirmed all ten screens
unchanged; and **`tsc --noEmit`**, which would catch any site where a style value
is read back and used arithmetically. Both passed.

### Test framework adopted — first slice, 2026-08-26

**Vitest + React Testing Library per 10-testing-standards.md.** This closes the
only row in 00's divergence table dispositioned *repo is behind* with no
counter-argument.

**47 tests, all passing, 3 files.** Characterisation tests, not specification
tests: they pin CURRENT behaviour so a later phase can prove it did not change
them — the store's equivalent of what the pixel gate does for rendering.

#### Coverage, measured — and the proposed floor

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

#### What is pinned

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

#### NOT wired into pre-push yet

The suite takes ~5 s wall-clock, most of it jsdom environment setup (the tests
themselves run in ~160 ms). 23's rule is that a hook slow enough to be resented
gets bypassed with `--no-verify`. **Left out of the hook until the startup cost is
addressed**, and recorded here rather than silently deferred.

#### Two findings from writing the tests

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

#### One stack constraint discovered

**Vitest 4 requires Vite 6+; this project is pinned to Vite 5.4**, so the suite
runs on **Vitest 2**. A concrete instance of 00's divergence table having
consequences beyond documentation: the corpus specifies Vite 7+, and the actual
version bounds which test-framework major can be adopted. Recorded because it
will recur with every dev-dependency added.

### Step 7 row 4 — `config/` extraction is now UNBLOCKED

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

### Coverage floors set, and the denominator pinned — 2026-08-26

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

#### ⚠️ THE DENOMINATOR IS THE DATA LAYER ONLY

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

#### Wired into pre-push — and the hook is now at the limit

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

### Application defects consolidated — 2026-08-26

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

### Screen tests, the a11y sweep, and D-5 — 2026-08-26

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

#### What the screen tests pinned

**IssueWorkspaceScreen (8 tests)** — the propose→approve flow through the UI,
previously pinned only at the store layer. The store tests prove the reducer is
right; they say nothing about whether the screen wires it correctly or **who can
see the approval affordance**. Now pinned: an SE sees "Change status" and does
**not** see Approve/Reject; override roles do; the affordance disables once a
proposal exists.

Also pinned: **the five Workspace sections are child routes**, and a section is
deep-linkable — which is BRD `NAV-01`'s actual requirement and was unreachable at
any URL before the routing pass of 2026-08-27. The **Priority** tab remains local
component state and deliberately does not change the URL, pending the PQM ruling
on Scoring's shape recorded elsewhere in this file; the test pins that asymmetry
in both directions, so if Priority ever silently becomes a route it fails and
says so.

**This corrects a false claim that stood here, and the correction is worth
recording rather than quietly overwriting.** The previous text read: "tab state
is local, not routed — **07 records this as a deliberate divergence**". **07
records no such thing.** Its Divergence table enumerates eight rows, every one a
path-naming, QIR/TSB-scope or layout matter and none about tab state; and its
"Workspace sections are a route segment, not component state" section requires
the exact opposite, unqualified. The claim was unsupported when written, and the
same false citation had propagated into `tests/IssueWorkspaceScreen.test.tsx`'s
pinned comment, where it was enforcing a "divergence" no standard had ever
granted. Both are now fixed.

The lesson generalises past this instance: **a citation naming a file and a
concept is not evidence — only the cited file's current text is.** This one
survived multiple readings because it was plausible, specific, and pointed at a
real document that really does discuss divergences.

**CreateIssueScreen (7 tests)** — the other draft/commit form. Typing does not
touch the store; Clear discards; model code gates the dependent selects; the
seven-source chip vocabulary is pinned as a set, because adding or renaming one
is a domain change.

#### The accessibility sweep — 31 of 32 components, one test file

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

#### D-5 recorded

The pagination-reset defect is now `PQMS_docs/APPLICATION-DEFECTS.md` D-5, with a
proposed fix — it is unambiguous, unlike D-2 and D-3. **Three call sites already
reset the page and three do not**, which is what makes it read as intentional and
survive review. `pageClamped` masks it: the user lands on the wrong results
rather than an error, which is why it has never been reported.

**The characterisation test already exists to flip.** The fix becomes "invert two
assertions and state why" — reviewable in a way a behavioural fix with no prior
test never is.

### Step 11 / pass 4 — first screen description — 2026-08-26

**One screen of seven: the Issue List.** Written from the prototype per 29's ten
questions, then reconciled against the implementation and against
`component-specs/INVENTORY.md`.

New files: `PQMS_docs/screen-descriptions/issue-list.md`,
`PQMS_docs/component-specs/RECONCILIATION-issue-list.md`.

#### The delta count — what pass 4 exists to produce

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

#### The shape disagreement, which is a requirements question

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

#### Three implementation divergences found

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

#### Two findings about the METHOD, not the screen

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

### 2026-08-26 — the canonical prototype is settled, and pass 4's first screen was withdrawn and re-run

#### What was wrong

The entry immediately above reasoned about *"the live `.dc.html`"* as though the
repository held one. **It holds nine distinct ISM candidates across four
directories**, two of them byte-identical duplicates of two others. The first
screen description named the 2026-08-11 flattened export; its "corrections"
against "the live file" were reasoning about a *third* file nobody had
identified.

#### What is settled — full disposition in `00-core-rules.md`

> **`docs/ux-prototype/ism-qir-se-role/ISM + QIR SE Role - P_C.dc.html`**,
> md5 `8dca6a22f65b5dda7906a77945c12435`, Claude Design project Kia N-PQMS V4-V5,
> synced 2026-08-24.

**Established by content lineage, deliberately not by date** — this file is the
only candidate carrying `PRI_MATRIX`, `_resetPageState`, `_priorityInherited` and
`caretStyle()`, the delta against the previous sync is diffed hunk by hunk in
`issues/ism-v4-v5-gap-analysis.md`, and **the app already implements three of
those items**. This file's own rule against mtime inference (17's Prototype
register) is why none of that argument uses a modification date.

#### The corrections to the entry above

| Above says | Canonical source |
|---|---|
| KPI "Resolved" — *"app is probably right"* | **App is right, and now proven.** Sixth tile is `closed` / "Closed". And the tiles are **status filters** (`_kpiSel`), which no reading had noticed |
| Relationship column — *"the live prototype agrees with the app"* | **True, for the wrong reason.** The column was **removed** in V4–V5: no header, no cell, and `colGroupDefault` omits it from the Columns chooser. `colRelationship` occurs 3× in the export and **1×** in the canonical — the state binding alone |
| "Showing 7 of 33" | **Unchanged, and now recorded as D-6** with the fix and the mechanism: there are **two** "Showing" strings with **different denominators**, and the app gets the footer right and the band wrong |

#### Three findings that only a SOURCE read could produce

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

#### The consequence for the fidelity harness

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

#### Two escalations, both lifecycle contracts, both open

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

#### What pass 4 has established about `INVENTORY.md`, over three screens

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

#### The reassessment of the remaining screens, with three screens of evidence

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

### 2026-08-26 (later) — pass 4 complete, and two corrections to the entry above

#### Two things the entry above got wrong

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

#### The status contradiction is escalated, not resolved

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

#### Admin — the scope boundary runs through the middle of a screen

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

#### A second approval workflow, contradicting the first, on the same screen

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

#### Pass 4's final numbers, six screens

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

---

## 19 — Onboarding and Dev Workflow
**Tier:** 2
**Status:** SKELETON — the sections and the capture rule are live; the content is written by whoever first runs the setup
**Purpose:** Local setup, editor config, debugging, troubleshooting/FAQ
**Supersedes / absorbs:** draft §13-15
---

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Why this file is a skeleton rather than a draft
**The content cannot be written from theory and it is not being
attempted.** An onboarding document exists to capture the specific
errors, undocumented assumptions and rough edges a setup actually
produces, and none of those are knowable before someone has done it.
Writing them in advance produces a document that describes an imagined
setup and is wrong in exactly the places a reader needs it.

**What changed from the previous revision**, which was marked
`EMPTY — pending draft` and carried two paragraphs: the *shape* is now
fixed and the *capture rule* is stated, so the first person through does
not also have to design the document. Filling it is transcription, not
authorship.

### The capture rule
**Write it down at the moment it costs you, not afterwards.**

Onboarding friction is invisible in retrospect — once you know the dev
server needs a `.env` file, you stop noticing that nothing told you. So
the rule is temporal, not editorial: the entry goes in **while you are
stuck**, in whatever words you would have wanted to read ten minutes
earlier.

Three consequences:

- **A rough entry beats no entry.** Grammar is cheap to fix later; the
  memory of what confused you is not recoverable.
- **An entry that turns out to be wrong is still useful**, because it
  records what a reasonable person assumed. Correct it in place and keep
  the correction visible.
- **Nobody is assigned to "write onboarding".** Whoever hits the friction
  writes the entry. A document owned by everyone who was ever confused is
  the only kind that stays current.

### Sections to fill

#### 1. Prerequisites
Node and pnpm versions and where they come from (`.nvmrc`,
`packageManager`), and anything else that must exist before `install`
succeeds. **State the version-manager command that actually worked**, not
the general instruction.

#### 2. First run, exactly
The command sequence from clone to a page rendering in a browser. Every
step, including the ones that feel too obvious to write — those are the
ones that break.

**One entry is already known and belongs here on day one.** A fresh clone
with no `.env` gets **real mode**, therefore real authentication,
therefore — with no reachable identity tenant — **nothing renders**. That
is deliberate: 05-api-integration-and-data-fetching.md's fixtures
predicate fails closed, because the same flag also gates an
authentication bypass, and an auth bypass must never be what you get by
forgetting to set a variable. The consequence is that
`VITE_USE_FIXTURES=true` is the first thing a new developer needs and the
first thing nothing tells them. Copy `.env.example` and say so here.

#### 3. Fixtures mode
What it is, what it changes, what it does not. 05 owns the data half and
08-authentication-and-authorization.md the identity half; this section is
the practical version — which flag, which file, what you see when it is
on, and how to change who you are signed in as once you are
(`switchRole()`, per 04-state-management.md, which is the **only**
identity mechanism available locally).

#### 4. Editor configuration
Extensions, settings, and the one that is not optional: **the IDE's
TypeScript service is not the authority — `pnpm typecheck` is.** Whatever
this repository's IDE type errors turn out to be, CI decides.

#### 5. The commands you actually use
A short list, not a duplicate of 20-glossary-and-appendix.md's Commands
Reference. Which three or four get run twenty times a day, and what each
is for.

#### 6. Debugging
How to attach a debugger, where the source maps are, how to see what the
HTTP client is actually sending (the `X-Correlation-ID` from 05's request
interceptor is the thread to pull, and
21-logging-formatting-and-client-diagnostics.md attaches the same value
to every log line raised while that request is in flight), and how to
read a failing test's output.

#### 7. Troubleshooting / FAQ
**The section that justifies the file.** One entry per real failure, in
this shape:

| Symptom | Cause | Fix |
|---|---|---|

Write the symptom **as it appears** — the actual error text — not as a
description of it. Somebody will search for the error text.

#### 8. Getting unstuck
Who to ask, and what to have ready before asking.

### What does not go here
- **Rules.** A rule belongs in the tier file that owns it. This file
  points at rules; it never states them.
- **Architecture.** 01-project-structure-and-architecture.md and
  07-routing-and-layouts.md own it.
- **Anything a script could do instead.** If a setup step can be
  automated, automate it and delete the entry. A troubleshooting entry
  that survives three developers is a defect report about the setup, not
  documentation.

### Trigger
**Fill sections 1–3 the first time anyone runs the setup.** For a
restructure that is Phase 0.2 of
30-restructuring-an-existing-react-project.md, which already requires a
green build from a clean clone — so the friction is being produced
anyway and only needs recording. Sections 4–8 accumulate.

### Two entries that are already known, beyond the one above

#### The fixtures default is the *opposite* of the prior repository's
Section 2 records that a fresh clone with no `.env` renders nothing. There is a
second half to that entry, and it is the half that makes it recognisable:

**In the prior repository, fixtures were ON by default** — only the literal
string `"false"` opted out, so a missing variable fell back to the safe path and
the app just worked. **Here the predicate fails closed**, because the same flag
also gates an authentication bypass.

So the symptom for anyone arriving from that codebase is not "the app needs
configuration". It is **"this used to just work and now it is broken."** Write
the entry that way — 05-api-integration-and-data-fetching.md explains why the
direction is deliberate and is not changing.

#### The editor must use the workspace TypeScript
Beyond section 4's rule that CI is the type authority: point the editor at the
workspace compiler explicitly (`typescript.tsdk` → the workspace
`typescript/lib`). Otherwise the editor type-checks with its own bundled
version, which is older, and the disagreement between editor and CI is then a
*version* disagreement rather than the known template-analysis one — much harder
to recognise and much easier to argue about.

Two more settings that are one line each and prevent recurring review noise:
format-on-save with the formatter named explicitly, and ESLint's fix-on-save
action listed explicitly rather than left to a default. Ship a recommended
extension list so a new machine gets all three without being told.

### Sections 1–2 have a source — do not re-derive them

`docs/DEVELOPER_GUIDE.md` already documents prerequisites, the one-command
startup (`./scripts/start_local.sh`), ports, environment variables and a
troubleshooting section — for the **whole monorepo**.

**This file does not duplicate it.** It points at it, and holds only what is
frontend-specific and not there. Three entries qualify today:

#### The backend port mismatch — the first thing anyone hits
`docs/STACK.md` §8 item 1: the Vite proxy defaults to `http://localhost:8080`;
the backend runs on **`18080`** under `local-mem`. So `/api/*` does not reach it.

The symptom is a frontend that renders and shows no data — indistinguishable
from a frontend bug, and it will be reported as one. **Write the actual error
text in the troubleshooting table**, not a description of it. Somebody will
search for it.

Note the two documents disagree with each other here as well: `STACK.md` §7 puts
local backend on 8080 and `DEVELOPER_GUIDE.md` puts it on 18080 under
`local-mem`, with the frontend dev server on 13000 rather than Vite's default
5173. **Establish the real values by running it**, and record what you saw.

#### The fixtures default reversed
Already recorded above. It bites hardest here because
`./scripts/start_local.sh` starts a *real* backend — so a developer arriving
from the prior repository has a working backend, no `.env`, and a blank screen,
which is the most confusing possible combination.

#### Node version — two documents, two answers
`DEVELOPER_GUIDE.md` prerequisites say **Node 20+**. `STACK.md` says
**≥ 24.15.0**, and React Router v8 requires 22.22.0+ regardless. A developer
following the prerequisites table installs a runtime the frontend will not build
on.

**`.nvmrc` is the operative answer and `STACK.md` is the authority.** Report the
prerequisites table as a documentation defect to the client rather than fixing
it here — it is not this corpus's file.

### Section 5 — the commands are not the ones this corpus assumed

The frontend has its own scripts, but the ones actually run daily include
monorepo-level entry points: `./scripts/start_local.sh` for the full stack,
`corepack pnpm dev` for frontend-only, and the harness commands
(32-working-within-the-moai-spec-workflow.md). List what you use; do not
transcribe `package.json`.

---

## 20 — Glossary and Appendix
**Tier:** 2
**Status:** APPROVED — REVISION 2

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
Config snippets, code templates, commands reference, and a
TECHNICAL/engineering-term glossary (acronyms and jargon used across
the standards files themselves — e.g. RBAC, CSP, PKCE, ITP, JIT, HMR,
testid, WCAG). Domain/business terms (Issue, DTC, roles, screens,
backend services) belong exclusively to
17-domain-glossary-and-business-context.md — this file does not
duplicate that content.

### Technical / Engineering Glossary
**Which other files use a given term is not tracked here.** An earlier
revision attached a `(used in: …)` list to every entry and hand-maintained
it; checked against the corpus, 14 of the 25 lists were wrong — some named
a file that never mentions the term at all. That is not a copy-editing
slip, it is the failure this file's own "the rule needs a mechanism, not
a restatement" principle (see 13-security-standards.md's parallel case)
describes: a fact about 21 other files, re-derived by hand on every
revision, drifts the moment any one of them changes. It is a **computed
fact about the corpus**, not a decision, so it is computed: see the
generated distribution document's derived cross-reference index, which
`build-standards-doc.mjs` regenerates from every tier file on every run
and can never go stale the way a hand-written list can.

- **RBAC** — Role-Based Access Control. Included here as the industry
  term, with a correction worth stating plainly: this app's actual
  model is **named-permission**-based, not a direct role check — the
  frontend consumes a resolved-permissions object (BRD FR-SEC-011) and
  every gate checks a named permission, never the role directly (see
  00, 08). "RBAC" appears in these standards as shorthand for that
  broader access-control category, not as a literal description of the
  mechanism.
- **CSP** — Content Security Policy. A browser-enforced HTTP
  header/meta-tag restricting which script/style/connection origins a
  page may load from.
- **PKCE** — Proof Key for Code Exchange. An OAuth extension that lets
  a public client (like a SPA) safely use the Authorization Code flow
  without a client secret.
- **OIDC** — OpenID Connect. An identity layer on top of OAuth 2.0;
  this app's auth protocol is OIDC Authorization Code Flow + PKCE.
- **ITP** — Intelligent Tracking Prevention. Safari's third-party-
  cookie/storage-blocking privacy feature; the reason Safari's silent
  MSAL re-auth path behaves differently from Chrome/Edge's.
- **JIT** — Just-In-Time. Refers to Tailwind's compiler generating only
  the utility classes actually used in source, rather than shipping a
  full static stylesheet.
- **HMR** — Hot Module Replacement. Vite's dev-server mechanism for
  swapping updated modules into a running page without a full reload.
- **testid / data-testid** — the `data-testid` HTML attribute, queried
  directly in tests independent of visible UI text or ARIA role — the
  deliberate last-resort query priority, used where an element has no
  stable accessible name/role to query by instead.
- **WCAG** — Web Content Accessibility Guidelines. The standard this
  app's accessibility target (2.2 AA) is defined against.
- **ARIA** — Accessible Rich Internet Applications. The W3C
  specification defining roles/states/properties (`role`,
  `aria-checked`, `aria-describedby`, etc.) that expose custom UI
  semantics to assistive technology.
- **NFR** — Non-Functional Requirement. A standard requirements-
  engineering term — **not** PQMS-specific vocabulary. (The content of
  specific NFRs is BRD-sourced domain content and belongs to 08's and
  11's permission-model/accessibility discussions, not this glossary.)
- **ADR** — Architecture Decision Record. A short document capturing
  one architectural decision and its rationale.
- **BFF** — Backend-for-Frontend. A dedicated backend layer serving one
  specific frontend, referenced here as the eventual home for
  HTTP-only-cookie token storage once one exists.
- **SPA** — Single-Page Application.
- **MSAL** — Microsoft Authentication Library — the
  `@azure/msal-browser`/`@azure/msal-react` package family used for
  Entra ID auth in this app.
- **XSS** — Cross-Site Scripting. The injection-of-untrusted-markup
  vulnerability class `dangerouslySetInnerHTML`/`v-html` misuse can
  open.
- **DOM** — Document Object Model.
- **ICU** — International Components for Unicode. The pluralization
  standard react-i18next implements (count-based key variants like
  `_one`/`_other`), which 09 requires instead of hand-rolled
  singular/plural key pairs.
- **BEM** — Block Element Modifier. A CSS class-naming convention this
  app explicitly does **not** use, per 06's Tailwind-only decision.
  Listed because 06 names it when ruling it out.
- **SSO** — Single Sign-On.
- **IdP** — Identity Provider. The party that authenticates a user and
  asserts their identity — Azure AD/Entra ID, in this app's case.
- **ESM** — ECMAScript Modules. The `import`/`export` module system;
  relevant because **React Router v8's own published output is
  ESM-only**. That is a statement about the package React Router ships,
  not about the dependency graph around it: CommonJS elsewhere in that
  graph is fine, and Vite handles it as it always has. An earlier
  revision of this entry said "the dependency chain is ESM-only, no
  CommonJS output permitted" — 00 withdrew exactly that wording as
  broader than the source supports, so this entry was restating a
  retracted claim and citing the file that retracted it.
- **RTL** — React Testing Library. Already self-expanded at first use
  in 10; included here only for one-stop lookup.
- **MSW** — Mock Service Worker. Already self-expanded at first use in
  10; included here only for one-stop lookup.
- **JSX** — JavaScript XML. The syntax extension React components are
  written in.
- **CSF3** — Component Story Format 3, the Storybook authoring format
  24-storybook-authoring.md requires.
- **DoD** — Definition of Done. 28-definition-of-done.md is this
  corpus's; it is the author's gate, distinct from 16's reviewer's
  checklist.
- **LCP / INP / CLS** — Largest Contentful Paint, Interaction to Next
  Paint, Cumulative Layout Shift. The three Core Web Vitals 12 sets as a
  floor.
- **SC** — Success Criterion, a numbered WCAG requirement (e.g. SC 2.5.8
  Target Size). Used throughout 11.
- **Outbox** — the transactional-outbox pattern: a change and its
  side-effect intent commit together, and a separate process performs the
  side effect. Named here because the BRD requires it of notifications
  and a reader may meet the term first in a frontend context.

### Commands Reference

The `package.json` script set to build, by package.

**The task names are not carried forward from `kus-pqms`, and this is
the second attempt at this passage.** An earlier revision reproduced
that repo's names verbatim and claimed "only the type-checker binary
changes" — but 15-devsecops-and-ci-cd.md forbids exactly that: there,
`lint` ran the type-checker while `lint:eslint` ran the linter, so
every CI step name described the wrong tool. Per 15, scripts are named
for what they do: **`typecheck`**, **`lint`**, **`format:check`**.

What does carry forward: the Turbo delegation pattern at the root, and
the Prettier globs (with `.vue` dropped and `.tsx` added).

**Root (the workspace root — `pqms-portal/` in this repository):**
```
dev                   turbo dev
build                 turbo build
test                  turbo test
test:coverage         turbo test:coverage
typecheck             turbo typecheck
lint                  turbo lint
lint:eslint           eslint .
lint:eslint:fix       eslint . --fix
format                prettier --write "{apps,packages}/**/*.{ts,tsx,js,cjs,mjs,json,css}" "*.{json,js,cjs,mjs}"
format:check          prettier --check "{apps,packages}/**/*.{ts,tsx,js,cjs,mjs,json,css}" "*.{json,js,cjs,mjs}"
docs:standards        node scripts/build-standards-doc.mjs
docs:standards:check  node scripts/build-standards-doc.mjs --check
clean                 sh scripts/clean.sh
prepare               [see 23-git-workflow-hooks-and-commits.md — Husky install; the path depends on where the git root sits relative to the workspace root]
```

Four of these exist for reasons stated elsewhere and must not be
dropped as boilerplate:

- **`test:coverage` at the root, delegating through Turbo.** 15
  requires coverage to run for **every** package, not the app alone —
  `kus-pqms` ran `pnpm --filter @pqms/pqms-portal run test:coverage`
  and two packages' tests never executed in CI. A root script fanning
  out is what makes 10's per-package thresholds reachable.
- **`docs:standards` / `docs:standards:check`.** Mandated by 00's
  precedence rule and run as a CI step per 15. `:check` is what makes
  "the generated document is never hand-edited" enforceable instead of
  requested.
- **`typecheck`, not `lint`, for `tsc --noEmit`.** See above.
- **`lint` delegates through Turbo (`turbo lint`), not a bare
  `eslint .`.** This is a deliberate revision of this section's own
  earlier text, which specified `eslint .`/`eslint . --fix` and was
  never updated once `build`, `test`, and `typecheck` all moved to the
  Turbo-delegation pattern — leaving `lint` as the one root command
  that skipped it. `turbo lint` fans out to each package's own `lint`
  script (each already `eslint .`, scoped to that package), gaining
  Turbo's caching and parallelism the other three commands already
  have; there is no reason for `lint` alone to opt out. `lint:eslint`
  and `lint:eslint:fix` are kept as a **separate, deliberate escape
  hatch**: a package-scoped `turbo lint` run never reaches root-only
  files (`eslint.config.js`, `scripts/*.mjs`) because no workspace
  package's `eslint .` is rooted there — `lint:eslint`/`:fix`, run from
  the repo root, are what lints those files. The two are not redundant
  with each other; both are required. Recorded as a live decision in
  18-project-context-and-implementation-status.md next to 05's
  fixtures-mode and 06's React Aria entries.

**`apps/portal`:**
```
dev              vite
build            tsc --noEmit && vite build
preview          vite preview
typecheck        tsc --noEmit
test:unit        vitest
test             vitest run
test:coverage    vitest run --coverage
test:e2e         playwright test
storybook        storybook dev -p 6007
build-storybook  storybook build
```

**`packages/ui-library`:**
```
build            tsc --noEmit
typecheck        tsc --noEmit
storybook        storybook dev -p 6006
build-storybook  storybook build
test             vitest run
test:coverage    vitest run --coverage
```
`build` and `typecheck` are intentionally identical, both
type-check-only: this package has no build output, per 01's "No build
step in either package". `test:coverage` exists so the root
`turbo test:coverage` above reaches this package — without it, this
package's tests run but its coverage is never measured, which is the
`kus-pqms` gap 15 records.

**`packages/design-tokens`:**
```
build            tsc --noEmit -p tsconfig.json
typecheck        tsc --noEmit -p tsconfig.json
test             vitest run
test:coverage    vitest run --coverage
```
Same as `ui-library`: `build` and `typecheck` are identical
type-check-only commands, this package has no build output either, and
`test:coverage` exists for the same all-packages reason.

**On `prepare` / Husky**: **23-git-workflow-hooks-and-commits.md owns
the hook chain**, including this script and the git-root question it
depends on. Not restated here. The one fact worth carrying in a commands
reference: the value is repo-layout-dependent, so a copied string from
another repository will silently install hooks nowhere.

### Config Snippets

**Only genuine gaps** — configuration not already specified in the file
that owns it. Everything else is a one-line cross-reference:

- Prettier settings — fully quoted already in 14. See that file.
- ESLint composition order (base → framework → project overrides →
  Prettier-disabling block) — fully described already in 14. See that
  file.
- tsconfig facts beyond the base file (`noUncheckedIndexedAccess`,
  `jsx: "react-jsx"`, the `noUnusedLocals`/`noUnusedParameters`
  reversal for React) — fully described already in 02. See that file.
- Coverage threshold numbers (85/85/85/85) — fully stated already in
  10. See that file.

**Real gaps, quoted verbatim:**

The `ignores` array for `eslint.config.js`. Provenance: `kus-pqms`'s,
carried forward — every entry still applies:
```js
ignores: [
  "**/dist/**",
  "**/coverage/**",
  "**/storybook-static/**",
  "**/.turbo/**",
  "**/node_modules/**",
  "**/*.d.ts",
  "packages/design-tokens/src/tokens.css",
  "packages/ui-library/src/styles/tokens.css",
  "_bmad/**",
  "docs/**",
  ".claude/**",
],
```

The **shape** of a per-file rule carve-out — one config object naming
the files and switching off exactly one rule, with an inline comment
giving the reason. 11-accessibility-standards.md anticipates needing
this pattern for wrapper components; it is quoted here so the shape is
unambiguous.

The rule name and paths below are `kus-pqms`'s — a Vue a11y rule on
`.vue` files. The React equivalent uses the corresponding `jsx-a11y`
rule name and `.tsx` paths; the structure is what carries forward:
```js
{
  files: [
    "packages/ui-library/src/components/base/BaseSelect/BaseSelect.vue",
    "packages/ui-library/src/components/overlay/BaseTooltip/BaseTooltip.vue",
  ],
  rules: {
    "vuejs-accessibility/no-static-element-interactions": "off",
  },
},
```

`apps/portal/vite.config.ts`'s dev-server proxy configuration.
The four paths and their target vars are carried forward from
`kus-pqms`; note the ordering — the catch-all `/api` entry must come
**last**, or it shadows the three more specific paths above it:
```js
proxy: {
  "/api/v1/master-data": { target: masterDataApiUrl, changeOrigin: true },
  "/api/v1/classification-keys": { target: masterDataApiUrl, changeOrigin: true },
  "/api/notification": { target: notificationApiUrl, changeOrigin: true },
  "/api": { target: issueManagementApiUrl, changeOrigin: true },
},
```

The Vitest `coverage` block. 10-testing-standards.md owns the four
threshold numbers; this is the surrounding block they sit in.

**The globs cover both extensions, and that is load-bearing.** Per 10,
a component spec is `.spec.tsx` and a module spec is `.spec.ts`, so a
`.ts`-only glob excludes half the suite from the exclusion — meaning
every React component spec would count as uncovered *source*. The entry
point is `src/main.tsx`, not `src/main.ts`. 10 names this block as what
makes 85%-from-day-one achievable, so a glob that misses is not a
cosmetic defect: it breaks 10's argument.

Provenance and the reason this is called out: the block is carried
forward from `kus-pqms`, whose globs were Vue-shaped (`*.spec.ts`,
`*.stories.ts`, `src/main.ts`) and were reproduced here unchanged.
15-devsecops-and-ci-cd.md caught the identical defect in
`sonar.test.inclusions` and the fix was not propagated here — which is
the corpus's own rule about re-checking dependents, unapplied.
```js
coverage: {
  provider: "v8",
  reporter: ["text", "lcov", "json-summary"],
  reportsDirectory: "./coverage",
  exclude: [
    "**/*.stories.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
    "src/tests/**",
    "**/*.d.ts",
    "**/*.config.*",
    "src/main.tsx",
  ],
  thresholds: {
    statements: 85,
    branches: 85,
    functions: 85,
    lines: 85,
  },
},
```

`.nvmrc`'s content — referenced by name in 00 and 15:
```
24
```

**`tsconfig.base.json` is not reproduced here.**
02-typescript-standards.md's "Baseline" section carries the
authoritative table of required values and owns them.

This is a deliberate removal. An earlier revision of this file quoted
`kus-pqms`'s `tsconfig.base.json` in full and labelled it "quoted
verbatim" — and it was neither verbatim (it silently dropped a six-line
comment and a commented-out option) nor correct for this repo (it
carried `"target": "ES2020"` and `"jsx": "preserve"`, both of which 02
changes). A config snippet that is wrong in an appendix is worse than
no snippet, because it looks authoritative and reads faster than the
file that actually owns it. Go to 02.

Two values worth stating here because they are easy to get wrong and 02
explains them at length: `target` and `lib` are **ES2022**, not ES2020,
in `tsconfig.base.json` **directly** — not overridden per package.

### Supersedes / absorbs
draft §16 Appendix

---

## 21 — Logging, Formatting and Client Diagnostics
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
What the browser logs, at what level, in what shape, and what must never
appear in a log line. Also the formatting utilities every screen needs and
no file currently owns: date, time, timezone, number and unit.

### Why this file exists
`05-api-integration-and-data-fetching.md` names a `logger` seam in passing.
`13-security-standards.md` inventories `VITE_MONITORING_DSN` as one of seven
environment variables and nothing consumes it. BRD `NFR-O-001` requires a
correlation ID propagated from the browser; `NFR-O-005` states that no log
may contain a credential, token or unredacted personal data. **Three files
depend on logging and none owns it.**

Provenance: `kus-pqms` had a logger and a monitoring seam, and
`frontend/docs/engineering/coding-guidelines.md` carried a Logging section.
Neither is carried forward, so this is a specification rather than a
description.

### Levels — four, and what each means
| Level | Use for | Ships to |
|---|---|---|
| `error` | A failure the user experienced: an unhandled rejection, a `5xx`, a chunk-load failure, a render error caught by a boundary | Console **and** the monitoring sink when configured |
| `warn` | A degradation the user did not experience: a stale-cache fallback, a retried request that eventually succeeded, a schema field that was lenient per one of `05`'s three named exceptions | Console; sink only in production |
| `info` | A business-significant event worth counting — see `25`'s metric list | Sink only |
| `debug` | Development diagnosis | Console in development only; **never** shipped |

**`console.log` is not a level.** It is banned in committed code; use
`debug`. Enforce with the `no-console` ESLint rule allowing `warn` and
`error` only, in 14's position-4 override block.

### Shape
Every log entry is a structured object, never an interpolated string:

```ts
logger.error("issueRegistrationFailed", {
  correlationId,        // from the ApiError, per 05
  code,                 // the Appendix E code, per 22
  route,                // the current route path, never the full URL
});
```

**A log message is a stable key, not a sentence.**
`"issueRegistrationFailed"`, not `` `Failed to register issue ${id}` ``. The
reason is aggregation: an interpolated string produces one distinct message
per occurrence and cannot be counted.

### What never appears in a log line
Stated as prohibitions because each has a real path into a log:

- **Any token or credential.** Includes the whole `Authorization` header,
  MSAL's cache contents, and any object that might contain them — never log
  a raw request or response object.
- **VIN.** BRD `§18.4` classifies it as indirectly identifying and requires
  it redacted from logs specifically.
- **User name or email.** The user id is sufficient for correlation.
- **Issue description or comment text.** BRD `§18.4` records that these may
  contain customer personal data entered as free text, and that this is
  controlled by policy rather than technology — so logging them defeats the
  only control.
- **A full URL with query parameters.** Filter state is URL-encoded per
  `NAV-01`, so a URL can carry a search term.

**A CI check, not a convention.** Add a log-scanning test to the `quality`
job asserting that no committed source file passes any of the prohibited
field names into a logger call. BRD `NFR-O-005` is a gated NFR; a convention
does not gate.

### Correlation ID
`05`'s request interceptor already attaches `X-Correlation-ID` on every
request. Two additions:

- The same value is attached to every log entry raised while that request is
  in flight.
- When an `ApiError` surfaces to the user, its `correlationId` is shown in
  the error UI (`22`) so a support ticket carries it. Provenance: `05`
  records that `kus-pqms` appended `correlationId` to toasts for exactly
  this reason.

### Formatting utilities — `src/shared/format/`
One module per concern, all pure functions, all named exports per `14`.

| Module | Owns | Rule |
|---|---|---|
| `date.ts` | Absolute dates, date-times, relative times ("8 min ago") | **Every timestamp is stored in UTC and rendered in the viewer's local timezone with the timezone shown** (BRD `BR-A06`). "Shown" is literal — a rendered time carries its zone abbreviation or offset. |
| `number.ts` | Counts, decimals, percentages | Locale-aware via `Intl.NumberFormat`. Numeric table columns are right-aligned (BRD `§8.4`). |
| `unit.ts` | Days-open (`Nd`), file sizes, currency | **Units are always shown** (BRD `§8.4`). Never a bare number where a unit applies. |
| `id.ts` | Issue ID display | Monospace rendering is a presentation concern, but the format is validated here against `{SYS}-{YY}{NNNN}`. |

**[PLACEHOLDER — the date library.** `Intl` covers formatting; it does not
cover timezone-aware arithmetic or parsing. Candidates: none (Intl only),
`date-fns` + `date-fns-tz`, or `Temporal` once its browser support clears
the `NFR-U-009` matrix. Decide against a real requirement — the first screen
needing date arithmetic is Issue List's date-range filter. **Trigger:** W2-3
or the first date-range filter. **Owner:** Frontend Lead.**]**

**Never format inline in a component.** A `toLocaleDateString()` call inside
JSX is the failure mode this module exists to prevent: it produces one
format per call site and no way to change them together.

### A conflict the prior implementation makes concrete
The prohibition list above forbids full URLs. The prior repository's error
serializer attaches `url: window.location.href` to **every** report.

This is not a small violation. A PQMS URL carries the issue identifier in its
path, so the location of an error report is a record of which issue a named user
was looking at, shipped to a third-party sink.

**The React implementation must not carry the line forward unexamined.** The
options are to drop the field, or to send a sanitised route pattern
(`/issues/:id`, from the matched route rather than the resolved path) which is
what a triager actually needs — they want the *screen*, not the row.

**[PLACEHOLDER — whether the error report carries a sanitised route pattern or
no location at all. Trigger: when the monitoring transport is written. Owner:
Frontend Lead, with security review.]** It is a decision either way; it is not
an implementation detail of the serializer.

### The transport swap is also the test seam
25-observability-and-client-telemetry.md owns the sink. One consequence belongs
here, because it is what makes the rules in this file testable at all: the
logger exposes **set** and **reset** functions for its transport, documented as
test-only.

That is how a spec asserts the rules above — that an error was logged with the
right stable message key, that a token never appeared in a context object, that
a correlation ID was attached. Without the seam, the only way to test a log line
is to spy on the console, which couples every such test to the default
transport.

**Reset in `afterEach`.** A leaked transport turns one failing test into a
confusing cascade in unrelated files.

### `src/shared/format/` — one more module than listed
Add **file size** to the date, number, unit and identifier formatters above. It
is small, it appears wherever attachments and evidence do, and the prior
repository has it as a standalone tested module for exactly that reason. Byte
formatting hand-rolled at three call sites produces three different rounding
conventions.

---

## 22 — Error Handling and User Feedback
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
What the user sees when something fails, is loading, or is empty. The
mapping from the BRD's error codes to copy. The toast contract. Where each
belongs.

### Why this file exists, and the boundary against 03
`03-react-component-patterns-and-naming.md` owns **error boundaries** —
where they are declared, what they catch, how `throwOnError` interacts with
them — and it does that well. It then states that "inline error UI driven by
`useQuery`'s own `error` state" is the default and never says what inline
error UI *is*. It also states that mutation errors "surface at the
form/toast level" and there is no toast.

**03 owns the mechanism. This file owns what the user sees.** Neither
restates the other.

### The three failure surfaces
| Surface | When | Where it renders |
|---|---|---|
| **Field error** | A validation rule in the BRD's §14 table fails | Inline, beneath the field, with `aria-invalid` on the control and `aria-describedby` pointing at the message (`11`) |
| **Region error** | A query for one part of a screen fails | In place of that region only, with a retry action. The rest of the screen stays alive and interactive |
| **Route error** | The route is meaningless without the data (`03`'s `throwOnError: true` case), or a render threw | The route's `ErrorBoundary`, which replaces the page and keeps the app chrome |

**A mutation failure is never a route error.** `03` states this and it is
worth repeating as a user-facing rule: a failed save must never blank the
screen the user was typing into.

### Toasts
A toast reports the **outcome of an action the user just took**. It is never
used for a passive event, a validation error, or anything the user must read
to proceed.

| Rule | Detail |
|---|---|
| T-01 | A toast states the outcome **with the record ID**: "Issue EE-260001 registered." (`06`'s content voice.) |
| T-02 | Success toasts auto-dismiss after 5 seconds. **Error toasts do not auto-dismiss** — they are dismissed by the user. |
| T-03 | An error toast carries the `correlationId` when the failure came from an `ApiError` (`21`). |
| T-04 | One toast per action. A bulk action produces one toast summarising the batch, never one per item. |
| T-05 | A toast is announced to assistive technology via a polite live region. An error toast uses an assertive one. |
| T-06 | A toast is never the only record of something the user needs. If it matters after dismissal, it belongs in the record. |

**Placement.** The toast host is mounted once, at the root, above every
layout. Not per screen. Provenance: `kus-pqms` had a `BaseToast`; the host
was not specified, and per-screen hosts are how two toasts end up
overlapping.

### Empty, loading and error states — screen level
`component-specs/TEMPLATE.md` requires each component to declare these. This
is the **screen**-level contract, which that table does not cover.

| State | Rule |
|---|---|
| Loading | **Skeletons matching the shape of the content**, never a spinner over stale data. A list skeleton has the configured column count; a card skeleton has the card's shape. |
| Loading, subsequent | A refetch of already-displayed data does **not** replace it with a skeleton. Show the stale data with a subtle busy indicator. |
| Empty — no data at all | States what the screen is for and offers the action that creates the first record. |
| Empty — no data **matching a filter** | A different state, and the distinction is not cosmetic. It names the filter and offers to clear it, and states the unfiltered total: "No issues match these filters. Clear filters to see all {total} issues in the queue." (BRD `FR-LST-027`.) |
| Error | Names what failed, offers retry, and **preserves the user's state** — filters are not lost by a failed load (BRD `FR-LST-028`). |
| Stale | When cached data is served because a source is unavailable, a visible staleness indicator says so (BRD `FR-MST-003`). This is a fourth state and it is easy to forget. |

### Error-code to copy
BRD Appendix E defines 18 stable machine-readable codes. Every one maps to a
user-facing message.

| Rule | Detail |
|---|---|
| E-01 | The mapping lives in **one** module, `src/shared/errors/errorMessages.ts`, keyed by the Appendix E code. |
| E-02 | The messages are **i18n keys**, per `09`. They live in a single namespace, `ApiError`, registered by that module — the one deliberate exception to `09`'s per-component convention, because these strings belong to no component. |
| E-03 | An unmapped code renders a generic message **plus the code itself**, so a support ticket is actionable. Never a bare "Something went wrong." |
| E-04 | Four codes have specific UI behaviour beyond a message, and it is not optional: `ISM-CC-001` (concurrency) renders the Reload/Compare affordance of BRD `EF-02`; `ISM-AUTH-001` triggers the re-authentication redirect of `08`; `ISM-AUTH-002` renders the 403 route of `NAV-05`; `ISM-RATE-001` disables the triggering control until the retry window passes. |
| E-05 | A validation failure (`ISM-VAL-001`) is **never** shown as a toast. Its per-field `errors` array is mapped onto the fields it names. |

### Copy rules
Inherited from `06`'s content voice; restated here because these are the
strings most likely to be written badly:

- Name the field **and the fix**. "Enter a part number. Search the part
  master first." — not "Invalid input."
- Never blame the user, and never apologise.
- No exclamation marks, no emoji.
- Never expose an internal identifier other than the correlation ID and the
  error code.

---

## 23 — Git Workflow, Hooks and Commit Conventions
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
Branching, commit messages, the pre-commit/commit-msg/pre-push hook chain,
and the PR shape. Resolves `20`'s open `prepare` placeholder.

### Why this file exists
The Vue project had **Husky v9, `lint-staged`, and commitlint enforcing
Conventional Commits across three active hooks**. None of it is carried
forward and no React file mentions any of it. `20`'s `prepare` script is an
unresolved `[PLACEHOLDER]`. The Conventional Commits requirement has simply
vanished, and `15`'s Dependabot configuration *depends* on it — it specifies
`chore` and `ci` commit prefixes for a convention nothing enforces.

### Branching
| Rule | Detail |
|---|---|
| B-01 | One branch per unit of work. Naming: `<type>/<short-kebab-description>` where `<type>` matches the commit type below — `feat/issue-list-filters`, `fix/chunk-reload-loop`. |
| B-02 | Branch from the default branch; never from another feature branch. |
| B-03 | Rebase onto the default branch before opening a PR; merge commits into a feature branch make its history unreadable. |
| B-04 | **Restates 15's placeholder, does not own it — the default branch's name.** `15` carries the same placeholder: `kus-pqms` triggered CI on `[master, main]`, carrying both rather than resolving which. Name it once, here and in the workflow. **Trigger:** repo creation. **Owner:** Yogesh.**]** |

### Commits — Conventional Commits
`type(scope): subject`, where `type` is one of `feat`, `fix`, `refactor`,
`test`, `docs`, `chore`, `ci`, `perf`, `build`, `style`, `revert`.

| Rule | Detail |
|---|---|
| C-01 | The subject is imperative, lowercase, and carries no trailing period. |
| C-02 | `scope` is the package or feature: `ui-library`, `portal`, `issue-list`, `auth`. |
| C-03 | A commit touching a tier file **and** the generated distribution document is one commit, not two — `16` requires them to move together. |
| C-04 | Enforced by commitlint with `@commitlint/config-conventional` on the `commit-msg` hook. Not a convention; a gate. |

### Hooks — three, via Husky v9
| Hook | Runs | Why not more |
|---|---|---|
| `pre-commit` | `lint-staged`: `eslint --fix` then `prettier --write` on staged files only | Scoped to staged files so the hook stays sub-second. A full lint here trains people to use `--no-verify`. |
| `commit-msg` | `commitlint` | Cheap and catches the thing no later gate catches. |
| `pre-push` | `typecheck` and `lint` across the workspace | **Not the test suite.** Provenance: `kus-pqms` deliberately left the full Vitest run to CI, and that judgement carries — a multi-minute pre-push hook is a hook people disable. |

`--no-verify` is for emergencies and its use is stated in the PR
description.

**RESOLVED (2026-08-24, verified against the repository).**

```
pqms-portal-dev/          <- git root (.git lives here)
├─ BRD/
├─ requirements/
└─ pqms-portal/           <- pnpm workspace root (pnpm-workspace.yaml, turbo.json)
   ├─ apps/portal
   └─ packages/{ui-library,design-tokens}
```

**The git root is one level above the pnpm workspace root**, and it holds
non-code siblings (`BRD/`, `requirements/`). There is no `.git` inside
`pqms-portal/`. So:

| Setting | Value |
|---|---|
| `prepare` script | `cd .. && husky pqms-portal/.husky` |
| `core.hooksPath` | `pqms-portal/.husky/_` |
| Hook working directory | git passes the **git root**; every hook `cd`s to `pqms-portal` first |

This is the same shape the prior repository had, which is why its three hooks
transfer nearly verbatim — see the section below.

This also closes the matching placeholder in 20-glossary-and-appendix.md.

### Pull requests
| Rule | Detail |
|---|---|
| P-01 | One concern per PR. One component = one PR; one foundation task = one PR. Provenance: the prior repository’s 30-working-day React migration plan's working agreements. |
| P-02 | The description names the **FR ID** from the BRD that the change implements, per the BRD's own `TR-02`. A PR with no requirement reference is a PR nobody can trace. |
| P-03 | The gate runs green **before** review is requested. A red gate means the PR is not ready for a reviewer's time. |
| P-04 | **Every PR states its AI-assistance level:** `none` / `drafted` / `generated`. Carried from the prior repository’s 30-working-day React migration plan. Humans review and own the result regardless. |
| P-05 | No self-merge. At least one human review. |
| P-06 | A PR that lowers a coverage threshold, disables a lint rule, or adds an `eslint-disable` carries a written justification in the description, not only in a comment. |

### Which repository shape are the hooks written for?
The prior repository's three hooks are each about 60% workaround for one fact:
**it is a pnpm project inside a polyglot monorepo** that also holds a backend,
infrastructure and an automation-test suite. `core.hooksPath` is repo-wide and
git supports exactly one, so every hook fires on backend-only commits too.

The consequences, all three of which are non-obvious and were paid for once:

- **`pre-commit`** exits early unless something staged actually lives under the
  frontend directory, then `cd`s there before running the staged-file linter.
- **`commit-msg`** must resolve its argument to an absolute path **before**
  changing directory — git passes the message file relative to the repository
  root, so a `cd` first makes the hook lint the wrong file or no file.
- **`pre-push`** detects whether the push includes frontend changes and **fails
  open** — running the checks — when it cannot tell, e.g. on the first push of a
  new branch. Failing closed there would silently skip the gate on exactly the
  pushes most likely to need it.

**RESOLVED: it is the sub-directory shape.** The git root holds `BRD/` and
`requirements/` alongside `pqms-portal/`, so commits touching only requirements
documents will fire these hooks. **All three guards below are required**, not
optional hardening — without them a documentation-only commit runs
`lint-staged` against a workspace it never touched, and a first push of a new
branch either skips the gate or fails on a path it cannot resolve. If standalone, all three hooks are four lines each and none of the
above applies. If not, all of the above applies and is worth copying verbatim
rather than rediscovering.

#### What `pre-push` runs, and what it deliberately does not
Type-check and lint. **Not the unit suite** — the prior repository records the
reason ("~80s ... intentionally left to CI to keep push latency low") and, in
the same comment, exactly how to add it locally for anyone who wants it.

That is the right trade and the right way to record it: a hook slow enough to be
resented is a hook that gets bypassed with `--no-verify`, and a bypassed hook
enforces nothing.

### `.git-blame-ignore-revs` — required before the first bulk commit
A restructure is a large mechanical move-and-reformat. Without a blame-ignore
file, `git blame` on every touched line points at the restructure commit, and
the real authorship history becomes unreachable through the tooling everyone
actually uses — editor gutter annotations, `git blame`, review-time "who wrote
this and why".

**The rule.** Every bulk mechanical commit — the formatting baseline, a rename
sweep, a codemod, a line-ending renormalisation — appends its full 40-character
SHA to `.git-blame-ignore-revs`, **in the commit that follows it**, with a
one-line comment saying what the commit was.

Two supporting points, both easy to miss:

- The file does nothing until a reader enables it
  (`git config blame.ignoreRevsFile .git-blame-ignore-revs`). Put that line in
  19-onboarding-and-dev-workflow.md's first-run sequence, or the file is a
  well-maintained no-op.
- It only works if the commit really was mechanical. **A bulk commit that also
  changes behaviour is unignorable** — which is the enforcement mechanism behind
  30-restructuring-an-existing-react-project.md's rule never to restructure and
  rewrite in the same commit.

## ─────────────────────────────────────────────────────────────
### Lefthook, not Husky — this supersedes the hook mechanics above

**The target repository uses Lefthook** (`lefthook.yml`), not Husky and not
`lint-staged` (`docs/STACK.md` §5, `TEAM-GUIDE.md` §7). Every path resolution,
`prepare`-script and `core.hooksPath` detail above is therefore **withdrawn for
this repository**, including the resolution recorded earlier in this file, which
was derived against a different layout.

**The reasoning above survives the change of tool.** The three problems the
Husky hooks solved — one hooks path for a polyglot repo, argument paths relative
to the git root, and failing open when the push range is unresolvable — are
properties of the *repository*, not of Husky. Lefthook solves the first two
natively; the third is still yours.

#### What Lefthook already runs

| Check | Scope | Command |
|---|---|---|
| Spotless (Java) | `backend/**/*.java` | `cd backend && ./gradlew spotlessCheck` |
| ESLint | `frontend/**/*.{ts,tsx,js,jsx}` | `pnpm exec eslint --fix {staged_files}` |
| Prettier | `frontend/**/*.{ts,tsx,js,jsx,css,md,json}` | `pnpm exec prettier --write {staged_files}` |
| ruff | `**/*.py` | `ruff check --fix {staged_files}` |
| Harness conformance | `.claude/**`, `.moai/config/sections/*.yaml`, `CLAUDE.md` | `python3 scripts/validate-harness.py` |

**Lefthook's `glob` + `{staged_files}` replaces `lint-staged` entirely**, and
its per-command `root:` replaces the manual `cd`. So the frontend's staged-file
gate already exists and needs configuring, not building.

#### Four things to fix or verify, in order

**1. Prettier is invoked and not declared.** `docs/STACK.md` §8 item 5. The hook
calls `pnpm exec prettier`; `prettier` is not in `frontend/package.json`. Either
it resolves a hoisted transitive copy — working by accident, breaking on any
dependency change — or it fails and is ignored. **Establish which, then declare
the dependency.** Do not delete the step; see 14-code-style-and-linting.md.

**2. The Prettier glob includes `md`, and this corpus says it must not.**
14 excludes Markdown because prose and tables are hand-wrapped for meaning.
The current glob reformats every Markdown file under `frontend/` — **including
`PQMS_docs/` if this corpus lives there.** Narrow the glob or add a
`.prettierignore`; this one has already cost this project two cycles elsewhere.

**3. The harness check runs on the whole repo regardless of what is staged**,
deliberately — it validates zone resolution and `CLAUDE.md` size globally. So a
frontend-only commit still pays for it. That is a stated trade, not a bug, but
it belongs in 19's expectations so nobody reports it.

**4. There is no `pre-push` stage configured.** The reasoning above still holds —
type-check and lint on push, **not** the unit suite. Add it as a Lefthook
`pre-push` with `tsc --noEmit` and ESLint scoped to `frontend/`.

#### Commits and merge requests — GitLab, not GitHub

**Conventional Commits still applies**, and there is an extra constraint:
`docs/conventions/README.md` §1 defines a `type:*` **label taxonomy for merge
requests** and states that **MR labels and commit prefixes should agree**. So
the commit type is not only a message convention here — it has a matching label,
and a mismatch is a review finding.

Per `TEAM-GUIDE.md` §3: **no `CONTRIBUTING.md` and no MR template exist.** Both
are worth adding, and the MR template is where this corpus's pull-request rules
— including the AI-assistance declaration — actually get enforced. **A rule
stated only in a standards document is a rule the MR form never asks about.**

Branch naming follows the harness: **`feat/SPEC-<ID>`** for SPEC work
(32-working-within-the-moai-spec-workflow.md). Restructuring commits are SPEC
commits, so they inherit it.

#### `.git-blame-ignore-revs` — still required, and now repo-wide
Unchanged and more important: a restructure inside `frontend/` produces bulk
mechanical commits in a repository three other teams read. **Append every bulk
SHA**, and note that the file lives at the **git root**, so backend and infra
bulk commits belong in the same file.

### `.githooks/` — this supersedes both the Husky and the Lefthook sections

**The target repository uses neither.** It has a root `.githooks/` directory —
plain git hook scripts, wired with `core.hooksPath`, and a per-component
`commit-msg.rules` file whose contents differ per component.

So both preceding sections are now **reference material**: the Husky one
describes a tool that is not here, and the Lefthook one describes a tool that is
not here either. **What survives both is the reasoning**, because the problems
being solved are properties of the repository:

| Problem | Still true? |
|---|---|
| One `core.hooksPath` for a multi-component repo | **yes** — all four component directories share it. (An earlier revision said "four submodules". They are ordinary directories in ONE repository — 33-polyglot-monorepo-integration.md owns the withdrawal.) |
| `commit-msg`'s argument is relative to the git root | **yes** — resolve to absolute before any `cd` |
| A push range that cannot be resolved must **fail open** | **yes** |
| Staged-file scoping | **yes**, and now hand-written rather than provided |

#### What plain hooks cost that a hook manager gave you free

Husky and Lefthook both provide staged-file filtering. A raw hook does not, so
**it has to be written**, and this is where plain-hook setups usually go wrong:

- **Scope by staged path, explicitly.** `git diff --cached --name-only` filtered
  to `frontend/`, and exit 0 when the list is empty. Without this, a
  backend-only commit runs the frontend linter.
- **Pass the file list to the tool**, rather than letting the tool walk the
  tree. A linter invoked with no arguments lints everything, which is slow
  enough that the hook gets bypassed.
- **Exit codes are the whole contract.** No non-zero exit, no gate. A hook that
  pipes to `tee` or ends in an `echo` returns the exit code of *that*, and
  silently always passes. **This is the most common defect in hand-written
  hooks and it is invisible until something should have failed.**

#### Verify three things before trusting any of it

1. **`git config core.hooksPath`** actually points at `.githooks`. It is a local
   config value — it does **not** clone with the repository, so every developer
   sets it or has it set by a bootstrap script. A hooks directory nobody has
   enabled is a directory of inert files.
2. **The scripts are executable** (`git update-index --chmod=+x`). A
   non-executable hook is skipped silently on Unix.
3. **ANSWERED 2026-08-25 — a commit inside `frontend/` DOES fire the root
   hooks.** An earlier revision called this "a question to test, not assume", on
   the premise that `frontend/` was a submodule with its own `.git`. **It is
   not** (33-polyglot-monorepo-integration.md owns that withdrawal), so there is
   one repository, one `core.hooksPath`, and one set of hooks.

   Tested rather than reasoned: a file staged in `frontend/` with a deliberately
   invalid commit message was **rejected** — the root router ran
   `frontend/scripts/pre-commit.sh` and validated the message against
   `frontend/commit-msg.rules`. Because a working hook *blocks*, the test left
   nothing behind.

   **The live risk is item 1 above, not this one.** `core.hooksPath` still does
   not clone, and with no CI anywhere an unbootstrapped clone has **zero**
   enforcement of any kind.

   **A bootstrap now exists:** `frontend/scripts/setup-hooks.mjs`, wired as a
   `prepare` script so `pnpm install` runs it, with `pnpm run hooks:check` to
   verify and a documented one-liner in `frontend/README.md` for anyone who has
   not installed. It is idempotent, verifies hook executability from the **index**
   mode (`100755` — the working-tree bit is meaningless where `core.filemode` is
   false), and refuses to overwrite a `core.hooksPath` already set to something
   else.

   **It does not fully close, and the residue is repository-level.**
   `core.hooksPath` is a single value for the whole repository, so a bootstrap
   living in `frontend/` reaches only people who install there — someone working
   solely in `backend/` still gets nothing. Closing that needs a root-level
   mechanism, which is the repo owner's to choose. Tracked as an open placeholder
   in 18-project-context-and-implementation-status.md.

#### `commit-msg.rules` — per component, and that is deliberate

Each component carries its own. **The frontend's file is authoritative for the
frontend, and this corpus reaches into no other component's** —
33-polyglot-monorepo-integration.md's boundary rule applies to conventions as
much as to code.

**Read the frontend's file before writing any commit.** It is the actual
convention here, and Conventional Commits above is a *recommendation* until that
file agrees with it. If the two differ, **the file wins** — it is what the hook
enforces, and a standard that disagrees with the enforcement is a standard
nobody follows.

#### Still required, and now easier
**`.gitattributes` already exists at the root.** Confirm it carries
`* text=auto eol=lf`. **`.git-blame-ignore-revs` does not appear to exist** —
create it before the first bulk commit, at the **git root**, shared by all four
components.

### Run `git status` before every commit. Always. This one is not optional.

**Twice in one working session, files were staged that nobody staged.** Once it
was ~115 files; once 19. Both were caught by inspection, not by a tool.

**The mechanism was searched for and NOT found.** Ruled out, each by direct test:

| Suspect | Result |
|---|---|
| `git add` / `git stash` in any script under `scripts/` or `.githooks/` | **none** — the only textual hits are a comment and an error-message string |
| A git alias | **none configured** |
| A gate that writes then stages (`ds-gate.mjs` rewrites `.ds-ceilings.json` on a drop) | **does not stage** — verified by touching a file, running every writing gate, and re-checking the index |
| `pnpm install` and its `prepare` hook | **does not stage** — verified |
| Editor git integration | no `.vscode/settings.json`; no `autostash`/`smartCommit` config |

**So the rule is procedural, because the cause is unknown:**

> **Run `git status` immediately before every `git commit`, and read it.** Never
> assume the index contains what you put there. If it contains anything you did
> not stage, `git reset` and re-stage deliberately.

#### And the sharper hazard this produced

**`git checkout -- <path>` restores from the INDEX, not from HEAD.**

During this session that command was used to revert a test edit, and it silently
restored *the staged version* — which happened to be correct only by luck. **Had
the file not been accidentally staged, it would have reverted a day of
uncommitted work.**

> **Never use `git checkout -- <path>` to undo a local edit while uncommitted work
> is in the tree.** Copy the file aside first and restore from that copy. The
> command's behaviour depends on index state you may not know you have.

Both rules exist because the index was not what it appeared to be. Until the
staging cause is identified, treat the index as untrusted input.

---

## 24 — Storybook Authoring
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
What a story file contains and how it relates to a component's
specification. `01-project-structure-and-architecture.md` owns *that*
Storybook exists and is the component verification surface; it says nothing
about what goes in a story.

### The relationship that makes this file necessary
A component has three artifacts and they are not redundant:

- **The spec** (`component-specs/<Name>.md`) says what the API **is**.
- **The stories** show what each value of that API **looks like**.
- **The `.spec.tsx`** asserts what it **does**.

**The story set is derived from the spec's Variants-and-sizes table,
mechanically.** Every value of every visual union gets a story. That is the
rule, and it is what makes a missing story reviewable: open the spec, count
the values, count the stories.

### Rules
| ID | Rule |
|---|---|
| SB-01 | **CSF3 format**, one `.stories.tsx` per component, co-located beside the component — *not* in the mirrored `src/tests/` tree. That tree is `10`'s and holds test files; a story is not a test. |
| SB-02 | A `Default` story shows the component with only its required props. It is the first story and it is what a reader sees first. |
| SB-03 | **One story per value of every visual union**, per the spec's table. A component with four variants and three sizes does not need twelve stories — it needs one per variant plus one per size, with the others at their defaults. |
| SB-04 | **One story per non-default state**: disabled, loading, error, empty, selected, indeterminate — whichever the spec says the component has. A state with no story is a state nobody has looked at. |
| SB-05 | **No story reaches the network, a store, or a router.** A component needing one of those is either misplaced (it belongs in `apps/portal`, per `01`) or needs the dependency injected as a prop. This is the constraint that keeps `ui-library` honest. |
| SB-06 | Args are typed from the component's own props interface. No `any`, no untyped `args` object. |
| SB-07 | A story never hardcodes a design value — `06`'s token rule applies to stories exactly as it does to components. |
| SB-08 | `@storybook/addon-a11y` is wired and its panel is checked during component review. Per `10` it is **manual** and does not substitute for the axe assertions in the test run. |
| SB-09 | A component's stories are written **in the same PR as the component**, never a follow-up. `01` makes Storybook the verification surface; a component with no stories has not been verified. |

### Interaction stories
Play functions are **permitted and encouraged for keyboard behaviour**,
which is where the primitive-backed components in `06`'s exception table are
most likely to be subtly wrong and where a static story shows nothing at
all. They do **not** replace the `.spec.tsx`: a play function demonstrates,
an assertion gates.

**Restates 15's placeholder, does not own it — whether CI builds
Storybook.** `15` carries this open
question with both sides stated. It is a Storybook question, so it is
recorded here too rather than only there. **Trigger:** W1-8. **Owner:**
Yogesh.**]**

### The file shape, worked

Every story file is CSF3 and opens the same way. `satisfies Meta<typeof X>`
rather than a type annotation — it type-checks the meta **and** keeps the
literal types, so `StoryObj<typeof meta>` narrows `args` to this component's
real props:

```tsx
// BaseButton.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { BaseButton } from "./BaseButton";

const meta = {
  title: "Base/BaseButton",
  component: BaseButton,
  parameters: { layout: "centered" },
  args: { children: "Save changes" },
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof BaseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Danger: Story = { args: { variant: "danger" } };
export const Loading: Story = { args: { isLoading: true } };
export const Disabled: Story = { args: { disabled: true } };
```

Four things that example is demonstrating, each of which is the rule:

- **`title` mirrors the category folder**, so the sidebar and the file tree are
  the same tree. `Base/`, `Composite/`, `Feedback/`, `Layout/`, `Navigation/`,
  `Overlay/`, `Pqms/` — the categories 01-project-structure-and-architecture.md
  owns. A story filed under the wrong prefix is invisible to anyone browsing.
- **Shared setup lives in `meta.args`**, and each story overrides only what it
  is demonstrating. A story that re-declares every prop hides which one it is
  about.
- **One story per row of the spec's variant table**, named after the variant.
  Not "Example1", not "Playground".
- **`argTypes` are declared only where the inferred control is wrong.** A union
  usually infers a select correctly; declaring it again is noise that goes stale
  when the union changes.

### The three decorators an app-level story needs

A `ui-library` component renders standalone by definition — that is what makes
it a library component. An `apps/portal` component usually does not, and the
three things it reaches for are always the same:

| Missing | Symptom | Decorator |
|---|---|---|
| Router | `useNavigate`/`Link` throws on render | a memory router at the story's path |
| Query client | a query hook throws "No QueryClient set" | a fresh client per story, retries off |
| i18n | keys render instead of text | the app's i18n instance |

**Declare them in `.storybook/preview.tsx` globally**, not per file. Per-file
decorators mean the twentieth story author discovers the requirement by hitting
the error.

**A fresh query client per story, with `retry: false`** — a shared client leaks
cache between stories, so the story you open second shows the data from the one
you opened first, and a failing fixture retries three times before showing the
error state you were trying to look at.

**If a component needs a store to render, that is a finding, not a decorator.**
04-state-management.md's boundary says presentational components take props. A
component that cannot be storied without a store is one that will not be
testable either.

### Interaction stories — and their honest limit

A `play` function drives the component after render, and it is the right tool
for exactly one thing: **a visual state that only exists after an interaction**
and that a reviewer needs to see — an open dropdown, a form mid-validation, a
menu with the third item focused.

**It is not a substitute for a test.** Assertions in a `play` function run in a
browser nobody watches, are not in the coverage report, and do not gate CI. The
`.spec.tsx` is where behaviour is asserted, per 10-testing-standards.md.

The rule that follows: **a `play` function sets up state; it does not assert.**
If you find yourself writing `expect` in one, the assertion belongs in the spec
and the story should just show the resulting state.

### What the a11y addon does, and what it does not

It runs axe against the rendered story and shows violations in a panel. That is
genuinely useful while building, and it is **manual** — nobody is watching the
panel in CI, and the `build-storybook` step 15-devsecops-and-ci-cd.md adds
catches build breakage only.

**The gate is the axe sweep in the test run** (10-testing-standards.md), which
enumerates the barrel and fails the build. The addon is the fast feedback loop;
the sweep is the check. Treating the addon as the check is how a library ships
with violations nobody was ever told about.

### What does not get a story

- **Anything that is only a layout wrapper with no visual variation.** A story
  showing one immutable rendering is a screenshot with a build step.
- **Screens.** A screen's contract is its screen description
  (29-screen-description-authoring.md) and its route. Storying a whole screen
  means mocking its entire data layer, and the mock drifts from the fixtures
  that the app and the tests share.
- **A component with a single variant and no states.** Add the story when the
  second variant arrives.

**Everything in `packages/ui-library` does get one**, without exception — that
is what makes the library browsable, and a missing story is a review-blocking
finding per 16-code-review-checklist.md.

### Autodocs

Enable `tags: ["autodocs"]` on library components. The generated page reads prop
tables from the TypeScript types, so **the props documentation is the types** and
cannot drift from them.

Write the component's one-paragraph description as a TSDoc comment on the
component itself rather than in `parameters.docs`. It then serves the editor
tooltip, the generated page and the reader of the source from one place.

### Stories and the coverage gate

Story files are **excluded from coverage** (10-testing-standards.md's exclusion
list). Two consequences worth stating so nobody games them:

- **A story does not raise coverage.** Writing stories instead of tests moves
  the number nowhere, which is correct.
- **A story file must not contain logic.** Helper functions, fixture builders
  and mappers written inside a story file are invisible to the gate. Put them in
  the fixture modules 26-test-data-fixtures-and-test-scope.md owns, where the
  app and the tests use the same ones.

---

## 25 — Observability and Client Telemetry
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
What the running application reports about itself, to where, and which
business measures depend on it. `21` owns log levels and shape; this file
owns the sink, the metrics and the errors.

### Why this file exists
`13-security-standards.md` inventories `VITE_MONITORING_DSN` —
"error-monitoring sink; unset = console-only" — and nothing else in the
corpus mentions it. BRD `NFR-O-001…005` commit to correlation-ID
propagation, per-event metrics, health signals and alerting. BRD `BO-01` and
`BO-08` state success measures — "median elapsed time from registration to
first investigation activity reduced ≥30%", "median time-to-first-action
reduced ≥40%" — that **cannot be measured without client instrumentation
nobody has specified.**

### The sink
| Rule | Detail |
|---|---|
| O-01 | One monitoring client, initialised once at boot from `VITE_MONITORING_DSN`. **Unset means console-only** and that is a supported mode, not a broken one — local development runs that way. |
| O-02 | The client is behind an interface in `src/shared/monitoring/`, so the vendor can change without touching call sites. Same seam discipline `08` applies to auth and `05` to the token getter. |
| O-03 | **[PLACEHOLDER — which vendor.** `08`'s out-of-scope list defers "Monitoring/observability integration (App Insights/Sentry/OTel)" as an ADR-0001 deferral. The interface can be built without the answer; the client cannot. **Trigger:** before go-live; the `NFR-O-004` alerting requirement has no other home. **Owner:** Architect + Ops.**]** |
| O-04 | Every event carries: the correlation ID if one is in scope, the route, the release version, and the user's **role** — never their name or email (`21`). |

### What is reported
| Category | Reported | Requirement |
|---|---|---|
| Unhandled errors | Every uncaught exception and unhandled rejection | `NFR-O-004` |
| Boundary catches | Every error a route or component boundary catches, with which boundary caught it | `03` |
| Chunk-load failures | Separately from other errors — a spike means a deploy went wrong, not that the app is broken | `03` |
| Failed requests | Status, Appendix E code, endpoint (path only, never the query string) | `21` |
| Web Vitals | LCP, INP, CLS, reported per route | `12` |
| Business events | Registration submitted / succeeded / failed; status change; correlation panel shown, previewed, accepted, dismissed; export requested | `BO-01`, `BO-03`, `BO-08` |
| Session | Sign-in, sign-out, session expiry, re-authentication | `FR-SEC-008` |

**The business-event row is the one that will be forgotten.** It is not
error monitoring and it is not analytics for its own sake — three of the
BRD's ten business objectives state numeric success measures, and those
numbers come from here. `BO-03` in particular ("≥60% of registrations with a
true duplicate surface it before submit") requires the correlation-panel
events above, and there is no other way to obtain it.

### What is never reported
Every prohibition in `21`'s "What never appears in a log line" applies
identically. A monitoring sink is a third party; the bar is higher, not
lower.

### Release identification
Every report carries a release identifier derived at build time from the
commit SHA. Without it, "this error started happening" is unanswerable.
Injected as a `VITE_`-prefixed build-time value, which per `13` means it is
**public** — acceptable, a commit SHA is not a secret, but it must be
declared in `env.d.ts` like every other.

### The interface, concretely
This file specifies "the sink behind an interface". The prior repository ships
that interface, it is small, and it is worth adopting close to verbatim:

```ts
export interface LoggerTransport {
  error: (err: unknown, context?: LogContext) => void;
  warn:  (message: string, context?: LogContext) => void;
  info:  (message: string, context?: LogContext) => void;
}
```

with a factory that **wraps** a base transport rather than replacing it. Four
properties of that design, each of which is a rule here:

- **Only `error` forwards.** `warn` and `info` stay local. A sink that receives
  every info line is a sink nobody reads and a bill nobody expected.
- **The sink call is wrapped in try/catch, and a failure is logged through the
  base transport.** **A throwing sink must never break logging** — a monitoring
  outage that takes the console with it turns a small incident into an
  undiagnosable one.
- **It composes rather than switches.** The console transport stays underneath
  in every environment, so a developer with monitoring enabled still sees
  everything locally.
- **The vendor is one function.** Swapping a beacon for a vendor SDK replaces
  the `report` callback and nothing else — no call site changes, no import
  changes.

### Dormant unless configured
The prior implementation enables reporting **only when a DSN environment
variable is set**, and otherwise leaves the console transport untouched. That is
the correct default: no accidental reporting from a developer's machine, from a
test run, or from a preview build, and no code path that behaves differently
because a network call quietly failed.

13-security-standards.md owns the variable; it is one entry in the
`ImportMetaEnv` inventory, and its absence is a valid state rather than a
misconfiguration.

### Delivery: beacon first
Prefer the browser's beacon API, falling back to a keep-alive fetch. The reason
is specific and not obvious: **a report raised during page unload is exactly the
report a normal fetch loses**, and unload is when navigation-triggered errors
and unhandled rejections surface. Getting this wrong produces a monitoring
dashboard that is systematically blind to one class of failure.

Payload shape stays flat and serialisable — message, stack, the structured
context, a timestamp — and 21-logging-formatting-and-client-diagnostics.md's
prohibition list applies to it **unchanged**. That file records one concrete
violation in the prior implementation and the open decision it raises.

### Installed once, at bootstrap
One call during application start-up, before the router and before the first
render, so an error thrown during bootstrap is reported rather than lost. It is
also the only place the DSN is read.

---

## 26 — Test Data, Fixtures and Test-Scope Rules
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
Where fixture data lives, how it is built, and the four test-scope questions
`10-testing-standards.md` deliberately leaves open. Resolves `05`'s open
placeholder on fixture-module location.

### Fixture modules — location
**`src/fixtures/`, one module per domain area**, mirroring `services/`'s
feature grouping: `src/fixtures/issue-management/`,
`src/fixtures/notification/`.

Resolves `05`'s placeholder. `05` states the constraint that shaped it:
`kus-pqms` used `src/api/`, which also held the domain types that `02` now
places in `src/types/` — so copying that folder wholesale would drag two
concerns into one place. A dedicated folder separates them. **Decided
here**, with that reasoning, rather than inherited.

### Rules
| ID | Rule |
|---|---|
| F-01 | **A fixture is the domain shape, not the wire shape.** It is returned by a service function *after* mapping, so it is what a component would receive. |
| F-02 | **Every fixture passes the same Zod schema a real response passes** (`05`). A fixture that fails the schema is a broken fixture, and finding that out in fixtures mode is the point. |
| F-03 | Fixtures are **realistic, not minimal**. Long titles that truncate, multi-value source and model cells, an issue with zero links and one with twelve, every one of the eight statuses, every severity tier. A fixture set where everything is tidy tests nothing. |
| F-04 | Fixtures are **deterministic**. No random values, no `Date.now()`. A relative timestamp is expressed as an offset from a fixed base date exported by the fixture module. |
| F-05 | A fixture module exports **both** a collection and named individuals — `issues`, and `issueWithNoLinks`, `issueClosed`, `issueCritical` — so a test can name the case it is exercising instead of indexing into an array. |
| F-06 | **Test fixtures and fixtures-mode fixtures are the same modules.** Not two sets. Two sets drift, and the drift surfaces as "it works in the app but the test fails". |
| F-07 | MSW handlers (`10`) are built **from** the fixture modules, never with inline literals. |

### The four scope questions `10` leaves open
`10` owns runner, placement, query priority, mocking and a11y assertions,
and deliberately does not say *what* to test. Answered here, because a
corpus that never answers it gets answered per-developer.

| Layer | Test | Do not test |
|---|---|---|
| `ui-library` component | Every variant renders; every state renders; every callback fires with the specified payload; keyboard behaviour named in its spec; one axe assertion | Class names (`06` and `10` both forbid it); internal state; visual appearance — that is Storybook's job |
| Hook | Its return shape; each branch of its logic; cleanup on unmount | The library underneath it — never assert TanStack Query's own caching |
| Service + mapper | The mapping, field by field; that the schema rejects a malformed response; each of `05`'s three named lenient fields is genuinely lenient | HTTP itself — MSW covers the boundary |
| Store | Each action's effect on state; the persistence behaviours `04` requires (`partialize`, per-field fallback, corrupted-JSON recovery) — **these three especially, because Zustand supplies none of them and the failure is silent** | Zustand |
| Screen | The user-visible flow: renders, filters, submits, shows its error state, respects role gating | Implementation detail; every permutation of every filter |

### Snapshot testing
**Not used.** A snapshot asserts that output has not changed, which is not
the same as asserting it is correct — and it passes for the wrong reason
after any deliberate change, so it trains people to update snapshots without
reading them. Recorded because a codebase with no stated position acquires
snapshots by default.

### Security-relevant tests
Three assertions that are not optional, because each covers something no
other gate covers:

| ID | Assertion |
|---|---|
| S-01 | For each of the 38 rows in BRD `§7.3`, a test that the denied roles cannot invoke the action. `08`'s hard rule is that client checks are affordance hints only — so these tests assert the affordance is absent, and the server-side equivalents live in the backend suite. |
| S-02 | A test that a `dangerouslySetInnerHTML` path escapes its input, at the call site `13` anticipates (the markdown comment renderer). `13` records that the danger is a **later change** swapping the renderer, so the test is what preserves the property. |
| S-03 | The log-scanning check `21` requires, asserting no prohibited field reaches a logger call. |

### i18n in tests
A component's `.i18n.ts` self-registers its namespace as an **import side
effect** (`09`). A test that renders the component but does not import it —
or imports a mock of it — gets a component whose translations silently fall
back rather than throwing. **Every component test imports the real component
module**, and a test asserting on user-facing text asserts on the `en` value
from that component's own `.i18n.ts`, never a hardcoded string. `09` names
the silent namespace mismatch as a known manual-discipline risk; this is the
check that catches it.

### Two test-environment settings that are not optional
Both are one line, both come from the prior repository, and each represents a
class of failure that is otherwise diagnosed slowly and repeatedly.

#### Force fixtures mode for the suite
Set the fixtures flag in the test runner's own environment configuration,
overriding whatever a developer's local `.env` says.

A developer testing against a live backend sets that variable locally and then
forgets. Without the override, their next test run silently attempts real HTTP —
against a backend that is not running in CI and may not be running locally —
and the failures look like application bugs. **The suite's data source is a
property of the suite, not of the machine.**

The same applies to the E2E runner, which sets it in its `webServer` block for
the same reason. 15-devsecops-and-ci-cd.md records the CI half.

#### Pin the timezone
Set `TZ` in the test environment to a **UTC-negative** zone.

The prior repository pins `America/New_York` deliberately, and the reasoning is
worth keeping in full: a bare `YYYY-MM-DD` rendered through a local-time
formatter yields a different calendar day west of UTC than at or east of it. Left
unpinned, date assertions pass for everyone in Europe and Asia and fail for
everyone in the Americas — so the bug is found late, by one person, and looks
like a flake.

**Pinning to UTC is the wrong fix**, because UTC is the case that works
accidentally. Pinning to a negative offset means the whole team runs the
timezone that catches the error.

### Testing the logger
21-logging-formatting-and-client-diagnostics.md's rules — stable message keys,
the prohibition list, the correlation ID — are assertable only through the
logger's transport seam: replace the transport, assert on the calls, **reset in
`afterEach`**.

The alternative is spying on the console, which couples the test to the default
transport and breaks the moment monitoring is enabled. The reset is not
optional: a leaked transport turns one failure into a cascade in unrelated
files, and the cascade points at the wrong tests.

### Fixture realism — latency is part of the fixture
The prior repository serves fixtures through a deliberate artificial delay.

That is not decoration. **A fixture that resolves synchronously means loading
states, skeletons, disabled-while-pending buttons and double-submit guards are
never exercised in development** — they are exercised for the first time by a
user on a slow connection. 22-error-handling-and-user-feedback.md requires those
states; this is what makes them visible while they are being built.

Keep the delay **configurable and off in the test suite**, where determinism
matters more and fake timers are the right tool.

---

## 27 — Forms, Tables and Overlays — Review Checks
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review
**Extends:** 16-code-review-checklist.md — adopt by appending these three
sections to it if that reads better than a separate file.

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
Three checklist sections `16` does not have, for the three surfaces this
product is mostly made of. Same format as `16`; adopt by appending these
sections to it rather than as a separate file if that reads better.

### Why these three
Issue Entry is a five-step form with per-step error grouping. Issue List is
a filterable, sortable, selectable, column-configurable, bulk-actionable
table. Four modals are specified in the BRD. The Vue review checklist had a
section for each; `16` has none, and `18` separately records that **no
standard specifies keyboard or disclosure-pattern behaviour for dropdowns
and popovers at all**.

### Forms
- [ ] Validation is a **Zod schema**, not a sequence of `if`-checks (`03`)
- [ ] The schema is co-located with its form (`IssueEntryForm.schema.ts`),
  not in a shared schemas folder (`03`)
- [ ] Field errors are driven from `ZodError.issues`, not a hand-built
  parallel error shape (`03`)
- [ ] For a multi-step form, the **step-grouping adapter** over the flat
  issue array exists — `03` warns Zod does not do this for you
- [ ] Every field with an error state sets `aria-invalid` **and** associates
  the message via `aria-describedby` (`11`)
- [ ] No step asks for a value an earlier step captured (WCAG 3.3.7
  Redundant Entry, live per `11`)
- [ ] Controlled versus uncontrolled is a **per-field** decision based on
  whether something else depends on that keystroke (`12`)
- [ ] Submit is blocked, not merely warned, while any required field is
  invalid, and the message names what to fix (BRD §14, and `22`)
- [ ] Unsaved changes prompt before navigation (`NAV-04`), and **only** on
  the form the BRD names — nothing else prompts
- [ ] A mutation failure never blanks the form (`03`, `22`)

### Tables
- [ ] Sort, page, page size and column visibility are **client state in the
  issue-filters store**, not component state (`04`)
- [ ] Each is a `<name>` / `on<Name>Change` pair, not one generic
  `value`/`onChange` (`03`)
- [ ] Cell rendering is a **per-column render function**; the table does not
  own cell markup (`03`)
- [ ] Every column has a header with an accessible name; a sortable header
  announces its direction
- [ ] Rows are keyboard-navigable: focusable, Enter/Space activates, visible
  focus ring (`11`, BRD `FR-LST-030`)
- [ ] **Sticky headers and columns verified by keyboard against WCAG
  2.4.11** — tab across and down until focus passes under each sticky region
  (`11`, and `11` records that the Vue table was never checked)
- [ ] Selection uses a real checkbox with an accessible name, and the header
  checkbox carries an indeterminate state
- [ ] A multi-value cell renders its primary value inline with the remainder
  behind a `+N` popover that opens on **hover and keyboard focus** (BRD
  `§8.4`)
- [ ] All four states exist — rows, empty, loading, error — and the empty
  state distinguishes no-data from no-match (`22`)
- [ ] No test asserts on a class name (`06`, `10`)

### Overlays — modals, dialogs, dropdowns, popovers, tooltips
- [ ] Modals and dialogs are built on the headless primitive per `06`'s
  table; they are not hand-rolled
- [ ] Focus moves into the overlay on open and **returns to the trigger** on
  close (`11`)
- [ ] Focus is trapped: Tab and Shift+Tab wrap between the first and last
  focusable element (`11`)
- [ ] Escape closes; the trigger regains focus
- [ ] The accessible name comes from `aria-labelledby` pointing at the
  rendered heading — **never** an `aria-label` duplicating the title string
  (`11`, which records this exact defect in the Vue modal)
- [ ] Overlay content is portaled to the document root (`01`'s `overlay/`
  category definition)
- [ ] A disclosure region uses `aria-expanded` + `aria-controls` and **does
  not** claim `aria-haspopup` unless it is a real ARIA menu with roving
  tabindex and arrow-key navigation (round 3 M2, fixed once — do not
  reintroduce)
- [ ] A tooltip binds `aria-describedby` **only while open**, uses
  `role="tooltip"`, and triggers on **both hover and focus** (`11`)
- [ ] Opening an overlay does not scroll the page behind it or shift its
  layout
- [ ] A destructive confirmation states the **consequence**, not just the
  action: "Closed issues are read-only and cannot be reopened." (`06`
  content voice, BRD `LC-05`)

### Three worked reviews

The checklists above say what to look for. These three examples say what it
looks like when it is wrong — which is the part that is hard to teach from a
list, because every one of these passed a review at some point.

#### A form: the submit button that lies

```tsx
<BaseButton type="submit" disabled={!isValid}>Create issue</BaseButton>
```

**What is wrong:** disabling submit until valid is the single most common
accessibility and usability defect in enterprise forms.

- A disabled button is **not focusable**, so a keyboard or screen-reader user
  tabbing to the end of the form finds nothing there and no explanation.
- It gives no reason. The user sees a dead button and must guess which of
  fourteen fields is the problem.
- It hides the error summary that WCAG 3.3.1 expects, because the errors never
  get raised.

**What it should be:** the button stays enabled; submitting an invalid form
runs validation, moves focus to the error summary, and links each message to
its field. The user is told what is wrong, not prevented from asking.

**The second defect in the same line:** nothing guards double submission.
`disabled={!isValid}` is not `disabled={isSubmitting}`, and the two get confused
constantly. A slow network plus an impatient user creates two issues, and
optimistic concurrency (`409 / ISM-CC-001`) will not save you — both requests
are valid.

#### A table: the sort that silently drops a page

```tsx
const [sort, setSort] = useState<SortState>({ key: "createdAt", dir: "desc" });
const { data } = useIssuesQuery({ page, pageSize, sort });
```

**What is wrong:** `page` is not reset when `sort` changes. The user is on page
7, sorts by severity, and lands on page 7 of a completely different ordering —
which looks like data loss and is unreportable, because nobody can describe what
they did.

The same bug class covers every filter, the search box and the scope switcher.
**Any change to the query shape resets pagination to page 1**, and the review
check is: for each input that feeds the query key, is pagination reset?

**Two more in the same component, both invisible in a screenshot:**

- **Sort state is in `useState`, not the URL.** So the sorted view cannot be
  shared, bookmarked or recovered by back-button — and 07-routing-and-layouts.md
  puts list state in search params for exactly this reason.
- **`aria-sort` is missing on the sorted column header.** The visual chevron
  conveys ordering to sighted users and nothing to anyone else.

#### An overlay: the modal that traps nothing

```tsx
{isOpen && <div className="fixed inset-0 …"><ConfirmDisposition /></div>}
```

**What is wrong:** a `div` with fixed positioning is not a dialog. Everything
that makes a modal usable has to be added by hand, and each omission is
independently invisible:

| Missing | Consequence |
|---|---|
| `role="dialog"` + `aria-modal` | announced as ordinary content |
| Focus moved into the overlay on open | keyboard focus stays behind the backdrop |
| Focus trap | Tab walks out of the modal into the page underneath |
| Focus **restored to the trigger** on close | focus resets to `<body>`; the user restarts their tab journey |
| Escape to close | no keyboard exit |
| Inert/hidden background | screen readers read the page behind it |

**This is why 06-styling-and-design-tokens.md mandates a headless primitive for
overlays.** Every row above is solved, tested and maintained upstream. A
hand-rolled overlay does not fail review because it is unfashionable; it fails
because six separate things are missing and five of them are invisible unless
you close the modal and press Tab.

**The one that survives even a good implementation:** a confirmation modal whose
destructive action is the default-focused button. Focus lands on Cancel; the
destructive action is never the target of a reflexive Enter.

---

## 28 — Definition of Done
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
When an author may open a pull request. `16` is the reviewer's list; this is
the author's gate. The two are deliberately different documents — a reviewer
checks what they can see, an author knows what they did.

### Why this file exists
The Vue corpus carried a Definition of Done in **three** separate documents
(coding, testing, performance). None is carried forward. Without one, "done"
is negotiated per PR, and it is negotiated downward under schedule pressure.

### DoD — any change
1. `typecheck`, `lint`, `format:check`, `build` and `test:coverage` all pass
   **locally**, before review is requested.
2. Coverage is **at or above** 85 on all four metrics for every package the
   change touches. Not lowered. If coverage is short, the missing tests are
   the work (`10`).
3. No new `any`; no new `eslint-disable` without an inline justification
   naming what it is delegating to (`02`, `11`).
4. No hardcoded design value, copy string, or business value (`00`).
5. The commit message is Conventional (`23`); the PR names its FR ID (`23`
   P-02).
6. If a tier file changed, the distribution document was regenerated in the
   same commit (`16`).
7. If a `VITE_*` variable was added or renamed, `env.d.ts` and
   `.env.example` both changed with it (`13`).

### DoD — a `ui-library` component
Everything above, plus all eight:
1. A **specification exists** in `component-specs/` and the component
   matches it. Per `01`, a component built without one is built against
   conventions that cannot tell you it is the right component.
2. `<Name>.tsx` — default export, one component per file (`14`).
3. `<Name>.types.ts` — props interface exported; variant/size/state types
   **alias** the shared `Pqms*` vocabulary rather than redeclaring it
   (`06`).
4. `index.ts` — component, types and constants re-exported (`14`).
5. `<Name>.stories.tsx` — one story per union value and per non-default
   state (`24`).
6. `<Name>.spec.tsx` in the mirrored `src/tests/` tree, at ≥85 on all four
   metrics, **including an axe assertion** (`10`).
7. `<Name>.i18n.ts` if the component has user-facing text of its own — and
   if it does not, the spec says so explicitly (`09`, `TEMPLATE.md`).
8. **A blast-radius check** if the change touches an existing shared
   component: every consumer identified before it ships. `00` names this a
   repeat-mistake area — a past layout fix broke an unrelated screen.

### DoD — a screen
Everything in "any change", plus:
1. Every state renders: content, loading, empty-no-data, empty-no-match,
   error, and stale where applicable (`22`).
2. Role gating verified against the BRD `§7.3` rows the screen touches, for
   **each** of the five roles — `switchRole()` in fixtures mode is how
   (`04`).
3. Keyboard-only walkthrough completed: every action reachable, focus
   visible throughout, focus moved to the heading on arrival (`11`).
4. The screen renders correctly in **fixtures mode with no backend
   running**. If it does not, the fixtures seam is in the wrong layer
   (`05`).
5. Deep-linking works: the URL reproduces filter state, active section and
   pagination (`NAV-01`).
6. The route's chunk is within budget (`12`, and see G-BRD-02 on which
   number).

### What "done" never means
- Not "it works on my machine" — the gate is CI, and the prior repository’s
  30-working-day React migration plan's working agreement is explicit that
  this repo's IDE type errors are known-unreliable.
- Not "tests will follow" — `10`'s threshold is enabled from the first
  covered file precisely so that this is not available.
- Not "the reviewer will catch it" — `16` is a second pass over work that
  was already finished.

---

## 29 — Screen Description Authoring
**Tier:** 2
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
What a screen description contains.
`18-project-context-and-implementation-status.md` closed the "permanent
artifact or working notes" question in favour of **permanent**, named the
location (`PQMS_docs/screen-descriptions/`, one file per screen), and then
deliberately wrote no template — on the grounds that "their shape should
follow from the first prototype read rather than precede it."

**That reasoning was right and this draft respects it.** What follows is not
a template. It is the **minimum set of questions a description must
answer**, derived from what pass 4 actually needs — the same way
`TEMPLATE.md` was derived from `03`'s accumulated `BaseDataTable` questions
rather than invented. Write the first description, then write the template
from it.

### The boundary, restated
A **screen description says what a screen contains and what it does.** A
**component spec says what a component's API is.** The first is an input to
the second: you cannot specify `BaseDataTable`'s API without knowing what
Issue List does with it, and the component inventory is derived the same way
— read a screen, see which controls it contains.

### What every description must answer
Derived from what a component spec needs from it, plus what `01`, `07`, `11`
and `22` need to be satisfiable.

| # | Question | Why pass 4 needs it |
|---|---|---|
| 1 | **Which prototype file, and which reading** produced this description, with the date | `17`'s register warns the prototype is a moving target renamed three or more times. A description that cannot be re-checked forfeits the reason `18` made it permanent. |
| 2 | **Which BRD screen ID and which FRs** the screen implements | Traceability (`TR-02`), and it is what makes a description reviewable against a requirement rather than only against a picture. |
| 3 | **Layout** — which of `07`'s three layouts, and why | Determines whether the screen scrolls the window or an internal region, which `12` names as a question that decides whether the table can be windowed at all. |
| 4 | **Regions**, top to bottom, each named | The unit a component maps onto. |
| 5 | **Every control**, by what it does — not by what component it might be | The inventory. Say "a control that filters by one or more sources", not "a `BaseSelect`" — naming the component is the *output* of pass 4, not its input. |
| 6 | **Every user-facing string**, verbatim from the prototype | `09` requires every string be a keyed message; the keys are derived from here. `06` makes the prototype govern copy. |
| 7 | **Every state** the screen has — content, loading, empty-no-data, empty-no-match, error, stale, permission-denied | `22`'s screen-state contract, and the states are where prototypes are most often silent. |
| 8 | **What differs per role**, against the BRD `§7.3` rows this screen touches | Five roles; a screen that only describes SE's view is a fifth of a description. |
| 9 | **What the prototype does not show** | The honest half. A prototype cannot express an interaction contract (`00` case 2), so keyboard behaviour, focus order and error states are usually absent. Say so per item rather than leaving the reader to assume the screen has none. |
| 10 | **Where the screen navigates to, and what navigates to it** | `07`'s tree plus BRD `§8.2`; catches missing routes early. |

### Two authoring rules
Both inherited from `TEMPLATE.md`, because the same failure mode applies:

- **Describe only what the prototype shows.** Anything else is marked
  `[UNSPECIFIED — <what is missing>. Resolved by: <what would answer it>.]`
  and is not invented, not filled in by analogy with another screen, and not
  extrapolated to a conventional set. This corpus has caught four fabricated
  values; each was plausible.
- **Say what governs each statement** — "per the prototype", "per the BRD",
  "decided here". An unsourced statement is indistinguishable from an
  invented one.

### Currency
A description is current **as of its stated reading**, not permanently. It
records the reading so it can be re-checked; it is not re-validated on a
schedule. Per `18`, a stale screen description does not misdirect
implementation the way a stale component spec does, because nobody builds
from it directly — which is why `01`'s delete-the-spec-with-the- component
rule has no equivalent here.

### A worked description

The ten questions are abstract until you see them answered. This is a partial
description for the issue list, written to the shape this file requires — the
level of specificity is the point, not the content.

> ### ISM-LST — Issue List
>
> **Route:** `/issues` · **Layout:** `FixedHeightLayout` (the table owns the
> scroll region) · **Roles:** all five; the visible column set and the action
> bar differ, see below.
>
> **Purpose.** The working surface for anyone triaging issues. It answers "what
> needs my attention right now", so the default view is scoped and sorted for
> that, not for browsing.
>
> **Entry points.** Primary nav; the post-create redirect; a notification deep
> link (which arrives with a filter pre-applied and must show that it did).
>
> **Default state.** Scope "My Issues", sorted by severity descending then
> created descending, page size 25. **A returning user's scope, filters, sort
> and page come from the URL** — never from a store, so the view is shareable.
>
> **Four states, all required:**
>
> | State | What renders |
> |---|---|
> | Loading | skeleton rows at the current page size — not a spinner, so layout does not jump |
> | Empty (no issues exist) | empty state with the create action |
> | Empty (filters exclude everything) | **a different message** — says the filters are the cause and offers to clear them |
> | Error | the error surface with the code, and a retry that preserves the query |
>
> The two empty states being distinct is the whole point: a user who has
> filtered themselves into nothing and a user with no data need opposite
> advice.
>
> **Per-role differences.** `VIEWER` sees no action bar and no row selection.
> `SE` sees bulk assign but not bulk status change. Full matrix in the BRD;
> **this description does not restate it** — it names which rows apply.
>
> **What this screen does not do.** It does not edit. Every action either
> navigates or opens an overlay. There is no inline-edit affordance, and adding
> one is a change to this description first.

### What that example is demonstrating

- **It is falsifiable.** "Sorted by severity descending then created descending"
  can be wrong. "Sensible default sorting" cannot.
- **It names the layout**, which is a routing decision that has to be made
  before the screen is built and is invisible afterwards.
- **It distinguishes two empty states.** This is the single most common omission
  in screen descriptions, and it produces the single most common bad empty
  state — "No issues found" shown to a user who has filtered them all out.
- **It states a negative.** "This screen does not edit" is what stops the
  fourth feature request quietly turning a list into a spreadsheet.
- **It points at the authorization matrix rather than copying it.** A restated
  matrix is a matrix that will disagree with the BRD within a month.

### The sequence that makes descriptions cheap

Descriptions are written **from the prototype, in this order**, and the order
matters:

1. **List the screens from the prototype**, by file — not from the BRD, which
   groups by requirement rather than by page.
2. **Write the description for each**, answering the ten questions. Where the
   prototype does not answer one, that gap is the finding — record it as a
   `[PLACEHOLDER]` with a trigger, per
   18-project-context-and-implementation-status.md.
3. **Derive the component inventory from the descriptions**, then reconcile
   against `component-specs/INVENTORY.md` — treating disagreement as evidence
   about that candidate list, not about the prototype.
4. **Write the component specs** for whatever the reconciliation confirms.

Doing 4 before 1 is what produces a component nobody needed, and it is the
common failure — because writing a component feels like progress and writing a
description does not.

### Keeping one current

A description is edited when the screen's **contract** changes: a new state, a
different default, a role difference, a new entry point, a removed capability.

It is **not** edited for styling, copy tweaks, or component refactors — those
are owned by the prototype and the component specs respectively. A description
that churns on every commit is describing implementation, and it will be
abandoned within two sprints.

---

## 30 — Restructuring an Existing React Project
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Purpose
How to bring a React project that **already exists** onto this corpus.
Every other file here describes a target. This one describes the move.

### Why this file has to exist
01-project-structure-and-architecture.md opens by saying what it is:

> This file specifies how the React app is organized. It is written as a
> **target structure to build to**, not as a set of corrections to an
> existing tree — there is no prior React code in this repository to
> correct.

That is true of the whole corpus. Twenty-nine files describe a
destination and none describes a journey, which is fine while the only
consumer is a greenfield scaffold and useless the moment one is not.

**The specific case this is written for**: a React project that already
has working screens — typically UI generated from a design tool, wired
together enough to demonstrate — and now needs to be restructured onto
these rules. That project has three properties the corpus does not
anticipate. It has code that works and must keep working. It has
decisions already made, some of which conflict. And it has no history
with this corpus, so every rule arrives at once.

### The three rules that govern the whole move

**R-1 — Structure before style, always.**
Move a file to where it belongs before you rewrite what is inside it. A
misplaced file that follows every naming rule is still misplaced, and the
person who has to move it later has to re-review its contents too.
Placement is cheap to change now and expensive after imports multiply.

**R-2 — Never restructure and rewrite in the same commit.**
A commit that moves a file and changes it produces a diff nobody can
review: the tool shows a delete and an add, and the actual change hides
inside them. Move in one commit, change in the next. This is the single
discipline that decides whether the move is reviewable.

**R-3 — A rule that cannot be enforced yet is not adopted yet.**
Do not spend a week conforming to a rule and then leave nothing checking
it. Every rule adopted in Phase 1 below arrives **with its gate**. This
is not process for its own sake: an unenforced convention in a codebase
under time pressure survives about three weeks.

### Phase 0 — Establish the baseline (do not skip)

**Nothing is restructured in Phase 0.** Its whole output is a written
picture of what exists, because every later phase's estimate depends on
it and because a restructure with no baseline cannot be told from a
regression.

| # | Task | Output |
|---|---|---|
| 0.1 | **Record the current state.** File count by type, component count, LOC, dependency list with versions, existing test count and coverage if any, current bundle size if measurable. | A dated snapshot committed to the repository. |
| 0.2 | **Make the build reproducible.** Node version pinned, lockfile committed, `install` → `build` working from a clean clone. | A green build from a fresh clone, and the friction it surfaced written into 19-onboarding-and-dev-workflow.md — that file exists to be filled in by exactly this experience. |
| 0.3 | **Get the tests green, or record that there are none.** | A number, honestly stated. Zero is an acceptable answer; "some fail intermittently" is not — quarantine or delete those first. |
| 0.4 | **Map what exists onto 00's Corpus map.** For each concern, one of: conforms / diverges / absent. | The gap register that drives Phases 1–4. |
| 0.5 | **Identify the load-bearing screens.** Which screens are demonstrated, which are half-built, which are dead. | A list. Dead screens are deleted in Phase 1, not restructured. |

**0.5 deserves more weight than its size suggests.** Design-tool output
tends to include screens nobody asked for and variants nobody chose.
Restructuring a dead screen costs the same as restructuring a live one
and returns nothing. **Delete first, then count.**

### Phase 1 — Enforcement before conformance
Adopt the gates while the codebase still violates them, with the
violations **counted and allowed** rather than fixed. This inverts the
obvious order deliberately: it means every subsequent phase's progress is
visible as a falling number rather than asserted.

| # | Task | Owner file |
|---|---|---|
| 1.1 | ESLint flat config, the five-position chain, a11y rules at their specified severities | 14, 11 |
| 1.2 | Prettier, one config, formatting applied once in a single commit that changes nothing else | 14 |
| 1.3 | TypeScript baseline — `strict`, `noUncheckedIndexedAccess`, both `noUnused*` | 02 |
| 1.4 | Test harness — Vitest, RTL, the coverage reporter | 10 |
| 1.5 | CI running typecheck, lint, format, build, test on every pull request | 15 |
| 1.6 | Commit conventions and hooks | 23 |
| 1.7 | The environment contract — `env.d.ts`, `.env.example` | 13 |

**How to adopt a gate against a codebase that fails it.** Three
mechanisms, in order of preference:

1. **Fix it now** if the count is small. A dozen lint errors are cheaper
   to fix than to track.
2. **Baseline it** — record the current violation count and fail CI on
   any *increase*. This is the right answer for the large ones (`any`
   usage, missing types, a11y violations) because it stops the bleeding
   immediately and costs nothing.
3. **Scope it** — enable the rule on new and changed files only, via a
   lint-staged pass or a per-path override. Last resort, because a
   two-tier codebase is a codebase people stop reasoning about.

**Never lower a threshold to make the gate pass.**
10-testing-standards.md names this exact move as the one that makes a
number permanent, and the reasoning transfers unchanged: a threshold that
starts low has to be raised by someone, at a moment when raising it fails
the build, and that moment never arrives. Coverage is the case to watch
— an existing project with no tests cannot meet 85/85/85/85 on day one,
so **baseline it at the current number and ratchet**: CI fails if
coverage drops, and the floor rises with each merge that adds tests. The
target stays 85; the gate is "not worse".

### Phase 2 — Structure

Move files to where 01 says they go. **No content changes** (R-2).

**Order matters, and this is the order:**

1. **`packages/design-tokens`** — token values only. Nothing depends on
   anything else.
2. **`packages/ui-library`** — into the eight category folders, `base/`
   first. Two placements are worth stating because they are the usual
   mistakes: `BaseModal` goes in `overlay/`, `BaseDataTable` in `data/`.
3. **`apps/portal`** — `pages/` for thin route hosts, feature UI under
   `components/<Module>/<Feature>/`, and 01's feature-folder depth rule
   (flat until ~15 files or 2+ genuinely distinct sub-concerns).
4. **The shell** — routing, layouts, state, HTTP client, per 01's
   "the portal shell runs in parallel, not after".

**Three decisions to make before moving anything**, because each one
changes where files land and re-deciding after the move is a second move:

- **Is it a monorepo?** If the existing project is a single app with no
  packages, 01's three-package split is a real change and not a
  cosmetic one. It is worth it if a component library is genuinely
  shared or genuinely reusable; it is overhead if there is one app and
  will only ever be one. **Decide deliberately and record the reasoning**
  — 00's Source precedence case 4 applies: nothing in this corpus governs
  whether *your* project should be a monorepo.
- **Where is the workspace root?** Per 00's Path convention, every path
  in this corpus is relative to it.
- **What is a component versus a screen?** 01's `ui-library` is
  framework-level and reusable; a component used by one feature stays in
  that feature. Design-tool output usually does not draw this line, so
  it is drawn during the move — and the bar is **used by 2+ features**,
  not reusable in principle.

**The commit shape for this phase**: one commit per move, or one commit
per coherent group of moves, with **`git mv` so history follows**. A
restructure that loses `git blame` costs more than it saves.

### Phase 3 — Conformance

Now change contents. Roughly in this order, because each unblocks the
next:

| # | Work | Owner file |
|---|---|---|
| 3.1 | **Tokens.** Extract every hardcoded colour, spacing, radius and type value into `design-tokens`; map through `@theme`; replace call sites with token classes. | 06 |
| 3.2 | **Styling.** One system. If the project mixes CSS Modules, styled-components and Tailwind, converge — 06 bans the split and names the failure mode. | 06 |
| 3.3 | **Types.** Remove `any`; replace `enum` with string-literal unions; co-locate `ComponentName.types.ts`. | 02 |
| 3.4 | **Component surfaces.** Callback-prop naming, content composition, the `className` boundary, default vs named exports. | 03, 06, 14 |
| 3.5 | **State.** Classify every piece of state once: server state to TanStack Query, client state to Zustand. This is usually the largest single item. | 04 |
| 3.6 | **Data layer.** HTTP client, services, mappers, Zod schemas at the boundary. | 05 |
| 3.7 | **Routing.** Nested layout routes, lazy page components, error boundaries declared statically. | 07, 03 |
| 3.8 | **i18n.** Extract every user-facing string to a co-located `.i18n.ts`. | 09 |
| 3.9 | **Accessibility.** Whatever the a11y lint rules surfaced in Phase 1. | 11 |
| 3.10 | **Tests.** Toward 85/85/85/85, ratcheting. | 10, 26 |

**3.1 before 3.2 is not arbitrary.** Converting a stylesheet to Tailwind
while the values are still literals produces Tailwind classes full of
arbitrary values — `bg-[#18468F]` — which 06 bans and which is strictly
harder to fix than what you started with. Extract the values first.

**3.5 is where the estimate goes wrong.** State classification looks like
a refactor and behaves like a redesign: a component holding server data
in local state usually also owns the fetch, the loading flag, the error
flag and a stale-data bug, and all four disappear when it becomes a
query. Budget generously and do it feature by feature, never globally.

### Phase 4 — The parts that need a source

Three things cannot be derived from the existing code, however carefully
you read it:

| Need | Source | If the source does not exist |
|---|---|---|
| Component specifications | The prototype, via screen descriptions (29) | The existing screens *are* a source, but a weaker one — they show what was built, not what was agreed. Write the descriptions from them, mark every row as derived-from-implementation, and treat the first design review as the real derivation. |
| Domain vocabulary — statuses, roles, entities | A BRD or equivalent | **Do not infer it from the code.** 17 records what happens when implemented values are mistaken for agreed ones: this corpus carried a ten-value status set from shipped code for several revisions before the eight-value business set corrected it. |
| Quantified NFRs | A requirements document | Use 12's Core Web Vitals floor, which is external and needs no local authority, and mark everything else unspecified. |

**The honest position, if none of the three exists**: this corpus still
governs code shape completely, and governs behaviour not at all. Say so
rather than inventing a source. 00's Source precedence case 4 is the rule
and it is the most-used one in a restructure.

### What to do when the existing project conflicts

Ordered by how often each comes up.

| Conflict | Resolution |
|---|---|
| A different library does the same job (Redux, MUI, styled-components, Jest, Cypress) | The stack in 00 is confirmed and the alternatives are named as prohibitions. **But a working Redux store is not a defect, it is scope.** Plan the replacement, do not fail the build on it, and never run two state libraries in parallel longer than one milestone. |
| A component library with its own theme and CSS | 06 rules out "a component library's own CSS, theme or preset". The migration path is 06's headless-primitive exception: keep behaviour, drop styling, wrap it as `Base*` so call sites do not move again when the primitive is swapped. |
| Design-tool-generated components with hardcoded everything | Expected. Phase 3.1 exists for this. Extract values, do not rewrite the components — the generated structure is usually fine and the values are the problem. |
| A component the corpus has no category for | 01's eight categories are exhaustive for this product. If something genuinely does not fit, that is a question against 01, **not** a component at `components/` root — 01 records that exact failure mode. |
| A screen with no requirement behind it | Phase 0.5. Delete it or write the requirement. Do not restructure it. |
| A convention the existing project follows consistently and well, that this corpus contradicts | **Raise it as a question against the standard.** A consistent convention is evidence; a rule that contradicts one deserves to be re-argued rather than mechanically applied. 00's case 3 already works this way for visual values, and the same reasoning holds for code shape. |

### What not to do

Each of these is a real, tempting move that makes the restructure worse:

- **A big-bang rewrite.** The corpus is large and arrives all at once,
  which makes "start again" look cheaper than it is. It is not: a rewrite
  discards the one thing the existing project has, which is working
  behaviour, and it has no intermediate state anyone can review.
- **Restructuring and feature work in the same branch.** The review
  becomes impossible and the branch never merges.
- **Adopting rules in the order they are numbered.** The tier numbers are
  a filing scheme, not a sequence. Phase order above is the sequence.
- **Fixing every lint error before turning lint on.** Phase 1's whole
  point is the opposite.
- **Deferring the gates to "after the restructure".** The restructure is
  exactly when the gates are needed; afterwards there is nothing left to
  hold in place.
- **Treating a `[PLACEHOLDER]` as permission to invent.** A placeholder
  names a decision nobody has made. In a restructure the temptation is
  acute, because the existing code usually *has* an answer — and an
  answer found in code is provenance, not a decision (17's status-set
  correction is this exact mistake, caught late).

### Definition of done for a restructure

Not "the files moved". All eight:

1. Every gate in Phase 1 runs in CI and fails on a deliberately-introduced
   violation.
2. Coverage is at or above its Phase-0 baseline and the ratchet is
   enforced.
3. Every file is where 01 says it goes; no folder named `shared` outside
   the one app-wide location; no component at `components/` root.
4. Zero hardcoded design values; zero `any`; zero user-facing string
   outside an `.i18n.ts`.
5. Every screen that existed at Phase 0 still works, verified by a
   walkthrough, not by the build passing.
6. `git blame` still resolves on moved files.
7. Every deviation from this corpus is recorded in
   18-project-context-and-implementation-status.md's register with a
   trigger and an owner — **not** left as an undocumented difference.
8. The Phase-0 snapshot is updated with the after numbers, so the next
   person can see what the move cost and what it bought.

### Sequencing note
Phases 1 and 2 can overlap; 3 cannot start until 2 is done for the area
being changed; 4 runs in parallel throughout and is usually the long
pole, because it depends on people rather than code.

**One estimate that is safe to give**: Phase 0 is days, Phase 1 is a
week or two, Phase 2 is proportional to file count and mostly mechanical,
and **Phase 3.5 (state classification) is the one that will surprise
you.** Every other phase is bounded by what exists; that one is bounded
by how confused the existing state model is, and you cannot tell from the
outside.

### Three mechanisms the prior repository already proved
This file's Phase 1 requires enforcement before conformance and names three
gate-adoption mechanisms. The prior repository, audited in
`../analysis/vue-baseline-audit.md`, ran all three on a live codebase. What it
learned:

#### `warn` with a named trigger is adoption; `warn` alone is abandonment
Its lint config sets project-convention and accessibility rules to `warn` "so CI
stays green while they are burned down incrementally", with the accessibility
block naming the phase and owner that flip it to `error`.

**This is the mechanism to use for an inherited codebase**, and
14-code-style-and-linting.md now requires the trigger and owner to be written in
the config file. Without them the rule is not on a schedule — warnings scroll
past in CI forever and the burn-down never has a moment when it is due.

#### The coverage ratchet has a precedent, and a number
The prior repository's split floors (85/78/80/85) let branch and function
coverage drift down until a PR failed at 79.82% functions. It replaced them with
a single uniform floor. **A ratchet is the same idea applied to a codebase that
starts below the target** — record today's number as the floor, fail on any
drop, raise it, delete the ratchet at 85. Do not re-derive split floors as a
staging mechanism; that experiment has already been run here and it failed.

#### Delete the empty folders
Six exist in the prior working tree, and two of them are competing homes for the
same file kind. **A restructure inherits them silently** — they survive a move
because there is nothing in them to move.

Enumerate empty directories in Phase 0's baseline and delete them in Phase 2.
Each one is either a decision nobody made or a decision nobody honoured, and
either way the next person files something there because the folder exists.

### Protect the history you are about to churn
**Before the first bulk commit**, add `.gitattributes` (`* text=auto eol=lf`) and
`.git-blame-ignore-revs`.

The line-ending file goes first and it goes **before the formatting baseline**,
because retrofitting it afterwards renormalises the whole tree — a second
whole-repository diff on top of the first. The prior repository has a
`prettier --check` CI gate, an `.editorconfig` declaring LF, and no
`.gitattributes`, which is why that gate cannot be satisfied on a
CRLF-checkout platform while staying green in CI. Do not inherit that.

The blame file goes next, and 23-git-workflow-hooks-and-commits.md owns the
rule: every bulk mechanical commit appends its SHA. **This is the practical
enforcement of this file's second governing rule** — a bulk commit that also
changed behaviour cannot honestly be ignored by blame, so the rule against
mixing them stops being a matter of discipline.

### Some ambiguity is inherited, and that changes who resolves it
Not everything unclear in the target codebase originated there. The two
`tokens.css` files that 18-project-context-and-implementation-status.md carries
as an open placeholder exist in the **prior** repository too, with the same
absent explanation, both marked in its tooling as "owned by the token pipeline,
not hand-formatted" — describing a pipeline that does not appear to exist.

**An inherited ambiguity is a prerequisite of the restructure, not a cleanup
task inside it.** Nobody on the current team decided it, so nobody on the
current team can resolve it by reading the code; it needs a decision, and the
decision needs to happen before the token scales are authored rather than during.

Phase 0 should separate the two: defects the current codebase introduced, and
questions it inherited. They have different owners and different urgency.

## ─────────────────────────────────────────────────────────────
### Running this inside the MoAI-ADK SPEC workflow

The target repository does not take ad-hoc commits. Work flows through
`/moai plan → /moai run → /moai sync`, and
32-working-within-the-moai-spec-workflow.md owns the mechanics. What belongs
**here** is the mapping: **this file's phases are not one SPEC.**

| Phase | SPEC | Methodology | Why |
|---|---|---|---|
| 0 — Baseline | `SPEC-FE-BASELINE` | neither — it produces a report, not code | it is the evidence every later SPEC's acceptance criteria are written against |
| 1 — Enforcement | `SPEC-FE-GATES` | **DDD** | it changes no source; acceptance is "every gate green on untouched code" |
| 2 — Structure | `SPEC-FE-STRUCTURE` | **DDD** | moves only; characterization tests are exactly the right instrument |
| 3.1 — Tokens | `SPEC-FE-TOKENS` | DDD | blocked on the design-source decision below |
| 3.2–3.4 | one SPEC per slice | DDD | brownfield with existing behaviour to preserve |
| 3.5 — State | `SPEC-FE-STATE` | **TDD** | new code, not a move — see 04 |
| 4 — Sources | per artefact | — | descriptions and specs are documents |

#### Choose DDD deliberately, and choose it early
The harness selects methodology from `quality.yaml`, and its own guidance is
**DDD (ANALYZE-PRESERVE-IMPROVE) for existing code below 10% coverage, TDD
above**. The target frontend is at 90%, which points at TDD.

**For Phases 1 and 2 that is the wrong reading.** TDD's RED step presumes you
are adding behaviour. A restructure adds none — it moves files and installs
gates, and its correctness criterion is *nothing changed*. **DDD's
characterization tests are precisely this file's rule that a restructure must
prove it broke nothing**, expressed in the harness's own vocabulary.

Phase 3.5 is genuinely new code and genuinely TDD. **Say so in each SPEC** —
the default will otherwise pick TDD for all of them.

#### The drift guard will fire on Phase 2, and that is not a defect
The harness re-plans above **30% drift** between planned and modified files. A
structural move touches far more files than a plan enumerates by name.

**So enumerate by `directory`, not by file**, and state the expected file count
in the SPEC's acceptance criteria. A Phase 2 SPEC that names forty files will
drift on the forty-first and re-plan mid-move — which is the one thing this
file's "never leave the tree half-moved" rule cannot survive.

#### Acceptance criteria that make a restructure verifiable
Generic criteria pass on a restructure that quietly changed behaviour. Use these
instead, per SPEC:

- **Phase 1:** every gate green on **unmodified** `src/`. Zero files under
  `frontend/src` in the diff.
- **Phase 2:** the full check suite green at **every** commit, not only the last.
  Test count identical before and after. Every bulk SHA in
  `.git-blame-ignore-revs`.
- **Phase 3.x:** coverage ratchet raised, never lowered. No behavioural change
  outside the slice's stated scope.

#### One SPEC never spans two phases
This file's second governing rule — never restructure and rewrite in the same
commit — becomes, at this level: **never structure and conform in the same
SPEC.** The harness's `sync` phase opens one MR per SPEC, and an MR that both
moves the tree and changes behaviour is unreviewable no matter how the commits
inside it are arranged.

#### Phase 0 is a SPEC, not a warm-up
It is tempting to run the baseline as a conversation and start planning from
Phase 1. Don't. The baseline **is** the artefact every later SPEC's acceptance
criteria reference — the coverage floor, the bundle number, the file inventory,
the Claude Design ownership list. A number nobody committed is a number nobody
can be held to.

---

## 31 — Documentation Standards and Decision Records
**Tier:** 2
**Status:** DRAFT — new in this revision; the ADR format is adopted from a
working precedent, the register rules are not yet exercised
**Purpose:** What documents exist, where they live, how a decision is recorded
once it is made, and which documents are generated rather than written
**Extends:** 18-project-context-and-implementation-status.md (the register),
00-core-rules.md (source precedence)
---

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Why this file exists

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

### Document classes — four, and they behave differently

| Class | Examples | Rule |
|---|---|---|
| **Standard** | every tier file in this folder | Hand-written. Governs code shape. Tiered; ties break by tier. |
| **Specification** | `component-specs/*.md`, `screen-descriptions/*.md` | Hand-written against a template. Governs one artefact. |
| **Decision record** | `decisions/NNNN-*.md` | Hand-written once, then **immutable except for status**. |
| **Reference** | `analysis/vue-baseline-audit.md`, tier 18's status section, the generated distribution document | **Regenerated, never hand-edited.** Evidence, never authority. |

The distinction that matters is the last one. **A reference document records what
was true at a moment; a standard records what must be true.** Confusing them is
how a snapshot becomes a rule nobody voted for.

#### Reference documents carry three things, always

1. **A date.** Undated evidence is unfalsifiable.
2. **The method, and its limit.** "Read from files; nothing was executed" is a
   complete and honest method statement, and it tells a reader exactly which
   claims to re-verify.
3. **A precedence disclaimer.** Where a reference disagrees with a standard, the
   standard wins and the disagreement is a reason to re-open the standard — not
   a licence to follow the reference.

Tier 18's implementation-status section and `analysis/vue-baseline-audit.md`
both carry all three. Any new reference document does too.

#### Regenerate rather than patch

> This is a point-in-time snapshot, not a live sync. If the repository changes
> significantly, this folder should be regenerated rather than hand-edited
> piecemeal, to avoid it silently drifting out of sync the same way it
> identified drift in other documents.

That is the prior repository's rule for its generated reference folder, and it
is exactly the rule this corpus already enforces for its own distribution
document via `pnpm docs:standards:check`. **Generalise it:** a half-updated
snapshot is worse than a stale one, because a stale one is visibly stale and a
half-updated one is not.

### Architecture decision records

#### When one is required

**Whenever a `[PLACEHOLDER]` in tier 18's register closes, and the answer was
not obvious.** Also whenever a choice is made between two defensible
architectures, whenever a standard in this corpus is deliberately not followed,
and whenever an interim implementation is accepted with a different target.

Not for: a value that the prototype or the BRD supplies (that is a lookup, not a
decision), or a preference with no consequence (record it in the tier file and
move on).

#### Location and naming

```
PQMS_docs/decisions/NNNN-short-kebab-title.md
```

Four digits, zero-padded, allocated in order and **never reused**. The number is
the citation handle: tier files reference `ADR-0007`, not a filename.

#### Required structure

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

#### Lifecycle

An ADR is **immutable once accepted**, except for its `Status` line. A decision
that changes gets a **new** ADR that supersedes the old one, and the old one's
status is updated to point forward. Editing an accepted ADR in place destroys
the thing it exists to preserve.

#### Wiring back into the corpus

Closing a placeholder is **three edits in one commit**:

1. The ADR is written.
2. The owning tier file replaces its `[PLACEHOLDER]` marker with the
   decision, citing the ADR.
3. Tier 18's register moves the row to its "Closed since the last revision"
   table with the ADR number.

**All three, or none.** A closed placeholder with no ADR loses the reasoning; an
ADR with the marker still in place means two files disagree about whether the
question is open.

### What a tier file is, structurally

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

### One owner per concern

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

### The distribution document is generated

`Frontend-Development-Standards-v1.0.md` is built from the tier files by
`scripts/build-standards-doc.mjs` and **is never hand-edited**. Edit a tier
file, regenerate, commit both. `pnpm docs:standards:check` fails CI when they
diverge.

This is the concrete instance of the reference-document rule at the top of this
file, and it is the one that is already enforced.

---

## 32 — Working Within the MoAI-ADK SPEC Workflow
**Tier:** 2
**Status:** DRAFT — written from the client's harness documentation, not from a
completed SPEC cycle in this repository
**Purpose:** How this corpus's rules operate inside the client's spec-driven
harness — what a SPEC must contain, which quality framework governs, and where
the two overlap
**Extends:** 30-restructuring-an-existing-react-project.md (the phase-to-SPEC
mapping), 28-definition-of-done.md
---

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Why this file exists

The target repository ships the **MoAI-ADK harness** (`.claude/`, `.moai/`) — an
orchestrated workflow in which work is planned as a SPEC, implemented against
that SPEC's acceptance criteria, and synced into a merge request, each phase
routed to a manager agent with an independent auditor.

**Nothing in this corpus knows that.** Every tier file assumes a developer edits
files and opens a PR. In the target repository that is not how a change happens,
and the difference is not cosmetic: **the SPEC's acceptance criteria are what
gets verified**, so a rule this corpus states but a SPEC does not restate is a
rule nothing checks.

This file is the bridge. It does not restate the harness's documentation — that
lives in `.claude/rules/moai/workflow/spec-workflow.md` and
`.claude/skills/moai/SKILL.md`, and those win on anything procedural.

### The one rule that matters

> **A standard not written into a SPEC's acceptance criteria will not be
> enforced by the harness.**

The harness verifies the SPEC. The auditors audit against the SPEC. The drift
guard measures against the SPEC's file list. None of them read `PQMS_docs/`
unless the SPEC tells them to.

Two consequences:

- **Every SPEC that touches `frontend/` names the tier files that govern it**,
  by filename, in its own text — not "follow the frontend standards".
- **Rules that are mechanically checkable belong in a gate, not a SPEC.**
  A SPEC criterion is verified once, by an agent, at one moment. A CI gate is
  verified on every commit forever. If a rule can be a lint rule, it should be
  one — this is 30-restructuring-an-existing-react-project.md's
  enforcement-before-conformance rule, applied to the harness itself.

### The three phases, and what this corpus contributes to each

#### `/moai plan` — where the standards get named

The plan phase produces `.moai/specs/SPEC-<ID>/spec.md` in GEARS format with
acceptance criteria, after a research pass and an annotation review cycle, then
an independent `plan-auditor` review.

**What a frontend SPEC must carry, beyond the harness's own template:**

| Field | Content |
|---|---|
| Governing standards | the tier files, **by filename**, that constrain this work |
| Open placeholders | any `[PLACEHOLDER]` in those files that this SPEC will hit — from 18's register |
| Source precedence | which of BRD / prototype / standards governs the disputed points, per 00 |
| Scope boundary | explicitly: what is **not** changed |

**The open-placeholder field is the one that earns its place.** A SPEC that
proceeds into an unresolved decision produces an implementation that encodes an
answer nobody made — and the harness will not catch it, because the SPEC did not
say there was a question.

**Point the plan at the file, not the paste.** The harness's research phase reads
the repository. Referencing `PQMS_docs/standards/07-routing-and-layouts.md` by
path is better than pasting an excerpt, which goes stale the moment the file is
revised.

#### `/moai run` — where methodology choice is load-bearing

Methodology comes from `quality.yaml` (`constitution.development_mode`), and the
harness's own guidance keys it to coverage: **DDD below 10%, TDD above.**

**That heuristic is about coverage; the question is about the nature of the
change.** The target frontend sits at 90%, which selects TDD by default — and
TDD is wrong for a restructure, because its RED step presumes new behaviour and a
restructure's correctness criterion is that **nothing changed**.

| Work | Methodology | Why |
|---|---|---|
| Moves, renames, gate installation | **DDD** | characterization tests lock in current behaviour — which is exactly this corpus's proof-you-broke-nothing requirement |
| Conformance refactors | **DDD** | behaviour exists and must survive |
| New layers (query client, stores, auth) | **TDD** | genuinely new behaviour |
| New screens and components | **TDD** | the spec is the test |

**State the methodology in the SPEC and say why.** The default will otherwise
choose from the coverage number alone.

#### The drift guard, and how to not fight it

Re-planning triggers above **30% drift** between planned and actually-modified
files. Structural work touches far more files than a plan enumerates.

- **Enumerate directories, not files**, for any move-heavy SPEC.
- **State the expected file count** in the acceptance criteria, so a large diff
  is evidence of conformance rather than of drift.
- **A drift trigger on a conformance SPEC is a real signal.** There, the scope
  genuinely was wrong, and re-planning is the correct outcome rather than an
  obstacle.

The re-planning gate also fires on **stagnation** — three iterations with no new
acceptance criterion met. On frontend work that usually means one thing: an
unresolved decision. See the open-placeholder field above.

#### `/moai sync` — where the merge request is written

Sync generates API documentation, updates `README.md`, appends to
`CHANGELOG.md`, and prepares the MR, with a `sync-auditor` pass before it opens.

**Three things this corpus requires of that MR**, none of which the harness
knows about:

- **The AI-assistance declaration** (23-git-workflow-hooks-and-commits.md).
- **The `type:*` label matching the commit prefix**
  (`docs/conventions/README.md` §1).
- **Any `[PLACEHOLDER]` closed by this work carries its ADR**, and 18's register
  is updated in the same MR
  (31-documentation-standards-and-decision-records.md's three-edits-or-none
  rule).

The third is the one that will be skipped. It is also the one that determines
whether this corpus stays true a year from now.

### TRUST 5 and this corpus — overlapping, not competing

The harness enforces **TRUST 5** — Tested, Readable, Unified, Secured,
Trackable — on AI-assisted changes, and `TEAM-GUIDE.md` §7 is explicit that
these apply *on top of*, not instead of, the mechanical checks.

The mapping is close enough to be worth stating, and the gaps are the point:

| TRUST | This corpus's owner | Gap |
|---|---|---|
| Tested | 10, 26 | TRUST does not know the coverage **ratchet**, or which of split/uniform floors applies |
| Readable | 03, 14 | TRUST does not know this corpus's naming or file-shape rules |
| Unified | 01, 06 | **the largest gap** — structural conformance is this corpus's whole subject and TRUST has no view on it |
| Secured | 13, 21 | complementary; gitleaks and OWASP cover what 13 states, 21's runtime log rules are covered by neither |
| Trackable | 18, 23, 31 | `@MX` annotations are the harness's trackability mechanism and have no counterpart here |

**Neither framework subsumes the other.** A change can pass TRUST 5 and violate
tier 01 in every file it touches, because "Unified" is about internal
consistency and tier 01 is about a specific target structure.

#### `@MX` annotations
The harness expects `@MX` code annotations where warranted, tying code back to
its SPEC. This corpus has no annotation convention and does not need one — but
two rules keep them from becoming noise:

- **Annotate the seam, not every file.** The place where a SPEC's decision is
  encoded — a boundary, a mapper, a fuse — not each file the SPEC touched.
- **An `@MX` on a placeholder-resolving line cites the ADR too.** Otherwise the
  code points at a SPEC that points at a decision nobody recorded.

### Definition of Done, reconciled

28-definition-of-done.md states this corpus's DoD. The harness states its own:
all SPEC requirements implemented, methodology tests passing, 85%+ coverage,
TRUST 5 passed, `@MX` added.

**They are additive, and one number disagrees.** The harness says 85%; the target
repository's Vitest config says 90/90/90/80; 10-testing-standards.md resolves
that conflict and its resolution governs — the higher floor wins, and branches
ratchet toward parity.

**A frontend SPEC is done when both DoDs are met.** Neither is a subset of the
other, and the harness's is the one that will be checked automatically — which
is precisely why this corpus's must be written into the acceptance criteria.

### What this file does not do

**It does not tell you how to run the harness.** Flags, token budgets, worktree
options, agent chains and gate mechanics are the harness's own documentation and
change with it. Anything procedural stated here is a snapshot; if it disagrees
with `.claude/`, `.claude/` is right and this file needs regenerating.

## ─────────────────────────────────────────────────────────────
### Correction: the harness is BMAD, not MoAI-ADK

**Everything above describes MoAI-ADK**, taken from the client's
`project-template-java` template documentation. The repository this corpus
governs ships **BMAD** (`_bmad/`, `_bmad-output/`, and the `bmad-*` skills
under `.claude/skills/`).

**This file's status is therefore DRAFT against the wrong harness for
everything above this line.** It is kept rather than deleted because **the
central rule is harness-independent and is the reason the file exists.**

#### The rule survives unchanged

> **A standard not written into the work item's acceptance criteria will not be
> enforced by the harness.**

BMAD verifies the **story**. Its review skill reviews against the story. Neither
reads `PQMS_docs/` unless the story says to. Substitute "story" for "SPEC" and
every consequence above holds.

#### Vocabulary mapping

| MoAI-ADK (above) | BMAD (this repository) |
|---|---|
| `/moai plan` | `bmad-create-prd` → `bmad-create-architecture` → `bmad-create-epics-and-stories` → `bmad-create-story` |
| `/moai run` | `bmad-dev-story` (or `bmad-dev-auto`) |
| `/moai sync` | `bmad-code-review`, then the usual commit and MR |
| `SPEC-<ID>` | an epic and its stories |
| Re-planning gate | `bmad-correct-course` |
| `plan-auditor` | `bmad-check-implementation-readiness` |
| — | `bmad-document-project` — no MoAI counterpart |

**Two structural differences, and both matter for a restructure:**

- **BMAD has a PRD and an architecture step above the story.** A restructure has
  no product requirement, so **the architecture document is where this corpus
  attaches** — not the story. Point `bmad-create-architecture` at the tier files
  and let the epics derive from it.
- **BMAD's unit is an epic containing stories**, not a single SPEC. So the
  phase mapping in 30-restructuring-an-existing-react-project.md becomes **one
  epic per phase, one story per commit-sized move** — which fits a restructure
  better than a single SPEC did, because Phase 2's rule is one coherent move per
  commit.

#### What does not carry across

- **The 30% drift guard and the stagnation gate are MoAI mechanisms.** Whether
  BMAD has equivalents is unverified. The underlying advice still applies —
  enumerate structural work by directory, state the expected file count — but
  as good practice, not as an accommodation to a specific guard.
- **DDD / TDD selection from `quality.yaml`** is MoAI's. **The reasoning is
  not**, and it is the part worth keeping: a restructure's correctness criterion
  is *nothing changed*, so characterization tests are the instrument and a
  test-first cycle is the wrong shape. State that in the story regardless of
  what the harness calls it.
- **`@MX` annotations** are MoAI's trackability mechanism. BMAD's equivalent is
  the story reference. Same rule: **annotate the seam, not every file.**

#### TRUST 5
Unverified for BMAD. **The gap analysis above stands on its own merits**
whatever the quality framework is called — the point was never TRUST's five
letters, it was that a framework about internal consistency cannot check
conformance to a specific target structure. That remains true of any such
framework.

#### What to do with this file
**Rewrite it against BMAD once one full cycle has been run**, per
31-documentation-standards-and-decision-records.md's rule that reference
material is regenerated rather than patched. Until then, read the rule at the
top, the mapping table, and treat the MoAI procedure above as an illustration.

---

## 33 — Polyglot Monorepo Integration
**Tier:** 1
**Status:** DRAFT — derived from the client's `docs/STACK.md`, `TEAM-GUIDE.md`
and `DEVELOPER_GUIDE.md`; not yet exercised against the running system
**Purpose:** Where the frontend's boundary sits in a repository it shares with a
Java backend and a CDK infrastructure project — what it owns, what it depends
on, and what it must never reach into
**Extends:** 01-project-structure-and-architecture.md (which stops at the
workspace root)
---

Assumes 00-core-rules.md; where the two conflict, 00 wins.

### Why this file exists

`01-project-structure-and-architecture.md` describes everything inside the pnpm
workspace and stops there. In the target repository the workspace is one of
three components:

**The tree this file used to draw was the client's `project-template-java`
template, not this repository.** It showed `infra/`, `.moai/`, `lefthook.yml`
and `.gitlab-ci.yml`; **none of those exist here.** Observed 2026-08-25:

```
KUS-PQMS/                        ONE git repository — not four submodules
├─ backend/          EMPTY of source — see below
├─ frontend/         React 18.3 · Vite 5 · pnpm 11        <- this corpus
│  ├─ apps/portal/               @pqms/portal
│  ├─ packages/ui-library/       @pqms/ui-library
│  ├─ packages/design-tokens/    @pqms/design-tokens
│  ├─ pnpm-workspace.yaml        frontend/ IS the workspace root
│  ├─ tsconfig.base.json
│  └─ scripts/                   workspace-level gates
├─ automation/       EMPTY of source
├─ infrastructure/   EMPTY of source — and NOT named `infra/`
├─ .githooks/        plain git hooks via core.hooksPath — no Husky, no Lefthook
├─ _bmad/ _bmad-output/   BMAD harness — NOT MoAI-ADK
├─ .claude/  docs/  issues/  scripts/
└─ .gitattributes  .git-blame-ignore-revs  .gitignore  README.md
```

**Four differences that change what this file can assume**, beyond the naming:

- **No `.gitlab-ci.yml`, no `.github/`, no CI of any kind** — at the root or
  inside any component. 15-devsecops-and-ci-cd.md's platform is an open
  placeholder in 00-core-rules.md, not a settled fact.
- **No `lefthook.yml`.** Hooks are `.githooks/` plus per-component scripts.
- **No `.moai/`.** The harness is BMAD.
- **`infrastructure/`, not `infra/`.** Every path this file states for
  infra-owned requirements uses the wrong directory name; they are the same
  concern under a different name.

**Three of the four components contain no source code at all.** `backend/`,
`automation/` and `infrastructure/` hold **exactly five files each** — a
`.gitignore`, a `README.md`, a `commit-msg.rules`, and two hook scripts that
`echo` and `exit 0`. There is no Spring Boot application, no CDK project and no
test suite anywhere in this repository.

**That is stronger than "not built yet", and it changes how to read this file.**
Everything below about the API contract, the backend port mismatch and the
infra-owned requirements describes a boundary with **nothing on the other side
of it**. Those sections are a specification to build against, not a description
of an integration that exists. Where this file previously cited `docs/STACK.md`
for backend versions and ports, it was citing the client's *template*
documentation about a service this repository does not contain.

Three of this corpus's rules cannot be satisfied inside `frontend/` at all —
the Content-Security-Policy, the cache headers, and the SPA deep-link rewrite
all live in `infra/`. Naming that boundary is what stops those rules from being
quietly dropped as "not our file".

### The boundary, stated as ownership

| Concern | Owner | This corpus's role |
|---|---|---|
| React source, components, routing, state | **`frontend/`** | governs fully |
| Frontend build config, lint, test, Storybook | **`frontend/`** | governs fully |
| The API contract | **`backend/`** | consumes; validates at the boundary |
| Auth token issuance and validation | **backend + IdP + API Gateway** | consumes; stores per 08 |
| CSP, cache headers, SPA rewrite, TLS | **`infra/`** | **states the requirement, verifies the result** |
| CI pipeline structure | **repo root** | contributes frontend jobs only |
| Git hooks, commit conventions | **repo root** | contributes frontend commands only |
| Versions, ports, environment variables | **`docs/STACK.md`, `DEVELOPER_GUIDE.md`** | defers |

**The two rows that cause trouble are the fifth and the last**, and for opposite
reasons: the fifth is a rule this corpus states but cannot implement, and the
last is a fact this corpus must not restate.

### Three requirements that live in `infra/`

Each is a real requirement from a tier file, unsatisfiable inside `frontend/`,
and invisible in development. **State them, do not implement them, and confirm
them at review** (16-code-review-checklist.md).

#### 1. The SPA deep-link rewrite
A request for `/issues/123` is a key that does not exist in the S3 bucket.
Without a 403/404 → `/index.html` rewrite at the distribution, **every route
except `/` fails on a cold load** while working perfectly in development and in
every test.

This is the highest-consequence item in this file: it makes
07-routing-and-layouts.md's entire route tree non-functional, and it is found
late because nobody deep-links while developing.

#### 2. Cache headers
Hashed assets (`dist/assets/[name].[hash].[ext]`) are immutable by construction
and want a one-year immutable policy. **`index.html` wants the opposite.** Get
it backwards and a deploy ships assets no browser requests — presenting as
"users are on the old version until they hard-refresh", which reads as a
frontend bug and is not one. 12-performance-guidelines.md carries the detail.

#### 3. Content-Security-Policy
13-security-standards.md specifies one. A static SPA has no server to set
headers; it is a CloudFront response-headers policy. **A CSP nobody applied is a
CSP that exists only in a document.**

### The API contract

The backend is a Spring Boot service reached at `/api/*` through CloudFront →
API Gateway → ALB → ECS. **One origin, one client**
(05-api-integration-and-data-fetching.md).

**The contract is the backend's, and this corpus does not restate it.** What it
requires is that the frontend never trusts it silently:

- **Validate at the boundary.** Zod schemas in the service layer turn a backend
  field rename into one caught error at one seam, rather than `undefined`
  rendering three components deep. This matters *more* across a language
  boundary, not less — there is no shared type to break.
- **Map wire shapes to domain types in `.mappers.ts`.** Java naming conventions,
  date serialisation and enum casing will not match the domain types
  02-typescript-standards.md ratifies. That translation is a named, tested
  layer — not a `??` at the call site.
- **Error codes come from the backend.** 22-error-handling-and-user-feedback.md
  maps them to copy. A code the frontend invents is a code no backend will ever
  send.

**[PLACEHOLDER — whether an OpenAPI spec exists and can generate types.
`docs/STACK.md` §8 item 3 records `swagger-ui.enabled=true` with **no springdoc
dependency**, so the flag is inert and no spec is currently published. Trigger:
before the first API integration SPEC. Owner: backend lead.]** If a spec is
published, generated types replace hand-written wire types — the mappers stay.

### Environment variables

`VITE_API_BASE` is the name the target repository already uses
(`docs/STACK.md` §3). 13-security-standards.md's `ImportMetaEnv` interface is
the authoritative inventory of what the **frontend** reads.

Two rules that matter more here than in a single-component repository:

- **The frontend's inventory covers `VITE_*` only.** Backend variables
  (`DATABASE_*`, `REDIS_*`, `AWS_REGION`) are documented in
  `DEVELOPER_GUIDE.md` and are none of this corpus's business. Do not mirror
  them.
- **Anything in a `VITE_*` variable ships to the browser.** It is not
  configuration, it is published content. A backend developer accustomed to
  Secrets Manager will not assume this.

#### A live defect
`docs/STACK.md` §8 item 1: the Vite proxy defaults to `http://localhost:8080`
while the backend runs on `18080` locally, so `/api/*` does not reach it.
Aligning it spans both components. 19-onboarding-and-dev-workflow.md carries it
as a day-one troubleshooting entry until then.

### Reaching across the boundary

**The frontend never reads or writes outside `frontend/`**, with three named
exceptions:

| Permitted | Why |
|---|---|
| `docs/` — read only | version and setup facts; it is the source of truth |
| `.gitlab-ci-templates/pipelines/frontend.gitlab-ci.yml` | the frontend's own pipeline |
| `lefthook.yml` — frontend-scoped entries only | the frontend's own hooks |

Everything else — `backend/`, `infra/`, `scripts/`, other components' pipeline
templates — is another team's code. **A change there is their merge request,
not a line in yours.**

The rule has a sharp edge worth stating: **a glob that escapes its component is
a boundary violation even when the change is mechanical.** A Prettier pattern of
`**/*.md` reformats the backend's documentation, and they discover it through
`git blame` on a commit that says "chore: format frontend".
23-git-workflow-hooks-and-commits.md records that the current Lefthook glob has
exactly this problem.

### Where the client's documents win

| Question | Authority |
|---|---|
| Versions, toolchain, resolved dependencies | `docs/STACK.md` |
| Local setup, ports, environment variables | `docs/DEVELOPER_GUIDE.md` |
| Labels, branch protection intent, conventions | `docs/conventions/README.md` |
| Pipeline structure and rationale | `docs/CI-ANALYSIS.md` |
| Test-suite state and known gaps | `docs/TEST-REVIEW.md` |

**Read `docs/TEST-REVIEW.md` before writing a testing SPEC.** It grades each
layer independently and lists concrete findings — including an orphaned test in
the frontend. A coverage percentage is not a statement about test quality, and
that document is the client's own evidence for the distinction.

### Where the client's documents disagree with each other

Four contradictions are visible in the material this file was written from.
**None is this corpus's to resolve, and all four are reportable findings:**

| Contradiction | Sources |
|---|---|
| Region `us-west-2` vs `us-east-1` | `TEAM-GUIDE.md` §1 vs `STACK.md` §1 |
| Node 20+ vs ≥ 24.15.0 | `DEVELOPER_GUIDE.md` prerequisites vs `STACK.md` §3 |
| Backend port 8080 vs 18080 | `STACK.md` §7 vs `DEVELOPER_GUIDE.md` |
| Package root `com.[hma\|kus\|haea].api` vs `com.hma.haea.backend` | `TEAM-GUIDE.md` §1 vs `STACK.md` §2 |

The Node one is the only one that will stop a frontend developer: following the
prerequisites table installs a runtime the frontend cannot build on, and React
Router v8 requires 22.22.0+ regardless. **`.nvmrc` is the operative answer.**

**Report contradictions; never resolve one silently by picking a side.** A
document corrected in passing, by someone outside the team that owns it, is how
the drift these files record began.

### Withdrawn: they are NOT submodules. Four ordinary directories, one repository.

**An earlier revision of this file asserted that `backend/`, `frontend/`,
`automation/` and `infrastructure/` are git submodules "each with its own
history, its own lockfile and its own `commit-msg.rules`". That is false, and
everything derived from it below is withdrawn.**

Measured 2026-08-25 against the repository, recorded in
`../../RESTRUCTURE-BASELINE.md`:

```
$ git submodule status          # no output, exit 0
$ cat .gitmodules               # No such file or directory
$ ls -ld frontend/.git          # No such file or directory
$ git ls-files -s | awk '$1=="160000"'    # no gitlinks in the index
```

Every one of the four is mode `100644` in a single index. There is **one** git
repository, rooted at `KUS-PQMS/`. The tell was available without running
anything: the entire corpus and the entire React port arrived in **two commits
touching all four areas**, which no submodule arrangement can produce.

#### What the withdrawal changes back

| Claim in the withdrawn section | Actually |
|---|---|
| Each submodule needs its own `.gitattributes` | **The root file is inherited.** `frontend/.gitattributes` exists anyway — for 33's boundary reason and because the root lacks `eol=lf` — not because inheritance fails |
| `.git-blame-ignore-revs` at the root does not serve all four | **It does, and it belongs there.** `blame.ignoreRevsFile` is one repository-level value and forge auto-detection reads only the repo root; a per-component copy is inert |
| A change cannot span components in one MR | **It can.** One repository, one branch, one MR |
| The pointer-commit trap | **Does not exist.** There is no pointer. A commit inside `frontend/` is simply a commit |
| `core.hooksPath` governing submodule commits is "untested" | **Tested, and it works.** A commit staged in `frontend/` fires the root router, which ran `frontend/scripts/pre-commit.sh` and rejected an invalid message via `frontend/commit-msg.rules` |
| "If the frontend's changes seem to have vanished, open the submodule directly" | **Nothing vanishes.** `git log -- frontend/` shows every file |

#### What survives, and it is the part that mattered

**The boundary between components is real. It is simply not enforced by git.**

Everything this file says about *why* the boundary exists stands unchanged: a
formatter or lint glob that escapes `frontend/` reformats another team's code and
they find out from `git blame`; the frontend's `commit-msg.rules` is
authoritative for the frontend and reaches into no other component; the
infra-owned requirements are still owned by another team.

**What changes is the enforcement mechanism, and it changes for the worse.** The
withdrawn section closed with "one thing that got simpler" — that submodules made
the boundary structural, so a frontend tool "cannot reach `backend/` because it is
not in the same repository."

**That protection was never there.** In one repository a glob that escapes its
directory reaches every other component immediately, and nothing stops it. So:

- **The glob-escape hazard is live, not "largely disappeared".** Every path
  filter, ignore file and lint glob in `frontend/` must be scoped to `frontend/`
  by its own construction, because no repository boundary will do it.
- **Enforcement is review and configuration, not git.** The boundary is a
  convention this corpus states and reviewers uphold.
- **One instance is already unavoidable.** `core.hooksPath` is a single
  repository-level value, so `frontend/scripts/setup-hooks.mjs` necessarily
  configures hooks for all four components. It enables the shared router that
  dispatches to each component's own scripts rather than reaching into their code
  — but it is repo-wide, and that is a real tension rather than a technicality.

#### The lesson is 00's, for the third time

00-core-rules.md records it after two earlier passes: **a document about a
repository ranks below the repository.** The template documentation described a
template; the prior audit assumed written guidelines described built code; and
this section asserted a repository shape nobody had run `git submodule status`
against. **Each cost a full revision, and each was answerable in one command.**

18-project-context-and-implementation-status.md already draws the general
conclusion from the *first* two: "before deferring a question to a person, check
whether the repository already answers it." This is the same failure with the
person removed — nobody deferred it; it was simply asserted.

---

## Appendix: Derived Cross-Reference Index

**Computed directly from the 34 tier files above by this script — not
sourced from, or owned by, any single one of them.** Everything in this
section is a report on the corpus's current state, regenerated fresh
every run. If a rule needs changing, it is not here: this appendix has
no rules, only counts and lists derived from the files that do.

### Glossary term usage (per 20's term list)

Which files use each term 20 defines. The definitions are authored in
20; this list is not — see 20's glossary note for why.

| Term | Used in | Count |
| --- | --- | --- |
| RBAC | 00, 04, 08, 16, 17 | 5 |
| CSP | 00, 08, 13, 15, 16, 18, 33 | 7 |
| PKCE | 00, 05, 08, 11, 18 | 5 |
| OIDC | 00, 05, 08, 11, 18 | 5 |
| ITP | 08 | 1 |
| JIT | 12 | 1 |
| HMR | 13 | 1 |
| testid / data-testid | 10, 16 | 2 |
| WCAG | 00, 03, 06, 07, 11, 12, 18, 27 | 8 |
| ARIA | 06, 11, 18, 27 | 4 |
| NFR | 00, 06, 08, 11, 12, 15, 17, 18, 21, 25, 30 | 11 |
| ADR | 00, 01, 03, 06, 08, 18, 25, 31, 32 | 9 |
| BFF | 08, 13 | 2 |
| SPA | 05, 08, 11, 12, 13, 15, 33 | 7 |
| MSAL | 04, 07, 08, 13, 16, 18, 21 | 7 |
| XSS | 00, 08, 13, 18 | 4 |
| DOM | 01, 02, 03, 06, 11, 12, 13, 18 | 8 |
| ICU | 00, 09 | 2 |
| BEM | 06 | 1 |
| SSO | 08, 18 | 2 |
| IdP | 08, 33 | 2 |
| ESM | 00, 02 | 2 |
| RTL | 10, 18, 30 | 3 |
| MSW | 00, 05, 10, 18, 26 | 5 |
| JSX | 02, 06, 11, 18, 21 | 5 |
| CSF3 | 24 | 1 |
| DoD | 16, 28, 32 | 3 |
| LCP / INP / CLS | 12, 25 | 2 |
| SC | 02, 06, 17, 18 | 4 |
| Outbox | — | 0 |

### Inbound references per tier file

For each file, which other files cite its filename at least once.

| File | Cited by | Count |
| --- | --- | --- |
| 00 | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33 | 33 |
| 01 | 00, 03, 05, 06, 07, 12, 13, 15, 18, 19, 24, 30, 33 | 13 |
| 02 | 00, 03, 05, 14, 17, 20, 33 | 7 |
| 03 | 01, 04, 05, 07, 11, 12, 13, 14, 18, 22 | 10 |
| 04 | 01, 03, 05, 08, 10, 11, 12, 13, 19, 24 | 10 |
| 05 | 00, 01, 02, 03, 04, 07, 08, 12, 13, 14, 19, 21, 33 | 13 |
| 06 | 00, 01, 03, 11, 12, 14, 27 | 7 |
| 07 | 01, 03, 05, 08, 10, 11, 12, 17, 18, 19, 27, 32, 33 | 13 |
| 08 | 00, 01, 03, 04, 05, 07, 11, 13, 15, 17, 18, 19 | 12 |
| 09 | 02, 14, 18 | 3 |
| 10 | 00, 01, 02, 04, 05, 06, 11, 15, 18, 20, 24, 26, 30, 32 | 14 |
| 11 | 00, 01, 03, 06, 07, 10, 14, 18, 20 | 9 |
| 12 | 03, 06, 07, 09, 13, 14, 15, 18, 33 | 9 |
| 13 | 05, 08, 12, 15, 18, 20, 21, 25, 33 | 9 |
| 14 | 00, 01, 02, 03, 05, 06, 10, 11, 12, 15, 18, 23, 30, 31 | 14 |
| 15 | 00, 10, 13, 18, 20, 24, 26, 33 | 8 |
| 16 | 12, 13, 15, 24, 27, 33 | 6 |
| 17 | 00, 01, 02, 03, 07, 08, 11, 18, 20 | 9 |
| 18 | 00, 01, 06, 08, 11, 12, 13, 14, 15, 17, 20, 23, 29, 30, 31, 33 | 16 |
| 19 | 05, 23, 30, 33 | 4 |
| 20 | 05, 10, 18, 19, 23 | 5 |
| 21 | 00, 13, 15, 18, 19, 25, 26 | 7 |
| 22 | 03, 09, 16, 26, 33 | 5 |
| 23 | 00, 14, 18, 20, 30, 32, 33 | 7 |
| 24 | 00, 15, 20 | 3 |
| 25 | 00, 13, 21 | 3 |
| 26 | 05, 09, 24 | 3 |
| 27 | 01, 16 | 2 |
| 28 | 16, 20, 32 | 3 |
| 29 | 01, 24 | 2 |
| 30 | 00, 01, 04, 14, 15, 18, 19, 23, 32 | 9 |
| 31 | 00, 18, 32 | 3 |
| 32 | 19, 23, 30 | 3 |
| 33 | 00, 18, 23 | 3 |

### `Base*` component-name mentions per file

Distinct `Base*` identifiers mentioned in each file, incidentally, as
examples of some other rule. **Not a component inventory** — see 01's
"This file does not enumerate the components" section for why these
mentions must not be assembled into one.

| File | Names | Count |
| --- | --- | --- |
| 00 | BaseButton, BaseDataTable, BaseSelect | 3 |
| 01 | BaseCommentCard, BaseDataTable, BaseModal, BaseReasonGate, BaseSelect, BaseTooltip | 6 |
| 03 | BaseDataTable, BaseModal, BaseTabs | 3 |
| 04 | BaseDataTable | 1 |
| 06 | BaseBadge, BaseButton, BaseCheckbox, BaseDateRangePicker, BaseInput, BaseMarkdownEditor, BaseModal, BaseSelect, BaseStatusPill, BaseSwitch, BaseTabs, BaseTextarea, BaseTooltip | 13 |
| 09 | BaseButton | 1 |
| 10 | BaseButton | 1 |
| 11 | BaseCheckbox, BaseDataTable, BaseModal, BaseReasonGate, BaseSelect, BaseSwitch, BaseTextarea, BaseTooltip | 8 |
| 12 | BaseDataTable, BaseDateRangePicker, BaseIcon, BaseMarkdownEditor, BaseSkeleton, BaseSwitch, BaseToast, BaseTooltip | 8 |
| 13 | BaseCommentCard, BaseMarkdownEditor | 2 |
| 14 | BaseButton, BaseMarkdownEditor | 2 |
| 18 | BaseAttentionBanner, BaseButton, BaseCheckbox, BaseDataTable, BaseDrawer, BaseFileDropzone, BaseModal, BaseSelect, BaseSeverityIndicator, BaseStatusPill, BaseStepRail, BaseSwitch, BaseTabs, BaseTextarea, BaseTooltip | 15 |
| 20 | BaseSelect, BaseTooltip | 2 |
| 22 | BaseToast | 1 |
| 24 | BaseButton | 1 |
| 27 | BaseButton | 1 |
| 29 | BaseDataTable, BaseSelect | 2 |
| 30 | BaseDataTable, BaseModal | 2 |
