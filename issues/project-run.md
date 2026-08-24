# project-run — changes made to get the frontend running

Date: 2026-08-24 · Author: Claude Code session · Branch: `master`

Two separate pieces of work happened in this session:

1. **Importing the Kia design prototype** — purely additive, no risk.
2. **Getting `frontend/` running** — this went wrong first. I scaffolded a new Vite app
   into `frontend/` believing it was empty, overwrote five files belonging to the existing
   ISM port, then restored them. Net effect is now zero, but the detail matters and is
   recorded below in full.

---

## 1. Why the mistake happened

`frontend/` looked empty and was not:

- The root `README.md` describes the component folders as "no-op placeholders".
- `git ls-files frontend` returns only `.gitignore`, `README.md`, `commit-msg.rules`,
  `scripts/pre-commit.sh`, `scripts/pre-push.sh`.
- **Every file of the real port is untracked**, so it does not appear in a tracked-file
  listing, and git could not restore anything I overwrote.

What is actually in `frontend/` (built in sessions dated 2026-08-20 → 08-23):

| Area | Contents |
|---|---|
| `src/components/**` | Kia N-PQMS design system hand-written as TSX + CSS modules (not the compiled `_ds_bundle.js`) |
| `src/features/**` | Dashboard, IssueList, IssueWorkspace, CreateIssue, Admin, Notifications screens |
| `src/app/AppShell.tsx` | Layout route rendering the 60px sticky chrome + `<Outlet/>` |
| `src/data/**` | Seed data, `StoreProvider` / `RoleProvider` React-context store |
| `src/tokens/`, `scripts/gen-tokens.mjs`, `check-tokens.mjs` | Token generation gated on `design-system-manifest.json` |
| `scripts/dc-compare.mjs`, `fidelity-capture.mjs`, `.fidelity/`, `FIDELITY-REPORT.md` | Playwright fidelity comparison against the `.dc.html` prototype |
| `dist/` | A committed production build — this is what made recovery possible |

**Rule going forward:** list the tree (`find frontend -not -path '*/node_modules*' -type f`)
before creating any file under `frontend/`. Untracked work is invisible to git.

---

## 2. Files I overwrote, and how each was restored

| File | What I did | How it was recovered | Confidence |
|---|---|---|---|
| `src/styles/global.css` | Replaced with my own reset | Rebuilt from `dist/assets/index-DcFH_zE_.css`; rebuilds to the **same content hash**, so byte-identical | Certain |
| `package.json` | Replaced `dependencies` / `devDependencies`, added `engines` | Restored verbatim from `package-lock.json`; `engines` removed. Verified programmatically equal to the lock | Certain |
| `index.html` | Replaced | Recovered from `dist/index.html`, including the original comment about the Inter `<link>` | Certain |
| `src/App.tsx` | Replaced | Route tree read out of the minified bundle — structurally identical (see below) | High |
| `src/main.tsx` | Replaced | Provider nesting read out of the minified bundle | High |

Route tree recovered from `dist/assets/index-HT6W5oEp.js`, in this exact order — `/issues/new`
is declared before `/issues/:id` so it is not parsed as an id:

```
<Route element={<AppShell/>}>
  index            → <Navigate to="/dashboard" replace/>
  /dashboard       → DashboardScreen
  /issues          → IssueListScreen
  /issues/new      → CreateIssueScreen
  /issues/:id      → IssueWorkspaceScreen
  /admin           → AdminScreen
  /notifications   → NotificationsScreen
  *                → <Navigate to="/dashboard" replace/>
```

`main.tsx` provider nesting: `BrowserRouter > RoleProvider > StoreProvider > App`.

### Two known deltas from the originals

1. **`main.tsx` is 68 bytes larger.** I added a null guard on `getElementById('root')`
   (`if (!el) throw new Error(...)`) where the original called it bare. Behaviourally
   identical whenever `#root` exists; it fails with a clear message instead of a cryptic
   one, and typechecks under `strict`. Revert to the bare call if exact parity is wanted.
2. **CSS import order was briefly wrong.** My first reconstruction placed the stylesheet
   imports *after* the component imports, which emits component CSS ahead of the design
   tokens and inverts the cascade. The imports now lead `main.tsx` with a comment stating
   why they must stay there. This is what the hash comparison caught.

## 3. Files I added and then deleted

All created by my scaffold, all removed — none of it is left on disk:

```
src/ds/                  (converted _ds_bundle.js + typed facade)
src/domain/              (types.ts, screens.ts)
src/layout/              (AppHeader.tsx, NotificationPanel.tsx)
src/screens/             (13 placeholder screen modules)
src/store/appStore.ts    (zustand store — the project uses React context)
src/styles/tokens/       (duplicate of src/styles/design-system/tokens/)
src/assets/fonts/        (duplicate of src/styles/design-system/assets/fonts/)
scripts/build-ds.mjs
tsconfig.app.json, tsconfig.node.json   (project uses a single standalone tsconfig.json)
eslint.config.js
```

Untouched and intact: `vite.config.ts`, `tsconfig.json`, `.prettierrc`,
`eslint.adherence.config.mjs`, `_adherence.oxlintrc.json`, `design-system-manifest.json`,
`package-lock.json`, `dist/`, and all of `src/components`, `src/features`, `src/data`,
`src/app`, `src/icons`, `src/tokens`, `src/styles/design-system`.

---

## 4. Dependency changes

**Net change: none.** `package.json` now matches `package-lock.json` exactly (verified).
`npm install` reported `up to date, audited 299 packages` — `node_modules` already
satisfied the lock, so nothing was installed or upgraded.

The pinned set, deliberately older than registry latest:

| Package | Pinned | Registry latest (2026-08-24) |
|---|---|---|
| react / react-dom | ^18.3.1 | 19.2.8 |
| react-router-dom | ^6.30.6 | 7.18.2 |
| vite | ^5.4.10 | 8.2.2 |
| @vitejs/plugin-react | ^4.3.3 | 6.1.0 |
| typescript | ^5.6.3 | 7.0.2 |
| eslint | ^9.39.5 | 10.9.0 |
| lucide-react | ^0.451.0 | 1.33.0 |
| playwright | ^1.62.1 | — |

I had temporarily swapped these for the latest versions plus `zustand`. That is reverted.
**Do not bump these casually:** React 18→19 and router 6→7 are breaking for this code, and
`zustand` is not used at all — state lives in `src/data/store.tsx`.

One genuine blocker if an upgrade is attempted later: `typescript-eslint` declares
`peerDependencies.typescript` as `>=4.8.4 <6.1.0`, so **TypeScript 7 cannot be used here
yet**. The ceiling is the TypeScript 6.0.x line.

### Install warnings seen (pre-existing, not blocking)

- `4 vulnerabilities (3 moderate, 1 high)` from `npm audit`. Not investigated — fixing
  them means version bumps, which is its own deliberate change.
- `npm warn allow-scripts esbuild@0.21.5 (postinstall)`. Harmless here: the platform
  binary is already present (`node_modules/@esbuild/*/esbuild.exe`) and `require('esbuild')`
  loads, so Vite runs. Approve with `npm approve-scripts esbuild` if the warning is unwanted.

---

## 5. Verification performed

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Exit 0, clean |
| `npx vite build` (temp `--outDir`, `dist/` untouched) | 1,635 modules transformed, built in ~3s |
| Built CSS vs `dist/assets/index-DcFH_zE_.css` | **Byte-identical** (same content hash) |
| Built JS vs `dist/assets/index-HT6W5oEp.js` | Structurally identical; +68 bytes (the null guard) |
| `GET /` | 200 |
| `GET /src/main.tsx`, `/src/App.tsx`, `/src/app/AppShell.tsx` | 200 each |
| `GET /src/styles/design-system/styles.css` | 200 |
| Vite log | No transform errors |

Pre-existing build warning, not caused by these changes:
`[vite:css] @import must precede all other statements` — the dead Google-Fonts `@import`
at the end of the vendored `tokens/fonts.css`. This is exactly what the comment in
`index.html` documents, and why Inter is delivered via `<link>` instead.

## 6. How to run

```bash
cd frontend
npm install       # optional — node_modules already satisfies the lock
npm run dev       # http://localhost:5173
```

Other scripts: `npm run build` (tsc + adherence lint + vite build), `npm run typecheck`,
`npm run tokens:gen`, `npm run tokens:check`, `npm run preview`.

---

## 7. Changes outside `frontend/` (additive only, nothing overwritten)

Imported from the Claude Design project **Kia N-PQMS V4-V5**, extracted from
`Kia N-PQMS V4-V5.zip`:

- `docs/ux-prototype/ism-qir-se-role/` — the full prototype: `ISM + QIR SE Role - P_C.dc.html`
  (1.84 MB — 810 KB template + 1.02 MB of logic), the `ISM SEM Role` variant, the 6.8 MB
  standalone offline export, `support.js` (dc-runtime), `lucide-local.js`, the complete
  `_ds/` design system including the three ~2.9 MB `KiaSignatureFix` TTFs, and
  `IMPORT-STATUS.md`.
- `_bmad-output/planning-artifacts/ism-qir-se-role/` — the page specification, the SE-role
  BRD, and the design project's export requirements.

Note on the MCP: `claude_design`'s `get_file` caps reads at 256 KiB and reports
`truncated: true` rather than erroring. The prototype, the standalone export and the fonts
all exceed it, which is why the zip was needed. Screenshots and uploads were left inside
the zip rather than extracted.
