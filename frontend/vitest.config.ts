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
      '@pqms/ui-library': fileURLToPath(new URL('./packages/ui-library/src/index.ts', import.meta.url)),
      '@pqms/design-tokens': fileURLToPath(new URL('./packages/design-tokens/src/index.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    globals: true,
    coverage: {
      provider: 'v8',
      include: [
        'apps/portal/src/data/**',
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
