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
 * ─── WHAT THIS FLAG SWITCHES, AS OF 2026-08-30 ───────────────────────────────
 *
 * It now switches something real. `services/index.ts` reads `useFixtures()` per
 * call and dispatches to either `api/*` (fixture-backed, over `data/seed.ts`) or
 * `services/*.service.ts` (HTTP, over `shared/http`).
 *
 * THIS FILE PREVIOUSLY SAID THE FLAG SWITCHED NOTHING, and warned loudly when it
 * was set to `false`. That was accurate then and is not now — the warning is
 * replaced by the narrower, still-true one below.
 *
 * ⚠️ WHAT IS STILL NOT TRUE: no screen reads the service layer yet. Every screen
 * still reads `data/store.tsx`, so setting `VITE_USE_FIXTURES=false` changes
 * what the SERVICE layer does and changes nothing a user sees. And no backend
 * exists for this app, so the live branch will fail against a real network. Both
 * facts are stated by `dataSourceMode()` rather than left for someone to
 * discover — a flag that overstates its own effect is worse than no flag.
 */

export function useFixtures(): boolean {
  return import.meta.env.VITE_USE_FIXTURES !== 'false'
}

/** Base URL for the real API. Only meaningful once `useFixtures()` is false. */
export function apiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
}

export type DataSourceMode = 'fixtures' | 'api'

/**
 * Which implementation `services/index.ts` will dispatch to.
 *
 * Now a straight reflection of the flag, because the two branches both exist.
 * The previous third value — `api-requested-but-unavailable` — described an app
 * with no API layer at all and no longer has a meaning.
 */
export function dataSourceMode(): DataSourceMode {
  return useFixtures() ? 'fixtures' : 'api'
}

let warned = false

/**
 * Warns — once — when the live branch is selected, because two things about it
 * are still surprising: no screen consumes the service layer, and no backend is
 * running behind it.
 *
 * Called at store construction. Kept as a warning rather than a throw: someone
 * deliberately testing the live branch against a local mock server should be
 * able to, and telling them what is and is not wired is more useful than
 * refusing to start.
 */
export function reportDataSource(): void {
  if (warned || useFixtures()) return
  warned = true
  console.warn(
    '[data-source] VITE_USE_FIXTURES=false selects the live branch in services/index.ts. ' +
      'Note that no screen consumes the service layer yet — every screen still reads data/store.tsx — ' +
      `and no backend is known to exist for this app. VITE_API_BASE_URL is ${apiBaseUrl()}.`,
  )
}
