import { render } from '@testing-library/react'
import { RouterProvider, createMemoryRouter, type RouteObject } from 'react-router-dom'
import type { RoleKey } from '@/data/types'
import { RoleProvider } from '@/data/roles'
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
