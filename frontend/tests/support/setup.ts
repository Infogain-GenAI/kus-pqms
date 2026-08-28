import { configure } from '@testing-library/dom'

/**
 * Global test-environment configuration.
 *
 * ─── WHY THE ASYNC BUDGET IS RAISED ──────────────────────────────────────────
 *
 * Testing Library's default `waitFor` budget is 1000ms. Two test files here —
 * `IssueWorkspaceScreen.test.tsx` and `routes.test.tsx` — mount the REAL route
 * tree from `apps/portal/src/routes.tsx`, which is lazily loaded end to end: the
 * layout, the workspace shell and each section are separate dynamic imports, and
 * jsdom pays for compiling every one of them before first paint.
 *
 * That is comfortably under a second in isolation. It is NOT under a second when
 * `scripts/run-checks.mjs` runs ten checks concurrently — which is how the
 * pre-push hook runs them, and therefore how they run in the case that matters.
 * The first cold-load test measured 1121ms under that load and failed, while the
 * same test passed in isolation on the same commit.
 *
 * SO THE OLD BUDGET WAS MEASURING MACHINE LOAD, NOT THE APPLICATION. A test that
 * passes alone and fails in the suite teaches people to re-run the suite until it
 * goes green, which is how a real failure gets waved through later.
 *
 * 5000ms is chosen to sit well clear of the loaded number rather than just above
 * it. This does NOT slow the suite down: `waitFor` polls and resolves as soon as
 * its condition holds, so the budget is a ceiling that a passing test never
 * spends. It only changes how long a genuinely failing assertion takes to report.
 *
 * WHAT THIS DOES NOT DO: it weakens no assertion. Every `waitFor` still asserts
 * exactly what it asserted before, and a condition that never becomes true still
 * fails. The only thing that changed is how long the harness is willing to wait
 * for a lazily-loaded route tree on a busy machine.
 *
 * IF COLD LOAD KEEPS GROWING, this is the wrong lever to pull twice. The next
 * response is to split the route's own module graph — which is what was done
 * first here (the Issue Detail edit form and the source-channel editor are both
 * `lazy()` for exactly this reason) — not to raise this number again.
 */
configure({ asyncUtilTimeout: 5000 })
