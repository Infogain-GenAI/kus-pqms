---
title: "Product Brief: N-PQMS Issue & Signal Management (ISM) Module"
status: final
created: 2026-08-20
updated: 2026-08-20
---

# Product Brief: N-PQMS Issue & Signal Management (ISM) Module

## Executive Summary

N-PQMS is Kia's next-generation Product Quality Management System. This brief covers the **Issue & Signal Management (ISM) module** — the system of record where Service Engineers register, investigate, correlate, and resolve vehicle quality issues, and the highest-traffic surface in the platform (Tier 1 Critical; ~24% of total PQMS usage). It targets a **December 18, 2026 go-live**.

Today's legacy issue workflow is *source-agnostic* and *single-vehicle-level*: an engineer can record that a problem happened, but not capture it in a way that lets the organization see the same problem recurring across models, engineers, and time. Quality signals sit siloed in individual engineers' entries, duplicate investigations run in parallel, and the audit trail a regulated automotive quality process depends on is thin.

The ISM rebuild reframes issue management around **correlation and traceability**. A structured, adaptive entry form captures source-specific and diagnostic data; a multi-level classification taxonomy makes issues comparable; a correlation engine surfaces related and duplicate issues in real time during entry and after submission; and every status change is documented and chronologically logged. An Overview dashboard puts each engineer's priority actions, SLA risks, and correlation alerts front-and-center on login. The result: less duplicated effort, faster root-cause convergence across the fleet, and a fully auditable quality record. This is a **greenfield build on a new technology stack**, with the existing BRD, HLD, and UI prototypes treated as reference rather than constraint.

## The Problem

A Service Engineer investigating a suspected defect today works largely blind to the wider signal:

- **Issues can't be correlated.** The legacy entry form has no structured classification and captures issues one vehicle at a time, so the same failure reported by five engineers across three model years looks like five unrelated records. Duplicate investigations run in parallel; recurring problems are slow to surface.
- **Quality signals are siloed.** Data lives per-engineer and per-model with no mechanism to connect it, so organizational learning depends on who happens to talk to whom.
- **The record isn't audit-grade.** No system-coded issue IDs, no diagnostic trouble code (DTC) capture at entry, no enforced chronological activity trail, and no requirement to document *why* a status changed — gaps that matter in a regulated quality domain.
- **Priority is invisible on login.** Engineers get no at-a-glance view of what needs action, what is overdue, or what is newly correlated, so time-to-action on critical items is slow.

The cost: wasted investigation effort, delayed detection of fleet-wide quality problems, and a quality record that cannot fully support compliance, escalation, or decision-making.

## The Solution

An Issue & Signal Management module built around three ideas — **structured capture, active correlation, and enforced traceability**:

- **Adaptive, minimal entry (ISM0020).** A simplified form capturing only what is required to register — Model Code, classification, title, description — plus optional DTC capture, with the Model Year range auto-defaulted from Model Code.
- **A classification taxonomy that makes issues comparable.** System → Sub-system → Component → Symptom, with searchable type-ahead fields and admin-governed master data that grows with emerging quality signals *without a code deployment*.
- **A correlation engine.** Real-time detection of related/duplicate issues *during* entry (exact-key matching on classification), plus post-submission cross-engineer correlation suggestions surfaced in the list and workspace — with manual linking and grouping.
- **A working record (ISM0040).** A centralized Issue Workspace — Detail, Investigation, Resolution, Communication, History — with mandatory reason capture on every status/classification change, a chronological activity trail, document upload, and hand-off to QIR. Issues follow the canonical lifecycle **Draft → Open → In Review → Pending Approval → Disposed / Monitoring → Closed / Escalated**.
- **An action-first list and Overview (ISM0010 + dashboard).** Role-based default views ("My Issues"), configurable columns, powerful search/filter, bulk actions, and an Overview surfacing action items, attention-required records, lifecycle health, and recently accessed items on login.

## What Makes This Different

Versus the legacy system it replaces:

- **Correlation is proactive, not retrospective.** Related issues are surfaced *while the engineer is still typing*, not discovered weeks later in a report.
- **The taxonomy is living.** Admins — and engineers, via a proposed-value approval queue — extend classifications without engineering releases, so the system keeps pace with new quality signals.
- **Traceability is enforced by design.** Reason-gated status changes and an immutable audit history make the record compliant by construction, not by discipline.
- **Priority finds the engineer.** The Overview and attention banners invert the legacy "go hunting" model.

> [ASSUMPTION] Correlation is deliberately **deterministic** (exact-key matching), not ML-based, in this scope — a reliable foundation that AI-driven similarity can build on later. Positioning this as an intentional strength (explainable, no cold-start problem) rather than a limitation; confirm framing with the business owner.

## Who This Serves

The design models three interactive roles across two capability levels — `read` (own issues) and `override` (all issues) — plus an administration role:

- **Service Engineer (SE) — primary.** `read`, scoped to their own issues. Registers and investigates issues; lives in Create (ISM0020) and the Workspace (ISM0040). Success = register fast, see correlations immediately, never lose an emerging signal to a missing taxonomy value.
- **After-Sales Manager (ASM).** `override`, all-issues scope. Approves dispositions, manages team workload, and escalates. Success = oversight of regional quality concerns and throughput.
- **Product Quality Manager (PQM).** `override`, all-issues scope. Final authority on disposition and cross-team escalation. Success = an accurate, correlated picture to steer decisions.
- **Administrator.** Governs the classification taxonomy, source-channel configuration, and Issue Administration (reminders, source toggles, batch jobs); works the proposed-value approval queue. Success = taxonomy stays clean and current without developer involvement.

> [RECONCILED] Where the design and the BRD diverge, the current **design prototype is treated as canonical**: (1) the module is named **"Issue & Signal Management"** (from the BRD's "Issue Management") to reflect multi-source signal capture; (2) the manager tier the design calls **ASM (After-Sales Manager)** is the BRD's **SEM (Service Engineer Manager)**, and **PQM** maps to the BRD's **PQ Department Head / PQM**; external parties (KaGA, KMX, HQ) and NAQC sit under Publication/QIR scope, out of scope for ISM; (3) the canonical issue lifecycle (see The Solution) supersedes the BRD's separate 8-state set.

## Success Criteria

Drawn from the program's stated business objectives:

- **Reduced duplicate investigation** — measurable increase in identified related issues and reuse of prior investigation knowledge.
- **Faster time-to-action** — ≥ 40% reduction in average time-to-action on approval-pending and SLA-overdue items vs. legacy (UAT-measured).
- **Complete traceability** — 100% of status-change events carry a user-authored reason, visible in the chronology within the same session.
- **Living taxonomy** — admin-approved System/Sub-system/Symptom values available in comboboxes within 24 hours, with no deployment.
- **Efficiency & classification quality** — reduced registration/investigation/resolution effort; classification complete enough to power correlation and analytics.
- **Availability** — ≥ 99.5% during defined business operating hours.

## Scope

Scope is grounded in the current **ISM Service-Engineer design prototype** ("Kia N-PQMS V2-V3"), which the SE experience is built around.

**In scope:**

- **SE Dashboard** — system-health cards, action items (tabbed), attention-required, recently accessed, and lifecycle-health stage counts; role-aware (SE sees "mine", ASM/PQM see all).
- **Issue List** — status KPI strip (click-to-filter), filter panel (source · model · status · owner · date · EWS-only · search), sortable table with multi-value "+N" cells, bulk actions (assign / status / export), pagination.
- **Create Issue** — source-aware sectioned form (required fields adapt to the source channel), vehicle (Model Code → Year), System → Sub-system → Component → Symptom classification, DTC capture, and real-time correlation with suggested/manual links.
- **Issue Workspace** — overview, **disposition with approval**, **parts** (affected / requests), communication, **chronology** and **audit** logs; reason-gated status/disposition changes; open-by-ID launcher.
- **Multi-source signal capture** — channels: Warranty, Weibull, Comeback, Techline, FPQR, EWS, GQIS (as issue metadata and filters).
- **Issue Administration** — reminders, source toggles, batch jobs, classification master data, and the engineer-proposed-value approval queue.
- **Notifications** — unread bell count, dropdown, and full-page feed.
- **System-coded IDs**, role-based access control (read vs override), and a full audit trail on every mutation.

**Out of scope (deferred):**

- **Issue scoring & score-driven severity** — score computation, severity tiers, scoring-weight administration, and score overrides.
- **QIR (Quality Issue Report) module** — QIR List / Create / Workspace / Analytics. ISM records the issue → QIR hand-off only; the QIR module itself is handled when it is scoped.
- **TSB Management** — present only as a placeholder/empty state in the design.
- **EWS & GQIS ingestion pipelines** — the app consumes structured signal data; the pipelines themselves are separate integration BRDs.
- **AI/ML-based similarity matching** — correlation stays deterministic (exact-key matching).
- **Cross-module correlation** beyond the issue → QIR hand-off.
- **Automated / external correlation notifications.**
- **Restrictive status-transition state-machine enforcement.**
- **Dedicated Issue Group management screen.**

## Vision

If the ISM rebuild succeeds, ISM becomes the **correlation backbone of a unified N-PQMS**: quality signals flow from field, warranty, and diagnostic sources into a single classified stream, where deterministic correlation matures into AI-assisted similarity and cross-module intelligence spanning Issue → QIR → TSB. The 2–3 year picture is a quality organization that detects fleet-wide problems earlier, resolves them once instead of many times, and can prove — down to the timestamp and rationale — exactly how every quality decision was made.
