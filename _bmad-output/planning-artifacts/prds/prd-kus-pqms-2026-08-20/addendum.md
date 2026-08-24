# PRD Addendum — N-PQMS Issue & Signal Management (ISM)

Technical-how and reconciliation depth extracted from the reference HLD/BRD/design that does **not** belong in the capability-level PRD. Purpose: feed the (deferred) **architecture** artifact so it need not re-derive this. Everything here is *reference input from the existing HLD v1.5 / BRD v1.5*, to be re-decided on the new tech stack — not a commitment.

> Reminder: the rebuild targets a **new technology stack**; the concrete products named below are what the *existing* HLD documents. Treat them as prior art and constraints-to-consider, not as the chosen stack.

## 1. Reconciliation ledger (design = canonical)

### Roles
| Canonical (design/PRD) | HLD/BRD term | Notes |
|---|---|---|
| SE — Service Engineer (`read` = own-scope, create/edit own + propose) | SE (Read/Write) | HLD/BRD give SE full R/W on own issues; "read" is a capability flag (no approve/override, own-scope), **not** read-only. |
| ASM — After-Sales Manager (`override`) | SEM — Service Engineer Manager | Approves status changes, parts (Priority/Emergency), classification values; all-scope. |
| PQM — Product Quality Manager (`override`) | PQDH — PQ Department Head | Final disposition/escalation authority; all-scope. |
| Administrator | OPSADM — Operation Admin | User/role/feature admin, master-data deactivation + hierarchy config. **In HLD, OPSADM is read-only on issues** — confirm. |
| *(out of ISM scope)* | PUBCOO, PUBTO | Publication roles. |
| *(out of ISM scope)* | EXTKGA, EXTKMX, EXTKHQ, EXTNAQ, EXTHAT | External plant/partner roles (Kia Georgia/Mexico/HQ, NAQC, HATCI). |

HLD ships an example **role × feature matrix** (R / R-W / Approve / Edit* / —), where `Edit*` = override edit with mandatory justification (audit-logged). The new build should reproduce a role × feature × element permission matrix (see §5 RBAC).

### Lifecycle
Canonical: **Draft → Open → In Review → Pending Approval → Disposed / Monitoring → Closed / Escalated.**
HLD full set: Open, Investigating, Monitoring, QIR Escalation, Top Issue, Resolved, NASO, Closed, ReOpen — with approval modeled as `status_of_change` (Pending/Approved/Rejected) **on the transition record**, not as an issue status.
Mapping applied in PRD: In Review ≈ Investigating; Pending Approval = the approval gate (HLD's transition-pending); Disposed = terminal disposition (sub-outcomes Resolved, No-Action [NASO]); Escalated = QIR Escalation + Top Issue; Closed = soft-close (reopenable). **Open Question 1** tracks confirmation.

### Other conflicts resolved
- **Default list sort**: HLD "Severity Score descending" (score-driven) → PRD uses **Date Reported descending** (scoring out of scope).
- **Document size**: HLD self-contradicts ("25 MB/file ×10" vs "1 GB cap") → PRD picks **25 MB/file, max 10** (consistent with ISM0020).
- **Virus scan**: absent in HLD DM0010 → PRD **requires** it (BRD NFR-ISM-016).
- **HLD screen-ID collisions** to fix in the new build: UM0030 used for both "Manage Role" and "Role Expiry"; UM0050 for both "Feature" and "Feature Element"; UM0010 for both "Manage User" and "Expert Group"; §4.2.1 body says "ADM0200" while heading says "ISM0200".

## 2. Existing tech stack (HLD v1.5 — prior art, re-decide on new stack)
- **Runtime/deploy**: AWS, EKS (Kubernetes), multi-AZ active-active, auto-healing. CI/CD quality gate: 100% unit-test pass / 90% code-quality.
- **Workflow/BPM**: Camunda — drives status-change approvals and routing; a workflow instance is initiated synchronously on issue submit (state=Open).
- **Identity**: Azure AD (internal SSO, OAuth2/OIDC via KDP) + Azure AD B2C (external dealers, via KDealer Plus federation). PQMS issues its own JWT (default 30-min refresh); MFA enforced by Azure AD; PQMS never sees passwords.
- **Object storage**: AWS S3 for documents (`/pqms/dm/documents/{issue|qir|tsb}/{ref-id}`).
- **Messaging**: an `issue-correlation-queue` (queue listener) for async suggested-link processing and owner notification.
- **Analytics/CDO**: Redshift (async batch).

## 3. Integrations (existing INT-xx)
| Ref | System | Purpose | Notes |
|---|---|---|---|
| INT-01 | AS400 / HISNA | Model/vehicle master sync | ISM manual CRUD is override/fallback; vehicle master owned externally (AD-ISM-002). |
| INT-02 | GQIS | Inbound issue submission (REST) | Bulk ingestion pipeline deferred. |
| INT-03 | (classification source) | Classification keys | Governed in ISM. |
| INT-04 | SAP BW/4HANA (+ SAP ERP) | Live parts lookup (number/desc/cost) | Snapshot stored on parts request. |
| — | Siebel/DMS, EWS, Weibull, etc. | Source channels | Channels: Warranty, Weibull, Comeback, Techline, FPQR, EWS, GQIS. |

## 4. Resilience defaults (HLD §6.2 — verbatim, re-decide)
- **Internal APIs**: request timeout 5 s (10 s for search/list); up to 3 retries, exponential backoff (200 ms, 800 ms) on HTTP-5xx/timeout only (never 4xx); circuit breaker opens after 5 consecutive failures within 30 s, half-open retry after 15 s; **all mutating endpoints (POST/PUT/DELETE) require and honor an idempotency-key header.**
- **External**: AS400/HISNA, GQIS, Siebel/DMS timeout 10 s; SAP BW/4HANA & SAP ERP timeout 15 s; AS400 3 retries backoff 1 s/4 s/16 s; SAP 2 retries; external circuit breaker opens after 5 failures, half-open after 60 s; CDO (Redshift) async batch — failed batch re-runs next cycle, no mid-batch retry.

## 5. RBAC / access model (existing)
- Permission resolution chain: **token claims → role lookup → feature permission map → element-level grant.** Multi-role users supported.
- Entities: USER, ROLE (role_type KUS/EXT), FEATURE (screen), FEATURE_ELEMENT (button/field/action), ROLE_FEATURE_MAP (element_ids as JSON), USER_ROLE_MAP, USER_HIERARCHY (span-of-control), plus EXT_USER/EXT_ROLE/EXT_USER_ROLE_MAP for external users.
- **Two-track user model**: internal users fully managed in UM (USER + USER_ROLE_MAP); external users have **no PQMS admin user record** — identity in Azure B2C, role pre-assigned at invite, scoped by model code/factory, no admin-screen access, auto-deactivate at expiry + 24 h.
- Role-expiry CRONs: `AUTO-ROLE-DEACTIVATION` (internal, T-14d admin alert), `AUTO-ROLE-DEACTIVATION-EXTERNAL` (external, expiry + 24 h). Admin force-expire JWT effective within one refresh cycle (≤ 30 min).
- Access log: every UI-resource click → PQMS_ACTIVITY_LOG (immutable, exportable PDF/XLSX; viewable by OPSADM + PQDH).

## 6. Correlation mechanism (existing)
- Real-time (entry): lookup against `ISSUE_COUNT_SUMMARY` by classification keys (System/Sub-system/Component/Symptom); candidates surface in the Correlation Detection Panel once Symptom is selected — non-blocking.
- On link: current + suggested issue stored in `SUGGESTED_LINKED_ISSUE`; a request posts to `issue-correlation-queue`; listener notifies **both** owners; the existing issue's owner approves → promotes to `LINKED_ISSUE`.
- Hierarchy: 1-level parent-child implemented; link records carry immediate parent, child, and **root** references (root retained for future N-level); issue-group auto-created as a data relationship only.

## 7. Deferred: multi-source bulk ingestion (ISM0310) — documented, out of scope
- Bulk-load potential issues from per-channel CSV (header validated against a channel format definition).
- Two jobs: **File Poller** (polls channel folder → moves to `/pqms/issuefiles/{channel}` → `ISSUE_FILE_LOG` STATUS=NEW) and **File Processor** (parses/validates/transforms each record → creates ISSUE at STATUS=Open, bypassing Draft; `source_file_id` back-reference for load audit).
- File lifecycle: [NEW|REPUSH] → INPROGRESS → [PROCESSED|FAILED|PARTIAL-PROCESSED] → ARCHIVED (+ PURGED, FORMAT_ERROR). Header mismatch → FORMAT_ERROR; per-record failure counted and skipped.
- Manual load path reuses the same `processFile`/`processRecord` logic. De-dup logic not defined; archiving/purging/REPUSH marked TBD.

## 8. API inventory (existing, ~127 internal APIs — for architecture)
- **In-scope groups**: Master Data (classification CRUD + approve/reject `/master/classificationkey`; model CRUD `/master/model...`; valid-values `/master/validvalue...`; lookups: VIN, DTC, model/year/variant, dealer, parts search, id-type-values); **User & Access Mgmt** (~33 under `/api/v1/um/...`); **Auth** (`/auth/token`, `/auth/tnc-accept`, `/auth/signout`); **Notification** (count summary, history, send-email, mark-read under `/nm/...`); **Document** (upload/remove/update-metadata/list under `/pqms/dm/...`); **Audit/Activity log** (`/pqms/admin/activitylog`, `/pqms/admin/auditlog`).
- **Out-of-scope groups present in the same table** (do not build as ISM FRs): Issue Score/override/rescore, Issue Groups, QIR, and per-source-channel composite upserts beyond attribution.

## 9. Entry/workspace mechanics (existing detail)
- Issue ID: `system-code + "-" + YY + 4-digit sequence`. Auto-save every 5 min + on-demand (upsert as Draft). Submit initiates Camunda instance (state=Open) synchronously.
- Post-submit: form read-only except override roles, who must supply a non-empty JUSTIFICATION → audit.
- Parts request status job: Routine auto-approve within 24 h (job), Priority/Emergency require SEM/ASM approval.
- Communication log: entry types Internal/External/Email (email auto-captured); immutable (admin soft-hide only); `@mention` validated → notification side effect.
- Monitoring status captures max-occurrence, frequency, next-review-date inline before submit.

## 10. NFR gaps to resolve (not in any source)
- No availability/uptime %, RTO, or RPO in the HLD (only qualitative multi-AZ HA); BRD gives ≥99.5% business-hours availability — no RTO/RPO.
- No numeric retention period for audit history, communication log, or documents anywhere — must be set by the PRD/data-governance owner (PRD Open Question 5).
