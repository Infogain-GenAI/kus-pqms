# 16 — Code Review Checklist
**Tier:** 1
**Status:** APPROVED — REVISION 2

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
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

## RBAC / Security
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

## TypeScript
- [ ] No `any` anywhere — `unknown` + narrowing, or a documented
  `.d.ts` shim for untyped libs (02)
- [ ] Domain values use string literal unions + `as const`, never
  `enum` (02)

## Structure / Naming
- [ ] New feature folders stay flat until ~15 files or 2+ distinct
  sub-concerns (01)
- [ ] No new folder named "shared" outside `src/components/shared/`
  (01)
- [ ] Components: default export. Non-component modules (hooks,
  stores, services, utils, types): named exports only (14)
- [ ] A new component with a heavy third-party dependency excludes its
  value export from the main barrel, keeps types in the main entry
  point (14)

## Component patterns
- [ ] Multi-value callback props use `<name>` + `on<Name>Change`
  pairs, not one generic `value`/`onChange` (03)
- [ ] No manual `useMemo`/`useCallback`/`React.memo` added without a
  specific, stated reason the Compiler can't cover (03)

## State / Auth
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

## API / Data
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

## Documentation
- [ ] Any standards change was made in the **tier file** under
  `PQMS_docs/standards/`, never in the generated distribution document
  (00). If the diff touches
  `PQMS_docs/Frontend-Development-Standards-v1.0.md` and no tier file,
  that is a hand-edit and will be lost
- [ ] The generated document was regenerated in the same PR —
  `pnpm docs:standards` — so `docs:standards:check` passes (15)

## Testing
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

## Styling
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

## Performance
- [ ] Any new lazy-loaded heavy component (editor, chart, etc.) has
  its Suspense + ErrorBoundary scoped narrowly around itself, not
  around a containing form or tab (12)
- [ ] New route/lazy chunks are checked against the ~150KB gzipped
  per-chunk budget (12)

## Routing
- [ ] No data-fetching logic added inside a loader — loaders are
  param-validation/redirects only; view data comes from a TanStack
  Query hook (07)

## Forms, tables and overlays
**Owned by 27-forms-tables-and-overlays-review.md**, which carries a
checklist section for each. Not restated here: those three surfaces are
most of this product, their checks are long, and a list this file could
not keep current is worse than a pointer.

Apply 27 whenever a PR touches a form, a table, or anything portaled.

## Before the review — the author's gate
**Owned by 28-definition-of-done.md.** This file is the reviewer's list;
28 is the author's, and it runs first. A reviewer who finds a DoD item
unmet should say so and stop, rather than reviewing work that was not
ready — that is not pedantry, it is the difference between one review
round and three.

## CI / Merge
- [ ] Both `quality` and `e2e` CI jobs pass, plus at least one review
  — **stated in 15 as a policy recommendation, NOT yet a
  confirmed-active GitHub branch-protection rule** (15). This
  distinction matters for review conduct: a reviewer should still
  apply this bar by convention, but should not point to it as an
  enforced gate the platform itself guarantees.
