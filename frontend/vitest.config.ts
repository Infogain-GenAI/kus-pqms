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
        'apps/portal/src/features/issues/IssueListScreen.tsx',
        'apps/portal/src/features/issues/IssueWorkspaceScreen.tsx',
        'apps/portal/src/features/issues/CreateIssueScreen.tsx',
        'packages/ui-library/src/**',
      ],
      reporter: ['text-summary', 'json-summary'],
      reportsDirectory: './.coverage',
    },
  },
})
