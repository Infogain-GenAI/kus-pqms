---
title: N-PQMS Issue & Signal Management (ISM) — Product Requirements Document
status: draft
version: "2.0"
created: 2026-08-20
updated: 2026-08-20
---

# N-PQMS Issue & Signal Management (ISM) — Product Requirements Document

## 0. Document Control

### 0.1 Why this document exists
This PRD defines what the **Issue & Signal Management (ISM)** module of N-PQMS must do, for whom, and to what quality bar, as a **greenfield rebuild on a new technology stack**. It is the single requirements reference for the downstream UX, architecture, and epic/story workflows. It states **capabilities, not implementation**; technology mechanics live in `addendum.md` and, ultimately, the architecture artifact.

### 0.2 Source-of-truth header
| Field | Value |
|---|---|
| Module | Issue & Signal Management (ISM) |
| Program | N-PQMS (next-generation Product Quality Management System), Kia |
| Document status | Draft (v2.0 — enterprise-template-conformant expansion of the v1.0 PRD) |
| Target go-live | 2026-12-18 |
| Precedence on conflict | **Design prototype → BRD/HLD**. Where sources diverge, the current design is canonical; the reconciliation is recorded in §0.6 and §22. |
| Out-of-scope (this release) | Issue scoring & score-driven severity; QIR module (hand-off only); TSB; EWS/GQIS bulk ingestion; ML similarity; cross-module correlation; dedicated Issue Group screen; explicit reassignment workflow |

### 0.3 Revision history
| Version | Date | Summary |
|---|---|---|
| 1.0 | 2026-08-20 | Initial PRD (Essential Spine + adapt-in clusters); 42 FRs; reviewed and FR-renumbered. |
| 2.0 | 2026-08-20 | Restructured to the Enhanced Enterprise template (26 sections + appendices); added RACI, authorization matrix, transition matrix, business/validation rules, data & API context, decision register, delivery plan, traceability; folded in the elicitation-review fixes (NAQC access, reporting, manual vehicle fallback, PQM/PQDH reconciliation, RISK-009, cross-refs). |

### 0.4 Reference documents
- **Product Brief** — `_bmad-output/planning-artifacts/briefs/brief-kus-pqms-2026-08-20/brief.md`
- **UX spines** — `_bmad-output/planning-artifacts/ux-designs/ux-kus-pqms-2026-08-20/DESIGN.md` and `EXPERIENCE.md`
- **Technical addendum** (implementation-how for architecture) — `./addendum.md`
- **Reference inputs** (input only, not copied): ISM BRD v1.5 (`NPQMS-ISM-BRD-v1.5.md`); ISM HLD v1.5 §1 architecture / §2 functional design / §3 data model; Claude Design projects "Kia N-PQMS V2-V3" and "V4-V5" (synced under `../../ux/design-source/`).

### 0.5 Reading conventions
- Functional requirements are globally numbered `FR-1 … FR-42`; downstream artifacts reference them by ID.
- `[ASSUMPTION]` marks an inference to confirm; every one is indexed in §23 (Open Questions) or §22 (Decision Register).
- Canonical vocabulary is defined once in Appendix A (Glossary) and used verbatim throughout — no synonyms.
- The PRD states **capabilities**; visual specs live in DESIGN.md, behavioral specs in EXPERIENCE.md, and transport/mechanism detail in `addendum.md`.

### 0.6 Contradictions resolved in this consolidation
| # | Conflict across sources | Resolution (canonical) |
|---|---|---|
| C1 | Module name: "Issue Management" (BRD/HLD) vs "Issue & Signal Management" (design) | **Issue & Signal Management (ISM)** — reflects multi-source signal capture. |
| C2 | Roles: SE/SEM/PQDH/OPSADM (+PUBCOO/external) (BRD/HLD) vs SE/ASM/PQM/Administrator (design) | Canonical **SE / ASM / PQM / Administrator**; mapping in §7.1 and Appendix B.1. |
| C3 | SE capability: "read" (design) vs full R/W (BRD/HLD) | SE `read` = **own-scope + create/edit-own + propose** (not read-only). |
| C4 | PQ Department Head is read-only (BRD role table) vs "final authority on disposition" (BRD stakeholders) vs PQM override (design) | **PQM is an override/approver** (design + BRD stakeholder intent); the BRD role-table "read-only" line is superseded. See §22 DR-07. |
| C5 | NAQC excluded (v1 PRD) vs NAQC read-only in BRD authorization matrix | **NAQC restored as a read-only ISM viewer** (§7.3). |
| C6 | Lifecycle: BRD/HLD 8-state set vs design 6-state set | Ratified set in §9.1; legacy→ratified map in Appendix B.2. |
| C7 | Disposition vocabulary: "No Issue" (BRD) vs "No Action" (design) | Reconciled in Appendix B.3 / §13.7. |
| C8 | Default list sort "Severity Score desc" (HLD, score-driven) | **Date Reported, descending** (scoring out of scope). |
| C9 | Document size cap "25 MB×10" vs "1 GB" (HLD) | **25 MB/file, max 10 files** (+ virus scan, BRD NFR-ISM-016). |
| C10 | Vehicle identity: VIN-based (HLD/AD-ISM-001) vs Model Code primary (BRD 1.4) | **Model Code primary**, with **manual vehicle-entry fallback** (§12.3, §20). |

### 0.7 Identifier and structural notes
- FR IDs are sequential (`FR-1…FR-42`); UX journeys are `UJ-1…UJ-5`; user flows `UF-01…UF-06` + exception flows `EF-01/EF-02`.
- Out-of-scope areas retain a numbered **stub** so the structure is complete and traceable, but carry no specification (e.g., §12.12 Severity scoring).
- The word "phase" is deliberately avoided; deferred work is labelled "out of scope / deferred / later release."

### 0.8 Table of contents
0 Document Control · 1 Executive Summary · 2 Business Context & Problem · 3 Business Objectives · 4 Stakeholders & RACI · 5 Business Requirements · 6 Scope Boundary · 7 Roles, Capabilities & Authorization · 8 Screen Inventory & Navigation · 9 Issue Lifecycle & State Machine · 10 User Flows · 11 User Stories · 12 Functional Requirements · 13 Business Rules · 14 Validation Rules · 15 Data Requirements · 16 API, Integration & Scheduled Work · 17 Non-Functional Requirements · 18 Security, Privacy & Compliance · 19 Solution Architecture Context · 20 Assumptions & Dependencies · 21 Risks & Mitigations · 22 Decision Register · 23 Open Questions · 24 Delivery Plan & Acceptance Gates · 25 Traceability · 26 Approvals & Change Control · Appendices A–C, E.

---

## 1. Executive Summary

N-PQMS is Kia's next-generation Product Quality Management System; **ISM is its highest-traffic module** (Tier-1 Critical; ~24% of total PQMS usage) and the system of record where Service Engineers register, investigate, correlate, and resolve vehicle quality issues. Target go-live **2026-12-18**.

Today's legacy issue workflow is source-agnostic and single-vehicle-level: the same defect reported across models, engineers, and time looks like unrelated records, so investigations duplicate, fleet-wide problems surface late, and the audit trail a regulated quality process depends on is thin. ISM reframes issue management around **structured capture, active correlation, and enforced traceability** — a classified taxonomy makes issues comparable, a deterministic correlation engine surfaces related/duplicate issues at entry and after linking, every status and disposition change is reason-gated and immutably audited, and an action-first dashboard puts each engineer's pending work, attention items, and lifecycle health on the landing page. The outcome: less duplicated investigation, faster root-cause convergence across the fleet, and a defensible quality record. ISM is the correlation backbone the rest of N-PQMS (QIR, TSB) will build on.

---

## 2. Business Context & Problem Statement

### 2.1 The operating problem
A Service Engineer investigating a suspected defect works largely blind to the wider signal: issues cannot be correlated (no structured classification, one vehicle at a time), quality signals are siloed per engineer and model, the record is not audit-grade (no system-coded IDs, no DTC at entry, no enforced chronology, no mandatory reason on status change), and priority is invisible on login. The cost is wasted investigation, delayed detection of fleet-wide problems, and a record that cannot fully support compliance, escalation, or decision-making.

### 2.2 What good looks like
- Duplicates are caught **at the moment of entry**, not weeks later.
- Every issue carries a complete, comparable classification and a system-coded ID.
- Every material change is reason-gated and immutably recorded.
- Engineers see their priority actions, SLA risks, and correlation alerts on login.
- The taxonomy grows with emerging signals without an engineering release.

### 2.3 Constraints the solution must respect
- **Greenfield build on a new technology stack**; existing BRD/HLD/design are input, not specification to copy.
- **Design prototype is canonical** on conflicts (§0.6, §22).
- Identity/session via the **enterprise IdP**; ISM stores no passwords.
- **Regulated, audit-critical** domain — immutability and traceability are non-negotiable.
- The out-of-scope set in §0.2/§6.3 is fixed for this release.

---

## 3. Business Objectives

| ID | Objective | Success measure | Validated by |
|---|---|---|---|
| BO-01 | Improve quality-issue management efficiency | Reduced registration/investigation/resolution effort | SM-5 |
| BO-02 | Improve traceability & auditability | 100% of activities/status changes/decisions traceable | SM-3 |
| BO-03 | Reduce duplicate investigations | More related issues identified; investigation reuse | SM-1 |
| BO-04 | Enhance cross-team collaboration | Better information sharing across Quality/Service/Engineering/Management | §12.9 |
| BO-05 | Support informed decision-making | Accurate issue data, reporting & visibility | §12.16, SM-6 |
| BO-06 | Let the classification taxonomy grow with signals | Admin-approved values live system-wide within 24 h, no deployment | SM-4 |
| BO-07 | Ensure all status changes are documented & auditable | 100% of status changes carry a user reason, visible in chronology same session | SM-3 |
| BO-08 | Give each engineer immediate visibility of priority actions on login | ≥ 40% reduction in time-to-action on approval-pending & SLA-overdue items (UAT) | SM-2 |

> [ASSUMPTION] SM-2's "SLA-overdue" is measurable only once the ISM-native SLA/due-date basis is set (§23 OQ4).

---

## 4. Stakeholders & RACI

### 4.1 Stakeholders
| Role | Party | Interest |
|---|---|---|
| Business Owner | KIA NA | Program authority; go/no-go |
| Project Manager | HAEA | Delivery, scope decisions, go-live sign-off |
| PQM / PQ Management | Product Quality Management | Final authority on disposition, grouping, cross-team escalation |
| ASM (After-Sales Manager) | Regional after-sales mgmt | Approves status changes & parts; team quality oversight |
| SE (Service Engineer) | Field/quality engineers | Primary operator: entry, investigation, disposition proposals |
| Administrator | Ops/IT admin | Governs taxonomy, master data, users, roles, feature access |
| NAQC | Technical escalation team | Read-only visibility into ISM for Top-Issue support |
| PQ Systems / Delivery Team | N-PQMS engineering | Implementation, integration, release |

### 4.2 RACI for key decisions & deliverables
*(R = responsible, A = accountable, C = consulted, I = informed)*

| Decision / deliverable | SE | ASM | PQM | Admin | PM | Bus. Owner | Delivery |
|---|---|---|---|---|---|---|---|
| Register / investigate an issue | R/A | C | I | – | I | – | – |
| Propose status/disposition change | R/A | C | C | – | – | – | – |
| Approve status/disposition change | I | R/A | R/A | – | – | – | – |
| Approve proposed classification value | I | R | A | C | – | – | – |
| Govern taxonomy & master data | – | I | C | R/A | I | – | – |
| Manage users / roles / feature access | – | – | I | R/A | C | I | – |
| Scope decisions & go-live sign-off | – | C | C | I | R | A | C |
| Requirements ratification (this PRD) | C | C | C | C | R | A | C |

---

## 5. Business Requirements

| BR-ID | Priority | Requirement | Realized by |
|---|---|---|---|
| BR-ISM-001 | P1 | Register, investigate, track, and resolve quality issues across their lifecycle | §12.1–12.11 |
| BR-ISM-002 | P1 | Role-based access and personalized views | §7, §12.2 |
| BR-ISM-003 | P1 | Vehicle identification and issue classification | §12.3 |
| BR-ISM-004 | P1 | Centralized workspace for investigation, collaboration, resolution, history | §12.5–12.10 |
| BR-ISM-005 | P1 | Identify, correlate, and manage related/duplicate issues | §12.4, §12.6 |
| BR-ISM-006 | P1 | Complete traceability of activities, status changes, decisions, admin actions | §12.10, §17.5 |
| BR-ISM-007 | P1 | Integration/information sharing between ISM and QIR — **one-way issue→QIR hand-off + read-only QIR reference this release** (full QIR module out of scope) | §12.8, §6.3 |
| BR-ISM-008 | P2 | Scalable, configurable framework for future requirements | §17.7, §12.13/12.15 |
| BR-ISM-009 | P2 | User efficiency via streamlined workflows and intuitive navigation | §8, §17.6 |
| BR-ISM-010 | P1 | Search, filter, and locate issues by business-relevant criteria | §12.2 |
| BR-ISM-011 | P1 | Create, view, update, manage issue records | §12.3, §12.5 |
| BR-ISM-012 | P1 | Lifecycle management with configurable statuses, transitions, outcomes | §9, §12.6 |
| BR-ISM-013 | P2 | Reporting **and** data export for business analysis | §12.16 |
| BR-ISM-014 | P1 | Issue disposition management (record the business outcome) | §12.8 |

---

## 6. Scope Boundary

### 6.1 In scope — ISM core
Overview Dashboard · Issue List & Search · Issue Creation (with inline correlation) · Classification & taxonomy governance · Correlation, suggested links & hierarchy (data relationships) · Issue Workspace (Detail / Investigation / Resolution / Communication / History) · Lifecycle & disposition (propose→approve, reopen) · Parts requests · Communication Log · Reporting & export · System-coded Issue IDs · Audit & activity history.

### 6.2 In scope — enabling platform slices
Document Management · Notifications (in-app + email) · Administration & Master Data (classification, model, valid values) · User & Access Management (RBAC) · Authentication & session · Source-channel attribution + authenticated inbound-signal API.

### 6.3 Out of scope (deferred)
- **Issue scoring & score-driven severity** (structure retained as a stub in §12.12).
- **QIR module** (list/create/workspace/analytics) — ISM keeps only the issue→QIR hand-off + read-only reference.
- **TSB / Publication Management.**
- **EWS & GQIS bulk ingestion pipelines** — ISM consumes resulting data; pipelines are separate integration work.
- **AI/ML similarity matching**; **cross-module correlation** beyond the QIR hand-off; **automated/external correlation notifications** beyond in-app/email on link events.
- **Restrictive status-transition state-machine enforcement** (beyond valid-next-transition guidance).
- **Dedicated Issue Group management screen** (hierarchy exists as data only).
- **Explicit engineer reassignment workflow** (ownership captured; workflow deferred).
- **Expert/user-group auto-allocation.**

### 6.4 Scope-change control
Scope changes after ratification are logged in §26.2 and require PM (A) sign-off with Business Owner consultation for material changes; each change updates the affected FRs, the Decision Register (§22), and Traceability (§25).

---

## 7. Roles, Capabilities & Authorization

### 7.1 Two role vocabularies, one mapping
The design uses **SE / ASM / PQM / Administrator**; the BRD/HLD use **SE / SEM / PQDH / OPSADM** (plus Publication and external roles). Canonical mapping (Appendix B.1): **ASM ≡ SEM**, **PQM ≡ PQ Department Head**, **Administrator ≡ OPSADM**. Publication roles (PUBCOO/PUBTO) and external plant/partner roles are out of ISM scope; **NAQC** is retained as a read-only ISM viewer (§7.3). `[ASSUMPTION → §23 OQ2]` The BRD role-table's "PQDH read-only" line is superseded by PQM's override authority (§22 DR-07).

### 7.2 Capability role model
- **read** (SE): own-scope; create/edit **own** issues, record investigation, **propose** status/disposition/classification changes, request parts, post comments.
- **override** (ASM, PQM): all-scope within span of control; everything `read` can do **plus approve/reject** proposed changes and act on any issue in scope.
- **admin** (Administrator): governs taxonomy, master data, users, roles, and feature/element permissions; not an issue-operator role.
- **read-only** (NAQC): view issues, workspace, and audit; export; no mutations.

### 7.3 Authorization matrix
| Function | SE | ASM | PQM | Admin | NAQC |
|---|---|---|---|---|---|
| View issue list / details / workspace | Y | Y | Y | Y | Y (RO) |
| Create / edit **own** issue (pre-submit) | Y | Y | Y | – | – |
| Edit issue **post-submit** (with justification) | – | Y | Y | – | – |
| Record investigation / request parts | Y | Y | Y | – | – |
| Propose status / disposition change | Y | Y | Y | – | – |
| **Approve/reject** status / disposition change | – | Y | Y | – | – |
| Manage linked issues | Y | Y | Y | – | – |
| Approve proposed classification value | – | Y | Y | Y | – |
| View audit / activity history | Y | Y | Y | Y | Y (RO) |
| Export issue information | Y | Y | Y | Y | Y (RO) |
| Manage classification / model / valid-value master data | – | – | – | Y | – |
| Manage users / roles / features | – | – | – | Y | – |

### 7.4 Data-scope rules
- SE sees **My Issues** (owned by/created by them); ASM/PQM see **All Issues** within their **span of control** (resolved via user hierarchy).
- External users (out of ISM scope this release) would be scoped by model/factory.
- Read-only roles (NAQC) see records but cannot mutate; all reads by privileged roles are subject to the access log (§12.14, §18.2).

---

## 8. Screen Inventory & Navigation Model

### 8.1 Screen inventory
| ID | Screen | Purpose |
|---|---|---|
| Overview | Dashboard | Action items, attention-required, recently-accessed, lifecycle health |
| ISM0010 | Issue List & Search | Filter/sort/search, role views, bulk actions, export, New issue |
| ISM0020 | Create Issue | Simplified capture + inline correlation advisory |
| ISM0040 | Issue Workspace | Tabs: Detail · Investigation · Resolution · Communication · History |
| ADM0200 | Classification Administration | Master-data governance + proposed-value approval queue |
| — | Master Data admin (model, valid values) | Vehicle & dropdown reference data |
| — | User & Access Management | Users, roles, features, access log |
| — | Notifications | Full-page notification feed |

### 8.2 Navigation model
Desktop-first enterprise web SPA: a sticky **60 px header** (global nav, breadcrumb, help, notification bell, user identity) over a Kia-Midnight **260 px side nav** (collapsible to 64 px), framing a single scroll region that swaps the active screen. A bounded history stack keeps **Back** available. (Visual/behavioral detail: DESIGN.md / EXPERIENCE.md.)

### 8.3 Navigation rules
- Primary nav: Dashboard · Issue Management · (disabled placeholders) QIR · TSB.
- Modal depth is one level; the Issue Workspace uses a self-sizing inner scroll region.
- QIR is reachable only via the **issue→QIR hand-off** action; TSB has no ISM surface.

### 8.4 Presentation contract
This PRD specifies **capabilities**. The **visual system** (tokens, components, states) is owned by `DESIGN.md`; **interaction/behavior/accessibility** by `EXPERIENCE.md`. Both spines win on conflict with any mock or prototype.

---

## 9. Issue Lifecycle & State Machine

### 9.1 Ratified status set
**Draft → Open → In Review → Pending Approval → Disposed / Monitoring → Closed / Escalated.** (Legacy/prototype → ratified mapping: Appendix B.2.)
- **Draft** — auto-saved pre-submit. **Open** — registered (system-set). **In Review** — actively worked. **Pending Approval** — a proposed transition awaits an override decision. **Monitoring** — under watch (max-occurrence, frequency, next-review-date). **Disposed** — terminal business outcome recorded. **Closed** — soft-closed (reopenable). **Escalated** — handed to QIR / flagged as a top issue.

### 9.2 Lifecycle diagram
```
Draft ─submit→ Open ─start investigation→ In Review
   In Review ─propose(→Monitoring|Disposed|Escalated|Closed)→ Pending Approval
      Pending Approval ─approve→ (target state) │ ─reject→ In Review
   Monitoring ⇄ In Review
   Closed ─propose reopen→ Pending Approval ─approve→ Open (fresh cycle)
```

### 9.3 Per-role transition matrix
| Transition | Proposed by | Approved by | Gate |
|---|---|---|---|
| Draft → Open (submit) | SE (owner) | — (system) | Mandatory-field validation |
| Open → In Review (start investigation) | SE (owner) | — (self-service) | — |
| In Review → Monitoring/Disposed/Escalated/Closed | SE (owner) | ASM / PQM | Mandatory rationale → Pending Approval |
| Any → (rejected) | — | ASM / PQM | Mandatory approver remark; returns to prior state |
| Closed → Open (reopen) | SE (owner) | ASM / PQM | Mandatory rationale; history preserved |

### 9.4 Approval-gated transition sub-state
A proposed transition places the issue in **Pending Approval**; the record is read-only to the proposer until an override role approves (applies the target state) or rejects (returns the prior state and notifies the owner). Approval decisions carry a mandatory remark.

### 9.5 Transition rules
- Only valid next transitions are offered; action labels describe the resulting business action.
- Every proposed/approved/rejected transition is an **append-only** history row (never in-place), capturing prior status, new status, actor, role, timestamp, and both remarks.
- Restrictive state-machine *enforcement* beyond valid-next guidance is out of scope (§6.3).

---

## 10. User Flows

- **UF-01 — Issue registration.** SE opens Create → Model Code (Model Year auto-defaults) → classification cascade → Title/Description/DTC → submit → system issues ID, sets **Open**, opens Workspace. (Realizes UJ-1.)
- **UF-02 — Classification & correlation during entry.** On Symptom selection the **Correlation Detection Panel** surfaces classification-matched candidates (non-blocking); SE previews and optionally links (suggested→approve). (UJ-1.)
- **UF-03 — Investigation & disposition.** SE logs activities, requests parts (approval-gated by urgency), attaches evidence, proposes a disposition with rationale → **Pending Approval** → ASM/PQM approve. (UJ-2, UJ-3.)
- **UF-04 — Triage from the Overview.** User lands on the Dashboard, works **My Action Items** (All/Due Today/Overdue) and **Attention Required**, drilling into records. (UJ-3.)
- **UF-05 — Post-submission correlation review.** After linking, both owners are notified; the counterpart owner approves/rejects the suggested link. (UJ-1, UJ-5.)
- **UF-06 — Classification value governance.** SE proposes a new value (attaches with *Pending Approval* badge, non-blocking); an approver clears the queue; value is live system-wide within 24 h. (UJ-4.)
- **EF-01 — Registration failure (exception).** Server-side validation fails on submit → the form retains entered data, names the offending field + fix; the user corrects and resubmits; a draft is auto-saved throughout.
- **EF-02 — Concurrent edit (exception).** A background change is detected on an open record → the user gets an announced "Updated by {actor}. Refresh." prompt (manual refresh; no silent data swap).

---

## 11. User Stories

These stories are normalized from the BRD v1.5 §7 user-story tables, re-expressed in this PRD's role vocabulary (SE / ASM / PQM / Administrator / NAQC) and grouped to match the §12 feature areas. Each carries testable acceptance criteria; full FR consequences live in §12, lifecycle detail in §9, and interaction detail in EXPERIENCE.md. Every in-scope FR group is covered. *(Issue scoring/severity, the QIR module beyond the issue→QIR hand-off, and TSB are out of scope and intentionally omitted.)*

### 11.1 Overview (ISM-OVW)
- **US-1** — As a signed-in user, I see my pending work and high-impact items on login so that I can act on what matters first. **Acceptance:** My Action Items lists items filterable All / Due Today / Overdue, each with an Open action; Attention Required lists high-impact issues (ID, description, impact) with drill-down; selection is action/SLA/correlation-based, never score-based. → FR-1
- **US-2** — As a signed-in user, I see recently accessed records and lifecycle-health counts so that I can resume work and gauge workload. **Acceptance:** Recently Accessed shows type, ID, title, status, and relative timestamp and each item is clickable; Lifecycle Health shows per-status counts with distinct color indicators; both refresh dynamically. → FR-1
- **US-3** — As a signed-in user, I have consistent global chrome and a notification bell so that I can navigate and stay aware of alerts. **Acceptance:** header shows global nav, breadcrumb, help, and identity + role + last-login; the bell shows an unread count; dashboard content is personalized to my role. → FR-2

### 11.2 Issue List (ISM-LST / ISM0010)
- **US-4** — As an SE, I default into "My Issues" and can switch to All Issues so that I focus on my work without losing the wider view. **Acceptance:** My Issues is the default; ASM/PQM can open All Issues within their span of control; selecting a row opens the Workspace and New Issue opens Issue Entry. → FR-3
- **US-5** — As a signed-in user, I personalize columns and page/sort the list so that I can work large result sets efficiently. **Acceptance:** default + optional columns show/hide and persist; default sort is Date Reported descending; server-side pagination shows total count with adjustable rows-per-page, horizontal scroll, and full IDs/titles on hover. → FR-4
- **US-6** — As a signed-in user, I search and filter the list so that I can quickly locate relevant issues. **Acceptance:** free-text search runs across searchable attributes; multi-select Source/Model/Status, Owner, Date-Reported range, and toggle filters are available; Apply/Clear updates list and counts; inputs are server-side validated. → FR-5
- **US-7** — As a signed-in user, I act on multiple issues at once and export the current list so that I can manage and analyze in bulk. **Acceptance:** row checkboxes enable bulk Assign and Change Status; a bulk status change requires a validated reason and is audited; Export downloads the current filtered list. → FR-6

### 11.3 Issue Entry (ISM-ENT / ISM0020)
- **US-8** — As an SE, I register an issue through a simplified capture form so that I can document a signal quickly. **Acceptance:** capture order Model Code → System Classification → Title → Description → DTC; Model Code mandatory, auto-defaults Model Year range (I may narrow), with manual vehicle-entry fallback when services are unavailable; mandatory fields validated client- and server-side before submit. → FR-7
- **US-9** — As an SE, I classify the issue through a dependent cascade so that issues are categorized consistently. **Acceptance:** System → Sub-system → Component → Symptom each enable only after the prior; fields are searchable type-ahead with a live issue-count; only valid paths are selectable and chosen values store with the issue. → FR-9
- **US-10** — As an SE, I attach one or more DTCs so that diagnostic information is available for investigation. **Acceptance:** DTCs are multi-selectable from master data; chips are color-coded by prefix (P/B/C/U; unrecognized = neutral); selected DTCs store with the record. → FR-8
- **US-11** — As an SE, I submit the issue and receive a clear registration outcome so that I know it was created and can continue. **Acceptance:** on submit the system generates Issue ID `{SYS}-{YY}{NNNN}`, captures the creation date, and sets Open; a confirmation shows ID/title/status with options to open the Workspace or return to the list; an audit entry is created and the form becomes read-only. → FR-10

### 11.4 Correlation engine (ISM-COR)
- **US-12** — As an SE, I see suggested related issues in real time while entering so that I do not duplicate existing investigations. **Acceptance:** on Symptom selection a Correlation Detection Panel shows classification-matched candidates (non-blocking) with match reason, indicator, and key attributes; I can select one or more to link and continue without linking. → FR-13
- **US-13** — As an SE, I preview a suggested issue read-only before linking so that I can confirm relevance without losing my entry. **Acceptance:** the preview opens read-only with key details; I can link from the preview or close it; closing returns me to Issue Entry with data intact. → FR-14
- **US-14** — As an SE, I manually search for and link related issues, with the counterpart confirming, so that relationships are accurate and traceable. **Acceptance:** I can search beyond the suggested set and link one or more; a new link is a Suggested Link (pending) with both owners notified, and the counterpart approves (→ Linked Issue) or rejects; link/unlink recorded in audit (unlink is soft-delete). → FR-15
- **US-15** — As an SE, linked issues form a parent/child hierarchy under a common root so that related signals stay grouped. **Acceptance:** the first link makes the new issue a child of the existing parent with a root reference and further links attach to the same root; a classification mismatch raises an alert requiring a conscious decision; Root is a list search criterion. → FR-16

### 11.5 Issue Workspace — Detail (ISM-WSP-D / ISM0040)
- **US-16** — As a signed-in user, I open the Workspace and review issue detail so that I understand context and status. **Acceptance:** the Workspace opens with Detail/Investigation/Resolution/Communication/History; Detail shows issue information, vehicle information, classification, source-channel panels, and same/linked issues; read-only without edit permission. → FR-17
- **US-17** — As an authorized user (SE owner / ASM / PQM), I edit issue information and manage links so that records stay accurate. **Acceptance:** authorized users edit fields and links and edits are audited; post-submit edits require justification; users without edit permission (incl. NAQC) see read-only. → FR-17

### 11.6 Issue Workspace — Status changes & linking
- **US-18** — As a signed-in user, I see the current status and only valid next transitions so that I know the available actions. **Acceptance:** the Workspace shows current status and only valid transitions across Draft→Open→In Review→Pending Approval→Disposed/Monitoring→Closed/Escalated; action labels describe the business action; definitions per §9.1. → FR-24
- **US-19** — As an SE, I propose a status change with a mandatory rationale so that progression is documented. **Acceptance:** Open→In Review is self-service; any change to Monitoring/Disposed/Escalated/Closed requires a rationale and moves the issue to Pending Approval; I can cancel without updating. → FR-25
- **US-20** — As an ASM/PQM, I approve or reject a proposed status change with a remark so that transitions are controlled and auditable. **Acceptance:** approval applies the target state, rejection returns the prior state and notifies the owner; a mandatory approver remark is captured; every transition is an append-only audit row. → FR-26
- **US-21** — As an SE, I propose reopening a closed issue (approved by ASM/PQM) so that work can resume without losing history. **Acceptance:** Closed → reopen goes through propose→approve; a fresh cycle begins at Open; prior record and lifecycle history are preserved and surfaced in History. → FR-27

### 11.7 Issue Workspace — Investigation (ISM-WSP-I)
- **US-22** — As an SE, I record and maintain investigation activities so that causes can be evaluated and documented. **Acceptance:** create/update activities in a chronological timeline; types include Parts Request, Parts Evaluation, Field Inspection, Supplier Investigation, Technical Analysis (configurable); activities associate with the issue. → FR-18
- **US-23** — As an SE, I attach supporting evidence to activities so that findings are documented and traceable. **Acceptance:** documents/evidence attach to the activity, retained and retrievable by authorized users; type/size/count limits enforced. → FR-19
- **US-24** — As an SE, I raise parts requests within an investigation so that parts are sourced with the right approvals. **Acceptance:** Part Number live-lookup auto-populates description/material/cost (snapshot) with Quantity, Urgency, Purpose, Needed-By; Priority/Emergency require manager approval while Routine auto-approves within 24 h; status flows Submitted → Approved → Ordered → Received with a consistent badge. → FR-20

### 11.8 Issue Workspace — Resolution (ISM-WSP-R)
- **US-25** — As an SE, I review resolution information so that I can track outcomes and corrective actions. **Acceptance:** Resolution shows disposition outcome and closure info; a linked QIR's reference and read-only root-cause/countermeasure summary display; related publication references show read-only. → FR-21
- **US-26** — As an SE, I record a disposition with a mandatory rationale so that the business outcome is documented and auditable. **Acceptance:** Disposed outcomes are Resolved and No Action, with Monitoring and Escalated as separate lifecycle destinations; a rationale is mandatory and written to history. → FR-22
- **US-27** — As an SE, I initiate a QIR hand-off from an issue so that findings can be escalated into the QIR process. **Acceptance:** I can initiate QIR creation with issue information available; the created QIR reference links to the issue and shows read-only in Resolution; the hand-off is audited. → FR-23

### 11.9 Issue Workspace — Communication (ISM-WSP-C)
- **US-28** — As a signed-in user, I post and read messages on an issue so that collaboration stays centralized and traceable. **Acceptance:** comments display reverse-chronologically with role/name badge, timestamp, rich text, and attachment previews; entry types Internal / External / (auto-captured) Email; validated @mentions trigger notifications. → FR-28
- **US-29** — As a signed-in user, I can rely on communication entries being immutable so that the record stays trustworthy. **Acceptance:** entries cannot be edited or deleted by any role; an administrator may soft-hide (flag) an entry; all entries are role-stamped and timestamped; External-type comments restricted to users with cross-org visibility (or managers on their behalf). → FR-29

### 11.10 Issue Workspace — History (ISM-WSP-H)
- **US-30** — As a signed-in user, I review an issue's full activity and audit history so that changes and decisions stay traceable. **Acceptance:** History offers All / Activity (Lifecycle) / Audit views, searchable and date-filterable; audit records every state/field/value change (field, old→new, actor, role, timestamp, reason), captured by system/rules, append-only and immutable; manual history entry is restricted by role. → FR-30

### 11.11 Documents (cross-section)
- **US-31** — As an SE, I upload and manage supporting documents on an issue so that evidence is retained. **Acceptance:** upload, list, remove (soft-delete), and update metadata, associated to the issue; allowed types PDF/CSV/JPEG/PNG, max 10 files, 25 MB/file, validated client- and server-side; files virus/malware scanned before storage; uploads run in background with a completion notification and activity entry. → FR-31

### 11.12 Classification Administration (ISM-ADM-C / ADM0200)
- **US-32** — As an SE, I add a missing classification value inline and submit immediately so that emerging signals are never lost waiting for taxonomy updates. **Acceptance:** an "Add new: [value]" option appears when typed text has no match; selecting it applies the value with a "Pending Approval" badge; the issue submits with the pending value attached and a new entry appears in the ADM0200 queue. → FR-11
- **US-33** — As an Administrator, I govern a pending-approval queue of proposed values so that I can activate or reject with context. **Acceptance:** the queue lists each pending value with proposer, value, level, and originating issue ID; approve activates system-wide within 24 h; reject requires a remark, discards the value, and notifies the proposer. → FR-12
- **US-34** — As an Administrator, I manage classification master data so that the taxonomy stays governed. **Acceptance:** create/edit/search/deactivate System/Sub-system/Component/Symptom with cascading browse and parent-child hierarchy configuration; every mutation audited; approved values appear within 24 h (or next cache refresh). → FR-34

### 11.13 Master data (read & cache)
- **US-35** — As an Administrator, I manage model and valid-value master data so that dropdowns/filters/columns stay accurate. **Acceptance:** model master (code/name/year/variant/status) and valid-values master (id-type/code/value/description/display-sequence) support CRUD + activate/deactivate/soft-delete with display-order control; source-synced records marked, manual entries flagged "Manual — not from source". → FR-35

### 11.14 Authentication, authorization, session & notifications
- **US-36** — As an Administrator, I manage users and roles so that only the right people have the right access. **Acceptance:** create/search/activate/deactivate/soft-delete users, filterable by role/status/org-unit/last-login; multi-role assignment with overridable expiry and bulk CSV/XLSX (validated); role expiry auto-deactivates with an advance reminder; all changes audited. → FR-36
- **US-37** — As an Administrator, I manage feature and element permissions so that access is controlled down to buttons and fields. **Acceptance:** manage Features (screens) and Feature Elements (buttons/fields/actions), mapped to roles for element-level access; admin force-expiry of a session takes effect within one refresh cycle. → FR-37
- **US-38** — As an Administrator (or PQM), I review an immutable access log so that resource interactions are accountable. **Acceptance:** every UI-resource interaction is captured to an append-only, exportable access log viewable only by administrators and PQM. → FR-38
- **US-39** — As a signed-in user, I authenticate through enterprise identity so that access is secure and password-free within ISM. **Acceptance:** internal users via corporate SSO, external via federated identity by invitation with a pre-assigned scoped role; ISM stores no passwords and consumes a validated token (MFA by the IdP), issuing its own session; change/forgot-password redirect to IdP self-service. → FR-39
- **US-40** — As a signed-in user, my session and terms acceptance are managed so that access stays valid and compliant. **Acceptance:** sessions expire on token/session expiry, prompting about unsaved work then re-auth; Terms & Conditions acceptance required on first login and any revised version, logged with user/version/timestamp. → FR-40
- **US-41** — As a signed-in user, I receive event-triggered notifications and can review their history so that I stay aware and can catch up. **Acceptance:** notifications deliver in-app (bell + unread count) and email, each event-triggered and deep-linked; a searchable history (sender, type, date range) supports mark-read; managers/admins can view any user's history, ordinary users only their own. → FR-32, FR-33
- **US-42** — As NAQC (read-only), I view issues, workspace, and audit history and export them so that I can support escalations without changing anything. **Acceptance:** NAQC can view list/detail/workspace and activity + audit history and export; no create/edit/status/link/admin actions; all NAQC reads captured in the access log. → FR-17, FR-30, FR-38, FR-43

### 11.15 Reporting & export
- **US-43** — As a signed-in user, each issue carries a source-channel attribution I can filter and view so that signals are traceable to origin. **Acceptance:** each issue is tagged with a source channel (Warranty, Weibull, Comeback, Techline, FPQR, EWS, GQIS), filterable in the list and shown in Detail; source-specific data viewable/editable in the Detail source panel. → FR-41
- **US-44** — As an authenticated source system, I submit inbound issue signals through an integration endpoint so that external signals enter ISM with traceability. **Acceptance:** the authenticated endpoint accepts externally-submitted issues (e.g., GQIS); accepted issues enter at Open with source attribution; load traceability is recorded. → FR-42
- **US-45** — As a signed-in user, I export the filtered list, save/share list views, and run operational reports so that I can support analysis and decisions. **Acceptance:** I can export the current filtered list and create saved/shared views; operational reports (open-issue aging, lifecycle-stage distribution, taxonomy usage, correlation/link volume) are delivered via saved views + export. → FR-43

---

## 12. Functional Requirements

*FRs are globally numbered and carry testable consequences. Grouped by area to match the screen inventory.*

### 12.1 Overview (ISM-OVW)
**FR-1: Dashboard action & attention panels.** The user sees, on login, pending work and high-impact items.
- **My Action Items** with tabs All / Due Today / Overdue; each row has an **Open** link.
- **Attention Required** lists high-impact issues (ID, description, impact indicator) with drill-down. *Selection is action/SLA/correlation-based, never score-based (§23 OQ3).*
- **Lifecycle Health** counts per status, visually distinct.
- **Recently Accessed** issues (type, ID, title, status, relative timestamp) + View all; look-back configurable (default 2 days) `[ASSUMPTION]`.

**FR-2: Global chrome & notifications.** Consistent header nav, breadcrumb, help, identity + role + last-login; a notification bell with unread count; per-user panel-arrangement persistence.

### 12.2 Issue List (ISM-LST / ISM0010)
**FR-3: Role-based views & quick filters.** **My Issues** default; **All Issues** for managers (span-of-control); quick-filter tabs (All/My/Pending); default pre-interaction view = Source Warranty, Status Open, Closed hidden; Monitoring rows distinct; per-row **Mine** / **N links** badges.
**FR-4: Columns, sort & pagination.** Master-data-driven default + optional columns; show/hide persists across sessions; **default sort = Date Reported, descending**; server-side pagination; horizontal scroll; full IDs/titles on hover.
**FR-5: Filter panel & search.** Multi-select Source/Model/Status, single-select Owner, Date-Reported range, toggles (EWS-only, Has Pending Links, Assigned to Me, Show/Hide Closed); Apply/Clear; free-text search across searchable attributes; all inputs server-side validated.
**FR-6: Bulk actions & export.** Checkbox selection; bulk **Assign**, **Change Status** (mandatory reason, validated, audited), **Export** (current filtered list).

### 12.3 Issue Entry (ISM-ENT / ISM0020)
**FR-7: Simplified capture.** Capture order Model Code → System Classification → Title → Description → DTC; **Model Code primary**, auto-defaults Model Year range (user may narrow); **manual vehicle-entry fallback** when vehicle services are unavailable (AD-ISM-001); client validation + authoritative server validation; drafts auto-save.
**FR-8: DTC capture.** Multi-select from master data; chips color-coded by prefix (P/B/C/U; unrecognized = neutral).
**FR-9: Classification cascade.** Dependent System → Sub-system → Component → Symptom; each level enables after the prior; searchable type-ahead with live issue-count; full-width breadcrumb; inline **Add new: [value]** (see FR-11).
**FR-10: Registration outcome.** On submit: generate Issue ID `{SYS}-{YY}{NNNN}`, capture creation date, set **Open**; form read-only post-submit (override roles may edit with justification → audit); confirmation shows ID/title/status; continue to Workspace or list; audit entry created.

### 12.4 Correlation engine (ISM-COR)
**FR-13: Real-time correlation at entry.** On Symptom selection, a **Correlation Detection Panel** shows classification-matched candidates (non-blocking advisory) with match reason and key attributes.
**FR-14: Preview & link.** Read-only preview without losing entered data; link from preview or close; continue registration regardless.
**FR-15: Suggest-then-approve linking.** New link stored as **Suggested Link** (pending); both owners notified; counterpart approves→**Linked Issue** or rejects; manual search-and-link available; unlink is a soft-delete, audited.
**FR-16: Issue hierarchy.** First link makes the new issue a child of the existing (parent) with a root reference; further links attach to the same root; classification mismatch raises an alert requiring a conscious decision; **Root** is a list search criterion. *(No group-management screen — §6.3.)*

### 12.5 Issue Workspace — Detail (ISM-WSP-D / ISM0040)
**FR-17: Detail view & edit.** Issue Information (title/description/DTC), Vehicle Information, System Classification, per-present Source-Channel panels, Same/Linked Issues; read-only without edit permission; edits audited; tabs lazy-load.

### 12.6 Issue Workspace — Status changes & linking
**FR-24: Status model & visibility.** Current status + only valid next transitions; action labels describe the business action; status definitions per §9.1.
**FR-25: Propose a status change (reason-gated).** Any change beyond starting review requires a mandatory rationale → **Pending Approval**; Open→In Review is self-service.
**FR-26: Approve/reject a status change.** ASM/PQM approve/reject with a mandatory approver remark; approval applies the state, rejection returns prior + notifies owner; every transition is append-only audit.
**FR-27: Reopen a closed issue.** Closed is reopenable via propose→approve; prior record + lifecycle history preserved; fresh cycle begins at Open; History surfaces pre-reopen history.

### 12.7 Issue Workspace — Investigation (ISM-WSP-I)
**FR-18: Investigation activities.** Full CRUD on activities in a chronological timeline; types include Parts Request, Parts Evaluation, Field Inspection, Supplier Investigation, Technical Analysis (configurable); evidence attachments per §12.11.
**FR-19: Evidence capture.** Documents attach to an activity, retained and retrievable by authorized users; type/size limits per §12.11.
**FR-20: Parts request.** Part Number live-lookup (description/material/cost auto-populate + snapshot), Quantity, Urgency (Routine/Priority/Emergency), Investigation Purpose, Needed-By; Priority/Emergency require manager approval, Routine auto-approves within 24 h; status Submitted → Approved → Ordered → Received; multiple per issue; consistent status badge in issue and cross-issue parts views.

### 12.8 Issue Workspace — Resolution (ISM-WSP-R)
**FR-21: Resolution view.** Disposition outcome + closure info; where a linked QIR exists, its reference and read-only root-cause/countermeasure summary display; related publication references read-only.
**FR-22: Disposition with rationale.** Outcomes at **Disposed**: Resolved, No Action (does-not-belong / not-an-issue); Monitoring and Escalated are separate lifecycle destinations (§9); rationale mandatory, written to history. (Vocabulary reconciliation: Appendix B.3.)
**FR-23: Issue → QIR hand-off.** Initiate a QIR from an issue; the QIR reference is linked and shown read-only in Resolution; audited. *Out of scope:* the QIR module itself (§6.3).

### 12.9 Issue Workspace — Communication (ISM-WSP-C)
**FR-28: Post & view messages.** Comments shown reverse-chronologically with role/name badge, timestamp, rich text, attachment previews; entry types Internal / External / (auto-captured) Email; `@mention` validated → notification.
**FR-29: Immutability & visibility.** Entries cannot be edited/deleted by any role; an administrator may soft-hide (flag); all entries role-stamped and timestamped; External-type comments restricted to users with cross-org visibility (or managers on their behalf).

### 12.10 Issue Workspace — History (ISM-WSP-H)
**FR-30: Activity & audit history.** History tab provides All / Activity (Lifecycle) / Audit views, searchable + date-filterable; audit records every state/field/value change (field, old→new, actor, role, timestamp, reason), system/rule-captured, append-only, immutable; consolidated linked-issue activity where applicable.

### 12.11 Documents (cross-section)
**FR-31: Upload & manage documents.** Upload, list, remove (soft-delete), update-metadata; associate to an issue (reusable for QIR/TSB where applicable); allowed types PDF/CSV/JPEG/PNG; **max 10 files, 25 MB/file**; type/size/count validated client + server; **virus/malware scanned before storage** (BRD NFR-ISM-016); background upload with completion notification + activity entry.

### 12.12 Severity scoring (ISM-WSP-S) — *OUT OF SCOPE (stub)*
Issue scoring & score-driven severity are **not specified in this release** (see §6.3, §22 DR-03). Design components (`SeverityIndicator`/`SeverityBar`) and any score-driven KPIs/sorts are reference-only. This section is retained solely for structural traceability.

### 12.13 Classification Administration (ISM-ADM-C / ADM0200)
**FR-34: Manage classification master data.** CRUD + search on System/Sub-system/Component/Symptom with cascading browse; deactivation + parent-child hierarchy config are admin functions; every mutation audited; proposed-value approvals per FR-12.
**FR-11: Propose a new classification value.** Typing an unmatched value offers **Add new: [value]** → applies with a *Pending Approval* badge and enters the queue; submission proceeds non-blocking.
**FR-12: Govern & activate values.** Pending-approval queue (proposer, value, level, originating issue); approve activates, reject requires remark + notifies proposer; approved values live system-wide within **24 h**; a reminder fires if not actioned within 24 h.

### 12.14 Authentication, authorization, session & notifications
**FR-36: Manage users & roles.** CRUD/search/activate/deactivate/soft-delete users; filter by role/status/org-unit/last-login; audited; multi-role assignment with expiry (overridable); bulk assignment via CSV/XLSX (validated, per-file cap); role expiry auto-deactivates with advance admin reminder.
**FR-37: Feature & element permissions.** Manage Features (screens) and Feature Elements (buttons/fields/actions); map to roles for element-level access; admin force-expiry of a session effective within one refresh cycle.
**FR-38: Access log.** Every UI-resource interaction captured to an immutable, exportable access log; viewable by administrators and PQM.
**FR-39: Authenticate & authorize.** Internal users via corporate SSO; external via federated external identity by invitation with a pre-assigned scoped role; ISM stores/processes no passwords; MFA enforced by the IdP; ISM consumes a validated token and issues its own session; change/forgot-password redirect to IdP self-service.
**FR-40: Session & terms.** Sessions expire on token/session expiry (prompt about unsaved work → re-auth); Terms & Conditions acceptance required on first login and on any revised version, logged with user/version/timestamp.
**FR-32: Notification delivery.** Channels in-app (bell + unread) and email; each notification event-triggered and deep-linked; event catalogue in §16.4.
**FR-33: Notification history.** Searchable history (sender, type, date range); mark-read clears the count; managers/admins can view any user's history, ordinary users only their own.

### 12.15 Master data (read & cache)
**FR-35: Manage model & valid-value master data.** Model master (code/name/year/variant/status) CRUD + activate/deactivate/soft-delete; source-synced records marked, manual entries flagged "Manual — not from source"; valid-values master (id-type/code/value/description/display-sequence) powers dropdowns/filters/columns across N-PQMS; CRUD + activate/deactivate/soft-delete with display-order control.

### 12.16 Reporting & export
**FR-41: Source-channel attribution.** Each issue tagged with a source channel (Warranty, Weibull, Comeback, Techline, FPQR, EWS, GQIS); filterable in the list and shown in Detail; source-specific data viewable/editable in the Detail source panel.
**FR-42: Inbound signal submission.** An authenticated integration endpoint accepts externally-submitted issues (e.g., GQIS) that enter at **Open** with source attribution and load traceability. *Out of scope:* scheduled bulk CSV ingestion + EWS/GQIS pipeline implementation (§6.3).
**FR-43: Reporting & export.** Export the current filtered issue list; **saved/shared list views**; and **operational reports** (e.g., open-issue aging, lifecycle-stage distribution, taxonomy usage, correlation/link volume) delivered via saved views + export. *(Closes BR-ISM-013 / BO-05. Rich analytics dashboards are out of scope.)* `[ASSUMPTION → §23 OQ11]`

---

## 13. Business Rules

*Roles use the canonical set (SE / ASM / PQM / Administrator / NAQC read-only); mapping to source role codes per Appendix B.1. Rules are stated against the **ratified lifecycle (§9.1)**; where HLD state names appear (Investigating, QIR Escalation, Top Issue, NASO), they map to the ratified set per Appendix B.2 — In Review ← Investigating; Escalated ← QIR Escalation / Top Issue; Disposed (No Action) ← NASO / "No Issue" (Appendix B.3, confirm per §23 OQ1); Monitoring / Resolved as-is.*

### 13.1 Identity & Lifecycle
- **BR-IDL-01** — Every registered issue receives a system-generated Issue ID `{SYS}-{YY}{NNNN}` (system code + 2-digit year + 4-digit zero-padded sequence, e.g. `EE-260001`), assigned only on successful registration.
- **BR-IDL-02** — Issue IDs are globally unique and immutable; never edited, reused, or reissued.
- **BR-IDL-03** — The `{SYS}` segment derives from the top-level System classification, so the ID is self-identifying by system.
- **BR-IDL-04** — The `{NNNN}` sequence is allocated per system + year scope and never reused within it. `[ASSUMPTION]`
- **BR-IDL-05** — On registration the system sets status **Open** automatically; Open is system-set, never user-selectable.
- **BR-IDL-06** — A pre-registration entry exists only as an auto-saved **Draft** (auto-save periodic, non-blocking); a Draft has no Issue ID and is not surfaced in the Issue List. `[ASSUMPTION on list exclusion]`
- **BR-IDL-07** — The **ratified lifecycle states are per §9.1**; legacy HLD state names map per Appendix B.2, and this set supersedes the earlier disposition-code vocabulary.
- **BR-IDL-08** — SE may move Open → In Review directly with no approval; this is the only self-approved transition.
- **BR-IDL-09** — Every other transition is propose→approve: SE proposes with a mandatory rationale; ASM/PQM approves/rejects with a mandatory remark; while pending, the issue is in **Pending Approval** and its prior status is unchanged.
- **BR-IDL-10** — Transitions are validated against valid next-states; invalid transitions are rejected. *(Valid-next guidance; restrictive state-machine enforcement is out of scope — §6.3.)*
- **BR-IDL-11** — Each transition (proposed/approved/rejected) is an append-only lifecycle-history row, never an in-place update.
- **BR-IDL-12** — Disposed (Resolved / No Action) is terminal; **Closed is a soft-close** and may be reopened.
- **BR-IDL-13** — An approved move to **Monitoring** requires monitoring parameters (max occurrence, frequency, next-review date) before commit.
- **BR-IDL-14** — Reopen (Closed → Open) follows the same propose/approve governance; on approval the prior snapshot and prior lifecycle rows move to history and a fresh cycle begins at Open.
- **BR-IDL-15** — **Escalated** is reached only via an approved transition; approval triggers the issue→QIR hand-off + an owner task to a manager (QIR internals owned by QIR Management, out of scope).

### 13.2 Classification & Correlation
- **BR-CLS-01** — Cascade System → Sub-system → Component → Symptom; each level constrained by its parent; only valid paths selectable.
- **BR-CLS-02** — Classification keys are PQMS-native master data; only active/approved values are selectable at entry.
- **BR-CLS-03** — A user may propose a new value inline ("Add new: [value]"); it is usable in the current entry with a *Pending Approval* badge and the issue can submit with it attached.
- **BR-CLS-04** — A proposed value is stored Pending Approval and does not appear in other users' dropdowns until approved.
- **BR-CLS-05** — Classification-value approval/rejection is by an authorized manager (**ASM/PQM**), reject requiring a remark; the **Administrator** governs value deactivation and parent-child hierarchy. *(RACI §4.2 aligns; §7.3's admin grant is a superuser allowance.)*
- **BR-CLS-06** — Approved values become selectable system-wide within **24 hours** (or next cache refresh).
- **BR-CLS-07** — A pending value not actioned within 24 hours raises an approval-reminder notification.
- **BR-CLS-08** — Correlation is **deterministic exact-key matching** on classification keys + Model — no AI/similarity scoring.
- **BR-CLS-09** — The correlation panel is advisory and non-blocking; it appears once a Symptom is selected and never prevents submit.
- **BR-CLS-10** — Each suggested issue carries a match reason and match-type indicator (e.g. Exact Classification, Same Model).
- **BR-CLS-11** — Post-registration classification change requires a mandatory rationale, recorded in audit.

### 13.3 Vehicle & Evidence
- **BR-VEH-01** — Model Code is the primary vehicle identifier; mandatory; selected from master data, not free-typed.
- **BR-VEH-02** — Model Year range auto-defaults from Model Code; user refinement must stay within the model's valid range.
- **BR-VEH-03** — Vehicle master is sourced from the authorized source system; manual entry is permitted as a fallback when unavailable.
- **BR-VEH-04** — DTC capture is optional and multi-valued (stored comma-delimited).
- **BR-VEH-05** — DTCs categorize by prefix — P=Powertrain, B=Body, C=Chassis, U=Network; unrecognized render neutral.
- **BR-VEH-06** — Evidence/attachments may be added at entry and per activity; retained with the issue and available to authorized users.
- **BR-VEH-07** — Attachment count and per-file size limits enforced client + server.
- **BR-VEH-08** — Files are validated and virus-scanned per enterprise standards before storage.

### 13.4 Permissions & Scope
- **BR-PRM-01** — Only SE and ASM may create issues; PQM and NAQC may not.
- **BR-PRM-02** — Before submission the creating SE (or ASM) may edit freely.
- **BR-PRM-03** — After submission fields are read-only except for ASM/PQM, who edit only with a mandatory justification (audited).
- **BR-PRM-04** — Issue Source data is immutable post-submit; only ASM/PQM may amend, with justification.
- **BR-PRM-05** — Lifecycle changes are role-gated: SE proposes; ASM/PQM approve; Administrator is read-only on lifecycle.
- **BR-PRM-06** — NAQC/read-only roles may view/export list, detail, workspace, and audit history but cannot create, edit, link, change status, or upload.
- **BR-PRM-07** — "My Issues" = own issues; a manager's "All Issues" = their reporting line via USER_HIERARCHY, not the whole system.
- **BR-PRM-08** — Master-data management, configuration, and user/role administration are restricted to Administrator; classification-value approval to ASM/PQM.
- **BR-PRM-09** — Read-only vs edit is driven by the role-permission payload; the server re-checks authorization on every mutating call.
- **BR-PRM-10** — Export returns only records the user is authorized to see, limited to the filtered/visible set.

### 13.5 Audit & Evidence Integrity
- **BR-AUD-01** — All issue creation, modification, status changes, linking, disposition, and admin actions are recorded.
- **BR-AUD-02** — Activity History and Audit History are maintained as separate records.
- **BR-AUD-03** — Every status change records previous status, new status, user, role, timestamp, and the mandatory reason/remark.
- **BR-AUD-04** — Audit captures field-level deltas (field, old, new) and change reason where applicable.
- **BR-AUD-05** — Audit history is read-only to all standard users and cannot be modified or deleted by any role.
- **BR-AUD-06** — Manual historical-activity entry is restricted to authorized roles and is itself audited.
- **BR-AUD-07** — Communication-log entries are immutable; no deletion by any role; only an administrator may soft-hide (still retained).
- **BR-AUD-08** — Every audited action is attributed to an authenticated user with role + timestamp; unauthenticated changes are not permitted.
- **BR-AUD-09** — Data integrity is preserved across failures; a partial transaction must not leave an issue inconsistent.
- **BR-AUD-10** — Registration, linking, QIR hand-off, and disposition each generate an audit entry.

### 13.6 Disposition
*Disposition is realized through lifecycle outcome states; the exact NASO / "No Issue" / Closed reconciliation is ratified in Appendix B.3 (confirm §23 OQ1).*
- **BR-DSP-01** — Business outcome is recorded by moving to an outcome state: **Monitoring, Disposed (Resolved / No Action), Closed, or Escalated**.
- **BR-DSP-02** — Legacy mapping (Appendix B.3): "No Issue" → Disposed (No Action); "Monitoring" → Monitoring; "Escalate to QIR" → Escalated; "Resolved" → Disposed (Resolved); "Closed" → Closed.
- **BR-DSP-03** — Assigning/updating any disposition requires a mandatory rationale recorded in history.
- **BR-DSP-04** — Every outcome (except Open → In Review) requires ASM/PQM approval before taking effect.
- **BR-DSP-05** — "No Action" covers not-an-issue / does-not-belong-to-PQMS (e.g. Safety/Regulatory/other dept); Closed is a soft-close after conclusion.
- **BR-DSP-06** — Resolved requires resolution via countermeasure/publication/corrective action, reflected read-only from the linked QIR when applicable.
- **BR-DSP-07** — Closed may be reopened (BR-IDL-14); Disposed outcomes are terminal.
- **BR-DSP-08** — A Monitoring outcome requires monitoring parameters (occurrence threshold, frequency, next-review date).

### 13.7 Parts
- **BR-PRT-01** — A parts request must link to an issue; may be raised by SE or PQM; multiple per issue allowed.
- **BR-PRT-02** — Part Number is selected via live INT-04 lookup; Description, Material Number, and Cost auto-populate read-only and are confirmed before submit.
- **BR-PRT-03** — The request stores a point-in-time snapshot; the external system remains system of record.
- **BR-PRT-04** — Urgency ∈ {Routine, Priority, Emergency}.
- **BR-PRT-05** — Priority/Emergency require ASM approval; Routine auto-approves within 24 hours (no manager action) but still traverses the status lifecycle.
- **BR-PRT-06** — Status lifecycle Submitted → Approved → Ordered → Received (workflow-governed).
- **BR-PRT-07** — Required fields: Quantity, Urgency, Investigation Purpose, Needed-By Date.
- **BR-PRT-08** — Parts-approval actions are role-validated (ASM) and audited.

### 13.8 Linking & Hierarchy
- **BR-LNK-01** — Issues may be linked from suggestions, manual search, or direct Issue Number, at entry and from the workspace.
- **BR-LNK-02** — A link progresses Suggested → Approved; a suggested link must be approved to become active.
- **BR-LNK-03** — Unlinking is a soft-delete (delete-flag); link records are never hard-deleted.
- **BR-LNK-04** — On first link the new issue becomes the child, the existing issue the parent, and an issue-group is created silently containing both *(data relationship only — §6.3)*.
- **BR-LNK-05** — Subsequent issues linked to the same parent under the same criteria join as additional children/members.
- **BR-LNK-06** — Hierarchy is single-level (parent-child); a root reference is maintained per tree, with provision for future N-level.
- **BR-LNK-07** — Linking requires a classification-key correlation check; a mismatch raises an alert requiring explicit user confirmation.
- **BR-LNK-08** — Same classification but a different Model forms a distinct family/group.
- **BR-LNK-09** — All link/unlink activities are recorded in issue history and audit.
- **BR-LNK-10** — QIR is created only on Escalated; one QIR maps to one issue while one issue may have multiple QIRs; RCA/countermeasure show read-only from the linked QIR.
- **BR-LNK-11** — An issue may not link to itself; duplicate active links to the same target are rejected. `[ASSUMPTION]`

### 13.9 Retention & Data Lifecycle
- **BR-RET-01** — Issue history, audit, communication, attachments, and relationship records are retained through the lifecycle per records-retention policy.
- **BR-RET-02** — Lifecycle-status history is append-only; on reopen the prior snapshot and rows move to history rather than being overwritten.
- **BR-RET-03** — Deletions are logical where traceability matters: linked issues (delete-flag), communication (admin soft-hide), classification values (deactivate).
- **BR-RET-04** — Audit and history records remain immutable and protected for their full retention period.
- **BR-RET-05** — Draft auto-save persists a recoverable in-progress issue, superseded by the registered record on submit. `[ASSUMPTION]`
- **BR-RET-06** — Parts-request snapshots are retained even if the external part master later changes.
- **BR-RET-07** — Issue-file archiving/purging follow approved retention policy (period TBD — §23 OQ5).

### 13.10 Scoring — *out of scope*
No scoring/severity business rules in this release (see §6.3, §12.12, §22 DR-03).

---

## 14. Validation Rules

*Enforcement: **Both** = client-validated and server-re-validated (server authoritative); **Server** = enforced server-side regardless of UI; **Client** = presentation/interaction guard.*

| VR-ID | Field / Area | Rule (reject/block if not met) | Enforced |
|---|---|---|---|
| VR-01 | Mandatory fields (registration) | Model Code, System classification, Title, Description present before Register; missing fields block submit and are highlighted. | Both |
| VR-02 | Entry order | System Classification enables only after Model Code; cascade levels enable only after their parent. | Client |
| VR-03 | Issue ID format | Must match `{SYS}-{YY}{NNNN}`; system-generated only. `[ASSUMPTION on exact regex]` | Server |
| VR-04 | Issue ID uniqueness | Generated ID unique across all issues; duplicate generation prevented. | Server |
| VR-05 | Model Code | Mandatory; must exist in MODEL master; free text not accepted. | Both |
| VR-06 | Model Year | Auto-defaulted from Model Code; refinement must stay within the model's valid range. | Both |
| VR-07 | Classification path | Each level a valid child of the level above; invalid combinations rejected. | Both |
| VR-08 | Classification value state | Only Active/Approved values selectable; a Pending value usable only within the proposing session. | Server |
| VR-09 | Add-new classification | Proposed value non-empty and unique within its level+parent scope; stored Pending; must not block submit. | Server |
| VR-10 | Classification approval | Approve/Reject restricted to ASM/PQM; Reject requires a non-empty remark. | Server |
| VR-11 | DTC codes | Optional; each from DTC master; multiple allowed, comma-delimited. | Both |
| VR-12 | DTC prefix | Prefix drives category/color (P/B/C/U; other = neutral) — display rule, not a submit blocker. | Client |
| VR-13 | Issue Title | Mandatory; non-empty after trim; within max length. `[ASSUMPTION on max length]` | Both |
| VR-14 | Description | Required; non-empty; within max length. `[ASSUMPTION on max length]` | Both |
| VR-15 | Attachment type | Only PDF/CSV/JPEG/PNG accepted; others rejected. | Both |
| VR-16 | Attachment size | Each file ≤ 25 MB; larger rejected. | Both |
| VR-17 | Attachment count | ≤ 10 attachments per issue; the 11th rejected. | Both |
| VR-18 | Attachment scan | Must pass virus/security scan before storage; failed/infected rejected. | Server |
| VR-19 | Status-change reason | Mandatory non-empty rationale to propose/perform any status change. | Both |
| VR-20 | Approver remark | ASM/PQM Approve/Reject requires a non-empty remark. | Server |
| VR-21 | Disposition rationale | Assigning/updating a disposition requires a mandatory non-empty rationale. | Both |
| VR-22 | Classification-change reason | Post-registration classification change requires a mandatory rationale. | Both |
| VR-23 | Bulk status-change reason | Bulk status change requires a reason, validated before processing, applied to every selected issue. | Both |
| VR-24 | Reason min-length | HLD mandates "mandatory/non-empty" but fixes no character minimum; a consistent minimum (e.g. ≥ 20 chars) is recommended. `[ASSUMPTION]` | Both |
| VR-25 | Transition validity | Target status must be a valid next state from the current; invalid transitions rejected. | Server |
| VR-26 | Self-approved transition | Open → In Review permitted for SE without approval; every other transition passes propose→approve. | Server |
| VR-27 | Monitoring parameters | When target = Monitoring, occurrence threshold, frequency, and next-review date required before commit. | Both |
| VR-28 | Filter/search fields | All filter/search criteria validated server-side; invalid values rejected, not silently ignored. | Server |
| VR-29 | Keyword search | Free-text search runs server-side, matching issue attributes including the full Issue ID. | Server |
| VR-30 | Pagination | List queries server-side paginated; unbounded fetch not permitted. | Server |
| VR-31 | Scope resolution | "My Issues" = own; manager "All Issues" resolved via USER_HIERARCHY before query. | Server |
| VR-32 | Concurrency | On save, a stale edit is detected and an announced refresh shown rather than a silent overwrite; list refreshes after status/bulk update. `[ASSUMPTION — HLD silent beyond refresh-after-update]` | Both |
| VR-33 | Part-number lookup | Part Number chosen from a live INT-04 result; free-typed rejected; description/material/cost auto-populate read-only. | Both |
| VR-34 | Parts-request fields | Quantity (positive integer), Urgency, Investigation Purpose, Needed-By (valid date) required. `[ASSUMPTION: future-date constraint]` | Both |
| VR-35 | Parts approval routing | Priority/Emergency require ASM approval; Routine auto-approve within 24 h. | Server |
| VR-36 | @mention validation | Each `@mention` must resolve to a valid user/team before posting; unresolved rejected. | Both |
| VR-37 | Comment post | Body non-empty; type Internal or External (Email is system-auto, not user-selectable). | Both |
| VR-38 | External-comment permission | External-type comments only by users with cross-org visibility (or ASM/PQM on their behalf). `[cross-org rule TBD]` | Server |
| VR-39 | Comment immutability | No delete for any role; only an administrator may soft-hide. | Server |
| VR-40 | Link correlation | Linking requires a classification-key check; mismatch → alert requiring explicit confirmation; different Model → new family. | Both |
| VR-41 | Self/duplicate link | No self-link; duplicate active link to the same target rejected. `[ASSUMPTION]` | Server |
| VR-42 | Post-submit edit justification | Any post-submit edit by ASM/PQM requires a non-empty justification; other roles blocked. | Server |
| VR-43 | Mutation authorization | Every create/edit/link/status/upload re-validated server-side against the caller's role; unauthorized calls rejected even if the UI exposed them. | Server |
| VR-44 | Export authorization | Export limited to authorized, currently-visible records. | Server |

> *Field-level validation tables are maintained with each screen's UX spec and the data model (§15); this section captures the business-binding rules.*

---

## 15. Data Requirements

This section specifies the **logical** data requirements for ISM and its directly supporting modules (Identity & Access, Notification, Audit, Reference/Master): entities, meaningful attributes, and relationships. Physical concerns — column types, lengths, keys, indexes, partitioning, DDL — are architecture-owned and out of scope here.

> **Grounding & vocabulary.** Grounded in the HLD data model (prior art) at logical level. Where source **role** or **lifecycle-status** names appear, the canonical mapping is §7.1 / §9.1 / Appendix B (SEM→ASM, PQDH→PQM, OPSADM→Administrator; legacy statuses → ratified set). Excluded (named only as deferred): severity/scoring entities & attributes, QIR-module entities, TSB, and the bulk file-ingestion entities (file-load log, per-channel CSV format definition) — issue intake in the current scope is manual. Inferences tagged **[ASSUMPTION]**.

### 15.1 Conceptual model (entities & relationships)
Six logical groupings: **(1) Core issue** — ISSUE + point-in-time history; **(2) Issue relationships** — parent/child/root linking, suggested links, ad-hoc grouping, affected-model mapping; **(3) Source-channel evidence** — one detail record per channel; **(4) Working data** — investigation activities, DTCs, parts requests, communication, documents, lifecycle-transition records; **(5) Reference/master** — classification taxonomy, valid-values, model, vehicle, dealer, source-channel; **(6) Cross-cutting** — identity & access (RBAC), notification, audit/activity logging.

Key relationships & cardinalities: an **ISSUE** is classified by exactly one classification key (System→Sub-system→Component→Symptom), optionally references one **VEHICLE** (VIN) and one reporting **DEALER**, and is owned by one **USER** (and/or an allocated **USER_GROUP**). ISSUE affects one-or-more models via **ISSUE_MODEL_MAP** (M:N to **MODEL**, with a denormalised snapshot on ISSUE). ISSUE has at most one **ISSUE_SOURCE_\*** per channel; and many investigation activities, comments, documents, parts requests, and lifecycle rows. **LINKED_ISSUE** relates child→parent→root (self-referential over ISSUE); **SUGGESTED_LINK_ISSUE** holds proposed links pending accept/reject; **ISSUE_GROUP**↔ISSUE via **ISSUE_GROUP_MEMBER** *(data relationship only — no group screen, §6.3)*. Comments/documents are polymorphic (event-type + event-id; for ISM the type is "Issue"). RBAC: USER↔ROLE via **USER_ROLE_MAP**; ROLE↔FEATURE via **ROLE_FEATURE_MAP** (+ allowed **FEATURE_ELEMENT**s); **USER_HIERARCHY** self-referential manager→subordinate. Routing: **ISSUE_ALLOCATION_RULE** / **ISSUE_ASSIGNMENT_RULE** reference **USER_GROUP** *(auto-allocation/assignment reserved for a later release — §6.3)*. Notification: **NOTIFICATION_TEMPLATE** → many distribution/trigger rules; each dispatch is a **NOTIFICATION_TXN**. Audit: **AUDIT_LOG** (field-level) + **ACTIVITY_LOG** (business events), polymorphic; **USER_ACCESS_LOG** + **USER_SESSION**.

### 15.2 Core entity — ISSUE
| Attribute | Meaning | Notes |
|---|---|---|
| `issue_id` | Business identifier | Canonical key across child/related entities (e.g., `EE-260001`); distinct from the internal surrogate id |
| `title` / `description` | Title + full narrative | Title mandatory |
| `issue_source` | Originating source channel | One of Warranty/Weibull/Comeback/Techline/FPQR/EWS/GQIS; determines which `ISSUE_SOURCE_*` applies |
| `status` | Current lifecycle status | **Canonical set per §9.1** (Draft→Open→In Review→Pending Approval→Disposed/Monitoring→Closed/Escalated); legacy HLD states map via Appendix B.2 |
| `disposition_outcome` | Business outcome at Disposed | Resolved / No Action (Appendix B.3) |
| `model_info` | Affected model(s)/year(s) snapshot | Denormalised; authoritative M:N in ISSUE_MODEL_MAP (must reconcile — 15.4) |
| `dtc_codes` | Associated DTCs | Resolve to DTC_CODE |
| classification refs | `system_id`/`subsystem_id`/`component_id`/`symptom_id` | Position in the taxonomy (→ CLASSIFICATION_KEY) |
| `root_cause_analysis` / `issue_simulation` | Investigation narratives | Free text |
| `is_ews` / `is_top_issue` / `is_dismissed` | Flags | EWS-origin; org-wide Top-Issue designation; dismissed |
| `assigned_user_id` / `allocated_user_group` | Owner / work group | → USER / USER_GROUP |
| `vin` / `dealer_code` | Affected vehicle / reporting dealer | → VEHICLE / DEALER; nullable |
| `justification` | Post-submit edit justification | Editable only by override roles (ASM/PQM) |
| `workflow_instance_id` | Workflow-engine correlation | Links to the BPM process instance |
| `reported_date` / `closed_at` | Reported / closure timestamps | |
| *audit fields* | `created_by`/`created_at`/`updated_by`/`updated_at` | Present on nearly all entities |

On **reopen**, the current ISSUE row is copied to ISSUE_HISTORY (at Open) before the live record continues.

### 15.3 Supporting entities
**A. Lifecycle & history** — **ISSUE_HISTORY** (immutable full snapshots, on reopen; key `issue_id`+timestamp); **ISSUE_STATUS_LIFECYCLE** (each proposed/approved transition: `current_status`/`prev_status`, mandatory `rationale`, `status_of_change` Pending/Approved/Rejected, proposer + approver + `approver_remark`, plus `monitoring_freq`/`next_review_date` when target = Monitoring); **ISSUE_STATUS_LIFECYCLE_HISTORY** (append-only archive moved on reopen).
**B. Relationships** — **LINKED_ISSUE** (`issue_id_child`/`_parent`/`_root`, `link_type` default "tie", `linking_source`, suggestion rationale, `is_delete` soft-delete); **SUGGESTED_LINK_ISSUE** (same child/parent/root shape, `status` default "pending", approver/decision); **ISSUE_GROUP** + **ISSUE_GROUP_MEMBER** (curated grouping, data-only per §6.3); **ISSUE_MODEL_MAP** (unique on issue+model_code+model_year).
**C. Source-channel evidence (`ISSUE_SOURCE_*`)** — one per channel (Warranty/Weibull/Comeback/Techline/FPQR/GQIS/EWS); channel-specific attributes catalogued in **Appendix C**.
**D. Investigation & diagnostics** — **INVESTIGATION_ACTIVITY** (`activity_type`, `evaluation_type`, detail/findings, `issue_id`, optional `dtc_code`, status; attachments via DOCUMENT); **DTC_CODE** (unique code, description, classification refs).
**E. Parts** — **PART_REQUEST** (`part_number`, description, quantity, urgency, investigation_purpose, status, needed_by, requested_by/approved_by/approval_date); **PART_MASTER** (locally-synced part lookup cache).
**F. Communication & documents** — **COMMENT** (polymorphic event-type+id; `comment_text`, `comment_type` Internal/External, reason code, author/role); **DOCUMENT** (polymorphic parent + sub-type; name, purpose, version, status, file_type, file_size, url).
**G. Routing & groups** — **ISSUE_ALLOCATION_RULE** (classification/model → USER_GROUP), **ISSUE_ASSIGNMENT_RULE** (skills + workload threshold → assignee), **USER_GROUP** + **USER_GROUP_MEMBER** *(automation reserved for a later release)*.
**H. Reference/master & valid-values** — **CLASSIFICATION_KEY** (4-level id-set + code-set composite keys), **CLASSIFICATION_REQUEST** (add-new approval workflow), **ID_TYPE_CODE_VALUE** (central valid-value/enumeration lookup + display order), **MODEL**, **VEHICLE** (+ VEHICLE_RECALL_HISTORY; `[ASSUMPTION]` SERVICE_ORDER is TBD in the HLD), **SOURCE_CHANNEL**, **DEALER**.
**I. Notification** — **NOTIFICATION_TEMPLATE**, **NOTIFICATION_DISTRIBUTION_RULE**, **NOTIFICATION_TRIGGER_RULE**, **NOTIFICATION_TXN** (mode Realtime/Near-realtime, delivery Email/in-app, sender/receiver, timestamps, status).
**J. Audit & activity** — **ACTIVITY_LOG** (+ ACTIVITY_LOG_RULE), **AUDIT_LOG** (+ AUDIT_LOG_RULE: field, old→new, delta, reason, actor context), **USER_ACCESS_LOG**, **USER_SESSION** (session lifecycle, auth method, logout reason).
**K. Identity & access (RBAC)** — **USER** (`user_id`, name, email, team, status, `is_delete`, `is_external`; `[ASSUMPTION]` `skill_code` supports skill-based assignment), **ROLE** (`role_id`, `role_name`, `is_external`), **FEATURE**/**FEATURE_ELEMENT**, **USER_ROLE_MAP** (+ `role_expiry_date`), **ROLE_FEATURE_MAP** (+ allowed `element_ids`), **USER_HIERARCHY**. *ISM's operating roles are SE/ASM/PQM/Administrator (+NAQC read-only) per §7; the platform ROLE master is broader.*

### 15.4 Data quality & integrity rules
1. Every entity has an internal surrogate id + a stable business key; business keys unique.
2. Composite uniqueness: ISSUE_MODEL_MAP (issue+model+year); CLASSIFICATION_KEY (id-set and code-set); history entities (issue+timestamp).
3. Referential integrity across all `issue_id`, classification, user, group, model/vehicle/dealer references; no orphan child rows.
4. Controlled enumerations (status, source, comment-type, session/notification status) constrained to canonical sets; general dropdowns governed by ID_TYPE_CODE_VALUE; enum casing must match the governed master.
5. Lifecycle transitions restricted to valid next-states; each creates a new ISSUE_STATUS_LIFECYCLE row with mandatory rationale; approver-gated transitions require Approved + approver identity/timestamp before ISSUE.status advances.
6. **Terminal "not-an-issue" state:** the HLD spells it three ways (NASO / NOSA / "Out of Scope"); ISM ratifies it as **Disposed → No Action** (Appendix B.3). `[ASSUMPTION]` these denote one outcome.
7. One source-detail per channel, matching ISSUE.`issue_source`.
8. Snapshot consistency: `model_info` reconciles with ISSUE_MODEL_MAP; `dtc_codes` reference DTC_CODE.
9. History and audit/activity logs are append-only (never updated in place).
10. Polymorphic integrity: COMMENT/DOCUMENT/logs keyed by governed event-type + resolvable id (ISM = "Issue").
11. Soft delete is logical (`is_delete`); logically-deleted rows excluded from active queries and new references.
12. RBAC consistency: `is_external` on USER_ROLE_MAP matches USER; grants reference active FEATURE/ELEMENT; expired mappings inactive.
13. Audit coverage governed by AUDIT_LOG_RULE; audited changes capture actor, timestamp, before/after, and parent correlation.
14. Externally-sourced ids (GQIS/EWS/FPQR/Techline refs) stored as evidence, never reused as internal keys.

### 15.5 Data migration (legacy KPQMS → N-PQMS) — capability level
Capability-level; entity selection, volumes, and mapping finalised in migration analysis. **Reference/master data** (SOURCE_CHANNEL, MODEL, VEHICLE(+recall), DEALER, CLASSIFICATION_KEY, ID_TYPE_CODE_VALUE, and the identity/RBAC masters) are mandatory candidates — identify legacy structures and transform into the new normalised model. **Transaction data** (ISSUE + source evidence + model map + activities + parts + comments + documents + lifecycle/history) is assessed (volume, source, redundancy, enrichment) before transform; each legacy issue decomposes into the new normalised set. **Approach:** scripts perform both system-move and structure-transform; automation vs manual and the need for a staging DB are decided after data analysis. **Cutover:** a checklist governs go-live; in-flight open issues handled via migrate-then-delta or single-outage full load; post-cutover parallel-run vs legacy-stop decided collectively. **Open items:** whether all history migrates vs master + fresh transactions only, and how low-quality legacy data is kept out. `[ASSUMPTION]` recommended for completeness: a legacy↔new id cross-reference, cleansing/de-dup, count/total reconciliation, historical status/audit back-fill, and document migration with URL re-pointing.

---

## 16. API, Integration & Scheduled Work

*Capability-level; concrete contracts, transports, and resilience values live in `addendum.md` and the architecture artifact.*

### 16.1 API principles
All endpoints are RBAC-enforced and audited; mutating operations are idempotent; validation is server-authoritative; reads are access-logged for privileged roles.

### 16.2 Endpoint surface (indicative)
Endpoint groups, representative paths, and verbs derived from HLD §6.2 — **indicative**, not contracts (full schemas, field validation, and per-endpoint resilience tuning are architecture-level). Paths follow the HLD as written; base-path normalization is an architecture concern. *Role names below quote the source APIs; the canonical mapping is §7.1 / Appendix B.1 (SEM→ASM, PQDH→PQM, OPSADM→Administrator).*

**Cross-cutting principles (every group):** every mutating endpoint (POST/PUT/DELETE) requires + honours an **idempotency-key**; every endpoint is **RBAC-gated** (fine-grained via role→feature→feature-element; approvals ASM/PQM-only, comment soft-hide Administrator-only, master-data activate/deactivate ASM/PQM-only); state-changing actions write to **ACTIVITY_LOG / AUDIT_LOG**. (Concrete resilience values — timeouts/retries/circuit-breakers — in `addendum.md`.)

- **A. Issue — create/read/search:** `POST /ism/issue` (composite upsert core + source channel + link info); `POST /ism/issue/{warranty|weibull|comeback|techline|fpqr|gqis|ews}` (per-channel upsert); `POST /ism/issues` (search/filter/paginate); `GET /ism/issue/composite` (core + all source fields); `GET /ism/issue/{channel}`; bulk change-status (with mandatory remark); `PUT /ism/issue/{id}/assignee` (reassign — *deferred workflow, §6.3*); plus reads `GET /ism/issuecounter`, `/ism/pqicountsummary`, `/api/users/{userId}/attention-items`, `/ism/allactions` (BFF).
- **B. Correlation — suggested & approved links:** `POST /ism/issuesuggested`; `GET /ism/issue/linkedissues/{suggested|approved}`; `POST /ism/issue/linkedissue/{suggest|approve}`; `GET /ism/issues/linkedissue/{id}`.
- **C. Investigation activities:** `POST/GET/PUT/DELETE /ism/investigationactivities/{issue-id}[/{activity-id}]`.
- **D. Parts:** `GET /master/parts/search` (INT-04); `POST /ism/part/{issue-id}` (submit); `PUT /ism/part/{part-request-id}` (ASM approve/reject — Priority/Emergency; Routine auto-approved by job, §16.5).
- **E. Communication:** `GET /ism/comment/{issue-id}`; `POST /ism/comment` (Internal/External; Email system-generated); `PUT /ism/comment/{id}` (Administrator soft-hide only).
- **F. Lifecycle/status & reopen:** `GET /ism/issuestatus/{issue-id}`; `POST /ism/issuestatus` (propose); `PUT/POST /ism/issuestatus` (approve/reject + mandatory remark); `POST /ism/issue/createhistory` & `POST /ism/issuestatus/createhistory` (on reopen); status list via `GET /master/idtypevalues/{ISSUE_STATUS_CODE}`. *(All transitions workflow-governed; only Open→In Review is auto-approved; every transition writes a new lifecycle row.)*
- **G. Documents:** `GET /document/documents`; `POST /pqms/dm/documents/issue/{issue-id}` (store + record); `PUT /pqms/dm/documents/{id}` (metadata); `DELETE` (soft-delete).
- **H. Master data & lookups:** classification `POST/PUT/DELETE /master/classificationkey`; model `POST /master/model`, `GET/PUT/DELETE /master/model/{code}`, `.../activate|deactivate`; valid-values CRUD + activate/deactivate; read-only lookups `GET /master/vehicle/vin`, `/master/dtc-codes`, `/master/models[/{model}/modelyear|/{model}/{year}/variant]`, `/master/classificationkey/systems[/{system}/subsystems|components|symptoms]`, `/master/dealer/{code}`, `/master/idtypevalues/{id_type_code}`; plus `GET /ism/issuesource`, `/ism/assignee`, `/ism/issuecounter`.
- **I. User & Access Management** (base `/api/v1/um`): users CRUD + activate/deactivate + `GET /users?search=&page=&size=`; user-role add/remove + bulk CSV + list; roles CRUD; features/feature-elements CRUD + list; grants `POST /rolefeature`, `/rolefeatureelement`; access log capture + search.
- **J. Authentication:** `POST /auth/token` (validate IdP token → issue session), `POST /auth/tnc-accept`, `POST /auth/signout`.
- **K. Notification:** `POST /nm/notification/email` (dispatch); `GET /nm/notification/{countsummary/{unread}|count/unread|pendingcount}`; `POST /nm/notification/count/unread` (mark-read); `GET /nm/notifications/{user_id}` (history).
- **L. Audit & activity log:** `GET/POST /pqms/admin/activitylog/issue/{issue-id}`; `GET/POST /pqms/admin/auditlog/{issue-id}`.

**Deferred / out of scope for this surface:** severity-scoring endpoints (get/override/rescore), QIR endpoints, Issue-Group endpoints, and the bulk issue-ingestion pipeline (file-log + file-driven channel loading, CDO/Redshift batch, SFTP feeds) — the surface above covers manual/interactive flows only.

### 16.3 External integrations
| Ref | System (reference) | Purpose |
|---|---|---|
| INT-01 | Vehicle/model master (e.g., AS400/HISNA) | Model/vehicle master sync; ISM manual override fallback |
| INT-02 | GQIS | Authenticated inbound issue submission (bulk pipeline out of scope) |
| INT-03 | Classification source | Classification keys, governed in ISM |
| INT-04 | Parts system (e.g., SAP) | Live part lookup (number/description/cost) at request time |
| — | Enterprise IdP | Corporate SSO + federated external identity |
| — | Object storage | Document/attachment storage |
| — | Workflow/BPM engine | Status-approval routing |
| — | QIR service | Read-only QIR reference for the hand-off |

### 16.4 Notification event catalogue
Two channels — **in-app** (bell badge + Notification History) and **email**; every notification is **deep-linked** to its target. SMS is out of scope (framework accommodates it later). Realtime user-action events dispatch immediately; reminder/expiry events come from the nightly alert job (§16.5). The default for a realtime event is **both** channels; the authoritative per-type matrix is finalized in template/distribution config (§23 OQ6).

| # | Event | Trigger | Recipient(s) | Channel |
|---|-------|---------|--------------|---------|
| 1 | Issue assigned | Issue created & assigned (entry) | Assigned SE | In-app + Email |
| 2 | Issue reassigned | Assignee changed *(reassignment deferred, §6.3)* | Previous + new assignee | In-app + Email |
| 3 | Issue linked with existing | Suggested-link request off the correlation queue | Owners of **both** issues | In-app + Email |
| 4 | Linked-issue decision | Counterpart owner approves/rejects a link | Suggesting engineer | In-app + Email |
| 5 | Status change proposed | SE proposes a transition (all except Open→In Review) | Approver (ASM/PQM) | In-app + Email |
| 6 | Status change decided | ASM/PQM approves/rejects with remark | Proposing SE | In-app + Email |
| 7 | Issue reopened | Closed→Open approved | Owner / stakeholders | In-app + Email |
| 8 | Parts request needs approval | Priority/Emergency parts request submitted | ASM | In-app + Email |
| 9 | Parts request decided | ASM approves/rejects, or 24 h auto-approve (Routine) | Requesting engineer | In-app + Email |
| 10 | Comment @mention | A comment @mentions a user | Mentioned user | In-app + Email |
| 11 | Classification value approval reminder | Proposed value unapproved after 24 h | Approver (ASM/PQM) | In-app + Email |
| 12 | Role-expiry advance alert (T-14 days) | Internal/external role 14 days from expiry | Administrator | Email + In-app |
| 13 | Role auto-deactivated | Internal role on expiry; external 24 h after | Administrator | Email + In-app |

**In-app attention signals (complementary, in-app only)** — `GET /api/users/{userId}/attention-items` computes three ownership-scoped banners: **Action Required** (pending actions/approvals you own), **Correlation Alert** (pending suggested links), and **SLA Overdue**. *The SLA-overdue basis needs definition — the legacy signal leaned on the linked QIR's SLA schedule, and QIR is out of scope (see §23 OQ4).*

**Excluded** (see §16.2 deferred list): Issue-Group, severity-score, and QIR/TSB notifications (the last reuse the framework but are owned by their modules).

### 16.5 Scheduled & background work
Background work runs on workflow timers, nightly batch jobs, and queue listeners (concrete substrates — e.g., BPM engine, message queue, CRON — are HLD prior-art; final choices are architecture-owned, §19.2). **Correlation *detection* at entry is synchronous** (advisory panel queries `GET /ism/issuecounter`, ≤ 1 s up to 10,000 issues); the background piece is the post-link queue listener (row 1).

| # | Job | Schedule | Trigger / criteria | Action |
|---|-----|----------|--------------------|--------|
| 1 | Issue-correlation queue listener | Near-realtime (on message) | User links correlated issues → suggested-link request enqueued | Persist SUGGESTED_LINK_ISSUE; notify **both** owners to review/approve (event #3) |
| 2 | Routine parts auto-approval | Within 24 h of submission | Parts request `Urgency = Routine` | Auto-set status Approved (no manager action); still passes the status lifecycle |
| 3 | Classification value activation | Approved values live within 24 h | Newly-approved classification value | Propagate so it is selectable system-wide within 24 h |
| 4 | Classification approval reminder | 24 h after proposal, if pending | Proposed value not yet approved | Send reminder to the approver (event #11) |
| 5 | Role deactivation — internal | Daily (nightly) | Roles reaching expiry date | Set role inactive |
| 6 | Role deactivation — external | Daily (nightly) | External roles at expiry + 24 h | Set role inactive; notify Administrator |
| 7 | Role-expiry advance alert | Daily (nightly) | Roles expiring in 14 days | Notify Administrator (event #12) |
| 8 | Notification alert job | Nightly | Pending NOTIFICATION_TXN rows per type | Build payloads and dispatch via the notification pipeline (in-app + email); one processor per type |

Configurable parameters (role-expiry days, notify-prior period/type) live in the role/user master and notification-trigger rules, so schedules above are defaults, not constants. Batch jobs are monitored (§17.8).

---

## 17. Non-Functional Requirements

### 17.1 Load profile
Performance targets assume the operational load basis (concurrent users and active-issue volume). Some volumetric inputs are not fixed in the sources; scalability is validated to **50,000 active issues**. `[ASSUMPTION → §23]` full load profile to be confirmed with the program.

### 17.2 Performance
Real-time correlation ≤ **1 s** for up to 10,000 active issues; source-channel panel ≤ **200 ms**; DTC chip rendering ≤ **200 ms**/keystroke (up to 20 codes); Issue List ≤ **2.0 s** (DEV, 10 users) and ≤ **1.5 s** (Staging, 50 users — higher-tier hardware); all Tier-1 screens ≤ **2.0 s**. Production target ≤ **2.0 s** at expected concurrency (§23 OQ10).

### 17.3 Scalability
Correlation and list/search scale to **50,000 active issues** without breaching §17.2 thresholds.

### 17.4 Availability & reliability
≥ **99.5%** during defined business operating hours; data integrity preserved across failures/interruptions; mutating operations idempotent. **RTO/RPO undefined in sources — to be set (§23 OQ5).**

### 17.5 Security
RBAC on all functions and data; authentication via the enterprise IdP; no password storage/processing; immutable, read-only-to-standard-users audit; administrator force-session-expiry effective within one refresh cycle.

### 17.6 Usability & accessibility
**WCAG 2.1 AA** (§23 OQ9); full keyboard operation incl. classification comboboxes; screen-reader support (ARIA); clear success/warning/validation/error messages that name the field + fix; honors `prefers-reduced-motion`.

### 17.7 Maintainability & quality
Business rules, statuses, classifications, and dropdowns configurable via master data without code changes; CI/CD quality gates apply (reference baseline: high unit-test pass + code-quality thresholds — architecture-owned).

### 17.8 Observability
Standard enterprise observability across services; batch/scheduled jobs (§16.5) are monitored with failure alerting.

### 17.9 Compliance & data protection
Audit/history/communication/documents retained per approved records-retention policy (period TBD — §23 OQ5); immutable audit + decision provenance support quality-compliance and legal-hold; PII limited to IdP-sourced user identity.

---

## 18. Security, Privacy & Compliance

### 18.1 Authentication
Internal users via corporate SSO; external via federated external identity by invitation with a pre-assigned, scoped role; MFA enforced by the IdP; ISM consumes a validated token and issues its own session; no passwords stored.

### 18.2 Authorization
Permission resolution: token claims → role → feature permission → element-level grant; data-scope by role and user-hierarchy span of control; every privileged UI-resource interaction captured to the access log.

### 18.3 Threat model (module-specific)
| Threat | Mitigation |
|---|---|
| Unauthorized access to issue data | RBAC + data-scope + access log |
| Audit/communication tampering | Append-only, immutable records; admin soft-hide only |
| Unauthorized status/disposition change | Propose→approve gate; reason-gated; role-restricted |
| Malicious document upload | Type/size validation + virus scan before storage |
| Session hijack / stale privilege | Short refresh cycle; admin force-expiry; role-expiry jobs |

### 18.4 Personal data
Minimal PII — user identity/email sourced from the IdP; ISM stores no credentials; issue records concern vehicles/quality, not consumer PII.

### 18.5 Disaster recovery
Resilient (multi-AZ) deployment is architecture-owned; concrete **RTO/RPO to be set (§23 OQ5)**.

---

## 19. Solution Architecture Context

### 19.1 Architectural requirements (business-binding)
Immutable audit & decision provenance; ≥ 99.5% business-hours availability; RBAC + data-scope; idempotent mutating operations; configuration via master data without code changes; the integration dependencies in §16.3.

### 19.2 Technology baseline
The rebuild targets a **new technology stack, to be decided in the architecture artifact.** The HLD's documented stack (AWS/EKS, Camunda BPM, Azure AD/B2C, S3, SAP, AS400, messaging queue, Redshift) is **prior art / reference only** — captured in `addendum.md`, not a commitment.

### 19.3 What is deliberately not decided here
Concrete stack and framework choices; database schema, keys, and indexes; API contracts and transports; resilience values (timeouts/retries/circuit-breakers); DR numbers. These are architecture deliverables.

---

## 20. Assumptions & Dependencies

| ID | Type | Assumption / Dependency |
|---|---|---|
| AD-01 | Dependency | Vehicle information services support Model-Code-based identification; **manual vehicle entry is the fallback** when unavailable. |
| AD-02 | Dependency | Vehicle master (Model Codes/Years) maintained by an authorized source system. |
| AD-03 | Dependency | Classification master data available and governed through approved admin processes. |
| AD-04 | Dependency | Workflow/approval/escalation/notification via an approved enterprise workflow platform. |
| AD-05 | Dependency | User authentication and role information via the enterprise IdP. |
| AD-06 | Dependency | Related QIR/publication references available via approved interfaces (read-only for ISM). |
| AD-07 | Dependency | Documents stored/managed via approved enterprise storage. |
| AD-08 | Dependency | SLA/due-date/escalation indicators depend on milestone/status data; ISM-native SLA basis to be defined (§23 OQ4). |
| AD-09 | Assumption | Operators have the required training and permissions. |
| AD-10 | Assumption | Classification data is complete/accurate enough to power correlation. |
| AD-11 | Assumption | Linking/grouping restricted to authorized users. |
| AD-12 | Assumption | NAQC requires read-only ISM visibility for Top-Issue support (§7.3). |
| AD-13 | Assumption | Records retained per organizational retention policy (period TBD — §23 OQ5). |

---

## 21. Risks & Mitigations

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| RISK-001 | Incomplete/inaccurate classification data | High | Governance + validation + living-taxonomy approval queue |
| RISK-002 | Slow user adoption | Medium | Training, intuitive workflows, stakeholder engagement |
| RISK-003 | External integration delays | Medium | Staged integration; fallbacks (manual vehicle entry) |
| RISK-004 | Poor entry data quality | High | Mandatory fields, validations, business rules |
| RISK-005 | Unauthorized access to issue data | High | RBAC + immutable audit + access log |
| RISK-006 | Audit-trail failure | High | Automatic, append-only, immutable capture |
| RISK-007 | Critical issues unresolved | High | Action-item surfacing + reminders (SLA basis per §23 OQ4) |
| RISK-008 | Evidence/attachment loss | Medium | Managed storage + retention (period per §23 OQ5) |
| RISK-009 | Incomplete/churning requirements → rework | Medium | Open-questions ledger (§23) + decision register (§22) + change control (§6.4) |
| RISK-010 | Performance under volume | Medium | Performance NFRs + scalability validation to 50,000 issues |

---

## 22. Decision Register

| ID | Decision | Rationale |
|---|---|---|
| DR-01 | Design prototype is canonical over BRD/HLD on conflict | User directive; the design is the most current, concrete realization |
| DR-02 | Module named "Issue & Signal Management (ISM)" | Reflects multi-source signal capture |
| DR-03 | Issue scoring & score-driven severity out of scope | User directive; deterministic correlation is sufficient this release |
| DR-04 | QIR module out; ISM keeps issue→QIR hand-off + read-only ref | Scope focus; QIR is a sibling module |
| DR-05 | TSB out of scope | Sibling module |
| DR-06 | Roles = SE/ASM/PQM/Administrator; ASM≡SEM, PQM≡PQDH, Admin≡OPSADM | Reconcile design vs BRD/HLD vocabularies (Appendix B.1) |
| DR-07 | PQM is an override/approver (not read-only) | Design + BRD stakeholder intent supersede the BRD role-table "read-only" line |
| DR-08 | NAQC retained as read-only ISM viewer | BRD authorization matrix grants NAQC RO access |
| DR-09 | Canonical lifecycle set (§9.1); legacy states mapped | Reconcile design vs BRD/HLD state models (Appendix B.2) |
| DR-10 | Default list sort = Date Reported desc | Score-driven default sort removed with scoring |
| DR-11 | Document cap 25 MB × 10 + virus scan | Resolve HLD contradiction; BRD NFR-ISM-016 mandates scan |
| DR-12 | Model Code primary identifier + manual fallback | BRD 1.4 adopted Model Code; retain AD-ISM-001 fallback |
| DR-13 | Fresh technology stack; HLD stack = reference only | Greenfield on new stack; stack decided in architecture |
| DR-14 | Reporting delivered via saved views + export (not analytics dashboards) | Close BR-ISM-013/BO-05 without over-scoping |
| DR-15 | "phase" wording avoided; deferred work labelled out-of-scope | User directive |

---

## 23. Open Questions

1. **Lifecycle reconciliation** — confirm the canonical set and its mapping to BRD/HLD states. Affects §9, Appendix B.2.
2. **Role mapping** — confirm ASM=SEM, PQM=PQDH, Administrator=OPSADM; SE `read`=own-scope/propose; PUBCOO/external out; NAQC read-only. Affects §7.
3. **Attention Required criteria** — define the non-score "high-impact" rules (action-required, SLA/overdue, correlation-alert). Affects FR-1.
4. **SLA / due-date basis** — legacy leaned on QIR SLA (out of scope); define ISM-native basis. Affects FR-1, SM-2.
5. **Retention periods & RTO/RPO** — undefined in all sources; owner to set. Affects §17.9, §18.5, §13.8.
6. **Notification catalogue** — finalize the exhaustive event→notification list. Affects §16.4, FR-32.
7. **Inbound-signal API scope** — which external systems submit directly this release vs deferred pipelines. Affects FR-42.
8. **Design tokens vs prototype literals** — canonical source for app-bg/text/card-radius. *Rec:* design-system tokens; reconsider card radius only. Affects DESIGN.md.
9. **Accessibility target** — confirm level. *Rec:* WCAG 2.1 AA. Affects §17.6.
10. **Performance production target** — single production number vs per-environment gates. *Rec:* ≤ 2.0 s Tier-1 at expected concurrency. Affects §17.2.
11. **Reporting depth** — confirm the report set and whether saved-views + export suffices or a light analytics view is wanted. Affects FR-43.

---

## 24. Delivery Plan & Acceptance Gates

### 24.1 Epic breakdown & descope order
Indicative epics (feed the epics/stories artifact): **E1** Foundations (auth/session, RBAC, master data, audit) → **E2** Issue List & Overview → **E3** Issue Creation + Classification + Correlation → **E4** Issue Workspace (Detail/Investigation/Parts/Resolution) → **E5** Lifecycle & Disposition (propose→approve, reopen) → **E6** Communication + Documents + Notifications → **E7** Reporting/export + inbound-signal API. Descope order if pressured: E7 → parts sub-features → hierarchy niceties, protecting E1–E5.

### 24.2 Acceptance gates
- All P1 FRs demonstrated end-to-end in UAT; 100% status changes reason-gated & audited (SM-3); taxonomy value live ≤ 24 h (SM-4); correlation surfaces at entry (SM-1); performance NFRs met at the agreed production target; accessibility AA validated; RBAC + audit verified; open questions with go-live impact resolved.

### 24.3 Milestone alignment
Target go-live **2026-12-18**; open questions in §23 (esp. OQ4 SLA, OQ5 retention/RTO/RPO) must be resolved before the corresponding acceptance gate.

---

## 25. Traceability

### 25.1 Business objective → business requirement → functional requirement
| BO | BR | FRs |
|---|---|---|
| BO-01 | BR-ISM-001/009 | FR-7…FR-10, FR-17…FR-22 |
| BO-02/07 | BR-ISM-006 | FR-25, FR-26, FR-30, FR-38 |
| BO-03 | BR-ISM-005 | FR-13…FR-16 |
| BO-04 | BR-ISM-004 | FR-28, FR-29 |
| BO-05 | BR-ISM-013 | FR-6, FR-43 |
| BO-06 | BR-ISM-008 | FR-11, FR-12, FR-34 |
| BO-08 | BR-ISM-002 | FR-1, FR-3 |

### 25.2 BRD v1.5 requirement → this PRD
| BRD area | Covered by |
|---|---|
| Overview (FR-ISMOVE-*) | §12.1 (FR-1/2) |
| Issue List (FR-ISM010-*) | §12.2 (FR-3…6) |
| Issue Entry (FR-ISM020-*) | §12.3, §12.4 (FR-7…16) |
| Workspace (FR-ISM040-*) | §12.5…12.10 (FR-17…30) |
| Admin (FR-ADM-*) | §12.13, §12.15 (FR-11/12/34/35) |
| NFR-ISM-* | §17 |
| Roles/authorization | §7 |
| Out-of-scope (deferred) items | §6.3 |

### 25.3 Requirement coverage obligations
Every P1 BR maps to ≥ 1 FR; every FR maps to ≥ 1 BR/BO; out-of-scope BRD items (scoring, severity KPIs, group screen, ingestion pipelines) are explicitly deferred, not silently dropped.

### 25.4 Document completeness self-check
All 26 template sections present; out-of-scope areas carry stubs; FR IDs sequential 1–43; every `[ASSUMPTION]` indexed to an open question or decision; no "phase" wording; capability-level maintained for architecture-leaning sections.

---

## 26. Approvals & Change Control

### 26.1 Approvals
| Role | Name | Status | Date |
|---|---|---|---|
| Business Owner | KIA NA | Pending | |
| Project Manager | HAEA | Pending | |
| PQM | PQ Management | Pending | |

### 26.2 Change log after ratification
*(Empty until ratified; each post-ratification change records: date, requester, change, affected FRs/sections, decision-register entry.)*

---

## Appendix A — Glossary
Terms used verbatim throughout (see §3–§12 for context): **N-PQMS, ISM, Issue, Signal/Source Channel, Classification, DTC, Correlation, Linked Issue, Suggested Link, Issue Hierarchy/Group, Lifecycle Status, Disposition, Owner/Assignee, My Issues, Roles (SE/ASM/PQM/Administrator/NAQC), Capability level (read/override/admin/read-only), Investigation Activity, Parts Request, Communication Log, Activity History, Audit History, Master Data, QIR hand-off.** Definitions per §3, §7, §9, and §12.

## Appendix B — Mapping tables

### B.1 Organisational role → system role *(normative)*
| Design/system role | BRD/HLD role | Capability |
|---|---|---|
| SE — Service Engineer | SE | read (own-scope, propose) |
| ASM — After-Sales Manager | SEM — Service Engineer Manager | override |
| PQM — Product Quality Manager | PQ Department Head (PQDH) | override |
| Administrator | OPSADM — Operation Admin | admin |
| NAQC | NAQC | read-only |
| *(out of ISM scope)* | PUBCOO/PUBTO, external plants (KaGA/KMX/HQ), HATCI | — |

### B.2 Legacy/prototype status → ratified status
| BRD/HLD status | Ratified status |
|---|---|
| Open | Open |
| Investigating | In Review |
| Monitoring | Monitoring |
| QIR Escalation / Top Issue | Escalated |
| Resolved / NASO (No Issue) | Disposed (Resolved / No Action) |
| Closed | Closed |
| (transition approval `status_of_change`) | Pending Approval (lifecycle state) |
| (pre-submit auto-save) | Draft |

### B.3 Disposition vocabulary reconciliation
| BRD disposition | Ratified |
|---|---|
| No Issue | No Action |
| Resolved (via countermeasure/publication) | Resolved |
| Monitoring | (lifecycle state Monitoring) |
| Escalate to QIR | (lifecycle state Escalated) |
| Closed | (lifecycle state Closed) |

## Appendix C — Source-channel evidence field sets
Channel-specific evidence attributes carried on an issue's **Issue Source** panel (Issue Detail, FR-41). Scope is the per-channel evidence only — not the shared core fields (Model Code, classification, DTC, title, description), scoring, QIR, or TSB. Grounded in the HLD `ISSUE_SOURCE_*` entities (§3) + channel-flow forms; the panel is read via `GET /ism/issue/{channel}` and written via `POST /ism/issue/{channel}`. Every record also carries `id` + `issue_id` (omitted below). Fields marked **[A]** are inferred (the HLD states no required/optional flag). Bulk ingestion is out of scope (§6.3); GQIS/EWS records are system-populated via integration.

- **Warranty** (`ISSUE_SOURCE_WARRANTY`): claim count, claims from/to date, threshold %, IPTV rate % **[A]**, baseline notes **[A]**, primary dealer code **[A]**, dealer regions **[A]**, part number **[A]**, avg repair cost **[A]**.
- **Weibull** (`ISSUE_SOURCE_WEIBULL`): beta (shape), eta (scale), failure-rate % **[A]**, sample size **[A]**, B10 life estimate **[A]**, confidence interval **[A]**, analysis id/notes **[A]**. *(Statistical evidence only; contribution to severity is out of scope.)*
- **Comeback** (`ISSUE_SOURCE_COMEBACK`): return-visit count, comeback window (days), primary dealer, complaint description, VIN range **[A]**, symptom **[A]**, dealer regions **[A]**, original repair-order number.
- **Techline** (`ISSUE_SOURCE_TECHLINE`): case (inquiry) reference, caller name, caller role, case priority, technical summary, inquiry date **[A]**, symptom description **[A]**, dealer count **[A]**, category code **[A]**.
- **FPQR** (`ISSUE_SOURCE_FPQR`): FPQR reference, field-report date, field defect count, reporting location/market, field-engineer name, promotion reason **[A]**, field-engineer id **[A]**, attachments **[A]**.
- **GQIS** (`ISSUE_SOURCE_GQIS`): GQIS record id (system-populated via INT-02), GQIS category code, market region, GQIS severity level *(source-supplied classifier retained as evidence — distinct from PQMS issue scoring, which is out of scope)*, sync date **[A]**.
- **EWS** (`ISSUE_SOURCE_EWS`): EWS alert id (system-populated on write-back), alert threshold type, alert trigger value, EWS category code, alert date.

## Appendix E — Error handling
An **indicative** error catalogue — representative conditions by family, with a message pattern and an approximate response class. It is illustrative; the authoritative registry (exact codes, i18n message keys, precise HTTP codes, per-endpoint mapping) is an **architecture deliverable**. Family names (`ISM-VAL-*` etc.) are an indicative convention **[A]**. Role names reconciled to canon (ASM/PQM/Administrator).

**E.1 Entry & field validation — `ISM-VAL-*`**
| Family | Condition | Message pattern | Class |
|---|---|---|---|
| `ISM-VAL-REQUIRED` | Mandatory field missing on register/save | "{Field} is required to register the issue." | 400/422 |
| `ISM-VAL-INVALID` | Value not a recognized master/reference value | "{Value} is not a valid {field}." | 400/422 |
| `ISM-VAL-CHANNEL` | Required source-channel evidence field missing | "{Field} is required for a {Channel} source issue." | 400/422 |
| `ISM-VAL-REASON` | Status change (single/bulk) without mandatory reason | "A reason is required to change the issue status." | 400/422 |
| `ISM-VAL-JUSTIFICATION` | Post-submission edit without justification | "A justification is required to change a submitted issue." | 422 |

**E.2 Permission denied — `ISM-AUTH-*`**
| Family | Condition | Message pattern | Class |
|---|---|---|---|
| `ISM-AUTH-UNAUTHENTICATED` | No valid session / expired token | "Your session has expired. Please sign in again." | 401 |
| `ISM-AUTH-FORBIDDEN` | Role lacks permission (e.g., PQM/NAQC attempting Create; NAQC read-only) | "You do not have permission to {action}." | 403 |
| `ISM-AUTH-POSTSUBMIT` | Post-submit update by a role other than ASM/PQM | "Only a manager (ASM/PQM) can change an issue after submission." | 403 |

**E.3 Not found — `ISM-NF-*`** — `ISM-NF-ISSUE` (issue id not found → "The requested issue could not be found.", 404 **[A]**); `ISM-NF-RECORD` (dependent record not found, 404 **[A]**).

**E.4 Concurrency — `ISM-CONC-*`**
| Family | Condition | Message pattern | Class |
|---|---|---|---|
| `ISM-CONC-DUPLICATE-SUBMIT` | Mutating request retried/replayed | (transparent — idempotency-key returns the original result) | 200 replay / 409 |
| `ISM-CONC-DUP-IDENTIFIER` | Duplicate issue identifier | "This issue could not be created due to a duplicate identifier. Please retry." | 409 |
| `ISM-CONC-STALE-UPDATE` | Second save based on a stale copy | "This issue was updated by another user. Please reload and try again." | 409 **[A]** |

**E.5 Upload rejection — `ISM-UPL-*`**
| Family | Condition | Message pattern | Class |
|---|---|---|---|
| `ISM-UPL-SIZE` | File > 25 MB | "{Filename} exceeds the 25 MB file-size limit." | 413 |
| `ISM-UPL-COUNT` | > 10 attachments | "A maximum of 10 attachments is allowed per issue." | 422/400 |
| `ISM-UPL-TYPE` | Unsupported type | "{Type} files are not supported. Allowed: PDF/CSV/JPEG/PNG." | 415 |
| `ISM-UPL-SCAN` | Fails malware scan | "{Filename} failed the security scan and was not uploaded." | 422 |

**E.6 Integration / timeout — `ISM-INT-*`**
| Family | Condition | Message pattern | Class |
|---|---|---|---|
| `ISM-INT-TIMEOUT` | Upstream exceeds the configured window | "{Service} is taking too long to respond. Please try again shortly." | 504 |
| `ISM-INT-UNAVAILABLE` | 5xx / connection failure after retries | "{Service} is temporarily unavailable. Please try again shortly." | 503/502 |
| `ISM-INT-CIRCUIT-OPEN` | Circuit breaker open | "{Service} is temporarily unavailable. Please try again in a few minutes." | 503 |
| `ISM-INT-DEGRADED` | Master-data lookup down; manual entry allowed | "{Service} is unavailable; you can enter {data} manually and continue." | 200 degraded / 503 |

*(Appendix D — Worked severity calculation — intentionally omitted: issue scoring is out of scope.)*

