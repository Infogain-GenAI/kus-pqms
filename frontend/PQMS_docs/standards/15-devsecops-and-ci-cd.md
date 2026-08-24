# 15 — DevSecOps and CI/CD
**Tier:** 1
**Status:** APPROVED — REVISION 2

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
Specifies the CI this app needs: which workflows exist, what each job
runs and in what order, which gates must fail a build, dependency
hygiene, and the CI-side secrets rule. **Nothing described here exists
yet** — this is a build target, not a description of a pipeline.

## Scope boundary
Two workflows: **`pqms-portal-ci.yml`** and **`pqms-portal-sonarqube.yml`**.

Both live in the **repository root's** `.github/workflows/`, not under
`pqms-portal/`. GitHub reads workflows only from the repo root, and the
pnpm project is `pqms-portal/`, one level down. Two consequences that
every job below depends on:

- each job sets `defaults.run.working-directory: pqms-portal`, so `run:`
  commands execute in the pnpm project;
- every *action input* that names a file is prefixed `pqms-portal/`
  (`pqms-portal/package.json`, `pqms-portal/.nvmrc`,
  `pqms-portal/pnpm-lock.yaml`) — action inputs are not affected by
  `working-directory`, which is the detail that silently breaks a
  workflow copied without it.

Provenance: `kus-pqms` was a polyglot monorepo whose git root held
`backend/` alongside `frontend/`, with three further workflows
(`backend-ci.yml`, `infrastructure-ci.yml`, `automation-tests-ci.yml`)
that had nothing to do with this app. If this repo is frontend-only and
`pqms-portal/` *is* the git root, the `paths` filters, the
`working-directory` default and every `pqms-portal/` prefix above drop
away — confirm which at scaffold time before copying any of it.

## `pqms-portal-ci.yml` — two jobs, `quality` and `e2e`
Two jobs rather than one, and not sequential steps in a single job. A
broken browser download or a flaky e2e run then cannot mask a type
error, and the Playwright browser install only happens on the path that
needs it.

### Triggers and concurrency
- **`push`** to the default branch and **`pull_request`**, both scoped
  by `paths`: `pqms-portal/**` plus the workflow file itself. The workflow
  file is in the list deliberately — a change to CI must run CI.
- **`concurrency`**: group `pqms-portal-ci-${{ github.ref }}` with
  **`cancel-in-progress: true`**, so a rapid second push supersedes the
  first run instead of queueing behind it.
- **One Node version, no matrix.** Resolved from `.nvmrc` via
  `actions/setup-node`'s `node-version-file`, so the version lives in
  one file that local development also reads. A matrix would test
  runtimes nothing deploys on.
- `.nvmrc`'s value must satisfy 00's Node floor.

Provenance: this is `kus-pqms`'s trigger and concurrency configuration,
specified here rather than left to preference because each part earns
its place — the `paths` scoping keeps a backend-only commit from
running frontend CI, and `cancel-in-progress` is the difference between
a queue and a backlog.

**RESOLVED (2026-08-24, from the repository).** `pqms-portal-dev`'s default
branch is **`main`**. Trigger on `[main]` only — do not carry the
`[master, main]` hedge forward. A branch list naming a branch that does not
exist is indistinguishable from a typo, and it hides the case where the trigger
silently matches nothing.

**RESOLVED — pin the exact version.** `.nvmrc` currently reads `24`, a bare
major, so CI silently follows the latest 24.x and a patch-level runtime change
arrives unannounced — which is how a green pipeline turns red on a commit that
changed nothing.

Write the full `major.minor.patch`. Two supporting rules:

- **`engines.node` in `package.json` stays a floor, not a pin** (`>=22.22.0`
  today), because a consumer of this workspace should not be forced onto our
  exact patch. `.nvmrc` pins; `engines` bounds. They are different jobs.
- **`.npmrc` sets `engine-strict=true`**, so the floor is enforced at install
  rather than documented and ignored. Without it `engines` is a comment.

Bumping the pin is an ordinary PR, and it is the *only* way the runtime moves.

### Job 1 — `quality`
Step order, which is not arbitrary:

1. `actions/checkout`
2. **Install pnpm** — `pnpm/action-setup` with
   `package_json_file: pqms-portal/package.json`, so the pnpm version
   comes from `packageManager` rather than being pinned twice.
3. **Setup Node** — `actions/setup-node` with
   `node-version-file: pqms-portal/.nvmrc`, `cache: pnpm`, and
   `cache-dependency-path: pqms-portal/pnpm-lock.yaml`.
4. **`pnpm install --frozen-lockfile`**
5. **Type-check** — `tsc --noEmit`
6. **ESLint**
7. **Prettier** — `--check`
8. **Build**
9. **Unit tests with coverage, all packages** — see below
10. **`pnpm audit`** — see Dependency management
11. **`pnpm docs:standards:check`** — fails if the generated standards
    document does not match the tier files it is generated from
11a. **Log-hygiene scan** — fails if any committed source file passes a
    prohibited field into a logger or telemetry call, per
    21-logging-formatting-and-client-diagnostics.md's prohibition list.
    BRD `NFR-O-005` is a gated non-functional requirement; a convention
    does not gate it, and no other step in this job would catch it.
11b. **Bundle-budget check** — fails if the initial bundle exceeds 300KB
    gzipped or any route chunk exceeds 150KB, per
    12-performance-guidelines.md. Requires `rollup-plugin-visualizer`,
    which 12 makes scaffold-time work
12. **Upload coverage artifact** — `if: always()`, so a failing
    threshold still produces the report that explains why

**Why the docs check is a CI step and not a convention**: 00's
precedence rule says the distribution document is generated and never
hand-edited. Without a check, that is a request. With one, a hand-edit
fails the build on the PR that made it, which is the only moment anyone
can still tell what was edited and why.

**Why that order**: cheapest and most specific failure first. Type
errors before lint, lint before formatting, all three before a build
that would fail on the same code anyway, and tests last because they
are slowest. A developer reading a red build learns the most useful
thing first.

**`--frozen-lockfile` is required, not a nicety.** It makes CI fail on
a lockfile that does not match the manifest, instead of quietly
resolving a dependency tree different from the one any developer has.

**Type-check is `tsc --noEmit`.** Nothing wraps it and nothing
substitutes for it.

Provenance, since a Vue-shaped artifact would otherwise get copied
here: `kus-pqms`'s step was named "Type-check (vue-tsc)" and its
`pnpm lint` ran `vue-tsc --noEmit` per package, because type-checking a
Vue SFC's `<script>` block needs a Vue-aware compiler. There is no such
need here and no such tool. Two things follow. **`vue-tsc` appears
nowhere in this repo** — if it turns up in a config, it was copied
without reading. And **do not carry the script names either**: in
`kus-pqms`, `lint` meant type-check while `lint:eslint` meant lint,
which makes every CI step name a small lie. Name the scripts for what
they do — `typecheck`, `lint`, `format:check`. 14-code-style-and-
linting.md owns the tools those scripts invoke; this file only requires
that the workflow step name and the script name describe the same
thing.

One related carry-over to catch: `kus-pqms`'s `format:check` glob
listed `.vue` among its extensions. The equivalent here covers `.tsx`
and must not carry `.vue` forward. 14 owns the Prettier configuration.

### Job 2 — `e2e`
Its own `checkout` → pnpm → Node → `pnpm install --frozen-lockfile`,
then:

- **Install Playwright browsers** — `playwright install --with-deps
  chromium`. Chromium only unless a cross-browser requirement is
  stated; `--with-deps` because the runner lacks the system libraries.
- **Run the e2e suite.**
- **Upload the Playwright report** — `if: always()`, for the same
  reason as the coverage artifact.

**RESOLVED — the job lands with the first spec, not before.**

On day one there are zero e2e specs, and `playwright test` matching nothing
exits non-zero. The two available fixes are both wrong: a job that fails from
the first commit trains everyone to ignore a red check, and `--pass-with-no-tests`
softens the job permanently to avoid a problem that lasts a week.

So: **no `e2e` job until the first spec exists.** The commit that adds that spec
adds the job, in the same PR. Until then `15`'s job list is five jobs, not six,
and that is a stated position rather than an omission.

**The first spec is not a formality.** Make it the smoke path — load the issue
list in fixtures mode, assert one row renders. That exercises the router, the
layout, the query layer and the fixture predicate in one assertion, and it is
the test that tells you the app boots at all.

### Coverage runs for every package
**The unit-test step covers every package in the workspace, not the app
alone.** A root-level coverage script fanned out by Turbo — not a
single `--filter`.

This gets its own subsection because it is the one requirement here
most likely to be quietly re-broken, and because it was in fact broken
in the implementation this file otherwise draws on.

Provenance: `kus-pqms`'s test step was

```
pnpm --filter @pqms/pqms-portal run test:coverage
```

Both `@pqms/ui-library` and `@pqms/design-tokens` had a
`"test": "vitest run"` script. Their tests existed and **never ran in
CI** — the root `pnpm test` (`turbo test`) would have run all three,
and the `--filter` excluded two of them. Nobody deleted a test; the
pipeline simply stopped asking.

The same gap reached SonarQube independently, which is the part worth
noticing: `sonar-project.properties` listed **three** source roots
(`apps/pqms-portal/src`, `packages/ui-library/src`,
`packages/design-tokens/src`) against **one** coverage report
(`apps/pqms-portal/coverage/lcov.info`). Two of the three packages were
analysed as source with zero coverage attached — so the dashboard did
not show a gap, it showed those packages as untested.

Requirements that follow:

- The coverage command fans out across the workspace.
- Every package with a `test` script emits an lcov report.
- **`sonar.javascript.lcov.reportPaths` lists every package's lcov
  path** — the property is comma-separated; one path means one measured
  package.
- The coverage artifact upload covers every package's coverage
  directory, not just the app's.
- **10's thresholds apply per package.** A package whose coverage is
  not measured has not passed a threshold; it has avoided one.

### Coverage gate
### Coverage on an existing codebase — the ratchet
**10's uniform 85 is the target and it is not negotiable. On a project
being restructured onto this corpus, it is not achievable on day one**,
and 30-restructuring-an-existing-react-project.md's Phase 1 says what to
do instead: **record the current coverage as the floor and fail CI on any
drop.** The floor rises with each merge that adds tests; the target stays
85.

Two constraints on that mechanism, both of which decide whether it works:

- **The floor only ever moves up.** A merge that lowers it is the defect
  this exists to prevent, not a fact to record.
- **It is a temporary state with a stated end.** A ratchet with no target
  is a permanently lowered threshold wearing a better name. The end is
  85/85/85/85, and the ratchet is deleted when it is reached.

This applies **only** to a codebase inherited below the threshold. A
greenfield package starts at 85 from its first covered file, per 10.

10-testing-standards.md owns the numbers. What this file owns is how
the gate is enforced: the check is **Vitest's own v8-provider threshold
check**, invoked as the `quality` job's test step, with **nothing
softening its exit code** — no `continue-on-error`, no second CI-side
gate layered on top, no `|| true`. A threshold violation fails the step
and therefore the job.

10 also flags a scaffold-time edge case that lands in CI: a coverage
run with zero covered files may report 0% and fail. Handle it as 10
says — by when thresholds are enabled, not by lowering a number to get
a green build.

## `pqms-portal-sonarqube.yml`
**A separate workflow, not a job inside `pqms-portal-ci.yml`**, so that a
missing or misconfigured Sonar setup can never fail the quality gate.

Required shape:

- **`checkout` with `fetch-depth: 0`.** Sonar needs full history for
  blame and new-code analysis; the default shallow clone breaks both.
- **A secret guard as the first step.** Write
  `enabled=${{ secrets.SONAR_TOKEN != '' }}` to `$GITHUB_OUTPUT` and
  make every later step conditional on it, with a final step that logs
  the skip when it is false. A fork, or a repo not yet onboarded to
  Sonar, then gets an honest green no-op instead of a permanent red
  check.
- **Generate coverage inside this workflow.** Artifacts do not cross
  workflow boundaries for free, so this workflow runs the tests it
  needs reports from.
- **`SonarSource/sonarqube-scan-action`** with
  `projectBaseDir: pqms-portal`, and `SONAR_TOKEN` / `SONAR_HOST_URL` from
  secrets.
- **`sonar-project.properties` lives in `pqms-portal/`**, alongside the
  pnpm project it describes.

Provenance: this is `kus-pqms`'s workflow, which worked and sat inert
for want of an org-level secret. It is specified here rather than left
to whoever writes it because the guard is the non-obvious part —
without it, every fork and every un-provisioned repo carries a failing
check that people learn to ignore.

Two changes the properties file needs relative to `kus-pqms`'s:

- **`sonar.test.inclusions` must cover `.spec.tsx`.** `kus-pqms`'s was
  `**/*.spec.ts` only. Per 10, React component specs are `.spec.tsx` —
  so the inherited glob would classify every component test as
  production source, inflating the source base and reporting those
  files as uncovered. The same applies to `sonar.exclusions`'
  `**/*.stories.ts`.
- **`sonar.javascript.lcov.reportPaths` lists every package**, per the
  coverage section above.

**RESOLVED — advisory first, blocking at day 30.**

Scan-and-report from the moment `SONAR_TOKEN` is provisioned, with the quality
gate **not** blocking. Then add `sonarqube-quality-gate-action` and make it
required on pull requests **thirty days later**, on a dated calendar entry, not
"when it feels stable".

The reasoning is the same as the coverage ratchet above: a gate turned on
against an unmeasured codebase fails on day one for reasons nobody has triaged,
and the first response is always to disable it. Thirty days of advisory results
tells you what the gate would have blocked, so turning it on is a decision
rather than a surprise.

**Blocking applies to pull requests only.** A push to `main` that fails the gate
should raise an alert, not prevent a deploy — by then the code is already
merged and blocking the pipeline punishes the wrong moment.

**Record the flip date in the workflow file itself**, per
14-code-style-and-linting.md's rule that a gate below full strength carries its
reason, its trigger and its owner.

## Dependency management
### Dependabot — required configuration
At the repository root, `.github/dependabot.yml`:

- **npm ecosystem**, `directory: /pqms-portal`, `interval: weekly`,
  `open-pull-requests-limit: 10`, with **minor and patch updates
  grouped** into a single PR, and commit messages prefixed `chore` with
  the scope included.
- **github-actions ecosystem**, `directory: /`, weekly, commit prefix
  `ci`.

The ecosystem key is **`npm`, not pnpm** — the npm ecosystem reads a
pnpm lockfile, and there is no separate pnpm ecosystem to select.

**Why minor and patch are grouped**: ungrouped, one weekly run on a
workspace this size opens enough PRs to reach the 10-PR limit, and a
review queue that long gets reviewed by nobody. Grouping makes routine
bumps a single PR and leaves majors — the ones that actually need a
human — as individual PRs where they are visible.

Provenance: this is `kus-pqms`'s configuration, carried forward because
each part of it is doing work rather than because it was there.

### Dependabot is not vulnerability scanning
Dependabot opens a PR when a newer version exists. It does not scan the
installed tree against a vulnerability database on its own schedule.
The two are easy to conflate and one does not substitute for the other.

**Requirement: a `pnpm audit` step in the `quality` job** (or a
dedicated job), so a known-vulnerable dependency fails CI rather than
waiting on whoever happens to read a Dependabot PR.
13-security-standards.md's "Dependency security" section points at
12-performance-guidelines.md's dependency-evaluation principle
(maintenance status, bundle size) but establishes no enforced step —
this is that step.

Provenance: `kus-pqms` had no vulnerability scanning of any kind — no
audit step in either workflow, no Snyk, no Socket.dev. Dependabot was
the whole of it, which is why this is written as new required work
rather than a carried-forward practice.

**RESOLVED — fail at `high`, warn below it, allowlist with an expiry.**

`pnpm audit --audit-level=high` in the gating job. Anything `moderate` or below
runs in a separate non-gating step whose output is visible but does not fail the
build.

The default (exit non-zero on *any* advisory) fails routinely on low-severity
findings in transitive dev dependencies with no available fix. A check that is
red most mornings is a check nobody reads, and it takes the high-severity
findings down with it.

**The allowlist is the pressure valve, and it expires by construction:**

| Field | Rule |
|---|---|
| Advisory ID | exact, never a package wildcard |
| Reason | why it is not actionable — usually "no fix published" or "dev-only, not in the bundle" |
| Expiry date | **required**, maximum 90 days |
| Owner | a person |

An entry past its expiry fails the build. That is the whole mechanism: it makes
forgetting impossible, and re-upping an entry is a deliberate act with a name
attached.

**A production dependency is never allowlisted at `high` or `critical`.** If
there is no fix, the dependency is the problem.

## Secrets management
Secrets are never committed to a workflow file or to source. They are
referenced through **GitHub Secrets** (`secrets.NAME`), with a presence
check before any step that needs one — the `SONAR_TOKEN` guard above is
the pattern to copy.

What counts as a secret rather than public configuration is not this
file's call: see 08-authentication-and-authorization.md for the
credential and token surface, and 13-security-standards.md for the
`VITE_*` inventory. One point from 13 worth restating because it is a
CI-time mistake: **every `VITE_*` value is compiled into the bundle and
is therefore public**, whatever it is named and wherever CI reads it
from. Putting a real secret in a `VITE_*` variable does not protect it
by routing it through GitHub Secrets.

## Storybook in CI — unspecified
Per 01-project-structure-and-architecture.md, Storybook is the
component verification surface and standing it up with
`@storybook/react-vite` is new work. **Nothing specifies whether CI
builds it.**

**RESOLVED — yes, path-filtered, non-blocking on the first failure.**

Add the step, but only on pull requests that touch `packages/ui-library/**` or
`apps/portal/**/*.stories.tsx`. That answers both sides of the trade: a broken
Storybook is caught by the commit that broke it, and PRs that cannot possibly
have broken it pay nothing.

**Be precise about what it catches.** It is a *build* check. It does not run the
a11y addon's checks — those are manual per 10-testing-standards.md — so it
catches a broken import or a missing arg type and **no accessibility
regression whatsoever**. A team that believes otherwise has a gap it cannot see,
which is worse than having no step.

24-storybook-authoring.md's story-presence rule is the complementary check, and
it belongs in review rather than in CI.

Provenance, and why there is no precedent to fall back on: `kus-pqms`
had `storybook` and `build-storybook` scripts at the root and in both
`ui-library` and the app, and **neither workflow invoked either one.**
The question was never asked there, so nothing about it carries
forward.

## Deployment target — unspecified, and this file cannot fill it in
No deployment target is chosen. This file therefore specifies **no
deploy job, no deploy step and no deploy trigger** — the target
determines the artifact shape, the authentication model, and whether
deployment is a GitHub Actions concern at all, so a deploy stage
written now would be invented rather than specified.

Provenance: `kus-pqms` had none either — no Static Web Apps config, no
App Service reference, no Dockerfile, no Kubernetes manifest, and no
Terraform-provisioned hosting resource for the frontend, while the
backend services had all of those. So the absence is longstanding
rather than something this rewrite dropped. Tracked in
18-project-context-and-implementation-status.md; a deploy stage is
added here once there is a real target to design one against. See also
13-security-standards.md, which reaches the same conclusion from the
security side.

## Branch protection — configured outside the repository
Branch protection lives in repository settings, not in a file in the
repo, so this file specifies **what to require**, and asserts nothing
about what is currently configured:

- Both the `quality` and `e2e` checks must pass.
- At least one review.
- Applied to the default branch.

Whether the Sonar check joins that list is the placeholder above.
Nothing inside the repo can verify these settings, so if it matters,
someone opens the settings page and checks — this file is the record of
what they should find, not evidence that they will.

## Guard an optional gate, and make the skip visible
The prior repository's SonarQube workflow is **separate from the main quality
pipeline**, and every step in it is conditioned on a detected secret:

```yaml
- name: Detect Sonar secret
  id: guard
  run: echo "enabled=${{ secrets.SONAR_TOKEN != '' }}" >> "$GITHUB_OUTPUT"
```

with a final step that runs only when the guard is false and prints
"SONAR_TOKEN not set — skipping SonarQube scan."

Three things to copy:

- **Separate workflow.** A missing org secret can then never break the gate that
  every PR depends on.
- **The guard.** A fork, a fresh clone or a not-yet-provisioned repository gets
  a green pipeline instead of a permanently red one that everybody learns to
  ignore.
- **The visible skip step.** This is the part that is usually omitted, and it is
  what stops "guarded" quietly becoming "never runs". A skip nobody can see is
  indistinguishable from a pass.

The scan also needs `fetch-depth: 0` — new-code analysis is blame-based and a
shallow checkout silently degrades it.

## The Sonar configuration must agree with 10, in the same commit
`sonar.tests` and `sonar.test.inclusions` name the test location.
10-testing-standards.md names the test location. **In the prior repository these
disagree**, and the result is that every colocated spec is analysed as
production source — inflating the measured codebase and applying production
rules to test code.

Nothing detects this. It is not a build failure, it is a quietly wrong metric.
**So it is a review rule:** a change to test placement and a change to
`sonar-project.properties` land together, and 16-code-review-checklist.md checks
for the pair.

Also declare, explicitly: `sonar.sources` (each package's `src`),
`sonar.exclusions` (stories, build output, `.d.ts`, generated token CSS, any
`*.config.*`), the lcov report path, and `sonar.sourceEncoding=UTF-8`.

## The quality job, in order
The prior pipeline runs, and this order is right: **type-check → lint → format
check → build → unit tests with coverage → upload coverage `if: always()`**,
with E2E as a **separate job** that installs only the browser it needs.

Type-check first because it is the fastest signal on the most common breakage.
Format check before build because it costs seconds. **Coverage uploaded even on
failure** — the run where the gate failed is the run where you most need the
report.

Supporting configuration worth stating rather than rediscovering:
path-filtering to the frontend directory, a `concurrency` group with
`cancel-in-progress` keyed on the ref, `defaults.run.working-directory`, Node
resolved from `.nvmrc` rather than pinned in the workflow, and the lockfile as
the cache key with `--frozen-lockfile` on install.

**E2E runs in fixtures mode and needs no backend.** The prior Playwright config
forces the fixtures flag in its `webServer` block, so a developer's local `.env`
cannot change what CI runs. Under CI it also sets `forbidOnly`, two retries and
trace-on-first-retry. Copy all four.

# ─────────────────────────────────────────────────────────────
## GitLab CI — this supersedes every GitHub Actions specification above

**Everything above this line describes GitHub Actions. The target repository
runs GitLab CI**, with an AWS CodeBuild path for select stages
(`docs/STACK.md` §6, `docs/CI-ANALYSIS.md`).

**The requirements above still hold; the implementation does not.** Job order,
what gates, what uploads, the Sonar guard, the coverage ratchet — all
platform-neutral and all still required. `.github/` file paths, `uses:` actions,
`secrets.` expressions and `if: always()` are not. Read the sections above for
*what must be true* and this section for *how it is expressed here*.

### What already exists — do not rebuild it

`docs/CI-ANALYSIS.md` records this repository as the organization's
**current best-practice reference (G4 generation)**. That is a strong claim and
it changes this file's job from "specify a pipeline" to "fit into one":

```
.gitlab-ci.yml
.gitlab-ci-templates/
  ├─ environments/   per-env variables
  ├─ jobs/           reusable job templates
  ├─ pipelines/      component pipelines (frontend.gitlab-ci.yml)
  ├─ roles/          cross-account role assumption
  ├─ scripts/        e.g. check-forbidden-licenses.py
  └─ security.gitlab-ci.yml
```

Twelve sequential stages, dev auto-deploying and **stg/prd behind manual
approval**. The frontend already builds with pnpm 11 via Corepack and Node 24.

**Read `docs/CI-ANALYSIS.md` before proposing any pipeline change.** A change
that degrades a reference pipeline to match a document written for a different
platform is the worst outcome available here.

### Path filtering — the mechanism is different and the difference is load-bearing

GitHub's `on.paths` becomes GitLab's `rules:changes`. One constraint from
`docs/STACK.md` §6 that is easy to violate:

> GitLab 14.x-compatible (no `include:rules:changes` which needs 16.4;
> **job-level `changes:` rules instead**)

**So filtering goes on the job, never on the `include`.** Writing
`include:rules:changes` produces a pipeline that is valid on modern GitLab and
fails to parse on the target version — and it fails at *pipeline creation*, so
nothing runs and the failure does not look like a syntax error in a job.

```yaml
frontend:quality:
  extends: .frontend-base
  rules:
    - changes:
        - frontend/**/*
        - .gitlab-ci-templates/pipelines/frontend.gitlab-ci.yml
```

### Job mapping

| Requirement above | GitLab equivalent |
|---|---|
| `concurrency` + `cancel-in-progress` | `interruptible: true` + Auto-cancel redundant pipelines (a **project setting**, not YAML) |
| `defaults.run.working-directory` | `default: { before_script: [cd frontend] }`, or per-job |
| `actions/setup-node` + `.nvmrc` | an image pinned to the `.nvmrc` version, or nvm in `before_script` — the pin must still come **from `.nvmrc`**, not be duplicated in YAML |
| `pnpm/action-setup` | `corepack prepare pnpm@<version> --activate` |
| `cache: pnpm` | `cache: { key: { files: [frontend/pnpm-lock.yaml] }, paths: [.pnpm-store] }` |
| `upload-artifact` + `if: always()` | `artifacts: { when: always, paths: [...] }` |
| Coverage reporting | `artifacts:reports:coverage_report` with `coverage_format: cobertura` — **add `cobertura` to the Vitest reporter list**, which is not there today |
| Job needs | `needs:` — and it must reference a **strictly earlier stage**; `STACK.md` §6 records a same-stage `needs` that had to be fixed |

### Two GitLab-specific facts that change the rules above

**1. The Sonar secret guard is unnecessary here — and something else is.**
The guard above exists because a GitHub fork has no secrets. GitLab CI variables
are project-scoped, so the failure mode is different: a variable that is
**protected** is unavailable on unprotected branches, so the scan silently skips
on every feature branch and runs only on `main`.

**Keep the visible-skip step regardless.** A skip nobody can see is
indistinguishable from a pass, and here it will be a skip on exactly the
branches where review happens.

**2. Branch protection is documented intent, not enforcement.**
`docs/conventions/README.md` §2 records the intended rules — 1 approval, dismiss
stale approvals, resolved threads, no force-push, passing pipelines required —
and **notes that none of it is currently enforced.**

Every "required check" in this file therefore protects nothing until someone
sets it under **Settings → Repository → Protected branches** and **Settings →
Merge requests**. **Verify in the GitLab UI, not in a document**, and treat an
unenforced gate as an open finding rather than a green tick.

### The Sonar resolution, restated for this platform
The thirty-day advisory period and the PR-only blocking still apply. Here the
lever is **"Pipelines must succeed" plus the Sonar job's `allow_failure`**:
`allow_failure: true` during the advisory window, flipped to `false` on the
recorded date. Same decision, different switch.

### The frontend coverage gate
10-testing-standards.md resolves the 90/90/90/80-versus-uniform-85 conflict:
**keep 90 on three, ratchet branches from their measured actual toward 90.** The
pipeline change is the reporter and the threshold; the argument is in that file.

### What this corpus does not own here
`buildspec.yml` and the CodeBuild path, cross-account role assumption, the
twelve-stage deploy graph, SBOM and licence scanning, and every `infra/` concern
(cache headers, CSP, the SPA rewrite — see 12 and 13). **This file specifies the
frontend's jobs and the gates on them. It does not restructure the client's
pipeline.**
