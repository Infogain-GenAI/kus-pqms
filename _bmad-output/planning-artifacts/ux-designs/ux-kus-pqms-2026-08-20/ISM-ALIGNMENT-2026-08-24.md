# ISM alignment spec — Issue List · Issue Entry · Issue Detail

**Date:** 2026-08-24 · **Mode:** Update (spines exist, `status: final` since 2026-08-22)
**Ground truth:** `docs/ux-prototype/ism-qir-se-role/ISM + QIR SE Role - P_C.dc.html` — the
**complete** V4–V5 export (1,837,340 bytes: 810 KB `<x-dc>` template + 1,024 KB logic),
extracted from `Kia N-PQMS V4-V5.zip`.

> **Why this supersedes the prior sync.** `.memlog.md` records the V4–V5 pull as
> *"partial, 256KiB cap"* — the design MCP's `get_file` truncates at 256 KiB and reports
> `truncated: true` rather than failing. Every behavioural claim in this document is read
> from the complete file, so where it contradicts an earlier artifact, this wins.

Each area below states **prototype behaviour** (with the method/state that proves it),
**app today**, and **the delta**. Nothing here is invented; where the prototype is silent
it says so.

---

## 1. Row selection → bulk action bar

**Prototype.** Selecting rows raises a bar offering exactly three actions plus a clear:

| Action | Method | Behaviour |
|---|---|---|
| Assign | `bulkAssign(role)` | Assigns all selected to a role; toast `"{n} issues assigned to {role}."` |
| Change status | `openBulkStatusModal()` → `submitBulkStatus()` | Opens a **modal**. Two-stage validation: no target → *"Select a new status before updating."*; empty reason → *"Enter a reason for this status change."* Toast `"{n} issues moved to {label}."` |
| Export | `bulkExport()` | Toast `"Exporting {n} selected issues to XLSX."` |
| Clear | `clearSel()` | Resets `selectedRows` **and** `bulkMenu` |

Menu state is a single `bulkMenu` key (`toggleBulkMenu(name)`), so opening one closes the
other. Every action clears the selection on success. The status picker inside the modal is a
custom dropdown (`bsSelOpen`/`bsSelOpts`/`pickBulkStatusTo`) with a per-status colour dot,
not a native `<select>`.

**App today.** `IssueListScreen` renders a light accent-tinted bar (`--selected-bg` /
`--accent-100`) **above the table**, with the target and reason inline. It has *Change status*
only — no Assign, no Export, no `bulkMenu`.

**Visual, read from the template.** Your description was right — it is a floating dark pill,
centred at the viewport bottom:

| Element | Spec |
|---|---|
| Bar | `position:fixed; left:50%; bottom:30px; transform:translateX(-50%); z-index:150`; `background: var(--kia-midnight)`; `border:1px solid rgba(255,255,255,.08)`; `border-radius:16px`; `padding:8px 10px`; `box-shadow:0 18px 44px rgba(5,20,31,.34)` |
| Count badge | circular — `min-width:28px; height:28px; border-radius:50%`; white fill, `var(--kia-midnight)` text, 13.5px/700 |
| Action button | `height:40px; padding:0 15px; border-radius:10px; background:none; color:#fff; font-size:14.5px; font-weight:600` |
| Divider | `width:1px; height:26px; background:rgba(255,255,255,.16)` |
| Action menu | opens **upward**: `position:absolute; bottom:calc(100% + 12px); left:0; z-index:160; width:210px`; white, `border-radius:12px`, `box-shadow:0 14px 38px rgba(5,20,31,.24)`, `padding:6px` |
| Scrim | `position:fixed; inset:0; z-index:140` behind the bar, closing any open menu |

Note the tight z-index ladder — scrim 140 · bar 150 · menu 160 — and that menus open
*upward* because the bar sits at the bottom.

**Delta.** Add Assign and Export; move status change into a modal with the two distinct
validation messages; add a clear-selection control; replace the light inline bar with this
floating dark pill, its upward menus and its scrim.

## 2. Edit Issue — the answer is neither popup nor separate route

**Prototype.** `startEdit()` sets `{ tab:'overview', editMode:true, editingIssueId:i.id }`
and pre-populates the form via `formFromIssue(i)`. The source comment reads
*"full Issue-Entry experience, pre-populated"*. The render then hides the normal detail
layout: `showWorkflowGrid: [...].indexOf(curTab)>=0 && !(s.editMode && curTab==='overview')`.

So editing happens **in place, on the Issue Detail tab, replacing that tab's content with the
full Issue Entry form** — same route, no modal, no new page.

Three behaviours ride along:
- **Dirty tracking** — `_editSnapshot(form, attachments, linked)` captures a baseline of
  form + attachment names + linked ids; `confirmDiscardEdit()` gates cancel when dirty.
- **Field-level change log** — `saveEdit()` builds one entry per changed field via
  `chg(label, from, to)` producing `"{from} → {to} · by {who}"`, which is what populates the
  History timeline (area 7). Title and description are **required**; failing that emits
  *"Issue title and description are required."*
- **Attachments and links are part of the edit**, seeded from `i._attachments` and `i._linked`.

**App today.** `EditIssueModal` (`IssueWorkspaceScreen.tsx:780`), opened by `setModal('edit')`.

**Delta.** Replace the modal with in-tab edit mode. This is the largest structural change of
the eight, and it depends on area 4 — the edit form *is* the Issue Entry form, so model
code/year and linking must exist before the edit surface can be faithful.

## 3. Summary filters

**Prototype.** Two distinct mechanisms, currently conflated in the app:
- **KPI strip as filter** — each card calls `openList({filterStatus: key})`. `openList` resets
  the entire filter set, then maps singular aliases to plural state
  (`filterTier→filterTiers`, `filterStatus→filterStatuses`, `filterSource→filterSources`,
  `filterModel→filterModels`) and coerces scalars to arrays. Selected KPI is derived, not
  stored: `_kpiSel = filterStatuses.length===1 ? filterStatuses[0] : null`.
- **Filter drawer** — a **draft** buffer (`fd`) edited via `fdSetScalar`, committed by
  `applyFilterDrawer()` or dropped by `resetFilterDraft()`, so nothing filters until Apply.
  Three collapsible sections (`toggleSec`: `vehicle` · `classification` · `issue`), an
  `activeFilterCount` badge, and `filterActive` driving the button border.

The full filter vocabulary is 18 keys: `filterSources`, `filterModels`, `filterTiers`,
`filterStatuses`, `filterOwner`, `dateFrom`, `dateTo`, `filterQ`, `ewsOnly`, `filterYears`,
`filterSystems`, `filterSubSystems`, `filterComponents`, `filterSymptoms`, `filterLinked`,
`filterEws`, `filterDays`, `filterRelationship`.

**Note a real prototype bug:** `clearFilters()` sets `sortKey` twice — `'registered'` then
`'priority'`. The last write wins, so clearing filters silently re-sorts by priority. Worth
deciding deliberately rather than copying.

**App today.** KPI cards carry `apply()` handlers; the drawer's draft/apply/reset cycle and
most of the 18 keys are absent — which matches your report that the filter "is there but not
working properly".

**Delta.** Implement the draft→apply buffer, the three sections, the active count, and the
missing filter keys. Derive KPI selection rather than storing it.

## 4. New Issue — model code / year and issue linking

**Prototype, model code + year.** Model codes are **multi-select** (`toggleModelCodeMulti`),
and each selected code gets its **own row of year checkboxes**:
`toggleModelYearFor(code, year)`, `toggleAllModelYearsFor(code)` (select-all/clear per code),
`removeModelCodeRow(code)`. Years come from `mcYearsFor(code)` — derived from `MC_MASTER`
(`y0..y1` per code) — **unioned with the years actually recorded on the issue**, so a stored
year outside a code's nominal range still appears, checked. The anchor code (`modelCodes[0]`)
drives the displayed model name.

**Prototype, linking.** `openExistingModal(id)` → `linkExisting(id)` (idempotent — re-linking
is a no-op) → `unlinkExisting(id)`, over `linkedExisting` / `selectedExisting` / `unlinkSel`.
Toasts: *"{id} linked to this new issue."* / *"{id} detached from this new issue."*

**App today.** Single `modelCode` and `modelYear` scalars; no year checkboxes; no linking at
all (`Link2` is imported but unused for this).

**Delta.** All of it. This is the prerequisite for area 2.

## 5. Investigation — activity type and part request

**Prototype.** A segmented selector (`invFilterOpts` → `setInvSel`) with two views:
**Investigation Activities** and **Part Requests**. Findings: `addFinding()`, `saveFinding()`,
`addFindingEvidence(fid)`. Parts: `openPartModal()`, `addPartRow()`, `addPart()`,
`addPartAtt()`. Expand/collapse-all mirrors the History tab.

> ### ⚠ This contradicts a recorded decision — needs your call
> `ALIGNMENT-AUDIT-2026-08-22.md` correction **#3** moved Part Requests from Investigation to
> **Resolution** in EXPERIENCE.md, citing `_tabAlias: parts → resolution`.
>
> Reading the complete file, that inference does not hold. `_tabAlias` maps *legacy tab keys*
> so old deep links still resolve; it is not the current information architecture. The live
> V4–V5 IA puts Part Requests **inside Investigation**, as one of the two `invFilterOpts`
> segments. I recommend reverting audit correction #3. Flagging rather than silently
> overwriting a decision that was made deliberately.

## 6. Communication and Resolution

**Communication.** The prototype's composer is a **rich-text editor**, not a textarea — the
bundled icon subset carries `bold`, `italic`, `underline` and `list-ordered` precisely for its
toolbar, and the QIR side uses `contenteditable` set via `*SetHtml()` helpers. It also has a
**channel** toggle (`qCommentChannel: 'internal' | 'external'`, mirrored on the issue side).
Comments are immutable once posted (already in EXPERIENCE.md).

App today: a plain `<textarea>` (`IssueWorkspaceScreen.tsx:581`). That is consistent with
your report that the editor "is not functioning correctly" — there is no editor to function.

**Resolution.** Segmented via `setResSel(key)`, with the disposition decision flow
(`approveDisposition()` / `rejectDisposition()`, `dispLabel(c)`, `dispChoice`/`dispReason`
with the mandatory-reason gate) and the QIR hand-off. The app has a ResolutionTab but not the
segmented structure.

**Delta.** Build the rich-text composer with the four formatting commands and the
internal/external channel; restructure Resolution around the segmented selector.

## 7. Activity Timeline (History)

**Prototype.** The richest of the tabs — 12 methods: `setAcFilter(k)` (business vs audit
scope, with counts `acTotalN`/`acBizN`/`acAuditN`), `toggleAcWho()` actor filter,
`toggleAcOpen(id)` per-entry expansion with expand/collapse-all, `acExport()`, and a
**dual-month calendar** date range — `toggleAcDate`, `acPreset(k)`, `acPickDay(ds)`,
`acCalPrev/Next`, `acClearDraft`, `acApplyDraft` — which is also draft-then-apply. Entries
come from `acEvents(i)`, fed by the field-level change logs from area 2.

**App today.** A simpler `HistoryTab`. **Delta:** filter chips with counts, actor filter,
expansion, the dual calendar with presets, export.

## 8. End-to-end review — items you had not listed

From the prototype diff, also outstanding (detail in `issues/ism-v4-v5-gap-analysis.md`):

- **Navigation state reset** (`_resetPageState()`) — ~25 keys cleared on every navigation so
  edit/modal/drawer state cannot leak between pages. Highest-value remaining bug-class fix.
- **Model-code derivation** — `issueModelCodes()` no longer id-hash-picks from `MC_MASTER`;
  stored codes are authoritative in `rowModelCodes()`.
- **Combobox caret** — six inlined copies unified into `caretStyle(open)`, fixing
  height-dependent misalignment (`top:21/22px` → `top:50%`).
- **Cosmetics** — Investigation segmented weight unified to 600; KPI icons QIR
  `triangle-alert`→`workflow`, Top Issue `flame`→`focus`.
- **Done already:** Issue Priority tab, QIR gating, header priority chip.

---

## Conflicts with recorded decisions — decide before building

1. **Part Requests location** — audit #3 (Resolution) vs live V4–V5 IA (Investigation).
   Recommend reverting to Investigation. *(area 5)*
2. **Scoring "out of scope"** — the standing decision bars severity scoring, and
   `SeverityIndicator`/`SeverityBar` are reference-only. V4–V5 introduced **Issue Priority**
   scoring, now built. These coexist: Issue Priority (A/B/C from a 17-item matrix, ≥26/≥11)
   is a *different scale* from QIR `ratingOf()` (70/40) and from the barred severity score.
   The spines should say so explicitly so the next reader does not "fix" one into the other.
3. **Tokens-canonical vs prototype literals** — the open `[ASSUMPTION]` (app bg, text colour,
   radii). Every area above specifies prototype literals; under the standing decision they
   resolve to tokens. Unchanged, but it now bites in more places.

## Sequencing

Dependency-ordered, not priority-ordered:

1. **Area 4** (model code/year + linking) — the Issue Entry form is the foundation.
2. **Area 2** (in-tab edit) — reuses that form; its change logs feed area 7.
3. **Area 3** (filter draft/apply) and **Area 1** (bulk bar) — both list-surface, independent.
4. **Area 5** (Investigation segments) and **Area 6** (composer + Resolution).
5. **Area 7** (Timeline) — consumes area 2's change logs, so it lands last.
6. **Area 8** — navigation reset can go first if preferred; it is independent and small.
