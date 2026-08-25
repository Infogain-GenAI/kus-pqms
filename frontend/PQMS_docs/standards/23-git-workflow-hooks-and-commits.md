# 23 — Git Workflow, Hooks and Commit Conventions
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
Branching, commit messages, the pre-commit/commit-msg/pre-push hook chain,
and the PR shape. Resolves `20`'s open `prepare` placeholder.

## Why this file exists
The Vue project had **Husky v9, `lint-staged`, and commitlint enforcing
Conventional Commits across three active hooks**. None of it is carried
forward and no React file mentions any of it. `20`'s `prepare` script is an
unresolved `[PLACEHOLDER]`. The Conventional Commits requirement has simply
vanished, and `15`'s Dependabot configuration *depends* on it — it specifies
`chore` and `ci` commit prefixes for a convention nothing enforces.

## Branching
| Rule | Detail |
|---|---|
| B-01 | One branch per unit of work. Naming: `<type>/<short-kebab-description>` where `<type>` matches the commit type below — `feat/issue-list-filters`, `fix/chunk-reload-loop`. |
| B-02 | Branch from the default branch; never from another feature branch. |
| B-03 | Rebase onto the default branch before opening a PR; merge commits into a feature branch make its history unreadable. |
| B-04 | **Restates 15's placeholder, does not own it — the default branch's name.** `15` carries the same placeholder: `kus-pqms` triggered CI on `[master, main]`, carrying both rather than resolving which. Name it once, here and in the workflow. **Trigger:** repo creation. **Owner:** Yogesh.**]** |

## Commits — Conventional Commits
`type(scope): subject`, where `type` is one of `feat`, `fix`, `refactor`,
`test`, `docs`, `chore`, `ci`, `perf`, `build`, `style`, `revert`.

| Rule | Detail |
|---|---|
| C-01 | The subject is imperative, lowercase, and carries no trailing period. |
| C-02 | `scope` is the package or feature: `ui-library`, `portal`, `issue-list`, `auth`. |
| C-03 | A commit touching a tier file **and** the generated distribution document is one commit, not two — `16` requires them to move together. |
| C-04 | Enforced by commitlint with `@commitlint/config-conventional` on the `commit-msg` hook. Not a convention; a gate. |

## Hooks — three, via Husky v9
| Hook | Runs | Why not more |
|---|---|---|
| `pre-commit` | `lint-staged`: `eslint --fix` then `prettier --write` on staged files only | Scoped to staged files so the hook stays sub-second. A full lint here trains people to use `--no-verify`. |
| `commit-msg` | `commitlint` | Cheap and catches the thing no later gate catches. |
| `pre-push` | `typecheck` and `lint` across the workspace | **Not the test suite.** Provenance: `kus-pqms` deliberately left the full Vitest run to CI, and that judgement carries — a multi-minute pre-push hook is a hook people disable. |

`--no-verify` is for emergencies and its use is stated in the PR
description.

**RESOLVED (2026-08-24, verified against the repository).**

```
pqms-portal-dev/          <- git root (.git lives here)
├─ BRD/
├─ requirements/
└─ pqms-portal/           <- pnpm workspace root (pnpm-workspace.yaml, turbo.json)
   ├─ apps/portal
   └─ packages/{ui-library,design-tokens}
```

**The git root is one level above the pnpm workspace root**, and it holds
non-code siblings (`BRD/`, `requirements/`). There is no `.git` inside
`pqms-portal/`. So:

| Setting | Value |
|---|---|
| `prepare` script | `cd .. && husky pqms-portal/.husky` |
| `core.hooksPath` | `pqms-portal/.husky/_` |
| Hook working directory | git passes the **git root**; every hook `cd`s to `pqms-portal` first |

This is the same shape the prior repository had, which is why its three hooks
transfer nearly verbatim — see the section below.

This also closes the matching placeholder in 20-glossary-and-appendix.md.

## Pull requests
| Rule | Detail |
|---|---|
| P-01 | One concern per PR. One component = one PR; one foundation task = one PR. Provenance: the prior repository’s 30-working-day React migration plan's working agreements. |
| P-02 | The description names the **FR ID** from the BRD that the change implements, per the BRD's own `TR-02`. A PR with no requirement reference is a PR nobody can trace. |
| P-03 | The gate runs green **before** review is requested. A red gate means the PR is not ready for a reviewer's time. |
| P-04 | **Every PR states its AI-assistance level:** `none` / `drafted` / `generated`. Carried from the prior repository’s 30-working-day React migration plan. Humans review and own the result regardless. |
| P-05 | No self-merge. At least one human review. |
| P-06 | A PR that lowers a coverage threshold, disables a lint rule, or adds an `eslint-disable` carries a written justification in the description, not only in a comment. |

## Which repository shape are the hooks written for?
The prior repository's three hooks are each about 60% workaround for one fact:
**it is a pnpm project inside a polyglot monorepo** that also holds a backend,
infrastructure and an automation-test suite. `core.hooksPath` is repo-wide and
git supports exactly one, so every hook fires on backend-only commits too.

The consequences, all three of which are non-obvious and were paid for once:

- **`pre-commit`** exits early unless something staged actually lives under the
  frontend directory, then `cd`s there before running the staged-file linter.
- **`commit-msg`** must resolve its argument to an absolute path **before**
  changing directory — git passes the message file relative to the repository
  root, so a `cd` first makes the hook lint the wrong file or no file.
- **`pre-push`** detects whether the push includes frontend changes and **fails
  open** — running the checks — when it cannot tell, e.g. on the first push of a
  new branch. Failing closed there would silently skip the gate on exactly the
  pushes most likely to need it.

**RESOLVED: it is the sub-directory shape.** The git root holds `BRD/` and
`requirements/` alongside `pqms-portal/`, so commits touching only requirements
documents will fire these hooks. **All three guards below are required**, not
optional hardening — without them a documentation-only commit runs
`lint-staged` against a workspace it never touched, and a first push of a new
branch either skips the gate or fails on a path it cannot resolve. If standalone, all three hooks are four lines each and none of the
above applies. If not, all of the above applies and is worth copying verbatim
rather than rediscovering.

### What `pre-push` runs, and what it deliberately does not
Type-check and lint. **Not the unit suite** — the prior repository records the
reason ("~80s ... intentionally left to CI to keep push latency low") and, in
the same comment, exactly how to add it locally for anyone who wants it.

That is the right trade and the right way to record it: a hook slow enough to be
resented is a hook that gets bypassed with `--no-verify`, and a bypassed hook
enforces nothing.

## `.git-blame-ignore-revs` — required before the first bulk commit
A restructure is a large mechanical move-and-reformat. Without a blame-ignore
file, `git blame` on every touched line points at the restructure commit, and
the real authorship history becomes unreachable through the tooling everyone
actually uses — editor gutter annotations, `git blame`, review-time "who wrote
this and why".

**The rule.** Every bulk mechanical commit — the formatting baseline, a rename
sweep, a codemod, a line-ending renormalisation — appends its full 40-character
SHA to `.git-blame-ignore-revs`, **in the commit that follows it**, with a
one-line comment saying what the commit was.

Two supporting points, both easy to miss:

- The file does nothing until a reader enables it
  (`git config blame.ignoreRevsFile .git-blame-ignore-revs`). Put that line in
  19-onboarding-and-dev-workflow.md's first-run sequence, or the file is a
  well-maintained no-op.
- It only works if the commit really was mechanical. **A bulk commit that also
  changes behaviour is unignorable** — which is the enforcement mechanism behind
  30-restructuring-an-existing-react-project.md's rule never to restructure and
  rewrite in the same commit.

# ─────────────────────────────────────────────────────────────
## Lefthook, not Husky — this supersedes the hook mechanics above

**The target repository uses Lefthook** (`lefthook.yml`), not Husky and not
`lint-staged` (`docs/STACK.md` §5, `TEAM-GUIDE.md` §7). Every path resolution,
`prepare`-script and `core.hooksPath` detail above is therefore **withdrawn for
this repository**, including the resolution recorded earlier in this file, which
was derived against a different layout.

**The reasoning above survives the change of tool.** The three problems the
Husky hooks solved — one hooks path for a polyglot repo, argument paths relative
to the git root, and failing open when the push range is unresolvable — are
properties of the *repository*, not of Husky. Lefthook solves the first two
natively; the third is still yours.

### What Lefthook already runs

| Check | Scope | Command |
|---|---|---|
| Spotless (Java) | `backend/**/*.java` | `cd backend && ./gradlew spotlessCheck` |
| ESLint | `frontend/**/*.{ts,tsx,js,jsx}` | `pnpm exec eslint --fix {staged_files}` |
| Prettier | `frontend/**/*.{ts,tsx,js,jsx,css,md,json}` | `pnpm exec prettier --write {staged_files}` |
| ruff | `**/*.py` | `ruff check --fix {staged_files}` |
| Harness conformance | `.claude/**`, `.moai/config/sections/*.yaml`, `CLAUDE.md` | `python3 scripts/validate-harness.py` |

**Lefthook's `glob` + `{staged_files}` replaces `lint-staged` entirely**, and
its per-command `root:` replaces the manual `cd`. So the frontend's staged-file
gate already exists and needs configuring, not building.

### Four things to fix or verify, in order

**1. Prettier is invoked and not declared.** `docs/STACK.md` §8 item 5. The hook
calls `pnpm exec prettier`; `prettier` is not in `frontend/package.json`. Either
it resolves a hoisted transitive copy — working by accident, breaking on any
dependency change — or it fails and is ignored. **Establish which, then declare
the dependency.** Do not delete the step; see 14-code-style-and-linting.md.

**2. The Prettier glob includes `md`, and this corpus says it must not.**
14 excludes Markdown because prose and tables are hand-wrapped for meaning.
The current glob reformats every Markdown file under `frontend/` — **including
`PQMS_docs/` if this corpus lives there.** Narrow the glob or add a
`.prettierignore`; this one has already cost this project two cycles elsewhere.

**3. The harness check runs on the whole repo regardless of what is staged**,
deliberately — it validates zone resolution and `CLAUDE.md` size globally. So a
frontend-only commit still pays for it. That is a stated trade, not a bug, but
it belongs in 19's expectations so nobody reports it.

**4. There is no `pre-push` stage configured.** The reasoning above still holds —
type-check and lint on push, **not** the unit suite. Add it as a Lefthook
`pre-push` with `tsc --noEmit` and ESLint scoped to `frontend/`.

### Commits and merge requests — GitLab, not GitHub

**Conventional Commits still applies**, and there is an extra constraint:
`docs/conventions/README.md` §1 defines a `type:*` **label taxonomy for merge
requests** and states that **MR labels and commit prefixes should agree**. So
the commit type is not only a message convention here — it has a matching label,
and a mismatch is a review finding.

Per `TEAM-GUIDE.md` §3: **no `CONTRIBUTING.md` and no MR template exist.** Both
are worth adding, and the MR template is where this corpus's pull-request rules
— including the AI-assistance declaration — actually get enforced. **A rule
stated only in a standards document is a rule the MR form never asks about.**

Branch naming follows the harness: **`feat/SPEC-<ID>`** for SPEC work
(32-working-within-the-moai-spec-workflow.md). Restructuring commits are SPEC
commits, so they inherit it.

### `.git-blame-ignore-revs` — still required, and now repo-wide
Unchanged and more important: a restructure inside `frontend/` produces bulk
mechanical commits in a repository three other teams read. **Append every bulk
SHA**, and note that the file lives at the **git root**, so backend and infra
bulk commits belong in the same file.

## `.githooks/` — this supersedes both the Husky and the Lefthook sections

**The target repository uses neither.** It has a root `.githooks/` directory —
plain git hook scripts, wired with `core.hooksPath`, and a per-component
`commit-msg.rules` file whose contents differ per component.

So both preceding sections are now **reference material**: the Husky one
describes a tool that is not here, and the Lefthook one describes a tool that is
not here either. **What survives both is the reasoning**, because the problems
being solved are properties of the repository:

| Problem | Still true? |
|---|---|
| One `core.hooksPath` for a multi-component repo | **yes** — all four component directories share it. (An earlier revision said "four submodules". They are ordinary directories in ONE repository — 33-polyglot-monorepo-integration.md owns the withdrawal.) |
| `commit-msg`'s argument is relative to the git root | **yes** — resolve to absolute before any `cd` |
| A push range that cannot be resolved must **fail open** | **yes** |
| Staged-file scoping | **yes**, and now hand-written rather than provided |

### What plain hooks cost that a hook manager gave you free

Husky and Lefthook both provide staged-file filtering. A raw hook does not, so
**it has to be written**, and this is where plain-hook setups usually go wrong:

- **Scope by staged path, explicitly.** `git diff --cached --name-only` filtered
  to `frontend/`, and exit 0 when the list is empty. Without this, a
  backend-only commit runs the frontend linter.
- **Pass the file list to the tool**, rather than letting the tool walk the
  tree. A linter invoked with no arguments lints everything, which is slow
  enough that the hook gets bypassed.
- **Exit codes are the whole contract.** No non-zero exit, no gate. A hook that
  pipes to `tee` or ends in an `echo` returns the exit code of *that*, and
  silently always passes. **This is the most common defect in hand-written
  hooks and it is invisible until something should have failed.**

### Verify three things before trusting any of it

1. **`git config core.hooksPath`** actually points at `.githooks`. It is a local
   config value — it does **not** clone with the repository, so every developer
   sets it or has it set by a bootstrap script. A hooks directory nobody has
   enabled is a directory of inert files.
2. **The scripts are executable** (`git update-index --chmod=+x`). A
   non-executable hook is skipped silently on Unix.
3. **ANSWERED 2026-08-25 — a commit inside `frontend/` DOES fire the root
   hooks.** An earlier revision called this "a question to test, not assume", on
   the premise that `frontend/` was a submodule with its own `.git`. **It is
   not** (33-polyglot-monorepo-integration.md owns that withdrawal), so there is
   one repository, one `core.hooksPath`, and one set of hooks.

   Tested rather than reasoned: a file staged in `frontend/` with a deliberately
   invalid commit message was **rejected** — the root router ran
   `frontend/scripts/pre-commit.sh` and validated the message against
   `frontend/commit-msg.rules`. Because a working hook *blocks*, the test left
   nothing behind.

   **The live risk is item 1 above, not this one.** `core.hooksPath` still does
   not clone, and with no CI anywhere an unbootstrapped clone has **zero**
   enforcement of any kind.

   **A bootstrap now exists:** `frontend/scripts/setup-hooks.mjs`, wired as a
   `prepare` script so `pnpm install` runs it, with `pnpm run hooks:check` to
   verify and a documented one-liner in `frontend/README.md` for anyone who has
   not installed. It is idempotent, verifies hook executability from the **index**
   mode (`100755` — the working-tree bit is meaningless where `core.filemode` is
   false), and refuses to overwrite a `core.hooksPath` already set to something
   else.

   **It does not fully close, and the residue is repository-level.**
   `core.hooksPath` is a single value for the whole repository, so a bootstrap
   living in `frontend/` reaches only people who install there — someone working
   solely in `backend/` still gets nothing. Closing that needs a root-level
   mechanism, which is the repo owner's to choose. Tracked as an open placeholder
   in 18-project-context-and-implementation-status.md.

### `commit-msg.rules` — per component, and that is deliberate

Each component carries its own. **The frontend's file is authoritative for the
frontend, and this corpus reaches into no other component's** —
33-polyglot-monorepo-integration.md's boundary rule applies to conventions as
much as to code.

**Read the frontend's file before writing any commit.** It is the actual
convention here, and Conventional Commits above is a *recommendation* until that
file agrees with it. If the two differ, **the file wins** — it is what the hook
enforces, and a standard that disagrees with the enforcement is a standard
nobody follows.

### Still required, and now easier
**`.gitattributes` already exists at the root.** Confirm it carries
`* text=auto eol=lf`. **`.git-blame-ignore-revs` does not appear to exist** —
create it before the first bulk commit, at the **git root**, shared by all four
components.
