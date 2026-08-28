/**
 * The one place `VITE_USE_FIXTURES` is read.
 *
 * Ported from the Vue app's `config/data-source.ts`, contract unchanged so the
 * same `.env` behaves the same way in both repositories.
 *
 * FIXTURES ARE THE DEFAULT. Only the exact string `"false"` opts into the real
 * API. A missing, misspelled or empty value therefore falls back to the safe
 * path rather than firing HTTP at a backend that may not be running — which is
 * the failure mode worth designing against, since the value arrives from an
 * untracked `.env` that differs per machine.
 *
 * DELIBERATELY A FUNCTION, NOT AN EXPORTED CONSTANT. `import.meta.env` must be
 * read per call: a constant freezes the value at import time, which quietly
 * ignores `vi.stubEnv` in tests and makes a live-branch test pass for the wrong
 * reason. The Vue file records exactly this, and the hazard is identical here.
 *
 * ─── WHAT THIS FLAG ACTUALLY SWITCHES TODAY: NOTHING, YET ───────────────────
 *
 * This app has no API layer. `data/store.tsx` is an in-memory store over
 * `data/seed.ts`, and there is no HTTP client, no service layer and no endpoint
 * for `false` to switch to — see 18's implementation status, which records the
 * backend as not yet built.
 *
 * So the flag is wired but not yet load-bearing, and `dataSourceMode()` exists
 * to keep that honest. Setting `VITE_USE_FIXTURES=false` logs a warning once at
 * startup and continues on fixtures, because the alternative — accepting the
 * setting silently — would let someone conclude they were exercising a real API
 * while looking at seed data. A flag that lies about its own effect is worse
 * than no flag.
 *
 * WHEN THE API LANDS: add the live branch at each call site, the way Vue does
 * (`useFixtures() ? fetchIssueById(id) : issueService.getById(id)`), and delete
 * the warning below. This module centralises the READING, not the DECISION —
 * each consumer still branches locally, so which parts have migrated stays
 * visible and each cutover is revertible on its own.
 */

export function useFixtures(): boolean {
  return import.meta.env.VITE_USE_FIXTURES !== 'false'
}

/** Base URL for the real API. Only meaningful once `useFixtures()` is false. */
export function apiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
}

export type DataSourceMode = 'fixtures' | 'api-requested-but-unavailable'

/**
 * What the app is actually reading from, as opposed to what was asked for.
 * The two differ while no API layer exists, and naming that difference is the
 * whole point of this function.
 */
export function dataSourceMode(): DataSourceMode {
  return useFixtures() ? 'fixtures' : 'api-requested-but-unavailable'
}

let warned = false

/**
 * Called once at store construction. Warns — loudly, and only once — when the
 * env asks for the real API, because there is nothing behind it yet.
 */
export function reportDataSource(): void {
  if (warned || useFixtures()) return
  warned = true
  console.warn(
    '[data-source] VITE_USE_FIXTURES=false requests the real API, but this app has no API layer yet ' +
      `(no HTTP client, no services; see 18). Serving fixture data from data/seed.ts instead. ` +
      `VITE_API_BASE_URL is ${import.meta.env.VITE_API_BASE_URL ?? '(unset)'}.`,
  )
}
