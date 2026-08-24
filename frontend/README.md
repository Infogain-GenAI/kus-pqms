# N-PQMS ISM — Frontend

React UI for the N-PQMS **Issue & Signal Management (ISM)** module. It mirrors the
current UX design **1:1 — no new features**. The visual system is the vendored Kia
N-PQMS design system; the source of truth is the UX design + `docs/reference`.

## Guardrails (see the approved plan)
- Build **only** what the current UX shows. Out of scope (not in the design): issue
  scoring/severity, QIR module, TSB, EWS/GQIS ingestion, cross-org sharing / Sharing tab.
- Sources: `docs/reference/` and the UX designs under
  `_bmad-output/planning-artifacts/{ux-designs,ux/design-source}` only.

## Design-system wiring
- `src/styles/design-system/` is a **byte-copy** of the design source
  (`ux/design-source/design-system` tokens + `styles.css` + `assets/fonts`). Imported
  once in `src/main.tsx`, so every `var(--*)` custom property is global.
- `design-system-manifest.json` (`_ds_manifest.json`) is the token source-of-truth for:
  - `npm run tokens:gen` → `src/tokens/tokens.generated.ts` (typed map for logic)
  - `npm run tokens:check` → **token-diff gate** (fails on any drift from the manifest)
- Icons: Lucide via `src/icons/Icon.tsx` (1.75 stroke, size tokens, tree-shaken).

## Adherence lint ratchet

`npm run lint:adherence` runs with `--max-warnings`, so the warning count is a ratchet:
new code may not add warnings without a deliberate bump. Current ceiling **662**.

Two of the three warning categories are rule limitations rather than code defects, and
account for most of the count:

- **"<X> doesn't accept that prop"** — the rule only knows each component's *extra* declared
  props. `Button`, `Checkbox`, `SearchField` and `Input` all extend their HTML element's
  attributes, so ordinary `onClick`, `onChange` and `disabled` usage warns.
- **"Raw px value" / "Raw hex color"** — real signal, except where the prototype pins a value
  no token expresses (e.g. `#DDE3E9` control borders, 11.5/12.5px type, the 186px label
  column). Fix these when a token exists; document the value when one does not.

History: 623 → 638 (Issue Priority tab) → 662 (Issue Entry model-code/year picker + issue
linking).

## Scripts
- `npm run dev` — Vite dev server
- `npm run build` — typecheck + production build
- `npm run tokens:gen` / `npm run tokens:check`

## Status (Phase 0 — foundation)
`src/App.tsx` is a **temporary foundation smoke page** proving tokens/fonts/icons resolve;
it is replaced by the real app shell (Header + SideNav) in Phase 2.

Deferred to later phases (kept out of the first install for a fast, reliable foundation):
ESLint, Vitest + Testing Library, Storybook, Playwright (+ visual fidelity vs
`PQMS_SE.html`), MSW mock data layer, Radix primitives, TanStack Table/Query, React Router.
