# Folder-Level Git Rule Separation

**Goal:** give `frontend/`, `backend/`, `automation/` and `infrastructure/` independent Git rules —
commit conventions, hooks, linting, tests, ignore rules, CI and review ownership — so that nothing one
team configures can block, slow or break another team's commits.

**Constraint set by the project:** all four components stay in the **single `kus-pqms` repository**.
All code is added here. No separate repositories, no Git submodules.

---

## 1. Approaches considered

| Approach | Verdict |
|---|---|
| Four separate repos wired as Git submodules | **Rejected.** Real isolation, but it requires per-component setup, causes detached-HEAD confusion, needs a pointer-bump commit in the parent after every merge, and turns any cross-component change into two PRs. Rejected as a project decision: everything stays in one repo. |
| Four Husky installs, one per folder | **Impossible.** See §2. |
| One repo, one hook installation, **dispatched per folder** | **Chosen.** Described in this document. |

---

## 2. The constraint that shapes the design

**A Git repository has exactly one hook directory.** Hooks live in `.git/hooks`, and the only way to
relocate them is `core.hooksPath` — a single, repo-wide value. Husky works precisely by setting
`core.hooksPath` to `.husky`.

So `frontend/.husky` *and* `backend/.husky` in one repo is not merely awkward, it is **impossible**:
`core.hooksPath` holds one value, the last `husky install` to run silently wins, and the other team's
hooks stop firing **with no error at all**.

There is therefore exactly **one** `pre-commit` file, **one** `commit-msg` file and **one**
`pre-push` file in this repo. That cannot be changed.

### The way around it

Make those single files **thin routers**. Each one:

1. determines which top-level folders the staged/pushed changes belong to, then
2. runs only those folders' own scripts and configs.

Isolation comes from **routing**, not from separate repositories. A commit touching only `backend/`
never invokes anything under `frontend/` — so a broken `frontend/eslint.config.js` cannot fail a
backend commit. That is the property we are buying.

Teams never edit the routers. Teams edit the config inside their own folder.

---

## 3. Phasing: plumbing now, policy later

No team has chosen its linters, formatters, test runners or quality gates yet. That is fine and does
**not** block this work, because the two halves are independent:

- **Plumbing** — the routers, line-ending rules, setup script, folder wiring. Completely
  tooling-agnostic: `.githooks/pre-commit` only ever runs `<folder>/scripts/pre-commit.sh` and has no
  opinion about what is inside it.
- **Policy** — what those scripts actually check. A one-line edit, whenever a team is ready.

The plumbing is what is expensive to retrofit later; the policy is cheap to change forever. So build
the plumbing now and leave every tooling decision open.

### Decide now vs. decide later

| Thing | When | Why |
|---|---|---|
| Hook routers, `.gitattributes`, `scripts/setup.sh` | **Now** | Tooling-agnostic. Retrofitting means every developer re-runs setup, and you chase down commits made with no hooks active. |
| Per-folder `.gitignore` | **Now** | Cheap, and stops `target/` or `node_modules/` being committed on someone's first day. |
| Per-folder `scripts/pre-commit.sh` / `pre-push.sh` | **Now, as no-op stubs** | The file must exist for routing to work. Its contents are the owning team's to fill in. |
| **Commit message convention** | **Now** | The one real exception — see §3.2. |
| Lint rules, formatters, test runners | Later | Edit one script. No structural impact. |
| `package.json`, `pom.xml`, ESLint / Spotless / commitlint configs | Later | And deliberately so — see §3.3. |
| CI `build` job contents | Later | Add the workflow skeleton any time; fill in steps when there is something to build. |
| Branch protection required checks | Later | A check that does not exist yet cannot be required. |

### 3.1 Stubs must be no-ops, and must announce themselves

If `backend/scripts/pre-commit.sh` calls `mvn spotless:check` today, **every backend commit fails
immediately** — there is no `pom.xml` and no Spotless plugin. Hooks that are hostile from day one get
switched off, permanently, and then nothing is enforced at all.

So every Stage A script succeeds and says what it is:

```sh
#!/bin/sh
# TODO(backend-team): replace with real checks (spotless, checkstyle, ...)
echo "  backend: no checks configured yet"
exit 0
```

Visible enough that it does not quietly remain a stub for six months; harmless enough that it never
blocks anyone.

### 3.2 Why the commit convention is the exception

Rules are as editable as anything else here — but **commit history is append-only.** If the first few
hundred commits are `wip` and `fixed stuff`, no later config fixes them. Changelog generation and a
readable `git log` are lost for that stretch of history.

So adopt conventional commits from commit one, with a **permissive scope**: any lowercase word, and the
scope optional entirely. Nobody has to predict their module names yet. Each team tightens to its own
`scope-enum` in Stage B once the real modules exist.

### 3.3 Do not pre-create build files

When the frontend team runs `npm create vite@latest`, or the backend team generates from Spring
Initializr, those tools expect a clean directory. A pre-existing `package.json` or `pom.xml` means
merge friction or a clobbered file on day one.

Stage A therefore creates **no** `package.json`, **no** `pom.xml`, and no framework config. Teams
scaffold their component, then fill in `scripts/pre-commit.sh`. The router needs no changes when they
do.

---

## 4. Target layout

Stage A files are marked **[A]**; Stage B, added per component as teams start coding, **[B]**.

```
kus-pqms/
├── .githooks/                      [A] the routers: shared, stable, rarely touched
│   ├── pre-commit
│   ├── commit-msg
│   └── pre-push
├── .gitattributes                  [A] keeps hook scripts LF on Windows
├── scripts/setup.sh                [A] one-time developer setup
├── docs/gitmodule-seperation.md    [A] this file
├── CODEOWNERS                      [B] per-folder review ownership (native)
├── .github/workflows/              [B] one workflow per folder
│
├── frontend/
│   ├── .gitignore                  [A]
│   ├── commit-msg.rules            [A] permissive now, tightened later
│   ├── scripts/pre-commit.sh       [A] no-op stub
│   ├── scripts/pre-push.sh         [A] no-op stub
│   ├── commitlint.config.js        [B] replaces commit-msg.rules when adopted
│   ├── .lintstagedrc.json          [B]
│   └── package.json                [B] created by the team's own scaffolding
├── backend/            (same shape)
├── automation/         (same shape)
└── infrastructure/     (same shape)
```

Two things here are **native Git features**, needing no tooling at all:

- **Nested `.gitignore`** — Git reads a `.gitignore` in every directory. Each folder genuinely owns its
  ignore rules; `frontend/.gitignore` can list `node_modules/` while `backend/.gitignore` lists
  `target/`, with no interaction.
- **Nested `.gitattributes`** — same mechanism, so line-ending and binary rules are also per-folder.

The root `.gitignore` should hold only genuinely repo-wide entries (`.idea/`, `.vscode/`, `.DS_Store`,
`Thumbs.db`, `.env`).

---

## 5. The routers  **[Stage A]**

Written in POSIX `sh` on purpose. **No root `package.json`, no Node at the repo root** — a backend
developer who never touches `frontend/` must never be forced to install Node in order to commit.

### `.githooks/pre-commit`

```sh
#!/bin/sh
# Router: run only the checks belonging to folders with staged changes.
CHANGED=$(git diff --cached --name-only --diff-filter=ACMR \
          | cut -d/ -f1 | sort -u)

STATUS=0
for c in $CHANGED; do
  [ -f "$c/scripts/pre-commit.sh" ] || continue
  echo "→ $c: running pre-commit checks"
  if ! ( cd "$c" && sh scripts/pre-commit.sh ); then
    echo "✗ $c: pre-commit checks failed"
    STATUS=1
  fi
done

[ "$STATUS" -eq 0 ] || echo "Commit blocked. Fix the above, or bypass with --no-verify."
exit $STATUS
```

`--diff-filter=ACMR` restricts to added/copied/modified/renamed files, so deleting a whole folder does
not trigger checks against files that no longer exist.

Every component's script runs even if an earlier one fails (`STATUS=1` rather than an early `exit`), so
a developer touching two folders sees both sets of problems in one go.

### `.githooks/commit-msg`

```sh
#!/bin/sh
# Router: enforce each component's own commit-message convention.
MSG_FILE=$1
CHANGED=$(git diff --cached --name-only | cut -d/ -f1 | sort -u)
HEADER=$(head -n1 "$MSG_FILE")

# Let Git's own generated commits through untouched.
case "$HEADER" in
  Merge*|Revert*|fixup!*|squash!*) exit 0 ;;
esac

COUNT=$(echo "$CHANGED" | wc -w | tr -d ' ')
if [ "$COUNT" -gt 1 ]; then
  echo "⚠ This commit touches multiple components: $CHANGED"
  echo "  Prefer splitting it. Cross-cutting commits use: chore(repo): <subject>"
fi

STATUS=0
for c in $CHANGED; do
  if [ -f "$c/commitlint.config.js" ]; then
    # Stage B, Node components: commitlint, run from inside the folder so it
    # picks up that folder's config. MSG_FILE is repo-relative, so step back.
    ( cd "$c" && npx --no-install commitlint --edit "../$MSG_FILE" ) || STATUS=1
  elif [ -f "$c/commit-msg.rules" ]; then
    # Line 1 is the pattern; later '# ' lines are the help text.
    PATTERN=$(head -n1 "$c/commit-msg.rules")
    if ! printf '%s\n' "$HEADER" | grep -qE "$PATTERN"; then
      echo "✗ $c: invalid commit message"
      echo "  got:      $HEADER"
      sed -n '2,$p' "$c/commit-msg.rules" | sed 's/^# /  /'
      STATUS=1
    fi
  fi
done
exit $STATUS
```

Note the `printf ... | grep` form. Writing `grep -qE "$PATTERN" "$(head -n1 "$1")"` would make `grep`
treat the **commit message text as a filename**, and the hook would fail in a baffling way. Pipe the
text in; never pass it as an argument.

The `commitlint.config.js` branch is checked first, so a component migrating to commitlint in Stage B
simply adds that file — no router change, and its `commit-msg.rules` can be deleted at that point.

### `.githooks/pre-push`

```sh
#!/bin/sh
# Router: run only the pushed folders' pre-push checks.
if UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null); then
  RANGE="$UPSTREAM..HEAD"
else
  RANGE="origin/master..HEAD"
fi

CHANGED=$(git diff --name-only "$RANGE" 2>/dev/null | cut -d/ -f1 | sort -u)
[ -n "$CHANGED" ] || exit 0

STATUS=0
for c in $CHANGED; do
  [ -f "$c/scripts/pre-push.sh" ] || continue
  echo "→ $c: running pre-push checks"
  ( cd "$c" && sh scripts/pre-push.sh ) || STATUS=1
done
exit $STATUS
```

---

## 6. Stage A — per-folder files created now

Identical in shape across all four folders. They differ later, and the router already supports that.

### 6.1 `<folder>/commit-msg.rules`

The same permissive pattern in all four folders for now — scope optional, any lowercase word:

```
^(feat|fix|refactor|perf|test|docs|build|ci|chore|revert)(\([a-z0-9._-]+\))?!?: .{1,72}$
# Expected: <type>(<optional-scope>): <subject>
# Types:    feat fix refactor perf test docs build ci chore revert
# Example:  feat(issue-service): add bulk update endpoint
```

Tighten per component in Stage B — either by narrowing this regex or by switching to
`commitlint.config.js`.

### 6.2 `<folder>/scripts/pre-commit.sh` and `pre-push.sh`

No-op stubs per §3.1, each naming the team that owns filling it in.

### 6.3 `<folder>/.gitignore`

Minimal and stack-appropriate, kept short so a team's scaffolding tool can extend it without conflict:

| Folder | Entries |
|---|---|
| `frontend/` | `node_modules/`, `dist/`, `build/`, `coverage/`, `*.tsbuildinfo`, `.env*` with `!.env.example` |
| `backend/` | `target/`, `*.class`, `hs_err_pid*`, `replay_pid*` |
| `automation/` | `node_modules/`, `test-results/`, `playwright-report/`, `allure-results/`, `.env*` with `!.env.example` |
| `infrastructure/` | `.terraform/`, `*.tfstate`, `*.tfstate.*`, `*.tfvars` with `!example.tfvars`, `crash.log` |

The `*.tfstate` entries are not optional — Terraform state files routinely contain secrets.

---

## 7. Stage B — per-component tooling, added when each team starts coding

Reference only. Nothing below is created now.

### 7.1 `frontend/` — commitlint + lint-staged

```json
{
  "name": "kus-pqms-frontend",
  "private": true,
  "scripts": {
    "lint": "eslint .",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

No `husky` dependency and no `prepare` script — hooks are installed once at the repo root via
`core.hooksPath`, not per folder.

```js
// frontend/commitlint.config.js — its own scopes
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['ui', 'api', 'auth', 'dashboard', 'deps', 'config']],
    'subject-max-length': [2, 'always', 72],
  },
};
```

```json
// frontend/.lintstagedrc.json
{
  "*.{ts,tsx,js,jsx,vue}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css,scss,yml,yaml}": ["prettier --write"]
}
```

```sh
# frontend/scripts/pre-commit.sh — run from inside frontend/, so lint-staged
# scopes itself to this folder and reads frontend/.lintstagedrc.json
npx lint-staged
```

### 7.2 `backend/` — Java / Maven, zero Node

```sh
# backend/scripts/pre-commit.sh — fast checks only; a slow hook is a disabled hook
mvn -q spotless:check checkstyle:check || {
  echo "Formatting/style failed. Run: mvn spotless:apply"
  exit 1
}

# backend/scripts/pre-push.sh
mvn -q test
```

Keep `commit-msg.rules` rather than adopting commitlint, so committing Java never requires Node.

### 7.3 `automation/` — its own convention

```js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['test', 'fix', 'feat', 'chore', 'ci', 'docs', 'refactor']],
    'scope-enum': [2, 'always', ['api', 'ui', 'e2e', 'fixtures', 'ci']],
  },
};
```

```sh
# automation/scripts/pre-push.sh — lint and typecheck only; an end-to-end
# suite takes minutes and does not belong in a hook. This team's call alone.
npm run lint && npx tsc --noEmit
```

### 7.4 `infrastructure/` — Terraform

```sh
# infrastructure/scripts/pre-commit.sh
terraform fmt -check -recursive || {
  echo "Not formatted. Run: terraform fmt -recursive"
  exit 1
}
terraform validate
command -v tflint >/dev/null 2>&1 && tflint --recursive
```

Keep `tfsec` / `checkov` in CI rather than in a hook — security scans are too slow to sit in front of
every commit.

---

## 8. Line endings and the executable bit  **[Stage A]**

The team is on Windows, and both of these will otherwise bite.

Root `.gitattributes`:

```gitattributes
* text=auto
.githooks/*  text eol=lf
*.sh         text eol=lf
*.bat        text eol=crlf
*.cmd        text eol=crlf
*.png binary
*.jar binary
```

A hook checked out with CRLF fails as `bad interpreter: /bin/sh^M: no such file or directory`.

Hooks also need the executable bit recorded in the index, or clones produce non-executable hooks:

```bash
git update-index --chmod=+x .githooks/pre-commit .githooks/commit-msg .githooks/pre-push
git update-index --chmod=+x */scripts/*.sh scripts/setup.sh
```

---

## 9. Developer setup  **[Stage A]**

`scripts/setup.sh`:

```sh
#!/bin/sh
set -e
git config core.hooksPath .githooks
echo "✓ hooks enabled (core.hooksPath = .githooks)"

# Install deps only for components that actually have a package.json yet.
for c in frontend automation; do
  if [ -f "$c/package.json" ]; then
    echo "→ installing $c dependencies"
    ( cd "$c" && npm install )
  fi
done
echo "✓ setup complete"
```

One command per clone:

```bash
sh scripts/setup.sh
```

`core.hooksPath` lives in `.git/config`, which **never travels with a clone**. Every developer must run
this once, on every machine. This is the single most important line in the onboarding docs — see §13.

---

## 10. CI — one workflow per folder  **[Stage B]**

In a single repo, `paths:` filtering works correctly and per-folder CI is straightforward. But read the
deadlock warning before marking anything as a required check.

```yaml
name: Frontend

on:
  pull_request:
  push:
    branches: [master]

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      frontend: ${{ steps.filter.outputs.frontend }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            frontend:
              - 'frontend/**'

  build:
    needs: changes
    if: needs.changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm test

  # Mark THIS job as the required status check — it always runs.
  gate:
    needs: [build]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - run: |
          case "${{ needs.build.result }}" in
            success|skipped) exit 0 ;;
            *) exit 1 ;;
          esac
```

### The required-check deadlock — read before configuring branch protection

If a **path-filtered workflow** goes directly into required status checks, then on a backend-only PR the
frontend workflow never triggers, its check never reports, and **the PR can never merge.** GitHub waits
indefinitely for a check that will never arrive.

The `gate` job is the fix: it always runs, and passes when `build` was skipped. **Mark `gate` required,
never `build`.**

---

## 11. Review ownership  **[Stage B]**

Root `CODEOWNERS` — native, per-folder, no tooling:

```
/frontend/        @Infogain-GenAI/frontend-team
/backend/         @Infogain-GenAI/backend-team
/automation/      @Infogain-GenAI/qa-team
/infrastructure/  @Infogain-GenAI/devops-team
/.githooks/       @Infogain-GenAI/devops-team
/.github/         @Infogain-GenAI/devops-team
```

With "Require review from Code Owners" enabled, a frontend-only PR needs only frontend approval. The
four teams must exist in the org first.

**Release tagging**, since tags are repo-wide, uses a prefix convention:
`frontend-v1.2.0`, `backend-v0.9.3`, `automation-v1.0.0`, `infrastructure-v2.1.0`.

---

## 12. What this cannot do

| | This approach | Separate repos |
|---|---|---|
| Per-folder hooks, lint, tests | ✅ | ✅ |
| Per-folder commit conventions | ✅ | ✅ |
| Per-folder `.gitignore` / `.gitattributes` | ✅ native | ✅ |
| Per-folder CI | ✅ (better — real path filters) | ✅ |
| Per-folder review ownership | ✅ CODEOWNERS | ✅ |
| Per-folder **branch protection rules** | ❌ one ruleset per branch | ✅ |
| Independent release versioning | ⚠️ prefixed tags only | ✅ |
| Per-folder **write access control** | ❌ repo-level only | ✅ |
| Cross-component change in one PR | ✅ | ❌ two PRs + pointer bump |
| Coordination overhead | ✅ none | ❌ significant |

Two hard limits:

1. **Branch protection is per-branch, not per-folder.** One ruleset governs `master`. Required *checks*
   effectively vary via the `gate` pattern, but "require 2 reviews for infrastructure, 1 for frontend"
   is not expressible.
2. **Anyone with repo write access can write to any folder.** CODEOWNERS requires review on a PR; it
   does not prevent a direct push. If a team must be technically unable to modify another's code, only
   separate repositories deliver that.

---

## 13. Gotchas

Ranked by how often they actually bite.

1. **Hooks silently do nothing until `core.hooksPath` is set.** A fresh clone has no hook config, so
   commits are never validated — with **no warning**. The developer assumes the rules are running and
   passing. Symptom: weeks later, half the commit messages are unparseable. Mitigations: put
   `sh scripts/setup.sh` at the top of the README, and **re-check every rule in CI**.
2. **`--no-verify` bypasses every hook.** By design, one flag. Combined with #1: **hooks are fast
   feedback; CI plus branch protection is the actual enforcement boundary.** Every rule that matters
   must exist in both places.
3. **Required checks + path filters deadlock the PR.** See §10. Mark `gate` required, never `build`.
4. **Commits from the GitHub web UI run no hooks** — no local machine is involved. Only CI catches those.
5. **CRLF breaks hooks** on Windows — `bad interpreter`. Fixed by the root `.gitattributes` in §8.
6. **Missing executable bit** — fixed by `git update-index --chmod=+x` in §8.
7. **A commit spanning two folders runs both toolchains** and must satisfy both conventions. The
   `commit-msg` router warns about this. Encourage one commit per component.
8. **Files at the repo root have no component**, so `cut -d/ -f1` yields e.g. `README.md`. Harmless —
   the router skips anything without a `scripts/pre-commit.sh` — but do not name a folder after a root
   file.
9. **`npx --no-install commitlint` fails if deps are missing.** Intentional: it surfaces the missing
   `npm install` instead of silently skipping validation. Keep `--no-install`, or a typo'd package name
   could trigger a surprise network install mid-commit.
10. **Stubs can outlive their welcome.** A no-op `pre-commit.sh` prints "no checks configured yet" on
    purpose. If that line is still appearing months into development, the gate is not real yet.

---

## 14. Verification

**Routing works — the central claim.**

```bash
echo "# note" >> backend/README.md && git add backend/README.md
git commit -m "docs(backend): note"
# EXPECT: "→ backend: running pre-commit checks" and NO mention of frontend
```

**Isolation — a broken frontend config must not block a backend commit.** (Meaningful once Stage B
tooling exists; with stubs, the equivalent test is to make a folder's script exit 1.)

```bash
# 1. Make the frontend gate fail deliberately
printf '#!/bin/sh\nexit 1\n' > frontend/scripts/pre-commit.sh

# 2. Commit a backend-only change
echo "# x" >> backend/README.md && git add backend/README.md
git commit -m "docs(backend): unaffected"     # EXPECT: succeeds

# 3. Now stage a frontend change
git add frontend/scripts/pre-commit.sh
git commit -m "chore(frontend): break"        # EXPECT: blocked

# 4. Restore
git checkout -- frontend/scripts/pre-commit.sh
```

**Commit convention is enforced.**

```bash
git commit --allow-empty -m "wip"                      # EXPECT: rejected
git commit --allow-empty -m "chore(repo): valid"       # EXPECT: accepted
```

**Nested ignore files are active.**

```bash
git check-ignore -v frontend/node_modules/x backend/target/x infrastructure/.terraform/x
# EXPECT: each matched by its OWN folder's .gitignore, not the root one
```

**Hooks are wired, executable and LF.**

```bash
git config --get core.hooksPath           # → .githooks
git ls-files -s .githooks/                # → mode 100755 on all three
file .githooks/pre-commit                 # → must NOT say "CRLF line terminators"
```

---

## 15. Rollback

Everything is ordinary files plus one local config setting:

```bash
git config --unset core.hooksPath    # disables all hooks immediately
git revert <commit>                  # or delete .githooks/ and the per-folder scripts
```

No history rewriting, no repos to delete. The main practical advantage over the submodule approach.

---

## 16. Execution order

| # | Step | Stage | Changes shared state? |
|---|---|---|---|
| 1 | Root `.gitattributes`, `.githooks/` routers, `scripts/setup.sh` | A | no |
| 2 | Per-folder `commit-msg.rules`, stub scripts, `.gitignore` | A | no |
| 3 | Mark hooks and scripts executable in the index | A | no |
| 4 | Trim the root `.gitignore` to repo-wide entries | A | no |
| 5 | Run the §14 verification suite locally | A | no |
| 6 | Commit | A | no |
| 7 | Push; update README onboarding | A | **yes** |
| 8 | Real checks per component, as each team starts coding (§7) | B | **yes** |
| 9 | `CODEOWNERS`; CI workflows with the `gate` pattern; branch protection | B | **yes** |

Steps 1–6 are entirely local and safe to iterate on.

---

## 17. Implementation prompts

Paste one at a time, reviewing each result before continuing. Prompts 1–5 are Stage A and touch nothing
outside the working tree.

### Prompt 1 — Routers and setup scaffolding

```
Implement step 1 of docs/gitmodule-seperation.md section 16. Create the three routers in .githooks/
exactly as specified in section 5 (POSIX sh, no Node at the repo root), the root .gitattributes from
section 8, and scripts/setup.sh from section 9. Run `git config core.hooksPath .githooks` locally.
Do not commit yet — show me the files.
```

### Prompt 2 — Per-folder Stage A files

```
Implement section 6 of docs/gitmodule-seperation.md for all four folders: commit-msg.rules with the
permissive conventional-commit pattern (identical in all four for now), no-op pre-commit.sh and
pre-push.sh stubs that echo which component they are and exit 0, and the minimal per-folder
.gitignore from the section 6.3 table. Create NO package.json, NO pom.xml and no framework config —
see section 3.3.
```

### Prompt 3 — Executable bits and line endings

```
Mark every hook and script executable in the index per section 8: the three .githooks routers,
scripts/setup.sh, and all eight per-folder scripts. Then verify with `git ls-files -s` that they are
mode 100755, and with `file` that none has CRLF line terminators.
```

### Prompt 4 — Trim the root .gitignore

```
Now that each folder has its own .gitignore, reduce the root .gitignore to genuinely repo-wide
entries only (.idea/, .vscode/, .DS_Store, Thumbs.db, .env). Move anything stack-specific into the
folder it belongs to. Verify with git check-ignore -v that each path is matched by its own folder's
file rather than the root one.
```

### Prompt 5 — Prove the isolation works

```
Run the full section 14 verification suite and report each check as pass or fail with real command
output. In particular prove the central claim: make frontend/scripts/pre-commit.sh exit 1, show a
backend-only commit still succeeds, then show that staging the frontend change is blocked. Also
prove the commit convention rejects "wip" and accepts "chore(repo): valid". Revert all deliberate
breakage and confirm the working tree is clean.
```

### Prompt 6 — Commit Stage A

```
Commit the Stage A work in logical commits: one for the hook routers, .gitattributes and setup
script; one for the per-folder configs and stubs; one for the root .gitignore reorganisation. Use
the conventional-commit format the new hooks enforce. Do not push. Show me git log and git status.
```

### Prompt 7 — README onboarding

```
Write a "Getting started" section at the top of the root README: run `sh scripts/setup.sh` before
your first commit; hooks do nothing until core.hooksPath is set, and fail silently if it is not;
--no-verify bypasses them; CI is the real enforcement boundary. Include the commit message format
with one example. State that each folder owns its own checks in scripts/pre-commit.sh. Keep it
under 40 lines.
```

### Prompt 8 — Stage B, per component (run once per team, when they start coding)

```
The <component> team is starting work and has chosen <tools>. Fill in
<component>/scripts/pre-commit.sh and pre-push.sh with real checks per section 7 of
docs/gitmodule-seperation.md, keeping pre-commit fast. If they want commitlint, add
<component>/commitlint.config.js with their scope list and delete their commit-msg.rules — the
router prefers commitlint automatically. Do not touch any other folder.
```

### Prompt 9 — CI and branch protection

```
Implement sections 10 and 11 of docs/gitmodule-seperation.md: four workflows each with the
changes/build/gate three-job structure using dorny/paths-filter, and the root CODEOWNERS. Add a
comment in each workflow stating that `gate` is the job to mark as a required status check and
`build` must never be, per the deadlock warning. Check via gh whether the four teams exist. Give me
the exact steps to configure branch protection, but do not apply them until I confirm.
```
