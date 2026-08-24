# KIA N-PQMS V2
## Business Requirement Document

**Module:** Issue Management (ISM)
**User Role:** SE (Service Engineer)
**Screens covered:** Dashboard · Issue List · Issue Entry · Issue Workspace
**Document status:** Baseline — derived from the interactive SE-role prototype (`ISM SE Role`). Extend as further screens/screenshots are provided.
**Prepared as:** Enterprise functional specification for business, UX, development and QA.

> Reading note: rules marked **[Assumption]** are inferred from enterprise UX standards where the design does not make the behaviour explicit. Anything that cannot be determined is captured in Section 17 (Open Questions) rather than invented.

---

# 1. Overview

### Project Overview
KIA N-PQMS V2 (Next-generation Parts Quality Management System) is an enterprise web platform used by Kia quality and after-sales organisations to capture, assess, action and close product-quality issues arising from the field. The platform is organised into modules; this document specifies the **Issue Management (ISM)** module as experienced by the **Service Engineer (SE)** role.

The ISM module lets operators consolidate quality signals from multiple upstream channels (warranty, Weibull reliability, dealer comebacks, Techline, field product-quality reports, early-warning system alerts, and the global GQIS feed), create structured issues, score their severity, drive them through a governed lifecycle, and escalate to a Quality Issue Report (QIR) when warranted.

### Business Objective
- Provide a single, auditable system of record for field-quality issues across all source channels.
- Reduce time-to-detection and time-to-containment for high-severity quality problems.
- Standardise issue severity scoring so prioritisation is consistent, explainable and defensible.
- Ensure every material change to an issue is captured in an immutable audit trail suitable for compliance and regulatory review.

### Module Objective (ISM)
- Capture issues with complete, source-specific evidence so downstream scoring and disposition are traceable.
- Give each role a prioritised, filtered view of the issues that require their action.
- Enforce the issue lifecycle (Draft → Open → In Review → Pending Approval → Disposed / Monitoring → Closed, with an Escalated branch) with role-based permissions and mandatory justifications.
- Connect issues to related QIR and TSB records for cross-module continuity.

### Primary Users
| Role code | Title | Capability | Default data scope |
|---|---|---|---|
| SE | Service Engineer | `read` (propose, not approve) | My issues (own) by default; can view all |
| ASM | After-Sales Manager | `override` (approve/override) | All issues |
| PQM | Product Quality Manager | `override` (approve/override) | All issues |

This BRD is scoped to **SE**. ASM/PQM behaviour is referenced only where it constrains SE actions (e.g. approvals). A separate document should specify ASM/PQM fully.

### Dependencies
- **Vehicle / VIN master data** — model, model year, variant, plant, production date, VIN ranges.
- **Warranty & claims data (INT-03)** — claim counts, IPTV rate, repair cost, dealer region.
- **Population / GQIS data (INT-01)** — VIN population exposure, global quality incidents.
- **SAP material master (INT-04)** — part-number lookup for parts requests.
- **Scoring engine** — automatic severity computation on submit and on data refresh.
- **Notification / email gateway** — reminders, escalations, system notifications.
- **Authentication & role service** — role resolution and permission enforcement.

### Related Modules
- **QIR Management** (Quality Issue Report) — issues escalate into QIRs.
- **TSB Management** (Technical Service Bulletin) — disposition outcomes may become TSBs.
- **Issue Administration** — scoring weights, reminder policy, source-channel toggles, batch jobs (admin role).

### Assumptions
- **[Assumption]** Authentication is single-sign-on; the active user's role is resolved by an identity service. The in-app role switch is a prototype affordance and would be replaced by real SSO role assignment in production.
- **[Assumption]** All timestamps are stored in UTC and rendered in the user's local timezone.
- **[Assumption]** All list/grid data is server-paginated and server-filtered at production scale.
- **[Assumption]** Attachments are stored in a managed object store with virus scanning at upload.

### Out of Scope
- ASM/PQM-exclusive administration screens (scoring weight governance, reminder policy, batch-job control) beyond references needed for SE workflow.
- QIR, TSB and Analytics module internals (specified in their own BRDs).
- Master-data maintenance (vehicle, dealer, part master).
- Reporting/BI beyond the on-screen KPIs and export actions.

---

# 2. User Role — Service Engineer (SE)

### Description
The Service Engineer is the front-line quality operator. The SE triages incoming quality signals, creates and enriches issues with evidence, reviews auto-computed severity, proposes dispositions, requests parts for investigation, communicates with stakeholders, and escalates high-severity issues to QIR. The SE **proposes** decisions; approval authority rests with ASM/PQM.

### Responsibilities
- Monitor assigned and team issues from the Dashboard command centre.
- Create new issues with complete, source-appropriate evidence.
- Validate and, where permitted, request re-scoring of severity.
- Investigate root cause; record hypotheses, DTCs and evidence.
- Propose a disposition (Field Action, TSB, Service Action, Safety Campaign, Monitoring, or No action).
- Escalate qualifying issues to QIR.
- Maintain communication threads and keep the issue record audit-complete.

### Permissions (SE)
- View issues (own + all, scope-toggle).
- Create issues; save drafts; submit issues.
- Edit **Draft** issues and inline-edit issue Overview fields.
- Request parts; add comments; upload attachments.
- Propose disposition; request re-score; escalate to QIR.
- Export the issue list.

### Restrictions (SE)
- **Cannot approve** dispositions (approval requires ASM/PQM `override` capability).
- **Cannot override** the severity score directly — SE may *request* a re-score; only `override`-capable roles apply a manual override with justification.
- **Cannot edit Closed issues** — Closed records are read-only.
- **Cannot access** the "Sharing" workspace tab (visible to ASM/PQM only).
- **[Assumption]** Cannot delete issues or attachments authored by other users; cannot hard-delete audit records.

### Navigation Scope
Primary navigation available to SE: **Dashboard, Issue Management, QIR Management, TSB Management.** Utilities: Help, Notifications. The SE lands on the **Dashboard (SE command centre)** by default.

### Accessible Modules
Dashboard, Issue Management (List, Entry, Workspace), QIR Management (view/create/escalate), TSB Management.

### Hidden / Restricted Modules for SE
- Issue Administration (scoring weights, reminder policy, source toggles, batch jobs) — **[Assumption]** admin-only.
- Workspace "Sharing" tab — ASM/PQM only.

### Role-specific actions
Propose (not approve) disposition; request (not apply) score override; escalate to QIR; request parts.

---

# 3. Screen Inventory

| Screen ID | Screen Name | Description |
|---|---|---|
| ISM-SCR-01 | Dashboard (SE Command Centre) | Role-aware home: system health, action items, attention-required, recently accessed, lifecycle health. |
| ISM-SCR-02 | Issue List | Filterable, sortable, selectable issue queue with KPI strip and bulk actions. |
| ISM-SCR-03 | Issue Entry (Create/Edit) | Five-step structured issue capture with source-conditional evidence. |
| ISM-SCR-04 | Issue Workspace | Full issue detail across ten tabs (Overview → History/Sharing). |
| ISM-SCR-05 | Issue Workspace Launcher | Open-an-issue-by-ID entry point. |
| ISM-SCR-06 | Notifications (full page) | Complete notification feed. |
| ISM-SCR-07 | Issue Administration | Weights, reminders, source toggles, batch jobs (admin). |
| ISM-SCR-08 | QIR List / New QIR / QIR Workspace / QIR Analytics | Related QIR module screens. |
| ISM-SCR-09 | TSB Management | Related TSB module (placeholder in current build). |

---

# 4. Dashboard (ISM-SCR-01)

## Purpose
Give the SE an at-a-glance, prioritised command centre: what the SE must act on, what deserves attention, the health of the issue portfolio, and quick re-entry to recently touched records.

## Navigation
- Landing screen for SE on login.
- Reached from the header logo and the "Dashboard" primary-nav item.
- Every widget row/card is a drill-down that navigates to a filtered Issue List or an Issue Workspace.

## Layout Structure
1. **Header** (global, sticky).
2. **Greeting block** — salutation, sub-line, role chip, last-login.
3. **Row 1 — System Health** — three metric cards, each with three stat cells.
4. **Two independent columns:**
   - **Left:** My Action Items (tabbed, scrollable) · Recently Accessed.
   - **Right:** Attention Required · Lifecycle Health.

## Header
| Element | Description | Behaviour / Business rule |
|---|---|---|
| Logo (Kia PQMS) | Brand mark, dark tone | Click → navigates to Dashboard. |
| Primary nav | Dashboard · Issue Management · QIR Management · TSB Management | Active item is emphasised; click routes to that module. |
| Help | Circle-help icon button | **[Assumption]** Opens contextual help/support. |
| Notifications | Bell icon with unread count badge | Click toggles a dropdown panel (see below). Badge shows unread count; hidden when zero. |
| Notifications dropdown | Panel listing categorised items | Each row: category eyebrow, title, related record ID (mono), relative time, unread dot. "Mark all read" clears unread count. Clicking a row navigates to the related record. Outside click closes the panel. |
| Role switch | SE / ASM / PQM selector | Switching role re-applies permissions and data scope; SE → "my issues" scope, ASM/PQM → "all". Emits an info toast: "Viewing as {name} — {role} — permissions applied." (Prototype affordance; production uses SSO role.) |
| Breadcrumb | Screen label derived from active screen | Map: Dashboard, Issue List, Issue Entry, Issue Workspace, Issue Administration, TSB Management, QIR List, etc. |
| Search | *(Global search not present in header in current build.)* | See Open Questions. List-level search exists on the Issue List. |
| Profile / avatar | Current user identity | **[Assumption]** Profile menu (account, sign-out) — not detailed in current build. |

## Dashboard Widgets

### Widget 4.1 — Greeting block
- **Purpose:** Orient the user; confirm identity, role and session recency.
- **Displayed fields:** Greeting (time-of-day + name), sub-line, role chip (e.g. "Service Engineer"), last-login timestamp.
- **Business logic:** Salutation varies by time of day. **[Assumption]** Last-login is the previous session start.
- **Visibility:** Always. **Permissions:** All roles. **Empty/Loading/Error:** Not applicable (identity always present); **[Assumption]** show skeleton while identity resolves.

### Widget 4.2 — System Health cards (Row 1)
- **Purpose:** Situational awareness across three health domains, each summarised by three stats.
- **Displayed fields:** Card title + icon; three stat cells (value + label).
- **Business logic / calculation:** Each stat is a live count/aggregate over the issue portfolio (e.g. counts by status/tier). **[Assumption]** Refreshed on load and on data change.
- **Click behaviour:** Card title button and each stat cell drill through to a correspondingly filtered Issue List.
- **Hover:** Card lifts (shadow + border emphasis).
- **Icons/colour:** Functional icons per domain; status/tier colour language (see Section on colour).
- **Empty state:** **[Assumption]** Show "0" with muted styling, not a hidden card.
- **Permission:** All roles; values respect the user's data scope.

### Widget 4.3 — My Action Items
- **Purpose:** The single prioritised list of records waiting on *this user's* action across ISM, QIR and TSB.
- **Displayed fields per row:** severity/priority bar, title, relationship type chip (e.g. ISM/QIR), record ID (mono), status, due text (e.g. "3 days overdue"), priority marker, "Open" action.
- **Business logic:** Items are those assigned to the user and awaiting their action.
- **Sorting rules:** **[Assumption]** By priority then due date (most overdue first).
- **Filtering rules:** Tab strip filters by relationship/module (All + per-module tabs), each tab shows a count badge.
- **Empty state:** "Nothing waiting on you" with a check icon and a context message.
- **Click behaviour:** Row "Open" → the related record's Workspace. "View all" (when overflowing) → Issue List.
- **Loading/Error:** **[Assumption]** Skeleton rows on load; inline retry on error.
- **Permission:** Scoped to current user.

### Widget 4.4 — Recently Accessed
- **Purpose:** Resume work quickly.
- **Displayed fields:** type chip, record ID (mono), title, status dot + label, relative time.
- **Business logic:** **[Assumption]** Last N records opened by the user, most-recent first (client/session history).
- **Click behaviour:** Row → record Workspace. "View all" → Issue List.
- **Empty state:** **[Assumption]** "No recent activity yet."

### Widget 4.5 — Attention Required
- **Purpose:** Surface high-impact records to investigate or monitor.
- **Displayed fields per row:** module chip, record ID (mono), severity chip, title, key metric line.
- **Business logic:** **[Assumption]** High severity/critical or breaching thresholds; ranked by impact.
- **Click behaviour:** Row → Workspace.
- **Sorting:** **[Assumption]** By severity/impact descending.

### Widget 4.6 — Lifecycle Health
- **Purpose:** Show issue progression across lifecycle stages.
- **Displayed fields:** stage label + count, colour-coded, connectors between stages.
- **Business logic:** Count of issues currently at each lifecycle stage.
- **Click behaviour:** **[Assumption]** Stage → Issue List filtered to that status.

## KPI Cards
KPI cards appear as a strip on the **Issue List** (Section 5). For each:

| KPI | Calculation | Data source | Drill-down |
|---|---|---|---|
| Total open issues | Count of non-closed issues in scope | Issue store | Issue List (no tier filter) |
| Critical issues | Count where severity tier = Critical (score ≥ 80) | Issue store + scoring | List filtered tier=Critical |
| High severity | Count where tier = High (60–79) | Issue store + scoring | List filtered tier=High |
| Awaiting review | Count where status = In Review | Issue store | List filtered status=In Review |
| Escalated | Count where status = Escalated | Issue store | List filtered status=Escalated |
| (Additional KPI) | e.g. overdue / EWS-flagged count | Issue store | Corresponding filtered list |

- **Refresh frequency:** **[Assumption]** On load and on data mutation; near-real-time in production.
- **Thresholds / critical conditions:** Tier thresholds — Critical ≥80, High 60–79, Medium 40–59, Low 20–39, Info <20.
- **Highlight logic:** The active KPI is emphasised when the list is filtered to it; each KPI shows a delta (trend up/down) vs prior period.
- **Drill-down behaviour:** Clicking a KPI applies the corresponding filter and shows the filtered Issue List.

## Charts
The current SE build does not include on-Dashboard analytical charts; charts live in the **QIR Analytics** screen. When Dashboard charts are added, document per chart: type, legend, axis, tooltip, filtering, aggregation, export, interactions, and No-Data state. **See Open Questions.**

---

# 5. Issue List (ISM-SCR-02)

## Purpose
Present the full issue queue as a dense, sortable, filterable, multi-selectable grid, with a KPI strip for portfolio context and bulk actions for efficient triage.

## Entry Criteria
- **How reached:** "Issue Management" primary nav; any Dashboard drill-down; a KPI click; "View all" links; Back navigation.
- **Landing state:** All-issues scope with no tier filter (when reached generically). KPI/drill-down entries pre-apply the corresponding filter.
- **Default filters:** None on generic entry (scope = all). Drill-down sets one filter (tier/status/source/model).
- **Saved views:** The current filter set (sources, models, tiers, statuses, owner, date range, EWS-only, scope, sort, page size, search) is **persisted to session storage** and restored on return.

## Toolbar
| Control | Type | Behaviour |
|---|---|---|
| Title + sub-line | Heading | Screen context. |
| Export | Button | Exports the current (filtered) result set. **[Assumption]** XLSX. |
| New issue | Primary button | Navigates to Issue Entry (fresh blank form). |
| Source filter chips | Chip toggles + "Select all" | Quick-filter by source channel; multi-select. |
| Filters | Toggle button | Expands/collapses the Filter Panel (open by default). Chevron reflects state. |
| Search | Text input | Searches issues, parts and owners. Filters the grid live. |
| Scope tabs | Tab strip | Switch between "my"/"all" (and related) scopes; each shows a count badge; a dot marks tabs with pending items. |
| Rows-per-page | Select | 20 (default) / 50 / 100. |
| Refresh | *(implicit)* | **[Assumption]** Data refreshes on filter apply / navigation; add explicit refresh if required. |
| Columns / View selector | *(not present)* | **See Open Questions** — column chooser / saved named views not in current build. |
| Bulk actions | Floating action bar | Appears when ≥1 row selected (see Bulk Actions). |

## Filter Panel
| Filter | Field type | Default | Dependency | Apply / Reset logic |
|---|---|---|---|---|
| Source | Multi-select chips + menu | None (all) | — | Applied on toggle / Apply Filters. |
| Model | Multi-select dropdown (checkboxes) | None | — | Count badge shows selection count. |
| Tier (Severity) | Multi-select dropdown | None | Driven by score thresholds | — |
| Status | Multi-select dropdown | None | Canonical status set | — |
| Owner | Multi-select dropdown | None | — | — |
| Date range | From / To date inputs | Empty | To ≥ From **[Assumption]** | — |
| EWS Flag Only | Toggle switch | Off | — | Restricts to EWS-flagged issues. |
| Clear All | Action | — | — | Resets all filters and scope to defaults. |
| Apply Filters | Primary action | — | — | Commits pending selections; persists to session. |

- **Validation:** Date "To" must not precede "From" **[Assumption]**; invalid ranges are rejected with inline messaging.
- **Search logic:** Case-insensitive match against issue title, ID, part numbers and owner names. **[Assumption]** Debounced.

## Issue Grid — Columns
| # | Column | Data type | Format | Sortable | Clickable / Nav | Colour / Icon logic | Null handling |
|---|---|---|---|---|---|---|---|
| 1 | Select | Checkbox | — | No | Toggles row selection | Accent when checked | — |
| 2 | Issue ID | String (mono) | `EE-260001` | **Yes** | Row click → Workspace | Warning triangle prefix if flagged | Always present |
| 3 | Issue Title | String | Truncated single line | No | Row click → Workspace | EWS badge if EWS-flagged; due-date sub-line (amber) if overdue | — |
| 4 | Source | Enum + "+N" | Primary source chip + popover for extras | No | Chip popover (hover/focus) | Source icon per channel | Primary always shown |
| 5 | Model | String + "+N" | Primary model + popover | No | Popover | — | — |
| 6 | MY (Model Year) | Number/range + "+N" | Single year, or range `2023–2025`, or "first +N" | No | Popover | Mono | — |
| 7 | Severity | Number 0–100 | Bar + numeric value | **Yes** | — | Colour by tier (Critical red … Info gray) | — |
| 8 | Status | Enum | Pill with colour dot | No | — | One canonical colour per status | — |
| 9 | Linked | Count | Count button or "—" | No | Click → linked-issues view | Accent link chip when >0 | "—" when none |
| 10 | Owner | String | Avatar + name | No | — | Deterministic avatar colour | — |
| 11 | Days | Number | `Nd` | **Yes** | — | Colour escalates with age **[Assumption]** | — |

- **Multi-value rule:** Source, Model and MY may hold multiple values; the primary value renders inline and the remainder surface via a hover/focus **"+N" popover**. Consecutive years collapse into a range.
- **Default sort:** Severity, descending.
- **Permission:** Values respect the current scope; SE sees own + all per scope tab.

## Row Actions
| Interaction | Behaviour |
|---|---|
| Single click (row) | Opens the Issue Workspace (Overview tab). |
| Click (ID link) | Same — opens Workspace; ID underlines on row hover. |
| Click (checkbox cell) | Toggles selection without opening (event isolated). |
| Click (Linked chip) | Opens linked-issues view/modal. |
| Double click | **[Assumption]** Same as single click (open Workspace). |
| Right click / context menu | **Not implemented.** **See Open Questions.** |
| Hover | Row highlights (accent wash + subtle lift); ID link underlines. |
| Selection / multi-select | Row checkbox + header "select all"/indeterminate; selected rows show accent fill + left rule. |
| Keyboard navigation | Rows are focusable (`tabindex`); Enter/Space activates open; visible focus ring. |

## Bulk Actions
Shown in a floating action bar when ≥1 row is selected.
| Action | Selection logic | Permission | Confirmation | Success | Failure |
|---|---|---|---|---|---|
| Assign Role | Applies to all selected | **[Assumption]** SE may assign within team | Menu pick (no modal) | "N issues assigned to {role}." | **[Assumption]** Error toast naming failed IDs |
| Change Status | All selected | Governed by allowed transitions | Menu pick | Status pills update; toast | Toast on invalid transition |
| Export XLSX | All selected | All roles | — | "Exporting N selected issues to XLSX." | — |
| Clear selection | — | — | — | Bar dismisses | — |

- Bar shows the selected count and a summary label; outside click closes open sub-menus.
- **[Assumption]** Bulk status change should also require a reason to satisfy the audit rule (see BR-014); current build applies directly — flagged in Open Questions.

## Pagination
- Rows-per-page: 20 (default) / 50 / 100.
- Footer shows "Showing 1–N of {total} issues."
- Page controls: previous / page number / next.
- **Remember state:** page size persists with the saved filter view (session).
- Infinite scroll: **not used** — classic pagination. **[Assumption]** Server-side paging in production.

## Empty State
"No issues match these filters. Clear filters to see all {total} issues in the queue." with a "Clear filters" action and filter-off icon.

## Error State
**[Assumption]** On data-load failure, show an inline panel: "Couldn't load issues. Retry." with a retry action; preserve filters.

## Loading State
**[Assumption]** Skeleton rows in the grid body; KPI strip shows shimmer placeholders.

## Business Rules (Issue List)
- **BR-L1:** Issues can only be *edited* when in **Draft** (full form edit); non-draft issues support limited inline Overview edits per field rules.
- **BR-L2:** **Closed** issues are **read-only**.
- **BR-L3:** **[Assumption]** Archived issues are hidden by default and require an explicit filter/scope to view.
- **BR-L4:** Filter/scope/sort/page state persists across the session and is restored on return.
- **BR-L5:** Severity tier is derived from the numeric score by fixed thresholds; the grid must colour by tier consistently everywhere.
- **BR-L6:** EWS-flagged issues display an EWS badge and are filterable via "EWS Flag Only".
- **BR-L7:** The status vocabulary is canonical (Draft, Open, In Review, Pending Approval, Disposed, Closed, Monitoring, Escalated) and must never be paraphrased.

---

# 6. Issue Entry (ISM-SCR-03)

The Issue Entry screen is a **five-step, single-scroll structured form** with a step rail that tracks completion. It is used both to **create** a new issue and to **edit** a Draft. Steps:

1. **Basic issue information** — title, description, owner/assignee.
2. **Vehicle information** — model, model year, variant, plant, country, VIN(s).
3. **System classification** — system, subsystem, component + similar-issue linking.
4. **Issue source** — one or more source channels; each selected channel reveals its own required evidence sub-form.
5. **Evidence & attachments** — files + EWS check + live submit preview.

A step is marked complete when its gating fields are filled; the rail auto-advances the "current" step to the first incomplete step.

## Field Specifications

### Step 1 — Basic issue information
| Field | Type | Mandatory | Editable | Character limit | Default | Validation | Business rule / notes |
|---|---|---|---|---|---|---|---|
| Issue title | Text | **Yes** | Draft: yes | **[Assumption]** ≤ 160 | Empty | Required (non-blank) | Drives the grid title and Workspace header. |
| Description | Textarea | **Yes** | Draft: yes | **[Assumption]** ≤ 4000 | Empty | Required (non-blank) | Primary problem narrative. |
| Assignee / Owner | Select (people) | No | Yes | — | Empty | — | Defaults owner to creator on submit; assignee optional. |

### Step 2 — Vehicle information
| Field | Type | Mandatory | Validation | Notes |
|---|---|---|---|---|
| Model(s) | Multi-select | **Yes** (≥1) | ≥1 required | Primary model listed first in grid. |
| Model year(s) | Multi-select | **Yes** (≥1) | ≥1 required | Options 2019–2027. |
| Variant(s) | Multi-select | **Yes** (≥1) | ≥1 required | Trim/variant. |
| Production plant(s) | Multi-select | **Yes** (≥1) | ≥1 required | Build location. |
| Country(ies) / market | Multi-select | **Yes** (≥1) | ≥1 required | Affected markets. |
| VIN(s) / VIN range | Chips / range | No | **[Assumption]** VIN format check | Affected VIN range; **[Assumption]** validated against VIN master. |

### Step 3 — System classification
| Field | Type | Mandatory | Notes |
|---|---|---|---|
| System | Select | **Yes** (gates step completion) | e.g. Electrical / ICCU. Drives the auto issue-number prefix. |
| Subsystem | Select/Text | **Yes** (gates step) | — |
| Component | Select/Text | **Yes** (gates step) | — |
| Similar issues | Lookup/link | No | Search & link existing issues to prevent duplicates. |

> Issue-number generation: on submit, the system code is derived from the System (EE Electrical, PT Powertrain, CL Cooling, BR Brakes, BD Body, IN Infotainment, CH Chassis, AC HVAC, ST Steering, …) and combined as `{CODE}-26####` where the sequence auto-increments.

### Step 4 — Issue source (conditional evidence)
At least **one** source channel is required. Selecting a channel reveals its mandatory evidence fields:

| Source | Required fields when selected |
|---|---|
| **Warranty** | Warranty claim count, Claims-from date, Claims-to date, IPTV rate, Warranty dealer region |
| **Weibull** | Weibull analysis ID, Failure rate, B10 life, Confidence interval (default 95%) |
| **Comeback** | Comeback count, Comeback window, Primary dealer, Complaint summary |
| **Techline** | Techline case no., Caller name, Caller role, Case priority, Technical summary |
| **FPQR** | FPQR reference, Field date, Location, Field engineer, Defect count |
| **EWS** | EWS alert ID (prefilled), Threshold type, Trigger value, Alert date, Category |
| **GQIS** | GQIS record ID (prefilled), Category code, Market region, GQIS severity |

- **Reported date** is a required field for submit.
- **EWS rule:** selecting **EWS** as a source triggers early-warning routing to PQM on submit (functional requirement ISM-FR-022) and surfaces an "EWS rule active" notice; deselecting shows "No EWS signal".

### Step 5 — Evidence & attachments
- Attach supporting files (drag-and-drop or picker), each shown with name, type icon, size and upload state.
- **Live submit preview** summarises Issue no. (auto), Title, Assignee, sources, etc.

## Field-level rules captured for every field
- **Read-only conditions:** All fields become read-only once the issue is not in Draft (post-submit); Closed issues are fully read-only.
- **Visibility rules:** Source-specific evidence sub-forms are visible only when their channel is selected.
- **Auto-population:** EWS alert ID and GQIS record ID are pre-seeded; issue number, initial severity score and initial status are system-set on submit.
- **Lookup sources:** Model/plant/country/variant from vehicle master; part search from SAP (INT-04); warranty/claims fields validated against INT-03; population against INT-01.
- **Audit / history behaviour:** Submit writes a status log (Draft→Open) and an initial score-audit entry; subsequent edits append to the issue's edit log with actor, timestamp and field-level before→after values.
- **Error messages:** Field-level required errors highlight the field red; submit-level toast: "Cannot submit issue — Complete the required fields highlighted in red." Save-draft with no title: "Add a title to save — A draft needs at least an issue title."

## Attachments
| Aspect | Rule |
|---|---|
| Allowed types | **[Assumption]** PDF, images (PNG/JPG), Office docs, CSV/logs. |
| Maximum size | **[Assumption]** Per-file cap (e.g. 25 MB). |
| Upload state | Files show queued/uploading/done state; only "done" files are attached on submit. |
| Preview | **[Assumption]** Inline preview for images/PDF. |
| Download / Delete / Replace | **[Assumption]** Owner may download, delete pre-submit, and replace. |
| Virus scan | **[Assumption]** Server-side scan on upload; infected files rejected. |
| Duplicate detection | **[Assumption]** Warn on duplicate filename/hash. |

## Save Behaviour
| Action | Behaviour |
|---|---|
| Save draft | Requires at least a title; persists as Draft; no scoring. |
| Auto-save | **[Assumption]** Periodic draft auto-save; flagged in Open Questions if required. |
| Submit | Validates all required + source-conditional fields; on success: generates issue no., auto-scores severity, sets status **Open**, writes status + score audit, shows a submit confirmation (view issue / return to list). |
| Cancel | Discards edits; returns to prior screen. |
| Close / Back | **[Assumption]** Prompts to save unsaved changes. |

## Workflow (state changes)
`Draft → Open` on submit. Downstream transitions occur in the Workspace: `Open → In Review → Pending Approval → Disposed | Monitoring → Closed`, with an `Escalated` branch. See Business Rules (Section 11) for transition governance.

## Notifications (Issue Entry triggers)
| Trigger | Recipient | Channel |
|---|---|---|
| Issue submitted | Owner / assignee; PQM if EWS source | System notification; **[Assumption]** email |
| EWS-sourced submit | PQM (early-warning routing) | System notification + **[Assumption]** email |
| Draft saved | Author (confirmation toast) | In-app |

---

# 7. Issue Workspace (ISM-SCR-04)

The Workspace is the full record view, organised into tabs. The header shows the issue ID, title, status, and a live score badge. Tabs:

| Tab | Key | Visible to | Purpose |
|---|---|---|---|
| Overview | overview | All | Executive summary of the issue. |
| Scoring | severity | All | Severity factors, live composite, override, score audit. |
| Investigation | investigation | All | Hypothesis, root cause, evidence, DTC, actions. |
| QIR | qir | All | Linked/related QIR; escalate. |
| Actions | actions | All | Parts requests & corrective actions. |
| Disposition | disposition | All | Propose/approve disposition decision. |
| Communication | communication | All | Comment threads (internal/external). |
| Chronology | chronology | All | Lifecycle stage timeline. |
| History | history | All | Immutable audit records. |
| Sharing | sharing | **ASM / PQM only** | Cross-org sharing (hidden for SE). |

Tabs carry count badges (e.g. QIR, Actions/parts, Communication/comments).

## Section 7.1 — Overview
- **Purpose:** One-screen executive summary.
- **Displayed information:** Facts (Model, Model year, System, Subsystem); VIN range; description; ownership; plant; production date; options; dealer code; region; repair-order count; **Next-action card**; **disposition proposal** summary; **related QIR** chip.
- **Business rules:** "Next action" is derived from status (e.g. Open → investigate/score; ≥80 → escalate). Inline edit of Overview fields is permitted while the issue is editable; edits append to the edit log.
- **Permissions:** SE may inline-edit editable fields; Closed = read-only.
- **Navigation / cross-module links:** Related QIR chip → QIR Workspace; next-action CTA jumps to the relevant tab.
- **Audit trail:** Every inline edit logged (field, from→to, actor, time).

## Section 7.2 — Scoring (Severity)
- **Purpose:** Explain and, where permitted, adjust severity.
- **Displayed information:** Factor rows with weight, source and value —
  - Field Frequency Impact (weight 35%, source INT-03)
  - Repair Cost Index (weight 30%, INT-03)
  - Warranty Claims Count (weight 25%, INT-03)
  - Population Exposure (weight 10%, INT-01)
  - live composite score gauge + tier label; score-change audit history.
- **Calculation:** Composite = Σ(weight × factor value)/100, rounded. Tier by threshold.
- **Business rules:**
  - SE may **request a re-score** (queued for review) but **cannot apply a manual override**.
  - Manual override (ASM/PQM) requires a justification of **≥ 20 characters**; the override and reason are written to the score audit; score ≥ 80 sets next action "Escalate to QIR".
- **Read-only conditions:** Override controls disabled for `read` capability (SE) and on Closed issues.
- **Audit trail:** Each score change (auto or manual) recorded with algorithm version / actor, from→to, reason, timestamp.

## Section 7.3 — Investigation
- **Purpose:** Capture technical analysis.
- **Displayed information:** Hypothesis, suspected root cause, Weibull parameters (β, η, rate, population), symptom & top DTC, evidence.
- **Actions:** Request Parts (→ Actions tab), Escalate to QIR.
- **Editable conditions:** Editable while issue is open/active; Closed = read-only.

## Section 7.4 — QIR
- **Purpose:** Connect the issue to its QIR.
- **Displayed information:** Related QIR (ID, status, owner, opened) or "no QIR yet".
- **Actions:** Escalate to QIR (SE, ASM). **Cross-module link:** opens QIR Workspace.

## Section 7.5 — Actions (Parts & corrective measures)
- **Purpose:** Request parts for investigation and track corrective actions.
- **Parts request fields:** Part number (SAP lookup via INT-04), Quantity (default 1), Urgency (Routine/…), Purpose.
- **Validation:** Part number required — "Enter a part number. Search INT-04 for the SAP material first."
- **Displayed information:** Requested-parts list; corrective-measure list (e.g. firmware countermeasures).
- **Permissions:** SE/TE/DE may request parts.

## Section 7.6 — Disposition
- **Purpose:** Decide the outcome.
- **Options:** Field Action, Technical Service Bulletin, Service Action, Safety Campaign, No action, Monitoring.
- **Business rules:**
  - **SE proposes; ASM/PQM approves** ("As SE you propose; ASM or PQM approves").
  - A disposition must be selected — "Select a disposition option."
  - **No action** requires a reason of **≥ 30 characters**.
  - Approve → status moves to **Disposed** (or **Monitoring** if the Monitoring option) and an approval bar records approver + reason + date; Reject → returns issue to **Open** with next action "Revise disposition".
- **Permissions:** Approve/Reject controls appear only for `override` roles (ASM/PQM). The Approval Bar is shown when a disposition awaits the current role's sign-off.
- **Audit trail:** Proposal, approval and rejection each written to the status log with reason.

## Section 7.7 — Communication (Comments)
- **Purpose:** Threaded discussion and record of correspondence.
- **Displayed information:** Comments with author, role, channel; participants; comment audit.
- **Channels:** Internal / External (toggle).
- **Actions:** Add comment (non-empty). **[Assumption]** External comments may notify external stakeholders.
- **Permissions:** All roles may comment; **[Assumption]** external channel may be role-gated.

## Section 7.8 — Chronology
- **Purpose:** Visual lifecycle progression.
- **Stages:** Issue created → Scored → Assigned → QIR raised → QIR assigned → Actions/corrective measures → Disposition proposed → Disposition approved → Closed.
- **Timeline logic:** Each stage is completed / current / upcoming based on the issue's status and history; stages expand for detail (actor, role, timestamp, details).
- **Read-only:** Chronology is a derived, non-editable view.

## Section 7.9 — History (Audit)
- **Purpose:** Immutable audit record for compliance.
- **Displayed information:** Audit rows — score updates, status changes, field edits, assignments, dispositions — each with user, role, action, field, previous value, next value, timestamp.
- **Filtering:** By type, user, role, field, and free-text search.
- **Business rules:** Audit records are append-only and never editable/deletable.

## Section 7.10 — Sharing (ASM/PQM only)
- **Purpose:** Cross-organisation sharing controls.
- **Visibility:** Hidden for SE (tab only rendered for `override` roles). Out of scope for this SE BRD.

## Cross-cutting Workspace rules
- **Status change** anywhere requires a **mandatory reason**, written to the audit trail; a new status must be selected ("Select a new status.").
- Editing is disabled once the issue is **Closed** (read-only).
- Navigating between tabs resets scroll to the top of the scroll region; only the workspace body scrolls.

---

# 8. Navigation Flow

```
Login
  ↓
Dashboard (SE Command Centre)
  ├─ KPI / widget drill-down ┐
  ↓                          │
Issue List  ←────────────────┘
  ├─ New issue ───────────────→ Issue Entry ──(submit)──→ Issue Workspace
  ├─ Row click ───────────────→ Issue Workspace
  └─ Bulk actions (assign / status / export)

Issue Workspace
  ├─ Overview / Scoring / Investigation / Actions / Disposition / Communication / Chronology / History
  ├─ Escalate to QIR ─────────→ QIR Workspace  (QIR module)
  ├─ Disposition → TSB outcome → TSB Management (TSB module)
  └─ Back ────────────────────→ prior screen (25-deep history stack)

Header (global, everywhere)
  ├─ Logo → Dashboard
  ├─ Primary nav → Dashboard / Issue Management / QIR Management / TSB Management
  ├─ Notifications → dropdown → record; or full Notifications page
  └─ Role switch → SE / ASM / PQM (re-applies permissions + scope)
```

Every screen supports **Back** (a 25-entry navigation-history stack); Back with an empty stack returns to Dashboard.

---

# 9. Functional Requirements

Atomic requirements. "shall" = mandatory.

**Navigation & shell**
- **ISM-FR-001** The SE shall land on the Dashboard on login.
- **ISM-FR-002** The user shall navigate between Dashboard, Issue Management, QIR Management and TSB Management from the header.
- **ISM-FR-003** The user shall return to the previous screen via Back (history stack).
- **ISM-FR-004** The system shall display an unread notification count and a notifications dropdown.
- **ISM-FR-005** The user shall mark all notifications read.
- **ISM-FR-006** The system shall re-apply permissions and data scope when the active role changes.

**Dashboard**
- **ISM-FR-007** The Dashboard shall show system-health metrics, action items, attention-required items, recently accessed items and lifecycle health.
- **ISM-FR-008** Each Dashboard metric/stat shall drill through to a correspondingly filtered Issue List.
- **ISM-FR-009** "My action items" shall show only records awaiting the current user's action, filterable by module tab.

**Issue List**
- **ISM-FR-010** The user shall view issues in a paginated grid (20/50/100 per page).
- **ISM-FR-011** The user shall search issues by ID, title, part and owner.
- **ISM-FR-012** The user shall filter by source, model, tier, status, owner, date range and EWS flag.
- **ISM-FR-013** The user shall sort by Issue ID, Severity and Days.
- **ISM-FR-014** The system shall persist the user's filter/scope/sort/page state across the session.
- **ISM-FR-015** The user shall select rows (single, multi, select-all) and perform bulk assign, bulk status change and bulk export.
- **ISM-FR-016** The user shall open an issue Workspace by clicking a row.
- **ISM-FR-017** The system shall show an empty state with a clear-filters action when no issues match.
- **ISM-FR-018** The user shall export the current filtered list.

**Issue Entry**
- **ISM-FR-019** The user shall create a new issue via the five-step Issue Entry form.
- **ISM-FR-020** The system shall require title, description, vehicle fields (model, year, variant, plant, country), at least one source, and a reported date before submit.
- **ISM-FR-021** The system shall require the source-specific evidence fields for each selected source channel.
- **ISM-FR-022** When EWS is a source, the system shall route an early-warning notification to PQM on submit.
- **ISM-FR-023** The user shall save an issue as Draft with at least a title.
- **ISM-FR-024** On submit the system shall auto-generate the issue number, auto-compute severity, and set status to Open.
- **ISM-FR-025** The user shall attach one or more files to an issue.
- **ISM-FR-026** The user shall edit a Draft issue; the user shall not edit a Closed issue.
- **ISM-FR-027** The user shall link similar/existing issues to prevent duplicates.

**Issue Workspace**
- **ISM-FR-028** The user shall view the issue Overview, Scoring, Investigation, QIR, Actions, Disposition, Communication, Chronology and History.
- **ISM-FR-029** The SE shall request a re-score; the SE shall not apply a manual score override.
- **ISM-FR-030** An `override`-capable role shall apply a manual score override with a justification of ≥ 20 characters.
- **ISM-FR-031** The SE shall propose a disposition; an `override` role shall approve or reject it.
- **ISM-FR-032** A "No action" disposition shall require a reason of ≥ 30 characters.
- **ISM-FR-033** The user shall request parts, providing a part number.
- **ISM-FR-034** The user shall add internal or external comments.
- **ISM-FR-035** The user shall escalate an issue to QIR.
- **ISM-FR-036** Any status change shall require a mandatory reason recorded to the audit trail.
- **ISM-FR-037** The system shall record every score change, status change, edit, assignment and disposition in an append-only audit history.
- **ISM-FR-038** The Sharing tab shall be hidden from SE.
- **ISM-FR-039** The system shall show an Approval Bar to `override` roles when a disposition awaits their sign-off.

---

# 10. Validation Rules

| ID | Rule | Message |
|---|---|---|
| VR-01 | Title required | (Field highlighted) / "Add a title to save." |
| VR-02 | Description required | (Field highlighted) |
| VR-03 | ≥1 model, year, variant, plant, country each | (Fields highlighted) |
| VR-04 | ≥1 source channel | "Select at least one issue source below." |
| VR-05 | Reported date required | (Field highlighted) |
| VR-06 | Warranty evidence complete (claim count, from, to, IPTV, dealer region) | (Fields highlighted) |
| VR-07 | Weibull evidence complete (analysis ID, fail rate, B10, CI) | (Fields highlighted) |
| VR-08 | Comeback evidence complete (count, window, primary dealer, complaint) | (Fields highlighted) |
| VR-09 | Techline evidence complete (case no., caller, role, priority, summary) | (Fields highlighted) |
| VR-10 | FPQR evidence complete (ref, field date, location, engineer, defect count) | (Fields highlighted) |
| VR-11 | EWS evidence complete (alert ID, threshold type, trigger value, alert date, category) | (Fields highlighted) |
| VR-12 | GQIS evidence complete (record ID, category code, market region, severity) | (Fields highlighted) |
| VR-13 | Submit blocked if any required field invalid | "Cannot submit issue — Complete the required fields highlighted in red." |
| VR-14 | Disposition option must be selected | "Select a disposition option." |
| VR-15 | "No action" disposition reason ≥ 30 chars | (Inline error) |
| VR-16 | Score override reason ≥ 20 chars | (Inline error) |
| VR-17 | Status change: new status selected | "Select a new status." |
| VR-18 | Status change: reason required | (Inline error) |
| VR-19 | Part request: part number required | "Enter a part number. Search INT-04 for the SAP material first." |
| VR-20 | Comment must be non-empty | (Send disabled) |
| VR-21 | Weight configuration must total 100% (admin) | "Cannot save configuration — Total weight must equal 100%." |
| VR-22 | Date range: To ≥ From **[Assumption]** | (Inline error) |
| VR-23 | Attachment type/size within limits **[Assumption]** | (Inline error) |

---

# 11. Business Rules

**Lifecycle**
- **BR-001** Statuses are exactly: Draft, Open, In Review, Pending Approval, Disposed, Closed, Monitoring, Escalated.
- **BR-002** New issues submit at **Open** with an auto-computed score.
- **BR-003** Draft is the only state permitting full form edit.
- **BR-004** Closed issues are **read-only** and (per copy) cannot be reopened.
- **BR-005** Disposition approval moves the issue to **Disposed**, or to **Monitoring** if the Monitoring outcome is chosen.
- **BR-006** Disposition rejection returns the issue to **Open** with next action "Revise disposition".
- **BR-007** Issues scoring ≥ 80 set the next action to "Escalate to QIR".

**Visibility**
- **BR-008** SE default scope is "my issues"; ASM/PQM default to "all". Scope tabs allow switching.
- **BR-009** EWS-flagged issues are badged and independently filterable.
- **BR-010** **[Assumption]** Archived issues are hidden by default.

**Permissions**
- **BR-011** SE has `read` capability: propose, not approve; request re-score, not override.
- **BR-012** ASM/PQM have `override`: approve disposition, apply score override, access Sharing.
- **BR-013** The Sharing tab is hidden for SE.

**Status & Audit**
- **BR-014** Every status change requires a reason and is written to the audit trail.
- **BR-015** Score changes (auto and manual) are audited with algorithm version/actor, from→to, reason, timestamp.
- **BR-016** All field edits are audited at field level (from→to, actor, timestamp).
- **BR-017** Audit records are append-only; never editable or deletable.

**Scoring / Calculations**
- **BR-018** Composite severity = Σ(factor weight × factor value)/100; default factor weights: Field Frequency 35, Repair Cost 30, Claims Count 25, Population Exposure 10 (admin-configurable; must total 100).
- **BR-019** Tiers: Critical ≥80, High 60–79, Medium 40–59, Low 20–39, Info <20.

**Notifications / Escalations**
- **BR-020** EWS-sourced submissions route an early-warning notification to PQM.
- **BR-021** **[Assumption]** Aging reminders fire at configurable thresholds (warn 30 days, critical 60 days); QIR reminders at 14 days; disposition reminders at 7 days (admin-configured).
- **BR-022** Escalation to QIR creates/links a QIR record and notifies the QIR owner.

**Data retention / Archival**
- **BR-023** **[Assumption]** Monitoring issues with no activity for 45 days are auto-closed by a batch job; closed issues become read-only.
- **BR-024** **[Assumption]** Issue and audit data retained per Kia compliance retention policy.

**Duplicates**
- **BR-025** Users are prompted to link similar/existing issues during entry to prevent duplicates.

---

# 12. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | **[Assumption]** Issue List renders ≤ 2 s for a page of 20 at P95; filter apply ≤ 1 s. |
| Accessibility | Visible focus rings on all interactive elements; keyboard-navigable grid rows (Enter/Space to open); honours `prefers-reduced-motion`; WCAG 2.1 AA target **[Assumption]**. |
| Security | Role-based access enforced server-side; SSO auth; least-privilege for SE. |
| Audit | Append-only, immutable audit trail for all material changes. |
| Scalability | **[Assumption]** Server-side pagination/filtering; supports ≥ 100k issues. |
| Availability | **[Assumption]** 99.9% business-hours availability. |
| Responsiveness | Optimised for desktop workstation widths (1280–1600 px content). |
| Localization | **[Assumption]** Multi-market; timezone-aware timestamps; i18n-ready copy. |
| Browser support | **[Assumption]** Latest Chrome, Edge, Firefox, Safari. |
| Autosave | **[Assumption]** Draft autosave (to be confirmed — see Open Questions). |
| Logging / Monitoring | **[Assumption]** Server logs all mutations; batch-job run status surfaced in Administration. |

---

# 13. API & Integration Requirements

| Integration | Code | Direction | Used for |
|---|---|---|---|
| Population / GQIS | INT-01 | Inbound | Population exposure factor; global quality incidents; GQIS Sync job. |
| Warranty & claims | INT-03 | Inbound | Field frequency, repair cost, claims count factors; warranty evidence validation. |
| SAP material master | INT-04 | Inbound | Part-number lookup for parts requests. |
| Vehicle / VIN master | — | Inbound | Model/variant/plant/country/VIN validation & population. |
| Scoring engine | — | Internal service | Auto severity on submit and on data refresh. |
| QIR module | — | Bidirectional | Escalate issue → QIR; related-QIR status. |
| TSB module | — | Outbound | Disposition outcomes → TSB. |
| Notifications / email | — | Outbound | Reminders, escalations, system notifications. |
| Authentication / role | — | Inbound | SSO, role & permission resolution. |
| Search | — | Internal | Issue/part/owner search. |
| Export | — | Outbound | XLSX export of list/selection. |
| Attachments store | — | Bidirectional | Upload/download; virus scan; **[Assumption]** dedupe. |

*(All API contracts — endpoints, payloads, error codes — to be detailed in a technical design spec.)*

---

# 14. Data Dictionary (core issue entity)

| Field | Description | Type | Length | Mandatory | Source |
|---|---|---|---|---|---|
| id | Issue number (e.g. EE-260001) | String | ~9 | Yes (auto) | System (System-code + year + seq) |
| source(s) | Source channel(s) | Enum[] | — | Yes (≥1) | User |
| title | Issue title | String | ≤160 **[A]** | Yes | User |
| description | Problem narrative | Text | ≤4000 **[A]** | Yes | User |
| model(s) | Affected model(s) | Enum[] | — | Yes | Vehicle master |
| year(s) | Model year(s) | Int[] | 4 | Yes | Vehicle master |
| variant(s) | Trim/variant | Enum[] | — | Yes | Vehicle master |
| plant(s) | Production plant(s) | Enum[] | — | Yes | Vehicle master |
| country(ies) | Market(s) | Enum[] | — | Yes | Vehicle master |
| vin range / vins | Affected VIN(s) | String[] | 17 | No | VIN master |
| system | System classification | Enum | — | Yes | Master |
| subsystem | Subsystem | String | — | Yes | Master |
| component | Component | String | — | Yes | Master |
| severity | Composite score | Int | 0–100 | Yes (auto) | Scoring engine |
| tier | Severity tier | Enum | — | Derived | Derived from severity |
| status | Lifecycle status | Enum | — | Yes | System/workflow |
| owner / ownerRole | Owning user + role | String/Enum | — | Yes | System (creator) |
| assignee / assigneeRole | Assigned user + role | String/Enum | — | No | User |
| reportedDate | Reported date | Date | — | Yes | User |
| created / age | Created date; days open | Date/Int | — | Yes (auto) | System |
| nextAction | Recommended next step | String | — | Derived | System |
| dtc / dtcChips | Diagnostic trouble code(s) | String[] | — | No | User |
| linked / linkedExisting | Linked issue IDs | String[] | — | No | User |
| attachments | Files (name, ext, size, time) | Object[] | — | No | User upload |
| _form | Full source-evidence payload | Object | — | Conditional | User |
| Source-evidence fields | Per-channel (warranty/weibull/comeback/techline/fpqr/ews/gqis) | Mixed | — | Conditional | User + INT-01/03 |

*[A] = [Assumption] length.*

---

# 15. Permissions Matrix

| Action | SE | Manager (ASM) | PQM | Admin |
|---|---|---|---|---|
| View issues | ✓ (my + all) | ✓ all | ✓ all | ✓ all |
| Create issue | ✓ | ✓ | ✓ | ✓ |
| Edit (Draft) | ✓ | ✓ | ✓ | ✓ |
| Inline edit (Overview) | ✓ | ✓ | ✓ | ✓ |
| Edit Closed issue | ✗ | ✗ | ✗ | **[A]** |
| Delete issue | **[A]** ✗ | **[A]** | **[A]** | **[A]** |
| Assign | ✓ (team) | ✓ | ✓ | ✓ |
| Request re-score | ✓ | ✓ | ✓ | ✓ |
| Override score | ✗ | ✓ | ✓ | ✓ |
| Propose disposition | ✓ | ✓ | ✓ | — |
| Approve/Reject disposition | ✗ | ✓ | ✓ | — |
| Escalate to QIR | ✓ | ✓ | ✓ | — |
| Change status | ✓ (allowed transitions) | ✓ | ✓ | ✓ |
| Request parts | ✓ | ✓ | ✓ | — |
| Comment (internal) | ✓ | ✓ | ✓ | ✓ |
| Comment (external) | **[A]** | ✓ | ✓ | — |
| Upload attachment | ✓ | ✓ | ✓ | ✓ |
| Download attachment | ✓ | ✓ | ✓ | ✓ |
| Export list | ✓ | ✓ | ✓ | ✓ |
| Print | **[A]** ✓ | ✓ | ✓ | ✓ |
| Close issue | **[A]** via disposition | ✓ | ✓ | ✓ |
| Archive | **[A]** ✗ | **[A]** | **[A]** | ✓ |
| Sharing tab | ✗ | ✓ | ✓ | ✓ |
| Administration (weights/reminders/jobs) | ✗ | **[A]** | **[A]** | ✓ |

*[A] = [Assumption] — confirm with product owner.*

---

# 16. Edge Cases

| Case | Expected behaviour |
|---|---|
| No data (empty queue) | Issue List shows empty state with clear-filters CTA; Dashboard widgets show zero states. |
| No filter matches | "No issues match these filters. Clear filters to see all N issues." |
| Missing VIN | VIN optional at entry; **[Assumption]** flagged as incomplete evidence; blocks certain dispositions **(Open Question)**. |
| Duplicate issue | Similar-issue linking offered at entry; **[Assumption]** duplicate-detection warning on submit. |
| Concurrent edit | **[Assumption]** Optimistic lock / conflict warning ("This issue was updated by {user}; reload."). **(Open Question)** |
| Deleted attachment | **[Assumption]** Removed from list; audit note recorded; download link disabled. |
| Network failure | **[Assumption]** Non-blocking error toast; unsaved draft preserved locally; retry. |
| Permission changed mid-session | **[Assumption]** Next action re-evaluates permissions; disallowed actions hidden/disabled on refresh. |
| Session timeout | **[Assumption]** Re-auth prompt; unsaved draft preserved where possible. |
| Locked record (in approval) | **[Assumption]** Certain edits disabled while Pending Approval. **(Open Question)** |
| Archived record | **[Assumption]** Hidden by default; read-only when viewed. |
| Closed record edit attempt | Blocked; controls read-only. |
| Score override without reason | Blocked (≥20 chars required). |
| "No action" disposition without reason | Blocked (≥30 chars required). |
| Status change without reason | Blocked (reason mandatory). |

---

# 17. Open Questions

### Q1 — Global search
**Question:** Should there be a global (header) search across modules, in addition to the Issue-List search?
**Impact:** Findability across ISM/QIR/TSB.
**Suggested resolution:** Add a global omnibox in the header scoped to issues, QIRs, TSBs, VIN and part number.

### Q2 — Column chooser / saved named views
**Question:** Should users configure visible grid columns and save named views (beyond the session-persisted filter set)?
**Impact:** Personalisation, power-user efficiency.
**Suggested resolution:** Add a column selector and named saved views with default per role.

### Q3 — Right-click context menu on grid rows
**Question:** Is a row context menu (open in new tab, copy ID, quick status) required?
**Impact:** Triage speed.
**Suggested resolution:** Provide a lightweight context menu with non-destructive quick actions.

### Q4 — Bulk status change reasoning
**Question:** Bulk status change currently applies without a per-issue reason; audit rule (BR-014) requires reasons.
**Impact:** Audit compliance.
**Suggested resolution:** Require a single reason applied to all selected, recorded per issue.

### Q5 — Draft autosave
**Question:** Is periodic draft autosave required, and at what cadence?
**Impact:** Data-loss risk on long entries.
**Suggested resolution:** Autosave drafts every 30–60 s and on blur.

### Q6 — Reopen a Closed issue
**Question:** Copy states Closed cannot be reopened; is there any privileged reopen path (e.g. Admin) for genuine error correction?
**Impact:** Data integrity vs correctability.
**Suggested resolution:** Allow Admin-only reopen with mandatory reason and full audit.

### Q7 — Concurrent edit / record locking
**Question:** How are simultaneous edits and Pending-Approval locking handled?
**Impact:** Lost updates, integrity.
**Suggested resolution:** Optimistic concurrency with conflict detection; soft-lock during approval.

### Q8 — Attachment policy
**Question:** Definitive allowed types, size caps, versioning, and virus-scan behaviour?
**Impact:** Security, storage.
**Suggested resolution:** Confirm allow-list, per-file cap, and rejection UX.

### Q9 — Notification matrix
**Question:** Precise recipients/channels (email vs in-app) and reminder/escalation cadences for each event?
**Impact:** Communication, SLA adherence.
**Suggested resolution:** Confirm the notification matrix per event and per role.

### Q10 — VIN requirement for disposition
**Question:** Are VIN ranges mandatory before certain dispositions (Safety Campaign, Field Action)?
**Impact:** Regulatory containment scope.
**Suggested resolution:** Confirm evidence gates per disposition type.

### Q11 — Data scope semantics
**Question:** Exact definition of "my" vs "all" for SE, and whether team/region scoping applies.
**Impact:** Visibility & workload distribution.
**Suggested resolution:** Confirm scope model (owner vs assignee vs team vs region).

---

*End of baseline BRD. Provide the next screen or screenshot to extend this document in place.*
