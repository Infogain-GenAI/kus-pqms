# UI Fidelity Report — app vs UX prototype (`PQMS_SE.html`)

**Date:** 2026-08-22 · **Method:** Playwright screenshot loop (`scripts/fidelity-capture.mjs`, 1280×900) — prototype (`ux/design-source/exports/pqms-bundled-page-2026-08-16/PQMS_SE.html`, navigated via its own UI) vs the app (`vite preview`), compared screen-by-screen, fixed, re-captured. Captures in `.fidelity/` (gitignored).

## Verdict
**Aligned.** After two iterations every in-scope screen mirrors the prototype's layout, structure and density. Remaining deltas are the **documented carve-outs** below (tokens-canonical rule + scope exclusions), not misalignments.

## Iteration log

**Round 1 (initial capture) — structural misalignments found and fixed:**
1. **App chrome (biggest):** prototype uses a **white 60px top bar with horizontal nav** (Overview · Issue Management · QIR · TSB · help/bell/avatar) — **no side nav**. Rebuilt `AppShell` accordingly (SideNav component remains in the library); QIR/TSB items present but disabled (out of scope). Role switcher moved into an avatar popover (demo harness).
2. **Breadcrumbs:** every screen gets the prototype's crumb row (back circle + `Section › Page`).
3. **Dashboard:** greeting subtitle row (+role chip, last-login), 3 module cards with icon chips + arrow + bordered stat mini-boxes, action items with All/Pending/Overdue tabs + accent bars + ISSUE badge/mono-ID meta + "↗ Open" buttons, attention items with ISSUE/ID/tag chips + days-open + chevrons.
4. **Issue List:** KPI cards restyled (icon chip + % pill + uppercase label); **My Issues / All Issues** underline tabs with count pills; search + **Filter** (collapsible panel) + **Columns** (visibility popover) on the right; table header band ("Showing X of Y…"); default columns changed to **Issue ID · Title · Relationship · Model Code · Classification (2-line) · Status · Issue Date** (sort: Issue Date desc).
5. **Issue Workspace:** header card (mono ID + tinted StatusBadge + EWS tag, display title, outlined meta chips, owner block, **Edit issue / Change status / Create QIR** actions); **dark pill tab bar with icons**; detail tab as sectioned cards (**Vehicle information** mini-table, **System classification** 4-col, **Basic issue information**, **Issue source**) + **Related linked issue** rail (count badge, Manage Related Issues); **Investigation = Activities|Part Requests sub-tabs** (add-activity form + timeline; parts under Investigation per the prototype, superseding the earlier `_tabAlias` reading); **Resolution** = Disposition + Related QIR cards with prototype-style empty states; **Communication** = Internal/External toggle + toolbar + "immutable" note + dark Post; **History** = All/Lifecycle/Audit-Log toggle + search + date + grouped icon-chip entries with LIFECYCLE/AUDIT LOG tags. Status changes via **Change status modal** (propose→pending for SE; direct+justification for ASM/PQM); **Create QIR modal** = the in-scope hand-off (→ Escalated).
6. **Create Issue:** prototype card flow — Vehicle Information (model code gates everything), System Classification with **PATH tint bar** + info line + **Request New** (→ approval queue, non-blocking) + dependent selects with the prototype's exact placeholders, Issue Information (exact placeholder copy) + source chip row; header actions **Clear / Register Issue**.
7. **Notifications/Admin:** breadcrumb treatment (prototype's notifications page is blank; the app keeps its functional feed).

**Round 2 (re-capture):** all screens verified structurally aligned; no further fixes required.

## Documented carve-outs (intentional, per the approved plan)
- **Tokens win on color/radius/type:** app bg `#FAFBFC` (`--bg-app`) vs prototype literal `#F6F8FA`; text `#1A1A1A` vs `#1A2430`; card radius 12px (`--radius-xl`) vs prototype ~13–16px; button/input radius 6px vs ~8–9px.
- **Scope exclusions:** severity chips (HIGH/CRITICAL) in prototype lists → canonical **StatusBadge** (scoring out of scope); QIR/TSB nav + screens → disabled nav items + the Escalated hand-off only; prototype's QIR-flavored status labels (Investigating/QIR/Top Issue/NASO) → the audited 8-status canonical set.
- **Data differs by design:** the app renders its own deterministic seed; comparison targets layout/structure/density, not sample records.
- Minor: activity-type taxonomy uses the ISM-scoped list (no "PQ Evaluation" QIR types); "Request New" implemented for classification (per EXPERIENCE.md) — the activity-type variant was omitted.

## Round 3 — full-window pass (1920×1080), 2026-08-22

The harness now takes a viewport (`node scripts/fidelity-capture.mjs both 1920 1080`; files suffixed `@1920`). Comparing at full window exposed — and fixed — what 1280 could not:

1. **Fluid container (the big one):** the prototype is NOT centered at 1200 — it's fluid to **max-width ≈1800 with 40px side padding** (≈1720 content at 1920; 1280−80=1200 at 1280, which is why the old cap *looked* right). `PageContainer` now uses 1800/40, and the **header content sits on the same rail** so logo/nav/breadcrumb/cards align at every width.
2. **Workspace right rail:** fixed **340px** (was fluid `1fr`, ballooning to ~560 at 1920).
3. **Issue source card:** prototype shows a subtitle, an **"Add / edit sources"** action (wired to the existing Edit gate), and a **collapsible per-channel evidence sub-card** — added (`Issue.sourceEvidence`, seeded for the warranty hero issue).
4. **List pagination:** moved **inside the table card's footer band** — "Showing X–Y of Z issues · Rows: [20/50/100]" left, pager right.
5. **Dashboard polish:** white stat mini-boxes; Lifecycle health subtitle "Issue progression" + big status-colored counts; Recently accessed subtitle + View all + richer rows (ISSUE chip, id/title stack, status + date + chevron).

Verified at **1920 and 1280** (regression) after the fixes — both widths mirror the prototype; the 1280 layout is unchanged by the container cap (only the header joined the rail, which matches the prototype there too).

## Round 4 — LIVE `.dc.html` prototype as ground truth (2026-08-22)

Per Vijay's ask, the comparison target moved from the flattened `PQMS_SE.html` export to the **live design prototype itself** — `ISM + QIR SE Role - P:C.dc.html` (the file behind claude.ai/design `?present=1`), rendered locally with its own runtime (`scripts/dc-compare.mjs`: serves `exports/kia-npqms-v4-v5/` on :8123, dev app on :5173, captures both). Our copy is the 2026-08-16 project export — the newest obtainable (the file exceeds the design API's 256 KiB read cap).

**The live prototype disagreed with its own flattened export in three places — all fixed:**
1. **No Relationship column by default** (available via Columns chooser) — export had it visible.
2. **6th KPI is CLOSED** (green) — export said RESOLVED; we'd said Disposed.
3. **Column skeleton:** title fixed ≈380px; Model Code/Classification/Status/Issue Date are width-less and share remaining space equally → `table-layout: fixed` on DataTable + width-less tail columns. Dev now sits within a few px of the live prototype at 1920 (Model Code ≈672, Classification ≈960, Status ≈1250, Date ≈1540) and regresses clean at 1280.

Captures: `dc-home/dc-list/dev-list@{1920,1280}.png`. Side-by-side check in Chrome: `node scripts/dc-compare.mjs` needs `python -m http.server 8123 --directory <exports/kia-npqms-v4-v5>` + `npm run dev`, then open `http://127.0.0.1:8123/ISM%20%2B%20QIR%20SE%20Role%20-%20P-C.dc.html` vs `http://localhost:5173/issues`.

## Round 5 — mock data mirrored from the live prototype (2026-08-23)

`scripts/extract-dc-data.mjs` scrapes the live prototype's rendered Issue List (both tabs, all pages → `.fidelity/dc-data.json`). The seed now carries the prototype's own dataset: the **7 "My Issues" + 21 more All-Issues rows** verbatim (ids, titles, model codes incl. "2/3 Models" multi-model cells, two-line classifications, dates), hero issue **HV-260101** with the prototype's workspace facts (charge-port description, MY2026, no DTC codes, Warranty evidence 43/3.9 per 1,000/36 mo–36k mi/$2,700/KR·Domestic, empty comms/activities/parts, the 8-entry creation history), and a **6-unread bell badge**. Create-screen model codes re-mapped to the prototype's code space (SV/CV/LQ/VG/YD/NQ/DL/KH/KA/BD).

**Documented deltas (intentional):**
- Canonical statuses (carve-out): Investigating→In Review; QIR & Top Issue→Escalated; NASO→Disposed · No Action — so the KPI strip shows Pending 0 / Escalated 2 where the prototype splits QIR 1 / Top Issue 1.
- Our list is **actually** sorted by Issue Date desc; the prototype's header claims that sort but renders dataset order (a prototype quirk we chose not to replicate).
- All-Issues count 28 vs the prototype badge's 33 — 5 rows were unreachable in the scrape (pagination), and the badge may count QIR records.
- The prototype's own list (SV) and its flattened-export workspace (LQ) disagree on HV-260101's model code; we follow the **live list (SV)**.

## Round 6 — literal source extraction supersedes DOM-scraping (2026-08-23)

Per Vijay's ask to "match labels and values as per latest export i.e kia-npqms-v4-v5," Round 5's DOM-scrape (`extract-dc-data.mjs`, rendered-output only, missed paginated/off-screen rows) was superseded by reading the `.dc.html` source's own executable class methods directly — `seedIssues()`, `_seedIssuesNorm()`, `ovClassify()`, `issueMDY()` — as ground truth instead of their rendered approximation.

1. **33 rows, not 28.** The literal `seedIssues()` array has 33 entries (12 numbered + 9 parent/child cohort + 6 lifecycle-demo + 6 lifecycle-stage-showcase); `seed.ts` now carries all 33 verbatim (ids, titles, models, systems, owners, dates), closing Round 5's "28 vs 33" gap.
2. **`owner` ≠ `assignee` is real, not scrape noise.** `_seedIssuesNorm()` computes `assignee`/`assigneeRole` from the raw pre-override `owner`/`ownerRole` *first*, then a `CREATOR` map overrides `owner`/`ownerRole` afterward — so a handful of rows (e.g. PT-260015 → owner "Mia Chen", assignee "Lee Jun-ho") legitimately carry two different people. Verified end-to-end: the Issue List's optional "Owner" column (`assignee ?? owner`) correctly surfaces the assignee when toggled on.
3. **Classification via `ovClassify()`'s 16-entry MAP** (system/subSystem/component/symptom/detail per raw `system` key, with fallback logic) replaced inferred classifications.
4. **Create Issue's Model Code field now sources `MC_MASTER` verbatim** (literal code/name/year-range rows), not an inferred list.
5. **Date bug found and fixed (self-caught via the fidelity loop, not a scrape error):** a prior pass had set 6 rows with relative `created` labels (`'Today'`/`'Yesterday'`/`'2h ago'`) to **August 2026** dates, and the app's own `NOW` anchor (`data/types.ts`) to `2026-08-22`. Re-reading the source's `issueMDY()` showed relative labels resolve against `_todayBase(){ return new Date(2026,6,9); }` — a **hardcoded July 9, 2026** anchor, explicitly fixed in the source so demo dates never drift. Corrected: `NOW` → `2026-07-09T09:00:00Z`; `EE-260013`/`PT-260014`/`IN-260016`/`HV-260101` (`'Today'`) → `2026-07-09`; `PT-260015`/`SU-260017` (`'Yesterday'`) → `2026-07-08`; the `AUDIT` array's `T` template → `2026-07-09`; and the 6 `NOTIFICATIONS` timestamps (which the wrong `NOW` had pushed into the future) rebalanced to `2026-07-07`–`2026-07-09`, all ≤ `NOW` and none preceding the issue each one references. Re-verified against a fresh `dc-compare.mjs` capture: HV-260101/PT-260014/IN-260016 now read **07/09/2026** and PT-260015/SU-260017 **07/08/2026** in both the live prototype and the app, row-for-row identical.
6. **Confirmed still-open, deliberately not touched:** the QIR-flavored status vocabulary (Investigating/Top Issue/QIR/NASO) remains mapped to the canonical 8-status set per the Phase 1 decision (not a bug); the Issue List's Model Code column shows model **names** where the live prototype shows literal codes/"N Models" aggregates for multi-model rows — tied to the out-of-scope `ISSUE_MULTI` multi-select feature, flagged for awareness only.

## Round 7 — Overview icon fixes + full Issue Management sweep (2026-08-23)

Per Vijay's ask to match "labels and values, icons, font etc as per latest export" for Overview, then verify the complete Issue Management surface (List/Create/Workspace + 5 tabs + 4 modals) against the same `kia-npqms-v4-v5` `.dc.html`. `scripts/dc-compare.mjs` extended to also drive the Workspace's 4 non-default tabs and Create Issue (`dc-ws-{investigation,resolution,communication,history}`, `dc-create`), not just List/Detail.

**Overview/Dashboard (icon-level, pre-existing gaps closed):** `roleChip` icon, `lastLogin` clock icon, and the action-items empty-state icon corrected against the live prototype's `homeVals()`; remaining Overview icons/colors re-verified clean.

**Issue Management sweep — 5 parallel agents covered List/Create/Workspace×5 tabs; findings reconciled against source and a full visual re-pass:**
1. **`--text-muted` used where source says `--text-disabled` (the cross-cutting one).** Statistical survey of the `.dc.html`'s repeated label idiom (`grep -o ... | sort | uniq -c`) confirmed the dominant uppercase-micro-label convention is `font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:#9AA5AE` (178 occurrences vs. 61 for the `0.05em` variant) — `#9AA5AE` is `--text-disabled`, not `--text-muted`. Fixed at the root: `chrome.tsx`'s `fieldLabel` (used by every `ULabel`/form-label site) and `CardHead`'s subtitle; `Select.tsx`'s chevron (source idiom `color:#9AA5AE;pointer-events:none`, 23 occurrences). `fieldLabel` weight also corrected `var(--fw-semibold)`→`var(--fw-bold)` and letter-spacing `0.05em`→`0.04em` to match the dominant source value. Redundant now-dead local style overrides that had been duct-taped onto individual `ULabel`s in `IssueWorkspaceScreen.tsx` (5 call sites) were stripped back to bare `<ULabel>`.
2. **`TagChip` uppercase transform — two genuine source idioms, not one.** Visual re-check (`dc-ws-resolution` vs `dev-ws-resolution`) showed Disposition/Related-QIR pills ("None yet", "Not linked") rendering ALL-CAPS in the app but sentence-case in the prototype. Traced to the `.dc.html`'s `_segDefs`/`statusStyle` builder (`color:${d.sColor};background:${d.sBg}`, no `text-transform`) — a **big rounded pill** idiom (radius 20px, padding 3–10px, font-size 11px), distinct from the **small uppercase tag** idiom `TagChip` was originally built from (History's `catLabel`: radius 5px, padding 2–7px, font-size 10px, `letter-spacing:0.03em;text-transform:uppercase`) which correctly describes "EWS flagged", the file-count chip, and the History Lifecycle/Audit-Log badges. `TagChip` default kept as-is (uppercase); added a `style` passthrough prop and opted out only the two confirmed sentence-case call sites (`IssueWorkspaceScreen.tsx` Disposition + Related-QIR pills, `style={{ textTransform: 'none' }}`).
3. **History tab: "AUDIT LOG" badge had no color (fell back to `TagChip`'s neutral gray).** `classify()`'s call site only special-cased the `LIFECYCLE` branch (`var(--success-50)`/`var(--success-600)`); the `.dc.html`'s literal `catStyle` string (`color:${isAudit?'#6B4EDB':'#1F8A5B'};background:${isAudit?'#EEEBFB':'#E7F6EF'}`) shows Audit Log entries in **purple**, not gray. Fixed the `TagChip` fill (kept the per-row `IconChip` gray/green binary as-is — source's icon-chip `dotStyle` uses independent per-entry data (`e.tint`/`e.color`) not tied to the audit/lifecycle split, so there's no single correct icon color to derive without a data-model change that scope excludes). Re-verified against a populated issue (`HV-260101`, the same id the prototype seeds) — badge colors now match row-for-row.
4. Coherence of the 5 agents' concurrent edits verified via `tsc --noEmit` (repo's `noUnusedLocals`/`noUnusedParameters: true` catches orphaned imports from any partially-merged edit) plus direct reads of the shared import blocks — no `frontend/` git baseline exists to diff against (untracked), so this was the available substitute.

**Newly observed, deliberately not touched (structural, outside icon/label/font scope):** Create Issue always shows a "Model Year" field slot beside Model Code (disabled until a code is picked); the live prototype only reveals Model Year after Model Code is chosen. A layout/conditional-rendering difference, not a token/icon/label mismatch — flagged for awareness only.

## Round 8 — full-surface sync per `docs/ui-ux-fidelity-sync-prompt-v2.md` (2026-08-23)

Executes the v2 sync prompt (titled "Round 7" there — drafted before this file's Round 7 landed). Three scope
defaults signed at kickoff: **(a)** AdminScreen verifies against the SE P-C prototype's own admin screen only —
the standalone `Admin Module Prototype.dc.html` is excluded; **(b)** SEM/ASM sibling prototypes are out of scope
(SE Role P-C stays the sole ground truth; the role switcher remains a dev harness affordance); **(c)** declared
viewport range is **1280–1920**, fidelity-verified at the 1280/1600/1920 checkpoints.

### Round 6 open items — resolved
1. **Model Code column now shows literal codes / "N Models".** Root cause was data, not display: `seed.ts` stuffed
   the model *name* into `modelCode`. Ported the export's own `MODEL_CODE` name→code map verbatim (mk() now throws
   on an unmapped model) and populated `modelCodes` arrays for the 9 `ISSUE_MULTI` multi-model rows in MC_MASTER
   order. My-Issues renders exactly the prototype's cells: `SV · VG · 3 Models · YD · YD · 2 Models · 2 Models`.
   The cell's hover popover (code list) and group-contributed `+N Models` extras stay open — see register.
2. **List sort carve-out re-confirmed.** App sorts genuinely by Issue Date desc; the prototype's header still
   claims `ISSUE DATE ↓` but renders dataset order (visible in `dc-list@1600`). Round 5's "match the intent, not
   the bug" decision stands.
3. **Date-anchor regression assertion added** (`src/data/assertSeed.ts`, invoked at `store.tsx` module init — runs
   on every dev boot, preview build and Playwright capture). Asserts `NOW === 2026-07-09T09:00:00Z`, the six
   anchor-pinned rows (HV-260101/EE-260013/PT-260014/IN-260016 → 07/09; PT-260015/SU-260017 → 07/08), every
   notification ≤ NOW, and no notification predating the issue it references.

### Adherence ruleset wired into the build
`_adherence.oxlintrc.json` vendored byte-verbatim (only its parse-blocking `x-omelette` metadata stripped) and
executed on every `npm run build` via `eslint.adherence.config.mjs`. **ESLint is the runner because oxlint (1.79)
cannot execute `no-restricted-syntax`** — the rule family carrying the ruleset's substance (raw-hex/px/font nudges
+ per-component prop contracts). The wrapper adds `@/`-alias twins to the barrel-import patterns so the rule
protects this repo's import style; 13 feature/data imports rerouted through the `@/components` barrel and 2
intra-component imports made relative. Result: **0 errors · 615 advisory warnings** (raw hex, raw px, and
prop-contract selectors that omit DOM/handler props by design), ratcheted via `--max-warnings 615` so new
violations fail the build. `tokens:gen`/`tokens:check` 156/156; brand font verified genuinely loaded (Kia
Signature Fix 700 active on display text; 300/400 bundled-but-unrequested — every display usage is bold, so
"unloaded" is lazy-loading, not a fallback).

### Notifications — panel built, content adopted verbatim
The app had **no bell dropdown** (bell navigated straight to the page). Built the prototype's 380px panel in
`AppShell.tsx`: header `Notifications` + red `{n} new` pill + `Mark all read`, five rows (34px tinted icon chip,
9px uppercase category, title, mono issue id + MDY date, unread dot + 2px category-colored left border on
`--neutral-25`), footer `View all notifications →`. Notification model replaced with the export's `NOTIFS()`
verbatim: taxonomy `Critical / Warning / Action Required / Information` (catMeta token-bound: danger/warning/info
pairs + `--status-disposed`; Information tint `#E2F4F2` has no token), six entries `Issue requires review
EE-260001 · EWS alert needs disposition CL-260003 · Investigation update pending EE-260001 · QIR action is overdue
BD-260006 · Disposition approval pending ST-260002 · TSB publication completed AC-260004`, times as absolute
instants (8 min/1 h/2 h/3 h/5 h before NOW; Yesterday) matching `fmtStamp`'s rendered MDY dates. The
**Notifications page stays app-only by signed carve-out**: `showNotifications` appears nowhere in the prototype's
template — the screen is authored-empty (verified `dc-notifications@1600`), and the app keeps its
EXPERIENCE.md-documented feed.

### Admin — first-ever comparison, screen rebuilt
The SE prototype's admin screen is unreachable through its own nav (its `adminMenuItems` vals are dead code — no
template references), so `dc-compare.mjs` now self-generates `_boot-admin.dc.html` (constructor patched to boot
`screen:'admin'`) and captures `dc-admin`. `AdminScreen.tsx` rebuilt to the prototype's five sections: header +
LAST CONFIGURATION UPDATE card · 4 KPIs · Scheduled batch jobs table (4 rows verbatim, per-status chips, Run now)
· Issue reminder configuration (3 cards) · Issue source configuration (7 channels, FPQR disabled + amber note) ·
Configuration audit history (5 rows verbatim — "Updated scoring weight" kept as display data, not a scoring
feature) · Classification management (10/25/35/43 stats, tree, empty state, recent changes). Verified against
`dc-admin-full@1600` / `dev-admin-full@1600`.

### List overlays — drawers built to the prototype
The app's inline filter strip and columns popover were **not** the UX: both are 452px right-side drawers. Built
per template (scrim `rgba(5,20,31,.34)`, icon-chip header + subtitle, pinned footer):
- **Filters** ("Refine the issue list"): Vehicle (Model Code, Model Year) · Classification (System, Sub-System,
  Component, Symptom) · Issue (Status, Source, Owner, Issue Grouping [Grouped/Ungrouped issues], Issue Date
  start–to–end, and the segmented rows Days open [All/≤7d/8–21d/>21d], Linked issues [All/Yes/No], EWS flag
  [All/Yes/No]) — draft state, `Reset` + `Apply` exactly like the prototype. All fields filter live data.
- **Columns** ("Show or hide columns in this list"): Issue ID/Issue Title `REQUIRED`, four toggleable defaults,
  optional set aligned to the prototype — **Source, Component, Symptom, DTC / Trouble Code, Owner, Days** (all six
  implemented as real columns) — `Select all`, `Restore default`, `Apply`. The app-only **Relationship column was
  removed** (the prototype's template renders none).

### Workspace overlays — retrofits
- **Change status**: subtitle "A valid reason is required for every status change." adopted; primary is now
  constantly `Save status change` (the SE propose flow still submits as Pending Approval; the role note below the
  textarea stays as an app-only clarification).
- **Manage Related Issues**: converted to the prototype's **batch model** — edits are a local draft, footer is
  `Cancel` + `Save changes` (disabled until dirty), so the adopted subtitle "Review, unlink, and link Parent/Child
  issues. All changes apply together on Save." is literally true.
- **Add / edit sources**: no longer opens the Edit modal — it is the prototype's **inline edit mode** on the Issue
  source card (`Cancel` + `✓ Save sources` in the card head; selectable channel cards with the export's verbatim
  subtitles `Field claims & cost / Reliability model / Repeat repairs / Dealer inquiry / Field PQ report / Early
  warning / Global QI`). Selection persists via `store.updateIssue` (patch type extended with `source`).
- **Create QIR** is a navigation into the QIR module's New QIR screen in the prototype — binding carve-out; the
  app keeps the hand-off modal (issue → Escalated, read-only QIR reference).

### Character-exact string adoptions (from a 231-string source-vs-app inventory: 128 match · 40 mismatch · 12 carve-out)
List: `Search by keyword...` (three ASCII dots) · empty-state "Clear filters to see all issues in the queue." ·
KPI 1 label now scope-dependent `My Issues`/`All Issues` · bulk bar `{n} Issue(s) Selected / Change Status /
Assign to role / Export XLSX`. Create: cascade placeholders `Search system… (e.g. “Bat”, “Electrical”)` /
`Search sub-system…` / `Search component…` / `Search symptom…` · card `Same Existing Issues` + subtitle + empty
copy · modal `Request New Classification` / body "Submit a request. Once approved, it will be added." /
`Submit Request` · title error `Enter an issue title.` Workspace: source empty-state "No source channels recorded
for this issue yet. Select **Add / edit sources** to capture where it originated." · History group buckets now
`Today / Yesterday / Last week / Older` resolved against NOW (was real-clock "TODAY", a latent bug — with the
Jul-9 anchor nothing ever grouped as today). Dashboard: action-items tab `Due today` (+ its empty copy). Header:
top-nav idle color `--text-muted` and active underline `--accent-500` (was kia-midnight — the template says
`var(--accent-500)`); role chips `ASM · Area Service Mgr` / `PQM · Product Quality` per the USERS literals;
notifications-page badge `{n} new`.

### Deviation register (new deltas vs binding carve-outs)
| # | Item | Class | Disposition / owner |
|---|---|---|---|
| 1 | Edit issue → full **Edit Issue screen** in proto (model-code/year table, PATH pills, Same Existing Issues linking); app uses a modal | New structural delta | Registered; propose dedicated screen in a future round (app/build) |
| 2 | Create Issue **Model year(s) per model code** table + multi-code select; app has single code + year | New structural delta (extends Round 7's Model-Year note) | Registered with #1's Edit-screen work (app/build) |
| 3 | Model-code cell **hover popover** + group-contributed `+N Models`; multi-channel sources per issue | Tied to ISSUE_MULTI / issue-group machinery | Registered; single-source & own-codes shipped (app/build) |
| 4 | Proto list **row grouping** (parents with expandable children; 33 rows → 28 top-level) | New structural delta | Registered; app renders flat 33 (app/build) |
| 5 | Filters drawer uses **multi-select checkbox menus with search**; app ships single-select Selects; native date inputs vs SingleDatePicker | Simplification | Registered (app/build) |
| 6 | Activity types `PQ Evaluation / Dealer Investigation / Joint Investigation` | **Binding carve-out** (ISM-scoped taxonomy; no QIR types) | Do not adopt |
| 7 | Approval bar `Pending your approval / Approve disposition` | App's generic propose→approve copy retained | Registered (app-only phrasing) |
| 8 | `LIFECYCLE/AUDIT LOG/PATH/RELATED LINKED ISSUE` literal-vs-CSS-case; `Today · 07:42` vs rendered date | Render-identical | No change, by prior convention |
| 9 | Notifications page (proto authored-empty) · QIR/TSB modules · canonical 8-status · severity chips · dashboard module cards | **Binding carve-outs** | Unchanged |
| 10 | Proto workspace header date chip shows `01/01/2026` for HV-260101 | Proto data quirk (app shows the issue's real 07/09/2026) | Match-the-intent precedent (Round 3) |
| 11 | Sibling roles (SEM/ASM) + standalone Admin Module prototype | **Signed exclusions (this round)** | Future rounds if requested |

## Gates at close
- `tsc --noEmit` clean · `npm run build` clean (tsc → adherence lint 0 errors/615 warnings ratcheted → vite) ·
  token-diff gate **156/156** · seed anchor assertion active on every boot · brand-font load verified.
- Coverage: 6 screens + 5 workspace tabs + Create + **notification panel + notifications page + Admin (full-page)
  + Filters/Columns drawers + Change-status/Manage-Related/Request-New modals + sources edit-mode** all captured
  `dc-` vs `dev-` at 1600; notifpanel/filter-drawer/list regression-shot at 1280 and 1920; declared range
  1280–1920.
- `scripts/dc-compare.mjs` now covers all of the above (self-generates `_boot-admin.dc.html` for the admin
  capture) — a full run is **14 dc + 12 dev captures, all green**.

**Re-run:** `npm run build && npm run preview -- --port 4173 & node scripts/fidelity-capture.mjs both [width] [height]`; live-prototype diff via `node scripts/dc-compare.mjs [width] [height]` (screens + workspace tabs + Create + notifications + drawers + modals + admin).

## Round 9 — prototype status vocabulary adopted everywhere (2026-08-23, user-directed)

Vijay's directive: the Issue List KPI values (and every status value on every interface) must match the UX
prototype — this **supersedes the Phase-1 "canonical 8-status" decision** and retires that binding carve-out.

**Why the mismatch existed (investigation).** Phase 1 (2026-08-22) hit a conflict between the prototype's
inline STATUS map and DESIGN.md's token-verified 8-status lifecycle, and resolved it toward the tokens
(ALIGNMENT-AUDIT Option A). Source re-read this round shows the prototype's model is **7 statuses** whose KEYS
largely match the app's — the divergence was labels plus two merged statuses:
`open:'Open' · review:'Investigating' · monitoring:'Monitoring' · escalated:'QIR' #D97706 ·
topissue:'Top Issue' #D92D20 · outofscope:'NASO' #8B5A2B · closed:'Closed'`. The app had relabeled
review→"In Review" and escalated→"Escalated", merged topissue→escalated and outofscope→"Disposed · No Action",
and added draft/pending/disposed that the prototype does not have. Per-row extraction of all 33 seeded issues
confirmed the app's statuses differed from source in **exactly two rows**: ST-260002 (raw `topissue`) and
BD-260012 (raw `outofscope`).

**Changes.**
1. `statusMap.ts`: 7-key prototype vocabulary, map order = the prototype's; colors token-bound where hex-equal
   (open/review/monitoring/closed + Top Issue = `--danger-500`); QIR `#D97706` and NASO `#8B5A2B` literal.
2. `seed.ts`: ST-260002 → `topissue`, BD-260012 → `outofscope` (raw source statuses restored); mapping note in
   the header comment updated.
3. Flows (`store.tsx`): proposals **no longer change the visible status** — `proposedStatus`/rationale/by drive
   the ApprovalBar until an override role decides (the prototype has no "Pending Approval" status); reject just
   clears the proposal; closedAt now set for closed/outofscope; new issues register as `open` (no draft);
   startInvestigation audit text "Open → Investigating".
4. Issue List KPIs = the prototype's kpiDefs verbatim: My/All Issues (layers) · Open (folder-open) ·
   Investigating (search, #7C5CDB) · QIR (triangle-alert, #D97706) · Top Issue (flame, #D92D20) · Closed
   (circle-check). Verified against `dc-list@1600`: labels, counts 7/1/2/1/1/0 and pills 14%/29%/14%/14%/0%
   all match.
5. Change-status modal: options = the 7-status map minus current (placeholder `Select status…`); the disposition
   Outcome select is gone — NASO *is* the no-action disposition and keeps the ≥30-char justification gate;
   monitoring/outofscope record their outcome metadata automatically.
6. Dashboard: Issue Management card → Open/Investigating/QIR; Monitoring & disposition → Monitoring/NASO/Closed;
   Risk signals → Top Issue/EWS-flagged/Overdue; action items gate on live proposals; **Lifecycle health rebuilt
   as the prototype's five stages** (Open · Investigation · Review · QIR · Closed, square 10px dots, dotted
   connectors, display-font values in stage colors).
7. Status components' defaults draft→open; filters drawer / bulk bar options follow the map automatically.

**Gates:** `tsc --noEmit` clean · build green (adherence ratchet consciously re-pinned 615→623 for the eight
new prototype-literal hexes — the ratchet correctly failed the build first) · tokens 156/156 · seed anchor
assertion unaffected. Register updates: the "canonical 8-status" carve-out is **retired**; Days-column values
remain computed from dates vs the prototype's literal ages (existing nuance, unchanged).
