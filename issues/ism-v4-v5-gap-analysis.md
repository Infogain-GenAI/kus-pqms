# ISM gap analysis — app vs latest V4–V5 prototype

Date: 2026-08-24 · Scope: **ISM module only** (QIR/TSB screens do not exist in the app and stay out of scope)

## Method

The app was already aligned to a V4–V5 export (`FIDELITY-REPORT.md`, 2026-08-22, verdict
"Aligned"), and a 2026-08-23 directive had already adopted the prototype's status
vocabulary verbatim (`Open · Investigating · Monitoring · QIR · Top Issue · NASO · Closed`),
superseding the earlier canonical-8-status decision. So this was **not** a from-scratch
comparison. The question was narrower and answerable exactly: *what changed between the
V4–V5 export the app was built against and the one in the new zip?*

| | Bytes |
|---|---|
| `_bmad-output/.../exports/kia-npqms-v4-v5/ISM + QIR SE Role - P-C.dc.html` (in repo, Aug 22) | 1,816,882 |
| `docs/ux-prototype/ism-qir-se-role/ISM + QIR SE Role - P_C.dc.html` (new zip, Aug 24) | 1,837,340 |
| **Delta** | **+20,458** |

Split and diffed the two `.dc.html` files into their `<x-dc>` template and
`<script data-dc-script>` halves: template **+6,243 bytes** (28 hunks), logic
**+14,172 bytes** (34 hunks). Every gap below is traced to a specific hunk, so this list is
exhaustive for the delta rather than a judgement call about what "looks different".

---

## Gaps found

### 1. Issue Priority tab — the headline change · **IMPLEMENTED**

A whole new Issue Workspace tab, and by volume most of the delta.

- **New matrix** (`PRI_MATRIX`): 3 categories — Leading Indicator (6 items), Customer Voice
  (3), Modifier (8) — 17 items, each with 1–4 point options (1–3 pts).
- **Scoring:** selecting an option awards its points; re-selecting clears it. Total maps to
  a letter — **≥26 → A, ≥11 → B, else C** (note these thresholds differ from the QIR-side
  `ratingOf()` 70/40 bands; they are a separate scale).
- **Manual override** of the final letter, with the calculated letter still displayed and a
  reset affordance.
- **Draft/dirty model:** nothing persists until Save. An unsaved matrix still reads as
  unscored, and the reminder text differs for never-scored vs unsaved-changes.
- **Seeded pre-scored issues:** `BR-260104`, `EE-260001`, `PT-260103`, `AC-260004` — all four
  IDs verified present in the app's seed.
- **`selIdx` matters:** two options within an item can share a points value (e.g. Importance
  has *Safety/Regulatory* and *New Model* both at 3), so the selected **index** must be
  stored, not just the score, or the matrix restores the wrong chip.

### 2. QIR creation gated on priority · **IMPLEMENTED**

`createQirFromIssue()` now refuses to proceed unless the issue's priority is saved —
it switches to the Priority tab and warns instead. QIR then **inherits** the letter
(`_priorityInherited`), and any manual edit to the QIR's priority clears that flag.
Implemented as the ISM-side half: `canQir` now requires `priority.scored`, which disables
both Create QIR buttons. The QIR-side inheritance display is out of scope (no QIR screens).

### 3. Header priority chip · **IMPLEMENTED**

`wsPriorityScored` / `wsPriorityChipStyle` add a Priority chip to the workspace header,
shown only once scored — an unscored issue shows nothing rather than a default letter.

### 4. Navigation state hygiene — `_resetPageState()` · **NOT DONE**

New shared reset applied to `go()`, `openList()`, `goBack()`, `openIssue()` and `openQir()`:
navigating into a new context must not carry over edit/create/modal/drawer/tab state from
the page being left (~25 state keys: `editMode`, `form`, `attachments`, `drawer`,
`existingModal`, `assignOpen`, `dispChoice`, `priDraft`, …). Inverse change in the same
hunk: `go('create')` now *preserves* an in-progress create form instead of blanking it.

React Router gives the app some of this for free (screens unmount), but modal and edit state
held in `IssueWorkspaceScreen` / `IssueListScreen` local state should be audited against
this list. **This is the highest-value remaining item** — it is a bug-class fix, not cosmetics.

### 5. Model-code derivation correctness · **NOT DONE**

Two real bug fixes:
- `issueModelCodes()` no longer falls back to an **id-hashed pick** from `MC_MASTER`
  (which could attach model codes unrelated to the issue's actual vehicle). It now derives
  from the issue's own recorded model(s) via `modelCode()`.
- `rowModelCodes()` treats explicitly stored codes as **authoritative** and no longer mixes
  them with codes reverse-mapped from `ISSUE_MULTI`'s model list.
- `formFromIssue()` switched from `issueModelCodes()` to `rowModelCodes()`.

Needs checking against the app's `modelCodeLabel()` / seed `modelCodes`.

### 6. Model-year picker union · **NOT DONE**

Both the Issue Entry and QIR create year pickers now show
`union(MC_MASTER years, actually-recorded years)` so a real stored year outside a code's
nominal range still appears, checked, instead of silently vanishing. Affects
`CreateIssueScreen`.

### 7. Combobox chevron centring · **NOT DONE**

Six inlined copies of the caret style replaced by one `caretStyle(open)` helper, changing
`top:21px`/`top:22px` (height-dependent, so misaligned) to `top:50% / translateY(-50%)`.
Worth mirroring wherever the app renders a combobox caret.

### 8. Cosmetics · **NOT DONE**

- Investigation segmented control: active/inactive font-weight unified to 600 (was 700/500).
- Issue List KPI icons changed: QIR `triangle-alert` → `workflow`, Top Issue `flame` → `focus`.

### 9. QIR-module changes · **OUT OF SCOPE**

Recorded for completeness; the app has no QIR screens (nav item is deliberately disabled):
QIR workspace tabs renamed **QIR Detail → QIR Info** and **GQIS → GQIS Info**, and restyled
from dark pills to underline tabs; `qHead` gained a `date` alias.

---

## What was implemented

| File | Change |
|---|---|
| `src/data/priorityMatrix.ts` | **New.** `PRI_MATRIX`, bands, thresholds, score cap, helpers — ported verbatim |
| `src/data/types.ts` | **New** `IssuePriority` type; scope comment corrected (priority is now in scope) |
| `src/data/seed.ts` | **New** `PRIORITIES` — the four pre-scored issues |
| `src/data/store.tsx` | **New** slice: `priorityFor`, `priorityResult`, `savePriority` (+ audit entry) |
| `src/features/issues/PriorityTab.tsx` | **New.** The tab: matrix, score rail, final-priority override, rating bands |
| `src/features/issues/IssueWorkspaceScreen.tsx` | Tab registered between Investigation and Resolution; header chip; `canQir` gated |

Reuse over duplication, as required: the tab is built from the existing `SectionCard`,
`CardHead`, `ULabel`, `Button` and `Icon` primitives, priority persists through the existing
`StoreProvider` (no new store), and saving appends to the existing audit trail via
`appendAudit` so it shows up in the History tab for free. No new dependency was added.

`selIdx` is derived on read for seeded records, so the seed stays as terse as the
prototype's while the matrix still restores the correct chip.

### Verification

- `npx tsc --noEmit` — clean.
- `npm run build` (typecheck → adherence lint → vite build) — passes end to end.
- Dev server 200 for `/`, `PriorityTab.tsx`, `priorityMatrix.ts`; no transform errors.
- CSS output still hashes to `index-DcFH_zE_.css`, i.e. **no unintended style drift**.

### One judgement call to review

The adherence lint ratchet moved **623 → 638**. The 15 added warnings are:
Button `onClick`/`disabled` (the rule only knows `variant/size/loading/iconLeft/iconRight/fullWidth`,
so every existing `Button` with a handler warns too), and prototype-fidelity values with no
token — `#DDE3E9` control borders (already hard-coded in `AdminScreen.tsx`) and the Rating-B
hexes `#B8860B`/`#FBF0D9`, token-less exactly like the QIR orange and NASO brown already
documented in `statusMap.ts`. I removed every avoidable one first (18 → 15): spacing that
had real tokens, and `#fff` → `var(--surface-card)`. Raise the objection if the ceiling
should hold at 623 instead and the Rating-B band should snap to `--warning-*` tokens
(`#E2820B`/`#FDF3E2`) at the cost of exact prototype fidelity.

## Recommended next step

Item **4** (navigation state reset) — it is the only remaining item that fixes a bug class
rather than appearance, then **5** and **6**, which are also correctness. **7** and **8** are
cosmetic and can batch.
