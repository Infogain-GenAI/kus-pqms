# 17 — Domain Glossary and Business Context
**Tier:** 2
**Status:** DRAFT — pending Yogesh AND Claude review (this file's review
process differs from the others: it is BMAD-authored and was
cross-checked term-by-term against a real implementation of this
product; neither party should treat this version as final)

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
**The domain vocabulary this app implements**, and the authority for
what each term means. Every term below is either implemented in a prior
working implementation of this product (repo `kus-pqms`) or sourced from
the customer's own business artifacts — and each entry says which.
Anything that could not be pinned to a source is in the "Unconfirmed"
section at the end rather than folded silently into the glossary.

**Why the sourcing matters here more than in most glossaries**: this
product's business artifacts describe modules, roles, and entities that
were never built, and a previous planning-level glossary
(`frontend/docs/ai/business-domain-glossary.md`, dated 2026-07-08,
BRD/DRD/HLD-sourced) documented them all as though they were. This file
supersedes it. Terms here are labelled by whether they are
**implemented behaviour**, **committed requirement**, or
**unconfirmed** — because the three are not interchangeable and
conflating them is how fabricated scope enters a codebase.

## How to read the citations
- **"Provenance: `kus-pqms` …"** — this term was implemented and
  working in the prior Vue implementation of this product. The file
  path is given so the claim is checkable. Treat these as the domain
  model the new app implements.
- **BRD/HLD references** — a committed customer requirement, cited to
  the artifact. Binding regardless of whether anything was built.
- **"Unconfirmed"** — named in the section at the end. Not to be
  implemented on the strength of this file.

**One scoping rule that applies to every citation below.** Bare source
paths and filenames in this file — `IssueList.vue`,
`classification.service.ts`, `AppHeader.vue`, `workspace.types.ts` and
the rest — **all refer to `kus-pqms`**, the prior Vue implementation,
under `frontend/apps/pqms-portal/src/`. None of them exists in this
repository. They are cited so a domain claim can be checked against a
working implementation rather than taken on trust; they are never
instructions about where to put anything here (01 owns that). Where a
path points somewhere other than `kus-pqms`, it is written out in
full.

## Prototype register
The designer's prototype HTML is one of only two sources for visual
structure and user-facing copy (the other being this corpus itself).
**This section is the single place any prototype path is recorded.**
Every other file that needs one cites it **by role, through this
register** — never by filename.

| Role | Prototype file | Status |
|---|---|---|
| SE | `requirements/ISM SE Role.html` | Active, under revision |
| *(other roles)* | not yet produced | Planned — one per role |

**These are repo-root paths, not `pqms-portal/`-scoped ones.** The
prototypes live outside `pqms-portal/`, so 00-core-rules.md's
`pqms-portal/`-prefix convention does not apply to this table.
`pqms-portal/docs/requirements/` does not exist — prefixing these paths
would make them unresolvable.

### Updating this register
When the designer renames the prototype, or adds a role-specific one:

- **Edit only the table row above.** Change the path cell; change
  nothing else. No other file in this corpus cites a prototype
  filename, by design, so a rename is a one-cell edit.
- **A new role prototype is a new row, never a replacement.** Add the
  role and its path. Do not overwrite an existing row, and do not
  consolidate rows into a single "latest" reference.
- Nothing in the prose around the table repeats a path, so none of it
  needs rewriting when one changes.

### This file is a moving target, not a frozen artifact
The prototype is **actively being revised by the designer** and has
already been renamed **at least three times**. It is
current-as-of-today, not a fixed reference. **Anyone citing it must
confirm the current filename** rather than assuming a name from an
earlier document, commit, or conversation still resolves. A stale
prototype filename is the most likely broken reference in this corpus.

**Standing note: file modification dates are not evidence of currency
anywhere in this repository.** A `git pull` rewrites the mtime of every
changed file, so a file's modification date records when someone last
pulled it, not when its author last edited it. This applies to every
file in the repo, not just prototypes.

This is recorded because an earlier analysis of this very register
reached a **wrong conclusion** from exactly that inference — ranking
prototype candidates by mtime and treating the most recently stamped
file as the likely current one. It is not a reliable signal here and
must not be used as one. Confirm currency with the person who owns the
artifact instead.

### A second file in the same folder is not a role variant
`requirements/PQMS_SE.html` sits alongside the registered SE prototype
but is **not** a role-specific variant and is **not** in this register.
It is a separate candidate left over from an earlier
prototype-identity investigation, with fewer screens than the
registered file (no QIR Analytics, no Notifications), and that
investigation was never resolved with the designer. `ISM SE Role.html`
is the file this register names as authoritative — a reader who
encounters both files should not simply pick whichever one they see
first.

### Role-specific prototypes are planned — siblings, not replacements
The designer will produce a **separate prototype per user role**. When
a second file lands it is a **sibling** of the SE prototype, not a
successor: the SE prototype remains valid for SE, and the register
gains a row per role as they arrive. Do not treat a newer
role-prototype as superseding an earlier one, and do not consolidate
them into a single "latest" reference — that would discard exactly the
per-role distinction they exist to express.

### Consequence for the permission model
**This question is now resolved with a bigger answer than expected.**
The BRD's real role and permission model (§7.2–§7.4, five roles:
SE/ASM/PQM/ADMIN/VIEWER, a 38-row authorization matrix, server-resolved
permissions per FR-SEC-011) supersedes the prior "is the two-value
capability model complete against NFR-05" open question tracked in
18-project-context-and-implementation-status.md — see
08-authentication-and-authorization.md's "Permission model" for the
rewritten design. If per-role prototypes land showing materially
different screens, actions, or fields, that remains useful confirming
evidence against the BRD's matrix, but the matrix itself — not the
prototypes — is now the authoritative source (BRD §7.2: "the matrix is
authoritative, the capability ordering is not").

## Core Entities

- **Issue** — the central record in Issue Management. Has a `title`,
  `part`, one or more `sources`, one or more `models`/`modelYears`, one
  or more `modelCodes`, a classification (`category`/`part`), and a
  lifecycle `status` (see Status/Lifecycle Values below). Confirmed via
  `api/issues.ts`'s `IssueListItem`/`IssueStatus` types.
- **System Classification** — the category/subsystem/component/symptom
  taxonomy used to classify an Issue. Confirmed real: a dedicated
  `classification.service.ts` calls real `/classification-keys/*`
  endpoints (`systems`, `subsystems`, `components`, `symptoms`), each
  optionally scoped by a parent code for a cascading picker (Issue
  Entry's Step 3), or called with no params to return every value at
  that level (Issue List's filter drawer).
- **Model Code** — a vehicle model-code identifier (e.g. `"MV"`,
  `"NX4"`). Confirmed real in `IssueListItem`'s `models` field: "always
  an array, even when an Issue has exactly one code," rendering as
  plain text for one code or a "{N} MC" popover trigger for multiple.
- **DTC** — **Diagnostic Trouble Code** (BRD/NPQMS-ISM-customized-BRD.md,
  C1.0, draft for ratification, 2026-08-20, Appendix A — Glossary).
  Resolved; the prior placeholder on this expansion is closed. Used
  throughout the codebase (`DtcTypeahead.vue`, `DtcOption`,
  `DtcChipValue`, `dtcCategoryColors`) as a picker/chip value tied to a
  "category" and color, attached to an Issue — consistent with the
  BRD's usage (FR-ENT-007: capture of one or more DTC codes, max 20 per
  issue).
- **Same Existing Issue** — a real, named feature: a panel/modal
  (`SameExistingIssuesPanel.vue`, `SameExistingIssuesModal.vue`,
  `SameExistingIssueCard.vue`) surfacing issues that may duplicate the
  one being entered or edited, used both during Issue Entry and inside
  Issue Details' Edit Issue flow (`SameExistingIssuesSection.vue`).
- **Linked Issues** — a real, named feature: `LinkedIssuesPanel.vue`
  under `IssueDetails/linked/`, plus `LinkedIssueCard.vue` and an
  `IssueLinkSearchModal.vue` for adding a link. Distinct from Same
  Existing Issue: Same Existing Issue surfaces likely-duplicate
  candidates at entry/edit time; Linked Issues is an explicit,
  user-created association between two already-registered Issues.

## Roles & Capabilities

**Superseded by the BRD's real role model.** The prior "real,
implemented" model here (`stores/auth/auth.store.ts`, three roles) was
`kus-pqms`'s shape, not a committed requirement. BRD C1.0 §7.2 commits
to **five** system roles:

- **`SE`** — Service Engineer. `propose` capability — creates,
  investigates, proposes; never approves. Primary issue-entry/day-to-day
  user. Default data scope: "My issues."
- **`ASM`** — **After-Sales Manager / Service Engineer Manager**. A
  deliberate compound title (BRD Appendix A; contradiction X-2 in
  §0.6) — **resolved**, not an unresolved three-way naming conflict.
  The prior conflict tracked here (BRD stakeholder table vs. HLD role
  table vs. `kus-pqms`'s shipped "After-Sales Mgr." label) is closed by
  the BRD's own consolidation: one capability role model with a
  normative organisational-role mapping (Appendix B.1). `override`
  capability. Default data scope: "All issues."
- **`PQM`** — Product Quality Manager. `override` capability, final
  disposition authority. Default data scope: "All issues."
- **`ADMIN`** — System Administrator. `administer` capability — full
  configuration and user management. **New role, not in the prior
  three-role model.**
- **`VIEWER`** — Read-only stakeholder (PQ Department Head, NAQC,
  auditor). `view` capability, all issues, read-only. **New role, not
  in the prior three-role model.**

**Permission model**: the frontend does not reimplement the BRD's
38-row authorization matrix (§7.3) as coarse capability values. It
consumes named permission flags from a server-resolved-permissions
object (FR-SEC-011). 08-authentication-and-authorization.md owns the
full design — see its "Permission model" section. This retires the
prior open question ("are two capability values sufficient against BRD
NFR-05") with a bigger answer: the real model is neither two values nor
a simple four-tier expansion of them, but a full per-action matrix
across five roles.

**The old business glossary's persona list still does not map cleanly
onto this**, but the mapping gap itself is now much smaller. BRD
Appendix B.1 is the normative organisational-role → system-role
mapping: Service Engineer → `SE`; Service Engineer Manager → `ASM`; PQ
Department Head → `VIEWER`; PQ Management (disposition authority) →
`PQM`; Administrator → `ADMIN`; NAQC → `VIEWER`. The old glossary's
`QE`/`TE`/`DE`/`CE`/`DM`/`PM`/`Director` personas and a separate `Admin`
role are not part of this mapping and remain without a confirmed
system-role equivalent.

**`CE` and `DM` remain genuinely open** — not resolved by C1.0. BRD
C1.0 was checked directly (full glossary, Appendix A, and the
role-mapping appendix, B.1) and defines neither term. This is not an
oversight in this file's reading; the terms simply are not in the
consolidated BRD. See "Unconfirmed" below.

## Screens / Workflows

The module list is **Overview, Issue Management, QIR (Management), TSB
(Management), Notifications, Admin** — six modules, matching
07-routing-and-layouts.md's route tree. Of these, **Issue Management is
the substantial one**; Overview, QIR and TSB are single stub screens,
and Admin has no routes yet.

Provenance: this list is confirmed against `kus-pqms`'s
`frontend/apps/pqms-portal/src/router/routes/*.ts` and its
`frontend/CLAUDE.md`, where the same six existed with the same
build-status split.

**Issue Management's screens and sub-areas:**

- **Issue Entry** — the issue-creation flow.
- **Issue List** — the issue-list/grid screen, with a
  `SameExistingIssue/` sub-feature for duplicate-candidate surfacing at
  list level.
- **Issue Workspace** (BRD screen `ISM-WSP`, legacy id `ISM0040`) — the
  per-issue record, in **five sections**: **Detail** (issue, vehicle,
  classification, source evidence, related records, scoring summary),
  **Investigation** (activities, evidence, parts requests, hypothesis and
  suspected root cause), **Resolution** (disposition, linked QIR, root
  cause, countermeasures, closure), **Communication** (internal and
  external comment threads, shared documents), and **History** (activity
  history and audit history, searchable and date-filtered). A
  linked-issues surface and an edit flow sit alongside these sections.
  Source: BRD C1.0 §8.1 and §8.2.

- **Five, not six — and the difference is a real correction.** An earlier
  revision of this entry described a **six-tab** model with a
  `sharing` tab. That was `kus-pqms`'s shipped structure, described
  accurately as the prior implementation, but it was then read downstream
  as current scope — 08-authentication-and-authorization.md carried a
  permission call site for a Sharing tab on the strength of it. **BRD
  C1.0 names no Sharing screen and no Sharing row**; see 08's "The
  Sharing tab: a scope question before a matrix question" for the three
  possible resolutions and why none of them is "pick a matrix row".

- **Two further naming changes from the prior model**, both worth knowing
  because deep links and code identifiers carry the old words: the prior
  `activity` tab is the BRD's **History** section, and the prior
  `overview` tab is its **Detail** section. Scoring is not a section —
  BRD `FR-WSP-006` puts a scoring **summary** in Detail with a link to a
  fuller view, and whether that view is a sixth tab, a sub-route or a
  modal is **[PLACEHOLDER — BRD §8.1 lists `ISM-WSP-S` as a Workspace
  child while §8.2's tab strip lists five sections. Resolved by: a PQM
  ruling. Trigger: before the Workspace shell is built.]**

- **The legacy deep-link remap is now a decision, not a historical
  note.** `kus-pqms` kept a `LEGACY_TAB_REMAP` in
  `workspace.constants.ts` translating an even older 9/10-tab key set
  (`qir`, `disposition` → `resolution`; `actions` → `investigation`;
  `chronology` → `activity`; `scoring` → `overview`). Under the BRD's
  five sections there are **two** generations of keys that no longer
  resolve. **If any external system, bookmark or notification email holds
  a Workspace deep link, a remap is a requirement.** Decide deliberately
  rather than by omission — see 07-routing-and-layouts.md, which owns the
  section-addressing scheme.

**QIR and TSB/Publication exist as concepts an Issue can reference,
ahead of their own screens being built.** Issue Details' Resolution tab
carries a related-QIR section and a related-publication/TSB section.
Provenance: both were real in `kus-pqms`
(`RelatedQirSection.vue`, `RelatedPublicationSection.vue`) while the
top-level QIR and TSB modules were still stubs — so the cross-reference
is the older, better-established half of each concept.

## Backend Services

Six real services exist in `infrastructure/kubernetes/` and
`backend/`, confirmed via `infrastructure/README.md`'s own Docker
table. What each one actually does, to the extent confirmable from
real frontend/infrastructure code:

- **`issue-management`** (port 9091) — confirmed real and consumed
  today: `issue.service.ts` (issues), `assignee.service.ts`
  (`/api/v1/assignees`, the person-directory the portal actually
  reaches). The frontend's catch-all `/api` proxy path routes here.
- **`master-data-management`** (port 8086) — confirmed real and
  consumed today: `master-data.service.ts` and
  `classification.service.ts` (`/classification-keys/*`) both target
  this service via the frontend's `/api/v1/master-data` and
  `/api/v1/classification-keys` proxy paths.
- **`pqms-notification-service`** (port 9095) — confirmed real and
  consumed today: `notification.service.ts`, routed via the frontend's
  distinct `/api/notification` proxy path (its own base path
  convention, `/api/notification/v1`, differs from the other two
  services').
- **`user-management`** (port 8081) — confirmed to **exist** (a real
  `/api/v1/users` API, per `assignee.service.ts`'s own comment) but
  confirmed **unreachable from the frontend today**: that same comment
  states plainly there is "no gateway routing the portal's single
  `VITE_API_BASE_URL`" to it, which is exactly why the assignee roster
  (a thinner, `issue-management`-hosted directory) exists as a
  workaround instead.
- **`pqms-configuration-server`** (port 8888) — confirmed to be a
  Spring Cloud Config Server (per `infrastructure/README.md`'s own
  environment-matrix note referencing "Spring Cloud Config Server's
  native profile documents" and the standard Spring Cloud Config
  Server port). This is configuration-management infrastructure, not a
  business-domain service — no frontend service file references it at
  all.
- **`pqms-workflow-engine`** (port 8080) — confirmed **real but
  explicitly a skeleton**: `infrastructure/README.md` states outright
  "that service is currently a skeleton (see its own README) — don't
  treat it as ready to actually deploy yet." No frontend service file
  references it. Its actual business purpose (workflow/approval
  automation, matching QIR's engineer→manager→coordinator flow
  described in the old glossary) is a plausible inference from the
  name only. No `kus-pqms` service file referenced it, so nothing
  confirms the inference — see "Unconfirmed" below.

## Status / Lifecycle Values

**Eight values, from BRD C1.0 §9.1**, ratified as `DEC-01`. This is the
customer's signed business vocabulary and it is the only lifecycle
vocabulary this app has. 02-typescript-standards.md carries the union's
declaration; this file carries what each value means.

| Value | Label | Meaning | Terminal? |
|---|---|---|---|
| `OPEN` | Open | Newly registered; not yet under active investigation. | No |
| `INVESTIGATING` | Investigating | Investigation is actively in progress. | No |
| `MONITORING` | Monitoring | The condition is being observed over time rather than actively investigated. Carries a monitoring frequency and a next review date. | No |
| `QIR_ESCALATION` | QIR Escalation | The issue has entered the QIR escalation process. | No |
| `TOP_ISSUE` | Top Issue | Escalated to the Top Issue process. | No |
| `RESOLVED` | Resolved | Resolved through countermeasure, publication or other corrective action. | No |
| `OUT_OF_SCOPE` | Out of Scope | Does not belong to PQMS — Safety, Regulatory, or another department. Carries a receiving department. | **Yes** |
| `CLOSED` | Closed | Investigation concluded, or the reported condition is not an actual issue. | **Yes** |

**Terminal means terminal.** Reopen is out of Phase-1 scope (`DEC-12`),
because it needs a records-retention ruling on whether a reopened issue
is the same record or a successor and nobody has asked Legal. Until then
the correct response to "this was closed in error" is a **new issue
linked to the closed one**.

### This replaces a ten-value set, and the difference is not cosmetic
An earlier revision of this section documented **ten** lowercase values
from `kus-pqms`'s `api/issues.ts` — adding `draft` and `pendingApproval`
to the eight above, and using `escalated` where the BRD has
`QIR_ESCALATION`. That set was real, shipped code. It was **not** a
committed requirement, and per 00's Source precedence the BRD governs
which states an issue may occupy.

The two dropped values are dropped **with** their mitigations, not left
as gaps:

- **`draft`** modelled the entry form's working copy. Under C1.0 that is
  an **entry draft** (BRD `FR-ENT-030`…`034`): a per-user, server-persisted
  copy of the form with no Issue ID, invisible in every list, count,
  export and search, purged at 30 days. It is a different entity, not a
  status.
- **`pendingApproval`** modelled a status change awaiting sign-off. Under
  C1.0 approval is a property of the **transition**: a gated transition
  creates a `PROPOSED` lifecycle record and the issue's own status is
  unchanged until an `override` role approves it (BRD `§9.4`).

**Do not reintroduce either as a status to model those cases.** A `draft`
member puts a non-record in the same vocabulary as a record; a
`pendingApproval` member makes the BRD's `§9.3` transition matrix
unrepresentable.

**The "V5 mockup" references are retired with the ten-value set.** They
came from `api/issues.ts`'s own comments, naming a version rather than a
file, and whether "V5" was a prototype version or a separate artifact was
never established. Nothing now depends on the answer.

## What was corrected or dropped from the old glossary, and why

- **"CAPA" is unverified and unresolved — not carried forward, but not
  proven fabricated either.** Correcting an over-claim in an earlier
  revision of this file, which called it "confirmed fabricated" and
  attributed that conclusion to the old glossary. The old glossary does
  not draw that conclusion. What it states directly is the absence:
  "No 'CAPA' module appears anywhere in the BRD, DRD, or HLD documents
  (zero text matches across all three)" — and then explicitly declines
  to resolve it, saying it "is flagged as an **assumption requiring
  clarification** rather than resolved here," and listing three live
  possibilities: that "CAPA is planned business scope not yet captured
  in these artifact versions," that it is "a generic architectural
  placeholder using industry-standard terminology (Corrective and
  Preventive Action)," or that "the package name should be reconciled
  with one of the modules above (most likely QIR Management)."

  Where it does appear is `frontend/docs/architecture/security/
  authentication.md`'s target monorepo structure, as a
  `packages/features/capa/` package. So the accurate statement is:
  absent from all three business artifacts and from every line of
  `kus-pqms`, present only in one target-architecture doc, and
  **unresolved between
  planned-scope and placeholder** — needs Yogesh to say which, which is
  why it also appears under "Unconfirmed" below rather than being
  closed here. Not carried forward into this glossary, because a term
  nobody can define is not a domain term yet — but "don't carry it
  forward" is a scoping decision, not a finding of fabrication.
- **"Publication Management" is real business scope, not fabricated —
  corrected from an earlier, too-broad flag.** An earlier investigation
  (checking only routes/CLAUDE.md/standards files) flagged "Publication
  Management" alongside "CAPA" as having zero trace anywhere. That was
  too broad: the BRD/DRD/HLD-sourced glossary documents it as a real
  Phase-1 business module (TSB authoring/lifecycle), and `kus-pqms`
  referenced "Publication" and "TSB" as live concepts (the Resolution
  tab's `RelatedPublicationSection.vue`, and a real `tsb` route). What
  has never been built is a *standalone* Publication Management screen
  beyond the TSB stub — a build-status gap, not fabricated scope, and
  this file corrects the earlier over-broad flag rather than repeating
  it.
- **QE, TE, DE, CE, DM, PM, Director, and a separate `Admin` role are
  dropped from the active glossary** — none appeared in `kus-pqms`'s
  `Role` type, capability map, or any UI label. They may be real,
  planned future personas (the old glossary is a planning artifact, not
  a claim about what was built), but this glossary documents the
  implemented model; see "Unconfirmed" for how to treat them.
- **The Data Model section (USER/ROLE/FEATURE tables, ISSUE_LINK,
  SUGGESTED_ISSUE_LINK, per-source-channel tables, etc.) is not carried
  forward at all** — none of it was ever checked against a real backend
  schema (out of scope: this glossary cross-checks against
  frontend/infrastructure sources, not backend database schemas), so
  including it here would repeat the old glossary's unverified-claim
  problem rather than fix it.

## Unconfirmed / needs Yogesh input

- ~~**DTC**: expansion unconfirmed~~ **Resolved.** BRD C1.0 Appendix A
  defines DTC as "Diagnostic Trouble Code." See "Core Entities" above.
- ~~**`ASM`'s spelled-out meaning conflicts across three real sources**~~
  **Resolved.** BRD C1.0 Appendix A gives `ASM` as "After-Sales Manager
  / Service Engineer Manager" — a deliberate compound title, not a pick
  among the three prior conflicting expansions (contradiction X-2 in
  §0.6). See "Roles & Capabilities" above.
- **"CAPA" — planned scope, or an architectural placeholder?** Zero
  text matches across the BRD, DRD, and HLD, and zero trace in real
  code; its only appearance is as a `packages/features/capa/` package
  in `frontend/docs/architecture/security/authentication.md`'s target
  monorepo structure. The old glossary flagged this as "an assumption
  requiring clarification rather than resolved here." It remains
  unresolved: needs Yogesh to say whether CAPA is real planned business
  scope not yet written into the artifacts, generic industry
  terminology (Corrective and Preventive Action) that entered a
  structure diagram by habit, or a name that should be reconciled with
  QIR Management. Until then it is neither a domain term nor a
  confirmed fabrication. See "What was corrected or dropped" above.
- **`CE` and `DM` each conflict between two real sources, the same
  defect class as `ASM` above — not merely "personas with no code
  trace."** Both appear in the HLD's role table
  (`frontend/docs/artifects/PQMS-HLD-08JUN2026-2.md` §6.2.3) *and* in
  the old business-domain glossary's persona list, with materially
  different meanings in each:
  - **`CE`** — the HLD says **"Communications Editor,"** described as a
    "Technical Communications / Publications Engineer responsible for
    TSB authoring, multi-team review coordination, and publication
    management." The old glossary says **"Component Engineer,"**
    described as "mostly read-only access across ISM screens;
    component-level review." These are not two labels for one job: one
    authors and owns TSB/publication lifecycle, the other is a
    read-only reviewer. The expansion *and* the scope both conflict.
  - **`DM`** — the HLD says **"Department Manager,"** described as a
    "Senior management role responsible for final approval authority on
    QIRs and TSBs, KPI review, and escalation management." The old
    glossary gives no expansion at all and describes it as a
    "limited-access reviewer role," noting the abbreviation "appears in
    the DRD's access matrix without a full spelled-out definition in
    the BRD's stakeholder table — flagged as needing clarification."
    So one source supplies a name and top-of-hierarchy approval
    authority; the other supplies no name and minimal access. This is
    the sharpest authority-level conflict of the three, `ASM`
    included.

  **Still open — not resolved by BRD C1.0.** BRD C1.0 was checked
  directly for both terms (its full glossary, Appendix A, and its
  role-mapping appendix, B.1) and defines neither `CE` nor `DM`. Unlike
  `ASM`, which C1.0's consolidation explicitly closed, these two simply
  don't appear in the consolidated document — so this is not a case of
  "check a newer source and the conflict resolves itself." Needs Yogesh
  to confirm both, for the same reason as before: this glossary should
  not silently pick one reading among two. Note the additional caveat
  that four rows of the HLD table (`CE*`, `ASM*`, `DM*`, `PQM*`) carry
  an asterisk whose meaning is **not explained anywhere in that
  document** — so it cannot be determined from the HLD whether those
  four rows are current, proposed, or phase-2. That unexplained marker
  covers both roles above and `ASM`'s pre-C1.0 conflict.

  Tracked in 18-project-context-and-implementation-status.md; that
  entry points here for the detail, which is what this record
  supplies.
- **`pqms-workflow-engine`'s actual business purpose is unconfirmed.**
  It's real infrastructure (a Kubernetes manifest and Dockerfile exist)
  but explicitly a skeleton with no frontend consumer yet. This file's
  "matches QIR's approval flow" note is a plausible guess from the
  service's name only, not a verified fact — needs confirmation once
  the service has real functionality to check against.
- **QE/TE/DE/CE/DM/PM/Director/Admin (business personas with no code
  trace)**: are these still-planned future roles (in which case they
  belong in this glossary as explicitly future/unimplemented), or
  stale business-planning language superseded by the real
  `SE`/`ASM`/`PQM` model? Needs Yogesh to say which, since the answer
  changes whether future RBAC work should expect more roles to be
  added later. **For `CE` and `DM` this is the second of two open
  questions, not the only one** — see their conflict entry above; a
  "still planned" answer for either is incomplete until it also says
  *which* of the two conflicting definitions is the planned one.
- **Whether "QE (Quality Engineer)" in the old glossary and the real
  `SE` role are the same persona renamed, or two different roles**,
  given `SE`'s real UI label is "Service Eng./Service Engineer," not
  any variant of "Quality Engineer." Stated as an open question, not
  resolved here.
