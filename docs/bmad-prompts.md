# BMAD prompts for kus-pqms

Copy-paste prompts for each step of the BMAD setup, tailored to this repo.

**Status:** Steps 0 and 1 are **done**. BMAD 6.11.0 is installed. Start at Step 2.

## Installed configuration

| Setting | Value |
|---|---|
| BMAD version | 6.11.0 |
| Modules | `core` 6.11.0, `bmm` 6.11.0, `tea` v1.23.3 (external, stable) |
| IDE integration | `claude-code` → 59 skills in `.claude/skills/` |
| Install root | `_bmad/` |
| **Output folder** | **`_bmad-output/`** |
| Project name | kus-pqms |

Two corrections to note, because earlier drafts of this file had them wrong:

- **We use Claude Code, not GitHub Copilot.** Skills live in `.claude/skills/`, invoked as slash
  commands. Nothing was written to `.github/`.
- **BMAD output goes to `_bmad-output/`, never `docs/`.** `docs/` holds hand-written documentation
  only. See the warning under Step 1.

## How to invoke

Every skill is a slash command prefixed `bmad-`:

```
/bmad-help                 orientation — start here if unsure
/bmad-agent-pm             an agent (persona you converse with)
/bmad-create-prd           a workflow (a task that produces artifacts)
```

Run `ls .claude/skills` for the full list of 59. **The names in this file are the ones actually
installed** — earlier drafts used shorthand like `/pm` and `/architect`, which do not exist.

---

## Step 0 — Verify the environment ✅ DONE

Result: Node v24.19.0 (pass), `core.hooksPath` = `.githooks` (pass), working tree had one untracked
file (`docs/bmad-prompts.md`) which was left alone.

```bash
node -v
sh scripts/setup.sh
git config --get core.hooksPath
```

---

## Step 1 — Install BMAD ✅ DONE

The install ran non-interactively, because the interactive wizard cannot be driven from an agent's
shell (stdin is not a terminal). Every answer was supplied as a flag:

```bash
npx --yes bmad-method@6.11.0 install \
  --directory . \
  --modules core,bmm,tea \
  --tools claude-code \
  --all-stable \
  --output-folder _bmad-output \
  --set core.project_name=kus-pqms \
  --set bmm.planning_artifacts='{project-root}/_bmad-output/planning-artifacts' \
  --set bmm.implementation_artifacts='{project-root}/_bmad-output/implementation-artifacts' \
  --set bmm.project_knowledge='{project-root}/_bmad-output' \
  --set tea.test_artifacts='{project-root}/_bmad-output/test-artifacts' \
  --yes
```

Three things learned the hard way:

1. **⚠ Never point `--output-folder` at a directory holding your own files.** The first install used
   `--output-folder docs`. On the next install BMAD treated `docs/` as *its* folder and **moved the
   contents** into the new output folder. Two hand-written files were relocated and only recovered
   because a backup existed. `docs/` is now excluded from BMAD entirely.
2. **There is no "install deprecated compatibility shim skills" prompt** in 6.11.0. Earlier drafts
   listed it as a question to answer "no" to; it does not exist. What exists is
   `warnPreNativeSkillsLegacy`, a warning that fires only when a pre-v6.5 install is detected.
3. **Three `tea` keys have no `--set` option** (`test_design_output`, `test_review_output`,
   `trace_output`) and stayed hardcoded to `docs/`. They are pinned in `_bmad/custom/config.toml`,
   which the installer never regenerates. **Do not move them into `_bmad/config.toml`** — that file is
   overwritten on every install and they would silently revert to writing into `docs/`.

---

## Step 2 — Verify the install ← START HERE

```
Verify the BMAD install in this repo:

1. Confirm _bmad/_config/manifest.yaml lists core 6.11.0, bmm 6.11.0 and tea v1.23.3.
2. Confirm .claude/skills/ contains the 59 skills, and name the agents vs the workflows.
3. Confirm NOTHING in _bmad/config.toml or the module config.yaml files points at docs/.
   The three tea keys pinned in _bmad/custom/config.toml are the expected exception.
4. Flag anything the installer wrote outside _bmad/, _bmad-output/ and .claude/.

Then confirm which skill I should use for each phase: project context, product brief,
PRD, UX design, architecture, epics and stories, sprint planning, create story, dev
story, code review, correct course, retrospective — and separately the tea/test
architect skills.

Use names as installed, not from blog posts.
```

Then run `/bmad-help` on its own for the built-in orientation.

### Skill map (verified against this install)

| Phase | Skill |
|---|---|
| Orientation | `/bmad-help` |
| Project context | `/bmad-project-context` (or `/bmad-generate-project-context`) |
| Brainstorming | `/bmad-brainstorming` |
| Product brief | `/bmad-product-brief` |
| Deep research | `/bmad-deep-recon`, `/bmad-domain-research`, `/bmad-market-research` |
| PRD | `/bmad-create-prd`, then `/bmad-validate-prd` |
| UX design | `/bmad-ux` |
| Architecture | `/bmad-create-architecture` |
| Epics and stories | `/bmad-create-epics-and-stories` |
| Sprint planning | `/bmad-sprint-planning`, `/bmad-sprint-status` |
| Create story | `/bmad-create-story` |
| Implement | `/bmad-dev-story` |
| Code review | `/bmad-code-review` |
| Correct course | `/bmad-correct-course` |
| Retrospective | `/bmad-retrospective` |
| Small changes | `/bmad-quick-dev` |
| Agents (personas) | `/bmad-agent-analyst` `/bmad-agent-pm` `/bmad-agent-ux-designer` `/bmad-agent-architect` `/bmad-agent-dev` |
| Test architect | `/bmad-tea` + `/bmad-testarch-*` (see Step 7b) |

⚠ `/bmad-build` and `/bmad-build-auto` render through `uv run` and **will halt on activation** — `uv`
is not installed. Use `/bmad-quick-dev` for small changes instead, or install `uv`.

---

## Step 3 — Git story for BMAD files ✅ MOSTLY SETTLED

Already resolved, recorded here so nobody re-litigates it:

- **A commit touching only `_bmad/`, `_bmad-output/`, `.claude/` or `docs/` was accepted
  unvalidated** — the `commit-msg` router only applied rules when a changed folder supplied them.
  Fixed by a repo-wide fallback in `.githooks/repo-commit-msg.rules`, so root-level commits are now
  validated too (commit `40e015b`).
- **Do not create `docs/commit-msg.rules`.** An earlier draft proposed it. That would make `docs` look
  like a *component* to the router. The repo fallback already covers it.
- `_bmad/custom/config.user.toml` is already ignored by BMAD's own bundled `_bmad/custom/.gitignore`.
- `_bmad/render/` ignores its own contents via `_bmad/render/.gitignore`.
- BMAD added no `.sh` files, so the `.gitattributes` LF rules are unaffected.

Still open:

```
Decide what to track. Facts:
- _bmad/ is 23 files, holds our real config -- recommend tracking.
- .claude/ is 970 files (each skill is a directory) and churns on every BMAD
  upgrade -- decide track vs gitignore-and-reinstall.
- _bmad-output/ contains ZERO files (empty dirs only), so it cannot be tracked as-is
  and is generated output anyway. Recommend: printf '*\n!.gitignore\n' > _bmad-output/.gitignore

Propose the exact .gitignore lines and show me the diff. Do not apply until I approve.
Do not touch frontend/, backend/, automation/ or infrastructure/ rules.
```

---

## Step 4 — Project context (do not skip)

```
/bmad-project-context

Run the project-context workflow for this repo.

Verify each claim below against the actual files before writing it down:

- Product: N-PQMS (Product Quality Management System), Kia's enterprise
  product-quality management platform.
- Repo: kus-pqms, a single monorepo. No Git submodules.
- Four components, each owning its own Git rules:
    frontend/       the web portal
    backend/        the application / API
    infrastructure/ infra as code
    automation/     QA automation tests
- docs/ is hand-written documentation and is NOT a component and NOT a BMAD
  output folder. All BMAD artifacts go to _bmad-output/.
- Per-component tooling is NOT yet chosen. Every <folder>/scripts/pre-commit.sh
  and pre-push.sh is a deliberate no-op placeholder. Do not assume a language,
  framework or test runner for any component.
- Commit convention, enforced by .githooks/commit-msg:
      <type>(<optional-scope>): <subject>
  Types: feat fix refactor perf test docs build ci chore revert
  Subject max 72 chars. Example: feat(issue-service): add bulk update endpoint
  Commits outside the four components fall back to .githooks/repo-commit-msg.rules.
- Strong preference: one component per commit. A commit spanning folders must
  satisfy every affected folder's rules. Cross-cutting commits use chore(repo):.
- Hooks are local fast feedback, not enforcement. They fire only after
  sh scripts/setup.sh sets core.hooksPath, and --no-verify bypasses them. CI is
  the real gate. Never suggest --no-verify to get a commit through.

Tell me which file the workflow writes this to. If it writes AGENTS.md, also
tell me whether CLAUDE.md is needed instead or as well, since Claude Code reads
CLAUDE.md for project context.
```

This is the step that makes every later agent generate commits the hooks accept.

---

## Step 5 — Analysis (optional, worth it greenfield)

```
/bmad-brainstorming

I'm starting N-PQMS from scratch — an enterprise product-quality management
platform for Kia. Facilitate a session on what the first release must cover.

Constraints: enterprise users, quality/defect workflows, manufacturing context,
and a monorepo with separate frontend, backend, infrastructure and QA automation
components.

Push back on scope creep. I want a small, defensible first release, not a wish
list. Ask me questions rather than assuming.
```

```
/bmad-product-brief

Create a product brief for N-PQMS, Kia's enterprise product-quality management
platform.

Read the project context and docs/ first for established context.

Cover: the problem, who the users are and what their day looks like, what quality
management means concretely in a manufacturing context, what's explicitly out of
scope for release 1, and the assumptions that would hurt most if wrong.

Challenge my assumptions. Where you lack information, ask rather than inventing a
plausible-sounding fact. Write output to _bmad-output/.
```

Optional deep research:

```
/bmad-deep-recon

Research enterprise product quality management systems (PQMS/QMS) in automotive
manufacturing.

I need: what capabilities are table stakes, what regulatory or standards
constraints apply (e.g. IATF 16949, 8D / CAPA processes), common integration
points with MES/ERP/PLM systems, and where existing tools frustrate users.

Cite sources. Separate what you verified from what you inferred. Write to
_bmad-output/.
```

---

## Step 6 — Planning

```
/bmad-create-prd

Create the PRD for N-PQMS release 1.

Read first: the project context, the product brief and research in _bmad-output/,
and README.md.

Requirements:
- Functional requirements grouped by capability area, each testable.
- Non-functional requirements, especially enterprise auth/SSO, role-based access,
  auditability of quality records, data retention, expected scale.
- For every requirement, note which component owns it — frontend, backend,
  infrastructure or automation. This matters: our Git rules prefer one component
  per commit, so requirements smearing across components must be split now.
- An explicit out-of-scope section.

Where the brief is silent, ask me instead of assuming. Write to _bmad-output/.
```

Then validate it rather than assuming it's good:

```
/bmad-validate-prd

Validate the PRD in _bmad-output/. Report gaps, untestable requirements, and any
requirement whose owning component is ambiguous. Be adversarial.
```

```
/bmad-ux

Create the UX design for the N-PQMS frontend portal.

Read first: the project context and the PRD in _bmad-output/.

Scope to the frontend/ component only. The frontend framework is NOT yet chosen,
so keep the design framework-agnostic — no component-library assumptions.

Focus on the core quality workflows an enterprise user runs daily: finding a
defect/issue, triaging it, tracking it to closure, reporting on it. Prioritise
information density and keyboard efficiency over decoration — these are
professional users working in this all day.

Write to _bmad-output/.
```

---

## Step 7 — Solutioning

### 7a. Architecture

```
/bmad-create-architecture

Create the architecture for N-PQMS.

Read first: the project context, the PRD and UX docs in _bmad-output/, README.md,
and docs/gitmodule-seperation.md.

Critical constraint — this is a monorepo with four components that each own their
own Git rules and CI checks:
  frontend/ · backend/ · infrastructure/ · automation/
The architecture must make those boundaries explicit, including what crosses them
(API contracts, shared types, environment config) and how a change is kept inside
one component wherever possible.

No tech stack has been chosen for any component. Where you recommend one, present
it as a decision with alternatives and trade-offs for me to approve — do not
silently pick. Record each as a decision record.

Also specify: the data model for quality records, auth/authz approach, integration
boundaries with external systems (MES/ERP/PLM), and the test strategy split
between backend tests and the automation/ QA suite.

Write to _bmad-output/.
```

### 7b. Test strategy — the `tea` module

`tea` was installed specifically because this repo has a dedicated `automation/` component. It was
missing from earlier drafts of this file. Run it **after** architecture, so the test strategy reflects
real boundaries:

```
/bmad-testarch-framework

Establish the test architecture for N-PQMS.

Read the architecture in _bmad-output/ first.

Hard constraint: no test tooling is chosen for any component yet. Propose options
with trade-offs rather than picking. The automation/ component owns end-to-end and
API test automation; backend/ owns its own unit and integration tests. Make that
split explicit, including what must NOT be duplicated between them.

Write to _bmad-output/test-artifacts/.
```

Related, as needed: `/bmad-testarch-test-design` (test design), `/bmad-testarch-nfr` (non-functional),
`/bmad-testarch-ci` (CI wiring — cross-reference the `gate` job pattern in
`docs/gitmodule-seperation.md` §10), `/bmad-testarch-trace` (requirement traceability),
`/bmad-testarch-atdd`, `/bmad-qa-generate-e2e-tests`, `/bmad-testarch-automate`.

### 7c. Epics and stories

```
/bmad-create-epics-and-stories

Read first: the project context, the PRD and architecture in _bmad-output/.

Hard rule for story slicing: every story must be implementable inside a SINGLE
component (frontend, backend, infrastructure or automation). If a capability needs
two components, split it into two stories with an explicit dependency, and make the
contract between them part of the earlier story's acceptance criteria. This is not
style — our commit-msg hook warns on multi-component commits and each folder
enforces its own rules.

For every story include: the owning component, the commit scope to use, the
acceptance criteria, and what "tested" means given no test tooling is chosen yet.

Sequence epics so infrastructure and auth foundations land before feature work.
```

### 7d. Sprint planning

```
/bmad-sprint-planning

Read the epics and stories in _bmad-output/. Produce the readiness gate assessment
and sprint status.

Before writing it: flag any story that is not actually ready — missing acceptance
criteria, unresolved architecture decision, spans more than one component, or
depends on tooling we haven't chosen. Do not pass a story through the gate to be
polite. I would rather fix it now.

Recommend what belongs in sprint 1, with reasoning about dependency order.
```

---

## Step 8 — The implementation loop (repeat per story)

### 8a. Create the story

```
/bmad-create-story

Read the sprint status and pick the next story that is ready and unblocked. Tell me
which one and why before generating the file.

The story file must be self-contained — a fresh chat with no project history should
be able to implement it from the story file alone. Embed: the relevant architecture
decisions, the owning component, the exact commit scope, the acceptance criteria,
and the file paths expected to change.
```

### 8b. Implement it — **in a new chat**

```
/bmad-dev-story <story-id>

Read the story file in _bmad-output/ and the project context. Implement only what
this story specifies — if you find adjacent work, note it for me rather than doing it.

Constraints:
- Stay inside the story's owning component. If you need to touch a second
  component, stop and tell me — the story was sliced wrong.
- Tooling for this component may not exist yet. If you need a framework, linter or
  test runner, propose it and wait for my approval before installing anything.
- If you add real checks to <component>/scripts/pre-commit.sh, keep them fast and
  do not touch any other component's scripts.
- Do not commit. I'll review first.

When done, show me the full diff and how you'd verify it manually.
```

For a small change that doesn't need the whole chain use `/bmad-quick-dev`. (Earlier drafts said
`/quick-flow-solo-dev` — no such skill exists.)

### 8c. Code review

```
/bmad-code-review <story-id>

Review against: the story's acceptance criteria, the architecture in _bmad-output/,
and the component boundaries in README.md.

Specifically check:
- Does anything leak across a component boundary that shouldn't?
- Are the acceptance criteria actually met, or only apparently met?
- Any secrets, credentials or .env content staged? .gitignore covers .env but
  check the diff, not just the pattern.
- Line endings: any .sh file that would break the hooks on Windows?

Be adversarial. Report findings ranked by severity, with patches. Tell me if you
find nothing rather than manufacturing a finding.
```

Deeper passes available: `/bmad-review-adversarial-general`, `/bmad-review-edge-case-hunter`,
`/bmad-review-verification-gap`.

### 8d. Commit

```
Commit the changes for <story-id>.

Before committing:
1. Run git status and show me exactly what's staged. If anything unexpected is
   there, stop.
2. Confirm every changed file is inside the story's owning component. If the commit
   spans components, stop and tell me.

Commit message must satisfy the component's commit-msg.rules:
    <type>(<optional-scope>): <subject>
Types: feat fix refactor perf test docs build ci chore revert. Subject <= 72 chars.

Let the hooks run. Never use --no-verify. If a hook rejects the commit, show me the
output and fix the cause, don't bypass it.
```

### 8e. Advance the sprint

```
/bmad-sprint-status

Mark <story-id> complete, then tell me the next ready story and whether anything is
now blocked or unblocked as a result. Don't start it yet.
```

### When the plan drifts

```
/bmad-correct-course

What changed: <what you learned / what broke / what the customer said>

Reassess the affected epics, stories and architecture decisions. Tell me what needs
re-planning versus what still holds, and what the cheapest correction is. Be honest
if the original plan was wrong rather than patching around it.
```

### At the end of each epic

```
/bmad-retrospective <epic-id>

Base the acceptance verdict on evidence — what was actually built and verified
against the epic's acceptance criteria — not on story statuses being green. Where
evidence is missing, say so and mark it unverified.

Also report: which stories needed rework and why, whether the component slicing held
up in practice, and what to change in how we slice the next epic.
```

---

## Standing context to paste when an agent seems lost

```
Repo context: kus-pqms, a single monorepo for N-PQMS (Kia's product quality
management platform). Four components: frontend/, backend/, infrastructure/,
automation/. Each owns its own .gitignore, commit-msg.rules and
scripts/pre-commit.sh + pre-push.sh. Hook routers in .githooks/ run only the
components a commit touches; commits outside those four fall back to
.githooks/repo-commit-msg.rules. Hooks require sh scripts/setup.sh to be active.
Commit format: <type>(<optional-scope>): <subject>, subject <= 72 chars, types are
feat fix refactor perf test docs build ci chore revert. Prefer one component per
commit; cross-cutting uses chore(repo):. Per-component tooling is NOT yet chosen —
the check scripts are intentional no-op placeholders.

docs/ is hand-written documentation, NOT a component and NOT a BMAD output folder.
All BMAD artifacts go to _bmad-output/. Never write BMAD output into docs/.

Read the project context and docs/ before proposing anything.
```
