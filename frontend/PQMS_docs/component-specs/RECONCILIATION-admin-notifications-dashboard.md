# Inventory reconciliation — Admin (full), Notifications and Dashboard (derivations)

**Source:** `docs/ux-prototype/ism-qir-se-role/ISM + QIR SE Role - P_C.dc.html`,
md5 `8dca6a22f65b5dda7906a77945c12435` — canonical per `00-core-rules.md`.

**Date:** 2026-08-26. **Scope:** the last three in-scope screens. QIR is excluded
— the app ships no QIR screens and its nav item is deliberately disabled.

**Method note.** Admin was derived from `../screen-descriptions/admin.md`.
Notifications and Dashboard were **not** given screen descriptions, per the
reassessment in `RECONCILIATION-workspace-and-create.md`: neither writes domain
state, so a component derivation captures what they have to give. **Both were
still read from source**, not from a render.

> ⚠️ **A naming trap for anyone reading this prototype.** `dashVals()` is
> commented `// ===== DASHBOARD =====` and builds the **Issue List** — `kpiDefs`,
> `dResultCount`, the row-grouping rule all live in it, and the `d` in
> `dResultCount` is "dash". The **Overview/Dashboard** screen is built by
> `homeVals()`. Reading by function name gets this backwards.

---

## Admin — full reconciliation

### Step 1 — 15 components implied

KPI tile · **job status pill** · job row · **weight slider** · switch · select ·
numeric days input · section card · numbered section header · audit entry row ·
badge · toast · modal · empty state · icon button

### Step 2 — the buckets

**✅ CONFIRMED (12)** — `KpiTile`, `BaseCard`, `BaseSectionHeader`, `BaseSwitch`,
`BaseSelect`, `BaseInput`, `AuditEntryRow`, `BaseBadge`, `BaseToast`,
`BaseModal`, `BaseEmptyState`, `BaseIconButton`.

Two are worth calling out:

- **`BaseSwitch`** — the row predicts *"EWS-only filter toggle; notification
  opt-outs"*. Confirmed here in two more places, with a real track-and-knob
  treatment: the QIR and disposition reminder switches, and the seven source
  channels.
- **`AuditEntryRow`** — *"expandable, before→after values, actor, role,
  timestamp, rationale"*. The configuration audit history is exactly that shape,
  on a non-issue entity. **The component is more general than its row claims.**

**➕ MISSED (3)**

| Missed | Evidence | Why |
|---|---|---|
| **`JobStatusPill`** | `completed` · `running` · `scheduled` · `failed` — four states with their own colours and icons (`check-circle-2`, `loader-circle`, `clock`, `circle-x`) | **Not `BaseStatusPill`.** A completely separate vocabulary that happens to render as a pill. Reusing the issue-status component here would put batch-job states into the issue-status map — the same class of mistake the status escalation is about |
| **`WeightSlider`** | a labelled slider with a sub-label, a live percentage, a filled track, and **membership in a group that must total 100** | The total-100 constraint belongs to the *group*, not the control. Nothing in the candidate list holds a constrained-sum input |
| **`ClassificationTree`** | the taxonomy tree with per-node issue counts, expand/collapse all, add, and a pending-approval queue | **Not `ClassificationPath`.** That renders one four-level path as a value; this is an editable hierarchy. Both exist |

**➖ COULD NOT CONFIRM (1)**

| Row | Claimed | This reading |
|---|---|---|
| **`ScoreBreakdown`** — **High** | *"Factor name, weight, source, value, plus the composite and tier (FR-SCR-003)"* | **The prototype has the factors and weights; the app has no severity scoring at all** (`types.ts`: *"No severity scoring… (out of scope)"*). The component is queued against a subsystem that does not exist in this application. **Not deleted** — the scope decision may be revisited |

**⚠️ DIFFERENT SHAPE (0 new)** — Admin opened no *component* shape disagreement.
It opened two **requirements** questions, both in `../screen-descriptions/admin.md`:
whether severity scoring is in scope at all, and the change-request approval
contradiction below.

### Step 3 — delta

> **For Admin, pass 4 confirmed 12 components, added 3, could not confirm 1, and
> reshaped 0.** — **80%**

---

## Notifications — component derivation

**No screen description.** It writes no domain state: `notifRead:{}` is a
read-marker map, and every row's action is navigation into an issue.

### Components implied (5)

| # | Component | `INVENTORY.md` | Confirmed |
|---|---|---|---|
| 1 | notification panel | `BaseDropdownMenu` — *"notification panel"* named explicitly | ✅ |
| 2 | unread count on the bell | `BaseBadge` — *"unread count on the bell"* named explicitly | ✅ |
| 3 | bell control | `BaseIconButton` | ✅ |
| 4 | category chip | `BaseTag` | ✅ |
| 5 | **notification row** | *(none)* | ➕ **MISSED** |

**➕ `NotificationRow`.** Category icon in a tinted 34 px tile, a **2 px left
border in the category colour when unread**, an unread dot, title, issue
reference, relative time, and a whole-row click that marks read *and* navigates.
Layout-adjacent, named by no FR — the same failure mode as the other seven
misses.

### The category vocabulary is fixed and worth pinning

```js
catMeta = { Critical:{ icon:'octagon-alert' }, Warning:{ icon:'triangle-alert' },
            'Action Required':{ icon:'circle-dot' }, Information:{ icon:'info' } }
```

**Four categories, and `'Action Required'` has a space** — it is a display string
used as a key. The app already types this verbatim
(`NotificationCategory = 'Critical' | 'Warning' | 'Action Required' | 'Information'`,
with the source comment *"the prototype's notification taxonomy… verbatim"`).
**Confirmed.**

### What the derivation confirms and what it does not

- **Confirmed:** the panel shows **five** rows (`notifList: list.slice(0,5)`) with
  a route to all of them; `markAllRead()` exists; opening a notification marks it
  read **and** closes the panel **and** navigates — three effects from one click.
- **Not established:** the all-notifications screen's own layout, and any empty
  state. `BaseEmptyState` is implied but the seed always has six notifications.

> **For Notifications, pass 4 confirmed 4 components, added 1, could not confirm
> 0, and reshaped 0.** — **80%**

---

## Dashboard / Overview — component derivation

**No screen description.** `homeVals()` aggregates and navigates; it writes
nothing.

### Components implied (7)

| # | Component | `INVENTORY.md` | Confirmed |
|---|---|---|---|
| 1 | KPI / metric tile with delta | `KpiTile` *(added by pass 4 for the Issue List)* | ✅ — and it carries a **delta indicator** here that the list's does not |
| 2 | lifecycle health panel | `LifecycleHealthPanel` — *"all eight statuses with counts, distinct colours, drill-through (FR-OVW-008)"* | ⚠️ **see below** |
| 3 | action-item filter tabs | `BaseTabs` — *"Overview's action-item filter"* named explicitly | ✅ |
| 4 | card | `BaseCard` | ✅ |
| 5 | severity/tier chip | `BaseSeverityIndicator` | ✅ *(in the prototype)* |
| 6 | **action-item row** | *(none)* | ➕ **MISSED** |
| 7 | **urgency chip** | *(none)* | ➕ **MISSED** |

**➕ `ActionItemRow`.** The spine of the Overview — a personal work queue where
*every item is assigned to the logged-in user and waiting on their action*
(the source says so in a comment). Each row carries a group, icon, accent, title,
issue id, urgency, due date **or** an overdue tag with a day count, status,
owner, an action verb (*Create*, *Complete*, …) and a handler. **A row with an
action verb is not a list item; it is a task.**

**➕ `UrgencyChip`.** `Critical · High · Medium · Routine`, with their own colour
and tint pairs. **This is a fourth chip family** — after issue status, severity
tier and the A/B/C priority letter — and it is a fourth vocabulary that is not
any of the other three.

### ⚠️ `LifecycleHealthPanel` — a count discrepancy, recorded not resolved

The row says *"all **eight** statuses with counts"*. The prototype renders
`lifecycleStages` as a **five-stage** progression panel subtitled *"Issue
progression"*, with a connector between stages — a **funnel**, not a status
census.

**This is not escalated, for one reason:** the panel's own stage keys
(`draft`, `review`, `pending`, `published`, …) suggest it tracks a
**publication** lifecycle rather than the issue-status lifecycle, and this pass
did not read far enough to be sure. **Recorded as `not confirmed`.**

**It does touch the status escalation, though**, and the touch is worth naming:
`draft` and `pending` appear here as stage names, and both are values
`DEC-01` removed from the issue-status vocabulary. That is now **three** places
in this prototype where `pending` names something — a disposition awaiting
approval, a change request awaiting approval, and a publication stage.
`DECISION-REQUEST-status-vocabulary.md` records the first two; this is a note
that the word is overloaded, not a fourth claim.

> **For Dashboard, pass 4 confirmed 4 components, added 2, could not confirm 1,
> and reshaped 0.** — **57%**, on the smallest sample of the six.

---

# All six screens — the final numbers

| Screen | Implied | Confirmed | Added | Could not confirm | Reshaped |
|---|---|---:|---:|---:|---:|
| Issue List | 15 | 12 (80%) | 3 | 1 | 2 *(one question)* |
| Issue Workspace | 19 | 16 (84%) | 3 | 0 | 1 |
| Create Issue | 15 | 14 (93%) | 1 | 3 | 0 |
| **Admin** | 15 | 12 (80%) | 3 | 1 | 0 |
| Notifications | 5 | 4 (80%) | 1 | 0 | 0 |
| Dashboard | 7 | 4 (57%) | 2 | 1 | 0 |
| **Total** | **76** | **62 (82%)** | **13** | **6** | **3 → 2 questions** |

### What held across six screens

1. **Existence prediction is reliable — 82%.** The BRD-derived list is not
   missing whole categories.
2. **All thirteen misses are layout-adjacent and named by no requirement.**
   Thirteen for thirteen: KPI tile, result band, group expander, priority matrix,
   priority letter chip, change-request card, model-year sub-panel, job status
   pill, weight slider, classification tree, notification row, action-item row,
   urgency chip. **This is now a law of this list, not a tendency.**
3. **Shape disagreements came only from lifecycle-owning screens** — two
   questions, both from the Issue List and the Workspace. Create Issue, Admin,
   Notifications and Dashboard produced **zero** between them, despite Admin and
   Create Issue being large screens.
4. **The reclassification was right, and for the stated reason.** Admin produced
   no component reshape — but it produced **two requirements questions**, and one
   of them (the severity-scoring scope boundary) invalidates a **High**-confidence
   row that three other screens had left standing. A component derivation would
   have found the components and missed both questions.

### The chip-family finding, which nobody was looking for

Six screens surfaced **four separate chip vocabularies**, none reducible to
another:

| Family | Values | Component |
|---|---|---|
| Issue status | Open · Investigating · Monitoring · QIR · Top Issue · NASO · Closed | `BaseStatusPill` ⚠️ *disputed* |
| Severity tier | Critical · High · Medium · Low · Info | `BaseSeverityIndicator` |
| Priority letter | A · B · C | `PriorityLetterChip` *(added)* |
| Urgency | Critical · High · Medium · Routine | `UrgencyChip` *(added)* |
| *(and)* Job status | Completed · Running · Scheduled · Failed | `JobStatusPill` *(added)* |

**Five, in fact.** Severity and Urgency share three of their four labels and are
**different scales** — `Low`/`Info` versus `Routine`. **An implementation that
notices the overlap and merges them is making a domain error that looks like a
refactor.** Recorded here because it is exactly the kind of thing a build gets
wrong in week three.

---

## What remains unread

- **QIR** — out of scope, deliberately. No app screens exist.
- **The Sharing tab** — ASM/PQM only, on the Issue Workspace.
- **Four of the workspace's six tab interiors** — Investigation, Resolution,
  Communication, History. Each is comparable in size to a screen, and the
  Investigation tab is where the change-request escalation lives.
- **The View Issue Group modal**, the linked-issue search modal, and the batch-job
  run-history surface.

**None of these is blocking.** The two open requirements questions —
the relationship model and the status vocabulary — block more than all of them
together.
