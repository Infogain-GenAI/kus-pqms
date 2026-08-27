# Inventory reconciliation — Issue List

**Method:** `INVENTORY.md`'s three-step procedure. The component list below is
**derived from `../screen-descriptions/issue-list.md`**, which was written from
the prototype — not from `INVENTORY.md`, and not from the React implementation.
Deriving from the candidate list would only confirm the candidate list.

**Source:** `docs/ux-prototype/ism-qir-se-role/ISM + QIR SE Role - P_C.dc.html`,
md5 `8dca6a22f65b5dda7906a77945c12435` — canonical per `00-core-rules.md`.

**Date:** 2026-08-26 (re-run). **Scope:** one screen of seven.

---

## ⚠️ This reconciliation replaces one that read the wrong file

The first run derived its component list from a description written against
`PQMS_SE.html`, two design generations superseded. **Two of its three findings
were artefacts, and one of the two was itself "corrected" into a second wrong
statement.** What changed:

| First run | This run |
|---|---|
| 14 implied components, 9 confirmed (64%) | **15 implied, 12 confirmed (80%)** |
| `LinkedCountCell` "renders a category, not a count" | **The column it belongs to does not exist.** The design removed it |
| KPI tile and result band were the two misses | **Three misses** — KPI tile, result band, **and the group expander** |
| "Existence is reliable, 11 of 14" | **12 of 15** — the number improved, and see the caveat below |

**The caveat matters more than the number.** The confirmation rate rose because
the canonical file agrees with the app more often than the stale one did — not
because the candidate list got better. What the corrected run found instead is a
**larger** shape disagreement than the first run reported.

---

## Step 1 — components this screen's description implies

Fifteen, derived from the description's Q4 regions and Q5 controls.

| # | Component | Implied by |
|---|---|---|
| 1 | keyword search input | Q5, placeholder "Search by keyword..." |
| 2 | filter drawer | Q5, **Filter** opens `drawer:'filter'` |
| 3 | column-visibility control | Q5, **Columns**, with two locked columns and a restore-defaults action |
| 4 | scope tab set with inline counts | Q4 region 5 |
| 5 | **KPI tile — as a filter control** | Q4 region 4; Q5 records `_kpiSel` selection |
| 6 | data table | Q4 region 8 |
| 7 | **result-count band** | Q4 region 7 |
| 8 | pagination + rows-per-page | Q4 region 9 |
| 9 | status pill | Q6, seven status values |
| 10 | multi-value model-code cell | Q5, "*n* Models" revealing codes |
| 11 | classification path cell | Q4 region 8 |
| 12 | row-selection checkbox | Q5, bulk status change and export |
| 13 | issue-ID link cell | Q5, navigates to the workspace |
| 14 | **group expander / nested row** | Q4, the grouping rule — `grpExp`, `toggleGroupRow` |
| 15 | **empty state (no-match variant)** | Q7, specified verbatim |

## Step 2 — the four buckets

### ✅ In both, same shape → CONFIRMED (12)

| This screen implies | `INVENTORY.md` row | Note |
|---|---|---|
| keyword search | `BaseSearchInput` / `BaseInput` | |
| filter drawer | `BaseDrawer` | **Its open question is now answered.** The row reads *"The filter panel may be a drawer or an inline panel. Prototype question."* — the canonical source says **drawer** (`openFilterDrawer`, `drawer:'filter'`), and the app agrees |
| column-visibility control | `BaseColumnConfig` | Its "Issue ID cannot be hidden" claim is confirmed — and **Issue Title is locked too**, which the row does not say |
| scope tabs with counts | `BaseTabs` + `BaseBadge` / `BaseScopeTabs` | |
| data table | `BaseDataTable` | existence only — **shape disputed, see below** |
| pagination + rows-per-page | `BasePagination` | |
| status pill | `BaseStatusPill` / `StatusCell` | |
| multi-value model-code cell | `MultiValueCell` | |
| classification path cell | `ClassificationPath` | |
| row-selection checkbox | `BaseCheckbox` | indeterminate header state confirmed |
| issue-ID link cell | `IssueIdLink` | |
| empty state | `BaseEmptyState` | **Confirmed with content.** The row predicts *"the two distinct empty states — no-data versus no-match"*. The prototype supplies **one of the two, verbatim**, and leaves the other unspecified — see below |
| date-range picker | `BaseDateRangePicker` | **Promoted from unconfirmed.** The first run could not see the filter panel; the source shows `dateFrom` / `dateTo` in the filter drawer |

That is 13 rows for 12 implied components — `BaseDateRangePicker` was a list row
the first run could not confirm, now confirmed by reading the drawer, and it is
counted in the list-side tally rather than the screen-side one.

### ➕ In the prototype, not in the list → MISSED (3)

| Missed | Evidence | Why it was missed |
|---|---|---|
| **KPI tile** | Q4 region 4 — six tiles, percentage + count + label, and **each is a status filter** | Layout-adjacent and named by no FR. `INVENTORY.md` predicts exactly this: *"expected, especially for icon-only and layout-adjacent components"*. **And it is not a read-out** — the first run also missed that it is interactive |
| **Result-count band** | Q4 region 7 | `BasePagination`'s row claims the "Showing X–Y of Z" string. **There are two such strings with different denominators** (D-6), and the band is a distinct region above the table with a second line about row selection |
| **Group expander / nested row** | Q4, the grouping rule | Nothing in the BRD-derived list anticipates a hierarchical row. This is the component form of the escalation below |

### ➖ In the list, not in the prototype → UNCONFIRMED (1)

| Row | Claimed for | This reading |
|---|---|---|
| `BaseAttentionBanner` | "attention banners above the Issue List (FR-LST-008/009)" — flagged **"Named in no corpus file"** | **No banner region exists** between breadcrumb and KPI strip in the canonical source. It may be conditional on data this seed lacks. **Recorded as unconfirmed rather than absent** |

`BaseDateRangePicker` was in this bucket after the first run and has moved to
CONFIRMED.

### ⚠️ In both, different shape → THE INTERESTING BUCKET (2, and they are one question)

**`BaseDataTable` and `LinkedCountCell` — the relationship model.**

| | |
|---|---|
| **`INVENTORY.md` says** | `LinkedCountCell` — *"Count chip, or an em dash at zero; opens `ISM-LNK` (FR-LST-001)"* — a numeric cell in a Relationship column. `BaseDataTable` — a flat row list |
| **The canonical prototype shows** | **No Relationship column and no such cell.** The same domain concept is expressed as **table hierarchy**: one top-level row per group, anchored on the Parent, other members nested beneath, expansion per row, filters matching at group level |

**The first run's version of this finding was wrong in an instructive way.** It
said the two disagreed about a *cell's shape* — count versus category. They do
not disagree about a cell, because the canonical design has no cell there. The
`Standalone` label and its tooltip that the first run quoted come from
`PQMS_SE.html` and were removed a generation ago.

**Why this is bigger than a cell:**

1. **It changes what a row *is*.** A row can be an issue or a group. Counting,
   page boundaries and bulk selection all depend on which.
2. **It changes what a filter *does*.** *"A group is listed as soon as ANY member
   matches"* is a business rule with no component to hold it.
3. **`STATUS_PRIORITY` rides along.** The source declares a *business-defined*
   status ordering applied ahead of the user's sort. It is a domain rule living
   inside a presentation concern, and "sort by the selected column" loses it.

Per `INVENTORY.md`: **stop.** *"A shape disagreement between the BRD and the
prototype is not a component question, it is a requirements question, and
resolving it by picking the prettier option is how a build ends up implementing
neither."*

**[UNSPECIFIED — is the Issue List's relationship model a link-count column
(`FR-LST-001`) or grouped parent/child rows?** BRD `FR-LST-001` describes a count
opening `ISM-LNK`; the canonical prototype removed that column and expresses
relationship as row hierarchy. `00`'s precedence does not settle it on its own —
the prototype governs visual structure, the BRD governs behaviour, and *"a row is
a group"* is both. **Resolved by:** reading `FR-LST-001` and the BRD's
issue-linking requirements against the grouping rule, with the domain owner.
**Owner:** architect, with the domain owner. **Trigger:** before `BaseDataTable`'s
row and cell API is specified — `03` already records that API as unspecified, and
this is the largest question inside it.]**

**Neither `LinkedCountCell` nor the grouping component is deleted or added.** The
answer decides which exists, and deciding it here would be the exact failure
`INVENTORY.md` names.

---

## Step 3 — the delta count

> **For the Issue List, pass 4 confirmed 12 components, added 3, could not confirm
> 1, and reshaped 2 — where the two reshaped are one requirements question.**

**80% of this screen's components were confirmed in both existence and shape.**

### How much to trust the remaining rows

- **Existence is reliable — 12 of 15 implied components have a row**, and a
  thirteenth list row was promoted from unconfirmed. The BRD-derived list is not
  missing whole categories.
- **The misses are the predicted kind.** A KPI tile, a count band and a row
  expander are all **layout-adjacent and named by no requirement** —
  `INVENTORY.md` predicted this exact failure mode, which is evidence the method
  is sound even where the output was incomplete.
- **Shape is where the risk is, and it is concentrated.** One implied component
  (`BaseDataTable`) is reshaped, and it is the one `INVENTORY.md` already calls
  *"the largest single item"*. That is not a coincidence: the biggest component
  carries the most unstated behaviour.
- **Confidence ratings still do not predict correctness.** `LinkedCountCell` is
  **Medium** and its subject no longer exists; `BaseAttentionBanner` is **High**
  and is unconfirmed; `BaseDrawer` is **Low** and was answered outright by a
  single line of source.

**Extrapolated across seven screens** — one screen is still a weak base —
this predicts roughly **12–20 missed components** and **4–8 shape
disagreements**. The shape disagreements are the expensive ones: each is a
requirements question, not a component question.

### The methodological finding, which outlasts the numbers

**Read the source, not a render.** Every one of this run's corrections came from
reading the `.dc.html` source rather than a rendered page:

- the removed Relationship column — visible only by counting `colRelationship`
  occurrences (3 in the stale file, 1 in the canonical);
- the KPI tiles being filters — `_kpiSel`, which no screenshot shows;
- the grouping rule — stated in a source comment and in no pixel;
- three role-dependent subtitles — **unreachable** in the rendered file, because
  the prototype ships no role switch;
- `_loadCols()` restoring column visibility from `sessionStorage`, which is why
  the first run's "correction" about the Columns chooser was itself wrong.

A render answers *what did this browser show me*. A screen description needs
*what does the design specify*, and those are different questions.

---

## What this did NOT establish

- **Why the app implements neither grouping nor `STATUS_PRIORITY`.** Both are
  absent from the app. Whether that is deliberate deferral or oversight is
  recorded nowhere, and is part of the escalation above.
- **The View Issue Group modal's contents.**
- **Nothing about four of five roles**, beyond two subtitle strings.
- **Nothing about loading, error, stale or permission-denied states** — the
  prototype specifies none of them, so no component was derived for any.
