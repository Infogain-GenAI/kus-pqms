# Screen description — Issue List

**Class:** Specification, authored against `29-screen-description-authoring.md`'s
ten questions. **Written from the prototype, not from the implementation.**

---

## 0 · ⚠️ This description was re-authored 2026-08-26 against a different file

The first version of this file was written from
`…/pqms-bundled-page-2026-08-16/PQMS_SE.html`, which
`00-core-rules.md` §"Which file is the prototype" has since dispositioned as
**two design generations superseded**. Three of its statements were artefacts of
that file and are corrected below rather than carried forward:

| First version said | Canonical source says |
|---|---|
| KPI strip has **five** tiles ending in **Resolved** | **six** tiles ending in **Closed** — and they are **status filters**, not read-outs |
| **Relationship** is a visible column; the live file hides it behind the Columns chooser | **The column does not exist.** It was removed, and relationship moved into **row grouping** |
| Neither empty state is shown | The **no-match** empty state is specified verbatim, copy and all |

The second row is the important one and the first version got it wrong twice —
once by reading the stale file, once by "correcting" that with a claim about the
Columns chooser that the source does not support. **Per `00` rule 2, structural
questions are answered from the source, never from a render:** the live
`.dc.html` restores column visibility from `sessionStorage`, so a browser's
history changes what it shows. `DEFAULT_COLS()` does not.

---

## 1 · Source and reading

| | |
|---|---|
| **Prototype file** | `docs/ux-prototype/ism-qir-se-role/ISM + QIR SE Role - P_C.dc.html` |
| **md5** | `8dca6a22f65b5dda7906a77945c12435` (1,837,340 bytes) |
| **Provenance** | Claude Design project **Kia N-PQMS V4-V5**, sync 2026-08-24. Canonical per `00-core-rules.md` |
| **Reading** | **source read**, not a render — the `<x-dc>` template and the `<script data-dc-script>` block, by symbol |
| **Date of reading** | 2026-08-26 |
| **Role rendered** | **SE** — but see Q8; this file is **not** single-role, and the first version was wrong about that too |

**Why the source and not a render.** Three of this screen's structural facts —
default column set, KPI definitions, empty-state copy — live in code that a
render only partially exposes, and one of them (`_loadCols`) is overridden by
`sessionStorage` before anything is painted. A render answers "what did this
browser show me"; the source answers "what does the design specify".

## 2 · BRD screen ID and FRs

**[UNSPECIFIED — the BRD screen ID and FR list for this screen.**
BRD C1.0 §8.1 carries a screen inventory and `INVENTORY.md` cites FR IDs
(`FR-LST-004`, `FR-LST-008/009`, `FR-LST-017…019`) against Issue List controls,
but the BRD was not read for this description and those citations are second-hand.
**Resolved by:** reading BRD C1.0 §8.1 and §8.4 directly. **Owner:** Frontend
Lead.]**

Traceability (`TR-02`) is therefore **not yet satisfied** for this screen.

## 3 · Layout

**`DefaultLayout`** — header, breadcrumb, page content. The table sits in a card
with its own horizontal scroll container (`ism-issue-scroll`, `tableMinPx`,
`colsScrollCls`): **columns scroll horizontally inside the card when the visible
set exceeds the width**, while the page scrolls vertically as a whole.

**Consequence for `12`:** the table is **paginated, not windowed** —
`pageRows = topRows.slice(pageStart, pageStart + pageSize)`. Virtualisation would
be a change to what the prototype specifies, not an implementation detail.

## 4 · Regions, top to bottom

| # | Region | Contents (per the canonical source) |
|---|---|---|
| 1 | **App header** | Brand "Kia PQMS"; nav: Overview · Issue Management · QIR Management · TSB Management; notification control; avatar block |
| 2 | **Breadcrumb** | "Issue Management › Issue List" |
| 3 | **Page heading** | H1 **"Issue list"**, subtitle **"Monitor, prioritize and manage product quality issues."** (role-dependent — Q8), right-aligned **Export**, **New issue** |
| 4 | **KPI strip** | **Six** tiles: **My Issues / All Issues** (total, no percentage), **Open**, **Investigating**, **QIR**, **Top Issue**, **Closed**. Each status tile shows a count and its share of total |
| 5 | **Scope tabs** | **"My Issues"**, **"All Issues"** with inline counts |
| 6 | **Table toolbar** | Search; **Filter** (opens a drawer — `openFilterDrawer`); **Columns** (opens a drawer — `openColsDrawer`) |
| 7 | **Result band** | **"Showing _{dResultCount}_ of _{totalCount}_ issues"** and "Select rows to change status or export" |
| 8 | **Table** | Default columns: **Issue ID · Issue Title · Model Code · Classification · Status · Issue Date**. Rows are **grouped** — see below |
| 9 | **Pagination footer** | **"Showing _{from}_–_{to}_ of _{dResultCount}_ issues"**, "Rows:" select, page buttons |

### Region 8 is a grouped table, and that is the headline structural fact

The source states the rule in a comment, and it is a contract, not a rendering
detail:

> *Standalone issue → its own top-level row. A group → exactly one top-level row,
> always its **Parent** (earliest-registered member), with every other member
> nested beneath it — regardless of who created the child or when, and regardless
> of whether the child/parent would survive the current scope + filters on its
> own. A group is listed as soon as ANY member matches the filters, and no issue
> is ever rendered both at top level and as a child.*

Four consequences worth naming, because each is a decision someone would
otherwise make by accident:

1. **A group is one row for counting purposes.** `dResultCount = topRows.length`.
   Pagination pages over top-level rows, so a page of 20 can contain far more
   than 20 issues.
2. **Filters select groups, not issues.** One matching member surfaces the whole
   group, including members the filter excludes.
3. **The Parent anchors ordering** even when the Parent itself is out of scope —
   `topRows.sort()` re-sorts by the Parent's own date, deliberately, so adding a
   newer child does not move the group.
4. **Expansion is per-row state** (`grpExp`, `toggleGroupRow`), not a global
   expand-all.

**Relationship is expressed as hierarchy here, not as a column.** The
`filterRelationship` filter (`_groupKind`: grouped / ungrouped) and a **View
Issue Group** modal (`openViewGroup`) carry the rest of it. The dead
`visibleCols.relationship:true` key and a stale code comment reading *"Issue List
'Relationship' column"* are the only traces of the removed column.

## 5 · Every control, by what it does

Named by behaviour, not by component — naming components is pass 4's *output*.

| Region | Control | What it does |
|---|---|---|
| 3 | Export | exports the current result set *(scope and format not shown)* |
| 3 | New issue | begins issue creation |
| 4 | Total tile | switches scope to **My Issues**; shows no percentage; selected when no status filter is active |
| 4 | Status tile ×5 | **sets the status filter to that one status** (`_kpiSel`) and takes a selection border. **These are filter controls** |
| 5 | Scope tab ×2 | own-scope vs all, each with its own count |
| 6 | Keyword search | free-text filter, placeholder **"Search by keyword..."** |
| 6 | Filter | opens a **drawer** of structured filters — status, tier, owner, date range, model year, system / sub-system / component / symptom, linked, EWS, days, and **relationship kind** (`_groupKind`: grouped / ungrouped). Section state `secOpen:{vehicle,classification,issue}` starts all-open |
| 6 | Columns | opens the column chooser: **default group** (Issue ID·, Issue Title·, Model Code, Classification, Status, Issue Date) and **optional group** (Source, Component, Symptom, DTC / Trouble Code, Owner, Days). Issue ID and Issue Title are **locked on** |
| 6 | Restore defaults | resets to `DEFAULT_COLS()`; enabled only when the draft differs |
| 8 | Group expander | expands/collapses one group's children |
| 8 | Issue ID cell | navigates to that issue's workspace |
| 8 | Model Code cell | one code, or "*n* Models" with codes revealed on interaction |
| 8 | Row selection | bulk status change and bulk export |
| 8 | Column header | sorts; `sortKey` defaults to `registered`, `sortDir` to `desc` |
| 9 | Rows-per-page | `pageSize`, default **20** |
| 9 | Prev / Next / page buttons | move between pages; disabled at the ends |

**Sort is expressed after all.** The first version recorded sort affordance as
"not visible in this reading" — a render limitation. The source carries
`sortKey`/`sortDir`, per-column sort handlers, and a persisted default of
`registered desc`.

## 6 · User-facing strings, verbatim

```
Issue list
Monitor, prioritize and manage product quality issues.
Export
New issue
My Issues · All Issues · Open · Investigating · QIR · Top Issue · Closed
Search by keyword...
Columns
Showing {n} of {total} issues
Select rows to change status or export
Issue ID · Issue Title · Model Code · Classification · Status · Issue Date
Source · Component · Symptom · DTC / Trouble Code · Owner · Days
Showing {from}–{to} of {n} issues
Rows:
No issues match these filters
Clear filters to see all issues in the queue.
Clear filters
```

**Status vocabulary — seven values, from `STATUS`:**
`Open` · `Investigating` · `Monitoring` · `QIR` · `Top Issue` · `NASO` ·
`Closed`. **`Resolved` does not exist in the canonical prototype.** It appeared
only in the superseded export, and the app is right not to have it.

**Default list order is not the sort key alone.** `STATUS_PRIORITY`
(`topissue 0, escalated 1, review 2, open 3, monitoring …`) is applied as the
primary sort in the default view — an explicitly *business-defined* hierarchy, not
alphabetical, and a rule an implementation would otherwise lose.

## 7 · Every state

| State | Prototype shows it? |
|---|---|
| **Content** | ✅ yes |
| **Loading** | ❌ **[UNSPECIFIED** — renders synchronously from an inline bundle. **Resolved by:** a design decision once a transport exists. **Owner:** UX, with the architect.] |
| **Empty — no match** | ✅ **yes, fully specified** — see below |
| **Empty — no data** | ❌ **[UNSPECIFIED** — see below] |
| **Error** | ❌ **[UNSPECIFIED** — `22` requires one. **Owner:** UX.] |
| **Stale** | ❌ not shown; no refresh affordance exists |
| **Permission-denied** | ❌ not shown |

### The two empty states — answered explicitly, per `29` Q7

**One of the two is specified, the other is not, and the prototype serves the
specified one for both cases.** That is a stronger and more useful answer than
the first version's "neither is shown", and it is the exact failure `29` warns
about — caught here in the design rather than in the build.

**Empty — no match. SPECIFIED, verbatim:**

- icon `filter-x` in a 54 px rounded tile
- heading **"No issues match these filters"**
- body **"Clear filters to see all issues in the queue."**
- single action **"Clear filters"** → `clearFilters`

This is textbook *recovery* copy, and it is right.

**Empty — no data. NOT SPECIFIED, and the prototype will show the wrong thing.**
The condition is `showEmpty = rows.length === 0`, which does not distinguish
*filters excluded everything* from *there is nothing here*. A new deployment, or
an SE whose own scope is genuinely empty, gets told to clear filters that are not
set.

**[UNSPECIFIED — the no-data empty state.** It needs *orientation* copy and a
**New issue** primary action, not "Clear filters". **Resolved by:** a UX
decision, plus splitting the `showEmpty` condition on whether any filter is
active. **Owner:** UX. **Trigger:** before the empty-state implementation, which
does not exist today.]**

## 8 · What differs per role

**The canonical prototype is NOT single-role, and the first version said it was.**
The page subtitle branches on role:

| Role | Subtitle |
|---|---|
| **ASM** | "Issues awaiting your review, approval and escalation decisions." |
| **PQM** | "Portfolio quality health and the items only you can resolve." |
| *default (SE)* | "Monitor, prioritize and manage product quality issues." |

So the design **does** encode role-dependent behaviour on this screen — at
minimum the framing copy, which asserts that ASM sees an approval queue and PQM a
portfolio view. What it does **not** encode is a role switch: there is no `ROLES`
constant and no UI to change role, so the branches are unreachable from the
rendered file. **This is precisely why the source had to be read** — a render
could not have found them.

**[UNSPECIFIED — the full per-role difference for this screen.** Three of five
BRD §7.3 roles have subtitle copy and no more; ADMIN and VIEWER have nothing.
Whether the *controls* differ — bulk status change offered to an SE, when the
workspace's propose→approve flow implies an override role — is not expressed.
**Resolved by:** reading BRD §7.3's matrix against the control table in Q5.
**Owner:** architect, with the domain owner. **Trigger:** before any role-gating
work on this screen.]**

## 9 · What the prototype does not show

| Item | Status |
|---|---|
| **Keyboard behaviour** | not shown — no focus order, no shortcuts, no roving tabindex |
| **Focus management** | not shown — where focus lands after the filter panel closes, or after a page change |
| **Export format/scope** | not shown |
| **Group-expander keyboard semantics** | not shown, and this one matters — a nested table needs an expressed tree contract |
| **What "View Issue Group" contains** | modal exists (`openViewGroup`); its contents were not read for this description |
| **Sort/filter/pagination interaction** | not expressible by a static prototype at all — `00` case 2 |

**A prototype cannot express an interaction contract.** Absence here is absence of
*information*, not evidence the screen has no such behaviour.

## 10 · Navigation

**Into this screen:** the header's **Issue Management** nav item; the breadcrumb.

**Out of this screen:**

| Trigger | Destination |
|---|---|
| Issue ID cell | that issue's workspace |
| New issue | issue creation |
| View Issue Group | a modal, not a route |
| Export | no navigation; produces a file |

---

# Reconciliation against the implementation

Structural counterpart to the pixel delta: that measured *how differently they
render*; this establishes *whether they should*.

| # | Canonical prototype | Implementation | Verdict |
|---|---|---|---|
| 1 | KPI: six tiles ending **Closed** | six tiles ending **Closed** | ✅ matches — the first version's "finding" was a stale-file artefact |
| 2 | **No Relationship column** | no Relationship column | ✅ matches — likewise withdrawn |
| 3 | KPI tiles **set the status filter** | tiles call `setStatusFilter` / `setTab` | ✅ matches |
| 4 | KPI icons `workflow` / `focus` | `TriangleAlert` / `Flame` | ⚠️ **FINDING — one generation of icon behind** |
| 5 | Band: `dResultCount` **of `totalCount`** (= `issues.length`) | "Showing 7 of 7" | ⚠️ **FINDING — D-6** |
| 6 | **Grouped rows** — Parent anchors, children nest, group counts as one row | **not implemented** — no group members, no expander, no nesting | ⚠️ **ESCALATED — see below** |
| 7 | `STATUS_PRIORITY` as primary sort in the default view | **not implemented** — the term appears nowhere in the app | ⚠️ **ESCALATED — see below** |
| 8 | Empty state: "No issues match these filters" / "Clear filters to see all issues in the queue." / **Clear filters** | **identical, verbatim** (`IssueListScreen.tsx:401`) | ✅ matches |
| 9 | Search placeholder, rows-per-page select, band text, H1, subtitle | identical | ✅ matches |
| 10 | Filter and Columns are **drawers** | same — one `drawer` state with `filter` / `cols` | ✅ matches |

### Finding — KPI icons (row 4)

`workflow` and `focus` replaced `triangle-alert` and `flame` in the 2026-08-24
sync. `issues/ism-v4-v5-gap-analysis.md` item 8 already records this as **NOT
DONE** and classifies it as cosmetic. It stays cosmetic; it is listed here only so
the two records agree.

### Finding — the result band (row 5)

Recorded as **D-6** in `APPLICATION-DEFECTS.md`, with the fix. The prototype's
denominator is `s.issues.length` — the entire dataset, unaffected by scope or
filters. The app's is the scoped set, so on My Issues it reads "7 of 7" and tells
the user nothing.

Note there are **two different** "Showing" strings, with **different
denominators**, and conflating them is how this defect happens:

| Where | String | Denominator |
|---|---|---|
| band, above the table | `Showing {dResultCount} of {totalCount} issues` | **whole dataset** |
| pagination footer | `Showing {from}–{to} of {dResultCount} issues` | **result set** |

### ESCALATED — grouped rows and the default sort (rows 6 and 7)

**This is the `LinkedCountCell`-class finding for this screen, and it is larger
than a cell.** `INVENTORY.md` predicted a *Relationship column* containing a
*link-count cell* (`LinkedCountCell`, FR-LST-001, "count chip, or an em dash at
zero; opens `ISM-LNK`"). The canonical prototype has **neither the column nor the
cell**. It expresses the same domain concept as **table hierarchy**: one row per
group, anchored on the Parent, children nested, expansion per row.

Three reasons this is a requirements question and not a component question:

1. **It changes what a row *is*.** A row can be an issue or a group. Every
   count, every page boundary and every bulk selection depends on which.
2. **It changes what a filter *does*.** "A group is listed as soon as ANY member
   matches" is a business rule with no component to hold it.
3. **`STATUS_PRIORITY` is declared *business-defined*** in the source and is
   applied ahead of the user's sort. That is a domain rule sitting inside a
   presentation concern, and it will be lost by anyone implementing "sort by the
   selected column".

**[UNSPECIFIED — is the Issue List's relationship model a link-count column
(`FR-LST-001`) or grouped parent/child rows?** The BRD asserts the first; the
canonical prototype implements the second and has removed the first. `00`'s
precedence does **not** settle this on its own: the prototype governs visual
structure, the BRD governs behaviour, and *"a row is a group"* is both.
**Resolved by:** reading `FR-LST-001` and the BRD's issue-linking requirements
against this grouping rule, with the domain owner. **Owner:** architect, with the
domain owner. **Trigger:** before `BaseDataTable`'s row and cell API is specified
— `03` already records that API as unspecified, and this is the largest question
inside it.]**

**Per `INVENTORY.md`: stop here.** *"A shape disagreement between the BRD and the
prototype is not a component question, it is a requirements question, and
resolving it by picking the prettier option is how a build ends up implementing
neither."*

---

## What this pass did NOT establish

- **Why the app has neither grouping nor `STATUS_PRIORITY`.** Both are absent; whether
  that is a deliberate deferral or an oversight is not recorded anywhere, and this
  document does not guess. It is part of the escalation above.
- **`filterPanelOpen` / `toggleFilterPanel`.** These exist in the canonical source
  and the Issue List toolbar does not call them — the Filter button opens the
  drawer. Whether they belong to another surface or are residue was not
  established, and nothing was inferred from them.
- **The View Issue Group modal's contents.**
- **Four of five roles**, beyond the two subtitle strings above.
- **The QIR-side of anything.** Out of scope; the app ships no QIR screens.
