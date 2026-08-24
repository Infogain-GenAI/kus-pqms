# 33 — Polyglot Monorepo Integration
**Tier:** 1
**Status:** DRAFT — derived from the client's `docs/STACK.md`, `TEAM-GUIDE.md`
and `DEVELOPER_GUIDE.md`; not yet exercised against the running system
**Purpose:** Where the frontend's boundary sits in a repository it shares with a
Java backend and a CDK infrastructure project — what it owns, what it depends
on, and what it must never reach into
**Extends:** 01-project-structure-and-architecture.md (which stops at the
workspace root)
---

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Why this file exists

`01-project-structure-and-architecture.md` describes everything inside the pnpm
workspace and stops there. In the target repository the workspace is one of
three components:

```
project-template-java/
├─ backend/    Spring Boot 4.0.6 · Java 21 · Gradle · ECS Fargate
├─ frontend/   React 19 · Vite 8 · pnpm 11 · S3 + CloudFront    <- this corpus
├─ infra/      AWS CDK (TypeScript) · provisions what both deploy onto
├─ docs/       the client's source of truth for versions and setup
├─ .claude/ .moai/   the MoAI-ADK harness
└─ scripts/ lefthook.yml .gitlab-ci.yml .gitlab-ci-templates/
```

Three of this corpus's rules cannot be satisfied inside `frontend/` at all —
the Content-Security-Policy, the cache headers, and the SPA deep-link rewrite
all live in `infra/`. Naming that boundary is what stops those rules from being
quietly dropped as "not our file".

## The boundary, stated as ownership

| Concern | Owner | This corpus's role |
|---|---|---|
| React source, components, routing, state | **`frontend/`** | governs fully |
| Frontend build config, lint, test, Storybook | **`frontend/`** | governs fully |
| The API contract | **`backend/`** | consumes; validates at the boundary |
| Auth token issuance and validation | **backend + IdP + API Gateway** | consumes; stores per 08 |
| CSP, cache headers, SPA rewrite, TLS | **`infra/`** | **states the requirement, verifies the result** |
| CI pipeline structure | **repo root** | contributes frontend jobs only |
| Git hooks, commit conventions | **repo root** | contributes frontend commands only |
| Versions, ports, environment variables | **`docs/STACK.md`, `DEVELOPER_GUIDE.md`** | defers |

**The two rows that cause trouble are the fifth and the last**, and for opposite
reasons: the fifth is a rule this corpus states but cannot implement, and the
last is a fact this corpus must not restate.

## Three requirements that live in `infra/`

Each is a real requirement from a tier file, unsatisfiable inside `frontend/`,
and invisible in development. **State them, do not implement them, and confirm
them at review** (16-code-review-checklist.md).

### 1. The SPA deep-link rewrite
A request for `/issues/123` is a key that does not exist in the S3 bucket.
Without a 403/404 → `/index.html` rewrite at the distribution, **every route
except `/` fails on a cold load** while working perfectly in development and in
every test.

This is the highest-consequence item in this file: it makes
07-routing-and-layouts.md's entire route tree non-functional, and it is found
late because nobody deep-links while developing.

### 2. Cache headers
Hashed assets (`dist/assets/[name].[hash].[ext]`) are immutable by construction
and want a one-year immutable policy. **`index.html` wants the opposite.** Get
it backwards and a deploy ships assets no browser requests — presenting as
"users are on the old version until they hard-refresh", which reads as a
frontend bug and is not one. 12-performance-guidelines.md carries the detail.

### 3. Content-Security-Policy
13-security-standards.md specifies one. A static SPA has no server to set
headers; it is a CloudFront response-headers policy. **A CSP nobody applied is a
CSP that exists only in a document.**

## The API contract

The backend is a Spring Boot service reached at `/api/*` through CloudFront →
API Gateway → ALB → ECS. **One origin, one client**
(05-api-integration-and-data-fetching.md).

**The contract is the backend's, and this corpus does not restate it.** What it
requires is that the frontend never trusts it silently:

- **Validate at the boundary.** Zod schemas in the service layer turn a backend
  field rename into one caught error at one seam, rather than `undefined`
  rendering three components deep. This matters *more* across a language
  boundary, not less — there is no shared type to break.
- **Map wire shapes to domain types in `.mappers.ts`.** Java naming conventions,
  date serialisation and enum casing will not match the domain types
  02-typescript-standards.md ratifies. That translation is a named, tested
  layer — not a `??` at the call site.
- **Error codes come from the backend.** 22-error-handling-and-user-feedback.md
  maps them to copy. A code the frontend invents is a code no backend will ever
  send.

**[PLACEHOLDER — whether an OpenAPI spec exists and can generate types.
`docs/STACK.md` §8 item 3 records `swagger-ui.enabled=true` with **no springdoc
dependency**, so the flag is inert and no spec is currently published. Trigger:
before the first API integration SPEC. Owner: backend lead.]** If a spec is
published, generated types replace hand-written wire types — the mappers stay.

## Environment variables

`VITE_API_BASE` is the name the target repository already uses
(`docs/STACK.md` §3). 13-security-standards.md's `ImportMetaEnv` interface is
the authoritative inventory of what the **frontend** reads.

Two rules that matter more here than in a single-component repository:

- **The frontend's inventory covers `VITE_*` only.** Backend variables
  (`DATABASE_*`, `REDIS_*`, `AWS_REGION`) are documented in
  `DEVELOPER_GUIDE.md` and are none of this corpus's business. Do not mirror
  them.
- **Anything in a `VITE_*` variable ships to the browser.** It is not
  configuration, it is published content. A backend developer accustomed to
  Secrets Manager will not assume this.

### A live defect
`docs/STACK.md` §8 item 1: the Vite proxy defaults to `http://localhost:8080`
while the backend runs on `18080` locally, so `/api/*` does not reach it.
Aligning it spans both components. 19-onboarding-and-dev-workflow.md carries it
as a day-one troubleshooting entry until then.

## Reaching across the boundary

**The frontend never reads or writes outside `frontend/`**, with three named
exceptions:

| Permitted | Why |
|---|---|
| `docs/` — read only | version and setup facts; it is the source of truth |
| `.gitlab-ci-templates/pipelines/frontend.gitlab-ci.yml` | the frontend's own pipeline |
| `lefthook.yml` — frontend-scoped entries only | the frontend's own hooks |

Everything else — `backend/`, `infra/`, `scripts/`, other components' pipeline
templates — is another team's code. **A change there is their merge request,
not a line in yours.**

The rule has a sharp edge worth stating: **a glob that escapes its component is
a boundary violation even when the change is mechanical.** A Prettier pattern of
`**/*.md` reformats the backend's documentation, and they discover it through
`git blame` on a commit that says "chore: format frontend".
23-git-workflow-hooks-and-commits.md records that the current Lefthook glob has
exactly this problem.

## Where the client's documents win

| Question | Authority |
|---|---|
| Versions, toolchain, resolved dependencies | `docs/STACK.md` |
| Local setup, ports, environment variables | `docs/DEVELOPER_GUIDE.md` |
| Labels, branch protection intent, conventions | `docs/conventions/README.md` |
| Pipeline structure and rationale | `docs/CI-ANALYSIS.md` |
| Test-suite state and known gaps | `docs/TEST-REVIEW.md` |

**Read `docs/TEST-REVIEW.md` before writing a testing SPEC.** It grades each
layer independently and lists concrete findings — including an orphaned test in
the frontend. A coverage percentage is not a statement about test quality, and
that document is the client's own evidence for the distinction.

## Where the client's documents disagree with each other

Four contradictions are visible in the material this file was written from.
**None is this corpus's to resolve, and all four are reportable findings:**

| Contradiction | Sources |
|---|---|
| Region `us-west-2` vs `us-east-1` | `TEAM-GUIDE.md` §1 vs `STACK.md` §1 |
| Node 20+ vs ≥ 24.15.0 | `DEVELOPER_GUIDE.md` prerequisites vs `STACK.md` §3 |
| Backend port 8080 vs 18080 | `STACK.md` §7 vs `DEVELOPER_GUIDE.md` |
| Package root `com.[hma\|kus\|haea].api` vs `com.hma.haea.backend` | `TEAM-GUIDE.md` §1 vs `STACK.md` §2 |

The Node one is the only one that will stop a frontend developer: following the
prerequisites table installs a runtime the frontend cannot build on, and React
Router v8 requires 22.22.0+ regardless. **`.nvmrc` is the operative answer.**

**Report contradictions; never resolve one silently by picking a side.** A
document corrected in passing, by someone outside the team that owns it, is how
the drift these files record began.

## Correction: four git submodules, not four directories

The observed repository is **not one git repository with four folders.**
`backend/`, `frontend/`, `automation/` and `infrastructure/` are **git
submodules**, each with its own history, its own lockfile and its own
`commit-msg.rules`.

That changes several things this file assumed, and one of them is the reason
this corpus was hard to see in the first place.

### What submodules change

| Assumption above | With submodules |
|---|---|
| One `.gitattributes` covers everything | **each submodule needs its own**, or line-ending policy stops at the boundary |
| `.git-blame-ignore-revs` at the git root serves all four | **it does not** — blame is per repository; the frontend needs its own |
| A change spans components in one MR | **it cannot** — each submodule is a separate MR, plus a pointer commit in the parent |
| `core.hooksPath` at the root governs all commits | **untested** — see 23-git-workflow-hooks-and-commits.md; a commit made inside a submodule may fire nothing |

### The pointer-commit trap
A submodule change is **two** commits: the change inside the submodule, and a
commit in the parent repository moving the pointer. **Forgetting the second is
the single most common submodule mistake** — the work is pushed, the branch
looks correct, and everyone else's checkout still has the old commit.

For a restructure this is worse than usual: Phase 2 produces many commits inside
`frontend/`, and the parent pointer moves once at the end. **Anyone reviewing
from the parent sees one opaque hash change.** Say so in the MR description.

### The cross-component defects get harder
This file names three requirements that live in `infra/` — the SPA rewrite,
cache headers, the CSP — and one that spans both components, the backend port
mismatch. **None of them can be fixed in a single merge request.** Each is a
separate MR in a separate repository, coordinated by hand.

That is not a reason to defer them. It is a reason to **raise them early**,
because the coordination cost is paid on the calendar, not in the diff.

### Why you could not see the corpus's changes earlier
The same mechanism. A nested repository shows in its parent as a single
untracked or modified entry with no per-file diff. **If the frontend's changes
seem to have vanished, open the submodule directly** — the parent will only ever
show you a pointer.

### One thing that got simpler
Path filtering. With submodules, a frontend change **cannot** touch another
component by construction, so the boundary rule above is enforced by git rather
than by review. The glob-escape hazard
(23-git-workflow-hooks-and-commits.md) largely disappears — a frontend
formatter cannot reach `backend/` because it is not in the same repository.
