# 30 — Restructuring an Existing React Project
**Tier:** 1
**Status:** DRAFT — proposed addition, pending review

Assumes 00-core-rules.md; where the two conflict, 00 wins.

## Purpose
How to bring a React project that **already exists** onto this corpus.
Every other file here describes a target. This one describes the move.

## Why this file has to exist
01-project-structure-and-architecture.md opens by saying what it is:

> This file specifies how the React app is organized. It is written as a
> **target structure to build to**, not as a set of corrections to an
> existing tree — there is no prior React code in this repository to
> correct.

That is true of the whole corpus. Twenty-nine files describe a
destination and none describes a journey, which is fine while the only
consumer is a greenfield scaffold and useless the moment one is not.

**The specific case this is written for**: a React project that already
has working screens — typically UI generated from a design tool, wired
together enough to demonstrate — and now needs to be restructured onto
these rules. That project has three properties the corpus does not
anticipate. It has code that works and must keep working. It has
decisions already made, some of which conflict. And it has no history
with this corpus, so every rule arrives at once.

## The three rules that govern the whole move

**R-1 — Structure before style, always.**
Move a file to where it belongs before you rewrite what is inside it. A
misplaced file that follows every naming rule is still misplaced, and the
person who has to move it later has to re-review its contents too.
Placement is cheap to change now and expensive after imports multiply.

**R-2 — Never restructure and rewrite in the same commit.**
A commit that moves a file and changes it produces a diff nobody can
review: the tool shows a delete and an add, and the actual change hides
inside them. Move in one commit, change in the next. This is the single
discipline that decides whether the move is reviewable.

**R-3 — A rule that cannot be enforced yet is not adopted yet.**
Do not spend a week conforming to a rule and then leave nothing checking
it. Every rule adopted in Phase 1 below arrives **with its gate**. This
is not process for its own sake: an unenforced convention in a codebase
under time pressure survives about three weeks.

## Phase 0 — Establish the baseline (do not skip)

**Nothing is restructured in Phase 0.** Its whole output is a written
picture of what exists, because every later phase's estimate depends on
it and because a restructure with no baseline cannot be told from a
regression.

| # | Task | Output |
|---|---|---|
| 0.1 | **Record the current state.** File count by type, component count, LOC, dependency list with versions, existing test count and coverage if any, current bundle size if measurable. | A dated snapshot committed to the repository. |
| 0.2 | **Make the build reproducible.** Node version pinned, lockfile committed, `install` → `build` working from a clean clone. | A green build from a fresh clone, and the friction it surfaced written into 19-onboarding-and-dev-workflow.md — that file exists to be filled in by exactly this experience. |
| 0.3 | **Get the tests green, or record that there are none.** | A number, honestly stated. Zero is an acceptable answer; "some fail intermittently" is not — quarantine or delete those first. |
| 0.4 | **Map what exists onto 00's Corpus map.** For each concern, one of: conforms / diverges / absent. | The gap register that drives Phases 1–4. |
| 0.5 | **Identify the load-bearing screens.** Which screens are demonstrated, which are half-built, which are dead. | A list. Dead screens are deleted in Phase 1, not restructured. |

**0.5 deserves more weight than its size suggests.** Design-tool output
tends to include screens nobody asked for and variants nobody chose.
Restructuring a dead screen costs the same as restructuring a live one
and returns nothing. **Delete first, then count.**

## Phase 1 — Enforcement before conformance
Adopt the gates while the codebase still violates them, with the
violations **counted and allowed** rather than fixed. This inverts the
obvious order deliberately: it means every subsequent phase's progress is
visible as a falling number rather than asserted.

| # | Task | Owner file |
|---|---|---|
| 1.1 | ESLint flat config, the five-position chain, a11y rules at their specified severities | 14, 11 |
| 1.2 | Prettier, one config, formatting applied once in a single commit that changes nothing else | 14 |
| 1.3 | TypeScript baseline — `strict`, `noUncheckedIndexedAccess`, both `noUnused*` | 02 |
| 1.4 | Test harness — Vitest, RTL, the coverage reporter | 10 |
| 1.5 | CI running typecheck, lint, format, build, test on every pull request | 15 |
| 1.6 | Commit conventions and hooks | 23 |
| 1.7 | The environment contract — `env.d.ts`, `.env.example` | 13 |

**How to adopt a gate against a codebase that fails it.** Three
mechanisms, in order of preference:

1. **Fix it now** if the count is small. A dozen lint errors are cheaper
   to fix than to track.
2. **Baseline it** — record the current violation count and fail CI on
   any *increase*. This is the right answer for the large ones (`any`
   usage, missing types, a11y violations) because it stops the bleeding
   immediately and costs nothing.
3. **Scope it** — enable the rule on new and changed files only, via a
   lint-staged pass or a per-path override. Last resort, because a
   two-tier codebase is a codebase people stop reasoning about.

**Never lower a threshold to make the gate pass.**
10-testing-standards.md names this exact move as the one that makes a
number permanent, and the reasoning transfers unchanged: a threshold that
starts low has to be raised by someone, at a moment when raising it fails
the build, and that moment never arrives. Coverage is the case to watch
— an existing project with no tests cannot meet 85/85/85/85 on day one,
so **baseline it at the current number and ratchet**: CI fails if
coverage drops, and the floor rises with each merge that adds tests. The
target stays 85; the gate is "not worse".

## Phase 2 — Structure

Move files to where 01 says they go. **No content changes** (R-2).

**Order matters, and this is the order:**

1. **`packages/design-tokens`** — token values only. Nothing depends on
   anything else.
2. **`packages/ui-library`** — into the eight category folders, `base/`
   first. Two placements are worth stating because they are the usual
   mistakes: `BaseModal` goes in `overlay/`, `BaseDataTable` in `data/`.
3. **`apps/portal`** — `pages/` for thin route hosts, feature UI under
   `components/<Module>/<Feature>/`, and 01's feature-folder depth rule
   (flat until ~15 files or 2+ genuinely distinct sub-concerns).
4. **The shell** — routing, layouts, state, HTTP client, per 01's
   "the portal shell runs in parallel, not after".

**Three decisions to make before moving anything**, because each one
changes where files land and re-deciding after the move is a second move:

- **Is it a monorepo?** If the existing project is a single app with no
  packages, 01's three-package split is a real change and not a
  cosmetic one. It is worth it if a component library is genuinely
  shared or genuinely reusable; it is overhead if there is one app and
  will only ever be one. **Decide deliberately and record the reasoning**
  — 00's Source precedence case 4 applies: nothing in this corpus governs
  whether *your* project should be a monorepo.
- **Where is the workspace root?** Per 00's Path convention, every path
  in this corpus is relative to it.
- **What is a component versus a screen?** 01's `ui-library` is
  framework-level and reusable; a component used by one feature stays in
  that feature. Design-tool output usually does not draw this line, so
  it is drawn during the move — and the bar is **used by 2+ features**,
  not reusable in principle.

**The commit shape for this phase**: one commit per move, or one commit
per coherent group of moves, with **`git mv` so history follows**. A
restructure that loses `git blame` costs more than it saves.

## Phase 3 — Conformance

Now change contents. Roughly in this order, because each unblocks the
next:

| # | Work | Owner file |
|---|---|---|
| 3.1 | **Tokens.** Extract every hardcoded colour, spacing, radius and type value into `design-tokens`; map through `@theme`; replace call sites with token classes. | 06 |
| 3.2 | **Styling.** One system. If the project mixes CSS Modules, styled-components and Tailwind, converge — 06 bans the split and names the failure mode. | 06 |
| 3.3 | **Types.** Remove `any`; replace `enum` with string-literal unions; co-locate `ComponentName.types.ts`. | 02 |
| 3.4 | **Component surfaces.** Callback-prop naming, content composition, the `className` boundary, default vs named exports. | 03, 06, 14 |
| 3.5 | **State.** Classify every piece of state once: server state to TanStack Query, client state to Zustand. This is usually the largest single item. | 04 |
| 3.6 | **Data layer.** HTTP client, services, mappers, Zod schemas at the boundary. | 05 |
| 3.7 | **Routing.** Nested layout routes, lazy page components, error boundaries declared statically. | 07, 03 |
| 3.8 | **i18n.** Extract every user-facing string to a co-located `.i18n.ts`. | 09 |
| 3.9 | **Accessibility.** Whatever the a11y lint rules surfaced in Phase 1. | 11 |
| 3.10 | **Tests.** Toward 85/85/85/85, ratcheting. | 10, 26 |

**3.1 before 3.2 is not arbitrary.** Converting a stylesheet to Tailwind
while the values are still literals produces Tailwind classes full of
arbitrary values — `bg-[#18468F]` — which 06 bans and which is strictly
harder to fix than what you started with. Extract the values first.

**3.5 is where the estimate goes wrong.** State classification looks like
a refactor and behaves like a redesign: a component holding server data
in local state usually also owns the fetch, the loading flag, the error
flag and a stale-data bug, and all four disappear when it becomes a
query. Budget generously and do it feature by feature, never globally.

## Phase 4 — The parts that need a source

Three things cannot be derived from the existing code, however carefully
you read it:

| Need | Source | If the source does not exist |
|---|---|---|
| Component specifications | The prototype, via screen descriptions (29) | The existing screens *are* a source, but a weaker one — they show what was built, not what was agreed. Write the descriptions from them, mark every row as derived-from-implementation, and treat the first design review as the real derivation. |
| Domain vocabulary — statuses, roles, entities | A BRD or equivalent | **Do not infer it from the code.** 17 records what happens when implemented values are mistaken for agreed ones: this corpus carried a ten-value status set from shipped code for several revisions before the eight-value business set corrected it. |
| Quantified NFRs | A requirements document | Use 12's Core Web Vitals floor, which is external and needs no local authority, and mark everything else unspecified. |

**The honest position, if none of the three exists**: this corpus still
governs code shape completely, and governs behaviour not at all. Say so
rather than inventing a source. 00's Source precedence case 4 is the rule
and it is the most-used one in a restructure.

## What to do when the existing project conflicts

Ordered by how often each comes up.

| Conflict | Resolution |
|---|---|
| A different library does the same job (Redux, MUI, styled-components, Jest, Cypress) | The stack in 00 is confirmed and the alternatives are named as prohibitions. **But a working Redux store is not a defect, it is scope.** Plan the replacement, do not fail the build on it, and never run two state libraries in parallel longer than one milestone. |
| A component library with its own theme and CSS | 06 rules out "a component library's own CSS, theme or preset". The migration path is 06's headless-primitive exception: keep behaviour, drop styling, wrap it as `Base*` so call sites do not move again when the primitive is swapped. |
| Design-tool-generated components with hardcoded everything | Expected. Phase 3.1 exists for this. Extract values, do not rewrite the components — the generated structure is usually fine and the values are the problem. |
| A component the corpus has no category for | 01's eight categories are exhaustive for this product. If something genuinely does not fit, that is a question against 01, **not** a component at `components/` root — 01 records that exact failure mode. |
| A screen with no requirement behind it | Phase 0.5. Delete it or write the requirement. Do not restructure it. |
| A convention the existing project follows consistently and well, that this corpus contradicts | **Raise it as a question against the standard.** A consistent convention is evidence; a rule that contradicts one deserves to be re-argued rather than mechanically applied. 00's case 3 already works this way for visual values, and the same reasoning holds for code shape. |

## What not to do

Each of these is a real, tempting move that makes the restructure worse:

- **A big-bang rewrite.** The corpus is large and arrives all at once,
  which makes "start again" look cheaper than it is. It is not: a rewrite
  discards the one thing the existing project has, which is working
  behaviour, and it has no intermediate state anyone can review.
- **Restructuring and feature work in the same branch.** The review
  becomes impossible and the branch never merges.
- **Adopting rules in the order they are numbered.** The tier numbers are
  a filing scheme, not a sequence. Phase order above is the sequence.
- **Fixing every lint error before turning lint on.** Phase 1's whole
  point is the opposite.
- **Deferring the gates to "after the restructure".** The restructure is
  exactly when the gates are needed; afterwards there is nothing left to
  hold in place.
- **Treating a `[PLACEHOLDER]` as permission to invent.** A placeholder
  names a decision nobody has made. In a restructure the temptation is
  acute, because the existing code usually *has* an answer — and an
  answer found in code is provenance, not a decision (17's status-set
  correction is this exact mistake, caught late).

## Definition of done for a restructure

Not "the files moved". All eight:

1. Every gate in Phase 1 runs in CI and fails on a deliberately-introduced
   violation.
2. Coverage is at or above its Phase-0 baseline and the ratchet is
   enforced.
3. Every file is where 01 says it goes; no folder named `shared` outside
   the one app-wide location; no component at `components/` root.
4. Zero hardcoded design values; zero `any`; zero user-facing string
   outside an `.i18n.ts`.
5. Every screen that existed at Phase 0 still works, verified by a
   walkthrough, not by the build passing.
6. `git blame` still resolves on moved files.
7. Every deviation from this corpus is recorded in
   18-project-context-and-implementation-status.md's register with a
   trigger and an owner — **not** left as an undocumented difference.
8. The Phase-0 snapshot is updated with the after numbers, so the next
   person can see what the move cost and what it bought.

## Sequencing note
Phases 1 and 2 can overlap; 3 cannot start until 2 is done for the area
being changed; 4 runs in parallel throughout and is usually the long
pole, because it depends on people rather than code.

**One estimate that is safe to give**: Phase 0 is days, Phase 1 is a
week or two, Phase 2 is proportional to file count and mostly mechanical,
and **Phase 3.5 (state classification) is the one that will surprise
you.** Every other phase is bounded by what exists; that one is bounded
by how confused the existing state model is, and you cannot tell from the
outside.

## Three mechanisms the prior repository already proved
This file's Phase 1 requires enforcement before conformance and names three
gate-adoption mechanisms. The prior repository, audited in
`../analysis/vue-baseline-audit.md`, ran all three on a live codebase. What it
learned:

### `warn` with a named trigger is adoption; `warn` alone is abandonment
Its lint config sets project-convention and accessibility rules to `warn` "so CI
stays green while they are burned down incrementally", with the accessibility
block naming the phase and owner that flip it to `error`.

**This is the mechanism to use for an inherited codebase**, and
14-code-style-and-linting.md now requires the trigger and owner to be written in
the config file. Without them the rule is not on a schedule — warnings scroll
past in CI forever and the burn-down never has a moment when it is due.

### The coverage ratchet has a precedent, and a number
The prior repository's split floors (85/78/80/85) let branch and function
coverage drift down until a PR failed at 79.82% functions. It replaced them with
a single uniform floor. **A ratchet is the same idea applied to a codebase that
starts below the target** — record today's number as the floor, fail on any
drop, raise it, delete the ratchet at 85. Do not re-derive split floors as a
staging mechanism; that experiment has already been run here and it failed.

### Delete the empty folders
Six exist in the prior working tree, and two of them are competing homes for the
same file kind. **A restructure inherits them silently** — they survive a move
because there is nothing in them to move.

Enumerate empty directories in Phase 0's baseline and delete them in Phase 2.
Each one is either a decision nobody made or a decision nobody honoured, and
either way the next person files something there because the folder exists.

## Protect the history you are about to churn
**Before the first bulk commit**, add `.gitattributes` (`* text=auto eol=lf`) and
`.git-blame-ignore-revs`.

The line-ending file goes first and it goes **before the formatting baseline**,
because retrofitting it afterwards renormalises the whole tree — a second
whole-repository diff on top of the first. The prior repository has a
`prettier --check` CI gate, an `.editorconfig` declaring LF, and no
`.gitattributes`, which is why that gate cannot be satisfied on a
CRLF-checkout platform while staying green in CI. Do not inherit that.

The blame file goes next, and 23-git-workflow-hooks-and-commits.md owns the
rule: every bulk mechanical commit appends its SHA. **This is the practical
enforcement of this file's second governing rule** — a bulk commit that also
changed behaviour cannot honestly be ignored by blame, so the rule against
mixing them stops being a matter of discipline.

## Some ambiguity is inherited, and that changes who resolves it
Not everything unclear in the target codebase originated there. The two
`tokens.css` files that 18-project-context-and-implementation-status.md carries
as an open placeholder exist in the **prior** repository too, with the same
absent explanation, both marked in its tooling as "owned by the token pipeline,
not hand-formatted" — describing a pipeline that does not appear to exist.

**An inherited ambiguity is a prerequisite of the restructure, not a cleanup
task inside it.** Nobody on the current team decided it, so nobody on the
current team can resolve it by reading the code; it needs a decision, and the
decision needs to happen before the token scales are authored rather than during.

Phase 0 should separate the two: defects the current codebase introduced, and
questions it inherited. They have different owners and different urgency.

# ─────────────────────────────────────────────────────────────
## Running this inside the MoAI-ADK SPEC workflow

The target repository does not take ad-hoc commits. Work flows through
`/moai plan → /moai run → /moai sync`, and
32-working-within-the-moai-spec-workflow.md owns the mechanics. What belongs
**here** is the mapping: **this file's phases are not one SPEC.**

| Phase | SPEC | Methodology | Why |
|---|---|---|---|
| 0 — Baseline | `SPEC-FE-BASELINE` | neither — it produces a report, not code | it is the evidence every later SPEC's acceptance criteria are written against |
| 1 — Enforcement | `SPEC-FE-GATES` | **DDD** | it changes no source; acceptance is "every gate green on untouched code" |
| 2 — Structure | `SPEC-FE-STRUCTURE` | **DDD** | moves only; characterization tests are exactly the right instrument |
| 3.1 — Tokens | `SPEC-FE-TOKENS` | DDD | blocked on the design-source decision below |
| 3.2–3.4 | one SPEC per slice | DDD | brownfield with existing behaviour to preserve |
| 3.5 — State | `SPEC-FE-STATE` | **TDD** | new code, not a move — see 04 |
| 4 — Sources | per artefact | — | descriptions and specs are documents |

### Choose DDD deliberately, and choose it early
The harness selects methodology from `quality.yaml`, and its own guidance is
**DDD (ANALYZE-PRESERVE-IMPROVE) for existing code below 10% coverage, TDD
above**. The target frontend is at 90%, which points at TDD.

**For Phases 1 and 2 that is the wrong reading.** TDD's RED step presumes you
are adding behaviour. A restructure adds none — it moves files and installs
gates, and its correctness criterion is *nothing changed*. **DDD's
characterization tests are precisely this file's rule that a restructure must
prove it broke nothing**, expressed in the harness's own vocabulary.

Phase 3.5 is genuinely new code and genuinely TDD. **Say so in each SPEC** —
the default will otherwise pick TDD for all of them.

### The drift guard will fire on Phase 2, and that is not a defect
The harness re-plans above **30% drift** between planned and modified files. A
structural move touches far more files than a plan enumerates by name.

**So enumerate by `directory`, not by file**, and state the expected file count
in the SPEC's acceptance criteria. A Phase 2 SPEC that names forty files will
drift on the forty-first and re-plan mid-move — which is the one thing this
file's "never leave the tree half-moved" rule cannot survive.

### Acceptance criteria that make a restructure verifiable
Generic criteria pass on a restructure that quietly changed behaviour. Use these
instead, per SPEC:

- **Phase 1:** every gate green on **unmodified** `src/`. Zero files under
  `frontend/src` in the diff.
- **Phase 2:** the full check suite green at **every** commit, not only the last.
  Test count identical before and after. Every bulk SHA in
  `.git-blame-ignore-revs`.
- **Phase 3.x:** coverage ratchet raised, never lowered. No behavioural change
  outside the slice's stated scope.

### One SPEC never spans two phases
This file's second governing rule — never restructure and rewrite in the same
commit — becomes, at this level: **never structure and conform in the same
SPEC.** The harness's `sync` phase opens one MR per SPEC, and an MR that both
moves the tree and changes behaviour is unreviewable no matter how the commits
inside it are arranged.

### Phase 0 is a SPEC, not a warm-up
It is tempting to run the baseline as a conversation and start planning from
Phase 1. Don't. The baseline **is** the artefact every later SPEC's acceptance
criteria reference — the coverage floor, the bundle number, the file inventory,
the Claude Design ownership list. A number nobody committed is a number nobody
can be held to.
