import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Vitest per 10-testing-standards.md.
//
// ⚠️ VITEST 2, NOT 4 — AND THAT IS FORCED. Vitest 4 requires Vite 6+; this
// project is pinned to Vite 5.4, so Vitest 2 is the newest major that runs here.
// This is the first MEASURED consequence of 00-core-rules.md's divergence table:
// the Vite version does not merely differ from the corpus, it bounds which
// test-framework major can be adopted. See 18's record.
//
// ---------------------------------------------------------------------------
// THE COVERAGE DENOMINATOR IS DATA-LAYER ONLY. READ THIS BEFORE WIDENING IT.
//
// `include` below covers apps/portal/src/data/** and NOTHING ELSE — 8 files:
// assertSeed, modelCodes, priorityMatrix, roles, seed, store, types, util.
//
// DELIBERATELY OUTSIDE the measurement, and therefore outside the reported
// percentage:
//   - apps/portal/src/{app,features}/**   11 screen and shell components
//   - packages/ui-library/src/**          30 components
//   - packages/design-tokens/src/**       generated + byte-copied
//
// So the reported figure is a DATA-LAYER number, not a project number. At the
// time the floors were set it was 76.83% statements over 531 statements; the same
// suite measured across the whole app would be a small fraction of that, because
// 41 untested component files would enter the denominator.
//
// **Widening this glob will drop the percentage below the floor and fail the
// gate.** That failure is expected and is not the fault of whoever widens it:
// re-measure and re-seed .coverage-floors.json in the same change, exactly as a
// deliberate ceiling raise is handled for the adherence gates.
//
// The scope is data/** because that is where the invariants live that
// steps-for-new-repo.md Step 10 says must survive any rewrite — reciprocal links,
// propose->approve, the priority matrix. Component coverage is a later slice.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./apps/portal/src', import.meta.url)),
      // The workspace packages are not dependencies of the ROOT, so vitest cannot
      // resolve them by specifier from tests/. Aliased to their source entries —
      // the same entries apps/portal resolves via pnpm's symlink.
      // ⚠️ THE SUBPATH MUST COME FIRST. These aliases map a specifier to a FILE,
      // and an alias to a file cannot have children — so with only the bare
      // '@pqms/ui-library' entry below, '@pqms/ui-library/markdown-editor'
      // resolves to '…/index.ts/markdown-editor' and fails to load. Vite matches
      // in declaration order, so the more specific entry has to be listed above
      // the general one. `apps/portal/vite.config.ts` records the same trap for
      // the app build, where it produced an ENOENT on a design-token subpath.
      '@pqms/ui-library/markdown-editor': fileURLToPath(new URL('./packages/ui-library/src/markdown-editor.ts', import.meta.url)),
      '@pqms/ui-library': fileURLToPath(new URL('./packages/ui-library/src/index.ts', import.meta.url)),
      '@pqms/design-tokens': fileURLToPath(new URL('./packages/design-tokens/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    globals: true,
    /*
     * ─── THE OUTER BUDGET, AND WHY IT MUST EXCEED THE INNER ONE ──────────────
     *
     * `tests/support/setup.ts` raises Testing Library's `asyncUtilTimeout` to
     * 5000ms for the lazily-loaded route tree. It left THIS number at vitest's
     * default — which is also 5000ms — and two equal budgets is the defect:
     *
     *   `asyncUtilTimeout` is the ceiling for ONE `waitFor`.
     *   `testTimeout` is the ceiling for the WHOLE test.
     *
     * When they are equal, a test can never actually spend its inner budget. A
     * render plus two dynamic-import compilations plus a click plus a `find*`
     * each cost part of the total, so the test dies on the OUTER limit while no
     * single `waitFor` came near its own. The error then names `testTimeout` and
     * points nowhere near the cause, which is why this was read as flakiness for
     * a while rather than as a misconfiguration.
     *
     * OBSERVED: `correlations.test.tsx > no longer says 'No classification-
     * matched candidates.' for BD-260006` failed 2 runs in 6 with "Test timed
     * out in 5000ms". It mounts the real route tree at an Issue Detail URL, where
     * `DetailSection` is `lazy()` and itself lazy-loads `IssueEditForm` — two
     * compilations in jsdom before the target button exists.
     *
     * 20000ms is chosen to clear the sum of the waits a single test may
     * legitimately perform, not just one of them. Like `waitFor`, it is a ceiling
     * a passing test never spends: it changes only how long a genuinely stuck
     * test takes to report. It weakens no assertion.
     *
     * THE INVARIANT TO KEEP: testTimeout must stay comfortably ABOVE
     * asyncUtilTimeout. Raising the inner one to meet this again reintroduces
     * exactly this bug. If cold load keeps growing, split the route's module
     * graph — the lever setup.ts already names — rather than raising either.
     */
    testTimeout: 20000,
    // Raises Testing Library's `waitFor` budget above the default 1s. The route
    // tree is lazily loaded end to end, and 1s measures machine load rather than
    // the app once ten checks run concurrently — see the file for the numbers.
    setupFiles: ['./tests/support/setup.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'apps/portal/src/data/**',
        // Widened 2026-08-30 for the shared format/logging/debounce utilities.
        // The vitest note above warns this drops the percentage and fails the
        // gate — it did not here, because these modules land with tests and
        // measure higher than the existing average. Floors re-seeded regardless.
        'apps/portal/src/shared/**',
        // The Issue List extraction (2026-08-31): its screen, every supporting
        // module under issue-list/, and the reusable common/ components it and a
        // future QIR screen share. Same named-exception pattern as the two lines
        // below — re-seeded in the same change per this file's own instruction.
        'apps/portal/src/features/issues/issue-list/**',
        'apps/portal/src/features/common/**',
        /*
         * Widened 2026-08-31 for the Zustand + TanStack Query layer.
         *
         * ⚠️ WIDENING `include` NORMALLY DROPS THE PERCENTAGE AND FAILS THE GATE
         * — that is the warning above, and it is why each addition is named
         * rather than globbed loosely. These three land at 100% function
         * coverage with their own tests (`tests/stores/`, `tests/queries/`), so
         * they raise the ratio rather than lower it. Floors re-seeded regardless.
         *
         * They are included deliberately rather than left out: the auth store
         * carries `switchRole()`'s production fuse, which 04 calls a security
         * control — leaving it outside the gate would mean nothing notices if a
         * later change stops testing it.
         */
        'apps/portal/src/stores/**',
        'apps/portal/src/features/issues/issues.queries.ts',
        'apps/portal/src/features/notifications/notifications.queries.ts',
        'apps/portal/src/features/issues/issueDetail.queries.ts',
        // NOT 'apps/portal/src/features/issues/IssueListScreen.tsx' — the Issue
        // List extraction above moved that file to issue-list/IssueListScreen.tsx.
        // The old path no longer exists; issue-list/** already covers the new one.
        /*
         * The History feed's pure logic and its date filter, ported from Vue.
         * Both land with their own tests (`history.test.ts`,
         * `historyDateFilter.test.ts`), so they raise the ratio.
         */
        'apps/portal/src/features/issues/workspace/history/**',
        /*
         * ⚠️ WIDENED WITHOUT A FLOOR CHANGE, WHICH IS THE ONLY REASON IT IS HERE.
         *
         * `HistoryModals.tsx` was invisible to the gate: two runs nine tests
         * apart reported byte-identical covered counts, which is how the gap was
         * found. Measured before widening, the directory landed at functions
         * 84.62% against an 85.22% floor -- and 7 of its 9 uncovered functions
         * were in `DtcChipInput.tsx`, a 269-line component with no tests at all.
         *
         * That file was covered FIRST, as ordinary work, so this glob lands with
         * every floor intact. Two different situations were deliberately not
         * conflated: HistoryModals at 100%/100% is code we tested before the gate
         * could see it, so widening merely lets it count; DtcChipInput at 12.5%
         * functions was simply untested, and no argument about globs covers that.
         */
        'apps/portal/src/features/issues/issue-entry/**',
        'apps/portal/src/features/issues/IssueWorkspaceScreen.tsx',
        'apps/portal/src/features/issues/CreateIssueScreen.tsx',
        'packages/ui-library/src/**',
      ],
      reporter: ['text-summary', 'json-summary'],
      reportsDirectory: './.coverage',
    },
  },
})
