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

## Withdrawn: they are NOT submodules. Four ordinary directories, one repository.

**An earlier revision of this file asserted that `backend/`, `frontend/`,
`automation/` and `infrastructure/` are git submodules "each with its own
history, its own lockfile and its own `commit-msg.rules`". That is false, and
everything derived from it below is withdrawn.**

Measured 2026-08-25 against the repository, recorded in
`../../RESTRUCTURE-BASELINE.md`:

```
$ git submodule status          # no output, exit 0
$ cat .gitmodules               # No such file or directory
$ ls -ld frontend/.git          # No such file or directory
$ git ls-files -s | awk '$1=="160000"'    # no gitlinks in the index
```

Every one of the four is mode `100644` in a single index. There is **one** git
repository, rooted at `KUS-PQMS/`. The tell was available without running
anything: the entire corpus and the entire React port arrived in **two commits
touching all four areas**, which no submodule arrangement can produce.

### What the withdrawal changes back

| Claim in the withdrawn section | Actually |
|---|---|
| Each submodule needs its own `.gitattributes` | **The root file is inherited.** `frontend/.gitattributes` exists anyway — for 33's boundary reason and because the root lacks `eol=lf` — not because inheritance fails |
| `.git-blame-ignore-revs` at the root does not serve all four | **It does, and it belongs there.** `blame.ignoreRevsFile` is one repository-level value and forge auto-detection reads only the repo root; a per-component copy is inert |
| A change cannot span components in one MR | **It can.** One repository, one branch, one MR |
| The pointer-commit trap | **Does not exist.** There is no pointer. A commit inside `frontend/` is simply a commit |
| `core.hooksPath` governing submodule commits is "untested" | **Tested, and it works.** A commit staged in `frontend/` fires the root router, which ran `frontend/scripts/pre-commit.sh` and rejected an invalid message via `frontend/commit-msg.rules` |
| "If the frontend's changes seem to have vanished, open the submodule directly" | **Nothing vanishes.** `git log -- frontend/` shows every file |

### What survives, and it is the part that mattered

**The boundary between components is real. It is simply not enforced by git.**

Everything this file says about *why* the boundary exists stands unchanged: a
formatter or lint glob that escapes `frontend/` reformats another team's code and
they find out from `git blame`; the frontend's `commit-msg.rules` is
authoritative for the frontend and reaches into no other component; the
infra-owned requirements are still owned by another team.

**What changes is the enforcement mechanism, and it changes for the worse.** The
withdrawn section closed with "one thing that got simpler" — that submodules made
the boundary structural, so a frontend tool "cannot reach `backend/` because it is
not in the same repository."

**That protection was never there.** In one repository a glob that escapes its
directory reaches every other component immediately, and nothing stops it. So:

- **The glob-escape hazard is live, not "largely disappeared".** Every path
  filter, ignore file and lint glob in `frontend/` must be scoped to `frontend/`
  by its own construction, because no repository boundary will do it.
- **Enforcement is review and configuration, not git.** The boundary is a
  convention this corpus states and reviewers uphold.
- **One instance is already unavoidable.** `core.hooksPath` is a single
  repository-level value, so `frontend/scripts/setup-hooks.mjs` necessarily
  configures hooks for all four components. It enables the shared router that
  dispatches to each component's own scripts rather than reaching into their code
  — but it is repo-wide, and that is a real tension rather than a technicality.

### The lesson is 00's, for the third time

00-core-rules.md records it after two earlier passes: **a document about a
repository ranks below the repository.** The template documentation described a
template; the prior audit assumed written guidelines described built code; and
this section asserted a repository shape nobody had run `git submodule status`
against. **Each cost a full revision, and each was answerable in one command.**

18-project-context-and-implementation-status.md already draws the general
conclusion from the *first* two: "before deferring a question to a person, check
whether the repository already answers it." This is the same failure with the
person removed — nobody deferred it; it was simply asserted.
