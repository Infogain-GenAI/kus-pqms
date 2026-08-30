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
 * ─── ⚠️ NAMED `isFixtureMode()`, NEVER `useFixtures()` ─────────────────────
 *
 * Renamed 2026-08-31. 05 is explicit and gives the mechanical reason: "It is not
 * a hook — it reads `import.meta.env` and returns a boolean. A `use*`-named
 * non-hook called conditionally, inside a callback, or inside a query-options
 * object trips `rules-of-hooks` under the lint preset 14 mandates."
 *
 * That stopped being hypothetical the moment TanStack Query landed: the
 * notifications query takes `enabled: !isFixtureMode()` — a call inside a
 * query-options object, which is exactly the shape 05 names.
 *
 * 05 also cites the old name as the thing not to do: "Provenance: `kus-pqms`
 * named it `useFixtures()` and implemented it as `!== "false"`."
 *
 * ─── THE POLARITY IS A RECORDED DIVERGENCE, NOT AN OVERSIGHT ────────────────
 *
 * 05 specifies `=== "true"` — fail closed, so an unset variable means REAL mode.
 * This file keeps `!== 'false'`, so an unset variable means FIXTURES. For the
 * two explicit values the two are IDENTICAL; they differ only when the variable
 * is absent or misspelled.
 *
 * 05's reason for failing closed is that the same flag gates an AUTH BYPASS:
 * "an auth bypass must never be what you get by forgetting to set a variable."
 * That reasoning is sound and this app does not yet meet its premise — there is
 * no MSAL, no Entra tenant, and the flag gates data only. Flipping it today
 * would make a fresh clone with no `.env` render nothing, protecting no auth
 * bypass because none exists.
 *
 * ⚠️ REVISIT WHEN AUTH LANDS. 05's own trigger is the flag gating authentication;
 * on that day this must become `=== 'true'` and `.env.example`, every developer
 * `.env` and CI must set it explicitly. Decision: Prisilla Ghadi, 2026-08-31.
 *
 * DELIBERATELY A FUNCTION, NOT AN EXPORTED CONSTANT. `import.meta.env` must be
 * read per call: a constant freezes the value at import time, which quietly
 * ignores `vi.stubEnv` in tests and makes a live-branch test pass for the wrong
 * reason. The Vue file records exactly this, and the hazard is identical here.
 *
 * ─── WHAT THIS FLAG SWITCHES, AS OF 2026-08-30 ───────────────────────────────
 *
 * It now switches something real. `services/index.ts` reads `isFixtureMode()` per
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

export function isFixtureMode(): boolean {
  return import.meta.env.VITE_USE_FIXTURES !== 'false'
}

/** Base URL for the real API. Only meaningful once `isFixtureMode()` is false. */
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
  return isFixtureMode() ? 'fixtures' : 'api'
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
  if (warned || isFixtureMode()) return
  warned = true
  console.warn(
    '[data-source] VITE_USE_FIXTURES=false selects the live branch in services/index.ts. ' +
      'Note that no screen consumes the service layer yet — every screen still reads data/store.tsx — ' +
      `and no backend is known to exist for this app. VITE_API_BASE_URL is ${apiBaseUrl()}.`,
  )
}
