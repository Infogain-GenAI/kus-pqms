import { render, waitFor } from '@testing-library/react'
import { expect } from 'vitest'
import { RouterProvider, createMemoryRouter, type RouteObject } from 'react-router'
import type { RoleKey } from '@/data/types'
import { RoleProvider } from '@/data/roles'
import { _syncCurrentRole } from '@/data/capabilities'
import { StoreProvider } from '@/data/store'

/**
 * Test harness for the DATA router. Importing this module applies one
 * environment shim (below) as a side effect, then gives you `renderAt`.
 *
 * ─── THE SHIM, AND WHY IT IS NEEDED ───────────────────────────────────────────
 * `createMemoryRouter` cannot initialise under this project's test environment
 * without it. The failure is a genuine two-implementation clash, not a bug in
 * either library:
 *
 *   · jsdom 30 provides its OWN `AbortController` / `AbortSignal`
 *     (verified: `AbortController === window.AbortController` is true, and
 *     `String(AbortSignal)` reads `class AbortSignal extends
 *     globalObject.EventTarget`).
 *   · jsdom does NOT provide `Request`, so `Request` is Node's undici one
 *     (`class _Request`).
 *   · @remix-run/router's `createClientSideRequest` builds
 *     `new Request(url, { signal })` using a jsdom controller's signal, and
 *     undici brand-checks that signal against ITS realm's `AbortSignal`.
 *
 * The result, reproduced directly:
 *   TypeError: RequestInit: Expected signal ("AbortSignal {}") to be an
 *   instance of AbortSignal.
 *
 * It fires from `Object.initialize` → `startNavigation`, i.e. at router
 * construction, so it takes down every test in the file rather than one
 * assertion.
 *
 * WHAT THE SHIM DOES, STATED PLAINLY SO ITS COST IS VISIBLE: it drops `signal`
 * from `RequestInit`. So `request.signal` inside a loader is not wired to the
 * router's cancellation controller under test.
 *
 * WHY THAT IS ACCEPTABLE HERE, AND WHEN IT WOULD STOP BEING: nothing in this
 * project's route tree reads `request.signal`. Per
 * 07-routing-and-layouts.md's middleware/loader ownership rule, loaders exist
 * only for param validation and redirects — all server state is owned by
 * TanStack Query hooks called from components, never from a loader — so there is
 * no in-flight fetch for a loader to abort. THE MOMENT A LOADER HERE PASSES
 * `request.signal` TO ANYTHING, THIS SHIM IS HIDING REAL BEHAVIOUR and the fix
 * becomes a real polyfill (align both realms' AbortSignal) rather than this.
 *
 * It is deliberately scoped to this helper rather than added to
 * vitest.config.ts's `setupFiles`: only tests that build a data router need it,
 * and a global patch to `Request` would silently apply to every test file
 * including any future one that genuinely exercises fetch.
 *
 * ⚠️ THAT CONTAINMENT RELIES ON A VITEST DEFAULT, NOT ON ANYTHING DECLARED HERE.
 * `globalThis.Request` is patched as an import side effect, so within any file
 * that imports this helper the patch IS global. What stops it reaching other test
 * files is vitest's default `isolate: true`, which gives each file its own
 * environment — and vitest.config.ts sets only `environment: 'jsdom'`, so the
 * default is what is in force. **Setting `isolate: false`, switching to a shared
 * global environment, or otherwise pooling files would let this patch reach tests
 * that genuinely exercise fetch, silently.** If any of those change, this shim
 * must move behind an explicit per-file setup or become a real polyfill.
 */
const NativeRequest = globalThis.Request
if (NativeRequest && !(NativeRequest as unknown as { __pqmsSignalShim?: true }).__pqmsSignalShim) {
  class SignalTolerantRequest extends NativeRequest {
    static __pqmsSignalShim = true as const
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      if (init && 'signal' in init) {
        const { signal: _signal, ...rest } = init
        super(input, rest)
        return
      }
      super(input, init)
    }
  }
  globalThis.Request = SignalTolerantRequest as unknown as typeof Request
}

/**
 * Renders a real route tree at `url` through `RouterProvider`.
 *
 * The providers sit OUTSIDE `RouterProvider`, mirroring apps/portal/src/main.tsx
 * exactly. That is deliberate: if that nesting were wrong in the application it
 * should be wrong here too, rather than being papered over by a harness that
 * nests differently from the thing it is testing.
 *
 * Returns the router alongside the render result, because assertions about
 * redirects need `router.state.location`, which is not observable from the DOM.
 */
export function renderAt(
  routes: RouteObject[],
  url: string,
  { role = 'PQM' as RoleKey } = {},
) {
  /*
   * ⚠️ THE ROLE MUST BE ESTABLISHED BEFORE THE ROUTER IS CONSTRUCTED.
   *
   * `createMemoryRouter` initialises immediately and runs the initial match's
   * LOADERS — before `render()` below has mounted `RoleProvider`. A capability
   * loader (`@/app/capabilityGuard`) reads the module-level snapshot in
   * `@/data/capabilities`, so without this line it would see whatever the
   * previous test left behind and `role` here would silently not apply to any
   * loader, only to components.
   *
   * This mirrors the real app rather than working around it: there,
   * `createBrowserRouter` runs at module scope in `App.tsx`, so the snapshot's
   * module default is what the first navigation sees — and the app never passes
   * a non-default `initialRole`, so the two agree. See `capabilities.ts`.
   */
  _syncCurrentRole(role)

  const router = createMemoryRouter(routes, { initialEntries: [url] })
  const result = render(
    <RoleProvider initialRole={role}>
      <StoreProvider>
        <RouterProvider router={router} />
      </StoreProvider>
    </RoleProvider>,
  )
  return { ...result, router }
}

/** Whole-document text, for the coarse "did this screen render" assertions. */
export const bodyText = () => document.body.textContent ?? ''

/**
 * Wait for `needle` to appear in the rendered body, and say WHAT WENT WRONG when
 * it does not.
 *
 * ─── WHY THIS EXISTS: AN INTERMITTENT FAILURE WE COULD NOT DIAGNOSE ──────────
 *
 * `IssueWorkspaceScreen.test.tsx` failed once in a pre-push run under 13-way
 * concurrency and has not reproduced in 7 subsequent attempts. The bare form —
 *
 *     waitFor(() => expect(bodyText()).toContain(ISSUE))
 *
 * — reports only that it timed out. The received body scrolled out of the
 * console, `run-checks.mjs` writes no log file, and re-running produces a
 * different run. So the one occurrence taught us nothing, and three completely
 * different fixes remained open.
 *
 * ⚠️ THE ELAPSED TIME IS THE MOST IMPORTANT FIELD, because two budgets bound
 * these tests and they point at different faults:
 *
 *     ~5000ms   `asyncUtilTimeout` — THIS wait ran out. Ordinary slowness is a
 *               sufficient explanation, since a cold lazy route costs ~600ms
 *               standalone and this budget is only ~8x that.
 *     ~20000ms  `testTimeout` — the whole TEST ran out, meaning the wait was
 *               still spinning long past its own ceiling: a stall, not slowness.
 *     fast      the assertion failed for a different reason entirely.
 *
 * The body excerpt splits the rest: error-fallback text means something THREW
 * inside the lazy tree (main's ErrorBoundary would then render forever), an
 * empty body means the tree never resolved, and a redirect shows up as a
 * DIFFERENT SCREEN'S text.
 *
 * ⚠️ NO URL FIELD, DELIBERATELY. The first version printed
 * `window.location.pathname` — which under `createMemoryRouter` is always `/`,
 * because a memory router never touches `window.location`. A field that reads
 * `/` no matter what had happened would invite the reader to conclude "no
 * redirect occurred" from a value that carries no information at all. The
 * router's location IS available to callers via `renderAt`'s return, and a
 * redirect is visible in the body text regardless, so this reports only what it
 * can actually observe.
 *
 * This changes no behaviour — same wait, same budget, same assertion. It only
 * makes the next occurrence worth having.
 */
/**
 * ─── ⚠️ A STOPGAP, NOT A DESIGN. READ BEFORE TRUSTING IT ─────────────────────
 *
 * This is a SCOPED first-paint budget for waits that mount the real, lazily
 * loaded route tree. The global `asyncUtilTimeout` stays at 5000ms so every
 * ordinary assertion keeps failing fast; only this wait gets longer.
 *
 * IT IS THE SECOND PULL OF A LEVER `tests/support/setup.ts` WARNED AGAINST.
 * That file says: "IF COLD LOAD KEEPS GROWING, this is the wrong lever to pull
 * twice. The next response is to split the route's own module graph." Cold load
 * HAS kept growing, so its condition is met and we are knowingly overriding it,
 * on a ruling, to unblock a push. Splitting the route's module graph remains the
 * correct fix and is DEFERRED, not rejected. If this recurs, do that — do not
 * raise this number.
 *
 * ─── THE ARITHMETIC, so the number is not a round guess ──────────────────────
 *
 * Measured first-paint cost of the workspace shell, same tree, same command:
 *
 *   machine state                     suite total   first paint      result
 *   cold / light                          92 s        ~224–584 ms    pass
 *   moderately loaded suite              188 s        up to 1901 ms  pass
 *   under `run-checks` (13-way, the       —           up to 3089 ms  pass
 *     real pre-push condition)
 *   degraded, late-session               323 s        >5070 ms       FAILED
 *
 * The same file measured 1936ms standalone early in a session and 9108ms late in
 * it — a 4.7x drift on identical code. So 5000ms was not a wrong number, it was
 * a number calibrated against a baseline that moves.
 *
 * 15000ms is ~5x the worst cost observed under the REAL pre-push condition
 * (3089ms) and clears the one observed failure (>5070ms). It is not sized
 * against the pathological case below.
 *
 * ⚠️ AND HERE IS WHERE THIS STOPGAP RUNS OUT. Under DOUBLE the hook's load
 * (`run-checks` plus a full suite in parallel) first paint was measured at
 * 12898ms and 33098ms. 33098ms EXCEEDS `testTimeout` (20000ms), so at that load
 * NO scoped budget can help — the whole test dies first. The invariant
 * `testTimeout > this` is preserved here with 5000ms to spare, and the moment a
 * real (single-hook) run needs more than ~15000ms, the answer is the module-graph
 * split, not another increase.
 *
 * `PQMS_REPORT_FIRST_PAINT=1` logs each wait's duration — that is how the table
 * above was produced, and how to re-derive it rather than trusting these figures
 * on a different machine.
 */
const FIRST_PAINT_TIMEOUT = 15000

export async function waitForBody(needle: string, label = 'the rendered body'): Promise<void> {
  const started = Date.now()
  try {
    await waitFor(() => expect(bodyText()).toContain(needle), { timeout: FIRST_PAINT_TIMEOUT })
    if (process.env.PQMS_REPORT_FIRST_PAINT) {
      console.log(`[first-paint] ${label}: ${Date.now() - started}ms`)
    }
  } catch (cause) {
    const elapsed = Date.now() - started
    const text = bodyText()
    const excerpt = text.length > 700 ? `${text.slice(0, 700)}…[+${text.length - 700} more]` : text
    throw new Error(
      [
        `waitForBody: ${JSON.stringify(needle)} never appeared in ${label}.`,
        `  elapsed:      ${elapsed}ms  (asyncUtilTimeout is 5000, testTimeout 20000 — see the note above)`,
        `  body length:  ${text.length}${text.length === 0 ? '  (NOTHING RENDERED AT ALL)' : ''}`,
        `  body:         ${JSON.stringify(excerpt)}`,
      ].join('\n'),
      { cause },
    )
  }
}
