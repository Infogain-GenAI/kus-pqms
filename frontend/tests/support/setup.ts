/*
 * ─── THE SUITE RUNS IN America/New_York, DELIBERATELY ────────────────────────
 *
 * Not the machine's zone. The product's user base is Kia US, and this project is
 * developed in Asia/Calcutta — which is EAST of UTC, where the date-only parsing
 * bug in `shared/format/date.ts` rounds the harmless way and is invisible.
 *
 * `new Date("2026-06-16")` parses as UTC midnight per spec, so read back with
 * local getters it is the 15th in New York and the 16th in Calcutta. Every date
 * in the app was rendering a day early for every real user, and no test on this
 * machine could have caught it while the suite inherited the local zone.
 *
 * Pinning it here means the date tests assert the behaviour USERS get, and any
 * future date handling is checked against a west-of-UTC zone by default.
 */
process.env.TZ = 'America/New_York'

import { configure } from '@testing-library/dom'

/**
 * Global test-environment configuration.
 *
 * ─── WHY THE ASYNC BUDGET IS RAISED ──────────────────────────────────────────
 *
 * Testing Library's default `waitFor` budget is 1000ms. Every test file that
 * calls `renderAt(routes, …)` mounts the REAL route tree from
 * `apps/portal/src/routes.tsx`, which is lazily loaded end to end: the layout,
 * the workspace shell and each section are separate dynamic imports, and jsdom
 * pays for compiling every one of them before first paint.
 *
 * ⚠️ NOT ENUMERATED ON PURPOSE. This paragraph used to name two such files. By
 * the time anyone checked there were six, and the list read as an exhaustive
 * one — so it understated the blast radius of this setting while looking
 * authoritative. `grep -rl "renderAt(routes"` answers it correctly at any time;
 * a count written here is only ever correct on the day it was written.
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

/**
 * ─── ProseMirror / TipTap needs two Range measurements jsdom does not implement ──
 *
 * `Range.prototype.getClientRects` and `getBoundingClientRect` are part of the
 * CSSOM View spec and jsdom ships neither — it has no layout engine, so there
 * are no boxes to measure. ProseMirror calls them on every selection change to
 * decide where the caret and decorations sit, and throws
 * `target.getClientRects is not a function` before any assertion runs.
 *
 * WHAT THE STUB COSTS, said plainly so the limit is visible: every rect is
 * zero-sized at the origin, so anything that depends on real GEOMETRY is not
 * exercised — caret coordinates, cursor-position-from-point, decoration
 * placement. That is acceptable because nothing in this suite asserts on
 * geometry; the editor tests assert on the DOCUMENT ProseMirror produces
 * (`<strong>`, `<ol>`, `<li>`), which is computed from the schema and the
 * transaction, not from layout.
 *
 * THE MOMENT A TEST ASSERTS ON A POSITION OR SIZE, this stub is hiding the
 * answer rather than enabling the test, and the fix then is a real layout
 * environment (a browser runner), not a richer fake.
 *
 * Global rather than per-file: any test that mounts the editor needs it, and a
 * per-file copy is one someone forgets on the next one.
 */
if (typeof Range !== 'undefined' && !Range.prototype.getClientRects) {
  const emptyRect = () =>
    ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect

  Range.prototype.getClientRects = function getClientRects() {
    const list = [emptyRect()] as unknown as DOMRectList
    return Object.assign(list, { item: (i: number) => list[i] ?? null }) as DOMRectList
  }
  Range.prototype.getBoundingClientRect = emptyRect
}

/**
 * ─── PER-TEST STORAGE ISOLATION ──────────────────────────────────────────────
 *
 * The Issue List persists its view — search, filters, sort, page, page size,
 * columns — to sessionStorage for the tab's lifetime (`@/data/issueListView`).
 * A vitest environment is ONE jsdom per test FILE, not per test, so that storage
 * survives from one test to the next and a test that filters or paginates hands
 * its state to whatever runs after it.
 *
 * That is not theoretical: adding persistence turned four passing pagination
 * tests red at once, because each was landing on page 2 left behind by its
 * predecessor rather than on the page 1 it asserted about.
 *
 * Clearing here rather than in the one test file that noticed: any screen may
 * persist state later, and a per-file copy is the one someone forgets. Tests
 * that WANT to exercise restoration seed storage themselves inside the test,
 * which runs after this.
 */
beforeEach(() => {
  try {
    sessionStorage.clear()
  } catch {
    /* storage unavailable in this environment; nothing to isolate */
  }
})
