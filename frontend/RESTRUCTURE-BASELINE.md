# RESTRUCTURE-BASELINE.md — Phase 0 snapshot

> ⚠️ **HISTORICAL RECORD. ITS `PQMS_docs/` PATHS NO LONGER RESOLVE, AND THAT IS
> LEFT AS-IS ON PURPOSE.** The corpus this document was measured against was
> removed when `frontend/` moved repos. Every `PQMS_docs/...` reference below is
> therefore dangling, and at least one assertion is now factually stale: the line
> stating that `.prettierignore` contains `PQMS_docs/**` was true when measured
> and is no longer true — that entry was removed with the corpus.
>
> These lines are NOT being corrected, because this file is a dated transcript of
> what was measured on 2026-08-25, quoted command output included. Editing the
> measurements to match today would destroy the only thing the file is for. Read
> it as history; do not read any path in it as a live pointer.

**Class:** dated snapshot. Reference, not a standard.
**Date:** 2026-08-25
**Scope:** `frontend/` only.
**Governing:** `PQMS_docs/standards/00-core-rules.md`,
`30-restructuring-an-existing-react-project.md` (Phase 0),
`PQMS_docs/decisions/0001-frontend-is-always-a-pnpm-workspace.md`,
`PQMS_docs/steps-for-new-repo.md` Step 3.

**Method:** every number below was measured on this machine on the date above,
against commit `bb2c891`, and each is given with the command that reproduces it.
Nothing here is quoted from a prior document. Where a measurement disagrees with
`steps-for-new-repo.md`, the disagreement is stated rather than reconciled.

**Acceptance:** zero files under `frontend/src` in the diff. Report only.
Verified — `git status --short src/` is empty.

> **Read this first.** Four of this runbook's stated premises did not survive
> measurement: the four component folders are **not** git submodules, the
> fidelity harness **does not run** on this machine, the numeric-loophole count
> is **348 not 415**, and the corpus commit **was not additions-only**. Each is
> evidenced below. Steps 5 and 6 are written against the old premises and need
> revising before they are executed.

---

## Part 0 — Are Steps 0, 1 and 2 actually complete?

| Step | Runbook's "Done when" | Verdict |
|---|---|---|
| 0 | `.prettierignore` excludes the corpus | ✅ **Complete** |
| 1 | `node scripts/build-standards-doc.mjs --check` passes | ✅ **Complete** |
| 2 | committed in `frontend/`; additions only; parent pointer committed | ❌ **Not met as specified** |

### Step 0 — complete, and the formatter demonstrably never ran

`frontend/.prettierignore` exists and contains `PQMS_docs/**` and `**/*.md`.

The two side-questions Step 0 asks are answered, and both answers are "nothing":

- **No script in `.githooks/` invokes Prettier.** All three hooks
  (`pre-commit`, `pre-push`, `commit-msg`) are routers that delegate to
  `<component>/scripts/*.sh`. All four components' `pre-commit.sh` and
  `pre-push.sh` are stubs that `echo` and `exit 0`. A repo-wide grep for
  `prettier` outside `node_modules` hits only BMAD skill files and an
  illustrative (unwired) lint-staged block in `docs/gitmodule-seperation.md`.
- **`prettier` is not a declared dependency** of `frontend/package.json` — not in
  `dependencies`, not in `devDependencies`, zero matches for
  `"node_modules/prettier"` in `package-lock.json`, no binary in
  `node_modules/.bin/`. **`.prettierrc` is orphaned**: a config for a tool that
  is neither installed nor invoked.

This is the same defect class `00-core-rules.md` records for the client template
("Lefthook invokes `prettier --write`; `prettier` is not a declared dependency"),
arriving here in its milder form — the config exists, the invoker does not.

**Independent confirmation the formatter never ran:** the `src/` files modified in
`bb2c891` have identical `--numstat` with and without `-w`, so not one of those
changed lines is whitespace-only. Had Prettier run, reflow would dominate.

**Reproduce:**
```bash
cat frontend/.prettierignore
grep -rniI "prettier" . --exclude-dir=node_modules --exclude-dir=.git -l
git show bb2c891 --format= --numstat -w -- frontend/src/data/store.tsx
```

### Step 1 — complete

- Corpus present at `frontend/PQMS_docs/` — **34 tier files** under `standards/`.
- `frontend/scripts/build-standards-doc.mjs` present (15,796 bytes).
- Both scripts declared in `package.json` (`docs:standards`, `docs:standards:check`).
- `CHANGES.md` — **absent**, as Step 1 requires.
- `PROMPT-Frontend-Development-Standards-AI-Review-v1.0.md` — **present**. Step 1
  says delete "unless you want it", so this is a choice, not a defect. Flagged
  for a decision, not counted against the step.

```
$ node scripts/build-standards-doc.mjs --check
build-standards-doc: PQMS_docs/Frontend-Development-Standards-v1.0.md is up to date (34 tier files).
exit 0
```

### Step 2 — three deviations, one of which matters

**a. The corpus arrived in two commits, not one.**
`fa25e69` (1975 A, 1 M) then `bb2c891` (47 A, 8 M).

**b. Neither commit message follows the prescribed form.** Step 2 specifies
`docs(frontend): add PQMS frontend standards corpus as reference`. Actual:
`feat: restructing of frontend docs added` and
`feat: added bmad and bmad_output and github rules`. Both *pass*
`frontend/commit-msg.rules` (scope is optional), so the hook did not catch it.
`bb2c891` also contains a typo ("restructing"), and both commits span multiple
top-level folders — the case the hook warns about and suggests `chore(repo):` for.

**c. `bb2c891` is not additions-only — and this is the one that matters.**
Step 2's acceptance is *"Additions only. Any pre-existing file showing
modifications means something reformatted — revert, return to Step 0."*

It modified 8 pre-existing files, **3 of them under `frontend/src/`**:

| File | +/− | whitespace-only? |
|---|---|---|
| `src/features/issues/CreateIssueScreen.tsx` | +39 −47 | **no** |
| `src/data/store.tsx` | +16 −1 | **no** |
| `src/features/issues/IssueListScreen.tsx` | +9 −2 | **no** |
| `package.json` | +4 −2 | no |
| plus `frontend/README.md` and 3 files under `_bmad-output/` | | |

**The trigger Step 2 is watching for did not fire, but a different one did.**
These are deliberate feature changes — V4-V5 multi-select model codes
(`modelCodes`, `yearsByCode`), link-at-creation with reciprocal mirroring —
bundled into the commit that imported the standards corpus.

That violates `30`'s **R-2** (never restructure and rewrite in the same commit)
and Step 2's own "one commit, then stop". It is not recoverable by reverting,
because the source changes are wanted and the corpus is wanted.

**Consequence for this baseline:** every number below is measured at `bb2c891`,
which *includes* those source changes. That is the correct baseline — it is what
is on disk — but it is **not** the state the runbook assumed Step 3 would measure.

**d. The parent-pointer commit Step 2 demands does not exist and is not needed.**
See Part 2 item 1: there is no submodule, so there is no pointer.

---

## Part 1 — Gate numbers

These are the numbers Steps 5 and 6 compare against.

### 1. `lint:adherence` total, broken down by message family

**Total: 662 warnings, 0 errors.** Exactly the `--max-warnings 662` ceiling —
**zero headroom.** The next warning of any kind fails `build`.

**Reproduce (exact command — no package-manager script):**
```bash
cd frontend
npx eslint --config eslint.adherence.config.mjs --max-warnings 662 src
```
For the breakdown:
```bash
npx eslint --config eslint.adherence.config.mjs -f json src > adherence.json
# then bucket messages by prefix (see families below)
```

| Family | Count | Matched by | Nature |
|---|---:|---|---|
| **Raw px value** | **362** | `/^Raw px value/` | real signal |
| **Per-component prop/enum** | **195** | `<X> doesn't accept that prop…` | permanent false positives |
| **Raw hex colour** | **105** | `/^Raw hex colou?r/` | real signal |
| **Import** | **0** | `no-restricted-imports` | already clean |
| **Font not provided** | **0** | `/^Font not provided/` | already clean |
| | **662** | | |

Every one of the 662 is emitted by a single rule — **`no-restricted-syntax`**.
`no-restricted-imports` contributes nothing today, which is exactly why Step 6's
hazard is invisible: a pattern set that already matches zero cannot get quieter,
so **the import half of the gate gives no signal that it broke.**

**The 362/195/105 split reproduces `steps-for-new-repo.md`'s stated composition
exactly.** That is the one place the runbook's numbers were confirmed.

**Step 5.3's ceiling arithmetic, made concrete:** dropping the 195 leaves
**467** as the new ceiling for `lint:ds:values` (362 + 105), and **0** for
`lint:ds:imports`.

### 2. Numeric hard-coded dimensions — the gate's blind spot

**348.** Measured with an AST query, not a grep.

**The query** — the exact selector `steps-for-new-repo.md` Step 5.5 proposes,
run through ESLint's own selector engine so Step 5 inherits a verified number:

```js
'no-restricted-syntax': ['warn', {
  selector: "Property[key.name=/^(padding|margin|gap|width|height|top|right|bottom|left|" +
            "borderRadius|fontSize|minWidth|maxWidth|minHeight|flexBasis)$/] > Literal[value>0]",
  message: 'NUMERIC-DIM',
}]
```

Run against `src/**/*.{ts,tsx}` with `@typescript-eslint/parser`, JSX enabled,
from a config outside the repo so the working tree stayed untouched.
`value>0` correctly skips `padding: 0`.

> ⚠️ **This contradicts the runbook.** `steps-for-new-repo.md` states **415**
> numeric dimensions vs **365** string px literals. Neither reproduces. I ran
> four selector variants to try to recover 415 and none lands there:
>
> | Variant | Count |
> |---|---:|
> | **A — Step 5.5 selector exactly (authoritative)** | **348** |
> | B — descendant (` ` not ` > `) | 359 |
> | C — any property, numeric > 0 | 712 |
> | D — the 15 properties, including 0 and strings | 804 |
>
> **Use 348.** It is the number the Step 5.5 selector will actually produce when
> that story runs, which is the only number that matters for setting its ceiling.
> The runbook's 415 could not be reproduced by any reading of its own selector
> and should be corrected there.

**The loophole is worse than the runbook describes, not better.** Restricting to
the same 15 properties, string-px values (`width: '20px'`) number just **4**,
against 348 numeric. On the property set the closing rule will govern,
**98.9% of hard-coded dimensions are already invisible to the current gate.**
The 362 `Raw px value` warnings are overwhelmingly px strings in *other*
positions (shorthand like `'12px 14px'`, `border`, `boxShadow`), which the Step
5.5 selector does not reach.

**Read together: 662 visible, 348 invisible.** Closing the loophole raises total
tracked violations to roughly 1010 before a single value is converted. Step 5.5's
"own ceiling at the Step 3 number so nothing breaks today" means **348**.

### 3. Per-file warning counts, top 15

```bash
npx eslint --config eslint.adherence.config.mjs -f json src   # then group by filePath
```

| # | Total | px | hex | prop | File |
|---:|---:|---:|---:|---:|---|
| 1 | **157** | 98 | 42 | 17 | `src/features/admin/AdminScreen.tsx` |
| 2 | **150** | 63 | 9 | 78 | `src/features/issues/IssueWorkspaceScreen.tsx` |
| 3 | 74 | 49 | 5 | 20 | `src/features/issues/IssueListScreen.tsx` |
| 4 | 51 | 7 | 1 | 43 | `src/features/issues/CreateIssueScreen.tsx` |
| 5 | 35 | 26 | 5 | 4 | `src/app/AppShell.tsx` |
| 6 | 33 | 24 | 9 | 0 | `src/features/dashboard/DashboardScreen.tsx` |
| 7 | 20 | 7 | 0 | 13 | `src/features/issues/ModelCodeYearPicker.tsx` |
| 8 | 15 | 13 | 2 | 0 | `src/app/chrome.tsx` |
| 9 | 13 | 5 | 2 | 6 | `src/features/issues/PriorityTab.tsx` |
| 10 | 12 | 10 | 2 | 0 | `src/components/navigation/SideNav.tsx` |
| 11 | 11 | 1 | 10 | 0 | `src/components/core/statusMap.ts` |
| 12 | 9 | 8 | 1 | 0 | `src/components/core/Button.tsx` |
| 13 | 9 | 3 | 0 | 6 | `src/features/issues/LinkIssuesSection.tsx` |
| 14 | 8 | 7 | 1 | 0 | `src/components/pqms/DataTable.tsx` |
| 15 | 7 | 2 | 2 | 3 | `src/components/pqms/ApprovalBar.tsx` |

- **57 files linted; 37 carry at least one warning; 20 are clean.**
- **Top 2 = 307 = 46.4%** of all warnings. Confirms Step 8's "46% between them".
- **Top 15 = 604 = 91.2%.** The tail is 22 files sharing 58 warnings.

Top-15 by *numeric* dimensions (item 2) ranks differently and matters for Step 5.5:
`AdminScreen` 54, `IssueWorkspaceScreen` 45, **`PriorityTab` 39**, `IssueListScreen` 33,
`AppShell` 27, `DashboardScreen` 27, `chrome.tsx` 15, `IssueCard` 10, `DataTable` 8.
**`PriorityTab.tsx` is 9th on the visible gate but 3rd on the invisible one** — it
would be missed entirely by planning from the adherence numbers alone.

### 4. `tokens:check` result and token count

```bash
node scripts/check-tokens.mjs
# ✓ token-diff gate: 156 tokens match the design-system manifest.   exit 0
```

**Passes. 156 tokens.**

Three facts worth recording beyond the headline:

- **Coverage is complete in both directions.** The vendored token CSS defines
  156 custom properties; the manifest lists 156; **0 are defined in CSS but
  absent from the manifest.** The gate's one-directional design (it iterates
  manifest → CSS) has no blind spot *today*, but it would not notice a new
  CSS-only token tomorrow.
- **No generated-file drift.** Re-running `gen-tokens.mjs`'s exact logic with its
  output redirected to a scratch path produces a file **byte-identical**
  (LF-normalised) to the committed `src/tokens/tokens.generated.ts`. Step 5.6's
  drift check would pass today. *I did not run `tokens:gen` itself* — it writes
  unconditionally into `src/`, which the acceptance criterion forbids.
- **Every `var(--x)` reference resolves.** 1,829 call sites across 119 distinct
  token names, **0 unresolved**. The `var(--space-41)` hazard Step 5.7 targets is
  real as a class but has **zero instances**, so that gate starts clean at 0 and
  is pure regression protection.

**And the runbook's characterisation holds:** `tokens:check` is **not** in
`build` (`build = tsc --noEmit && lint:adherence && vite build`) and the hooks
that could run it are stubs. It has never had the opportunity to fail.

**`cssVar()` adoption is zero** — 0 call sites outside the generated file itself.
Confirms the runbook; supports Step 5.7's "validate names, don't chase adoption".

---

## Part 2 — Tooling reality

### 1. Submodules — **they are not submodules. They are ordinary directories.**

This is the finding that changes the most downstream work.

```bash
$ git submodule status          # no output, exit 0
$ cat .gitmodules               # No such file or directory
$ ls -ld frontend/.git          # No such file or directory
$ git ls-files -s | awk '$1=="160000"'   # no gitlinks
```

| Directory | `.git` present? | mode in index |
|---|---|---|
| `frontend/` | **none** | `100644` (ordinary files) |
| `backend/` | none | `100644` |
| `automation/` | none | `100644` |
| `infrastructure/` | none | `100644` |

There is **one** git repository, rooted at `KUS-PQMS/`. `frontend/` is a plain
subdirectory of it. Your inference from "everything landed in two commits
together" was correct.

**What this invalidates:**

| Assumption | Where stated | Reality |
|---|---|---|
| "four git submodules" | `00-core-rules.md`, runbook pass 2 | ordinary directories |
| Step 2's "parent needs a second commit moving the pointer" | Step 2 ⚠️ | **no pointer exists**; the commit is complete as-is |
| Step 5.1's "a submodule does not inherit the parent's `.gitattributes`" | Step 5.1 | **it does inherit** — see item 4 |
| Step 3 item 7's "a submodule has its own `.git` and may fire nothing" | Step 3 | hooks fire normally — see item 2 |
| "Your commits appear to vanish / the parent shows one opaque pointer" | troubleshooting table | cannot occur |
| Decision 5's "`infrastructure/` is therefore a separate submodule and a separate merge request" | Step 4 | same repo, so same MR is possible |

**Step 6 is affected directly.** A workspace split inside `frontend/` is an
ordinary directory move within one repository — no submodule pointer to update,
no two-repository commit ordering, and `git mv` history-follows works normally.
That part of Step 6 gets simpler. The lint-glob hazard it warns about is
unaffected and remains real.

### 2. Do hooks fire from inside `frontend/`? — **Yes. Tested, not inferred.**

`core.hooksPath = .githooks`, set in `.git/config`.

**Test method:** staged a throwaway file in `frontend/`, committed with a
deliberately invalid message. A working `commit-msg` hook *rejects* it, so a
firing hook leaves zero trace. Result:

```
-> frontend: running pre-commit checks
   frontend: no pre-commit checks configured yet
x  frontend: invalid commit message
   got: THIS MESSAGE IS DELIBERATELY INVALID for hook test
   Expected: <type>(<optional-scope>): <subject>
--- exit 1 ---   HEAD unchanged (bb2c891)
```

**Both hooks fired.** The `pre-commit` router resolved `frontend` from the staged
path and ran `frontend/scripts/pre-commit.sh`; `commit-msg` validated against
`frontend/commit-msg.rules` and blocked the commit. Throwaway file removed;
index and HEAD verified unchanged.

**But the mechanism is fragile in a way the runbook already names:**
`core.hooksPath` lives in `.git/config`, which is **local and does not clone**.
Hooks fire for whoever ran the setup; a fresh clone gets nothing until someone
runs `git config core.hooksPath .githooks`. **No repository file enforces this**
— I found no bootstrap script, no `postinstall`, no documented step.

**And the routers currently gate nothing.** All four `pre-commit.sh`/`pre-push.sh`
are `echo`-and-`exit 0` stubs. `commit-msg` is the only hook with teeth.

### 3. Pipeline definition — **none exists, anywhere.**

Searched to depth 4 from the repo root, excluding `node_modules`, for
`.gitlab-ci.yml`, `.github/workflows/**`, `azure-pipelines.yml`, `Jenkinsfile`,
`bitbucket-pipelines.yml`, `buildspec.yml`, `.travis.yml`, `cloudbuild.yaml`.
**Zero matches. No `.github/` directory exists at all**, at the root or inside
any component.

**Answer to "which platform": undetermined, because there is nothing to
determine it from.** This is an absence, not a preference. `00-core-rules.md`
carries it as `[PLACEHOLDER — the CI platform]` with trigger "Phase 0 baseline"
and owner "Frontend Lead" — **this document is that trigger, and the placeholder
stays open.** I am not inferring a platform from the client template's GitLab
mention; `00`'s own lesson is that the template described a template.

**Step 5.9 should be read as written:** *"If there is none, that is the story —
say so rather than inventing one."* There is none.

Consequence: **every gate in this repository today is local-only.** Nothing runs
on push, nothing runs on merge, and the `--max-warnings 662` ceiling is enforced
solely by whoever runs `build` on their own machine.

### 4. `frontend/.gitattributes` — **does not exist**, and the root file is not what Step 5.1 expects

- `frontend/.gitattributes` — **absent.**
- Root `.gitattributes` — **present**, and since `frontend/` is not a submodule
  (item 1), **`frontend/` inherits it.**

But it does **not** contain `* text=auto eol=lf`. It contains:

```
* text=auto                 # <- no eol=lf
.githooks/*  text eol=lf
*.sh         text eol=lf
*.bat        text eol=crlf
*.cmd        text eol=crlf
```

**`* text=auto` without `eol=lf` normalises to LF in the repository but checks
out CRLF on Windows.** Git confirmed this live during the hook test:

```
warning: in the working copy of 'frontend/.hooktest-throwaway.txt',
LF will be replaced by CRLF the next time Git touches it
```

**So the honest answer is "partially".** The blob-level normalisation `30`'s
"Protect the history you are about to churn" cares about is in place, and the
`.sh`/`.githooks` LF pins that keep hooks executable on Windows are explicit and
correct. What is absent is a working-tree `eol=lf` policy.

**This needs a decision, not a mechanical fix.** Adding `* text=auto eol=lf` at
the root would flip the entire working tree to LF for every Windows developer —
precisely the "second whole-repository diff" `30` warns against. Adding it only
at `frontend/.gitattributes` splits line-ending policy across one repository.
**Recorded as an open question (Part 5, Q4), not actioned.**

`.git-blame-ignore-revs` (Step 5.1's second half): **absent** at root and in
`frontend/`.

### 5. `package-lock.json` alongside pnpm intent — and what actually invokes what

- `frontend/package-lock.json` — **present**, 181,298 bytes, committed.
- `frontend/pnpm-lock.yaml` — **absent.**
- `frontend/pnpm-workspace.yaml` — **absent.**
- No `packageManager` field, no `engines`, no `.nvmrc`, no `.node-version`.

**Which does CI invoke?** Neither — there is no CI (item 3).
**Which does a hook invoke?** Neither — every hook that could is a stub (item 2).

**So today nothing resolves the ambiguity, and nothing surfaces it.** `00`'s
`[PLACEHOLDER — the frontend package manager]` calls two lockfiles "not a
preference, a hazard". The current state is one lockfile (npm) against a
documented pnpm intent (Decision 6, ADR 0001) — the hazard is latent rather than
active, and Step 5.2 is where it closes.

> **Operational warning, learned the hard way in this session.** Running
> `pnpm <script>` in `frontend/` does **not** just run the script. pnpm's
> auto-install preflight adopts the npm-installed `node_modules`, moves 12
> packages to `node_modules/.ignored`, writes `pnpm-lock.yaml` and
> `pnpm-workspace.yaml`, re-resolves every dependency range, and then aborts on
> `ERR_PNPM_IGNORED_BUILDS` (esbuild) **before the script executes**. This was
> triggered once and fully reverted (`rm` both files, `rm -rf node_modules`,
> `npm ci`). **Until Step 5.2 lands, invoke tools directly with `node`/`npx`.**
> Every number in this document was produced that way.

**Environment actually in use:** Node **v24.19.0**, npm **11.17.0** — neither
pinned by any file in the repository.

**Installed dependency versions** (`npx npm ls --depth=0`, after clean `npm ci`):

| Package | Declared | Installed |
|---|---|---|
| react | ^18.3.1 | 18.3.1 |
| react-dom | ^18.3.1 | 18.3.1 |
| react-router-dom | ^6.30.6 | 6.30.6 |
| lucide-react | ^0.451.0 | 0.451.0 |
| vite | ^5.4.10 | 5.4.21 |
| typescript | ^5.6.3 | **5.9.3** |
| eslint | ^9.39.5 | 9.39.5 |
| @typescript-eslint/parser | ^8.67.0 | 8.67.0 |
| @vitejs/plugin-react | ^4.3.3 | 4.7.0 |
| eslint-plugin-react | ^7.37.5 | 7.37.5 |
| playwright | ^1.62.1 | 1.62.1 |
| @types/react | ^18.3.12 | 18.3.31 |
| @types/react-dom | ^18.3.1 | 18.3.7 |

**Four runtime dependencies.** No state library, no UI kit, no data-fetching
library, no Tailwind, no test runner.

---

## Part 3 — The codebase

### 9. Clean build — passes, with one warning

Run as three explicit steps rather than `npm run build`, so each stage's exit
code is separately visible:

```bash
cd frontend
npm ci                 # 298 packages, 27s, exit 0
npx tsc --noEmit       # exit 0, no output
npx eslint --config eslint.adherence.config.mjs --max-warnings 662 src   # exit 0, 662 warnings
npx vite build         # exit 0, built in 2.96s
```

**All four green.** Errors encountered on the way: **none.**

Two things the build surfaces that are not errors and should not be lost:

- **`[vite:css] @import must precede all other statements`.** Emitted every
  build. Source is `src/styles/design-system/styles.css`, which is import-only
  (five `@import url(...)` lines and a comment) — so the warning is about how
  Vite concatenates it with `global.css`, not a defect inside the vendored file.
  **The file is a byte-copy and must not be edited to silence this** (Part 4).
  It is cosmetic today and is worth understanding before Step 6 moves these
  paths, because that move changes the import graph this warning describes.
- **`npm ci` skipped esbuild's `postinstall`** under npm's allow-scripts policy:
  ```
  npm warn allow-scripts   esbuild@0.21.5 (postinstall: node install.js)
  ```
  `require('esbuild')` loads and `vite build` works here because the platform
  binary was already present. **On a genuinely clean clone this may fail**, which
  makes it a live risk to `30`'s task 0.2 ("`install` → `build` working from a
  clean clone"). I did not run `npm approve-scripts`. See Part 6.

**0.2 is therefore only partly satisfied:** the build is green here, but the
Node version is unpinned and the esbuild postinstall is ungated, so
reproducibility on another machine is **unverified**.

### 10. Test framework and coverage — **there are none. Zero.**

| Probe | Result |
|---|---|
| `*.test.*` / `*.spec.*` / `__tests__` under `src/` | **0** |
| `vitest.config.*`, `jest.config.*`, `cypress.config.*`, `playwright.config.*` | **none** |
| Test runner in dependencies | **none** — no vitest, no jest, no RTL, no MSW |
| `coverage/` directory | absent |
| Coverage number | **none exists** |

`playwright@1.62.1` is a devDependency but there is **no `@playwright/test`** and
no test config — it is used only by the two screenshot capture scripts (item 14),
which are not tests.

**Per `30` task 0.3, zero is an acceptable answer, and this is a clean zero** —
no quarantined tests, no intermittent failures, nothing to delete first.

**Consequences that need stating plainly:**

- **`30`'s coverage ratchet has nothing to ratchet from.** Its floor is 0.
- **`30`'s methodology note is inverted here.** It says the harness picks DDD
  below 10% coverage and TDD above, and warns "the target frontend is at 90%,
  which points at TDD". **This frontend is at 0%.** That guidance was written
  about the client's other repository. For Phases 1 and 2 the answer is DDD
  either way, but the stated reason does not apply.
- **`30`'s DDD characterization tests do not exist.** Phase 2's acceptance
  ("test count identical before and after") is satisfied vacuously by 0 = 0 and
  therefore **proves nothing**. Combined with item 14, Step 6 currently has **no
  automated way to prove a pure move changed nothing.**

### 11. Initial-chunk bundle size, uncompressed

```bash
npx vite build && find dist -type f -printf "%10s  %p\n" | sort -rn
```

| Asset | Uncompressed | gzip |
|---|---:|---:|
| `assets/index-BDNeyRad.js` | **404,154 B (404.15 kB)** | 108.25 kB |
| `assets/index-fURKnrD4.css` | 7,219 B (7.22 kB) | 2.25 kB |
| `index.html` | 960 B | 0.56 kB |
| **Initial chunk total (JS+CSS+HTML)** | **412,333 B (412.33 kB)** | ≈111 kB |

**Answer to the question as asked: 404.15 kB for the JS entry chunk; 412.33 kB
including CSS and HTML.**

Excluded from that total, and much larger:

| Font | Bytes |
|---|---:|
| `KiaSignatureFix-Bold.ttf` | 2,956,196 |
| `KiaSignatureFix-Light.ttf` | 2,860,916 |
| `KiaSignatureFix-Regular.ttf` | 2,857,636 |
| **Total fonts** | **8,674,748 B (8.67 MB)** |

**Two structural facts:**

- **There is exactly one JS chunk.** No route-level code splitting — `App.tsx`
  imports all seven screens statically. `standards/12` requires lazy page
  components; this is a divergence, and it means the entry chunk grows with every
  screen added.
- **8.67 MB of unsubsetted TTF fonts ship as three separate files.** No WOFF2, no
  subsetting. They are vendored design-system assets (Part 4), so this is
  reported, not actioned — but it dwarfs the JS budget by 21×.

### 12. Full `src/` tree and empty directories

```
src/
├─ app/                    AppShell + chrome.tsx
├─ components/             the design-system port (barrelled)
│  ├─ brand/               1
│  ├─ core/                6
│  ├─ feedback/            4
│  ├─ forms/               7
│  ├─ navigation/          5
│  └─ pqms/                6
├─ data/                   seed.ts, store.tsx, roles.tsx, types.ts, …
├─ features/
│  ├─ admin/               AdminScreen
│  ├─ dashboard/           DashboardScreen
│  ├─ issues/              5 files (List, Workspace, Create, LinkIssues, ModelCodeYearPicker, PriorityTab)
│  └─ notifications/       NotificationsScreen
├─ icons/                  Icon.tsx — the only sanctioned icon path
├─ styles/
│  ├─ design-system/       BYTE-COPY (see Part 4)
│  │  ├─ assets/fonts/     3 × .ttf
│  │  └─ tokens/           5 × .css
│  └─ global.css
└─ tokens/                 tokens.generated.ts — GENERATED
```

**Empty directories under `src/`: zero.**
`30`'s "Delete the empty folders" finding (six in the prior repository) **does not
reproduce here.** One empty directory exists elsewhere in `frontend/`:
**`public/`** — empty, and not referenced by `index.html` or `vite.config.ts`.

```bash
find src -type d -empty        # no output
find . -type d -empty -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./.git/*"
# ./public
```

**Counts (`30` task 0.1):**

| Metric | Value |
|---|---:|
| Files under `src/` | **80** |
| `.tsx` | 45 files / 6,947 lines |
| `.ts` | 12 files / 1,062 lines |
| `.css` | 20 files / 421 lines |
| `.ttf` | 3 files |
| **Total LOC (ts+tsx+css)** | **8,430** |
| Components (`.tsx` under `components/`) | **29** |
| Feature screen files | 9 |
| Routes declared | 7 + index redirect + catch-all |

**Type-health probes** (all clean, all `0`): `any` annotations **0**;
`enum` declarations **0**; `fetch`/`axios`/`XHR` call sites **0**; `zod` **0**;
`*.i18n.*` files **0**; `*.stories.*` **0**; `.storybook/` absent; Tailwind config
absent; `.env` / `.env.example` absent; `src/env.d.ts` absent (only `vite-env.d.ts`).

### 13. Files the design-system vendoring owns — **do not restructure or edit**

Byte-copies and generated output. Later steps **re-point the tools that read
them and never edit them** (`steps-for-new-repo.md`, "What this file
deliberately leaves out").

| Path | Bytes | Class | Rule |
|---|---:|---|---|
| `src/styles/design-system/styles.css` | 419 | byte-copy | never edit — incl. the `@import` warning |
| `src/styles/design-system/tokens/colors.css` | 3,636 | byte-copy | never edit |
| `src/styles/design-system/tokens/typography.css` | 3,313 | byte-copy | never edit |
| `src/styles/design-system/tokens/elevation.css` | 1,437 | byte-copy | never edit |
| `src/styles/design-system/tokens/spacing.css` | 1,106 | byte-copy | never edit |
| `src/styles/design-system/tokens/fonts.css` | 1,062 | byte-copy | never edit |
| `src/styles/design-system/assets/fonts/*.ttf` (3) | 8,674,748 | vendored binary | never edit |
| `design-system-manifest.json` | 22,301 | vendored source of truth | never edit |
| `_adherence.oxlintrc.json` | 16,390 | vendored ruleset | **never edit** — adapt in `eslint.adherence.config.mjs` |
| `src/tokens/tokens.generated.ts` | 8,346 | **generated** | regenerate, never hand-edit |
| `.fidelity/` (91 files) | 11,339,042 | generated captures | see caveat below |
| `FIDELITY-REPORT.md` | 32,254 | dated analysis | **regenerate, not patch** (`00`: `analysis/` class) |

**Subtotal: 9 files / 8,685,721 B under `styles/design-system/`**, plus the four
standalone artefacts and 91 capture files.

**`eslint.adherence.config.mjs` is NOT on this list.** It is the app-side
adaptation layer and the *correct* place for every Step 5 and Step 6 change —
selector filtering (5.3), the third alias twin (Step 6). It already performs
alias twinning and the barrel exemption.

**Two corrections to how these are currently described:**

- **`.fidelity/` is tracked in git — all 91 files, 11.3 MB.** `FIDELITY-REPORT.md`
  states "Captures in `.fidelity/` (gitignored)". It is **not** gitignored;
  `git check-ignore` returns nothing and `git ls-files .fidelity | wc -l` returns
  91. Whether captures *should* be tracked is a real decision (tracking them is
  what would make Step 6's "byte-identical" check possible via `git diff`), but
  the report and the repository currently disagree, and the report is wrong.
- **`FIDELITY-REPORT.md` is stale on the status vocabulary.** Dated 2026-08-22, it
  cites "the audited 8-status canonical set". The code implements **seven**
  (`statusMap.ts`: `open, review, monitoring, escalated, topissue, outofscope,
  closed`) per the **2026-08-23** directive that superseded canonical-8 — one day
  after the report. Per `00`, `analysis/`-class documents are regenerated, not
  patched.

### 14. Does the fidelity harness run, and does it pass?

**No, and no. It does not run on this machine, and it has no concept of passing.**

You flagged this as the acceptance test for Step 6 and asked to know it works
before relying on it. **It does not work, and it would not answer the question
even if it did.**

#### (a) It has no pass/fail — it is a capture script, not a test

Neither `scripts/fidelity-capture.mjs` nor `scripts/dc-compare.mjs` contains any
comparison, assertion or verdict. Grepping both for
`pixelmatch|toMatchSnapshot|diff|compare|threshold|expect|assert|process.exit`
matches **only comment text and usage strings** — no logic.

Both take screenshots, write PNGs, and exit 0 unconditionally. Worse for
Step 6's purposes: `fidelity-capture.mjs` wraps every step in

```js
async function step(label, fn) {
  try { await fn() } catch (e) { console.log(`  ✗ ${label}: …`) }
}
```

**A failed screen prints `✗` and the script still exits 0.** A CI gate calling
this would go green with every capture missing.

The "comparison" in `FIDELITY-REPORT.md` was **manual and visual** — "compared
screen-by-screen, fixed, re-captured", verdict "Aligned" by human judgement on
2026-08-22.

#### (b) Three independent blockers stop it running here

| # | Blocker | Evidence |
|---|---|---|
| 1 | **Prototype path hardcoded to a drive that does not exist** | `PROTO_URL` = `file:///D:/workspace-II/kus-pqms/…/PQMS_SE.html`. **No `D:` drive is mounted.** The file *does* exist locally at `C:/workspace-new-1/kus-pqms/_bmad-output/…/PQMS_SE.html` — a one-line path defect, machine-specific and committed. |
| 2 | **Playwright browsers are the wrong revision** | `playwright@1.62.1` requires chromium revision **1234**; the cache holds **1228**. `chromium.launch()` fails: *"Executable doesn't exist … chromium_headless_shell-1234"*. Needs `npx playwright install`. |
| 3 | **`APP_URL` uses an address the preview server does not listen on** | `APP_URL` = `http://127.0.0.1:4173`. `vite preview` on this machine binds **`[::1]:4173` only** — `netstat` shows `TCP [::1]:4173 LISTENING`, and a TCP probe gives `ECONNREFUSED` on `127.0.0.1` while `::1` and `localhost` connect. Every app-side capture would fail — silently, per (a). |

Blocker 2 is the hard stop; 1 and 3 are each independently fatal to one half.

**Method note:** I ran a *path-corrected copy* of the capture script from the
scratchpad with `OUT` redirected outside the repository, precisely so the 91
tracked PNGs were not overwritten. That copy reached `chromium.launch()` and hit
blocker 2. **The harness as committed was never executed.**

**`dc-compare.mjs` is better on one axis:** its export directory is a *relative*
path (`../../_bmad-output/…/kia-npqms-v4-v5`) which resolves correctly here. But
it requires two servers on ports 8123 and 5173, targets `127.0.0.1` (blocker 3),
needs the same browsers (blocker 2), and has no verdict (a). It also **writes a
`_boot-admin.dc.html` file into `_bmad-output/`** on first run — a side effect
outside `frontend/`.

#### (c) What this means for Step 6

Step 6's stated acceptance is *"the fidelity captures are **byte-identical** — a
pure move changes no pixels, which makes this the strongest proof available that
nothing changed."*

**That proof is not currently available.** Combined with item 10 (zero tests),
**Step 6 today has no automated means of demonstrating that a pure move changed
nothing.** Its other three criteria — adherence count unchanged and non-zero,
`tokens:check` passing, test count identical — are all satisfiable by a move that
silently broke rendering (the third vacuously, 0 = 0).

**Fixing the harness is a prerequisite of Step 6, not a nice-to-have**, and it is
four separate pieces of work: `npx playwright install`; make `PROTO_URL`
relative; use `localhost` (or bind preview to `0.0.0.0`); and **add an actual
comparison with a non-zero exit**. Screenshot capture is also non-deterministic by
nature here — fixed `waitForTimeout` values, `networkidle`, font rasterisation —
so "byte-identical" needs verifying as achievable across two runs *before* it is
relied on as a gate. I could not verify that, because the harness does not run.

---

## Part 4 — `30` task 0.4: the corpus map, conforms / diverges / absent

Assessed from observable code only. **`absent` means "no code exists in this area",
not "non-compliant"** — for a prototype port with no backend, most absences are
expected scope, not defects.

| # | Concern | State | Evidence |
|---|---|---|---|
| 00 | Confirmed stack | **diverges** | React **18.3**/Vite **5**/RR **6**; corpus specifies React 19/Vite 7+/RR 8, and RR8 has no `react-router-dom`. Runbook pass 3 already records this. |
| 01 | Structure, package boundaries | **diverges** | flat `src/`, no workspace. ADR 0001 calls this a defect; Step 6 corrects it. |
| 02 | TypeScript | **conforms** (largely) | `noUnusedLocals` on; **0** `any`; **0** `enum`. `strict`/`noUncheckedIndexedAccess` not separately audited. |
| 03 | Hooks, composition | **conforms** (unaudited) | 30 `useCallback`/`useMemo` in `store.tsx` alone. |
| 04 | Server vs client state | **absent** | no server state exists. |
| 05 | HTTP, services, Zod | **absent** | **0** fetch/axios/XHR, **0** zod. No transport layer. |
| 06 | Tailwind + tokens | **diverges** | **no Tailwind**; styling is inline objects + CSS custom properties. 156 tokens with a drift gate — a *stronger* source than the corpus assumes (Decision 1). 662 raw-value warnings. |
| 07 | Router, lazy loading | **diverges** | layout-route pattern conforms; **no lazy loading** — one 404 kB chunk. |
| 08 | Auth, permissions | **absent** | no IdP, no tokens. `can()`/`<Guard>` are affordance control only — and `/admin` is unguarded (Part 5, D1). |
| 09 | i18n | **absent** | **0** `.i18n.*` files; strings inline. |
| 10 | Testing | **absent** | **0** tests, no runner, no coverage. |
| 11 | Accessibility | **unassessed** | no a11y lint configured; not measurable at Phase 0. |
| 12 | Web Vitals, bundle budget | **diverges** | no splitting; 8.67 MB unsubsetted fonts. |
| 13 | CSP, env vars | **absent** | no `.env`, no `.env.example`, no `src/env.d.ts`. |
| 14 | ESLint, Prettier | **diverges** | ESLint present as adherence runner only — no general lint config. **Prettier configured but not installed and not invoked.** |
| 15 | CI, Dependabot, Sonar | **absent** | no CI anywhere (Part 2 item 3). |
| 17 | Domain vocabulary | **conforms** | 7 prototype statuses per the 2026-08-23 directive. |
| 18 | Open obligations register | **partial** | placeholders live in `00`; no `18`-side register audited. |
| 23 | Commits, hooks | **partial** | `commit-msg` enforced and working; `pre-commit`/`pre-push` are stubs; `core.hooksPath` does not clone. |
| 24 | Storybook | **absent** | 0 stories, no `.storybook/`. (The client template's stale-Storybook defect does **not** reproduce here.) |
| 31 | Docs, ADRs | **conforms** | corpus + ADR 0001 + generated doc with a verifying gate. |
| 33 | Polyglot monorepo | **diverges** | **not submodules** (Part 2 item 1) — `33`'s planned submodule section would be wrong. |

### `30` task 0.5 — load-bearing screens

Seven routes, all reachable, all rendering. **No dead screens found**, so `30`'s
"delete first, then count" yields nothing to delete.

| Route | Component | Status |
|---|---|---|
| `/dashboard` (+ `/` redirect) | `DashboardScreen` | live |
| `/issues` | `IssueListScreen` | live |
| `/issues/new` | `CreateIssueScreen` | live |
| `/issues/:id` | `IssueWorkspaceScreen` | live — heaviest (867 lines) |
| `/admin` | `AdminScreen` | live — **unguarded** |
| `/notifications` | `NotificationsScreen` | live |
| `*` | redirect to `/dashboard` | live |

`SideNav` (`src/components/navigation/SideNav.tsx`) is **built but unmounted** —
`FIDELITY-REPORT.md` Round 1 records the shell moving to a top bar with the
component deliberately retained in the library. Not dead code by accident;
retained on purpose. Worth an explicit keep/delete decision in Step 7.

---

## Part 5 — Two lists

Separated per `30`: *"defects the current codebase introduced, and questions it
inherited. They have different owners and different urgency."*

### A. Defects this project introduced

Someone on this team made each of these; each is fixable here.

| # | Defect | Evidence | Where it gets fixed |
|---|---|---|---|
| **D1** | **`/admin` has no route guard.** Only the nav item is conditional; navigating directly renders the admin screen for any role. | `App.tsx` line 21 — bare `<Route path="/admin" element={<AdminScreen />} />` | log now; real fix with auth (Step 10) |
| **D2** | **Fidelity harness hardcodes a `D:` path** that exists on no current machine, while the file exists locally on `C:`. | `fidelity-capture.mjs` `PROTO_URL` | prerequisite of Step 6 |
| **D3** | **Harness targets `127.0.0.1`; `vite preview` binds `[::1]` only.** Every app capture fails — silently. | `netstat`: `TCP [::1]:4173 LISTENING`; `ECONNREFUSED` on `127.0.0.1` | prerequisite of Step 6 |
| **D4** | **The harness cannot fail.** No comparison logic; per-step `try/catch` swallows errors; always exits 0. | grep for assertion/diff logic returns only comments | prerequisite of Step 6 |
| **D5** | **`FIDELITY-REPORT.md` says `.fidelity/` is gitignored. It is tracked** — 91 files, 11.3 MB. | `git ls-files .fidelity \| wc -l` → 91 | regenerate the report |
| **D6** | **`FIDELITY-REPORT.md` is stale on the status set** — cites "8-status canonical" from 2026-08-22; code implements 7 per the 2026-08-23 directive. | `statusMap.ts` | regenerate the report |
| **D7** | **`.prettierrc` is orphaned** — Prettier is neither installed nor invoked by anything. | no dep, no lockfile entry, no binary, no caller | Step 5 (install it or delete the config) |
| **D8** | **Store context value is not memoized.** All 30 callbacks are memoized, then handed to the Provider inside a fresh object literal, so every consumer re-renders on any change. | `store.tsx:309` `const value: StoreValue = { … }` — plain literal | deliberate perf work at scale, never a drive-by |
| **D9** | **Feature changes were committed inside the standards-corpus commit** (`bb2c891`), violating `30` R-2 and Step 2. | 3 `src/` files, non-whitespace | process; note in `.git-blame-ignore-revs` planning |
| **D10** | **No route-level code splitting** — all 7 screens static, one 404 kB chunk. | `App.tsx` static imports; `dist` has 1 JS file | Step 9 / `standards/12` |
| **D11** | **`public/` is empty** and unreferenced. | `find . -type d -empty` | delete in Step 7 |
| **D12** | **`core.hooksPath` is local config with no bootstrap.** A fresh clone silently gets no hooks. | `.git/config` only; no setup script found | Step 5 |
| **D13** | **8.67 MB of unsubsetted TTF fonts** ship as three files, no WOFF2. | `dist/assets/*.ttf` | vendored — raise with the design-system owner, do not edit |

### B. Questions this project inherited

Nobody here decided these; they cannot be resolved by reading this code.

| # | Question | Owner | Blocks | Status |
|---|---|---|---|---|
| **Q1** | **Which CI platform?** No definition exists anywhere. The client template said GitLab; that document described a template, not this repo. | Frontend Lead | Step 5.9, `30` DoD #1 | **open — this document is its trigger** |
| **Q2** | **npm or pnpm, and when?** `package-lock.json` committed; pnpm intended (Decision 6, ADR 0001). Nothing enforces either. | Frontend Lead | Step 5.2 | decided on paper, unexecuted |
| **Q3** | **The corpus targets a stack this app is not on** — React 19 / RR 8 / Vite 7+ / Tailwind vs React 18.3 / RR 6 / Vite 5 / no Tailwind. Is the app upgraded, or the corpus re-scoped? | architect | Steps 8–9 | **not recorded anywhere as a decision** |
| **Q4** | **Line-ending policy.** Root `.gitattributes` has `* text=auto` **without** `eol=lf`; `frontend/` has none and (not being a submodule) inherits the root. Adding `eol=lf` renormalises every Windows working tree. | Frontend Lead | Step 5.1, before any bulk commit | **open** |
| **Q5** | **Is the prototype corpus (`_bmad-output/…/exports/`) a permanent dependency?** Both fidelity scripts reach outside `frontend/` into it; a workspace split does not change that. | architect | Step 6 | open |
| **Q6** | Adopt TanStack Query and Zustand? | architect | Step 10 | open (runbook decision 2) |
| **Q7** | Which IdP — Entra/MSAL, Cognito, generic OIDC? | architect | auth, D1 | open (decision 3) |
| **Q8** | When does a real backend exist; is there an OpenAPI spec? | backend lead | Steps 9–10 | open (decision 4) |
| **Q9** | **Who owns CDN/hosting config?** `BrowserRouter` with no 404→`index.html` rewrite means a hard refresh on `/issues/EE-260041` 404s in production while working in dev and every test. | infrastructure | **go-live** | open (decision 5) — **raise today** |
| **Q10** | Decisions 1 and 6 still need ADRs. | Frontend Lead | Step 4 | open |

**Q9 is the one with a deadline attached.** `main.tsx` uses `BrowserRouter`
(confirmed), and the failure is invisible until a real deployment.

**One correction to the runbook's framing of Q9:** it says `infrastructure/` is
"therefore a separate submodule and a separate merge request". It is **not** a
separate repository (Part 2 item 1), so the ownership boundary is organisational
only — the change can land in the same MR if the teams agree.

---

## Part 6 — What I did not do, and why

Stated explicitly, per `00` and the runbook's standing instruction.

1. **I did not run `npx playwright install`.** It would download ~150 MB of
   browser binaries into the user profile. Not destructive, but a substantial
   unrequested side effect, and this session already had to revert one unwanted
   package-manager install. **Consequence: item 14's blocker 2 is diagnosed from
   the launch error and the revision manifest (`playwright-core/browsers.json`
   says 1234; cache holds 1228), not from a successful run.** Whether blockers 1
   and 3 are the *only* remaining problems after installing browsers is
   **unverified** — there may be more behind them.

2. **I did not run the committed fidelity harness.** It writes into `.fidelity/`,
   which is tracked (91 files), so running it would modify tracked files and
   breach the read-only constraint. I ran a path-corrected copy from the
   scratchpad with `OUT` redirected outside the repository instead.

3. **I did not run `tokens:gen`.** It writes unconditionally to
   `src/tokens/tokens.generated.ts`; the acceptance criterion is zero files under
   `frontend/src` in the diff. I reproduced its exact logic with the output path
   redirected and diffed against the committed file — same answer, no write.

4. **I did not run any package-manager script** — no `pnpm run`, no `npm run` —
   per your constraint. Every measurement used `node` or `npx` directly. The one
   exception is **`npm ci`**, which you issued explicitly in the previous turn to
   restore `node_modules` after the pnpm revert.

5. **I did not read the other 32 tier files.** You limited me to `00` and `30`.
   So Part 4's corpus map is assessed against `00`'s corpus-map table and
   observable code, **not** against each tier file's actual rules. Rows marked
   *conforms* mean "no contrary evidence in the code", which is weaker than an
   audit. `03` and `11` in particular are marked unaudited and should not be read
   as passes.

6. **I did not resolve the 348-vs-415 discrepancy in the runbook's favour, and I
   did not edit `steps-for-new-repo.md`.** Reporting only, as instructed. That
   file still carries 415 and 365, and both should be corrected.

7. **I did not fix any defect in Part 5A**, including the four one-line harness
   defects. Phase 0 produces no code.

8. **I did not run `npm approve-scripts esbuild`**, so the clean-clone build
   reproducibility risk in item 9 is **identified but unverified** — I could not
   confirm whether a genuinely fresh clone fails without it, since testing that
   means destroying and rebuilding `node_modules` again.

9. **I did not verify capture determinism.** Step 6 depends on "byte-identical"
   screenshots across runs. With fixed `waitForTimeout`s, `networkidle` and font
   rasterisation involved, that is an assumption, not a measured property — and
   it is unmeasurable while the harness does not run.

10. **I did not audit `_adherence.oxlintrc.json`'s 195 per-component selectors
    individually.** I confirmed the family count (195) and the mechanism the
    runbook describes (regex prop allowlists vs `extends ButtonHTMLAttributes`)
    by observing the message text. **Whether all 195 are false positives is
    asserted by the runbook, not verified here.** Step 5.3 removes them wholesale;
    if any is a genuine finding it disappears with them.

### Things that could not be determined at all

- **The CI platform (Q1).** Nothing in the repository indicates one. Recorded as
  absent, not inferred.
- **Whether hooks fire for anyone else.** Verified for this working copy only;
  `core.hooksPath` is local config and I cannot observe another clone.
- **Clean-clone reproducibility.** See point 8.
- **Whether `dc-compare.mjs` works end-to-end.** Same three blockers, plus two
  servers it needs that were not stood up.

---

## Appendix — every command in this document

```bash
cd frontend

# Gate 1 — adherence total + breakdown
npx eslint --config eslint.adherence.config.mjs --max-warnings 662 src
npx eslint --config eslint.adherence.config.mjs -f json src > adherence.json

# Gate 2 — numeric blind spot (AST, config held outside the repo)
npx eslint --config <scratch>/numeric.config.mjs --no-config-lookup -f json src
#   selector: Property[key.name=/^(padding|margin|gap|width|height|top|right|bottom|
#             left|borderRadius|fontSize|minWidth|maxWidth|minHeight|flexBasis)$/] > Literal[value>0]

# Gate 4 — tokens
node scripts/check-tokens.mjs

# Build chain
npm ci && npx tsc --noEmit && npx vite build
find dist -type f -printf "%10s  %p\n" | sort -rn

# Tooling reality
git submodule status; cat .gitmodules; ls -ld frontend/.git
git ls-files -s | awk '$1=="160000"'
git config --get core.hooksPath
find . -maxdepth 4 \( -name ".gitlab-ci.yml" -o -name "Jenkinsfile" \) -not -path "*/node_modules/*"
find . -maxdepth 3 -type d -name ".github"
cat ../.gitattributes; cat .gitattributes

# Tree and counts
find src -type d -empty
find . -type d -empty -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./.git/*"
find src -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn

# Step verification
node scripts/build-standards-doc.mjs --check
git show bb2c891 --name-status --format=""
git show bb2c891 --format= --numstat -w -- frontend/src/data/store.tsx
```

**Baseline captured at commit `bb2c891`.** Per `30`'s definition-of-done item 8,
this file is updated with the *after* numbers once Steps 5 and 6 land, so the
next reader can see what the move cost and what it bought.

---

# ADDENDUM — 2026-08-25

**The report above is unchanged and must stay that way.**
31-documentation-standards-and-decision-records.md classes it as a point-in-time
record; silently extending or editing it destroys the only property that makes it
one. Everything below is new work, appended and dated.

**Defect numbering continues at D14.** The original list ends at D13. Reusing
D5–D7 would put two different defects under one identifier in a single document,
which is worse than a gap in the sequence.

## New defects

| # | Defect | Evidence | Disposition |
|---|---|---|---|
| **D14** | **The 91 fidelity baselines were captured with parameters nobody recorded**, so they could neither be reproduced nor trusted. | **Seven distinct viewports** across 91 files — 1600×1000 (38), 1280×900 (21), 1920×1080 (21), 1280×1000 (3), 1920×1000 (3), and **1600×2926 and 1600×2922, which are the same screen 4px apart**. 53 files are `dev-*`/`dc-*` names matching no committed code path, including `dev-dashboard-r9` and `dev-dashboard-recheck`. | **RETAINED.** Superseded as a gate by `.style-baseline/`, but kept on disk — deleting them was proposed and reversed 2026-08-26; the decision is deferred. They remain unusable as a pass/fail gate for the reasons in the evidence column |
| **D15** | **Dates render a day early or late depending on the developer's timezone.** `fmtMDY`/`fmtHM` in `apps/portal/src/data/util.ts` call `getMonth`/`getDate`/`getHours` — **local-time getters** — over UTC-anchored ISO strings. | Measured: the seed anchor `2026-07-09T02:00:00Z` renders **`07/08/2026`** on this machine (UTC−4) and `07/09/2026` on IST. | **Application defect, not a harness note.** Tracked in 18 with its own owner. **Do not fix in a structural phase** — it changes rendered output |
| **D16** | **`IssueCard` is exported from the `ui-library` barrel and imported by nothing.** It is tree-shaken out of the bundle entirely. | Discovered while choosing a positive-control target: editing `padding: 16 → 20` produced an **identical bundle hash**, and `grep IssueCard` finds zero importers and zero occurrences in `dist`. | Dead code. Keep-or-delete is a Step 7-class decision, not done here |
| **D17** | **`dc-compare.mjs` wrote `_boot-admin.dc.html` into the tracked UX design-source export.** A no-op today only because of an `existsSync` guard; the first run on a clean checkout would create an untracked file inside a tracked directory, where `git add -A` eventually commits it. | `scripts/dc-compare.mjs:23` | **Partly closed, and WORSE than stated.** The file was committed in `fa25e69` and is tracked TODAY — the write already happened. `.gitignore` does not untrack an existing file, so the entry prevents recurrence only; `git rm --cached` is still needed. Guard removed. Temp-directory relocation tried and **reverted** — the `.dc.html` resolves `support.js`/`_ds/` by relative path |

## D16 has a consequence beyond one dead component

**The bundle hash did not change for a real source edit.** Step 6's acceptance
rested on identical bundle hashes, and that evidence is sound *for code that
reaches the bundle*. It is blind to any change in code that is tree-shaken.

That does not weaken the Step 6 conclusion — a pure move of unreachable code
changes nothing by definition — but it does mean **"bundle hash unchanged" is
not a general substitute for a behavioural check**, for a second reason beyond
the one already recorded. The first was that Step 8 changes source bytes on
purpose. The second is that some source has no representation in the output at
all.

## What replaced the pixel harness

Two gates, built 2026-08-25, in place of repairing the screenshot comparison.
The reasoning is in 15-devsecops-and-ci-cd.md; the sequencing is in
`../PQMS_docs/steps-for-new-repo.md` Step 8.

| Gate | What it asserts | Cross-machine? |
|---|---|---|
| `scripts/check-token-equivalence.mjs` | a proposed `'<literal>' → var(--token)` substitution preserves the value **exactly**, per the manifest | **Yes** — it reads two strings, no rendering at all |
| `scripts/style-gate.mjs` (styles half) | every whitelisted computed style is unchanged, per element, per route | **Yes** — every whitelisted property resolves without consulting layout |
| `scripts/style-gate.mjs` (geometry half) | rounded `getBoundingClientRect()` is unchanged | **No — same-machine only.** Diffed separately so a machine change degrades it to a warning |

`.style-baseline/` (6 routes, 1,441 elements) replaces `.fidelity/`. It is
regenerable in seconds by anyone, from `--write`, which is precisely the property
the deleted baselines lacked.
