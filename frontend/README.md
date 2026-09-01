# N-PQMS ISM — Frontend

React UI for the N-PQMS **Issue & Signal Management (ISM)** module. It mirrors the
current UX design **1:1 — no new features**. The visual system is the vendored Kia
N-PQMS design system; the source of truth is the UX design + `docs/reference`.

## Guardrails (see the approved plan)
- Build **only** what the current UX shows. Out of scope (not in the design): issue
  scoring/severity, QIR module, TSB, EWS/GQIS ingestion, cross-org sharing / Sharing tab.
- Sources: `docs/reference/` and the UX designs under
  `_bmad-output/planning-artifacts/{ux-designs,ux/design-source}` only.

## Getting started

**The package manager is pnpm.** `package-lock.json` is gone and `packageManager`
pins the version. Do not run `npm install` here — it would resolve a different
tree from `pnpm-lock.yaml`.

```bash
cd frontend
pnpm install      # also bootstraps git hooks, see below
```

### Enable the git hooks — required once per clone

**This repository's gates are hooks, and hooks do not clone.** `core.hooksPath`
lives in `.git/config`, which is local to your machine. There is **no CI**, so
until you run this, your clone has *no* enforcement of any kind — commit-message
rules, token gates and adherence ratchets are all silently absent.

`pnpm install` in `frontend/` does it for you. If you have not installed here, or
you only work in another component, run the one-liner from the repository root:

```bash
node frontend/scripts/setup-hooks.mjs
```

It is idempotent and safe to re-run. To verify without changing anything:

```bash
pnpm run hooks:check      # exit 1 if this clone has no hooks
```

**Two limits, stated because they are easy to assume away:**

1. **`pnpm install` only re-runs the bootstrap when it actually installs
   something.** A no-op install ("Already up to date") skips `prepare`. This is
   harmless — it only needs to succeed once — but do not read a quiet install as
   confirmation. Use `pnpm run hooks:check`.
2. **This only covers people who install in `frontend/`.** Someone working solely
   in `backend/` never triggers it. `core.hooksPath` is a single repository-level
   value, so a per-component bootstrap cannot fully solve a repository-level
   setting — closing that gap needs something at the repository root, which is
   the repo owner's call. See `RESTRUCTURE-BASELINE.md`.

## Design-system wiring
- `src/styles/design-system/` is a **byte-copy** of the design source
  (`ux/design-source/design-system` tokens + `styles.css` + `assets/fonts`). Imported
  once in `src/main.tsx`, so every `var(--*)` custom property is global.
- `design-system-manifest.json` (`_ds_manifest.json`) is the token source-of-truth for:
  - `pnpm run tokens:gen` → `src/tokens/tokens.generated.ts` (typed map for logic)
  - `pnpm run tokens:check` → **token-diff gate** (fails on any drift from the manifest)
  - `pnpm run tokens:drift` → regenerates to a temp path and diffs the committed
    file, so a stale or hand-edited generated map cannot pass
- Icons: Lucide via `src/icons/Icon.tsx` (1.75 stroke, size tokens, tree-shaken).

**Never edit** `_adherence.oxlintrc.json`, `design-system-manifest.json`,
`src/styles/design-system/**` or `src/tokens/tokens.generated.ts`. They are
byte-copies or generated output. App-side adaptations go in
`eslint.adherence.config.mjs`. All of them are in `.prettierignore`, because
`prettier --write` would otherwise rewrite every one of them.

## Adherence gates — three ratchets, machine-written ceilings

The single `--max-warnings 662` budget is gone. Three families, three independent
ceilings in `.ds-ceilings.json`:

| Script | Family | Ceiling | Nature |
|---|---|---:|---|
| `pnpm run lint:ds:values` | raw px / hex / font literals | **467** | ratchet — falls as Step 8 converts to tokens |
| `pnpm run lint:ds:numeric` | numeric hard-coded dimensions | **348** | ratchet — the loophole below |
| `pnpm run lint:ds:imports` | restricted imports | **0** | regression guard, already clean |

`pnpm run lint:ds` runs all three; `build` runs it.

**The ceiling is written by a script, not by a human.** A count that drops
rewrites `.ds-ceilings.json` automatically — commit it with your change. A count
that rises **fails**, and raising the ceiling means editing a tracked file by
hand so it shows up in review as a deliberate act with a name on it. The recorded
history of the old single number was 623 → 638 → 662, every movement upward,
which is what a hand-edited budget always becomes.

**Two things that changed and are worth knowing:**

- **The `<X> doesn't accept that prop` selectors are no longer executed.** They
  were regex prop allowlists authored against the design system's plain-JS source
  where `Button` declared six props; this port's `Button extends
  ButtonHTMLAttributes`, so ordinary `onClick`/`disabled`/`aria-*` were reported
  as violations. `tsc --noEmit` checks props against the real interfaces and is
  strictly stronger. That removed 195 permanent false positives (662 → 467).
- **The numeric loophole is closed.** `padding: '12px 14px'` warned while
  `gap: 20` was silent, so deleting the quotes made a warning vanish without a
  token being used. 348 previously-invisible values are now counted.

**467 + 348 = 815 tracked violations is not a regression.** It is 467 real signals
plus 348 that were always there and are now visible.

Raw values with no token behind them are **prototype constants**, not token
failures — `#DDE3E9` control borders, 11.5/12.5px type, the 186px label column.
Fix a value when a token exists; document it when one does not.

## Local gates

| When | What runs | Where |
|---|---|---|
| `pre-commit` | tokens:check, tokens:drift, css-vars | `scripts/pre-commit.sh` — milliseconds |
| `pre-push` | typecheck + the three ratchets | `scripts/pre-push.sh` — seconds |
| `build` | typecheck, both token gates, css-vars, all three ratchets, vite build | `package.json` |

`pnpm run lint:css-vars` validates every `var(--x)` in `src/` against the
manifest. `var(--space-41)` is valid CSS that compiles, ships and renders
nothing; nothing else in this project catches it.

**There is no CI.** Every gate above is local. See `RESTRUCTURE-BASELINE.md`.

## Scripts
- `pnpm run dev` — Vite dev server
- `pnpm run build` — typecheck + all gates + production build
- `pnpm run typecheck` — `tsc --noEmit`
- `pnpm run lint:ds` — the three adherence ratchets
- `pnpm run lint:css-vars` — custom-property reference check
- `pnpm run tokens:gen` / `tokens:check` / `tokens:drift`
<!-- `docs:standards` / `docs:standards:check` removed: both generated a
     distribution document from a standards corpus that is no longer in this
     repo, so the scripts had no source to read. -->
- `pnpm run hooks:check` — verify this clone has hooks enabled

## Status

The app is a **1:1 React port of the UX prototype**, not a scaffold: seven routes
(`/dashboard`, `/issues`, `/issues/new`, `/issues/:id`, `/admin`,
`/notifications`, catch-all), 29 components, ~8,400 lines. `src/App.tsx` is the
real route table using the layout-route pattern; React Router 6 is in use.

**Baseline and known gaps:** `RESTRUCTURE-BASELINE.md` is the Phase 0 snapshot —
gate numbers, tooling reality, and two lists separating defects this project
introduced from questions it inherited. The largest gaps it records: **zero
tests** (no runner, no coverage), **no CI**, the **fidelity harness does not run**
(hardcoded `D:` path, wrong Playwright browser revision, `127.0.0.1` vs `[::1]`),
and `/admin` has **no route guard**.
