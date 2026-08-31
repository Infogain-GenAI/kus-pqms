import { QueryClient } from '@tanstack/react-query'

/**
 * THE APP'S ONE QUERY CLIENT.
 *
 * ⚠️ CREATED HERE, NOT INSIDE A COMPONENT. A `new QueryClient()` written in a
 * component body is reconstructed on every render, which throws the whole cache
 * away each time and turns every query into a fresh fetch — a refetch storm with
 * no error and no obvious cause. Module scope makes that impossible.
 *
 * Tests build their OWN client per test (see `tests/support/`) rather than
 * importing this one: a shared cache across tests leaks one test's data into the
 * next, and the leak shows up as an unrelated test failing later.
 *
 * ─── THE DEFAULTS, AND WHY EACH IS SET ───────────────────────────────────────
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /*
       * Retry once, not TanStack's default three. Three retries with exponential
       * backoff means a genuinely-down backend takes several seconds to surface
       * an error, during which the screen shows a spinner and the user has no
       * information. `apiClient` already normalises the failure into an
       * `ApiError`; one retry covers a dropped connection without hiding an
       * outage.
       */
      retry: 1,

      /*
       * Do not refetch on window focus by default. This is NOT the same setting
       * as the notifications poll's `refetchIntervalInBackground` — that one
       * governs whether an ALREADY-RUNNING interval keeps firing in a background
       * tab, and 05 requires it to stay at its `false` default. This one governs
       * whether merely returning to the tab triggers a fetch on every query in
       * the app. Issue lists and issue details do not change per tab-switch, so
       * leaving this on would fetch on every alt-tab for no benefit.
       *
       * ⚠️ The notifications query sets `refetchInterval` explicitly and is
       * unaffected by this line — it polls on its own cadence regardless.
       */
      refetchOnWindowFocus: false,
    },
  },
})
