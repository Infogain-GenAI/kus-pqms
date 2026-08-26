# Screen description — Issue List

**Class:** Specification, authored against `29-screen-description-authoring.md`'s
ten questions. **Written from the prototype, not from the implementation.**

---

## 1 · Source and reading

| | |
|---|---|
| **Prototype file** | `_bmad-output/planning-artifacts/ux/design-source/exports/pqms-bundled-page-2026-08-16/PQMS_SE.html` |
| **Reading** | rendered in Chromium 1234 at 1280×900, navigated via its own UI: top nav → **Issue Management** |
| **Date of reading** | 2026-08-26 |
| **Role rendered** | **SE — "Arpita Chavda · SE · Service Eng."** (the prototype ships one role; see Q8) |

**Why this matters, per `17`'s moving-target warning:** this is the *flattened
2026-08-16 export*, not the live `.dc.html`. `FIDELITY-REPORT.md`'s round 4
recorded that the two **disagree** — and one of those disagreements is load-bearing
below (Q4, the Relationship column). Any re-check must state which artefact it
read.

## 2 · BRD screen ID and FRs

**[UNSPECIFIED — the BRD screen ID and FR list for this screen.**
BRD C1.0 §8.1 carries a screen inventory and `INVENTORY.md` cites FR IDs
(`FR-LST-004`, `FR-LST-008/009`, `FR-LST-017…019`) against Issue List controls,
but the BRD was not read for this description and those citations are second-hand.
**Resolved by:** reading BRD C1.0 §8.1 and §8.4 directly. **Owner:** Frontend
Lead.]**

Traceability (`TR-02`) is therefore **not yet satisfied** for this screen.

## 3 · Layout

**`DefaultLayout`** — header, breadcrumb, page content; the window scrolls, not an
internal region. *Per the prototype:* the table grows down the page and the
browser scrollbar moves the whole document. There is no fixed-height table
viewport and no internal scroll container.

**Consequence for `12`:** the table is **not windowed** in the prototype. Any
virtualisation would be a change to what the prototype shows, not an
implementation detail.

## 4 · Regions, top to bottom

| # | Region | Contents (per the prototype) |
|---|---|---|
| 1 | **App header** | Brand "Kia PQMS"; nav: Overview · Issue Management · QIR Management · TSB Management; notification control showing **6**; avatar block "AC / Arpita Chavda / SE · Service Eng." |
| 2 | **Breadcrumb** | "Issue Management › Issue List" |
| 3 | **Page heading** | H1 **"Issue list"**, subtitle **"Monitor, prioritize and manage product quality issues."**, right-aligned actions **Export**, **New issue** |
| 4 | **KPI strip** | Five tiles, each a percentage and a count: **Open**, **Investigating**, **QIR**, **Top Issue**, **Resolved** |
| 5 | **Scope tabs** | **"My Issues 7"**, **"All Issues 33"** — counts rendered inline |
| 6 | **Table toolbar** | Search field; **Filter**; **Columns** |
| 7 | **Table band** | **"Showing 7 of 33 issues"** and **"Select rows to change status or export"** |
| 8 | **Table** | Columns: **Issue ID · Issue Title · Relationship · Model Code · Classification · Status · Issue Date** |
| 9 | **Pagination footer** | Rows-per-page select (**20 / 50 / 100**) and a page control |

> ⚠️ **Region 8 carries the known export-vs-live disagreement.** This export shows
> **Relationship** as a visible column. `FIDELITY-REPORT.md` round 4 recorded that
> the *live* `.dc.html` does **not** show it by default and offers it through the
> Columns chooser. **Both readings are recorded rather than reconciled**, because
> reconciling them means deciding which artefact governs, and that is `17`'s
> register question, not this description's.

## 5 · Every control, by what it does

Named by behaviour, not by component — naming components is pass 4's *output*.

| Region | Control | What it does |
|---|---|---|
| 3 | Export action | exports the current result set *(scope and format not shown)* |
| 3 | New issue action | begins issue creation |
| 4 | KPI tile ×5 | shows a count and a share of total per status; *the prototype does not show whether a tile is clickable* |
| 5 | Scope tab ×2 | switches between the viewer's own issues and all issues, each showing its own count |
| 6 | Keyword search | free-text filter, placeholder **"Search by keyword..."** |
| 6 | Filter | opens a panel of structured filters *(contents not captured in this reading — see Q9)* |
| 6 | Columns | opens column visibility control |
| 8 | Issue ID cell | navigates to that issue's workspace |
| 8 | Relationship cell | shows link state; **"Standalone issue. Click to view history."** — so it is interactive |
| 8 | Model Code cell | one code, or **"2 Models"** / **"3 Models"** with the codes revealed on interaction |
| 8 | Row selection | **"Select rows to change status or export"** — bulk status change and bulk export |
| 9 | Rows-per-page | 20 / 50 / 100 |
| 9 | Page control | moves between pages |

## 6 · User-facing strings, verbatim

```
Issue list
Monitor, prioritize and manage product quality issues.
Export
New issue
Open · Investigating · QIR · Top Issue · Resolved
My Issues · All Issues
Search by keyword...
Filter
Columns
Showing 7 of 33 issues
Select rows to change status or export
Issue ID · Issue Title · Relationship · Model Code · Classification · Status · Issue Date
Standalone
Standalone issue. Click to view history.
Issue title · Relationship · Model code · Classification · Issue Date · This issue
20 · 50 · 100
```

**Status values shown:** `Open`, `Investigating`, `QIR`, `Top Issue`,
`Monitoring`. **`Resolved` appears in the KPI strip but on no row** in this
reading — see the reconciliation.

## 7 · Every state

| State | Prototype shows it? |
|---|---|
| **Content** | ✅ yes — 33 issues, 7 in own-scope |
| **Loading** | ❌ **[UNSPECIFIED — no loading state is shown.** The prototype renders synchronously from an inline bundle. **Resolved by:** a design decision once a transport exists. **Owner:** UX, with the architect.] |
| **Empty — no data** | ❌ **[UNSPECIFIED — see below.]** |
| **Empty — no match** | ❌ **[UNSPECIFIED — see below.]** |
| **Error** | ❌ **[UNSPECIFIED — no error state is shown.** `22` requires one. **Owner:** UX.] |
| **Stale** | ❌ not shown; no refresh affordance exists |
| **Permission-denied** | ❌ not shown; one role ships in the prototype |

### The two empty states — answered explicitly, per `29` Q7

**The prototype shows NEITHER, and they are not the same screen.** This is the
item `29` calls most commonly omitted, and the list is where it bites:

- **Empty because no data exists** — a new deployment, or a role whose own-scope
  is genuinely empty. The correct response is *orientation*: explain what this
  screen will show and offer **New issue**.
- **Empty because the filters exclude everything** — the user has data and cannot
  see it. The correct response is *recovery*: say which filters are active and
  offer **Clear filters**. Offering "New issue" here is actively wrong; the user
  does not want another issue, they want the ones they have.

**Serving one state for both is the common failure**, and it fails whichever way
it is written. **[UNSPECIFIED — the two empty states' copy and affordances.
Resolved by:** a UX decision; both need distinct copy and distinct primary
actions. **Owner:** UX. **Trigger:** before the empty-state implementation, which
does not exist today.]**

## 8 · What differs per role

**[UNSPECIFIED — the prototype ships ONE role.** It renders as
"Arpita Chavda · SE · Service Eng." and offers no role switch, so four of the
five roles in BRD §7.3 are undescribed for this screen.

Two things are visible and role-shaped even so, recorded as observations rather
than as the answer:
- **Scope tabs exist at all**, implying own-scope is meaningful — a role that sees
  everything may not need them.
- **Bulk status change is offered to this SE**, which the workspace screen's
  propose→approve flow suggests should require an override role.

**Resolved by:** reading BRD §7.3's role matrix against each control above.
**Owner:** architect, with the domain owner. **Trigger:** before any role-gating
work on this screen.]**

## 9 · What the prototype does not show

The honest half, per item.

| Item | Status |
|---|---|
| **Keyboard behaviour** | not shown — no focus order, no shortcuts, no roving tabindex on the table |
| **Focus management** | not shown — where focus lands after Filter closes, or after a page change |
| **Sort affordance** | **not visible in this reading.** Whether headers sort, and which are sortable, is not expressed |
| **Filter panel contents** | not captured — the panel was not opened in this reading |
| **Column chooser contents** | not captured |
| **Export format/scope** | not shown |
| **KPI tile interactivity** | not shown |
| **Pagination beyond page 1** | not exercised |
| **Sort/filter/pagination interaction** | not expressible by a static prototype at all — `00` case 2 |

**A prototype cannot express an interaction contract.** Absence here is absence of
*information*, not evidence the screen has no such behaviour.

## 10 · Navigation

**Into this screen:** the header's **Issue Management** nav item; the breadcrumb
trail from Issue Management.

**Out of this screen:**

| Trigger | Destination |
|---|---|
| Issue ID cell | that issue's workspace |
| New issue | issue creation |
| Relationship cell | "Click to view history" — destination not shown |
| Export | no navigation; produces a file |

**[UNSPECIFIED — the Relationship cell's destination.** The tooltip promises
history; the prototype does not show where it goes. **Owner:** UX.]**

---

# Reconciliation against the implementation

Structural counterpart to the pixel delta: that measured *how differently they
render*; this establishes *whether they should*.

| # | Prototype | Implementation | Verdict |
|---|---|---|---|
| 1 | KPI: Open, Investigating, QIR, Top Issue, **Resolved** | Open, Investigating, QIR, Top Issue, **Closed** | ⚠️ **FINDING — vocabulary divergence** |
| 2 | **Relationship** is a visible column | **not rendered**; default set omits it | ⚠️ **FINDING — but see below** |
| 3 | **"Showing 7 of 33 issues"** on My Issues | **"Showing 7 of 7 issues"** | ⚠️ **FINDING — different semantics** |
| 4 | Model Code shows "3 Models" with codes on interaction | same | ✅ matches |
| 5 | Scope tabs with inline counts (7 / 33) | same (7 / 33) | ✅ matches |
| 6 | Search placeholder "Search by keyword..." | identical | ✅ matches |
| 7 | Rows-per-page 20/50/100 | identical | ✅ matches |
| 8 | Band text "Select rows to change status or export" | identical | ✅ matches |
| 9 | H1 and subtitle | identical | ✅ matches |
| 10 | Sortable columns not expressed | Model Code, Status, Issue Date, Owner, Days sortable | ➕ implementation adds |

### Finding 1 — "Resolved" versus "Closed"

The prototype's fifth KPI tile reads **Resolved**; the app renders **Closed**.

This is **not** a new divergence — `FIDELITY-REPORT.md` round 4 records the *live*
prototype's sixth KPI as **CLOSED (green)** while the flattened export said
**RESOLVED**, and the app followed the live one. **The app is probably right and
this export is stale.** Recorded because a reader comparing only against this
export would file a bug that has already been decided.

**It also sits next to a live vocabulary question:** the app implements the
prototype's **seven** statuses per the 2026-08-23 directive, and `Resolved` is not
among them. A KPI tile labelled `Resolved` would have no status to count.

### Finding 2 — the Relationship column

Present in this export, absent from the app's default columns. `FIDELITY-REPORT.md`
round 4 explicitly resolved this: the **live** prototype has no Relationship column
by default and offers it via the Columns chooser; the app matches the live one.

**So finding 2 is a stale-source artefact, not an implementation defect** — and it
is the clearest argument for Q1's insistence on naming which artefact was read.

**But one part does not resolve away:** this export gives the Relationship cell
real behaviour — the label **"Standalone"** and the tooltip **"Standalone issue.
Click to view history."** **[UNSPECIFIED — whether the app's Columns chooser can
surface Relationship at all, and whether it carries that behaviour when shown.
Resolved by:** reading the live `.dc.html`'s Columns chooser. **Owner:** Frontend
Lead.]**

### Finding 3 — "Showing 7 of 33" versus "Showing 7 of 7"

**The most substantive finding, and it is not cosmetic.**

The prototype counts the **narrowed set against the unnarrowed total** — "7 of
33" tells the user *there are 33 issues and you are seeing 7*. The app counts
**the scoped set against itself** — "7 of 7" tells the user nothing.

Under `00`'s source precedence the prototype governs visual structure and copy,
so **the prototype's reading governs**, and the app diverges. It is a small string
with a real consequence: a user who has narrowed to 7 rows cannot tell from the
app whether that is all the data or a slice of it.

**Related but distinct from D-5** (`APPLICATION-DEFECTS.md`), which is about the
page index not resetting. Both concern the user's sense of position in a result
set; this one is about *how many results exist*.

**[FINDING — the count line's denominator. Owner:** Frontend Lead. **Trigger:**
alongside D-5, since both touch the same band and both are one-line changes.]**
