# Component Inventory — CANDIDATE

**Status:** CANDIDATE. Not a specification, and **not the pass-4
derivation.**
**Owner:** whoever runs pass 4.
**Derived:** 2026-08-24, from BRD C1.0 rather than from the prototype.

---

## Read this before using the table

`../standards/01-project-structure-and-architecture.md` is explicit, and
it is right:

> Components are named here and there — in this file, in 06, in 11 —
> always incidentally, as examples of some other rule. Those mentions are
> **not** an inventory and must not be assembled into one: a list
> stitched together from scattered examples would be missing whatever no
> rule happened to mention, and nobody would know which.

**This is not that.** It is derived from **screens**, which is the method
01 and 18 both prescribe — but from the **wrong source of screens**. The
correct source is the prototype. This was derived from BRD C1.0's screen
inventory (§8.1), its functional requirements, and its presentation
contract (§8.4), cross-checked against the prototype-derived design spec
and the prior repository's per-component design documents.

**So it is a candidate, and every row carries a `Confirmed` state.**

## The `Confirmed` field — and why it replaced the confidence rating

Every row used to carry **High / Medium / Low**, a rating of *how firmly the BRD
asserts the component*. **That scheme was measured against a real prototype
reading and it does not work.** From the first reconciliation
(`RECONCILIATION-issue-list.md`):

- `LinkedCountCell` was rated **Medium** — and the column it describes **does not
  exist** in the canonical prototype.
- `BaseAttentionBanner` was rated **High** — and is **unconfirmed**; no such
  region appears.
- `BaseDrawer` was rated **Low**, with its open question left for pass 4 — and a
  single line of prototype source **answered it outright**.

**The rating measured the wrong thing.** How confidently a requirement asserts a
control says nothing about whether the design contains it, because the design
moved on and the BRD did not. A rating that is confidently wrong is worse than no
rating: it directs effort at exactly the rows most likely to be stale.

**It is replaced by a field that records evidence rather than conviction:**

| `Confirmed` | Meaning |
|---|---|
| **✅ prototype** | A reconciliation read the canonical prototype and found this component, in this shape. **Spec it.** |
| *(blank)* | **No reconciliation has looked yet.** Not a doubt about the row — an absence of evidence. Most rows are here, and that is expected |
| **⚠️ disagrees** | A reconciliation found the prototype expressing this differently, or not at all. **Stop** — this is a requirements question, and the reconciliation names it |

**Only a reconciliation populates this field.** Not a reading of the BRD, not a
glance at the app, not a plausible inference — the three-step procedure at the
bottom of this file, against the canonical prototype named in
`../standards/00-core-rules.md`. A field anyone may fill is a field nobody can
trust.

**A blank is not a to-do on this file.** It is populated as a side effect of
writing screen descriptions, one screen at a time. Six of seven screens are
unread, so most rows will stay blank for a while, and that is the honest state.

### What the first reconciliation established about this list

**Existence predictions are reliable. Shape predictions are not.**

- **Existence: 12 of 15** components implied by the Issue List have a row here,
  and a thirteenth row was promoted from unconfirmed by reading the filter
  drawer. The list is not missing whole categories.
- **The three misses were all layout-adjacent and named by no requirement** — a
  KPI tile, a result-count band, a group expander. This file predicted that exact
  failure mode, which is evidence the derivation method is sound even where its
  output was incomplete.
- **Shape is where the risk sits, and it concentrates in the biggest row.**
  `BaseDataTable` — already called *"the largest single item"* here — is the one
  reshaped component, because the biggest component carries the most unstated
  behaviour.

**So: use a row's existence, do not use its former rating.** The confidence
column is gone rather than corrected, because a reader who sees a rating will
use it.

## What pass 4 does with this file

Read the prototype, write the screen descriptions (`29`), derive the
inventory from those, then **reconcile against this list** — treating any
disagreement as evidence about *this list*, not about the prototype.

It will find components this table does not name.
`../standards/18-project-context-and-implementation-status.md` already
records one such finding: a distinct icon-only square-button pattern,
ten-plus instances at nine different sizes, that is **not** `BaseButton`
at a small size.

**Treat a Low row as a question, and a missing row as expected.**

## What this file does not authorise

**Building anything.** 01's rule stands: a component is built from its
specification in this folder, written against `TEMPLATE.md`. The
conventions can tell you a component is correctly placed, named and
styled; they cannot tell you it is the right component with the right
interface, and neither can a candidate inventory.

**Expect this list to shrink rather than grow.** Eleven rows are Low or
Medium precisely because they may turn out to be a variant of a
neighbour: `BaseLink` may be `BaseButton variant="link"`, which already
exists; `BaseSearchInput` may be `BaseInput` plus `useDebouncedCallback`;
`BaseDivider` is probably a Tailwind border; `BaseIcon` may be
unnecessary now that the icon library renders components directly.
**Resolving each of those is a decision the spec makes — never build both
sides of one.**

---

## Candidate inventory

Organised by `01`'s eight categories. `n` = the number of BRD screens that need it — a rough priority signal.

### `base/` — single-element primitives

| Component | n | Confirmed | Driven by |
|---|---|---|---|
| `BaseButton` ✅ | all |  | Built |
| `BaseIconButton` | all | ✅ prototype | `18` found 10+ icon-only buttons in the prototype at nine distinct sizes, explicitly **not** instances of the design-system `Button`. `18` calls it "a separate, currently-unspecified component". **Also the WCAG 2.5.8 risk** — its 20px and 22px instances fail the 24px target-size minimum unless padded. |
| `BaseInput` | 6 | ✅ prototype | Title (FR-ENT-006), search (FR-LST-010), part number (FR-INV-010), quantity (VR-21) |
| `BaseTextarea` | 5 | ✅ prototype | Description (FR-ENT-006), every reason gate (LC-01), hypothesis and root cause (FR-INV-009), comments (FR-COM-002). `11` names its `aria-invalid`/`aria-describedby` requirement. |
| `BaseCheckbox` | 3 | ✅ prototype | Row selection (FR-LST-021) with an indeterminate header state; column config (FR-LST-017). `11` requires a real `<input type="checkbox">` with a `<label htmlFor>` and imperative indeterminate. |
| `BaseRadio` | 2 |  | Disposition selection (FR-RES-003, six mutually exclusive values) |
| `BaseSwitch` | 2 | ✅ prototype | EWS-only filter toggle; notification opt-outs (FR-NTF-006). `11` requires `role="switch"` + `aria-checked` on a real `<button>`. |
| `BaseLabel` | all | ✅ prototype | Referenced by every form control; may be internal to each rather than standalone |
| `BaseIcon` | all |  | The Vue `ui-library` had an SVG-based `BaseIcon`. With `lucide-react` rendering components directly, a wrapper may be unnecessary — **decide rather than assume.** |
| `BaseSpinner` | 4 |  | `BaseButton` already inlines one. Async export, save states, scoring's "calculating" state (FR-SCR-001). |
| `BaseAvatar` | 3 | ✅ prototype | Owner cell (§8.4 deterministic avatar colour), profile, comment author. The prototype has an `avatar()` method with its own palette — already partially sourced into `tokens.css`. |
| `BaseLink` | all |  | May be a `BaseButton variant="link"`, which already exists. Resolve when specifying, do not build both. |

### `composite/` — embeddable multi-part input widgets

| Component | n | Confirmed | Driven by |
|---|---|---|---|
| `BaseSelect` | 8 | ✅ prototype | `06` names it "definite, and first" for the React Aria primitive, because `FR-ENT-005` makes its keyboard behaviour **contractual**: type-ahead, arrow keys, Enter, Escape, screen-reader accessible. `11` adds `aria-activedescendant` roving focus. The Vue version was Escape-only, which is why this is stated so firmly. |
| `BaseMultiSelect` | 5 |  | Filter panel — source, model, tier, status, owner, each multi-select with a count badge (FR-LST-011) |
| `BaseCombobox` | 4 | ✅ prototype | The four-level classification cascade (FR-ENT-004/005), including the **"Add new: {value}"** affordance of FR-ADM-005. May be `BaseSelect` with a creatable mode rather than a separate component — a real API decision. |
| `ModelYearPicker` | 2 | ✅ prototype | **Added by pass 4.** A bordered sub-panel under the Model Code combobox: checkboxes over the **union** of the code's nominal years and any year actually recorded against the issue, so a real out-of-range year still appears, checked. The union rule is the component, not the checkboxes |
| `BaseTypeahead` / `BaseChipInput` | 2 |  | DTC entry (FR-ENT-007): multiple codes, removable chips, ≤20, ≤200ms per keystroke (NFR-P-007). The Vue project had `DtcTypeahead` + `DtcChipValue`. |
| `WeightSlider` | 1 | ✅ prototype | **Added by pass 4.** A labelled slider with sub-label, live percentage and filled track — but the component is the **group**: four of them must total exactly 100, the save is disabled and the badge reads "Must equal 100% — currently n%" until they do. A constrained-sum input has no counterpart in this list |
| `BaseSearchInput` | 3 | ✅ prototype | Debounced at 300ms (FR-LST-010) via `useDebouncedCallback`. May be `BaseInput` + the hook, not a component. |
| `BaseDateRangePicker` | 2 | ✅ prototype | Filter date range (FR-LST-011, VR-14/VR-28); history date filtering (FR-HIS-005). `06` marks its primitive decision **Undecided** — grid keyboard navigation is genuinely complex. |
| `BaseFileDropzone` | 3 | not confirmed | FR-DOC-001…008: drag-and-drop, per-file state, 25 MB / 500 MB caps, scan state. Vue had `AttachmentsDropzone` + `SourceFieldAttachments`. `12` defers its performance guidance on this component existing. |
| `BaseMarkdownEditor` | 1 |  | Communication (FR-COM-002). Already has its subpath entry point wired (`14`'s heavy-dependency exclusion). `12` requires `React.lazy` + `Suspense` **scoped narrowly around the editor itself**, never the surrounding form. |

### `data/` — grids and their cell renderers

| Component | n | Confirmed | Driven by |
|---|---|---|---|
| `BaseDataTable` | 4 | ⚠️ **disagrees** | Issue List, linked-issues modal, admin taxonomy, user administration. `03` states plainly that its column API "is a specification this corpus does not contain" and lists seven unanswered questions plus three unaccounted-for states. `12` adds five more about virtualization and instructs pass 4 to read them **before** finalising. |
| `MultiValueCell` | 1 | ✅ prototype | `01` names it. Primary value inline, remainder behind a `+N` popover on **hover and keyboard focus**, consecutive years collapsing to a range (§8.4, FR-LST-006). |
| `TruncatedTextCell` | 1 |  | `01` names it. FR-LST-001: complete IDs and titles visible or reachable by hover. |
| `SeverityCell` | 1 |  | Bar + numeric, coloured by tier (FR-LST-001, BR-S03) |
| `StatusCell` | 1 | ✅ prototype | Pill with a colour dot from the single status map (§8.4) |
| `OwnerCell` | 1 |  | Avatar + name |
| `LinkedCountCell` | 1 | ⚠️ **disagrees** | Count chip, or an em dash at zero; opens `ISM-LNK` (FR-LST-001) |
| `JobStatusPill` | 1 | ✅ prototype | **Added by pass 4.** Batch-job states — Completed · Running · Scheduled · Failed — each with its own colour and icon. **NOT `BaseStatusPill`**: a separate vocabulary that merely renders as a pill. Reusing the issue-status component here would put batch states into the issue-status map |
| `BasePagination` | 3 | ✅ prototype | 20/50/100, "Showing X–Y of Z", page controls (FR-LST-023) |
| `GroupExpanderCell` | 1 | ✅ prototype | **Added by pass 4.** The canonical prototype's Issue List groups rows: one top-level row per group, anchored on the Parent, other members nested, expansion per row (`grpExp`, `toggleGroupRow`). **Its existence is contingent on the escalated relationship question** in `RECONCILIATION-issue-list.md` — do not spec it until that is answered |
| `ResultCountBand` | 3 | ✅ prototype | **Added by pass 4.** A distinct region above the table — "Showing *n* of *total* issues" plus a row-selection hint. **Not part of `BasePagination`**: its denominator is the whole dataset while the pager's is the result set, and conflating the two is defect **D-6** |
| `BaseColumnConfig` | 1 | ✅ prototype | Show/hide optional columns; Issue ID cannot be hidden; reset to role default (FR-LST-017…019) |

### `feedback/` — non-interactive status communication

| Component | n | Confirmed | Driven by |
|---|---|---|---|
| `KpiTile` | 3 | ✅ prototype | **Added by pass 4.** Icon chip, count, share-of-total percentage, label — and **it is a filter control, not a read-out**: selecting one sets the status filter and the tile takes a selection border. Layout-adjacent and named by no FR, which is why the BRD derivation missed it |
| `BaseStatusPill` | 5 | ⚠️ **disagrees** | The single status map (§8.4). Never hand-coloured, never paraphrased. Note the remap in `06`. **Existence confirmed on the Issue List; SHAPE disputed on the Workspace** — the canonical prototype's propose→approve flow writes `pending` and `disposed`, and its own status map contains neither, so both render as "Open" by fallback. See `RECONCILIATION-workspace-and-create.md`. |
| `PriorityLetterChip` | 2 | ✅ prototype | **Added by pass 4.** A third chip family — neither status nor severity. Bands A / B / C from the manual priority matrix; **absent, not defaulted, while unscored**, and it gates Create QIR |
| `UrgencyChip` | 1 | ✅ prototype | **Added by pass 4.** Critical · High · Medium · **Routine**, on the Overview's action items. **A fourth chip family**, and it shares three of four labels with the severity tier while being a different scale — `Routine` where severity has `Low`/`Info`. **Merging the two is a domain error that looks like a refactor** |
| `BaseSeverityIndicator` | 4 | ✅ prototype | Score + tier, consistent everywhere (BR-S03, §8.4) |
| `BaseBadge` | all | ✅ prototype | Count badges on tabs, unread count on the bell, "Pending Admin Approval" on a proposed classification value (FR-ADM-005) |
| `BaseTag` | 3 | ✅ prototype | Source channels, DTC chips, match indicators |
| `BaseToast` | all | ✅ prototype | `03` routes mutation errors here; `06`'s voice rules describe toast copy; nothing has specified it. See proposed tier `22`. |
| `BaseSkeleton` | all |  | FR-LST-029, FR-OVW-012: skeletons, never a spinner over stale data |
| `BaseEmptyState` | all | ✅ prototype | FR-LST-027 and the **two distinct** empty states of proposed tier `22` — no-data versus no-match |
| `BaseErrorState` | all |  | FR-LST-028: inline, retry, filters preserved |
| `BaseAttentionBanner` | 2 | not confirmed | FR-LST-008/009 — attention banners above the Issue List. **Named in no corpus file** (G-BRD-06). |
| `BaseStaleDataIndicator` | 3 |  | FR-MST-003: cached data served with a visible staleness marker. Easy to forget; it is a fourth state. |
| `BaseProgress` | 1 |  | Async export progress (FR-JOB-008). May be a toast instead. |

### `layout/` — structural containers

| Component | n | Confirmed | Driven by |
|---|---|---|---|
| `BaseCard` | all | ✅ prototype | The dominant surface. §8.4: 14–16px radius, hairline border, the card elevation token. |
| `BasePanel` | 4 |  | Filter panel, workspace sections, Overview widgets. May be `BaseCard` with a header — resolve, do not build both. |
| `BaseSectionHeader` | 3 | ✅ prototype | Workspace section headings, Overview widget titles |
| `BaseDivider` | all |  | Probably a Tailwind border, not a component |

### `navigation/` — wayfinding

| Component | n | Confirmed | Driven by |
|---|---|---|---|
| `BaseTabs` | 3 | ✅ prototype | Workspace's five sections, Overview's action-item filter, History's two views. `03` carries an **open API choice** — config-driven (the Vue incumbent, which shipped and worked) versus a compound `Tabs.List`/`Trigger`/`Panel` API — and `06` notes the primitive only applies if the compound API is chosen. Decide when specifying. |
| `BaseBreadcrumb` | all |  | NAV-06: derived from the route, never hand-maintained per screen |
| `BaseScopeTabs` | 2 | ✅ prototype | My/All with count badges (FR-LST-002/003). May be `BaseTabs` with a count slot. |
| `BaseStepRail` | 1 | not confirmed | Issue Entry's step progress. Interacts with WCAG 3.3.7 Redundant Entry, which `11` marks **live**. |
| `BaseNavItem` | 1 |  | Currently internal to `AppHeader`. Promote only if a second consumer appears. |

### `overlay/` — portaled content

| Component | n | Confirmed | Driven by |
|---|---|---|---|
| `BaseModal` | 6 | ✅ prototype | `06`: **yes** to the primitive — focus trap, initial focus, focus restore are its whole job, and hand-rolling all three is the classic source of a dialog that traps a screen reader. `11` requires `aria-labelledby` at the rendered heading, **never** an `aria-label` duplicating the title. `01` places it in `overlay/`, not `layout/`. |
| `BaseReasonGate` | 5 | ✅ prototype | `01` and `11` both name it. Built **on** `BaseModal`, inheriting its focus management. Every status change (LC-01, ≥10 chars), every classification change (VR-14), disposition rationale (VR-16/17), score override (VR-18), gated-transition rejection (VR-13). The most-used modal in the product. |
| `BaseTooltip` | all |  | `06`: **probably not** a primitive — small enough to write correctly. `11`: `aria-describedby` only while open, `role="tooltip"`, **hover and focus** both. |
| `BasePopover` | 3 |  | The `+N` multi-value popover (§8.4), and it must open on keyboard focus. `18` records that **no standard specifies dropdown or popover keyboard behaviour at all**. |
| `BaseDropdownMenu` | 3 | ✅ prototype | Bulk-action menu, notification panel, profile menu. `18` records the resolved `aria-haspopup` question here: a disclosure region uses `aria-expanded` + `aria-controls` and **does not** claim `aria-haspopup` unless it is a real menu. |
| `BaseDrawer` | 1 | ✅ prototype | **Question answered.** The row used to read *"may be a drawer or an inline panel — prototype question"*. The canonical prototype opens the filter panel as a **drawer** (`openFilterDrawer`), and so does Columns. The app already agrees. |

### `pqms/` — domain-specific, non-generic

`01` defines this category and nothing has been placed in it. These are the components that encode domain meaning and
would be nonsense in another product.

| Component | n | Confirmed | Driven by |
|---|---|---|---|
| `IssueIdLink` | 5 | ✅ prototype | Monospace, format-validated, navigates to the Workspace (§8.4, FR-LST-004) |
| `ClassificationTree` | 2 | ✅ prototype | **Added by pass 4.** The Admin taxonomy tree: hierarchy, per-node issue counts, expand/collapse all, add, and the **Pending Admin Approval** queue. **NOT `ClassificationPath`** — that renders one four-level path as a value; this is an editable hierarchy. Both exist |
| `NotificationRow` | 2 | ✅ prototype | **Added by pass 4.** Category icon in a tinted 34px tile, a 2px left border in the category colour **while unread**, an unread dot, title, issue reference, relative time. One click marks read, closes the panel **and** navigates — three effects |
| `ActionItemRow` | 1 | ✅ prototype | **Added by pass 4.** The Overview's personal work queue — *"every item is assigned to the logged-in user and waiting on their action"*. Group, icon, title, issue id, urgency, due **or** an overdue tag with a day count, status, owner, and an **action verb** (Create, Complete…). A row with a verb is a task, not a list item |
| `ClassificationPath` | 4 | ✅ prototype | The four-level path rendered as one value; before→after in audit history (FR-WSP-016) |
| `SourceChannelBadge` | 3 | ✅ prototype | One icon per channel, always the same one, across list, entry, workspace and export (§8.4) |
| `CorrelationSuggestionCard` | 2 | not confirmed | Match reason, match indicator, and eight attributes (FR-ENT-011/012). Vue had `SameExistingIssueCard`. |
| `LinkedIssueCard` | 2 | ✅ prototype | ID, title, classification, status, link origin (FR-LNK-001). Vue had exactly this. |
| `LifecycleHealthPanel` | 1 | not confirmed | All eight statuses with counts, distinct colours, drill-through (FR-OVW-008) |
| `ActivityTimelineItem` | 2 | ✅ prototype | Oldest-first with **day-gap markers** between non-consecutive days (FR-INV-007) |
| `AuditEntryRow` | 1 | ✅ prototype | Expandable, before→after values, actor, role, timestamp, rationale (FR-HIS-003/006) |
| `ApprovalBar` | 2 | ✅ prototype | Shown to an `override` role when a proposal awaits their decision (FR-WSP-024, FR-RES-007). Named in the prototype's design spec. |
| `PriorityMatrix` | 1 | ✅ prototype | **Added by pass 4.** The Issue Priority tab's manual scorer: 17 items in 3 categories, 1–3 points each, total → letter (≥26 → A, ≥11 → B, else C), manual override with the calculated letter still shown, **draft until Save**. **Not `ScoreBreakdown`** — that renders the automatic severity score read-only. Both exist |
| `ChangeRequestCard` | 2 | ✅ prototype | **Added by pass 4.** The requester-side view of an admin approval: current value → proposed value, reason, requester and date, plus *"Admin comment:"* on rejection and *"Approved by / Approved on"* on approval. Pairs with `approveCr()` on the Admin screen |
| `ScoreBreakdown` | 1 | not confirmed | Factor name, weight, source, value, plus the composite and tier (FR-SCR-003). **The prototype has the factors and the four Admin weights; this application has no severity scoring at all** — `apps/portal/src/data/types.ts` records it as out of scope, and `autoScore` appears nowhere. Queued against a subsystem that does not exist here. See `RECONCILIATION-admin-notifications-dashboard.md` |
| `PartsRequestCard` | 1 |  | Part number, quantity, urgency, purpose, needed-by, approval state (FR-INV-010…013) |
| `SourceEvidencePanel` | 2 | ✅ prototype | One per channel, eight variants, field sets in BRD Appendix C (FR-ENT-008/009) |
| `DispositionSelector` | 1 | ✅ prototype | Exactly six values, with the rationale gate (FR-RES-003/004) |
| `StatusChangeDialog` | 2 | ⚠️ **disagrees** | Valid targets only per §9.3, mandatory reason, plus the conditional fields for `MONITORING` (frequency, next review) and `OUT_OF_SCOPE` (department) — FR-WSP-020…027. **Blocked on the same question as `BaseStatusPill`** — a valid-target list cannot be specified while two lifecycle values sit outside the status map. |

**Candidate total: 82 shared components** after pass 4 added thirteen — 12 `base/`, **10** `composite/`, **12** `data/`, **14** `feedback/`, 4 `layout/`, 5 `navigation/`, 6 `overlay/`, **19** `pqms/`. Two are built.

**Pass 4 is complete for every in-scope screen.** Six reconciled — Issue List,
Issue Workspace, Create Issue, Admin, Notifications, Dashboard; QIR excluded, the
app ships no QIR screens.

> **76 components implied, 62 confirmed (82%), 13 added, 6 not confirmed, 3
> reshaped into 2 requirements questions.**

**All thirteen additions are layout-adjacent and named by no requirement** —
thirteen for thirteen. That is now a law of this list rather than a tendency:
*the BRD derivation misses exactly what no FR names.*

**Both shape disagreements came from lifecycle-owning screens.** Create Issue,
Admin, Notifications and Dashboard produced none between them despite two of
them being large. Delta counts per screen are in
`RECONCILIATION-workspace-and-create.md` and
`RECONCILIATION-admin-notifications-dashboard.md`.

**Expect this to shrink, not grow — but the first screen grew it.** Pass 4 added three and deleted none, because the misses were layout-adjacent components no requirement names. Several rows may still turn out to be a variant of a neighbour rather than a component — `BaseLink` may be `BaseButton variant="link"`, which already exists; `BaseSearchInput` may be `BaseInput` plus `useDebouncedCallback`; `BaseDivider` is probably a Tailwind border; `BaseIcon` may be unnecessary now that `lucide-react` renders components directly. **Resolving each of those is a decision the spec makes — do not build both sides of one.** A realistic post-pass-4 figure is 55–65.

---

## Build order

Ordered by **what unblocks the most downstream work**, then by risk. The rule from `01` holds throughout: **a spec
before a component, every time.**

### Wave A — the spine (nothing renders without these)
`BaseInput` · `BaseTextarea` · `BaseLabel` · `BaseCheckbox` · `BaseIconButton` · `BaseCard` · `BaseBadge` ·
`BaseSkeleton` · `BaseSpinner`

Low-risk, high-fan-out, no primitive needed. `BaseIconButton` is here rather than later because `18` found it is
already needed and is **not** `BaseButton` at a small size.

### Wave B — the risky primitives (do these early, not late)
`BaseSelect` → `BaseMultiSelect` → `BaseCombobox` · `BaseModal` → `BaseReasonGate` · `BaseTooltip` · `BasePopover`

**`BaseSelect` first**, per `06`. Two reasons to front-load this wave: `FR-ENT-005` makes the keyboard behaviour
contractual, and `11`'s a11y rules are at `"error"` — so a half-correct implementation **fails the build**, which `11`
warns is "an implementation-sized piece of work, not a warning to triage". Finding that out in Wave B is survivable;
finding it out the week before a demo is not.

`BaseReasonGate` immediately after `BaseModal` because it is the most-used modal in the product and it inherits its
focus management by composition.

### Wave C — the table
`BaseDataTable` + `MultiValueCell` + `TruncatedTextCell` + the four typed cells · `BasePagination` ·
`BaseColumnConfig`

**Do not start until its specification is written**, and the specification must answer `03`'s seven open questions,
its three unaccounted-for states, and `12`'s five virtualization questions — **starting with `12`'s Question 0
(maximum page size), which may close the virtualization item outright** since sort, page and page size are already
client state.

### Wave D — feedback and status
`BaseStatusPill` · `BaseSeverityIndicator` · `BaseTag` · `BaseToast` · `BaseEmptyState` · `BaseErrorState` ·
`BaseAttentionBanner` · `BaseStaleDataIndicator`

`BaseStatusPill` depends on the status-colour remap in `../standards/06-styling-and-design-tokens.md` being resolved — two of the BRD's eight
statuses currently have no colour.

### Wave E — navigation and layout
`BaseTabs` (after its config-versus-compound decision) · `BaseBreadcrumb` · `BaseScopeTabs` · `BaseStepRail` ·
`BasePanel` · `BaseSectionHeader`

### Wave F — domain components
The `pqms/` set, built as each screen needs it. These are the cheapest to get wrong late and the cheapest to change,
because each has exactly one or two consumers.

### Wave G — deferred, with named triggers
| Component | Trigger |
|---|---|
| `BaseMarkdownEditor` | The Communication section. `12` requires the narrow `Suspense` + `ErrorBoundary` scoping; `13` requires the escape-before-render property stated at the call site. |
| `BaseFileDropzone` | The first attachment surface. Unblocks `12`'s deferred upload guidance. |
| `BaseDateRangePicker` | The Issue List filter panel. Its primitive decision is still `Undecided` in `06`. |
| `BaseDrawer` | **Trigger met.** The canonical prototype opens the filter panel as a **drawer** (`openFilterDrawer`), and the app already does the same. This row is confirmed and no longer deferred. |
| Any chart | **Blocked on a library decision nobody has made.** `11` and `12` both defer on it, `18` tracks both. The BRD's Overview specifies no charts, so this may be genuinely out of Phase-1 scope — say so rather than leaving it open. |

---

## Specification-writing order

`01` forbids building without a spec, so **this order gates the build order above** and is the real critical path.

1. **`BaseDataTable`** — first, despite being Wave C. It is the largest, it has the most unanswered questions, it
   deadlocks with `12` if left late, and its answers constrain three other components' APIs.
2. **`BaseSelect`** — contractual keyboard behaviour; its answers shape `BaseMultiSelect` and `BaseCombobox`.
3. **`BaseModal`** — `BaseReasonGate` composes from it, so its focus contract is load-bearing for five surfaces.
4. **Wave A**, as a batch — nine specs that are each short, and writing them together keeps the prop vocabulary
   consistent across the primitives.
5. **`BaseTabs`** — needs its config-versus-compound decision first, which is a real open item in `03`.
6. Everything else, in build order.

**Each spec is written against `component-specs/TEMPLATE.md`**, with its two authoring rules applied literally:
enumerate only what the prototype shows, and say what governs each decision. `TEMPLATE.md`'s review procedure — four
questions, in order, with the prototype open — is what approves it. **A spec is not approved by being written.**

---

---

## The reconciliation procedure — how this list stops being a candidate

Pass 4 is not "read the prototype and rewrite this file". It is a mechanical
comparison whose **output includes a record of what was wrong here**, because
that record is what tells you how much to trust the next candidate list anyone
produces.

**Step 1 — derive independently.** Write the screen descriptions
(`../standards/29-screen-description-authoring.md`) from the prototype files,
then list the components each description implies. **Do not open this file while
doing it.** A candidate list read first becomes the answer you look for, and the
components it omits stay omitted.

**Step 2 — compare, and classify every difference into one of four buckets:**

| Difference | What it means | Action |
|---|---|---|
| In both, same shape | the BRD and the prototype agree | promote to CONFIRMED, spec it |
| In the prototype, not here | this list missed it | add it; **expected, especially for icon-only and layout-adjacent components** |
| Here, not in the prototype | inferred from a requirement with no visual counterpart | delete it, or record why it survives |
| In both, different shape | the interesting case | **stop** — the BRD and the prototype disagree about behaviour, which is a `00` case 4 |

**Step 3 — record the delta count**, not just the corrected list. "Pass 4 added
14 components, deleted 6 and reshaped 3" is the single most useful sentence for
whoever plans the next component effort.

**The fourth bucket is the one that matters.** A shape disagreement between the
BRD and the prototype is not a component question, it is a requirements
question, and resolving it by picking the prettier option is how a build ends up
implementing neither.

## What to do with each `Confirmed` state

**✅ prototype** — **spec it.** A reconciliation read the canonical prototype and
found it in this shape. This is the only state that authorises specification
work, and it is the state the old **High** rating pretended to be.

**blank** — **read its screen first.** The row is not in doubt; nothing has
looked. Writing a spec from a blank row means guessing the props and then
discovering the guess — which is what the old **Medium** rating licensed.

**⚠️ disagrees** — **treat the row as a question, not a work item**, and read
the reconciliation that raised it. Its resolution decides whether the component
exists at all, and in what shape. A disagreeing row that reaches a sprint board
unresolved becomes a component somebody builds to close a ticket, in whichever
shape the ticket happened to describe.

**The states are not a priority order.** A blank row is not lower priority than a
confirmed one; it is unread. The way to move a row is to write its screen
description, not to raise its rating.

**Absent** — expect it. `../standards/18-project-context-and-implementation-status.md`
already records one component this list does not name: a distinct icon-only
square-button pattern, ten-plus instances at nine different sizes, which is
**not** `BaseButton` at a small size. That was found by reading the prototype,
which is precisely the method this list did not use.

## Resolve the pairs before building either side

Several rows may be a neighbour in disguise. Each
of these is **one decision that eliminates one row** — and building both sides
is the failure mode, because two components with overlapping purposes never get
merged afterwards.

| Candidate | Likely resolution | Decide when |
|---|---|---|
| `BaseLink` | `BaseButton variant="link"`, which already exists | before any navigation-styled control is built |
| `BaseSearchInput` | `BaseInput` + `useDebouncedCallback`, unless it owns clear/loading affordances | when the first search field is specified |
| `BaseDivider` | a Tailwind border utility, not a component | immediately — this is not a decision worth deferring |
| `BaseIcon` | probably unnecessary; the icon library renders components directly | when the icon size scale is authored (`06`) |
| `BaseSpinner` | may be `BaseSkeleton`'s job; the two answer different questions (unknown duration vs known layout) | when the first loading state is built |

**The rule:** whichever way each resolves, the losing name never appears in the
codebase — not as a re-export, not as a deprecated alias. An alias is how both
sides end up used.

## Build readiness — what actually blocks each wave

The waves order components by dependency. These are the **external** blockers,
which are the ones that stall a wave that otherwise looks ready:

| Blocker | Blocks | Owner |
|---|---|---|
| Token scales authored whole (`06`) | **every wave** — a component built against provisional tokens is rebuilt | designer + Frontend Lead |
| Hues for `TOP_ISSUE` and `OUT_OF_SCOPE` | `BaseStatusPill` and anything rendering a status | designer, via the prototype |
| Control-height scale clearing 24px (SC 2.5.8) | every interactive component | `06`, at authoring time |
| The headless primitive choice (`06`) | all overlays — modal, dropdown, tooltip, popover | Frontend Lead |
| A screen description | **every blank `Confirmed` row** | whoever runs pass 4 |
| The fixed-height layout decision (`07`) | the table, and anything with its own scroll region | **resolved — a fourth layout** |
| **The relationship model — link-count column or grouped rows?** | `BaseDataTable`, `LinkedCountCell`, `GroupExpanderCell` | **architect + domain owner** — see `RECONCILIATION-issue-list.md` |
| **The status vocabulary — are `pending` and `disposed` statuses?** | `BaseStatusPill`, `StatusChangeDialog`, `KpiTile`, the filter panel | **architect + domain owner** — see `RECONCILIATION-workspace-and-create.md` |

**The first row is the one that gets skipped.** Building "just the button" against
a provisional token set feels safe and is not: every subsequent component
inherits the provisional values by copying the button.

## What this file is worth, stated plainly

**As a planning instrument: reliable.** The wave ordering, the dependency
structure, the resolution pairs and the blocker list above are derived from
requirements and from architecture, and pass 4 will not change them much.

**As a source for building: it is not one, and no amount of refinement makes it
one.** `../standards/01-project-structure-and-architecture.md`'s rule stands — a
component is built from its specification, written against `TEMPLATE.md`, and
the conventions can tell you a component is correctly placed, named and styled
but never that it is the right component with the right interface.

Use it to plan the effort, sequence the work and name the blockers. Do not use
it to open a file.
