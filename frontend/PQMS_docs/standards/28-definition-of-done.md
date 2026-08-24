# 28 — Definition of Done
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
When an author may open a pull request. `16` is the reviewer's list; this is
the author's gate. The two are deliberately different documents — a reviewer
checks what they can see, an author knows what they did.

## Why this file exists
The Vue corpus carried a Definition of Done in **three** separate documents
(coding, testing, performance). None is carried forward. Without one, "done"
is negotiated per PR, and it is negotiated downward under schedule pressure.

## DoD — any change
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

## DoD — a `ui-library` component
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

## DoD — a screen
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

## What "done" never means
- Not "it works on my machine" — the gate is CI, and the prior repository’s
  30-working-day React migration plan's working agreement is explicit that
  this repo's IDE type errors are known-unreliable.
- Not "tests will follow" — `10`'s threshold is enabled from the first
  covered file precisely so that this is not available.
- Not "the reviewer will catch it" — `16` is a second pass over work that
  was already finished.
