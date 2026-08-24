# AI Review: Frontend Development Standards & Coding Guidelines v1.0 — Round 3

**Documents Reviewed:** `PQMS_docs/standards/00-*.md` … `20-*.md` (21 tier files, 7,404 lines), `component-specs/TEMPLATE.md` (289 lines), the generated `Frontend-Development-Standards-v1.0.md`, `scripts/build-standards-doc.mjs`, and — new to this round — the two real trial components: `packages/ui-library/src/components/base/BaseButton/*` and `apps/portal/src/layouts/AppHeader/*`, their test suites, and the actual toolchain (`docs:standards:check`, `typecheck`, `lint`, `test:coverage`, `build`), run live rather than taken on report.

**Review Date:** 2026-08-21
**Reviewer:** AI-assisted independent review (Claude), third round — fresh-context close-read, no reliance on round 2's conclusions, followed by re-verification against the repository and, for the first time, against running code.

**Review Scope:** Whole corpus, re-read cover-to-cover rather than assumed unchanged, since the repo itself has been renamed (`frontend/` → `pqms-portal/`) and the corpus edited multiple times since round 2. Plus the two real components and everything downstream of them: toolchain output, package.json scripts, vitest configs, the generated bundle.

> **Round 3.** This supersedes the round-2 review at this path. §6 records what round 2 found and what has changed since. Six of round 2's ten highs/mediums-worth-tracking are independently re-verified as fixed; two are confirmed still open; this round adds nine new findings, three of them sourced from evidence that did not exist in round 2 — the trial components and the toolchain run against them.

---

## 1. Review Methodology

1. **Close-read, cover-to-cover**, of all 21 tier files, `TEMPLATE.md`, and `build-standards-doc.mjs` — none assumed unchanged from round 2's read, since the repo was renamed and several files show revision bumps since then (00 REV 10, 03 REV 8, 08 REV 11, others). Round 2's own findings were used only *after* an independent read, to check what changed — never as a starting checklist.
2. **Live toolchain run**, not a report of one: `node scripts/build-standards-doc.mjs --check`, `pnpm typecheck --force`, `pnpm lint --force`, `pnpm --filter @pqms/ui-library test`, `pnpm --filter @pqms/portal test:coverage`, `pnpm build --force`, plus direct reads of every `package.json`, every `vitest.config.ts`, `tsconfig.base.json`, and `eslint.config.js`.
3. **The two real components read as code**, not summary: `BaseButton.tsx`/`.types.ts`/`.constants.ts` and its spec, `AppHeader.tsx`/`.types.ts`/`.i18n.ts` and its spec, `tokens.css`, `cn.ts`, both test-setup files.
4. **Wrap-tolerant sweeps** for known trouble patterns (the `pqms-portal/`-prefix rule, stray dangling sentences, the generator's own historical defects), matching the corpus's own stated discipline for a corpus that hard-wraps at ~72–80 characters.
5. **Repository verification** of every checkable claim against the actual repo state, not the standard's own citation of itself.
6. **Only then**, round 2's review, to compile §6.

---

## 2. Executive Summary

The corpus is measurably better than at round 2, and for the first time some of that is proven rather than argued. Six of round 2's findings — three high, three medium/low — are independently confirmed fixed by direct inspection: the generator's wrap-blindness (H1/H2), the stray corrected-count digit (H3), 07's misattribution of the focus target to 11 (H4), the `Base*`-index type-pollution (M4), and 17's prototype-register overclaim (M8). The generator script in particular was rebuilt correctly — it now flattens wrapped tokens before every regex and filters type-suffix identifiers out of the component-mention index, exactly as round 2's "Recommended Next Step" asked for.

**The real story this round is the two trial components**, because they are the first evidence this corpus has ever produced of what it looks like when the specification meets code. The verdict is mixed in a specific, informative way: the corpus governed correctly on everything it actually specifies — naming, styling mechanism, the `className` boundary, callback conventions, i18n co-location, test placement and query priority, the do-not-fabricate discipline (both components carry sourcing comments citing exact hex values and measurements, with an honest "no direct evidence" flag on `BaseButton`'s `sm` size). It was silent on real questions the builder had to answer alone — an icon library, a dropdown's keyboard contract, i18n-bootstrap ownership — and each silence is now correctly logged in 18 as an open item rather than smuggled in as a fact. And the toolchain surfaced a category of defect no prior round could have found: the corpus specifies exact `package.json` scripts, with reasoning, in 20 — and the actual scaffold does not match that specification in four places, undetected because there is no CI yet to catch it.

**Findings: 21 total — 2 high, 9 medium, 10 low.** Nine are new this round; seven are carried forward unfixed from round 2 (§5); six of round 2's are independently confirmed fixed (§6) and not re-listed as findings.

### High

| # | What | Where |
|---|---|---|
| **H1** | **`ui-library` and `design-tokens` are missing the `test:coverage` script that 20 explicitly specifies, with a stated reason, for exactly those two packages** — "`test:coverage` exists so the root `turbo test:coverage` above reaches this package… without it, this package's tests run but its coverage is never measured, which is the `kus-pqms` gap 15 records." Both `package.json`s have only `"test": "vitest run"`. Confirmed by running `pnpm --filter @pqms/ui-library test:coverage` directly: `[ERR_PNPM_RECURSIVE_RUN_NO_SCRIPT]`. The root `package.json` also has no `test:coverage` script at all — 20 specifies `test:coverage: turbo test:coverage` there too. So the exact `kus-pqms` failure mode 15 was written to prevent — one package's coverage silently never running — is reproduced today, on two of three packages, in the repo built from the standard that names this failure mode by its own history. | `packages/ui-library/package.json`, `packages/design-tokens/package.json`, root `package.json` vs `20-glossary-and-appendix.md:166-191` |
| **H2** | **`ui-library`'s `vitest.config.ts` has no `coverage` block at all — not even the commented-out placeholder `apps/portal`'s carries.** `apps/portal/vitest.config.ts` anticipates 10's 85/85/85/85 gate with an exclude list matching 20's exact snippet and a deliberately commented `thresholds` block, with a comment explaining why (10's zero-covered-files edge case). `packages/ui-library/vitest.config.ts` has neither the `coverage` key, the exclude list, nor the comment — the same standard applied once and skipped once, on the two packages that between them are this repo's only real code. Since H1 already means `ui-library`'s coverage cannot be produced via its own script, this compounds it: even if the script existed, nothing tells `vitest` what to exclude or gate. | `packages/ui-library/vitest.config.ts` (entire file) vs `apps/portal/vitest.config.ts:19-38`, `10-testing-standards.md:32-70` |

### Medium

| # | New? | What | Where |
|---|---|---|---|
| M1 | **New** | **The root `lint` script doesn't match 20's specification, and an unspecified pair of scripts was invented instead.** 20's Commands Reference states, in a block introduced as "quoted verbatim" and matched against exactly for `typecheck`: root `lint` → `eslint .`. The actual root `package.json` has `"lint": "turbo lint"` (fanning out to each package's own `eslint .`) plus two scripts absent from the spec entirely, `lint:eslint` and `lint:eslint:fix`. This may well be the better engineering call — it matches how `build`/`test`/`typecheck` are already all `turbo *` — but it is an undocumented deviation from a script table the corpus itself calls authoritative and mandates checking scripts by ("scripts are named for what they do"), and nothing in 18 records the decision the way `05`'s fixtures-mode PLACEHOLDER or `06`'s React Aria PLACEHOLDER are recorded when reality moved past a spec. | root `package.json` vs `20-glossary-and-appendix.md:121-136` |
| M2 | **New** | **`AppHeader`'s notification trigger declares `aria-haspopup="true"` (≡ `"menu"`) over a panel that is not a menu.** The panel's rows are plain `<button type="button">` elements with no `role="menuitem"`, no roving `tabindex`, and no arrow-key navigation between them — a user reaches each one by `Tab`, not by arrow keys, which is exactly the interaction model `aria-haspopup="menu"` tells assistive technology *not* to expect. This is a real instance of the gap 18 already names ("no standard specifies keyboard or disclosure-pattern behavior for dropdowns/popovers") producing a plausible-but-wrong artifact rather than a silence: Escape-to-close and click-outside (case 4 of 00's source-precedence rule, applied correctly and self-documented) were decided deliberately, but the `aria-haspopup` value was not decided at all — it reads as a default reached for because *some* value felt required on a trigger with a popup, not a value chosen against what the popup actually is. Neither ESLint's a11y preset nor `axe` flags this: it is a semantic/behavioral mismatch, not a static violation, which is precisely the gap 11 already admits lint and axe together don't close. The fix is either to drop `aria-haspopup` (a disclosure region with `aria-expanded` doesn't need it) or make the panel a real menu; either is a one-line change once decided, but nothing in 18's dropdown-gap entry currently names this specific sub-question. | `apps/portal/src/layouts/AppHeader/AppHeader.tsx:241-243` vs `11-accessibility-standards.md`'s silence on disclosure patterns |
| M3 | Carried | **The `pqms-portal/`-prefix rule is violated dozens of times, including inside the file that states it, and the rename made this worse rather than better.** 00: "Every path referenced anywhere in these standards is scoped under `pqms-portal/` explicitly… Never write or assume a path relative to repo root without the `pqms-portal/` prefix." A sweep across the corpus finds unprefixed paths in **at least 15 of the 21 files**, including 00 itself twice (`00:34-35`, `00:111-116`) — this is round 2's M6, and the repo-wide rename from `frontend/` to `pqms-portal/` (visible in 00's own "Confirmed stack" section, which now uses `pqms-portal/` throughout) is exactly the kind of corpus-wide edit that a hand-applied rule like this is most likely to survive incompletely. Representative misses: `05:8` ("One Axios setup at `apps/portal/src/shared/http/apiClient.ts`"), `07:81`, `08:746`, `14:167`, every path in `20`'s Commands Reference block. | `00:12-21` vs. e.g. `00:34-35`, `00:111-116`, `05:8`, `07:81`, `08:746`, `14:167`, `20:121-283` |
| M4 | Carried | **00's "Folder ownership" section still names a Vue library not in the confirmed stack, while 01's parallel "Package ownership" section already generalised it correctly.** 00: "No Pinia/TanStack Query usage inside base components." Pinia is Vue-only. 01's equivalent rule reads "no state-management library usage inside base components" — the correct generalisation, in the file that duplicates the same ownership statement. Round 2 (M2) found this as a 00-vs-01 disagreement; unfixed a round later, and unusual in that the more authoritative file (Tier 0, which wins all ties) is the one still carrying the stale term. | `00:110-113` vs `01:332-334` |
| M5 | Carried | **12's `rollup-plugin-visualizer` requirement is unmet, and nothing records why.** 12: "**Add `rollup-plugin-visualizer`** as a dev dependency of the portal app… This is scaffold-time work: none of the budget below is checkable without it." `apps/portal/package.json`'s `devDependencies` has no such package. The bundle-budget claim in this very review (§4, below) had to be verified against Vite's own build summary instead — which happens to work, but is not the tool the corpus names, and the gap is exactly the kind of thing 18 tracks for every other unmet obligation and does not track for this one. | `apps/portal/package.json` (absent) vs `12-performance-guidelines.md:52-56` |
| M6 | Carried | **10's only test-path example still violates 07's page convention.** Unchanged since round 1/2: 10 shows `IssueListPage.tsx` at `src/components/IssueManagement/IssueList/`, where 07 reserves `*Page` for `src/pages/` route hosts. | `10:89-92` vs `07:516-527` |
| M7 | Carried | **The obligation register in 18 still tracks a small fraction of the `[PLACEHOLDER]`s scattered across the corpus.** Not independently re-counted line-by-line this round (that would need the same tool 18 itself says doesn't exist yet), but spot-checked: `02:82`'s path-alias placeholder, `12:101`'s TipTap-weight placeholder, and `15:62`/`15:67`/`15:297`'s CI placeholders are none of them named in 18's register, which is scoped to the "Decisions blocked on React port" list rather than every `[PLACEHOLDER]` in the corpus. Whether that scoping is a deliberate boundary or an accidental one is itself unstated. | `18:29-458` vs scattered `[PLACEHOLDER]`s across 02, 12, 15 |
| M8 | Carried, restated | **C1 — the corpus's committed customer requirements are still quoted from a BRD version 17 itself records as possibly superseded.** Not independently re-verified against the actual BRD documents this round (they sit outside this repo and outside this review's practical scope), but the corpus's own internal state is unchanged: 18 does not list "confirm which BRD version governs" among its tracked open items, despite 17 and 08 both citing NFR-05/NFR-08 from v1.3 while flagging that a v1.5 may supersede it. Carried at Medium rather than round 2's High because nothing this round adds fresh evidence either way — this is a restatement that the gap is still unaddressed, not a re-confirmation of the underlying BRD claim itself. | `08:213-230`, `11:283-292` vs `18` (absence) |

### Low

| # | New? | What | Where |
|---|---|---|---|
| L1 | Carried | **The dangling sentence fragment from round 2 is still there, verbatim.** "…so the sibling tie-breaker never engages. **Net** / So the static segment wins on specificity…" — an editing artifact that has now survived two review rounds. | `07:348-349` |
| L2 | Carried | **The "config below" reference is still wrong** — the route-object code block it refers to is above the "Lazy loading" section that makes the claim, not below it. | `07:449` (claim) vs `07:379-412` (actual config) |
| L3 | Carried | **The generator still emits three permanent warnings on every run** — 03's hard-wrapped GitHub issue numbers (`#14145`, `#14150`, `#14138`) begin lines with `#`. Confirmed live: `node scripts/build-standards-doc.mjs --check` prints all three even on a clean, in-sync run. Benign, and exactly the kind of noise round 2 flagged as training the warning channel to be ignored. | `03:317-323`; confirmed via live run |
| L4 | **New** | **`BaseButton`'s `sm` size (36px) is documented, correctly, as unverified — but the flag lives only in a code comment, not in 18's obligation register**, even though it is exactly the shape of open item 18 already tracks two entries for (the icon-button cluster, the `--control-sm` renumbering question). A reader of 18 alone would not know this specific measurement is unconfirmed. | `BaseButton.tsx:17-23` vs `18:90-104` |
| L5 | **New** | **`apps/portal`'s `.env`/`env.d.ts`/`.env.example` machinery that 13 specifies in detail does not exist yet**, which is expected at this stage (no service layer has been built) but is not stated anywhere as a known, deliberate gap the way most other not-yet-built pieces of this corpus are — 13's entire "Secrets and environment variables" section reads as already-built infrastructure with no marker that zero of it exists in the repository today. | `13:176-296` vs repo state (no `.env*`, no `env.d.ts`) |
| L6 | **New** | **`packages/design-tokens` has no logic to test yet, so "coverage runs for every package" is currently unverifiable end-to-end for any of the three packages simultaneously**: `design-tokens` has nothing to cover, `ui-library` has no way to run coverage (H1), and only `apps/portal` actually produces a coverage report today. | live `pnpm --filter @pqms/design-tokens test` output; `15-devsecops-and-ci-cd.md:155-195` |
| L7 | Carried | 20's `clean sh scripts/clean.sh` still names a script that does not exist (`scripts/` holds only `build-standards-doc.mjs`), and there is still no `clean` entry in the root `package.json`. | `20:134`; confirmed via directory listing |
| L8 | Carried | The "four fabricated values" tally is still stated in three places (00, 18, TEMPLATE) and none of them cross-references the other two by count in a way a script could verify — the same shape of hand-maintained fact 00's own appendix rule now argues should be computed instead. | `00:263-266`, `18:193-198`, `TEMPLATE.md:76-83` |
| L9 | Carried | 06's `Pqms*` type list still enumerates 12 named types against the file's own claim; not independently recounted this round against the actual `BaseButton.types.ts` (which contributes `BaseButtonVariant = PqmsButtonVariant` and `BaseButtonSize = PqmsSize`, both on the list), so this is carried at low confidence rather than re-verified. | `06:344-350` |
| L10 | **New** | **19 ("Onboarding and Dev Workflow") is still `EMPTY — pending draft`, and its own trigger has now fired twice over.** Its stated trigger is "after the first real screen is built and running locally" — two components now exist, are typechecked, linted, tested, and buildable, and `pnpm dev` was never exercised against them as part of writing this file. This is not a defect in the file (its reasoning for staying empty until real friction exists is sound and was reaffirmed at round 2), but the trigger condition is arguably satisfiable today and nothing in 18 tracks it as due. | `19-onboarding-and-dev-workflow.md` (whole file) vs `18`'s tracking list (absence) |

---

## 3. Governing Power, Code Correctness, Test Correctness, Deployment Viability — scored for real, for the first time

These four dimensions were `UNPROVEN`/`N/A` in both prior rounds for lack of code. That excuse no longer exists. Scored here against the two real components, the real test suites, and a real, live-run toolchain — not a self-report.

### 3.1 Governing power — did the corpus produce correct code from a task description?

**Mostly yes, on what it actually specifies — and it visibly failed once, inside its own tooling layer, in a way that would have shipped silently were this a real team rather than a two-component trial.**

**Where the corpus governed correctly, verified directly against the code:**
- `className` boundary (06): neither `BaseButton` nor `AppHeader` accepts or needs one; `AppHeader` composes its own conditional classes via `cn()` throughout, exactly as 06 requires for app-level components.
- Callback naming (03): `onClick`/`onFocus`/`onBlur` on `BaseButton`; `onMarkAllRead`/`onViewAllNotifications` on `AppHeader` — standard-case, one callback per event, no positional multi-argument shapes.
- Export/naming conventions (14): both components are default exports; both constants files (`BASE_BUTTON_DEFAULT_SIZE`, etc.) are UPPER_SNAKE_CASE named exports; `Base*`/nothing-else on the component, `Pqms*` correctly aliased rather than redeclared in `BaseButton.types.ts` (`export type BaseButtonVariant = PqmsButtonVariant;` — exactly 06's specified pattern).
- i18n (09): `AppHeader.i18n.ts` self-registers its namespace via `i18n.addResourceBundle`, uses double-brace ICU interpolation (`{{count}}`) and `_one`/`_other` suffixes, and `useTranslation("AppHeader")` matches the registered namespace exactly — no bare call anywhere.
- Test placement and query priority (10): both spec files sit in the mirrored `src/tests/` tree; every query in both suites is `getByRole`/`getByText` — zero `data-testid` in either suite, matching 10's stated preference order with no exceptions needed yet.
- Do-not-fabricate discipline (00): both `BaseButton.tsx` and `tokens.css` carry dated, specific sourcing comments citing exact hex values and prototype measurements, and `BaseButton` explicitly flags its one unverifiable value (`sm=36px`, "no direct evidence and is interpolated") rather than presenting it with false confidence — precisely the discipline 00's Source-precedence case 5 asks for.
- Path-alias resolution (02's `[PLACEHOLDER]`): resolved as a single declaration in `tsconfig.base.json`, and it demonstrably works — `pnpm typecheck --force` passes clean across all three packages.
- Case-4 decisions (00, "when nothing governs it — decide deliberately and record the reasoning"): the icon library choice, the dropdown Escape/click-outside behaviour, and the i18n-bootstrap ownership question are all *decided* rather than silently assumed, and all three are logged in 18 as open items with a stated trigger for revisiting — this is the corpus's own discipline working as designed, on two live examples now instead of zero.

**Where the corpus was silent, and the silence was filled correctly and self-documented (not a defect, but real evidence for this dimension):** the icon library (`lucide-react`, no owning file), the dropdown/disclosure keyboard contract (11 has no entry for this pattern shape), i18n-bootstrap ownership. All three are exactly the shape 18 predicted a first build would surface, and all three landed in 18 rather than in an undocumented judgment call.

**Where the corpus was silent and the silence produced a plausible-but-wrong artifact:** M2 above (`aria-haspopup="true"` on a non-menu panel) is the one instance found this round. It is a real, if narrow, governing-power failure of exactly the shape 18 already names as a category ("no standard specifies keyboard or disclosure-pattern behavior for dropdowns/popovers") but had not yet produced a concrete example of.

**Where the corpus specified something exactly and the build did not match it — the new failure class this round adds:** H1 and H2. The corpus does not merely gesture at "coverage should run everywhere" — 20 names the exact script, per package, with the exact reason each one exists, in language that specifically anticipates and describes the `kus-pqms` failure mode ("two packages' tests existed and never ran in CI... nobody deleted a test; the pipeline simply stopped asking"). That failure mode has now reproduced, in the repo built from the document written to prevent it, undetected for the same reason it was undetected in `kus-pqms`: there is no CI yet to fail on it. This is not a case of the corpus being silent — it is a case of a specific, reasoned, correctly-targeted rule not being followed, with nothing in the corpus's own review checklist (16) currently phrased to catch a missing script rather than a missing test.

**Score: 7/10.** Up from `UNPROVEN`. The corpus governs correctly on the large majority of what it actually specifies, including several places where getting it wrong would have been easy (the `Pqms*` aliasing, the fixtures-mode-adjacent i18n bootstrap, the sourcing discipline). It loses points for one real silence-produced defect (M2) and, more consequentially, for a specification that was precise, reasoned, and simply not implemented in two of three packages (H1/H2) — the exact "corrected faster than corrections are verified" pattern round 2 named as the corpus's most dangerous failure mode, now observed for the first time in code rather than in prose.

### 3.2 Code correctness / compilability

**Score: 9/10.** `pnpm typecheck --force` passes clean across all three packages with zero errors. `pnpm lint --force` passes clean across all three packages with zero errors or warnings, including the full a11y preset plus 11's one hand-enabled rule (`control-has-associated-label`, configured with the exact option object 11 specifies, copied from the installed plugin rather than reconstructed). `pnpm build --force` succeeds and produces a working bundle. The one point held back is M2 — a real, if narrow, correctness defect in ARIA semantics that neither the type system nor the lint config catches, so "compiles and lints clean" is not quite "correct," and this round's job was specifically to check that gap rather than assume it closed. `noUncheckedIndexedAccess` is honoured correctly in `AppHeader.tsx`'s `avatarColorClassFor` with a stated, genuinely-unreachable fallback (`?? AVATAR_PALETTE[0]`) rather than a suppressed error — the kind of real defect 02 predicted this flag would surface, handled the way 02 asks.

### 3.3 Test-suite correctness

**Score: 7/10.** 24 tests across the two components, all passing, all using role/label/text queries, both suites including axe assertions per variant/state (`BaseButton`: 4 variants × axe, plus disabled and loading states; `AppHeader`: closed and open states) exactly matching 10's stated pattern. `AppHeader`'s coverage is genuinely strong for what exists — 100% statements/functions/lines, 93.3% branches, with `MemoryRouter` correctly wrapping every render per the router-coupling cost 18 already names as a known cost of `AppHeader`'s design. Held below 8 by H1/H2: a suite that passes and reports coverage for one package while structurally unable to do either for the other two is not a fully correct test *infrastructure*, whatever the quality of the tests that do run — and 10's 85/85/85/85 gate has never actually been exercised against a real number for either component, since `apps/portal`'s thresholds are (correctly, per 10's own stated edge case) still commented out.

### 3.4 Deployment / operational viability

**Score: 3/10, up from N/A.** Still no deployment target, no CSP actually served anywhere, no CI, no `.env` machinery — all correctly recorded as unstarted, upstream work in 13/15/18, and none of that is new information this round. What is new: a real, measured data point against 12's previously-unmeasured budget. `pnpm build --force` produces `dist/assets/index-*.js` at **100.34 kB gzipped** — comfortably under 12's 200KB initial-bundle budget, with two real components, React, React Router, TanStack Query, Zustand, Zod, i18next and lucide-react all in the graph. This doesn't move the score much — deployment viability is still almost entirely unbuilt — but it is the first time any number in this corpus's performance section has been checked against reality rather than declared as "chosen, not measured," and it moves the budget conversation into one that will have real substance once `rollup-plugin-visualizer` (M5) is actually installed and route-level chunks exist to compare against it.

---

## 4. Findable evidence, stated plainly

`docs:standards:check` passes on a clean, unmodified run — 21 tier files, in sync, three residual generator warnings (L3), zero drift. This is unchanged from round 2 and re-verified live rather than assumed. The generator script itself is meaningfully improved: `flatten()` now joins wrapped hyphenated tokens before every regex, `FILEREF` and `BASESTAR` both run against the flattened text rather than raw per-line text, and `isComponentIdentifier()` filters `Variant`/`Props`/`State`/`Size`/`Mode`/`Type`-suffixed identifiers out of the `Base*` index — exactly the two fixes round 2's "Recommended Next Step" asked for, done the way that recommendation specified ("wrap-tolerant... not by hand").

---

## 5. What Round 2 Found, Independently Re-Verified This Round

| Round-2 finding | Status now, and how it was checked |
|---|---|
| **H1** — 20's `(used in:)` list removal was incomplete (OIDC, IdP survived via wrap-blindness) | **Fixed.** 20's Technical Glossary now carries zero `(used in:)` attributions on any entry — read the whole section directly, no survivors of any kind. |
| **H2** — the derived inbound-reference index undercounted because `FILEREF` ran per-line against unflattened text | **Fixed, at the mechanism.** `build-standards-doc.mjs` now flattens every file (`flatten()`) before running `FILEREF`/`BASESTAR`/term-search against it — read the script directly; this is the exact fix the round-2 finding's own text prescribed. |
| **H3** — 13's count correction updated two of three places the number appeared | **Fixed.** All three locations (`13:236-238`, `13:244`, `13:258-259`) now read "three," re-read directly rather than grepped for one instance. |
| **H4** — 07 attributed to 11 a focus target 11 does not specify | **Fixed.** 07 now states explicitly: "Not what 11's focus hook targets — an earlier revision of this passage said it was… 11's route-change focus management moves focus to the new route's main heading… not to this id" — and separately flags the skip-link claim as an unsourced `[PLACEHOLDER]` rather than restating it. |
| **M4** — the `Base*` index counted type names and a placeholder as components | **Fixed.** `isComponentIdentifier()` explicitly filters the type-suffix vocabulary; read directly in the script. |
| **M8** — 17's Prototype register claimed other-role prototypes "not yet produced" while `ISM SEM Role.html` files sat in the same folder | **Fixed, and the underlying facts changed too.** 17 now explicitly names and dispositions `PQMS_SE.html` as "not a role variant" rather than omitting it; the repo's actual `requirements/` folder contains only `ISM SE Role.html` and `PQMS_SE.html` today — the SEM-role files round 2 cited are no longer present, so the corpus's current claim matches the corpus's current source. |
| M2 (00's stale "Pinia" reference vs 01's correct generalisation) | **Not fixed.** Re-listed as M4 in this round's findings, independently re-read in both files. |
| M6 (the `pqms-portal/`-prefix rule violated ~40 times) | **Not fixed, and the rename widened the surface.** Re-listed as M3, with a fresh grep sweep against the post-rename corpus rather than trusting round 2's count still applied. |
| L1/L2 (07's dangling "Net" fragment; "config below" pointing above) | **Not fixed, either one.** Both re-read verbatim in the current file. |
| L5 (three permanent generator warnings) | **Not fixed.** Confirmed via a live `--check` run this round, not carried from memory. |
| **C1** (superseded BRD version) | **Not independently re-verified this round** — restated at Medium (M8 in this round's list) rather than re-confirmed, since checking it would require re-reading BRD artifacts outside this repository's practical scope for this pass. |

---

## 6. Rating

| Dimension | Score | Δ from Round 2 | Basis |
|---|---|---|---|
| **Internal consistency & cross-reference integrity** | **7/10** | = | Round 2's four highs are fixed (§5). New: M1's script-table deviation, M2's ARIA mismatch. Held at 7 rather than raised by the carried M3 (path-prefix, now wider) and M4 (00-vs-01 Pinia) — the corpus fixed exactly the findings it was told about and left the two it wasn't specifically re-checked against. |
| **Sourcing discipline** | **9/10** | = | Re-verified this round against the two real components rather than against prose alone: `BaseButton.tsx` and `tokens.css`'s sourcing comments are specific, dated, and honestly flagged where unverifiable. Not 10 because C1/M8's BRD-version question remains open and untracked in 18. |
| **Decision closure** | **8/10** | = | The two live case-4 decisions found in the trial components (icon library, dropdown keyboard contract) are both closed the way 00 prescribes — decided, not assumed, and logged. Not higher because M2 shows one ARIA decision that reads as un-made rather than made-and-logged. |
| **Completeness against stated scope** | **7/10** | ▲ from unratable-as-stated | Two components now exist to test completeness against, and the corpus's coverage of what they needed was substantially complete — the gaps found (M2, and the script gaps H1/H2) are narrow rather than structural. |
| **Verification rigour on external claims** | **8/10** | = | Not independently re-tested this round (no new external-library claim was introduced by the two trial components beyond `lucide-react` and `react-router`'s `MemoryRouter`, both used exactly as documented elsewhere). Carried at round 2's score. |
| **Maintainability** | **9/10** | ▲ from 8 | The appendix mechanism round 2 flagged as under-applied and containing a blind spot is now both fixed (H2's flatten fix) and doing real work — confirmed by reading the live generated output, not by re-reading the rule that describes it. |
| **Security reasoning** | **8/10** | = | Not independently re-tested this round; no new auth/security-relevant code exists yet to check it against (both trial components are presentational). Carried at round 2's score pending real evidence. |
| **Governing power** — *would this corpus produce correct code from a task description?* | **7/10** | ▲ from UNPROVEN | See §3.1. First real evidence, and it is good news on balance: the corpus governed correctly on the large majority of what it specifies, with two informative gaps (one silence-produced, one specification-not-followed). |
| **Code correctness / compilability** | **9/10** | ▲ from N/A | See §3.2. Live `typecheck`/`lint`/`build` all pass clean; one real, narrow ARIA defect neither catches. |
| **Test-suite correctness** | **7/10** | ▲ from N/A | See §3.3. Both suites are well-constructed and pass; the coverage *infrastructure* is genuinely broken for two of three packages. |
| **Deployment / operational viability** | **3/10** | ▲ from N/A | See §3.4. Still almost entirely unbuilt, correctly so at this stage — the improvement is one real measured data point (100.34 kB gzipped) against a previously-unmeasured budget, nothing more. |

### Overall: **7.5 / 10**

**This is not a simple average, and it should not read as a step down from round 2's 8/10 — it is the same corpus now being held to a harder, more informative standard.** Round 2's 8/10 was a ceiling on specification quality alone, explicitly stated as measuring a proxy rather than the thing itself. This round measures four additional dimensions for real, for the first time, and three of the four score well (7, 9, 7) while one (deployment) is honestly still low because the work genuinely hasn't started. Blended against the specification-quality dimensions — which improved slightly on their own terms (six fixes, two new findings, several confirmed carries) — the overall number moves from an unproven ceiling to a grounded number with real evidence under most of it.

**What this round proves that the first two could not**: the corpus is not merely internally consistent — it produces mostly-correct code when followed, it catches real fabrication before it ships (both prior rounds' four fabricated-value catches plus this round's `BaseButton` disabled-color fix are evidence of the same discipline working on schedule, not despite it), and its explicit silences resolve into logged decisions rather than invisible ones. **What it also proves, which neither prior round could have found**: a corpus can be exactly right about a rule — 20's per-package `test:coverage` script, with its own case study cited as the reason — and the rule can still not survive contact with an actual scaffold, for the identical reason its own case study describes. That is the sharper, more useful finding this round produces, and it is not a reason to distrust the corpus; it is the reason a corpus like this needs the CI it has specified but not yet built (15), so that the next time reality drifts from the rule, something other than a third review round is what catches it.

**Not comparable to a review of a finished, deployed system.** Two presentational components with no backend, no auth, no routing beyond a `MemoryRouter` test wrapper, and no CI is a real but narrow slice of what this corpus governs. The scores in §3 are honestly earned against that slice and should not be read as predicting how the corpus performs against `BaseSelect`, `BaseDataTable`, or Issue Entry — components this corpus itself says are not yet buildable at all.

---

## 7. What Remains Open

**Newly actionable, cheap, and worth doing before the next trial:**
- Add `test:coverage` to `ui-library`'s, `design-tokens`'s, and the root `package.json` (H1), and the missing `coverage` block to `ui-library`'s `vitest.config.ts` (H2) — both are the kind of one-line-per-file fix round 2's own generator fixes were.
- Decide `AppHeader`'s notification trigger's ARIA pattern deliberately (M2) — drop `aria-haspopup` or make the panel a real menu — and record which, the same way the Escape/click-outside decision already is.
- Reconcile 00's "Folder ownership" section with 01's already-correct generalisation (M4/round-2 M2) — this is now the second round this exact one-word fix has been flagged.
- Either bring the `lint` script back in line with 20's spec or update 20 to state the `turbo lint` delegation as the current decision (M1) — whichever it is, the corpus and the repo should agree.

**Carried from round 2, still true:**
- Ask which BRD version governs (C1/M8) — one question, still unasked two rounds later.
- The `pqms-portal/`-prefix sweep (M3) — genuinely mechanical, and now slightly larger than when first found.
- 07's two stray sentences (L1, L2) — cosmetic, and now three review rounds old.

**Blocked on the client, unchanged**: Kia's SSO/gateway question, `ASM`'s meaning, the 2-vs-4-tier capability model, `CE`/`DM`, `DTC`'s expansion — all still tracked in 18, all still open, none newly informed by this round's evidence since neither trial component touches auth or the capability model.

---

## 8. Recommended Next Step

**One small batch, then the next real trial.**

1. **Fix H1/H2/M1/M4 as one batch** — all four are single-file, low-risk, and two of them (H1, H2) are the first concrete evidence this corpus has produced that its own review checklist (16) needs a line item for "does every package's `package.json` still match 20's script table," not just "does the code pass the tests it has."
2. **Decide M2 deliberately** and log it in 18 next to the dropdown-keyboard-contract entry it is a specific instance of — this is the cheapest possible next data point on whether that open item is closing correctly as more components exercise it.
3. **Then build the third component**, and make it a real test of what this round's silences predict: something with either a genuine keyboard contract (bringing 06's headless-primitive exception into contact with real code for the first time) or a first real service/query (bringing 04/05's fixtures-mode architecture into contact with real code for the first time). Both `BaseButton` and `AppHeader` were presentational; the corpus's authentication, data-fetching, and headless-primitive sections — a large fraction of its total bulk — remain as untested against real code after this round as they were after round 1.

---

*Round 3. Fresh-context close-read of all 21 tier files, `TEMPLATE.md`, and the generator script, plus first-ever review of real code: `BaseButton` and `AppHeader`, their test suites, and a live run of `docs:standards:check`, `typecheck`, `lint`, `test:coverage`, and `build`. Six of round 2's findings independently re-verified as fixed by direct re-inspection, not by trusting round 2's report of itself. Every finding carries a file, a line where applicable, and either a quoted passage or a live command's actual output.*

---

## Post-review update — 2026-08-21

**This is a post-hoc status note, not a revision of the review above.** The findings in §2 and the ratings in §6 are left exactly as originally written, including the ones this note reports as fixed — they are a record of what round 3 found, not a live document. H1, H2, M1, and M2 were fixed and independently re-verified — both by the reviewing session and by re-running the toolchain — before this document was committed:

- **H1**: `test:coverage` scripts added to `packages/ui-library`, `packages/design-tokens`, and the root `package.json`, plus the `turbo.json` task entry and the `@vitest/coverage-v8` devDependency where needed.
- **H2**: a `coverage` block matching `apps/portal`'s pattern (provider, reporter, exclude list, commented thresholds) added to `packages/ui-library/vitest.config.ts`. `packages/design-tokens` deliberately does not get one yet — its `test:coverage` script exists so the root fan-out reaches it, but the `coverage` block itself is skipped with an inline comment explaining why (no source file to cover yet) and naming the trigger for adding it once `tokens.css` gains a real `.ts` export.
- **M1**: `turbo lint` kept as the root script — the better fit now that `build`/`test`/`typecheck` are all already `turbo *` — with tier 20's Commands Reference updated to state this as the current, deliberate decision (rather than the bare `eslint .` it previously specified), and the decision recorded in tier 18 next to the other lint-related entries.
- **M2**: `aria-haspopup="true"` dropped from `AppHeader`'s notification trigger; `aria-expanded`/`aria-controls` retained, which is sufficient for a disclosure region that isn't a real menu. Decision recorded in tier 18, next to the existing dropdown/popover keyboard-contract gap entry.

---

# AI Review: Frontend Development Standards & Coding Guidelines v1.0 — Round 4

**Documents Reviewed:** `BRD/NPQMS-ISM-customized-BRD.md` (C1.0, draft for
ratification, 2026-08-20, 2288 lines) — read in full for §0.6–0.8, §7
(Roles, Capabilities & Authorization, all four subsections), AR-06/DEC-07,
FR-SEC-010/011, §23 (Open Questions), Appendix A (Glossary), Appendix B.1
(role mapping) — plus the 13-file standards-corpus change implementing the
capability-model rework (`00`, `01`, `03`, `04`, `06`, `07`, `08`, `11`,
`14`, `16`, `17`, `18`, `20`), read in full, and the regenerated
`Frontend-Development-Standards-v1.0.md`.

**Review Date:** 2026-08-24
**Reviewer:** AI-assisted independent review (Claude), fourth round —
fresh-context close-read against the BRD source directly, no reliance on
workspace-b6's or the requester's own report of what changed.

**Review Scope:** The 13-file rework only, checked claim-by-claim against
the BRD text itself, plus a corpus-wide sweep for stale references the
rework should have caught. Not a re-review of the 8 untouched tier files
beyond that sweep, and not a review of code — none exists yet for this
model. Per this round's brief, governing-power/code-correctness/
test-suite/deployment-viability are not re-scored (nothing to test them
against); this round's four dimensions are internal consistency, citation
accuracy, cross-reference integrity, and design-decision soundness.

> **Round 4.** This appends to the round-3 review at this path rather than
> superseding it — round 3's findings and ratings (§1–§8 above) are a
> record of a different review, of different material (two trial
> components and a live toolchain run), and are left untouched.

---

## 1. Review Methodology

1. **BRD read directly**, not summarized: §0.6 (nine contradictions),
   §0.7 (defect repairs), §7.1–§7.4 in full (38-row authorization matrix
   read row by row), AR-06/DEC-07, FR-SEC-010/011, §23 (all twelve open
   questions), Appendix A (full glossary), Appendix B.1.
2. **Every quoted or paraphrased BRD citation in the 13 changed files
   checked against the BRD's actual text**, not against the standard's
   citation of itself — `git diff` used to isolate exactly what changed
   per file, then each changed claim traced to its BRD source line.
3. **A corpus-wide sweep** for `hasCapability`/`useCapability`/
   `ROLE_CAPABILITY_MAP`/`requireCapability`/`capabilityGuard` across all
   21 tier files, to catch anything the rework should have touched but
   didn't.
4. **`node scripts/build-standards-doc.mjs --check`**, run live.
5. **workspace-b6's own summary of its changes was not consulted before
   forming these findings** — the diffs and the BRD were the only inputs.

---

## 2. Executive Summary

This is a well-executed rework. Every substantive claim checked against
the BRD's actual text — the five-role model, the 38-row matrix's
individual cells, the FR-SEC-011 endpoint's quoted language, the AR-06
gateway resolution, the ASM compound-title resolution, the DTC definition,
the retired NFR-05/NFR-08 citations and their FR-ENT-005/NFR-U-001/
NFR-U-002 replacements — is accurate, and in most cases verbatim-accurate,
against the source. The corpus-wide sweep for stale `hasCapability`/
`useCapability`/`ROLE_CAPABILITY_MAP`/`requireCapability` usage found zero
live survivors outside deliberate, correctly-framed provenance notes
("renamed from...", "kus-pqms's `capabilityGuard`"). `docs:standards:check`
passes clean, 21 files in sync, the same three benign generator warnings
carried since round 2.

**The one real gap is a scoping one, not an accuracy one**: `08`'s
"Sharing tab" placeholder asks *which* §7.3 matrix row the call site
enforces, but doesn't surface a prior question the BRD itself raises —
whether a "Sharing" tab exists in this app's scope at all. BRD C1.0's
Workspace model (§1's proposed-solution list, §8.1's screen inventory) has
**five** sections — Detail, Investigation, Resolution, Communication,
History — with nothing named Sharing. The "sharing" tab this placeholder
assumes is carried from `17`'s description of the *old* `kus-pqms` app's
six-tab model, not from anything the BRD commits to.

**Findings: 4 total — 0 high, 1 medium, 3 low.** All four are new this
round; none is a re-statement of a round-3 finding, since round 3 reviewed
different material.

### Medium

| # | What | Where |
|---|---|---|
| **M1** | **`08`'s "Sharing tab" call-site placeholder asks the wrong first question.** The placeholder text — "*(map to the real §7.3 row once confirmed — likely "Post an external comment" or a share-specific row)*" — presumes a Sharing tab is in scope and only its matrix row is unconfirmed. But BRD C1.0 names no such row and no such screen: §1's proposed solution and §8.1's screen inventory both describe the Issue Workspace as five sections (Detail · Investigation · Resolution · Communication · History), with nothing named Sharing anywhere in the document (checked: no "Sharing" hit in §7, §8, or the glossary). The sixth "sharing" tab this placeholder inherits is `17`'s description of `kus-pqms`'s *prior, superseded* six-tab model (`17-domain-glossary-and-business-context.md`'s "Screens/Workflows" section, itself explicit that it is describing the old implementation, not a BRD commitment). The call site may not exist under C1.0 at all — it may have been folded into Communication (whose "Post an external comment" row is already ASM/PQM/ADMIN-gated, which is what the placeholder's own guess points at) or dropped from Phase-1 scope entirely. Either answer is fine, but the placeholder as written asks a narrower question than the real one, and a reader resolving it by picking a matrix row would silently paper over the scope question underneath it. | `08-authentication-and-authorization.md:261` vs BRD §1 (proposed solution), §8.1 (screen inventory) — no "Sharing" hit in either |

### Low

| # | What | Where |
|---|---|---|
| L1 | **The `~36-row` authorization matrix figure, cited identically in three places, undercounts the actual table by two rows.** `08`, `17` (twice) and `18` all say "~36-row" — but §7.3's table has **38** data rows, counted directly (`|`-delimited rows between the header and the section break), and the BRD's own §25.2 traceability table already states this exactly: "Expanded from 15 rows to **38**." The correct figure was available in the same document these files cite and wasn't used. Low because the "~" already signals approximation and nothing downstream depends on the exact count, but it's a one-line fix each place, and the source had the right number. | `08-authentication-and-authorization.md:190`, `17-domain-glossary-and-business-context.md:123,200`, `18-project-context-and-implementation-status.md:349` vs BRD §7.3 (38 data rows, lines 408–445) and §25.2 |
| L2 | **`04`'s "Required shape" for the auth store lists three top-level fields, but its own writer-discipline paragraph two sentences later only accounts for writing two of them.** "Required shape: `currentUser`, plus `role` and `permissions`" names three fields; the `setUser()` paragraph that follows says the action "derives `permissions`... and sets both `currentUser` and `permissions` in the same `set()` call" — `role`'s write path is never stated. `08` calls both "derived `role`/`permissions`" in its own cross-reference (`08:289`), which is consistent with treating `role` as computed rather than independently written, but `04` never says so itself. Carried, not introduced: the identical gap existed under the old `capability` naming and survives the word-for-word `capability`→`permissions` rename unresolved — this batch didn't create it, but it also didn't close it, and it sits inside the exact section this rework touched. | `04-state-management.md:63` vs `04-state-management.md:102-107` (cf. `08-authentication-and-authorization.md:289`) |
| L3 | **`00`'s stale "Pinia" reference survives a third round, inside a file this rework otherwise edited successfully.** "No Pinia/TanStack Query usage inside base components" (`00:113`) — Pinia is Vue-only, not in the confirmed stack, and `01`'s parallel "Package ownership" section already reads the corrected "no state-management library usage inside base components." Flagged at round 2 (M2) and round 3 (M4, "the second round this exact one-word fix has been flagged"). This batch edited `00` twice for the RBAC rule and source-precedence sections and left this specific, already-twice-flagged line untouched — now a third consecutive round carrying the same fix forward. | `00-core-rules.md:113` vs `01-project-structure-and-architecture.md:336` |

---

## 3. What Was Checked and Confirmed Correct (not re-listed as findings)

Recorded because a review that only lists defects understates how much
was actually verified:

- **Five-role model** (`SE`/`ASM`/`PQM`/`ADMIN`/`VIEWER`) — matches BRD
  §7.2 exactly, including each role's capability label and default data
  scope.
- **`hasPermission`/`usePermissions`/`requirePermission` API** — the
  rename from `hasCapability`/`useCapability`/`requireCapability` is
  complete; the corpus-wide sweep (Methodology #3) found zero live
  survivors, only deliberate provenance notes.
- **`issue-entry` call site** — `08`'s and `07`'s `"issue:create"` gate
  matches BRD §7.3's "Create issue: SE ✓, ASM ✓, PQM ✓, ADMIN ✓,
  VIEWER ✗" row exactly, on both sides of the file pair that has to agree
  (`08`'s spec, `07`'s route-tree instantiation).
- **`FR-SEC-011` quote** — "the current user's identity, roles and
  resolved permissions... the authoritative source for client-side
  gating" is an accurate, correctly-ellipsized composite of the
  requirement text and its own acceptance criterion.
- **`AR-06`/`DEC-07` gateway resolution** — the quoted fragment ("no
  separate gateway is needed to validate one token for one application")
  is attributed to AR-06 specifically, not DEC-07, and that attribution is
  correct — DEC-07 (identity-provider choice) is cited alongside it only
  as the decision AR-06's own rationale column names, not as the source of
  the quote.
- **ASM naming** — "After-Sales Manager / Service Engineer Manager" and
  the contradiction-X-2/Appendix-B.1 framing match the BRD exactly.
- **DTC** — "Diagnostic Trouble Code," matches Appendix A exactly.
- **CE/DM still open** — independently re-checked against the full
  glossary and Appendix B.1 directly (not taken on `17`'s or `18`'s word):
  neither term appears anywhere in BRD C1.0. Both files' "still open"
  marking is accurate.
- **FR-ENT-005 / NFR-U-001 / NFR-U-002 replacements for the retired
  NFR-05/NFR-08 citations** (`00`, `06`, `11`) — all three quoted passages
  match the BRD verbatim.
- **`[PLACEHOLDER]`s for the `ResolvedPermissions` shape** (`08:238-248`)
  and **the fixtures-mode default-role question** (`08:622-641`) — both
  carry a named trigger and an owner, per this corpus's own placeholder
  discipline (18-project-context-and-implementation-status.md's rule);
  neither is an orphaned obligation.
- **"Option A" (frontend consumes resolved permissions rather than
  reimplementing the matrix) is soundly reasoned.** It follows directly
  from §7.2's own text ("the matrix is authoritative, the capability
  ordering is not") and FR-SEC-011's existence, correctly avoids
  re-encoding a 38-row matrix client-side, and honestly defers the exact
  response shape as a placeholder rather than inventing one.
- **`docs:standards:check`** passes clean — 21 files, in sync, three
  residual generator warnings (unchanged, benign, same as round 3's L3).

---

## 4. Rating

Only the dimensions this round's evidence bears on are scored; the rest
carry round 3's score forward unchanged (no new evidence either way this
round, since this is a docs-only change with no code to test).

| Dimension | Score | Basis |
|---|---|---|
| **Internal consistency & cross-reference integrity** (this rework only) | **8/10** | Every checked cross-file claim (04↔08, 07↔08, 00↔08↔11↔17↔18's BRD citations) agrees; the corpus-wide stale-reference sweep found nothing live. Held below 9 by M1 (the Sharing-tab scope gap) and L2 (04's unstated `role` write path). |
| **Sourcing discipline / citation accuracy** | **9/10** | Every quoted or paraphrased BRD passage checked verbatim-matches its source, across five files and roughly a dozen distinct citations. Not 10 because of L1's undercounted row figure, repeated identically in three places rather than caught once and propagated correctly. |
| **Decision closure** | **9/10** | "Option A" is the right call, correctly derived from the BRD's own text, and both live placeholders (`ResolvedPermissions` shape, fixtures default role) are closed the way this corpus's own discipline requires — named trigger, named owner. |
| **Completeness against stated scope** | **7/10** | The rework covers what it says it covers accurately. M1 is the one place scope itself — not just accuracy — was under-examined: a call site was renamed and re-gated without first confirming the screen behind it still exists under the new model. |

*(All other dimensions — governing power, code correctness, test-suite
correctness, deployment viability — are carried forward from round 3
unscored this round, per this round's own brief: no code exists yet for
this model to test them against.)*

**Not a step down from round 3.** Round 3 scored a different corpus
slice (two presentational trial components and a live toolchain) at
7.5/10 overall; this round scores a docs-only capability-model rework on
the four dimensions that apply to it, and finds it materially accurate
with one real scope gap and three low-severity carries/misses.

---

## 5. What Remains Open

**Newly actionable from this round:**
- Resolve M1 by checking with the BRD/client whether a Sharing tab/feature
  is in scope for the new Issue Workspace at all, before resolving which
  §7.3 row it maps to — the row question is downstream of the scope
  question, not a substitute for it.
- L1: correct "~36-row" to "~38-row" (or the exact "38") in `08`, `17`
  (twice), and `18`.
- L3: the `00` "Pinia" fix — third round flagged, still a one-word change.

**Worth a look, not urgent:**
- L2: state explicitly in `04` whether `role` is a derived selector or a
  third field `setUser()` writes alongside `permissions`.

**Carried from round 3, untouched by this rework (out of this round's
scope, not re-verified):** the `pqms-portal/`-prefix sweep, 07's two
stray sentences, H1/H2/M1/M2 (already fixed per round 3's post-review
note) — none of these intersect the 13 files this round reviewed.

---

## 6. Recommended Next Step

**Answer M1 first, then close the small batch.** M1 is cheap to answer
(one question to the client/BRD owner: is Sharing in scope?) and its
answer determines whether `08`'s placeholder should be rewritten,
redirected at Communication's existing external-comment gate, or removed
as dead scope — doing L1/L3/L2 first and M1 last risks documenting a
matrix-row answer for a tab that may not exist. Once M1 is answered, the
three lows are each a single-line fix.

---

*Round 4. Independent review of the 13-file capability-model rework
against BRD/NPQMS-ISM-customized-BRD.md read directly, not against
workspace-b6's or any other session's report of its own changes. Every
finding and every "confirmed correct" item in §3 carries a file/line on
one side and a BRD section/line on the other.*
