# Steps for the New Repo — frontend restructuring runbook

**Class:** working document, not a standard. It sequences work; it states no
rules. Where it and a tier file disagree, **the tier file wins**
(`standards/31-documentation-standards-and-decision-records.md`).

**Written:** 2026-08-25. **Last revised:** 2026-08-25, **fourth revision** —
against `RESTRUCTURE-BASELINE.md`, which MEASURED the repository rather than
reading a description of it. It withdrew the submodule premise entirely,
corrected the numeric count from 415 to 348, and established that no CI exists
anywhere. Steps 0-3 and 5 are complete.

---

## Revision history — what each pass corrected

| Pass | Source | What it changed |
|---|---|---|
| 1 | client `project-template-java` docs | GitLab CI, Lefthook, MoAI-ADK, pnpm 11, TS 5.9 |
| 2 | the observed `KUS-PQMS` root tree | **BMAD** not MoAI; **`.githooks/`** not Lefthook; no root CI; ~~four submodules~~ **(wrong — see pass 4)** |
| 3 | the `frontend/` walkthrough | **React 18.3 / Vite 5 / RR6** — not 19/8/8; no backend at all; the adherence and token gates; ADR 0001 |
| 4 | **`RESTRUCTURE-BASELINE.md` — measured, not read** | **NOT submodules** — four ordinary directories in one repository; hooks **do** fire; **no CI anywhere**; the numeric count is **348**, not 415 |

**Each pass corrected the one before it.** The lesson, now in
`standards/00-core-rules.md`: **a document about a repository ranks below the
repository.** Read the tree before trusting any description of it — including
this file.

---

## What `frontend/` actually is

**A 1:1 React port of an HTML prototype** (`PQMS_SE.html`) of the Kia N-PQMS ISM
module. Not a greenfield app, and that explains nearly every decision in it.

```
frontend/
├─ src/
│  ├─ main.tsx          CSS imports (order is load-bearing) → providers → App
│  ├─ App.tsx           the whole route table, 30 lines, layout-route pattern
│  ├─ app/              AppShell + chrome.tsx (PageContainer, Modal, SectionCard)
│  ├─ components/       the design-system port, behind a barrel, generic
│  ├─ features/         one folder per screen — dashboard, issues, admin, notifications
│  ├─ data/             the entire "backend": seed.ts, store.tsx, roles.tsx
│  ├─ icons/Icon.tsx    the only sanctioned icon path
│  ├─ styles/           design-system/** is a BYTE-COPY, gated
│  └─ tokens/           generated, gated
├─ design-system-manifest.json      156 tokens
├─ _adherence.oxlintrc.json         vendored ruleset — byte-copy, never edit
├─ eslint.adherence.config.mjs      the runner — yours, edit here
└─ FIDELITY-REPORT.md               Playwright screenshot comparison
```

**Stack:** React **18.3**, Vite **5**, `react-router-dom` **6**, `lucide-react`.
Four runtime dependencies. No state library, no UI kit, no data-fetching library.

### Five constraints that govern everything below

1. **Fidelity beats elegance.** A Playwright screenshot harness compares against
   the prototype. **Any change that moves a rendered pixel breaks the captures.**
   Where the prototype had `11.5px` or `#F0F2F5`, the port keeps it with a
   comment. The question when changing something is *"does the design show
   this?"*, not *"is this the better React pattern?"*
2. **There is no backend.** Zero fetch, zero auth, zero storage. All data is a
   seed array in memory. Whole tier files assume a transport layer that does not
   exist yet.
3. **`NOW` is frozen** (`2026-07-09T09:00:00Z`) so captures are stable forever.
   `assertSeed.ts` throws at boot if seed anchors drift. **If the dev server dies
   on boot after a seed edit, that guard is working.**
4. **The status vocabulary is the prototype's seven**, not the BRD's eight — a
   2026-08-23 directive superseded the canonical-8 decision. Keys and labels
   differ (`review` displays as "Investigating"). **Do not rename keys.**
5. **`tsconfig` has `noUnusedLocals`.** An unused import fails the build.

---

## Two gate defects that set the order of work

Both measured, not quoted.

### The adherence gate is a budget, not a ratchet
`build = tsc --noEmit && lint:adherence && vite build`, where `lint:adherence`
runs the vendored ruleset at `--max-warnings 662`.

**The recorded history is `623 → 638 → 662` — every movement upward.** And the
current count is *exactly* 662, zero headroom. That is not coincidence; it is
the steady state of any single-number ceiling, because nobody lowers it and
everybody eventually raises it.

Measured composition:

| | Count | Nature |
|---|---|---|
| Raw px values | 362 | **real signal** |
| Raw hex colours | 105 | **real signal** |
| Per-component prop/enum warnings | 195 | **permanent false positives** |

The 195 come from regex prop allowlists authored against the plain-JS design
system, where `Button` declared six props. This port's `Button`
`extends ButtonHTMLAttributes`, so `onClick`, `disabled` and `aria-label` are
correct and type-safe — **the rule cannot know about `extends`.**

**`tsc --noEmit` already checks props against the real interfaces and is
strictly stronger.** So those selectors are redundant *and* wrong.

⚠️ **Freezing them at 195 does not work either** — the next legitimate
`<Button onClick={…} disabled>` makes it 197 and fails the build.

### And there is a loophole that trains people the wrong way

```js
padding: '12px 14px'   // warns
gap: 20                //  silent — identical hard-coded value
```

~~Measured: 415 numeric hard-coded dimensions versus 365 string px literals.~~
**Corrected in pass 4 — the number is 348, and it was never 415.**

`RESTRUCTURE-BASELINE.md` measured it with the exact selector Step 5.5 proposes,
run through ESLint's own selector engine rather than a grep:

```
Property[key.name=/^(padding|margin|gap|width|height|top|right|bottom|left|
  borderRadius|fontSize|minWidth|maxWidth|minHeight|flexBasis)$/] > Literal[value>0]
```

**348.** Four variants were tried to recover 415 and none lands there —
descendant rather than direct child gives 359, any property gives 712, including
zeros and strings gives 804. Use **348**: it is what this selector actually emits,
which is the only number that can seed its ceiling. It is now the live ceiling in
`.ds-ceilings.json`.

**The loophole is worse than "more than half", not better.** On the same fifteen
properties, string-px values number **4** against 348 numeric — **98.9%** of the
hard-coded dimensions on those properties were invisible to the gate. The 362
`Raw px value` warnings are overwhelmingly px strings in *other* positions
(shorthand like `'12px 14px'`, `border`, `boxShadow`) that this selector does not
reach. A developer blocked by the gate learns that `'20px'` → `20` makes the
warning vanish without using a token.

**So the loophole closes before the conversion pass, not after.** Otherwise you
spend a week draining one bucket into a hole.

### The token gate is fine and unenforced
`tokens:check` passes (156 tokens verified) — and it is **not in `build`**, and
`.githooks/`'s frontend `pre-commit.sh` and `pre-push.sh` are both stubs that
`echo` and `exit 0`. **A gate that has never failed is indistinguishable from a
gate that does not run.** Two smaller holes: nothing validates
`tokens.generated.ts` against the manifest, and `cssVar()` has near-zero
adoption so `var(--space-41)` compiles and renders nothing.

---

## How to use this

Work top to bottom. Each step has a **Prompt** and a **Done when**.

Steps 3 onward are BMAD work — read the correction section of
`standards/32-working-within-the-moai-spec-workflow.md` first; the body of that
file describes MoAI-ADK and only its mapping table applies.

**Two rules for every prompt:**

1. **Load only that step's tier files, `00-core-rules.md` first.** Never all 34.
2. **End with:** *"Report what you did not do and why. If a rule could not be
   followed, state it — do not silently work around it."*

And the one that matters in a harness: **name the governing tier files by
filename inside the story.** BMAD verifies the story; its review skill reviews
against the story. Neither reads `PQMS_docs/` unless told to.

---

## Progress

- [x] **0** — Protect the docs from the formatter *(before copying)*
- [x] **1** — Copy the corpus and the generator
- [x] **2** — Commit, verify nothing was reformatted
- [x] **3** — Baseline epic (Phase 0)
- [ ] **4** — Four remaining decisions
- [x] **5** — Enforcement epic (Phase 1) — **done 2026-08-25**; both gates repaired, plus a hooks bootstrap
- [ ] **6** — Workspace split (Phase 2a) — **re-point tooling in the same commit**
- [ ] **7** — Structure within the workspace (Phase 2b)
- [ ] **8** — Token conversion (Phase 3.1)
- [ ] **9** — Conformance slices (Phases 3.2–3.4)
- [ ] **10** — State and data layer (Phase 3.5) — *blocked on a backend existing*
- [ ] **11** — Phase 4 — screen descriptions, inventory reconciliation, specs

---

## Step 0 — Protect the docs from the formatter

**Thirty seconds, and much harder to undo than to prevent.**

`frontend/.prettierrc` exists. The tier files are hand-wrapped at ~76 characters
so tables align and paragraphs break where the meaning breaks. Prettier will
rewrap all of them: the first commit becomes unreviewable, `git blame` stops
working on the docs, and `docs:standards:check` fails because the generated
document no longer matches its sources.

```bash
printf '\nPQMS_docs/**\n**/*.md\n' >> frontend/.prettierignore
```

**The ignore file protects you regardless of what invokes Prettier.** Then look
anyway: find which script in `.githooks/` runs it, and read
`frontend/commit-msg.rules` — that file, not Conventional Commits, is the actual
commit convention here until it says otherwise.

**Done when:** `.prettierignore` excludes the corpus.

---

## Step 1 — Copy, and copy all three things

```bash
# from C:\workspace\kus-pqms\pqms-portal-dev\pqms-portal\
cp -r PQMS_docs/                    <KUS-PQMS>/frontend/PQMS_docs/
cp scripts/build-standards-doc.mjs  <KUS-PQMS>/frontend/scripts/
```

Add to `frontend/package.json`:

```json
"docs:standards": "node scripts/build-standards-doc.mjs",
"docs:standards:check": "node scripts/build-standards-doc.mjs --check"
```

**Delete before committing:** `CHANGES.md` (a stale session report), and
`PROMPT-Frontend-Development-Standards-AI-Review-v1.0.md` unless you want it.

```bash
cd frontend && node scripts/build-standards-doc.mjs --check
```

Invoke with `node` directly — that works whichever package manager is active.

> ⚠️ **Never run a package-manager script before the package manager is settled.**
> Not `pnpm run x`, not `npm run x` — `node scripts/x.mjs`.
>
> This is not tidiness. With `package-lock.json` present and pnpm intended, a
> single `pnpm docs:standards:check` in this repository **never ran the script at
> all**. pnpm's auto-install preflight fires first: it adopted the npm-installed
> `node_modules`, moved 12 packages to `node_modules/.ignored`, wrote
> `pnpm-lock.yaml` and `pnpm-workspace.yaml`, **re-resolved every `^` range**, and
> then aborted on `ERR_PNPM_IGNORED_BUILDS` before reaching the script.
>
> Recovering it took `rm` on both new files, `rm -rf node_modules` and `npm ci`.
> **Had it not been noticed, every number measured afterwards would have come
> from a silently re-resolved dependency tree** — which is also a fidelity risk,
> because the captures are the acceptance test for Step 6.
>
> The window closes at Step 5.2, which migrates with `pnpm import` (preserving
> exact resolutions) rather than `pnpm install` (which re-resolves). Until then,
> `node` only.
Expect **"is up to date (34 tier files)"**. If it fails, line endings changed in
transit: **`frontend/` needs its own `.gitattributes` with `* text=auto eol=lf`,
because the root file lacks `eol=lf`.** (An earlier revision said "because a
submodule does not inherit the parent's" — **withdrawn, these are not
submodules**; the root file *is* inherited. The frontend file is still wanted, for
`33`'s boundary rule and the missing `eol=lf`.)

**Done when:** the check passes.

---

## Step 2 — One commit, then stop

Check `frontend/commit-msg.rules` first — the prefix must satisfy it.

```
docs(frontend): add PQMS frontend standards corpus as reference

34 tier files + generated distribution document. Reference only —
no code changes. Governs frontend/ restructuring from the baseline epic.
```

```bash
git diff HEAD~1 --stat
```

**Additions only.** Any pre-existing file showing modifications means something
reformatted — revert, return to Step 0.

⚠️ ~~**Submodule:** the parent needs a second commit moving the pointer.~~
**WITHDRAWN — there is no pointer.** `frontend/` is an ordinary directory in a
single repository (`git submodule status` empty, no `.gitmodules`, no
`frontend/.git`, no gitlinks). One commit is the whole change.

**Done when:** committed in `frontend/`. Additions only — and note that in this
repository that acceptance criterion **failed**: the corpus commit also carried
real source changes to three files under `src/`. Not a formatter problem; a
violation of `30`'s R-2.

---

## Step 3 — Baseline epic (Phase 0)

**Produces no code.** The walkthrough already answered much of it — this pass
commits the numbers so later stories can reference them.

### Prompt

> Read `frontend/PQMS_docs/standards/00-core-rules.md` and
> `30-restructuring-an-existing-react-project.md`, then execute **Phase 0**
> against `frontend/` only.
>
> **Governing:** `00`, `30`, `18-project-context-and-implementation-status.md`,
> `33-polyglot-monorepo-integration.md`, ADR `decisions/0001-*`.
>
> Produce `frontend/RESTRUCTURE-BASELINE.md`:
>
> **Gate numbers — these are the ones later stories compare against:**
> 1. `lint:adherence` total, **broken down by message family** (raw px / raw hex
>    / per-component prop / import). Commit the breakdown, not just the total.
> 2. Count of **numeric** hard-coded dimensions — the blind spot. Measure with an
>    AST query, not a grep, so it is reproducible.
> 3. Per-file warning counts, top 15.
> 4. `tokens:check` result and token count.
>
> **Tooling reality:**
> 5. Is `package-lock.json` still present alongside pnpm intent? Which does CI
>    or any hook actually invoke?
> 6. Is there a pipeline definition anywhere — root, or inside `frontend/`?
> 7. Does a commit inside `frontend/` actually fire the root `.githooks/`
>    scripts? **Test it, do not infer it.** (Answered: **yes, they fire.** These
>    are not submodules, and a commit staged in `frontend/` runs the root router.)
> 8. Does `frontend/.gitattributes` exist with `* text=auto eol=lf`?
>
> **The codebase:**
> 9. Clean-clone build — exact commands, every error on the way.
> 10. Test framework and coverage, **if any exists at all.**
> 11. Initial-chunk bundle size, uncompressed.
> 12. Full `src/` tree plus every empty directory.
> 13. **Every file the design-system vendoring owns** — `styles/design-system/**`,
>     `design-system-manifest.json`, `_adherence.oxlintrc.json`,
>     `tokens.generated.ts`, `.fidelity/`, `FIDELITY-REPORT.md`. **Byte-copies
>     and generated files are not mine to restructure.**
> 14. Does the fidelity harness run, and does it currently pass?
> 15. Two lists: **defects this project introduced** vs **questions it
>     inherited**.
>
> **Acceptance:** zero files under `frontend/src` in the diff. Report only.

**Done when:** committed, and items 1–2 have exact numbers.

---

## Step 4 — Four remaining decisions

**Four of the original eight are now answered.**

| # | Decision | Status |
|---|---|---|
| 1 | Token value source | ✅ **The vendored design system.** 156 tokens, a manifest, and a drift gate — a stronger source than the corpus assumed existed. `standards/06` yields to it. |
| 6 | pnpm or npm | ✅ **pnpm.** Delete `package-lock.json` in Step 5. |
| 7 | Workspace or flat | ✅ **Always a workspace — ADR 0001.** The flat tree is a defect corrected in Step 6. |
| 8 | ESLint or oxlint | ✅ **Neither is a choice.** It is ESLint-as-runner for a vendored oxlint ruleset, because oxlint cannot execute `no-restricted-syntax` and that rule carries the whole substance. Not two competing linters. |

**Still open:**

| # | Question | Blocks | Owner | Answer |
|---|---|---|---|---|
| 2 | Adopt TanStack Query and Zustand? | Step 10 | architect | |
| 3 | Which IdP — Entra/MSAL, Cognito, generic OIDC? | auth work | architect | |
| 4 | When does a real backend exist, and is there an OpenAPI spec? | Steps 9–10 | backend lead | |
| 5 | Who owns the CDN / hosting configuration? | **go-live** | infrastructure | |

### Decision 5 is the one to raise today

`App.tsx` uses `BrowserRouter`. **Without a 404 → `index.html` rewrite at
whatever serves `dist/`, a hard refresh on `/issues/EE-260041` 404s at the
server** — while working perfectly in development and in every test. It is
`infrastructure/`-owned — a separate *team*, but **the same repository**, so it
can land in the same merge request if the teams agree, and it makes the entire route table non-functional on cold load.

Cache headers and the CSP travel with it (`standards/12`, `standards/13`).

### Two defects worth logging now, even in a prototype

- **`/admin` has no route guard.** Only the nav item is conditional. Typing
  `/admin` as an SE renders the admin screen. `can()` and `<Guard>` are
  **affordance control, not access control** — the code says so honestly, and
  the gap will still be forgotten when auth lands.
- **The store context value is not memoized**, so every `useStore()` consumer
  re-renders on any change. Fine at a few dozen rows. **A deliberate perf change
  at scale, never a drive-by.**

---

## Step 5 — Enforcement epic (Phase 1), including gate repair

**Enforcement before conformance** — and here that means *repairing* the
enforcement, because a gate you cannot trust is worse than none: it produces a
number people optimise against instead of a signal.

All of this is **zero rendered pixels**, so the fidelity captures are safe.

### Prompt

> Read `00-core-rules.md`, `30` Phase 1, `14-code-style-and-linting.md`,
> `15-devsecops-and-ci-cd.md`, `23-git-workflow-hooks-and-commits.md`
> — **its `.githooks/` section; the Husky and Lefthook sections above it both
> describe tools this repository does not use** — `10-testing-standards.md`, `33`.
>
> **Characterization-first, not test-first.** This changes no source; acceptance
> is "every gate green on untouched code."
>
> **`_adherence.oxlintrc.json` is a byte-copy and is never edited.** Every change
> below goes in `eslint.adherence.config.mjs`, which is the app-side adaptation
> layer and already does alias twinning and the barrel exemption.
>
> One story each:
>
> 1. **`frontend/.gitattributes`** (`* text=auto eol=lf`) — **not** because a
>    submodule fails to inherit (it is not one), but because the root file has
>    `* text=auto` **without** `eol=lf`, and `33`'s boundary rule keeps the
>    frontend's policy out of three other components. **Re-declare the binary
>    formats**, or the bare `*` shadows the root's pins — and `frontend/.git-blame-ignore-revs`.
> 2. **Delete `package-lock.json`** (decision 6). Add `pnpm-workspace.yaml` —
>    it may list only the current root for now; the packages arrive in Step 6.
>    Engine enforcement goes in `pnpm-workspace.yaml`, **not `.npmrc`**: pnpm 11
>    no longer reads non-auth settings from it, and a setting written to the file
>    it ignores fails silently.
> 3. **Stop executing the per-component prop/enum selectors.** Filter the
>    selector array in the wrapper to those whose message begins `Raw ` or
>    `Font not provided`. **Record the reason in the file**: the allowlists were
>    authored against the plain-JS source where `Button` had six props; this
>    port's `Button extends ButtonHTMLAttributes`, and `tsc --noEmit` checks
>    props against the real interfaces and is strictly stronger. Executing them
>    gates correct code on a rule that is wrong about it.
> 4. **Split the remainder into named scripts with independent ceilings** —
>    `lint:ds:values` (the ratchet) and `lint:ds:imports` (already clean, hold at
>    0). **The ceiling is written by a script, not a human**: compare, fail if
>    higher, and **rewrite the file lower when the count drops.** Lowering is
>    automatic; raising requires editing a tracked file, which appears in review
>    as a deliberate act with a name on it.
> 5. **Close the numeric loophole**, with its own ceiling at the Step 3 number
>    so nothing breaks today:
>    ```
>    Property[key.name=/^(padding|margin|gap|width|height|top|right|bottom|left|
>      borderRadius|fontSize|minWidth|maxWidth|minHeight|flexBasis)$/] > Literal[value>0]
>    ```
>    `value>0` correctly skips `padding: 0`.
> 6. **Wire `tokens:check` into `build` and into the frontend `pre-commit`**
>    hook — it runs in milliseconds, which respects that file's own "keep them
>    FAST" TODO. Add a **generated-file drift check**: regenerate to a temp path,
>    diff against the committed `tokens.generated.ts`, fail on mismatch.
> 7. **Validate every `var(--x)` name against the manifest.** ~20 lines, catches
>    `var(--space-41)` which today compiles, ships and renders nothing. Cheaper
>    and broader than driving `cssVar()` adoption across hundreds of call sites.
> 8. **Fill in `pre-push.sh`**: `tsc --noEmit` + the adherence scripts, scoped to
>    frontend paths. **Not the unit suite.** Verify the script **exits non-zero
>    on failure** — a hook ending in `echo` or piping to `tee` returns *that*
>    command's status and silently always passes. This is the most common defect
>    in hand-written hooks and it is invisible until something should have failed.
> 9. CI for the frontend, on whichever platform Step 3 found. **If there is none,
>    that is the story** — say so rather than inventing one.
>
> **Do not touch `src/`.** If a gate cannot pass, lower the gate and record the
> trigger.
>
> **Acceptance:** every gate green on unmodified `src/`; zero files under
> `frontend/src` in the diff; the fidelity captures unchanged.

**Done when:** the values ratchet is a real number you trust, and you have
confirmed the hooks fire from inside `frontend/` (they do), **and a bootstrap
exists so a fresh clone gets them at all**.

### What Step 5 actually produced — 2026-08-25

Recorded because four items came out differently from the plan above.

| # | Planned | Actual |
|---|---|---|
| 1 | `.gitattributes` "because a submodule does not inherit" | Added — but the reason is `33`'s boundary rule plus a root file missing `eol=lf`. **Binary formats re-declared**, or the bare `*` shadows the root's pins over 11.3 MB of PNGs and 8.67 MB of TTFs |
| 1 | `frontend/.git-blame-ignore-revs` | **Placed at the GIT ROOT** per `23`. `blame.ignoreRevsFile` is one repo-level value and forges read only the root — a per-component copy is inert |
| 2 | pnpm migration | `pnpm import` preserved all 336 resolutions exactly; verified identical after normalising notation. `allowBuilds.esbuild` and `engineStrict` in `pnpm-workspace.yaml`; `engineStrict` proved by forcing an impossible `engines.node` |
| 3 | "declare it or delete `.prettierrc`" | **KEPT and declared.** Deleting was the initial recommendation and was wrong |
| 5 | ceilings | `values` 467, `imports` 0, written by `scripts/ds-gate.mjs` |
| 6 | numeric ceiling 415 | **348** — see the corrected section above |
| 9 | CI | **None exists.** That is the finding; no platform was invented |

**Why `.prettierrc` is kept rather than deleted.** Editors format-on-save with
their own bundled Prettier regardless of project dependencies, so removing the
config does not remove the formatter — it removes the only thing constraining it,
and Prettier falls back to its **defaults** (80 columns, semicolons, double
quotes). That is a *more* destructive rewrite than the config that was there,
which matches the code. The real hazard was elsewhere and is now closed:
`prettier --check` showed that `_adherence.oxlintrc.json`,
`design-system-manifest.json`, `tokens.generated.ts` and every
`src/styles/design-system/**` byte-copy **would be rewritten** by one
`prettier --write .`. All are now in `.prettierignore`. See ADR-0002 for the
values conflict with `14`.

**One extra story, not in the plan:** a **hooks bootstrap**
(`frontend/scripts/setup-hooks.mjs`, wired as `prepare` and documented in the
README). Without it every gate above was invisible to a fresh clone —
`core.hooksPath` is local config that does not clone, and with no CI that meant
zero enforcement. Proved by clearing the setting: an invalid commit message was
**accepted**; after the bootstrap the same message was refused.

**It does not fully close.** `core.hooksPath` is a single repository-level value,
so a bootstrap living in `frontend/` only reaches people who install in
`frontend/`. Someone working solely in `backend/` still gets nothing. **That
needs a root-level mechanism and is the repo owner's call** — see the report
accompanying Step 5.

**Final gate numbers:** `values` **467**, `numeric` **348**, `imports` **0**.
**815 tracked is not a regression** — it is 467 real signals plus 348 that were
always present and are now counted. The 195 per-component prop warnings are gone
because those selectors are no longer executed.

---

## Step 6 — Workspace split (Phase 2a)

ADR 0001. **A pure move, and the single most dangerous step in this runbook.**

### The hazard

🔴 **A workspace split silently disables both halves of the adherence gate.**

The vendored `no-restricted-imports` patterns match `components/**` and the
wrapper twins them with `@/`. Once components live in `packages/ui-library` they
are imported as `@pqms/ui-library` — **both pattern sets match nothing.** And
`no-restricted-syntax` is scoped to `src/**/*.{ts,tsx}`, which becomes three
separate `src/` roots.

**A lint rule whose glob matches nothing does not error. It reports zero
violations and the build goes green.** So the move looks like it fixed every
warning at once, and the first symptom is a raw hex colour shipping six weeks
later.

`tokens:check` and `tokens:gen` fail **loudly** when their paths break. Those
are the easy half.

### Prompt

> Read `01-project-structure-and-architecture.md` (its split-map section),
> `decisions/0001-frontend-is-always-a-pnpm-workspace.md`, `30` Phase 2, `33`.
>
> Split flat `src/` into the three-package workspace:
>
> | From | To |
> |---|---|
> | `src/components/**`, `src/icons/**` | `packages/ui-library` |
> | `src/styles/design-system/**`, `design-system-manifest.json`, both token scripts, `src/tokens/` | `packages/design-tokens` |
> | `src/app/**`, `src/features/**`, `src/data/**`, `src/styles/global.css` | `apps/portal` |
>
> `chrome.tsx` **stays in the app.** Moving it is a separate decision.
>
> **Non-negotiable:** the move and the tool re-pointing land in **the same
> commit**, and the commit message records the adherence count **before and
> after**.
>
> - An **unchanged** count is the evidence the gate still sees the code.
> - **A count that drops to zero is the failure, not the success.**
>
> Re-point in that commit: the `no-restricted-syntax` file globs (three `src/`
> roots now), a **third alias twin** for the package specifier beside the bare
> and `@/` ones, `tokens:check`'s CSS scrape path, `tokens:gen`'s output path,
> the `@/` alias in `vite.config.ts` and `tsconfig`, and the vendored CSS
> import paths.
>
> **The CSS import order in `main.tsx` survives the move and gets less obvious.**
> The design-system stylesheet must still be imported first — the bundler emits
> CSS in import order and a component import above it inverts the cascade.
> **Restate the reason in the comment**, because the path stops looking local and
> the next reader tidies it.
>
> **Acceptance:**
> - the fidelity captures are **byte-identical** — a pure move changes no pixels,
>   which makes this the strongest proof available that nothing changed
> - the adherence count is unchanged and non-zero
> - `tokens:check` passes
> - ~~test count identical~~ — **VACUOUS. There are no tests.** Zero test files,
>   no runner, no coverage. This criterion is satisfied by 0 = 0 and proves
>   nothing; it passed for the actual split without exercising one line of code.

⚠️ **A structural move here is riskier than the acceptance list above implies.**
That list assumes two instruments, and **this project has neither**: a
characterization test suite (none exists) and byte-identical fidelity captures
(the harness does not run — see Step 8). What actually carried the split was
**unchanged bundle hashes**, which is a narrower guarantee than either and works
only because a pure move should not change output bytes at all.

**Done when:** three packages exist, and the gate count is the same number it
was before.

---

## Step 7 — Structure within the workspace (Phase 2b)

Now the ordinary Phase 2 work: feature folders, `pages/` hosts vs `components/`
screens, feature-scoped `hooks/`/`services/`/`config/`, delete every empty
directory, establish the single test location and **update any coverage or
analysis path configuration in the same commit.**

Same rules: **moves and renames only**; if a move needs a logic change, stop and
list it. Every bulk SHA into `.git-blame-ignore-revs`. Fidelity captures
byte-identical.

---

## Step 8 — Token conversion (Phase 3.1)

> 🔴 **PREREQUISITE — the repaired fidelity gate, plus the static token check.**
>
> ⚠️ **An earlier revision of this block said the opposite** — that the harness
> should NOT be repaired because a pixel gate's tolerance exceeds its signal. That
> was wrong. It cited **cross-machine** drift (0.66–2.14%) as if it were a
> property of the method. **Same-machine, same-browser capture is 0.0000% —
> byte-identical across all nine screens** — so the gate needs no tolerance and
> runs at **threshold zero**. The harness is repaired and is the prerequisite.
>
> | Tool | Answers | When |
> |---|---|---|
> | `scripts/check-token-equivalence.mjs` | does this substitution preserve the value? | **per conversion**, no browser |
> | `scripts/fidelity-gate.mjs` | did anything change? (threshold 0) | **after each file**, in `build`/`pre-push` |
> | `scripts/style-gate.mjs` | *which declaration* changed? | **by hand, when the gate fails** |
>
> **Step 8 still splits into two tranches**, and the first needs no rendering:
> run `node scripts/check-token-equivalence.mjs` for the current split.
>
> **The condition the gate depends on:** the browser revision is pinned in
> `package.json`, and the baseline is valid only for the machine that produced it.
> Revision drift is what produced the 0.66–2.14% that cost a day to diagnose; the
> pin turns that into a loud install failure instead of silent pixel movement.
>
> **Two known limits remain, and neither blocks Step 8:**
>
> 1. **Inter is loaded from Google Fonts**, so text metrics depend on a network
>    fetch and on which revision is served. Self-hosting it removes that variable.
> 2. **Dates render with local-time getters over UTC anchors** (see 18's
>    application-defect register), so the same seed row renders a different date in
>    IST and US-East. `timezoneId` is pinned in the capture context as a
>    workaround; **the underlying defect is a user-facing bug, not a harness
>    setting.**
>
> The defects that were repaired, recorded for the history:
>
> 1. `PROTO_URL` is hardcoded to `file:///D:/...` — **no `D:` drive exists.**
>    The prototype is present locally under `_bmad-output/`.
> 2. `playwright@1.62.1` needs chromium revision **1234**; the cache has
>    **1228**. `chromium.launch()` fails. Needs `npx playwright install`.
> 3. `APP_URL` uses `127.0.0.1`, and `vite preview` binds **`[::1]` only** here.
>    Every app-side capture fails.
> 4. **The harness has no verdict at all** — no comparison, no assertion, and
>    each screen is wrapped in `try/catch` that prints `✗` and **still exits 0**.
>    A CI job calling it goes green with every capture missing.
>
> **Why the Step 6 substitute does not carry over.** The workspace split was
> accepted on **unchanged bundle hashes** — legitimate there, because a pure move
> should not change output bytes, so identical hashes proved identical rendering.
>
> **Step 8 inverts that.** Converting `padding: '20px'` to
> `padding: 'var(--space-5)'` **changes source bytes on purpose**, so the bundle
> hash MUST change while the pixels must not. The hash carries no information
> about the only property that matters. **This is exactly and only the case a
> screenshot comparison can check**, and it is the step where every conversion is
> a chance to move a pixel.
>
> Repair means four things: install the browsers, make `PROTO_URL` relative, use
> `localhost` (or bind preview to `0.0.0.0`), and **add a real comparison that
> exits non-zero**. Then demonstrate the captures are reproducible across two
> consecutive runs *before* trusting "byte-identical" as a gate — fixed
> `waitForTimeout`s, `networkidle` and font rasterisation are all noise sources,
> and determinism was never verified because the harness never ran.
>
> Tracked with an owner in
> `standards/18-project-context-and-implementation-status.md`.

Decision 1 is settled — the vendored system is the value source — so this is
execution, not deliberation.

**Do this after Step 5, never before.** With the loophole still open, converting
`'20px'` → `20` removes a warning without using a token, and the gate teaches
the wrong lesson.

> Read `06-styling-and-design-tokens.md`, `11-accessibility-standards.md`.
>
> Convert the exact-match values first — these are **byte-identical at render
> time, so zero fidelity risk**: the 4px grid (`'4px'`→`var(--space-1)` …
> `'80px'`→`var(--space-20)`), `'60px'`→`var(--header-height)`,
> `28|36|44px`→`var(--control-sm|md|lg)`, icon sizes→`var(--icon-*)`.
>
> **File by file, biggest first.** `AdminScreen.tsx` (157) and
> `IssueWorkspaceScreen.tsx` (150) are **46% of all warnings between them.**
>
> Then give the un-tokenizable residue a named home — `#DDE3E9`, `11.5px`,
> `12.5px`, the `186px` label column, `#F0F2F5`, `#E2F4F2`. These are
> **prototype constants**, not token failures. One module, one comment per value
> naming where in the prototype it came from. Then they are a single
> warning-suppressed import instead of forty scattered magic numbers, and when
> the design system absorbs them it is one file to delete.
>
> Lower the values ceiling after every file. **Never raise it.**

⚠️ **Two token facts that will trip you.** The spacing scale is **ordinal, not
pixel-named** — `--space-4` is 16px and `--space-8` is 32px, so anyone reading
`--space-8` as 8px is off by 4×. And `standards/06`'s status-colour section asks
for hues for `TOP_ISSUE` and `OUT_OF_SCOPE`, which are **BRD-8 names you do not
use** — your seven are prototype-derived per the 2026-08-23 directive.

---

## Step 9 — Conformance slices (Phases 3.2–3.4)

Styling → components → data access. Characterization-first; behaviour exists and
must survive. Lower the ratchet after each slice.

**Scope honestly:** with no backend, "data access" is the seed store. Most of
`standards/05` describes a transport layer that does not exist yet.

---

## Step 10 — State and data layer (Phase 3.5)

**Blocked on decisions 2, 3 and 4 — and on a backend existing at all.**

When it unblocks, the store is where the work is. `data/store.tsx` is database,
API client and reducer in one file, and it encodes three domain rules that must
survive any rewrite:

- **Links are reciprocal.** `linkIssue(a,b)` writes both sides. Break one and the
  workspace shows an asymmetric relationship.
- **Propose → approve.** `proposeTransition()` parks the target in side fields;
  status only moves when an override role approves. **A state change without an
  audit entry is a bug** — nearly every mutation calls both `touch()` and
  `appendAudit()`.
- **Priority is A/B/C from a points matrix** with a manual-override path.

Two rules from `standards/05` that apply the moment a transport exists: **the
fixtures predicate is a function, never a constant** — a constant freezes
`import.meta.env` at import and silently ignores `vi.stubEnv`, making a
live-branch test pass for the wrong reason — and **Zod at the boundary**, which
matters more across a language boundary because there is no shared type to break.

---

## Step 11 — Phase 4, the parts that need a source

1. **List the screens from the prototype**, by file.
2. **Write each screen description** against `standards/29`'s ten questions.
   A question the prototype does not answer becomes a `[PLACEHOLDER]`.
3. **Derive the component inventory from the descriptions**, then reconcile
   against `component-specs/INVENTORY.md` — treating disagreement as evidence
   about *that candidate list*. Record the delta count.
4. **Write the component specs** for what the reconciliation confirms.

You are further along here than most: `src/components/` is already a documented,
barrelled, category-organised library. **Step 11 is reconciling it against the
prototype, not building it.**

---

## Decision log

| # | Decision | Date | Record | Basis |
|---|---|---|---|---|
| 1 | Token value source — **the vendored design system** | 2026-08-25 | *needs ADR* | manifest + drift gate already exist |
| 6 | **pnpm** | 2026-08-25 | *needs ADR* | stated |
| 7 | **Always a pnpm workspace** | 2026-08-25 | **ADR 0001** | stated; flat tree is a defect |
| 8 | ESLint runs a vendored oxlint ruleset — not a choice | 2026-08-25 | *n/a* | evidence |
| 2 | State libraries | | | |
| 3 | Identity provider | | | |
| 4 | Backend timing / OpenAPI | | | |
| 5 | CDN ownership | | | |

**1 and 6 still need ADRs.** Closing a placeholder is three edits in one commit —
the record, the tier-file edit, the register move
(`standards/31-documentation-standards-and-decision-records.md`).

---

## If something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| `docs:standards:check` fails after copying | line endings changed in transit | `frontend/.gitattributes` with `* text=auto eol=lf` |
| Markdown reformats on commit | `.prettierignore` missing the corpus | Step 0 |
| **Adherence count drops to zero after the split** | a lint glob or import pattern no longer matches — **it does not error** | Step 6; re-point in the same commit |
| Build fails on a correct `<Button onClick>` | the prop allowlist predates TypeScript | Step 5.3 |
| A warning disappears without a token being used | the numeric loophole | Step 5.5 |
| `tokens:check` has never failed | it is not in `build` and the hooks are stubs | Step 5.6 |
| A hook never fires | `core.hooksPath` is **local config and does not clone**; or the hook is not `100755` in the index | run `node frontend/scripts/setup-hooks.mjs`; `pnpm run hooks:check` verifies |
| A hook fires but never fails | the script ends in `echo`/`tee`, returning that exit code | Step 5.8 |
| ~~Your commits appear to vanish~~ | **cannot happen** — one repository, no pointers | n/a; withdrawn in pass 4 |
| Dev server dies on boot after a seed edit | `assertSeed.ts` date-anchor guard | working as designed |
| Fidelity captures differ after a "pure move" | it was not pure | revert; separate the behavioural change |
| A hard refresh on `/issues/:id` 404s | `BrowserRouter` with no server rewrite | decision 5 |

---

## What this file deliberately leaves out

**Rules.** Each lives in the tier file that owns it. A restated rule disagrees
with its owner within a month.

**Harness procedure.** BMAD's skills and gates belong to `.claude/` and `_bmad/`
and change with them. Anything procedural here is a snapshot.

**Anything the vendored design system owns.** `_adherence.oxlintrc.json`,
`styles/design-system/**` and `tokens.generated.ts` are byte-copies or
generated. This runbook re-points the tools that read them and never edits them.
