---
doc_type: plan
spec_id: infogain-pilot-guide
phase: todo
priority: P0
created: 2026-06-04
owner: "@diane"
---

# DocHub Phase 1 Pilot Guide — Infogain

**Audience:** Infogain pilot team migrating legacy Java + XPlatform + Oracle to Java Spring Boot + React + PostgreSQL.

---

## 1. Why DocHub (and why markdown over Word/PPT)

DocHub will be the **primary Git-based documentation platform** for this project because:

**The migration you're doing is exactly the kind of project that benefits most from AI-assisted documentation:**
- You have **a lot** of old code (legacy Java + XPlatform) that needs to be understood before it can be rewritten
- You have **a lot** of target code (Spring Boot + React) that needs to be specified before it can be written
- You have **incremental database moves** (Oracle → PostgreSQL, table by table) that need careful tracking

AI tools are exceptionally good at reading clean structured text and helping with the heavy lifting (analyzing old code, generating Spring Boot stubs, writing React components, comparing schemas). But they need text, not PowerPoint.

### Why markdown over Word / PPT / Excel

| | Word / PPT / Excel | Markdown |
|---|---|---|
| AI compatibility | Binary metadata noise — AI struggles to parse | Plain text — AI reads it natively |
| Version control | Binary blob — can't diff, can't merge | Git-tracked, line-by-line diffs |
| Focus | You spend time formatting boxes | You spend time on content |
| Diagrams | PPT shapes | Mermaid.js (text-based, AI generates + reads them) |
| Stakeholder export | Native format | Export to PDF / HTML / DOCX from DocHub |

**For this project specifically:**
- An as-is doc capturing an old Java service can be **fed to Claude Code** in the scaffolded project repo → Claude reads the spec, writes the Spring Boot equivalent
- An as-is-schema doc capturing an Oracle table can be **fed to Claude** → it generates the PostgreSQL schema + a data-migration plan
- A design doc for a React component can be **fed to Claude** → it scaffolds the component

DocHub's job is to make those input docs structured enough that the AI part works well.

### We are in Phase 1 though..

If DocHub has issues or bugs (and it will — this is Phase 1), you can always fall back to using git directly. The docs are markdown files in a Gitea repo. Clone the repo, edit in VSCode, commit, push. HAEA will fix DocHub bugs fast — flag them to Diane at dianekim@haeaus.com (see §8).

---

## 2. Getting Started

### Logging in

1. Open https://dev.dochub.h-aws.com
2. Click **Sign in with SSO**
3. Authenticate via Azure AD (your HAEA AD account)
4. You'll land on the project picker

If SSO doesn't show: hard refresh (`Ctrl+Shift+R`). If still missing, ping Diane.

### Finding your project

- Top-left global project picker → select **KPQMS(PQMS Test)** (or whichever project name is assigned)
- The sidebar reflects the chosen project — switch the picker to switch context => Later you can switch over to DocHub-Feedback to leave comments or questions about this DocHub.

### Sidebar overview

```
PORTAL
  Overview              ← Project landing
  Analytics             ← Status across phases
  Phase Gates           ← Phase readiness
  Traceability          ← Doc-to-doc links
  Findings              ← AI audit rollup (NEW this week)

MANAGEMENT
  Doc Manager           ← Browse, filter, bulk actions
  Issues                ← Open issues / blockers
  Reviews               ← Submitted-for-review queue
  Decisions             ← ADRs and architectural decisions

TOOLS
  Sign-Off              ← Approval workflow (not deployed in Phase 1)
  Jobs                  ← Background-job tracker
  Activity              ← Project activity log
  Prompt Lab            ← AI prompt tuning (admin)
  Settings              ← Project / user settings

HELP                    ← Role-based feature guide
EXTERNAL
  Docs Site             ← Public-facing Docusaurus site
  Gitea                 ← The underlying git repo (advanced users)
```

---

## 3. Document Types — for your migration

DocHub has 22 doc types across 6 SDLC phases. For your migration project, the ones you'll use most are:

### Documenting the legacy (Phase 0)

| Doc type | When to use | Example for your project |
|---|---|---|
| **as-is** | High-level capture of an existing module or screen | "Old Customer Management module — current architecture overview" |
| **as-is-detail** | Detailed walkthrough of legacy business logic | "OrderProcessing.java — full method-by-method analysis" |
| **as-is-schema** | Oracle schemas being migrated | "T_USER table — columns, FKs, indexes, sample data" |

### Defining the migration (Phase 1)

| Doc type | When to use |
|---|---|
| **brd** | What's being migrated and why. Business goals, scope, success criteria |
| **sla-nfr** | Non-functional requirements: performance targets, uptime, etc. |
| **gap-analysis** | Where the legacy doesn't meet new requirements |

### Designing the target (Phase 2)

| Doc type | When to use |
|---|---|
| **design** | Target architecture — used for BOTH backend (Spring Boot) and frontend (React). Recommend separate design docs per layer |
| **data-model** | PostgreSQL target schema for the tables being migrated |
| **adr** | Architecture decisions (e.g., "why Spring Boot 3.x over Quarkus") |
| **ux-design** | React component UX flows |
| **security-design** | Auth, permissions, data protection design |

### Specifying the implementation (Phase 3)

| Doc type | When to use |
|---|---|
| **spec** | Detailed implementation specs — per Spring Boot endpoint, per React component |
| **interface** | API contracts between Spring Boot and React |
| **integration** | How the new system integrates with what remains (still-Oracle tables, external services) |

### Testing + migration (Phase 4 + 5)

| Doc type | When to use |
|---|---|
| **test-plan** | Regression tests — proves new path matches old behavior |
| **dev-log** | Developer notes during implementation (Claude can read this) |
| **data-migration** | Per-table Oracle → PostgreSQL migration plan with rollback |
| **deployment** | How the migrated piece gets deployed alongside legacy |
| **runbook** | Operational procedures for the live hybrid system |

### Cross-phase

| Doc type | When to use |
|---|---|
| **meeting-minutes** | Decision-capturing notes (NOT auto-audited) |
| **pcr** | Project change requests |

**Avoid duplicating docs in email or Teams.** 

---

## 4. AI features — Ask, Agent, Knowledge

The AI drawer on the right has three tabs.

### Ask (everyone)

Type a natural-language question about your project; the AI answers using your project's docs as context.

**Good questions for your migration:**
- "What does the OrderProcessing module currently do?"
- "Which Oracle tables haven't been migrated yet?"
- "Summarize the design decisions for the Customer service"
- "What's the test-plan coverage for the User module?"

**Cost:** Each Ask call uses Bedrock (Claude Sonnet). It's relatively cheap — use it freely. **Estimated cost: ~$0.01–0.05 per question.** For a project budget of $X/month, that's roughly N questions/day per team member without breaking the bank.

### Agent (admin-only in Phase 1)

Multi-step AI agent that can plan + execute tasks. Hidden in Phase 1 because it uses ~10× more Bedrock tokens than Ask. If you need Agent-style behavior, run Claude Code locally on the scaffolded project repo with your own LLM credentials.

### Knowledge (everyone)

Browse project knowledge derived from documents. Status panel shows how much has been ingested.

### Known Phase 1 gaps

- **Document indexing is not deployed in Phase 1.** The "Index error" message on the Ask panel is cosmetic — Ask still works, but with less semantic context. Will be enabled in a later phase.
- **Sign-Off is not deployed.** The button exists but the service isn't running. Don't use it.
- **AI Agent is hidden** (admin-only). See above.

---

## 5. Workflows — step-by-step

This section walks through the core workflows you'll use daily. Phase 1 has rough edges — each step calls out what works, what's confusing, and the workaround when something doesn't behave as expected.

### 5.1 The daily document workflow

The standard cycle: **Create → Edit → Save → Trigger Audit → Review findings → Submit → Approve**. Here's each step.

#### Step 1 — Create a new doc

1. First go to "Overview" then click on project portal, then click the **SDLC Pipeline** tab (first tab in the row)
2. Scroll to the phase you're working in (e.g., **Phase 1: Requirements** for a BRD, **Phase 0: Discovery** for an as-is doc)
3. Find the doc-type card you want (e.g., "Business Requirements")
4. Click **+ New** on the card
5. DocHub auto-assigns an ID (`BRD-001`, `BRD-002`, `MIG-001`, etc.) and opens the editor

**Alternative path:** Doc Manager (left sidebar → Management → Doc Manager) → also has a "+ New" button.

#### Step 2 — Fill in frontmatter and content

You're now in the editor. Two parts to a doc:

- **Metadata row** (top of the page) — ID, Type, Status, Priority, Owner. The fields are pulled from the YAML "frontmatter" at the top of the underlying markdown file. Click **[Metadata]** for the full panel with more fields.
- **Body** — the markdown content below the metadata row. Use the toolbar (bold, italic, lists, tables, links, images) or type markdown directly. **Mermaid diagrams**, **Excalidraw drawings**, and **embedded tables** all supported via the **Diagram & Tool** dropdown.

**Section headers matter.** Each doc-type has expected sections (e.g., a BRD expects `## Overview`, `## Functional Requirements`, `## Acceptance Criteria`, etc.). If you skip a required section, the structural validator will flag it.

> **Note — strict section names:** The validator wants exact header text. If your imported legacy doc has `## 6. Functional Requirements — TSB Publication Management`, it will flag `## Functional Requirements` as missing because it doesn't substring-match. **Workaround:** use the bare expected names (e.g., `## Functional Requirements`) and put the qualifier inside the body if needed.

#### Step 3 — Save

The save action is **not obvious** — heads up:

- Look at the **right edge of the metadata row**. You'll see 7 small icons. The 5th one is **Save Draft** (it's greyed-out unless you have unsaved changes).
- **Easier:** press **Ctrl+S** (or Cmd+S on Mac).
- When dirty, the save icon highlights. Click it (or Ctrl+S). The save commits directly to the project's Git repo.

> **Note — save icon is non-obvious:** Unlabeled icon among 7 similar-looking icons. **Workaround:** Use Ctrl+S; build the muscle memory.

**What happens behind the scenes when you save:**
- The file is committed to your project's Git repo (main branch)
- A **structural validation audit** runs automatically (~1 second) — checks frontmatter, required sections, links
- Findings (if any) appear in the **Findings panel** (see Step 4)
- The doc's `modified_at` timestamp updates

**What does NOT happen automatically:**
- The LLM-based AI audit (the Bedrock call that produces qualitative feedback) does **not** run on save in Phase 1. See Step 4 for how to trigger it.

#### Step 4 — Trigger the AI audit

This is the **biggest surprise in Phase 1.** AI feedback doesn't appear automatically when you save.

There are two ways to trigger it:

**Option A — Submit for Review (recommended):**
1. Click the green **Submit for Review** button (top right of the doc page)
2. This changes status from Draft → In Review **and** triggers the AI audit pipeline
3. Wait 30–60 seconds (Bedrock call running in background)
4. Refresh the page → audit badge appears in the metadata row → click it to open the Findings panel

**Option B — Manual Re-audit:**
1. Find the **audit badge** in the metadata row (it appears once any audit has run, even structural)
2. Click the badge → **Findings panel** slides in from the right
3. Click **Re-audit** at the top of the panel
4. Wait 30–60 seconds
5. **No progress indicator will appear** — you have to guess. Refresh after a minute, and new findings should show up alongside the structural ones.

> **Note — Re-audit has no progress feedback:** Click → nothing visibly happens. **Workaround:** wait 60 seconds, then refresh the panel. You'll know it worked when the total finding count increases. Check the JobBell (top-right bell icon) for confirmation if it doesn't increase.

> **Note — audit badge invisible on never-audited Drafts:** If you saved a fresh Draft and the structural validator hasn't produced findings (rare; usually it finds missing sections), there may be no badge to click — no UI path to trigger the first LLM audit. **Workaround:** click Submit for Review; it triggers the audit pipeline automatically.

#### Step 5 — Review findings

Open the **Findings panel** by clicking the audit badge in the metadata row. The panel has two sections:

- **Structural Validation** — deterministic checks (missing required sections, missing required frontmatter fields, broken links). Auto-runs on save. Fast.
- **AI Audit findings** — qualitative LLM-generated feedback (severity: critical / major / minor; category: completeness / consistency / clarity / correctness / security / traceability). Each finding has the issue text and a recommendation. Only appears after you trigger Re-audit or Submit for Review.

> **Note — "Audit findings" panel mixes both sources** under one label. The structural ones show up immediately; the LLM ones only after explicit trigger. Pilot users have asked "why is my audit only saying 'missing section' over and over?" — the answer is they're only seeing structural results.

For each finding, you can:
- **Acknowledge** — "I've seen this, will deal with it later" (still counts as open)
- **Dismiss** — "Not applicable / wrong / won't fix" (with optional reason)
- **Resolve** — "I fixed this in the doc" (will re-check on next audit)

Findings that disappear on re-audit are auto-resolved.

### 5.2 Submit for Review and Approve

Once your doc is in good shape:

#### Submit for Review

1. Click the green **Submit for Review** button on the doc page
2. DocHub creates a separate Git branch (`review/{phase}/{doc-id}`) and a Pull Request in Gitea
3. The doc status changes from Draft → **In Review**
4. The PR is visible in two places:
   - **DocHub Reviews page** (sidebar → Management → Reviews) — the friendly view
   - **Gitea** (external link → Gitea) — the raw git view with line-by-line diff

#### Approve

If you're an admin or project owner:

1. Open the doc (or go to the Reviews page)
2. Click the green **Approve** button (top right)
3. The PR gets merged to main automatically
4. Status changes from In Review → **Approved**

> **Note — Approve button re-enables after refresh:** You click Approve → button greys out (correct) → refresh the page → button is active again → if you click it again you get an error `Cannot approve: current status is 'Approved'`. The first click worked. The error is misleading. **Workaround:** Trust the first click. Refresh and check the status badge to confirm.

> **Note — no live progress on Approve:** Similar pattern to Re-audit. The Approve action runs server-side (merges the PR, updates DB, triggers post-approval audit if enabled). You may need to refresh to see the new "Approved" status.

After approval, a fresh AI audit runs automatically on the approved version (if `audit_on_approval` is enabled). New findings appear in the Findings panel.

### 5.3 Migration project workflow

For Infogain's specific use case — documenting legacy Java/XPlatform/Oracle and planning the migration to Spring Boot/React/PostgreSQL — there are some doc types and patterns you'll use more than others.

#### Document the legacy first (Phase 0)

For each major module or system in scope:

1. **Create an `as-is` doc** — high-level overview of the existing module. Use the SDLC Pipeline → Phase 0: Discovery → As-Is card → **+ New**.
2. **Create `as-is-detail` docs as needed** — detailed walkthroughs of legacy business logic, file by file or service by service. These get long; the editor handles 100+KB docs fine.
3. **Create `as-is-schema` docs for Oracle tables** — one per major table or schema area. Capture column definitions, indexes, FKs, sample data, and known quirks.

**These doc types skip AI audit** by design (Phase 0 docs are factual snapshots, not editorial artifacts). You won't see severity findings on them. The structural validator still runs.

#### Capture what's being migrated (Phase 1)

1. **`brd` (Business Requirements Document)** — one per major scope unit. Captures business objectives, success criteria, scope boundaries.
2. **`sla-nfr`** — non-functional requirements (performance, uptime, security).
3. **`gap-analysis`** — explicit deltas between legacy capability and target requirements.

These DO get AI-audited. Expect ~10–30 findings per BRD on first audit, mostly in the **completeness** category (missing acceptance criteria, missing definitions).

#### Design the target (Phase 2)

1. **`design`** — architecture for the target system. For Infogain, you likely want two: a backend `design` (Spring Boot architecture) and a frontend `design` (React component architecture). Use separate doc IDs (e.g., `DES-BE-001`, `DES-FE-001`) and link them.
2. **`data-model`** — PostgreSQL target schema. One per table cluster being migrated.
3. **`adr`** — record key architecture decisions (e.g., "why Spring Boot 3.x over Quarkus").

#### Plan the database migration (Phase 5)

Per Oracle → PostgreSQL move:

1. **`data-migration`** doc — the per-table migration plan. **Most important doc type for this project.** Includes:
   - Source table definition (link to as-is-schema)
   - Target table definition (link to data-model)
   - Column-by-column mapping with type conversions
   - Migration approach (cutover vs. trickle vs. dual-write)
   - Rollback procedure
   - Validation criteria (row counts, checksums, business invariants)
   - Dry-run results

These docs are the **input to Claude Code** when generating the actual migration scripts. The clearer the doc, the better the generated code.

#### Connect docs to actual code

Once the implementation starts, link each spec to the code that implements it (link from doc to git repo path). This creates the **traceability graph** that the Findings tab and Drift Analysis depend on.

### 5.4 Using AI Ask effectively

The **Ask** tab in the AI drawer (right side of the screen) is the main AI feature you'll use day-to-day.

**Good questions for migration projects:**

- "What does the OrderProcessing module currently do?"
- "Which Oracle tables in the as-is docs have FKs to T_USER?"
- "Compare the current TSB approval workflow (legacy) with the proposed Spring Boot design."
- "What's the test plan coverage for the User module?"
- "Show me all design decisions about how we'll handle Camunda BPM."

Type your question in the Ask field. Choose a mode:

- **Auto** (recommended for most questions) — DocHub picks the best strategy
- **Semantic** — finds docs by meaning (vector search)
- **Graph** — uses the doc-to-doc relationship graph
- **Knowledge** — uses the LightRAG knowledge graph (**not deployed in Phase 1** — skip)

You'll see an **"Index error"** message on the Ask panel. **Ignore it.** It's cosmetic — Ask still works without the vector index in Phase 1, just with less semantic context.

**About cost:** Each Ask query uses AWS Bedrock (Claude Sonnet). Approximate cost per query: $0.01–$0.05 depending on how much context is retrieved. For a 5-person team using Ask 10 times/day, monthly cost is around $30–50. Use freely for real questions; avoid trivial ones to save budget.

### Quick reference

| Action | How |
|---|---|
| Create a doc | SDLC Pipeline tab → phase section → doc-type card → **+ New** |
| Save | **Ctrl+S** (or the small save icon at the right edge of the metadata row) |
| Trigger AI audit | **Submit for Review** (easiest) OR click audit badge → **Re-audit** |
| Wait for audit | ~30–60 seconds. No progress indicator — refresh after a minute. |
| See findings | Click the audit badge in the metadata row → Findings panel slides in |
| Submit for review | Green **Submit for Review** button (top right of doc page) |
| Approve | Green **Approve** button (admin/PM only). First click works; ignore the error if you click twice. |
| Ask the AI | AI drawer (right side) → **Ask** tab → type question |
| Export to PDF | **Not working in Phase 1** — see §6 for workaround |
| Switch projects | Top-left dropdown (currently shows your project name) |

---

## 6. Known issues in Phase 1 (with workarounds)

Phase 1 is the pilot — expect rough edges. Here's what we know about up front so you don't have to discover them yourself.

### UI / workflow

| Issue | What you'll see | Workaround |
|---|---|---|
| **Save icon is hard to find** | The save button is a small unlabeled icon at the right edge of the metadata row, greyed-out by default. Among 7 similar icons. | Use **Ctrl+S** (or Cmd+S on Mac) — keyboard shortcut works everywhere. The save icon highlights when you have unsaved changes. |
| **AI audit doesn't auto-fire on save** | You save your doc → no AI feedback appears → looks like the platform is broken. | AI audit only runs on **Submit for Review** OR when you manually click **Re-audit** in the Findings panel. Structural validation (missing sections) does run on save. See §5 Step 4. |
| **Re-audit button has no progress feedback** | Click Re-audit → nothing visibly happens → no spinner or completion notification. | Wait 60 seconds, then refresh. The audit ran successfully if the open-findings count went up. Check JobBell (top-right bell) for confirmation. |
| **Audit badge invisible on never-audited Drafts** | You save a fresh Draft and there's no audit badge to click — no UI path to trigger the first LLM audit. | Click **Submit for Review** — it triggers the AI audit pipeline automatically. Then the badge appears. |
| **"Audit findings" panel mixes two finding types** | The panel shows STRUCTURAL VALIDATION findings (auto-generated) and AI Audit findings (requires explicit trigger) under one label. Users wonder why their findings only say "Missing required section". | These are structural results. To get AI-driven findings (severity/category), click Re-audit at the top of the panel and wait 60 sec. |
| **Approve button stays clickable after refresh** | You click Approve → status updates to "Approved" → you refresh the page → Approve button is active again → click it again → get a confusing error: *"Cannot approve: current status is 'Approved'"* | The first click succeeded. The button just re-enabled visually. Refresh and look at the status badge to confirm. |
| **Generate Baseline button stays active during run** | After clicking Generate Baseline, the button doesn't disable. You could double-click and trigger a duplicate job. | Wait for the JobBell completion notification before clicking again. Don't double-click. |
| **Structural validator requires exact section names** | An imported BRD with headers like `## 6. Functional Requirements — TSB Publication Management` gets flagged as "missing `## Functional Requirements`" — frustrating because the section is right there with extra qualifiers. | Use the bare expected section names (e.g., `## Functional Requirements`). Put qualifiers/numbering inside the body if you need them. |
| **BRD table rendering** | When you write a markdown table in a BRD, the editor preview may not render it nicely. | The table works correctly — it shows properly in the saved doc and the Baseline view. Editor preview is just cosmetic. |

### Features that don't work in Phase 1

| Feature | Why | What to do instead |
|---|---|---|
| **AI Agent tab** | Hidden in pilot for cost control (Agent uses ~10× more Bedrock tokens than Ask) | Use **Ask** for AI assistance. If you need Agent-style multi-step planning, run Claude Code locally on the scaffolded project repo with your own LLM credentials. |
| **Sign-Off** | The SignFlow service isn't deployed in Phase 1 | Use the standard **Submit for Review → Approve** workflow in DocHub (which is git-backed). |
| **Document indexing (AI Ask)** | The vector database (Secondary Postgres) isn't wired up in Phase 1. You'll see an "Index error" message — ignore it. | Ask still works — just with less semantic context. Answers may be less specific until indexing is enabled in a later phase. |
| **Portal Build** | Admin-only feature for building the public Docusaurus site. May have stale errors in JobBell. | Not applicable to pilot users. Ignore any Portal Build errors. |
| **PDF / DOCX export** | Click the Export icon on a doc → "Export service rendering failed". | Excel export works inline. For PDF, render markdown locally with pandoc: `pandoc doc.md -o doc.pdf`, or clone the repo and use any markdown-to-PDF tool. Being fixed post-pilot. |
| **Knowledge tab (AI drawer)** | Shows minimal data — just saved AI query history. Not a full knowledge graph. | The full knowledge graph (LightRAG) isn't deployed in Phase 1. Use **Ask** instead for natural-language questions about your docs. |

### Other things worth knowing

| Behavior | Why | What it means for you |
|---|---|---|
| **"Logout" doesn't fully log you out** | DocHub uses Azure AD SSO. Logging out of DocHub kills DocHub's session but not your Azure AD identity. The next login will be seamless (no credential prompt). | This is normal — same as Outlook, Teams, etc. If you need to *actually* switch accounts (e.g., on a shared machine), use an incognito window or sign out of Azure AD directly. |
| **Overview page shows a single project card** | After login, you'll see an Overview page that lists "your projects" — which for most pilot users is just one project. You then click "Open Project Portal" on that card to get to your working view. | Just an extra click. To skip it next time, bookmark `https://dev.dochub.h-aws.com/projects/{your-project-slug}` directly. |
| **Switching projects** | The project picker is the **top-left dropdown** (labeled with your current project name like "KPQMS (PQMS Test)"). Not visually highlighted. | Click the project name in the top-left to open the dropdown. Most pilot users only have one project. |
| **TRUST score abbreviations (T, R, U, S, T)** | The PM Dashboard shows a "TRUST 6.2/10" quality score with letter abbreviations (T, R, U, S, T) but no in-app legend. | T=Traceable, R=Reviewable, U=Unified (internally consistent), S=Structured, T=Trackable (workflow hygiene). Each scored 0–2, summing to 10. |
| **Team tab is slow to load** | The Team tab in the project portal takes ~10–20 seconds to load and re-loads on every date-range switch. | Be patient on first load. Don't switch date ranges frequently. |
| **JobBell "Audit fail — N issues" wording** | JobBell shows messages like *"Audit fail — 7 issues in brd/BRD-002.md"*. Sounds like the audit pipeline crashed. | It didn't. "Fail" here means the doc's overall audit status is "fail" (it has critical findings). The audit ran successfully and found 7 issues. Wording will be fixed. |
| **Old JobBell entries persist** | Stale failed jobs (some 40+ days old) accumulate in the "Needs Attention" section of JobBell. | Click **Dismiss** on each to clear. No auto-cleanup yet. |
| **Prompt Lab in sidebar** | Visible in Tools sidebar but is an admin-only feature for tuning AI prompts. | Ignore — it's a backend admin tool, not part of the pilot user workflow. |

### If something breaks for real

**DocHub is git-backed.** If DocHub itself fails:

1. Clone the project repo directly from Gitea: `git clone https://git.h-aws.com/adlc-team/<your-project>.git`
2. Edit the markdown files locally in your IDE
3. Commit and push
4. Meanwhile Diane will fix the bug

You never lose work to a DocHub outage. The docs are just markdown files in git.

---

## 7. Leaving feedback in DocHub-Feedback

There's a dedicated project called **DocHub-Feedback** where pilot users post comments, questions, bug reports, and feature suggestions about DocHub itself. Use it as the main channel for non-urgent feedback — everything lands in one place, Diane can respond inline, and other pilot users can see what's already been raised.

### Switching to the DocHub-Feedback portal

1. Click the **top-left project picker** (currently showing your active project name, e.g., "KPQMS (PQMS Test)")
2. Select **DocHub-Feedback** from the dropdown
3. The sidebar reloads with DocHub-Feedback as the active project

Switch back to your own project the same way.

### Posting a comment, question, or suggestion

Same create-doc flow as §5.1 Steps 1–3 — just inside the DocHub-Feedback project:

1. **SDLC Pipeline tab** → scroll to any phase section
2. Click **+ New** on any doc-type card — pick whatever loosely fits (doc-type categorization isn't strict in this project; the content is what matters)
3. Give the doc a title that says what it's about — e.g., *"Save icon hard to find"*, *"Suggestion: bulk approve"*, *"Question about audit triggers"*
4. Write your feedback in the body — markdown, free-form. Screenshots welcome (drag-drop into the editor).
5. **Ctrl+S** to save

Diane is notified of new docs in this project and will respond either inline in the doc or via outlook.

### What goes in DocHub-Feedback vs. Email Diane directly

| Use DocHub-Feedback for | Email Diane directly for |
|---|---|
| Bug reports that aren't blocking your work | Outage / can't log in |
| Feature suggestions | Bug actively blocking your work right now |
| Questions about how features should behave | Anything urgent |
| General pilot observations | — |

---

## 8. Support + contact

**Your point of contact for DocHub:** Diane Kim — `dianekim@haeaus.com`

| Need | How to reach |
|---|---|
| Bug report | Email Diane directly. Include screenshot + what you were doing. |
| Question about how to use a feature | Email Diane or check the in-app Help page (`Help` in left sidebar) |
| Outage / can't log in | Email Diane + fall back to git directly per §6 |
| Roadmap suggestion | Email Diane — feedback is genuinely welcome and shapes Phase 2 |

**Response expectations:**

| Type | Response time |
|---|---|
| Outage / DocHub down | Same day |
| Bug blocking your work | Same day or next day, depending on severity |
| Question / how-to | Same day during US Pacific business hours |
| Roadmap suggestion | Acknowledged within a day; queued for Phase 2 planning |

**Daily check-ins (week 1 only):** Diane will host a 15-min open-Q&A each day for the first week. Format and timing will be confirmed before Thursday's KT session.

---

## Quick reference

| Action | URL |
|---|---|
| DocHub | https://dev.dochub.h-aws.com |
| Underlying git repos (Gitea) | https://git.h-aws.com |
| This guide | (you're reading it) |
