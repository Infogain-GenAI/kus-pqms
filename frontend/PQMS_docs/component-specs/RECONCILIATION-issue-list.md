# Inventory reconciliation — Issue List

**Method:** `INVENTORY.md`'s three-step procedure. The component list below is
**derived from `../screen-descriptions/issue-list.md`**, which was written from
the prototype — not from `INVENTORY.md`, and not from the React implementation.
Deriving from the candidate list would only confirm the candidate list.

**Date:** 2026-08-26. **Scope:** one screen of seven.

---

## Step 1 — components this screen's description implies

Fourteen, derived from the description's Q4 regions and Q5 controls.

| # | Component | Implied by |
|---|---|---|
| 1 | keyword search input | Q5, placeholder "Search by keyword..." |
| 2 | filter panel container | Q5, "Filter" opens a panel |
| 3 | column-visibility control | Q5, "Columns" |
| 4 | scope tab set with inline counts | Q4 region 5, "My Issues 7 / All Issues 33" |
| 5 | **KPI tile** | Q4 region 4, five tiles with percentage + count |
| 6 | data table | Q4 region 8 |
| 7 | **result-count band** | Q4 region 7, "Showing 7 of 33 issues" |
| 8 | pagination + rows-per-page | Q4 region 9 |
| 9 | status pill | Q6, five status values rendered as pills |
| 10 | **relationship cell** | Q5, "Standalone" + "Click to view history" |
| 11 | **multi-value model-code cell** | Q5, "3 Models" revealing codes |
| 12 | classification path cell | Q6, "Electrical / Charge port actuator" |
| 13 | row-selection checkbox | Q5, "Select rows to change status or export" |
| 14 | issue-ID link cell | Q5, navigates to the workspace |

## Step 2 — the four buckets

### ✅ In both, same shape → CONFIRMED (9)

| This screen implies | `INVENTORY.md` row |
|---|---|
| keyword search | `BaseSearchInput` / `BaseInput` |
| column-visibility control | `BaseColumnConfig` |
| scope tabs with counts | `BaseTabs` + `BaseBadge` |
| data table | `BaseDataTable` |
| pagination + rows-per-page | `BasePagination` |
| status pill | `BaseStatusPill` / `StatusCell` |
| multi-value model-code cell | `MultiValueCell` |
| row-selection checkbox | `BaseCheckbox` |
| issue-ID link cell | `IssueIdLink` |

**Nine of fourteen confirmed.** The candidate list, derived from the BRD, got the
majority of this screen's components right in both existence and shape.

### ➕ In the prototype, not in the list → MISSED (2)

| Missed | Evidence | Why it was missed |
|---|---|---|
| **KPI tile** | Q4 region 4 — five tiles, percentage + count + label, above the tabs | Layout-adjacent and not named by any FR. `INVENTORY.md` predicts exactly this: *"expected, especially for icon-only and layout-adjacent components"* |
| **Result-count band** | Q4 region 7 — "Showing 7 of 33 issues" + "Select rows to change status or export" | `BasePagination`'s row claims the "Showing X–Y of Z" string. **But the prototype puts it ABOVE the table, in its own band, with a second line about row selection** — a distinct region, not part of the pager |

### ➖ In the list, not in the prototype → INVENTED for this screen (2)

| Row | Claimed for | This reading |
|---|---|---|
| `BaseAttentionBanner` | "attention banners above the Issue List (FR-LST-008/009)" — flagged **"Named in no corpus file"** | **No banner appears.** No region between breadcrumb and KPI strip |
| `BaseDateRangePicker` | "the Issue List filter panel" | **Not observed** — the filter panel was not opened in this reading |

**Neither is deleted.** The banner may be conditional on data this seed lacks;
the date picker sits behind a panel this reading did not open. **Recorded as
unconfirmed rather than absent** — a distinction `INVENTORY.md` asks for
("delete it, or record why it survives").

### ⚠️ In both, different shape → THE INTERESTING BUCKET (1)

**`LinkedCountCell` versus the Relationship cell.**

| | |
|---|---|
| **`INVENTORY.md` says** | *"Count chip, or an em dash at zero; opens `ISM-LNK` (FR-LST-001)"* — a **numeric** cell |
| **The prototype shows** | the word **"Standalone"**, with the tooltip **"Standalone issue. Click to view history."** — a **categorical** cell whose zero-state is a named state, not a dash, and whose action is **history**, not a link-management modal |

**These are not the same component.** One renders a count and opens link
management; the other renders a relationship *category* and opens history. A
build that specified the BRD's shape would produce a cell that cannot display
"Standalone".

Per `INVENTORY.md`: **stop.** *"A shape disagreement between the BRD and the
prototype is not a component question, it is a requirements question, and
resolving it by picking the prettier option is how a build ends up implementing
neither."*

**[UNSPECIFIED — is the Relationship cell a link count or a relationship
category?** BRD `FR-LST-001` describes a count opening `ISM-LNK`; the prototype
shows a category opening history. **Resolved by:** reading FR-LST-001 against the
live `.dc.html`. **Owner:** architect, with the domain owner. **Trigger:** before
`BaseDataTable`'s cell API is specified — `03` already records that API as
unspecified, and this is one of the questions inside it.]**

---

## Step 3 — the delta count

> **For the Issue List, pass 4 confirmed 9 components, added 2, could not confirm
> 2, and reshaped 1.**

**64% of this screen's components were confirmed in both existence and shape.**

### How much to trust the remaining rows

That is the number this exercise exists to produce, and the honest reading is
**mixed, in a specific and useful way**:

- **Existence is reliable.** Eleven of fourteen implied components have a row.
  The BRD-derived list is not missing whole categories.
- **The misses are the predicted kind.** Both — a KPI tile and a count band — are
  **layout-adjacent and named by no requirement**. `INVENTORY.md` predicted this
  exact failure mode, which is evidence the method is sound even where the output
  was incomplete.
- **Shape is where the risk is, and 1 in 14 is not small.** `LinkedCountCell` is
  wrong in a way that would have survived until implementation, because "a cell
  in the relationship column" is right at the level of description and wrong at
  the level of API.

**Extrapolated across seven screens** — with the caveat that one screen is a weak
base — this predicts roughly **10–15 missed components and 5–7 shape
disagreements** across the app. The shape disagreements are the expensive ones:
each is a requirements question, not a component question.

**The confidence ratings do not predict correctness.** `LinkedCountCell` is rated
**Medium** and is the one that is wrong; `BaseAttentionBanner` is rated **High**
and is unconfirmed. **Rate rows by whether a *prototype* reading confirmed them,
not by how firmly the BRD asserts them** — that is the change this pass suggests
to the candidate list's own method.

---

## What this did NOT establish

- **Nothing about the filter panel or the column chooser.** Both were closed in
  this reading. Two of the fourteen implied components are inferred from the
  existence of a button, not from seeing the panel.
- **Nothing about four of five roles.** The prototype ships one.
- **Nothing about states.** No empty, loading or error state appears, so no
  component was derived for any of them — including `BaseEmptyState`, which this
  screen certainly needs **twice** (see the description's Q7).
