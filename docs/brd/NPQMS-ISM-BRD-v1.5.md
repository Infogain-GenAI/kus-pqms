# N-PQMS ISM Module — Business Requirements Document

| Field | Value |
|---|---|
| **Document ID** | KPQMS-ISM-BRD-v1.5 |
| **Title** | N-PQMS Issue Management Module 
| **Module** | ISM — Issue Management |
| **Status** | Draft Version|
| **Version** | 1.5 |
| **Date** | 2026-07-17 |
| **Author** | Renuka Chowdhury |
| **Reviewers** | Joon Sung Yoo (HAEA PM), Robert Nguyen (KIA NA,Business Owner) |
| **Parent BRD** | KPQMS-BRD-P1-v1.1, KPQMS-BRD-P1-v1.3 ,KPQMS-BRD-P1-v1.4 |

---
## Revision History

| Version | Date | Author | Summary |
|---|---|---|---|
| 1.0 | 2026-06-17 | PQ Systems Team | Initial draft — ISM enhancements: multi-source adaptive entry, 6-level classification hierarchy, cross-model and cross-engineer correlation, issue linking and grouping |
| 1.2 | 2026-06-22 | PQ Systems Team | Added 5 User Flows (UF-01–UF-06, Mermaid flowcharts); added User Stories subsections throughout §6 (all FR groups); renumbered 5–11 → 6–12 |
| 1.3 | 2026-06-24 | PQ Systems Team | Prototype-driven updates: Issue ID format (`{SYS}-{YY}{NNNN}`); DTC/Trouble Code field on ISM0020 and ISM0040 entry; field label changes ("Affected VIN(s)", "Model Year"); manufacturing origin fields editable; Scope & Description optional; ISM0020 real-time correlation panel confirmed; ISM0040 tab renamed to "Chronology" (oldest-first with day-gap markers); Status Change requires mandatory comment logged to Chronology; ISM0010 attention banners (Action Required, SLA Overdue, Correlation Alert) replace stat cards; "Assigned to Me" filter and badge added to ISM0010. New sections: 6.9 (Issue ID Format), 6.10 (Issue Activity Chronology), 6.11 (Status Change with Required Comment). Updated 6.1, 6.2, 6.7. |
| 1.4 | 2026-07-07 | PQ Systems Team | Including changes to Overview navigation, Issue List default views and columns, simplification of Issue Registration to support minimum required fields, adoption of Model Code as the primary vehicle identifier, relocation of DTC capture to the Issue Description section, removal of non-essential registration fields, enhancement of issue linking capabilities, emphasis on chronology/activity logging for audit purposes, clarification of Phase 1 and Phase 2 scope boundaries|
 1.5 |2026-07-10 | PQ Systems Team |Added Issue List usability enhancements; introduced search scope clarification and horizontal scrolling support; refined suggested issue review and issue preview process; enhanced linked issue management and visibility; redesigned Issue Workspace into Issue Detail, Investigation, Resolution, Communication, and History sections; added rationale capture for status and classification changes; added history management improvements including audit visibility and restricted manual activity entry; added supporting document upload capability; refined QIR creation terminology; reviewed Investigation vs Resolution responsibilities |
---

## Reference Document

 Document Name | DOC Manager Location|
|---------|----------|
| N PQMS-Requirements | N-PQMS_ISM_BRD_v1.1, N-PQMS_ISM_DRD_v1.1 ,N-PQMS_ISM_BRD_v1.3,N-PQMS_ISM_BRD_v1.4 |
| UI Prototype | N-PQMS UI Prototype |
| High Level Design | DES-001-NPQMS HLD Part 01 , DES-002-NPQMS HLD Part02 M1 ISM Functional v1.0  |
| Data Model Design | DM-001-NPQMS HLD Part03 Datamodel v1.0 |

---
  
   ## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Roles & Access Control](#2-roles--access-control)
3. [Business Objectives](#3-business-objectives)
4. [Stakeholders](#4-stakeholders)
5. [Scope Boundary](#5-scope-boundary)
6. [User Flows](#6-user-flows)
   - 6.1 [UF-01 — Issue Registration Flow](#61-uf-01--issue-registration-flow)
   - 6.2 [UF-02 — Classification & Correlation Detection (During Entry)](#62-uf-02--classification--correlation-detection-during-entry)
   - 6.3 [- Issue Status Life Cycle](#63-issue-status-life-cycle)
7. [Functional Requirements](#7-functional-requirements)
   - 7.1 [Overview](#61-overview) 
   - 7.2 [ISM0010 — Issue List](#72-ism0010--issue-list)
   - 7.3 [ISM0020 — Issue Entry](#73-ism0020--issue-entry)
   - 7.4 [ISM0040 — Issue Workspace](#74-ism0040--issue-workspace)
   - 7.5 [ISM0040 — Issue Investigation and Resolution](#75-ism0040---issue-investigation-and-resolution)
   - 7.6 [ADM0200 — ADMIN](#76-ADM0200--ADMIN)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Assumptions & Dependencies](#9-assumptions--dependencies)
10. [Risk and Mitigation](#10risks-and-mitigations)
11. [Out of Scope (Phase 1)](#10-out-of-scope-phase-1)
12. [Approvals](#12-approvals)
---

## 1. Executive Summary

| Item | Detail |
|---|---|
|**Problem Statement** | The legacy KPQMS issue entry form is source-agnostic and single-vehicle-level, making it impossible to capture source-specific data efficiently, apply structured classification for correlation, or proactively surface duplicate/related issues filed by different engineers. Quality signals are siloed per engineer and per model. Additionally, the legacy system lacks: structured issue identification (no system-coded IDs), DTC capture at entry, a clear chronological activity trail, enforced documentation of status changes, and actionable at-a-glance priority information for the QE on login. |
| **Proposed Solution** | Enhance the ISM module with: (1) The N-PQMS Overview serves as the centralized entry point for users across Issue Management (ISM), QIR Management, and TSB Management modules. The Overview provides users with immediate visibility into pending actions, critical quality issues, recently accessed records, and overall issue lifecycle health;(2) an adaptive multi-source entry form with issue source channels and DTC/Trouble Code capture; (3) a 7-level vehicle classification hierarchy with cascading selection and user-editable manufacturing origin fields; (4) four searchable classification key fields (System · Sub-system·Component · Symptom) with master-data management; (5) real-time cross-model correlation detection during entry; (6) post-submission cross-engineer correlation suggestions surfaced in ISM0010 and ISM0040; (7) a system-coded issue ID format (`{SYS}-{YY}{NNNN}`); (8) a mandatory comment gate on all status changes, recorded in a chronological activity trail; and (9) an attention-banner dashboard in ISM0010 surfacing action-required items, SLA overruns, and correlation alerts with an "Assigned to Me" filter. |
| **Business Value** | Reduces duplicate investigation effort; accelerates root-cause convergence across vehicle models; enables data-driven grouping of related issues into consolidated multi-team quality problems; improves classification quality for analytics; ensures status changes are documented and auditable; improves QE focus by surfacing priority actions above the issue list. |
| **Phase** | Phase 1 — Core ISM (go-live December 18, 2026) |
| **Module Tier** | Tier 1 Critical (24.4% of total KPQMS usage) |
| **Document Scope** | ISM0020 (entry), ISM0010 (list/alerts/filters), ISM0040 (detail/links/chronology/status change); classification taxonomy; correlation engine; link/group data model; issue ID format |

---
## 2. Roles & Access Control

### 2.1 Role Definitions

| Role | KUS or External | Comments | N-PQMS Access Details |
|------|----------------|----------|----------------------|
| Service Engineer | KUS | Evaluation of collected parts, including structured test drives. | Power user access. Access to all functions except administration. All screens default to individual view. |
| Service Engineer Manager | KUS | Investigation of specific vehicles at dealerships. | Similar to Service Engineer role, except screens default to team/global views. |
| PQ Department Head | KUS | Participates in investigations involving PQ, Suppliers, Plants, NAQC, and HATCI. | Read-only access to all functional areas except administration. |
| Administrator | KUS | Manages system configuration and administration. Users may submit requests for new activity categories and classifications for review and approval. | Full system access. All screens default to global views. |
| Publication Coordinator | KUS | Responsible for publication process coordination. | Access to Publication Management functions only. |
| Publication Task Owners | KUS | May be divided into multiple roles (e.g., Warranty, Service Operations, Service Garage, Safety Office, Legal, Parts, MPA). | Access to Publication Management communications and task approvals only. Read-only access to most Publication Management functions. |
| Kia Georgia (KaGA) | External | Plant team member. | Access to submit publications, provide status updates, and communicate within Publication Management. View-only access to Publication Management. |
| Kia Mexico (KMX) | External | Plant team member. | Access to submit publications, provide status updates, and communicate within Publication Management. View-only access to Publication Management. |
| HQ (Kia HQ) | External | Plant team member. | Access to submit publications, provide status updates, and communicate within Publication Management. View-only access to Publication Management. |
| NAQC | External | Technical team supporting Top Issue escalations. | TBD. May require visibility into ISM, QIR, and Publication Management. Access is expected to be primarily read-only. |
| HATCI | External | Technical team currently supporting EDIR Publication Management tasks. | Access to Publication Management task approvals only |

## Authorization Matrix – Issue Management (ISM)

| Function | Service Engineer | Service Engineer Manager | PQ Department Head | Administrator | NAQC |
|-----------|---|---|---|---|---|
| View Issue List | Y | Y | Y | Y | Y (RO) |
| View Issue Details | Y | Y | Y | Y | Y (RO) |
| Create Issue | Y | Y | N | Y | N |
| Update Issue Before Submission | Y | Y | N | Y | N |
| Update Issue After Submission | N | Y* | N | Y | N |
| View Issue Workspace | Y | Y | Y | Y | Y (RO) |
| Record Investigation Activities | Y | Y | N | Y | N |
| Upload Supporting Documents | Y | Y | N | Y | N |
| Manage Linked Issues | Y | Y | N | Y | N |
| Change Issue Status | Y | Y | N | Y | N |
| View Audit History | Y | Y | Y | Y | Y (RO) |
| Export Issue Information | Y | Y | Y | Y | Y (RO) |
| Manage Classification Master Data | N | N | N | Y | N |
| Manage Configuration | N | N | N | Y | N |
| Maintain User Access & Roles | N | N | N | Y | N |

## 3. Business Objective

| # | Objective | Success Measure |
|---|-----------|----------------|
|BO-01 | Improve quality issue management efficiency. | Reduce issue registration, investigation, and resolution effort while improving overall process efficiency. |
|BO-02 | Improve traceability and auditability. | Ensure issue activities, status changes, decisions, and audit records are fully traceable throughout the issue lifecycle. |
|BO-03 | Reduce duplicate investigations. | Increase identification of related issues and promote reuse of existing investigation knowledge. |
| BO-04 | Enhance collaboration across teams. | Improve information sharing and coordination among Quality, Service, Engineering, Management, and related stakeholders. |
| BO-05 | Support informed business decision-making. | Provide accurate issue data, reporting, and visibility to support operational and management decisions. |
| BO-06 | Allow classification taxonomy to grow with emerging quality signals                             | Admin users can add/approve new System, Sub-system, or Symptom values without an engineering deployment; new values appear in comboboxes within 24 hours of admin approval |
| BO-07 | Ensure all issue status changes are documented and auditable                                    | 100% of status change events carry a user-authored reason; reason visible in Chronology timeline within the same session                                                   |
| BO-08 | Give each QE immediate visibility of priority actions on login to ISM0010                       | Average time-to-action on approval-pending and SLA-overdue items reduced by ≥ 40% vs. legacy (measured in UAT scenario testing) |

---                              

| BR-ID | Priority | Business Requirement |
|--------|----------|----------------------|
| BR-ISM-001 | P1 | The system shall enable users to efficiently register, investigate, track, and resolve quality issues throughout their lifecycle |
| BR-ISM-002 | P1 | The system shall provide role-based access and personalized views to support efficient issue management and monitoring |
| BR-ISM-003 | P1 | The system shall support vehicle identification and issue classification to enable effective issue tracking, investigation, and analysis |
| BR-ISM-004 | P1 | The system shall provide a centralized workspace for issue investigation, collaboration, resolution activities, and historical tracking |
| BR-ISM-005 | P1 | The system shall enable users to identify, correlate, and manage related or duplicate issues to improve traceability, reduce duplicate investigations, and promote knowledge reuse |
| BR-ISM-006 | P1 | The system shall provide complete traceability of issue activities, status changes, decisions, and administrative actions throughout the issue lifecycle |
| BR-ISM-007 | P1 | The system shall support integration and information sharing between Issue Management and QIR Management processes |
| BR-ISM-008 | P2 | The system shall provide a scalable and configurable framework that supports future business requirements and process enhancements |
| BR-ISM-009 | P2 | The system shall improve user efficiency through streamlined workflows and intuitive navigation |
| BR-ISM-010 | P1 | The system shall enable users to efficiently search, filter, and locate issues using business-relevant criteria |
| BR-ISM-011 | P1 | The system shall enable authorized users to create, view, update, and manage issue records |
| BR-ISM-012 | P1 | The system shall support issue lifecycle management through configurable statuses, workflow transitions, and business outcomes |
| BR-ISM-013 | P2 | The system shall provide reporting and data export capabilities to support business analysis and decision-making |
| BR-ISM-014 | P1 | The system shall support issue disposition management to enable users to determine and record the business outcome of an issue investigation |

---

## 4. Stakeholders

| Role | Name / Team | Responsibility |
|---|---|---|
| PM (HAEA) | Joon Sung Yoo | Overall N-PQMS delivery, scope decisions, go-live sign-off |
| Business Owner (KIA) |Robert Nguyen | Authority of NPQMS project |
| PQM | PQ Management team | Final authority on issue disposition, group creation, cross-team escalation |
| SEM | Service Engineer Manager | Approves issues, escalates to PQM, manages regional quality concerns |
| SE | Service Engineer | Primary user of ISM0020 (issue entry) and ISM0040 (issue detail/links/chronology) |
| Admin | System Administrator | Manages classification taxonomy (System/Sub-system/Symptom master data); manages issue source channel configurations |
| PQ Systems Team | N-PQMS development | Implementation, integration, and release |

---

## 5. Scope Boundary

### New In Scope 

The Phase 1 release of the Issue Management System (ISM) shall include the following capabilities:

- Provide an Overview page for users to access and monitor Issue Management activities.
- Create and register new issues using a simplified issue registration process.
- Capture minimum mandatory issue information, including Model Code, System Classification, Issue Title, and Description.
- Support vehicle identification using Model Code and associated vehicle information.
- Allow users to classify issues using System, Sub-system, and Component classifications.
- Support Diagnostic Trouble Code (DTC) capture as part of issue information.
- Generate and maintain unique ISM Issue IDs.
- Allow users to search, filter, sort, and view issue records from the Issue List.
- Provide role-based default views, including "My Issues" as the default engineer view.
- Support configurable issue list columns based on role and user preferences.
- Allow manual linking of issues using Issue Numbers.
- Provide system-generated suggested issue links for review.
- Allow users to review issue details before accepting suggested links.
- Provide Issue Detail and Workspace functionality for issue management.
- Maintain a complete chronology and activity log of issue-related actions.
- Support issue status management throughout the issue lifecycle.
- Maintain audit history and traceability of all significant issue activities.
- Support administration of classification master data and business-defined classifications.
- Provide role-based access and authorization controls.
- Support future expansion through configurable business rules and classification structures.
---
### Out of Scope (see Section 10)

- Customizable/user-configurable issue source channel types (Phase 2)
- AI-driven similarity scoring beyond keyword/classification key matching (Phase 2)
- Issue Group management screen (ISM0150 — tentative Phase 2)
- EWS and GQIS data ingestion pipelines (covered by INT-02, INT-03 integration BRDs)
---

## 6. User Flows

This section documents the primary user flows as flowcharts. Each flow covers a complete end-to-end journey for a specific scenario. Mermaid diagram syntax is used throughout.

### 6.1 UF-01 — Issue Registration Flow

**Actor:** Service Engineer (SE)
**Entry Point:** ISM0020 — Issue Creation
**Goal:** Register a new quality issue with correct vehicle and classification data, reviewing any correlation match before final submission

```mermaid
flowchart TD
    A(Start: SE opens ISM0020 - Issue Creation) --> B[Step 1: Enter Model Code - auto-defaults Model Year range]
    B --> C{Step 2: Narrow Model Year range?}
    C -->|Yes| D[SE narrows Model Year range]
    C -->|No| E
    D --> E[Step 3: Select classification cascade - System, Sub-system, Component, Symptom, Symptom Details]
    E --> F{Step 4: All fields selected and match found in Correlation Database?}
    F -->|Yes| G[Step 5: Correlation Detection Panel appears inline]
    G --> H[SE reviews correlated issues]
    H --> I[Step 6: Enter Title and Description]
    F -->|No| I
    I --> J[Step 7: Enter DTC or Trouble Code - Optional]
    J --> K[Step 8: SE submits issue - system auto-generates Report Date, read-only]
    K --> L(ISM ID generated - Issue registered)

```
---
### 6.2 UF-02 — Classification & Correlation Detection (During Entry)

**Actor:** Quality Engineer (QE)  
**Entry Point:** ISM0020 – Create Issue  
**Goal:** Classify an issue, review potential matching issues, optionally create issue relationships, and register a new issue.

```mermaid
flowchart TD

    A([Create Issue])

    A --> B[Select Vehicle Information<br/>Model Code and Model Year]

    B --> C[Select Classification<br/>System → Sub-System → Component → Symptom]

    C --> D{Need New Classification Value?}

    D -->|Yes| E[Submit New Value<br/>Pending Admin Approval]

    D -->|No| F[Evaluate Similar Issues]

    E --> F

    F --> G{Similar Issues Found?}

    G -->|Yes| H[Review Suggested Issues]

    G -->|No| I[Continue Registration]

    H --> J{Link Existing Issue?}

    J -->|Yes| K[Create Issue Relationship]

    J -->|No| I

    K --> I

    I --> L[Enter Issue Information<br/>Title, Description, DTC]

    L --> M[Register Issue]

    M --> N([Issue Created])

```
---

### 6.3 Issue Status Life Cycle

#### Issue Status Definitions

| Status Code | Label | Description |
|-------------|--------|-------------|
| OPEN | Open | Newly registered issue. |
| INVESTIGATING | Investigating | Investigation is actively in review. |
| MONITORING | Monitoring | The issue is being monitored. |
| QIR_ESCALATION | QIR Escalation | Issue has entered the QIR escalation process |
| TOP_ISSUE | Top Issue | Issue has been escalated to the Top Issue process. |
| RESOLVED | Resolved | Issue has been successfully resolved through countermeasures, publications, or other corrective actions. |
| OUT_OF_SCOPE | Out of Scope | Issue does not belong to PQMS (e.g., Safety, Regulatory, or another department) |
| CLOSED | Closed | Investigation concluded or the reported condition is not an actual issue and no further action is required. |

```mermaid
stateDiagram-v2

Open

Open --> Investigating

Investigating--> Monitoring
Monitoring --> Investigating

Investigating --> QIR_Escalation
Monitoring --> QIR_Escalation

Investigating --> Top_Issue
Monitoring --> Top_Issue

QIR_Escalation --> Top_Issue

Investigating --> Resolved
Monitoring --> Resolved
QIR_Escalation --> Resolved
Top_Issue --> Resolved

Open --> Out_of_Scope
Investigating --> Out_of_Scope
Monitoring --> Out_of_Scope

Open --> Closed
Investigating --> Closed
Monitoring --> Closed

Resolved --> Closed

Out_of_Scope 
Closed
```
---

## 7-Functional-Requirements

### 7.1 Overview

The N-PQMS Overview serves as the centralized entry point for users across Issue Management (ISM), QIR Management, and TSB Management modules. The Overview provides users with immediate visibility into pending actions, critical quality issues, recently accessed records, and overall issue lifecycle health;Overview  is the primary landing screen for all NPQMS users.

### Functional Requirements

 FR-ID  | Priority | Requirement |
|--------|----------|-------------|
| FR-ISMOVE-001 | P1  | Display header with global navigation (Overview, Issue Management, QIR Management, TSB Management), breadcrumb, help icon, notifications with unread count, and user profile name, role, and last login timestamp |
| FR-ISMOVE-002 | P2  | Display summary cards for Issue Management, QIR Management, and Publication/TSB, each showing key status counts (e.g., Open/Critical/Escalated, Draft/In Review/Published) with a link to the module's detailed listing |
| FR-ISMOVE-003 | P1  | Display "My Action Items" list of tasks assigned to the user, filterable by All / Due Today / Overdue, showing title, record ID, status, due date, and priority, with an "Open" action to view full record |
| FR-ISMOVE-004 | P1  |  Display "Attention Required"  listing high-impact records (record ID, severity tag, description, impact metric) with drill-down to full record details |
| FR-ISMOVE-005 | P1  |The Overview tab shall display a "Recently Accessed" panel listing records the user has recently viewed, across Issue, QIR, and Publication types |
| FR-ISMOVE-006 | P1  | Each recently accessed item shall display its record type (Issue/QIR/Publication), record ID, title/description, current status, and a relative timestamp (e.g., "8 min ago", "Yesterday") |
| FR-ISMOVE-007 | P1 | Each recently accessed item shall be clickable, navigating the user to the corresponding record's detail page. |
| FR-ISMOVE-008 | P1 | The Overview shall provide a "View All" link to navigate to the complete recently accessed history. |
| FR-ISMOVE-009 | P1  |The Overview shall display a "Lifecycle Health" panel showing the count of issues at each lifecycle stage: Open, Investigation, Review, Escalated, and Closed |
| FR-ISMOVE-010 | P1  | Each lifecycle stage shall be visually distinguished using a distinct color indicator (e.g., blue for Open, red for Escalated, green for Closed) alongside its count |
| FR-ISMOVE-011 | P1  | The system shall dynamically update the Recently Accessed list and Lifecycle Health counts to reflect the latest user activity and issue data |
| FR-ISMOVE-012 | P1  |Refresh counts, action items, and alerts dynamically to reflect the latest data |
| FR-ISMOVE-013 | P1 | Personalize dashboard content based on the logged-in user's role |

#### User Stories

| US-ID | Role | Story | Acceptance Criteria | Related FRs |
|--------|------|--------|--------------------|------------|
| US-ISMOVE-001 | User | As a user, I want to view the Overview dashboard so that I can quickly understand my pending actions and system activities. | 1. Dashboard is displayed after login. 2. User can view My Action Items. 3. User can view Attention Required items. | FR-ISMOVE-001, FR-ISMOVE-003, FR-ISMOVE-004 |
| US-ISMOVE-002 | User | As a user, I want to view recently accessed records so that I can quickly navigate to records I worked on recently. | 1. Recently accessed records are displayed. 2. Records display status and timestamp. 3. Records are clickable. | FR-ISMOVE-005, FR-ISMOVE-006, FR-ISMOVE-007 |
| US-ISMOVE-003 | User | As a user, I want to monitor lifecycle health metrics so that I can understand issue distribution and workload. | 1. Lifecycle counts are displayed. 2. Counts refresh dynamically. 3. Statuses are visually distinguishable. | FR-ISMOVE-009, FR-ISMOVE-010, FR-ISMOVE-011 |

### 7.2 ISM0010 — Issue List: 

| FR-ID | Priority | Requirement | BR-ID |
|-------|----------|-------------|-------|
| FR-ISM010-001 | P1 |The Issue List shall display Issue ID, Issue Title, Model Code, Classification, Status, and Linked Issue indicators, and shall allow users to open the Issue Workspace by selecting an issue record.| BR-ISM-002|
| FR-ISM010-002 | P1 | The Issue list shall display "My Issues" as the default Issue List view for logged-in users. | BR-ISM-002 |
| FR-ISM010-003 | P1 | The Issue list shall provide an "All Issues" view to display all accessible issues. | BR-ISM-002 |
| FR-ISM010-004 | P1 | The Issue list shall support configurable issue list columns based on user role and personal preferences. | BR-ISM-002, BR-ISM-008 |
| FR-ISM010-005 | P1 | The Issue list shall preserve user-selected column preferences across sessions. | BR-ISM-002, BR-ISM-009 |
| FR-ISM010-006 | P1 | The Issue list shall provide a filter panel that supports filtering by vehicle(MC), classification, and issue attributes. | BR-ISM-002 |
| FR-ISM010-007 | P1 | The Issue list shall support searchable filters with type-ahead functionality. | BR-ISM-009 |
| FR-ISM010-008 | P1 | The Issue list shall support horizontal scrolling when selected columns exceed the available screen width. | BR-ISM-008 |
| FR-ISM010-009 | P1 | The Issue list shall display complete Issue IDs and Titles or provide visibility through hover functionality. | BR-ISM-009 |
|FR-ISM010-010 | P1 | The ISM0010 issue list should support Issue ID format (`{SYS}-{YY}{NNNN}`system Code + Year + Sequence, ensuring identification by system (e.g., EE, Trans)| BR-ISM-001 |
| FR-ISM010-011 | P1 | Role-based default views configured by Admin and User-specific customizable views for individual preferences|BR-ISM-008 |
| FR-ISM010-012 | P1 | The system shall display a breadcrumb (Issue Management > Issue List) with a back navigation option to the previous screen | BR-ISM-001 |
| FR-ISM010-013 | P1 |The system shall provide an "Export" action to download the issue list, and a "New Issue" action to navigate to the issue creation form | BR-ISM-011 |
| FR-ISM010-014 | P1 | The system shall display summary stat cards for Total, Critical, High, Medium, Low, and Info issue counts, each with a trend indicator showing change since the last period. |
| FR-ISM010-015 | P1 | The system shall provide filter fields for all the columns to refine the issue list|
| FR-ISM010-016 | P1 | The system shall provide "Apply Filters" and "Clear All" actions to apply or reset all selected filter/source criteria. |
| FR-ISM010-017 | P1 | The system shall update the issue list and summary stat cards dynamically based on the applied filters. |
| FR-ISM010-018 | P1 |  The system shall provide free-text search across issue attributes and provide keyword search across all searchable issue attributes displayed within the issue list. | BR-ISM-010 |
| FR-ISM010-019 | P1 | The system shall allow row selection via checkboxes, enabling bulk actions to assign, change status, or export selected issues | BR-ISM-011|
| FR-ISM010-020 | P1 | The system shall display pagination controls with total issue count, adjustable rows-per-page, and page navigation| BR-ISM-001 |
| FR-ISM010-021 | P1 | The system shall provide a column configuration panel that allows users to customize the columns displayed in the Issue List. | BR-ISM-009 |
| FR-ISM010-022 | P1 | The system shall display a predefined set of default columns for all users. | BR-ISM-009 |
| FR-ISM010-023 | P1 | The system shall allow users to show or hide optional columns within the Issue List. | BR-ISM-009 |
| FR-ISM010-024 | P1 | The system shall display default columns including Issue ID, Issue Title, Model Code, Classification, Status, and Linked Indicators. | BR-ISM-014 |
| FR-ISM010-025 | P1 | The system shall require users to provide a reason or comment when performing a bulk status change from the Issue List and shall validate the entry before processing the update. | BR-ISM-006, BR-ISM-012 |

#### User Stories

| US-ID | Role | Story | Acceptance Criteria | Related FRs |
|--------|------|--------|--------------------|------------|
| US-ISM010-001 | User | As a user, I want to view issues assigned to me by default so that I can focus on my work items | 1. My Issues view is displayed by default. 2. User can switch to All Issues. | FR-ISM010-002, FR-ISM010-003, FR-ISM010-011 |
| US-ISM010-002 | User | As a user, I want to search and filter issues so that I can quickly locate relevant records. | 1. Search is available. 2. Filters can be applied. 3. Filtering updates the list | FR-ISM010-006, FR-ISM010-007, FR-ISM010-014, FR-ISM010-015, FR-ISM010-016, FR-ISM010-017, FR-ISM010-018 |
| US-ISM010-003 | User | As a user, I want to personalize columns in the Issue List so that I can view information relevant to my role. | 1. Columns can be shown or hidden. 2. Preferences are retained. | FR-ISM010-004, FR-ISM010-005, FR-ISM010-008, FR-ISM010-021, FR-ISM010-022, FR-ISM010-023, FR-ISM010-024 |
| US-ISM010-004 | User | As a user, I want to export issue data so that I can perform offline analysis and reporting. | 1. Export action is available. 2. Export contains visible records,3. New Issue action is available from the Issue List.<br>4. Selecting New Issue navigates the user to the Issue Entry screen | FR-ISM010-013 | 
| US-ISM010-005 | User | As a user, I want to view issue information and access issue details so that I can efficiently review and manage issues. | 1. Issue List displays Issue ID, Issue Title, Model Code, Classification, Status, and Linked Issue indicators. 2. Complete Issue IDs and Titles are visible or accessible through hover functionality.<br>3. Issue IDs use the format `{SYS}-{YY}{NNNN}`. 4. Selecting or double-clicking an issue opens the Issue Workspace or Issue Detail screen | FR-ISM010-001, FR-ISM010-009, FR-ISM010-010 |
| US-ISM010-006 | User | As a user, I want navigation and paging controls so that I can efficiently navigate large issue lists. | 1. Breadcrumb navigation is displayed.<br>2. Users can navigate back to the previous screen.<br>3. Pagination controls are available.<br>4. Total issue count is displayed.<br>5. Users can navigate between pages.<br>6. Users can select the number of rows displayed per page | FR-ISM010-012, FR-ISM010-020 |
| US-ISM010-007 | User | As a user, I want to perform actions on multiple issues at once so that I can manage issues more efficiently. | 1. Users can select multiple issues using row checkboxes.<br>2. Bulk Assign action is available for selected records. 3. Bulk Status Change action is available for selected records.<br>4. Selected issues can be exported. 5.Users must provide a reason or comment when changing status. | FR-ISM010-019 |


### 7.3 ISM0020 — Issue Entry

| FR-ID  | Priority | Requirement | BR-ID |
|--------|----------|-------------|-------|
| FR-ISM020-001 | P1 | The system shall provide a simplified Issue Entry screen containing only the minimum information required to register an issue | BR-ISM-001, BR-ISM-009, BR-ISM-011 |
| FR-ISM020-002 | P1 | For Issue Entry the system shall allow users to enter details in the following order: Model Code → System Classification → Title → Description → DTC. | BR-ISM-003, BR-ISM-014 |
| FR-ISM020-003 | P1 | The ISM0020 shall capture vehicle information using Model Code only; the system shall auto-default the Model Year range based on the entered Model Code, and allow the users to optionally refine the applicable Model Year selection | BR-ISM-003 |
| FR-ISM020-004 | P1 | The system shall allow users to classify issues using System, Sub-system, Component, and Symptom classifications. | BR-ISM-003, BR-ISM-014 |
| FR-ISM020-005 | P1 | The system shall provide searchable classification fields with type-ahead functionality. | BR-ISM-009, BR-ISM-010 |
| FR-ISM020-006 | P1 | The system shall allow users to enter an Issue Title and Description. | BR-ISM-001, BR-ISM-011 |
| FR-ISM020-007 | P2 | The system shall allow users to capture Diagnostic Trouble Codes (DTCs) associated with the issue. | BR-ISM-003, BR-ISM-014 |
| FR-ISM020-008 | P1 | The system shall provide an issue preview that allows users to review key issue details and supporting context in read-only mode prior to confirming an issue link | BR-ISM-005, BR-ISM-009 |
| FR-ISM020-009 | P1 | The system shall generate a unique Issue ID upon successful issue registration. | BR-ISM-001, BR-ISM-011, BR-ISM-012 |
| FR-ISM020-010 | P1 | The system shall automatically capture the Issue Creation Date upon issue registration. | BR-ISM-006, BR-ISM-012 |
| FR-ISM020-011 | P1 | The system shall display suggested existing issues that match the selected classification criteria during issue registration. | BR-ISM-005, BR-ISM-010 |
| FR-ISM020-012 | P1 |  The system shall allow users to search for existing issues and manually create issue relationships during issue registration, including issues not presented in the suggested issue results. | BR-ISM-005, BR-ISM-010 |
| FR-ISM020-013 | P1 | The system shall validate mandatory fields before allowing issue registration. | BR-ISM-011 |
| FR-ISM020-014 | P1 | The system shall redirect users to the Issue Workspace upon successful issue registration. | BR-ISM-004, BR-ISM-011 |
| FR-ISM020-015 | P1 | The system shall provide the reason for each issue suggestion. | BR-ISM-005, BR-ISM-009 |
| FR-ISM020-016 | P1 | The system shall display matching indicators such as Exact Classification Match, Same Model Code Match, or other configured match types. | BR-ISM-005 |
| FR-ISM020-017 | P1 | The system shall display key details for suggested issues, including Issue ID, Issue Title, Classification, Symptom, Current Status, and other configured issue attributes required for link evaluation. | BR-ISM-014, BR-ISM-012 | 
| FR-ISM020-018 | P1 | The system shall allow users to select one or more suggested issues for linking. | BR-ISM-005, BR-ISM-011 |
| FR-ISM020-019 | P1 | The system shall maintain relationships between linked issues after issue registration. | BR-ISM-005, BR-ISM-011 |
| FR-ISM020-020 | P1 | The system shall record issue linking activities in the issue history and audit trail. | BR-ISM-006 |
| FR-ISM020-021 | P1 | The system shall allow users to continue issue registration regardless of whether a suggested issue is linked. | BR-ISM-001, BR-ISM-009 .BR-ISM-015 |
| FR-ISM020-022 | P1 | The system shall allow users to link the selected issue directly from the issue preview. | BR-ISM-005 |
| FR-ISM020-023 | P1 | The system shall allow users to close the issue preview without creating a link. | BR-ISM-009 | BR-ISM-001 |
| FR-ISM020-024 | P1 | he system shall open issue preview without interrupting or losing data entered in the Issue Entry workflow | BR-ISM-009 |
| FR-ISM020-025 | P1 | The system shall present the issue preview in a read-only mode during issue registration. | BR-ISM-011 |
| FR-ISM020-026 | P1 | The system shall display a confirmation message upon successful issue registration. | BR-ISM-001, BR-ISM-011 |
| FR-ISM020-027 | P1 | The system shall display the generated Issue ID following successful issue registration. | BR-ISM-011, BR-ISM-012 |
| FR-ISM020-028 | P1 | The system shall display the Issue Title associated with the registered issue. | BR-ISM-014 |
| FR-ISM020-029 | P1 | The system shall display the initial issue status assigned during issue registration. | BR-ISM-012 |
| FR-ISM020-030 | P1 | The system shall indicate that the issue has been successfully created and is available for further processing. | BR-ISM-001 |
| FR-ISM020-031 | P1 | The system shall provide an option to navigate back to the Issue List after successful issue registration. | BR-ISM-009, BR-ISM-011 |
| FR-ISM020-032 | P1 | The system shall provide an option to navigate directly to the Issue Workspace for the newly created issue. | BR-ISM-004, BR-ISM-011 |
| FR-ISM020-033 | P1 | The system shall associate the generated Issue ID with the new issue record and maintain it throughout the issue lifecycle. | BR-ISM-011, BR-ISM-012 |
| FR-ISM020-034 | P1 | The system shall create an audit trail entry upon successful issue registration. | BR-ISM-006 |
| FR-ISM020-035 | P1 | The system shall automatically assign the initial workflow status to the issue upon registration ystem assigns initial status as Open. | BR-ISM-012 |
| FR-ISM020-036 | P2 | The system shall display a visual success indicator to distinguish successful issue creation from validation or processing errors. | BR-ISM-009 |
| FR-ISM020-037 | P1 | The system shall enforce role-based access permissions for Issue Entry based on user role. | BR-ISM-002 | BR-ISM-009 |

#### User Stories

| US-ID | Role | Story | Acceptance Criteria | Related FRs |
|--------|------|--------|--------------------|------------|
| US-ISM020-001 | Quality Engineer | As a Quality Engineer, I want to register a new issue using a simplified Issue Entry process so that I can quickly document and track quality concerns. | 1. User can access the New Issue screen from Issue Management.<br>2. Required Issue Entry fields are available for data entry.<br>3. Mandatory fields are validated before submission.<br>4. User can submit the issue using the Register Issue action.<br>5. The system successfully creates the issue when validation passes. | FR-ISM020-001, FR-ISM020-013 |
| US-ISM020-002 | Quality Engineer | As a Quality Engineer, I want to select a Model Code for an issue so that the issue can be associated with the affected vehicle model. | 1. User can search and select a Model Code.<br>2. Model Code selection is mandatory.<br>3. Selected Model Code is associated with the issue record.<br>4. System Classification section is enabled after Model Code selection.<br>5. The selected Model Code is displayed in the classification path. | FR-ISM020-002, FR-ISM020-003 |
| US-ISM020-003 | Quality Engineer | As a Quality Engineer, I want to classify an issue using System, Sub-System, Component, and Symptom classifications so that issues are categorized consistently for analysis and reporting. | 1. User can select System, Sub-System, Component, and Symptom values.<br>2. Classification values are available after Model Code selection.<br>3. Searchable classification fields are available.<br>4. Type-ahead functionality is supported.<br>5. Classification values are filtered based on preceding selections.<br>6. Only valid classification paths are available for selection.<br>7. Classification data is stored with the issue. | FR-ISM020-004, FR-ISM020-005 |
| US-ISM020-004 | Quality Engineer | As a Quality Engineer, I want to select and associate one or more Diagnostic Trouble Codes (DTCs) with an issue during issue registration, so that diagnostic information is available for investigation, troubleshooting, and quality analysis | 1. User can select one or more DTC codes from a dropdown list.<br> 2.Multiple DTC codes can be associated with a single issue.<br> 3.Selected DTC codes are stored with the issue record. | FR-ISM020-007 |
| US-ISM020-005 | Quality Engineer | As a Quality Engineer, I want the system to display suggested related issues during issue registration so that duplicate investigations can be avoided and existing knowledge can be reused. | 1. Suggested issues are displayed when matching criteria are found.<br>2. Match reasons are displayed.<br>3. Matching indicators are displayed.<br>4. Suggested issue details including Issue ID, Issue Title, Classification, Symptom, and Status are visible.<br>5. User can select one or more suggested issues for linking.<br>6. User may continue registration without linking. | FR-ISM020-011, FR-ISM020-015, FR-ISM020-016, FR-ISM020-017, FR-ISM020-018, FR-ISM020-023 |
| US-ISM020-006 | Quality Engineer | As a Quality Engineer, I want to preview suggested issues before linking them so that I can confirm issue relevance before creating a relationship. | 1. Issue preview opens in read-only mode.<br>2. Key issue details and supporting context are displayed.<br>3. User can review issue details without leaving Issue Entry.<br>4. User can link the issue directly from the preview.<br>5. User can close the preview without creating a link.<br>6. Closing the preview returns the user to Issue Entry without losing entered information. | FR-ISM020-008, FR-ISM020-021, FR-ISM020-022, FR-ISM020-024, FR-ISM020-025 |
| US-ISM020-007 | Quality Engineer | As a Quality Engineer, I want to manually search and link related issues so that relationships between issues can be established even when no suggestions are found. | 1. User can search existing issues.<br>2. User can search for issues not included in the suggested issue results.<br>3. User can link one or more issues.<br>4. Linked issue relationships are maintained.<br>5. Linking activities are recorded in audit history. | FR-ISM020-012, FR-ISM020-019, FR-ISM020-020 |
| US-ISM020-008 | Quality Engineer | As a Quality Engineer, I want to register an issue using the Register Issue action so that issue information is stored and tracked within the system. | 1. User can submit an issue using the Register Issue button. 2. System returns a generated Issue ID.<br>3. Registration failures are communicated to the user. 4. Issue creation date is captured automatically.5. Initial workflow status is assigned automatically as Open.<br>6. Issue ID remains associated with the issue throughout its lifecycle.<br>7. Audit trail entry is created. | FR-ISM020-009, FR-ISM020-010, FR-ISM020-032, FR-ISM020-033, FR-ISM020-034 |
| US-ISM020-009 | Quality Engineer | As a Quality Engineer, I want confirmation after successful issue registration so that I know the issue has been created and can continue working on it. | 1. Confirmation message is displayed.<br>2. Generated Issue ID is displayed.<br>3. Issue Title is displayed.<br>4. Initial issue status is displayed.<br>5. User can navigate to Issue Workspace.<br>6. User can return to Issue List.<br>7. The system indicates successful issue creation.<br>8. Success and error states are clearly distinguishable.<br>9. User is redirected to the Issue Workspace after successful registration when selected. | FR-ISM020-014, FR-ISM020-036, FR-ISM020-026, FR-ISM020-027, FR-ISM020-028, FR-ISM020-029, FR-ISM020-030, FR-ISM020-031, FR-ISM020-035 |
| US-ISM020-010 | System User | As a system user, I want Issue Entry access and edit permissions to be controlled by role so that only authorized actions can be performed. | 1. Quality Engineer can create and edit issues before submission. <br>2 . PQM and Managers can edit submitted issues with mandatory justification.<br>3. System Administrator access is controlled according to configured permissions.<br>4. Unauthorized actions are restricted. | FR-ISM020-037 |

---
### 7.4 ISM0040 — Issue Workspace

| FR-ID | Priority | Requirement | BR-ID |
|--------|----------|-------------|--------|
| FR-ISM040-001 | P1 | The system shall provide a centralized Issue Workspace for managing issue-related activities after registration. | BR-ISM-004, BR-ISM-011 |
| FR-ISM040-002 | P1 | The workspace shall include Issue Detail, Investigation, Resolution, Communication, and History sections. | BR-ISM-004, BR-ISM-009 |
| FR-ISM040-003 | P1 | The Issue Detail section shall display issue information, vehicle information, classification information, and associated records. | BR-ISM-003, BR-ISM-011 |
| FR-ISM040-004 | P1 | The Investigation section shall allow users to record and manage investigation activities, observations, evaluations, supporting evidence, and technical analysis information associated with an issue. | BR-ISM-004 |
| FR-ISM040-005 | P1 | The Resolution section shall provide visibility into linked QIR information, root cause information, countermeasures, related publications, disposition outcomes, and closure information. | BR-ISM-004, BR-ISM-007, BR-ISM-012 |
| FR-ISM040-006 | P1 | The Communication section shall provide a centralized area for issue-related discussions and document sharing. | BR-ISM-004 |
| FR-ISM040-007 | P1 | The History section shall provide visibility into Activity History and Audit History associated with the issue lifecycle. | BR-ISM-006, BR-ISM-012 |
| FR-ISM040-008 | P1 | The system shall automatically maintain Activity History and Audit History records, including activity details, user actions, timestamps, comments, and other auditable changes associated with an issue. | BR-ISM-006 |
| FR-ISM040-009 | P1 | Audit History shall record administrative and system-controlled changes, including status changes, ownership changes, classification changes, configuration updates, and associated audit information. | BR-ISM-006 |
| FR-ISM040-010 | P2 | The system shall support controlled entry of historical activities by authorized users. | BR-ISM-006 |
| FR-ISM040-011 | P1 | The system shall support issue status updates from the Issue Workspace. | BR-ISM-011, BR-ISM-012 |
| FR-ISM040-012 | P1 | The system shall support creation of a QIR from an issue record and provide visibility into associated QIR records. | BR-ISM-007 |
| FR-ISM040-013 | P1 | The system shall provide search and date filtering capabilities within the History section. | BR-ISM-010, BR-ISM-006 |
| FR-ISM040-014 | P2 | The system shall support consolidated visibility of activities associated with linked issues. | BR-ISM-005 |
| FR-ISM040-015 | P1 | The system shall display key issue information including Issue ID, issue owner, issue age, vehicle information, issue description, and supporting information. | BR-ISM-003, BR-ISM-011, BR-ISM-012, BR-ISM-014 |
| FR-ISM040-016 | P1 | The system shall display linked issues, linked QIRs, linked publications, and other related records associated with the issue. | BR-ISM-005, BR-ISM-007 |
| FR-ISM040-017 | P1 | The system shall allow authorized users to edit issue information and manage linked issue relationships. | BR-ISM-011, BR-ISM-005 |
| FR-ISM040-018 | P1 | The system shall display issue information in read-only mode for users without update permissions. | BR-ISM-002, BR-ISM-011 |
| FR-ISM040-019 | P1 | The system shall allow authorized users to change issue status from the Issue Workspace. | BR-ISM-011, BR-ISM-012 |
| FR-ISM040-020 | P1 | The system shall display the current issue status and valid status values available during the status update process. | BR-ISM-012 |
| FR-ISM040-021 | P1 | The system shall require users to provide a reason or comment when changing an issue status and validate required status change information before submission. | BR-ISM-006, BR-ISM-012 |
| FR-ISM040-022 | P1 | The system shall update the issue status upon successful submission of a valid status change request. | BR-ISM-012 |
| FR-ISM040-023 | P1 | The system shall allow users to cancel a status change without updating the issue record. | BR-ISM-009 |
| FR-ISM040-024 | P1 | The system shall create an audit history record for every status change, including previous status, new status, user, timestamp, and associated reason or comment. | BR-ISM-006, BR-ISM-012 |
| FR-ISM040-025 | P1 | The system shall display status change history within the History section of the Issue Workspace. | BR-ISM-006, BR-ISM-004 |
| FR-ISM040-026 | P1 | The system shall restrict status changes based on user authorization and role permissions. | BR-ISM-002, BR-ISM-011 |
| FR-ISM040-027 | P2 | The system shall enforce business-defined status transition rules between issue statuses when configured. | BR-ISM-012, BR-ISM-008 |
| FR-ISM040-028 | P1 | The system shall provide action labels that clearly describe the resulting business action associated with a status update. | BR-ISM-009 |
| FR-ISM040-029 | P1 | The system shall allow users to upload and manage supporting documents associated with an issue record. | BR-ISM-011 |
| FR-ISM040-030 | P1 | The system shall support approved attachment types including PDF, PowerPoint, Excel, image files, email files, and other configured file formats. | BR-ISM-011 |
| FR-ISM040-031 | P1 | The system shall retain uploaded documents within the issue record and make them available for future reference by authorized users. | BR-ISM-006, BR-ISM-011 |
| FR-ISM040-032 | P2 | The Issue Workspace shall display issue scoring information derived from configured business thresholds, associated source data, threshold evaluation results, and escalation recommendations when available. | BR-ISM-008 ||
---
#### User Stories

| US-ID | Role | Story | Acceptance Criteria | Related FRs |
|--------|------|--------|--------------------|-------------|
| US-ISM040-001 | User | As a user, I want to access a centralized Issue Workspace so that I can manage and review issue-related activities throughout the issue lifecycle. | - Users can access the Issue Workspace from an issue record.<br>- The workspace displays all applicable sections and issue information.<br>- Users can navigate between workspace sections. | FR-ISM040-001, FR-ISM040-002 |
| US-ISM040-002 | User | As a user, I want to view issue details and associated information so that I can understand the issue context and status. | - Key issue information is displayed.<br>- Vehicle and classification information is displayed.<br>- Associated records and supporting information are visible.<br>- Information is displayed according to user permissions. | FR-ISM040-003, FR-ISM040-015, FR-ISM040-016, FR-ISM040-018 |
| US-ISM040-003 | Quality Engineer | As a Quality Engineer, I want to record and manage investigation activities so that issue causes can be evaluated and documented. | - Users can create and maintain investigation activities.<br>- Investigation observations, findings, and analysis can be recorded.<br>- Investigation records are associated with the issue.<br>- Activity information is available for future reference. | FR-ISM040-004 |
| US-ISM040-004 | Quality Engineer | As a Quality Engineer, I want to review resolution information and linked QIR details so that I can track issue outcomes and corrective actions. | - Resolution information is displayed when available.<br>- Linked QIR information is visible.<br>- Root cause information is displayed.<br>- Countermeasure and closure information is available. | FR-ISM040-005, FR-ISM040-012 |
| US-ISM040-005 | User | As a user, I want to communicate and share information within an issue record so that collaboration remains centralized and traceable. | Users can create communication entries. Communication history is retained. Shared information is accessible to authorized users - Communication activities are associated with the issue. | FR-ISM040-006 |
| US-ISM040-006 | User | As a user, I want to review issue history and audit information so that I can understand activities and changes made throughout the issue lifecycle. | - Activity History is available.<br>- Audit History is available.<br>- Users can search and filter history records.<br>- Historical records include relevant audit details. | FR-ISM040-007, FR-ISM040-008, FR-ISM040-009, FR-ISM040-010, FR-ISM040-013 |
| US-ISM040-007 | User | As a user, I want to view and manage linked issues and related records so that I can understand relationships between similar or associated issues. | - Related records are displayed.<br>- Linked issues can be viewed and managed.<br>- Users can navigate to linked issue records.<br>- Consolidated visibility of linked issue activities is available when applicable. | FR-ISM040-014, FR-ISM040-016, FR-ISM040-017 |
| US-ISM040-008 | Authorized User | As an authorized user, I want to update issue information so that issue records remain accurate and current. | - Authorized users can edit issue information.<br>- Updates are stored successfully.<br>- Changes are restricted by user permissions.<br>- Read-only users cannot modify issue information. | FR-ISM040-017, FR-ISM040-018 |
| US-ISM040-009 | Authorized User | As an authorized user, I want to manage issue status changes so that issue lifecycle progression is controlled and auditable. | - Authorized users can change issue status.<br>- Valid status values are displayed.<br>- Reason/comments can be captured when required.<br>- Status changes are validated before submission.<br>- Status changes are recorded in audit history.<br>- Status history is available for review.<br>- Status transition rules are enforced when configured. | FR-ISM040-019, FR-ISM040-020, FR-ISM040-021, FR-ISM040-022, FR-ISM040-023, FR-ISM040-024, FR-ISM040-025, FR-ISM040-026, FR-ISM040-027, FR-ISM040-028 |
| US-ISM040-010 | User | As a user, I want to upload and manage supporting documents so that issue-related evidence and supporting information are retained for future reference. | - Users can upload supporting documents.<br>- Supported file types are accepted.<br>- Uploaded documents are associated with the issue record.<br>- Authorized users can access uploaded documents in the future | FR-ISM040-029, FR-ISM040-030, FR-ISM040-031 |
| US-ISM040-011 | Authorized User | As an authorized user, I want issue classification and status changes to be controlled and audited so that issue history remains traceable | 1. Rationale/comment is required for classification changes.2. Rationale/comment is required for status changes.3. Classification and status changes are recorded in audit history 4. Manual history entry is restricted by role.5. Linked issue activities can be reviewed when available. | FR-ISM040-024, FR-ISM040-025 |
| US-ISM040-012 | Quality Engineer | As a Quality Engineer, I want to view issue scoring and escalation information so that I can evaluate issue priority and determine whether escalation actions are required. | - Issue scoring information is displayed when available.<br>- Source data contributing to issue scores is visible.<br>- Threshold evaluation results are displayed.<br>- Escalation recommendations are presented when applicable.<br>- Scoring information is derived from configured business rules and thresholds | 
FR-ISM040-032 |
| US-ISM040-013 | Quality Engineer | As a Quality Engineer, I want to create a QIR directly from an issue so that investigation findings can be escalated into the QIR process. | 1. User can initiate QIR creation from Issue Workspace.<br>2. Issue information is available for QIR creation.<br>3. Created QIR is linked to the originating issue.<br>4. Linked QIR is visible in Resolution section.<br>5. Audit history records QIR creation. | FR-ISM040-012 |
---
### 7.5 ISM0040  — Issue Investigation and Resolution

| FR-ID | Priority | Requirement | BR-ID |
|--------|----------|-------------|--------|
| FR-ISM040-033 | P2 | The system shall support activity-specific data capture fields based on the selected Activity Type. | BR-ISM-008 |
| FR-ISM040-034 | P1 | The system shall allow authorized users to create, update, and maintain investigation activities associated with an issue, including Parts Requests, Parts Evaluation, Field Inspection, Supplier Investigation, Technical Analysis, and other configured activity types. | BR-ISM-004 |
| FR-ISM040-035 | P1 | Investigation activities shall support attachment of supporting documents, evidence, findings, status information, and other related investigation data. | BR-ISM-004, BR-ISM-006 |
| FR-ISM040-036 | P1 | The system shall maintain separate  History records within the Issue Workspace. | BR-ISM-006 |
| FR-ISM040-037 | P1 | Audit History shall record administrative and system-controlled changes, including status changes, ownership changes, classification changes, configuration updates, previous values, new values, user information, timestamps, and change rationale where applicable. | BR-ISM-006 |
| FR-ISM040-038 | P1 | The system shall support  Monitoring, No Issue, Escalate to QIR, and Closed outcomes. | BR-ISM-014 |
| FR-ISM040-039 | P1 | The system shall require users to provide a rationale when assigning or updating a disposition and shall record in history for audit purposes. | BR-ISM-014 |
| FR-ISM040-040 | P1 | The Resolution section shall display Root Cause Analysis and countermeasure information received from linked QIR records in read-only mode when available. | BR-ISM-007 |
---
#### User Stories

| US-ID | Role | Story | Acceptance Criteria | Related FRs |
|--------|------|--------|--------------------|-------------|
| US-ISM040-014 | Quality Engineer | As a Quality Engineer, I want to manage investigation activities so that issue causes can be analyzed, validated, and documented throughout the investigation lifecycle. | - Authorized users can create, update, and maintain investigation activities.<br>- Investigation activities can be categorized using configured Activity Types.<br>- Activity-specific information is captured based on the selected Activity Type.<br>- Investigation records are associated with the relevant issue.<br>- Investigation activities support tracking of findings, status, and related information. | FR-ISM040-032, FR-ISM040-033, FR-ISM040-034 |
| US-ISM040-015 | Quality Engineer | As a Quality Engineer, I want to capture and maintain supporting evidence for investigation activities so that investigation findings are properly documented and traceable. | - Users can attach supporting documents and evidence to investigation activities.<br>- Attachments are associated with the corresponding investigation activity.<br>- Investigation information is retained for future reference.<br>- Supporting information is available to authorized users. | FR-ISM040-035 |
| US-ISM040-016 | User | As a user, I want investigation and administrative activities to be auditable so that issue-related decisions and actions remain traceable throughout the issue lifecycle. | - The system maintains separate Activity History and Audit History records.<br>- Activity History records investigation-related activities.<br>- Audit History records administrative and system-controlled changes.<br>- Audit records include relevant change details, user information, and timestamps.<br>- Historical information is available for review by authorized users. | FR-ISM040-036, FR-ISM040-037 |
| US-ISM040-017 | Quality Engineer | As a Quality Engineer, I want to manage issue dispositions and review resolution information so that investigation outcomes can be documented and appropriate actions can be taken. | - Users can assign valid disposition outcomes to an issue.<br>- Users must provide rationale when assigning or updating a disposition.<br>- Disposition history is retained for audit purposes.<br>- Root Cause Analysis information received from linked QIR records is displayed in read-only mode when available.<br>- Countermeasure information received from linked QIR records is displayed in read-only mode when available. | FR-ISM040-038, FR-ISM040-039, FR-ISM040-040 |
---
### 7.6 ADM0200 — ADMIN 

| FR-ID | Priority | Requirement |
|---|---|---|
| FR-ADM-001 | P1 | An ADM0200 admin screen shall allow Admin role users to view, add, edit, and deactivate System, Sub-system, and Symptom values. |
| FR-ADM-002 | P1 | ADM0200 shall display a pending approval queue of values proposed by QEs via the "Add new" combobox flow. Admin users shall be able to approve (activate) or reject (discard) each pending value. |
| FR-ADM-003 | P1 | Approved values shall become available in combobox dropdowns across all entry sessions within 24 hours (or on next cache refresh, whichever is sooner). |
| FR-ADM-004 | P2 | ADM0200 shall allow Admin users to define the parent–child relationships between System → Sub-system and Sub-system → Symptom, enabling full control of the cascade structure. |

Administration – Future Threshold Configuration (Phase 2)
| FR-ID | Priority | Requirement |
|---|---|---|
| FR-ADM-005 | P2 | The system shall support administrator-managed threshold configuration for issue scoring, monitoring, and escalation processes. | BR-ISM-008 |
| FR-ADM-006 | P2 | The system shall support threshold configuration by source, system, or other business-defined criteria. | BR-ISM-008 |
| FR-ADM-007 | P2 | The system shall use configured threshold values when calculating issue scores and escalation recommendations, where applicable. | BR-ISM-008 |
| FR-ADM-008 | P2 | Threshold configuration changes shall be recorded in Audit History including previous value, new value, user, timestamp, and change rationale. | BR-ISM-006 |

---
#### User Stories

| US-ID | Role | Story | Acceptance Criteria |
|---|---|---|---|
| US-CBX-002 | Quality Engineer | As a QE observing  no matching Symptom in the list, I want to type my own symptom description and submit my issue immediately, with the new term flagged for admin review, so that emerging quality signals are never lost waiting for taxonomy updates. | "Add new: [value]" option appears when typed text has no match Selecting it applies the value to the form session with a "Pending Admin Approval" badge. Issue submits successfully with the pending value attached. ADM0200 queue gains a new pending entry. |
| US-CBX-003 | System Administrator | As an Admin, I want a dedicated pending approval queue in ADM0200 that shows me every QE-proposed classification value along with the issue it was proposed on, so that I can evaluate context before approving or rejecting. | ADM0200 pending queue lists all pending CLASSIFICATION_VALUE records with proposer name, proposed value, level, and originating issue ID. Approve action activates the value within 24 hours. Reject action discards the value and notifies the proposer. |
---
## 8. Non-Functional Requirements

| NFR-ID | Category | Requirement |
|---|---|---|
 NFR-ISM-001 | Performance |The system shall respond to user interactions within acceptable business response times under normal operating conditions |
| NFR-ISM-002 | Availability |The Issue Management module shall maintain a minimum availability of 99.5% during defined business operating hours |
| NFR-ISM-003 | Security | The system shall enforce role-based access control for all Issue Management functions and data |
| NFR-ISM-004 | Security | The system shall require user authentication through the approved enterprise identity management solution |
| NFR-ISM-006 | Auditability | The system shall record all issue creation, modification, status changes, linking activities, and administrative actions in audit history. |
| NFR-ISM-007 | Auditability | Audit history records shall be read-only for standard users |
| NFR-ISM-008 | Reliability | The system shall preserve data integrity during system failures, interruptions, or transaction errors. |
| NFR-ISM-009 | Reliability | The system shall prevent unauthorized modification of audit records |
| NFR-ISM-010 | Data Integrity | The system shall validate mandatory fields before processing business transactions |
| NFR-ISM-011 | Data Integrity | The system shall prevent duplicate identifiers from being generated for issue records |
| NFR-ISM-012 | Accessibility | User interface components shall support keyboard navigation and comply with approved accessibility standards |
| NFR-ISM-014 | Compliance | Audit and issue history records shall be retained according to approved records retention policies |
| NFR-ISM-015 | Usability | The system shall provide clear success, warning, validation, and error messages to users |
| NFR-ISM-016 | Document Management | Uploaded files shall be validated and scanned according to enterprise security standards before storage |
| NFR-ISM-017 | Maintainability | The system shall support configuration of business rules, status values, and classifications without requiring application code changes where applicable |
---
## 9. Assumptions & Dependencies

| ID | Type | Assumption / Dependency |
|-----|------|-------------------------|
| AD-ISM-001 | Dependency | Vehicle information services are available to support VIN-based vehicle identification and retrieval of associated vehicle information. If unavailable, users shall be able to manually provide vehicle information. |
| AD-ISM-002 | Dependency | Vehicle master data, including Model Codes, Model Years, and related vehicle attributes, is maintained by an authorized source system and is available to support Issue Management processes. |
| AD-ISM-003 | Dependency | Issue classification master data, including System, Sub-System, Component, and Symptom values, is available and governed through approved administration processes. |
| AD-ISM-004 | Dependency | Workflow routing, approval processing, escalation management, and notification capabilities are provided through an approved enterprise workflow platform. |
| AD-ISM-005 | Dependency | User authentication and role information are provided through the enterprise identity and access management solution to support authorization and access control requirements. |
| AD-ISM-006 | Dependency | Related issue, QIR, publication, and other integrated records are available through approved system interfaces to support traceability and cross-process visibility. |
| AD-ISM-007 | Dependency | Supporting documents and attachments are stored and managed through approved enterprise document management or storage services. |
| AD-ISM-008 | Dependency | SLA monitoring, due-date tracking, and escalation indicators depend on milestone and status information maintained within the Issue Management process. |
| AD-ISM-009 | Assumption | Users responsible for issue registration, investigation, resolution, and issue administration have the required training and permissions to perform their assigned responsibilities. |
| AD-ISM-010 | Assumption | Issue classification information is sufficiently complete and accurate to support issue investigation, issue correlation, and identification of related issues. |
| AD-ISM-011 | Assumption | Issue relationship management, issue linking, and issue grouping activities are restricted to authorized users in accordance with approved governance policies. |
| AD-ISM-014 | Assumption | Issue history, audit records, communication records, attachments, and relationship records are retained throughout the issue lifecycle in accordance with organizational record retention policies. |

---
## 10.Risks and Mitigations

| Risk ID | Risk Description | Impact | Mitigation Strategy |
|----------|------------------|---------|---------------------|
| RISK-001 | Incomplete or inaccurate issue classification data may affect issue analysis and reporting. | High | Establish classification governance and validation rules. |
| RISK-002 | User adoption of new Issue Management processes may be slower than expected. | Medium | Provide user training, documentation, and stakeholder engagement. |
| RISK-003 | Delays in external system integrations may impact dependent functionality. | Medium | Implement phased integration and identify fallback processes. |
| RISK-004 | Poor data quality during issue registration may reduce reporting and investigation effectiveness. | High | Enforce mandatory fields, field validations, and business rules. |
| RISK-005 | Unauthorized access to issue information may result in compliance or security concerns. | High | Implement role-based access control and audit logging. |
| RISK-006 | Failure to maintain audit history may impact compliance, traceability, and legal investigations. | High | Ensure audit history is automatically maintained and retained. |
| RISK-007 | Critical issues may remain unresolved if escalation processes are not enforced. | High | Implement SLA monitoring and automated escalation notifications. |
| RISK-008 | Loss of supporting evidence or attachments may impact investigations and business decisions. | Medium | Implement document retention and backup procedures. |
| RISK-009 | Incomplete user requirements may result in rework during implementation. | Medium | Conduct regular requirement reviews and stakeholder validation. |
| RISK-010 | Increased issue volume may affect application performance and usability. | Medium | Validate performance requirements and conduct scalability testing. |

## 11. Out of Scope (Phase 1)

| Item | Rationale |
|---|---|
| **AI/ML-based similarity scoring** | Phase 1 correlation uses exact-key matching on System, Sub-system, and Symptom. Probabilistic or semantic similarity scoring (NLP-based) is a Phase 2 capability. |
| **Issue Group Management Screen (ISM0150)** | Group creation is supported in Phase 1 from ISM0020 and ISM0040. A dedicated group detail and management screen is planned for Phase 2. |
| **Cross-Module Correlation (ISM ↔ QIR ↔ TSB)** | Phase 1 correlation is limited to issues within the ISM module. Cross-module correlation capabilities are planned for Phase 2. |
| **Automated Correlation Notifications** | Phase 1 presents correlation suggestions within the ISM user interface only. External notification channel integration is planned for Phase 2. |
| **EWS and GQIS Ingestion Pipeline Implementation** | Integration implementation is addressed within separate integration requirements and design documents. ISM consumes the resulting structured data |
| **Status Transition State-Machine Enforcement** | Phase 1 supports flexible status updates. Restrictive transition enforcement and exception handling are planned for Phase 2. |
| **Configurable Attention Banner Rules** | Attention banner types and thresholds are predefined in Phase 1. User-configurable notification and threshold management is planned for Phase 2 |
---

## 12. Approvals

| Role | Name | Status | Date |
|--------|--------|--------|--------|
| Business Owner | Robert Nguyen( KIA NA )| Pending |  |
| Project Manager | Joon Sung Yoo (HAEA PM)| Pending | |


*End of Document — KPQMS-ISM-BRD-v1.5*.