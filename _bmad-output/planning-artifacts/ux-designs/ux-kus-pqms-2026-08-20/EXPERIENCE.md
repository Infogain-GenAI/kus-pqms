---
name: Kia N-PQMS — Issue & Signal Management (ISM)
status: final
created: 2026-08-20
updated: 2026-08-24
sources:
  - _bmad-output/planning-artifacts/prds/prd-kus-pqms-2026-08-20/prd.md
  - _bmad-output/planning-artifacts/prds/prd-kus-pqms-2026-08-20/addendum.md
  - _bmad-output/planning-artifacts/ux/design-source/specs/ISM SE Role - Spec.md
design: ./DESIGN.md
---

# Issue & Signal Management (ISM) — Experience Spine

> Behavioral contract for the ISM module. Visual identity lives in `DESIGN.md` (referenced by `{path.to.token}`). Spine wins on conflict with any prototype, mock, or import. Canonical roles: **SE** (`read` = own-scope, creates/edits own issues and *proposes* changes), **ASM** / **PQM** (`override` = all-scope, *approve*), **Administrator** (governance). Canonical lifecycle: **Draft → Open → In Review → Pending Approval → Disposed / Monitoring → Closed / Escalated**.

## Foundation

Desktop-first **enterprise web**, single-page app over the **Kia N-PQMS Design System** (own component library; `DESIGN.md` is the visual identity reference). One `Header` + Kia-Midnight `SideNav` frame a single scroll region that swaps the active screen; navigation keeps a bounded history stack so **Back** is always available. Built for long operational sessions at high information density on a 1280–1600px container. Identity/session come from the enterprise IdP (corporate SSO for internal users); ISM never handles passwords.

## Information Architecture

| Surface | Reached from | Purpose |
|---|---|---|
| **Dashboard** (SE Overview) | App open / global nav | Command center — action items, attention-required, recently accessed, lifecycle-health counts |
| **Issue List** | Nav / Dashboard drill-down | Filter/sort/search issues; role-based views; bulk actions; export; New issue |
| **Create Issue** | Issue List → New issue | Simplified capture with inline correlation advisory |
| **Issue Workspace** | Issue row / open-by-ID | Tabs: Issue Detail · Investigation · Resolution · Communication · History (+ Sharing for override roles — out of scope this release) |
| **Administration** | Nav (Administrator) | Classification / model / valid-value master data + proposed-value approval queue; user & access management; feature/role permissions |
| **Notifications** | Header bell → View all | Full-page notification feed, searchable |

Navigation model: primary nav in the `{components.header}`; the `{components.sidenav}` carries in-module sections and collapses to 64px. Modal depth is one level (a dialog opens over a surface, never over another dialog). QIR is reachable only as an **issue → QIR hand-off** action from the Workspace (the QIR module itself is out of scope); TSB has no surface here.

Surface closure: every in-scope PRD capability lands on one of these surfaces, and every surface is entered by at least one Key Flow below.

## Voice and Tone

Microcopy only; brand voice lives in `DESIGN.md`. Plain, precise, operational — a competent colleague, audit-ready, never marketing. Address the user as **you**. Same tone for every role.

| Do | Don't |
|---|---|
| "Issue EE-260001 submitted for review." | "Success! Your issue was created 🎉" |
| "2 related issues found for this classification." | "We found some possible matches for you!" |
| "Enter a Model Code to continue." | "Oops — something's missing." |
| "Close this issue? Closed issues become read-only until reopened." | "Are you sure??" |
| "No issues match these filters. Clear filters to see all 1,204 issues." | "Nothing here." |
| Canonical status names verbatim (In Review, Pending Approval) | Paraphrase ("being reviewed", "awaiting sign-off") |

## Component Patterns

Behavioral rules; visual specs in `DESIGN.md.Components`.

| Component | Use | Behavioral rules |
|---|---|---|
| Issue table row (`{components.data-table-row}`) | Issue List | Click/double-click opens the Workspace (client-side, no reload). Checkbox selects for bulk actions. `Monitoring` rows render distinctly; `Mine` and `N links` badges appear inline. |
| Bulk action bar | Issue List | Appears when ≥1 row selected: Assign · Change status · Export. Bulk status change requires a target status **and a mandatory reason**, validated before applying to all selected. |
| Classification cascade | Create, Detail | Dependent System → Sub-system → Component → Symptom; each level enables after the prior; searchable type-ahead with a live issue-count; inline **Add new: [value]** submits to the approval queue and applies a *Pending Approval* badge without blocking submit. |
| Correlation panel | Create | Non-blocking advisory; appears once **Symptom** is selected; lists classification-matched candidates with match reason. Never blocks registration. |
| Suggested-link preview | Create, Workspace | Read-only preview opens without losing entered data; link directly from preview or close without linking. |
| Status change + `{components.approval-bar}` | Workspace | SE **proposes** a transition with a mandatory rationale → issue enters **Pending Approval**. ASM/PQM **approve/reject** with a mandatory approver remark. Start Investigation (Open → In Review) is self-service. |
| Model code &amp; year | Issue Entry · Vehicle Information | Model codes are **multi-select**; each selected code gets its own row of model-year checkboxes with a per-code select-all/clear and a remove-row control. A code's year universe is the **union** of its nominal MC_MASTER range and the years actually recorded, so a stored out-of-range year still appears (checked) rather than vanishing. Selecting no year for a code is a permitted state and is surfaced, not blocked. The first code in master order is the anchor and supplies the displayed model name. |
| Issue linking | Issue Entry · Search &amp; link issue; also Issue Detail edit mode | Search by id / title / model / symptom. Results exclude the issue itself and anything already linked, so no offered action is a no-op. Linking is idempotent. Links are **reciprocal** — the relationship reads identically from either side. Unlink is available per linked row. Correlation ("Same Existing Issues") rows carry a Link action directly, since that card's own copy invites linking. |
| Parts request | Workspace · **Investigation** | Part number live-lookup auto-fills description/cost (snapshot at request). Urgency selector surfaces the rule: Priority/Emergency need manager approval; Routine auto-approves within 24h. Status: Submitted → Approved → Ordered → Received. |
| Communication composer | Workspace · Communication | Message-type selector (Internal / External; Email auto-captured), rich text, attachments, Post. `@mention` validated before posting → notifies the mentioned party. Entries are immutable (admin soft-hide only). |
| Manage Linked Issues popup | Workspace | Search by classification; suggest → approve workflow; unlink is a soft-delete. Classification mismatch at link raises an alert requiring a conscious decision. |
| Document upload | Workspace · Investigation | Background upload; type/size validated (PDF/CSV/JPEG/PNG, ≤25 MB, ≤10 files); virus-scanned before storage; user notified on completion. |
| Notification bell | Header | Shows unread count; panel lists categorized items deep-linked to records; "Mark all read" clears the count. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Cold load | List, Dashboard | Skeleton rows/cards matching the target layout; resolve on data. |
| Empty (filtered) | Issue List | "No issues match these filters. Clear filters to see all {N} issues." with a Clear all action. |
| No correlation matches | Create | Panel stays quiet or states "No related issues for this classification." — registration continues normally. |
| Pending Approval | Workspace | Status pill = Pending Approval; the record is read-only to the proposer until the approver decides; the `{components.approval-bar}` is visible only to override roles. |
| Rejected transition | Workspace | Returns to prior status; proposer notified with the approver's remark. |
| Permission denied | any | Read-only rendering for view-only users; restricted surfaces are hidden from nav — no dead "blocked" screen. |
| Session expired | global | On 401, prompt about unsaved work, then redirect to the IdP sign-in. |
| Stale data | Workspace, List | On detected background change, a Toast: "Updated by {actor}. Refresh." — manual refresh, no silent auto-swap. |
| Upload in progress | Workspace | Non-blocking indicator; success Toast + activity entry on completion. |
| Value pending activation | Create, Admin | New classification value shows a *Pending Approval* badge; selectable on the current issue immediately, system-wide within 24h once approved. |

## Interaction Primitives

Optimized for operators who live in the product daily.

- **Search / filter** — type-ahead on classification and filter fields; `Apply` re-queries, `Clear all` resets; free-text search across searchable attributes.
- **Auto-save** — Create auto-saves a Draft periodically and on demand; no work is lost on navigation or session timeout prompt.
- **Keyboard** — full keyboard operation of comboboxes (Arrow / Enter / Escape); `Esc` closes the topmost dialog/popover; Tab order matches reading order.
- **Mouse** — click to act; hover reveals row quick-actions on pointer devices (tap-to-reveal on touch).
- **Reason gates** — status, classification, and disposition changes require a rationale before the action commits; post-submit edits by override roles require a justification.
- **Banned everywhere** — infinite scroll (server-side pagination only), modal stacks deeper than one level, hover-only affordances as the sole path, decorative motion, and drag-to-reorder in this release.

## Accessibility Floor

Behavioral; visual contrast lives in `DESIGN.md` (AA-verified tokens).

- **WCAG 2.1 AA** across the web surface. `[ASSUMPTION — confirm target level]`
- Classification comboboxes are fully keyboard-navigable (Arrow/Enter/Escape) and screen-reader accessible with ARIA labels and `aria-live` on result/count updates.
- Focus rings (`{colors.focus-ring}`) are always visible and never removed.
- Screen reader announces the active surface and record status on navigation ("Issue Workspace, EE-260001, In Review").
- Status is never conveyed by color alone — the status **name** (label) always accompanies the hue.
- Honors `prefers-reduced-motion` (disables smooth scroll and row/popover transitions).
- Right-aligned numerics; explicit units and IDs for screen-reader clarity.

## Key Flows

### Flow 1 — Register and catch a duplicate (Arpita, Service Engineer, Tuesday 9:10am)
1. Arpita opens ISM; the Dashboard greets her with 3 action items and today's attention list.
2. She clicks **New issue**, enters a Model Code — the Model Year range auto-fills.
3. She walks System → Sub-system → Component → Symptom. On selecting **Symptom**, the correlation panel surfaces two Open issues with the same classification.
4. She previews one, confirms the match, and links her entry (pending the other owner's approval).
5. **Climax:** she completes Title, Description, DTC and registers. A Toast reads "Issue EE-260001 submitted." — the Workspace opens at status **Open**, the linked issue already showing in Detail. She never left the flow to check for duplicates; the system brought the duplicate to her.
   *Failure:* no Symptom match exists → she types a new one, picks **Add new**, and registers anyway; the value carries a *Pending Approval* badge.

### Flow 2 — Investigate and request a part (Arpita, later that morning)
1. In the Workspace she opens **Investigation**, logs a Field Inspection activity, and attaches a photo (background upload; success Toast).
2. Under **Investigation** — the second of its two segments, beside Investigation Activities — she submits a **Parts Request**; the part number auto-fills description and cost; she marks it **Priority**.
3. **Climax:** the urgency note tells her Priority needs manager approval; on submit the request shows **Submitted** and a notification routes to her manager. Her investigation record and the parts request both sit under the one issue, timestamped and attributed.

### Flow 3 — Propose a disposition; the manager approves (Arpita → Park, After-Sales Manager)
1. Arpita moves the issue toward **Disposed (Resolved)** with a mandatory rationale; the pill flips to **Pending Approval** and the record goes read-only to her.
2. Park sees it in his action items, opens the Workspace, and reads the rationale in the approval bar.
3. **Climax:** Park approves with an approver remark. The transition, his remark, and her rationale all land in the immutable Audit history; the issue becomes **Disposed**. Nothing about the decision is untraceable.
   *Failure:* Park rejects with a remark → the issue returns to **In Review** and Arpita is notified with the reason.

### Flow 4 — Govern the taxonomy (Administrator / manager, end of day)
1. An approver opens the classification **approval queue** in Administration.
2. It lists Arpita's proposed Symptom with proposer, value, level, and originating issue.
3. **Climax:** the approver approves; within 24h the value is selectable system-wide — the taxonomy grew without an engineering release, and Arpita's original issue already carried the value.

### Flow 5 — Escalate to QIR (Seo-yeon, Product Quality Manager)
1. Seo-yeon reviews a cluster of correlated issues across her team from the Issue List (All Issues, her span of control).
2. On the qualifying issue she triggers **issue → QIR hand-off** (status **Escalated**).
3. **Climax:** the QIR reference appears read-only in the issue's Resolution tab; the audit records the hand-off. ISM's job ends at the boundary — the QIR module owns what happens next.

## Responsive & Platform

Desktop-first enterprise web. The product targets laptop/desktop (1280–1600px); dense tables assume width and use horizontal scroll when selected columns exceed the viewport. It is **not** a native mobile app; phone/tablet use is read-and-light-edit only. The side nav collapses to 64px on narrower widths; the primary experience is the wide data surface.

## Inspiration & Anti-patterns

- **Lifted from enterprise QMS practice:** reason-gated, append-only audit; propose → approve lifecycle; role-scoped default views; one-hue-per-status discipline.
- **Lifted from the Kia N-PQMS design system:** the whole surface vocabulary — components, tokens, voice. The experience is *what we specify on top of that system*, not a from-scratch UI.
- **Rejected — issue scoring / severity tiers:** out of scope this release; correlation is deterministic (classification-key matching), not score- or ML-driven. No severity KPIs, no score-driven default sort (default sort is Date Reported, descending).
- **Rejected — consumer flourishes:** no gamification, celebratory animation, emoji, or tone words. Task closure is its own signal.
- **Rejected — silent auto-refresh that swaps a user's data mid-edit:** always a manual, announced refresh.
