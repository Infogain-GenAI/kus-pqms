# ISM SE Role — Page Specification

_Kia N-PQMS · Issue & Signal Management (ISM) — Service Engineer role view_
_Source: `ISM SE Role.dc.html` · Design system: Kia N-PQMS_

---

## 1. Project Overview

**What it is.** A single-page, multi-screen enterprise application view for **N-PQMS** (Next-generation Parts Quality Management System), scoped to the **Service Engineer (SE)** role. It covers the full **Issue & Signal Management (ISM)** workflow plus the connected **QIR** (Quality Issue Report) module and a **TSB Management** placeholder.

**Who uses it.** Quality and engineering operators. Three roles are modeled, switchable at runtime:
- **SE — Service Engineer** (`Arpita Chavda`) — default; `read` capability, scoped to "my" issues.
- **ASM — After-Sales Manager** (`Park Soo-jin`) — `override` capability, all-issues scope.
- **PQM — Product Quality Manager** (`Seo-yeon Park`) — `override` capability, all-issues scope.

**Purpose.** Give the SE a single command center to triage quality signals, create and score issues, drive them through the lifecycle (Draft → Open → In Review → Pending Approval → Disposed/Monitoring → Closed / Escalated), and hand off to QIR when severity warrants.

**Design intent.** Enterprise-first, data-clarity over decoration. Calm, authoritative, audit-ready. High information density with predictable placement and durable states for long operational sessions.

### Component API (tweakable props)
Declared on the root Design Component:
- `defaultRole` — enum `SE | ASM | PQM` (default `SE`). Sets the active role/permissions.
- `startScreen` — enum `home | dashboard | create | workspace` (default `home`). Sets the landing screen.

---

## 2. Design Specs

All values inherit from the Kia N-PQMS token set (`tokens/*.css`) loaded in `<helmet>`; literals below are the concrete values used on this page.

### Color
| Role | Value |
|---|---|
| Brand anchor (nav/header dark) | Kia Midnight `--kia-midnight` `#05141F` |
| App background | `#F6F8FA` |
| Surface / cards | `#FFFFFF` |
| Primary text | `--text-primary` `#1A2430` |
| Secondary text | `--text-secondary`; muted `#6B7681`; faint `#9AA5AE` |
| Interactive accent | `--accent-500/600/700` blue `#2A6FDB` |
| Accent tints | `--accent-50` `#EEF2FB`, selection `#EAF2FD` |
| Hairline borders | subtle `#E7ECF1` / `#F0F2F5`, default `#DCE1E6` / `#D5DCE3` |

**Status colors** (canonical, one hue per status):
- Draft `#6B7681` · Open `#2A6FDB` · In Review `#7C5CDB` · Pending Approval `#E2820B` · Disposed `#0E9384` · Closed `#344049` · Monitoring `#D9A60B` · **Escalated `#D92D20`** (highest urgency).

**Severity tiers** (score-driven, with tints):
- Critical ≥80 `#D92D20` · High ≥60 `#E2820B` · Medium ≥40 `#D9A60B` · Low ≥20 `#1F8A5B` · Info ≥0 `#6B7681`.

**Source channels** (each maps to one Lucide icon): Warranty `file-warning` · Weibull `activity` · Comeback `rotate-ccw` · Techline `headset` · FPQR `clipboard-list` · EWS `shield-alert` · GQIS `globe`.

### Typography
- **Display face:** `var(--font-display)` (Kia Signature Fix) — page titles / H1, big metric numerals. H1 = 28px, weight 700, letter-spacing −0.02em.
- **Body / UI face:** `var(--font-body)` (Inter) — all dense UI, tables, forms, body, captions.
- **Mono:** `JetBrains Mono` (`.ism-mono`) for IDs and numeric/technical values.
- **Uppercase labels:** table headers, field labels, eyebrows — sentence-case elsewhere; tracked +0.04–0.05em, ~10.5px, weight 700.

### Spacing & layout
- Strict **4px grid**.
- Top header **60px**, sticky, `z-index:40`.
- Content on cards with **14–16px** radius; gaps of 14/20/22px between blocks.
- Table rows: compact 40px / default 48px.

### Corner radius
Inputs/buttons ~9px; cards 14–16px; modals 8–13px; full pills only for status pills, tags, and count badges.

### Borders & elevation
- Hairline 1px cool-gray borders define structure.
- Cards use border + very soft low-spread shadow (`0 1px 2px rgba(5,20,31,.04)`); hover lifts to `0 4px 16px rgba(5,20,31,.08)`.
- Dropdowns/popovers `0 8px 26px rgba(5,20,31,.16)`; modals/notification panels `0 16px 44px rgba(5,20,31,.18)`.

### Focus & states
- **Focus:** accent ring — `border-color:var(--accent-500)` + `0 0 0 3px rgba(42,111,219,.14)`; always visible.
- **Hover:** subtle gray wash (`#F6F8FA` / `#FAFBFC` rows, `#F1F4F7` nav); table rows also get a faint accent wash + 1px lift.
- **Selected row:** `#EAF2FD` fill with a 3px inset accent left rule.
- Motion: 120–240ms, `cubic-bezier(0.2,0,0,1)`, fades/short slides only. Honors `prefers-reduced-motion` (disables smooth scroll and row/popover transitions).

### Iconography
Lucide, stroke-only, ~1.75px, `currentColor`. Sizes: 13–19px inline/table/button, 24px nav. Functional only — one icon per meaning (e.g. always `shield-alert` for EWS, `alert-triangle` for Escalated). No emoji, no Unicode-glyph icons.

---

## 3. Layout Hierarchy

### App shell
```
body (#F6F8FA)
└─ flex column, height:100vh
   ├─ header (sticky, 60px, white, bottom hairline)     ← global chrome
   │   ├─ Kia PQMS logo (dark tone) → Dashboard
   │   ├─ divider
   │   ├─ Primary nav: Dashboard · Issue Management · QIR Management · TSB Management
   │   ├─ spacer (flex:1)
   │   └─ Utilities: Help · Notifications (bell + unread badge + dropdown panel) · user
   └─ main.ism-scroll (single scroll region)
       └─ one active screen (sc-if switch on state.screen)
```

Navigation is driven by `state.screen`; `go(screen)` pushes onto a 25-deep `navHist` stack (Back supported). The workspace uses a self-sizing inner scroll region (`[data-ws-scroll]`) so only that panel scrolls.

### Screens (each an `sc-if` block with a `data-screen-label`)
| Screen key | Label | Purpose |
|---|---|---|
| `home` | SE Dashboard | Command center — health, action items, attention, lifecycle |
| `dashboard` | Issue List | Filterable/sortable issue table with KPI strip + bulk actions |
| `create` | Create Issue | Scrolling sectioned form (source-aware required fields) |
| `workspace` | Issue Workspace | Full issue detail: overview, scoring, disposition, parts, comments, chronology, audit |
| `wsEntry` | Issue Workspace launcher | Open-by-ID entry |
| `admin` | Issue Administration | Scoring weights, reminders, source toggles, batch jobs |
| `qir` | QIR List | QIR records list + filters |
| `qirCreate` | New QIR | QIR creation form |
| `qirWs` | QIR Workspace | QIR detail |
| `qirAnalytics` | QIR Analytics | QIR dashboard/analytics |
| `notifications` | Notifications | Full-page notification feed |
| `tsm` | TSB Management | Placeholder / empty state |

### Home screen structure (representative)
```
Greeting (H1 + role chip + last-login)
Row 1 · System health — 3 cards, each: title button + 3 stat cells (grid 3×)
Two independent columns (grid 2.35fr | minmax(320px,1fr)):
  Left stack:  My action items (tabbed, scrollable) · Recently accessed
  Right stack: Attention required (high-impact records) · Lifecycle health (stage counts)
```

### Issue List structure
```
Title + actions (Export · New issue)
KPI strip (6 clickable KPIs → filtered list)
Filter panel (sources / models / tiers / statuses / owner / date / EWS-only / search)
Data table (sortable columns; multi-value source/model/year via "+N" popover)
Bulk-action bar (assign / status / export) when rows selected
Pagination (pageSize 20)
```

---

## 4. UI Component Rules

### Use the design system, don't reinvent
Every visual composes Kia N-PQMS components mounted from the bundle (`KiaNPQMSDesignSystem_e334a0.*`) — e.g. `Logo`, `Button`, `Badge`, `StatusBadge`, `StatusPill`, `DataTable`, `SeverityIndicator`, `SourceBadge`, `Timeline`, `ApprovalBar`. Do not restyle raw HTML to imitate them. Styling elsewhere is inline against `var(--*)` tokens.

### Status & severity are canonical
- Always use exact status names: **Draft, Open, In Review, Pending Approval, Disposed, Closed, Monitoring, Escalated** — never paraphrase ("being reviewed" ✗).
- Status color/label is looked up from the single `STATUS` map; severity tier from `TIERS` by score. One source of truth — never hand-color a status.
- Escalated is red (highest urgency), intentionally distinct from Draft gray.

### IDs, numbers, units
- IDs render in mono and are explicit: `EE-260001`, `QIR-2026-0042`, `ISS-20418`.
- Show units/counts explicitly: `Severity 8.4`, `12 parts affected`, `3 days overdue`. Right-align numeric table columns.
- Multi-value cells (an issue spanning several sources/models/years) show the primary value first, remainder behind a hover/focus **"+N" popover**; consecutive years collapse to a range (`2023–2025`).

### Content & voice
- Plain, precise, operational — a competent colleague, never marketing.
- Sentence case everywhere except SHORT UPPERCASE labels (field labels, table headers, eyebrows). Buttons sentence case ("Submit for review").
- Address the user as **you**. System refers to itself in third person sparingly.
- Empty/error copy is factual and actionable and names the field + fix ("Enter a part number (e.g. 0K2A1-58-810).").
- Toasts state the outcome with the ID ("Issue ISS-20418 submitted for review."). Confirmations state consequences ("Closed issues are read-only and cannot be reopened.").
- **No emoji. Avoid exclamation marks and tone words.**

### Interaction & state rules
- Every actionable surface has visible hover, focus ring (accent), pressed, disabled, and selected states — focus rings are never removed.
- Role gates behavior: `read` (SE) vs `override` (ASM/PQM) affect scoring override, disposition approval, and scope (mine vs all).
- Mandatory-reason gates: status changes, score overrides (reason ≥20 chars), and "no action" dispositions (reason ≥30 chars) require justification → written to the audit trail.
- Every mutation (status, score, assignment, disposition, edits) appends to per-issue **chronology** and **audit** logs with actor, role, timestamp, and before→after values.
- Notifications: bell shows unread count; panel lists categorized items; "Mark all read" clears unread.

### Motion & density discipline
Functional motion only (fades + short slides, 120–240ms). No bounce, no infinite loops, no decorative animation. Comfortable-but-dense spacing tuned for long sessions; reduced-motion preferences respected.
