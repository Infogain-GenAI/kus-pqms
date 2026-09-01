// Tests for the route capability guard.
//
// Two Vue specs are ported here:
//
//   tests/router/guards.spec.ts          → "the guard decision" below.
//   tests/router/privileged-routes.spec.ts → "the privileged-route convention".
//
// ─── THE SECOND ONE IS THE MORE VALUABLE, AND VUE'S VERSION IS INERT ─────────
//
// Vue's privileged-routes spec loops over a hardcoded list of route names that
// is EMPTY — it has a comment saying "uncomment once a real privileged route
// exists". So it passes trivially and guards nothing today.
//
// This version derives its list from the route tree instead of restating it, so
// it cannot go stale: it finds every route declaring `requiresCapability` and
// checks each one actually enforces it. A route that declares a requirement and
// forgets the loader looks guarded in any audit and is not — that is the failure
// worth a test, and a hand-maintained name list cannot catch it.
import { describe, it, expect, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import type { RouteObject } from 'react-router'
import { capabilityDecision, requireCapability, type RouteCapabilityHandle } from '@/app/capabilityGuard'
import { __resetCurrentCapability, _syncCurrentRole, hasCapability } from '@/data/capabilities'
import { routes } from '@/routes'
import { bodyText, renderAt } from '../support/dataRouter'

afterEach(() => {
  __resetCurrentCapability()
})

/* -------------------------------------------------------------------------- */
/* Ported from tests/router/guards.spec.ts                                    */
/* -------------------------------------------------------------------------- */

describe('the guard decision', () => {
  it('allows a route that declares no requirement', () => {
    expect(capabilityDecision(undefined)).toBeNull()
  })

  it('blocks a read session from an override route, redirecting home with ?denied=1', () => {
    _syncCurrentRole('SE')
    // The marker matters: without it a blocked user is silently teleported to
    // the dashboard with no idea why, which reads as a broken link.
    expect(capabilityDecision('override')).toBe('/?denied=1')
  })

  it('allows an override session on an override route', () => {
    _syncCurrentRole('ASM')
    expect(capabilityDecision('override')).toBeNull()
  })

  it('allows any session on a read route', () => {
    // `read` means "any signed-in session", not "read-only sessions only".
    for (const role of ['SE', 'ASM', 'PQM', 'ADMIN'] as const) {
      _syncCurrentRole(role)
      expect(capabilityDecision('read'), role).toBeNull()
    }
  })
})

describe('the capability hierarchy', () => {
  it('everyone satisfies read', () => {
    for (const c of ['read', 'override', 'admin'] as const) {
      expect(hasCapability(c, 'read'), c).toBe(true)
    }
  })

  it('admin does NOT satisfy override — the tiers are separate tracks', () => {
    /*
     * ⚠️ REVERSED FROM WHAT THIS TEST FIRST ASSERTED. I modelled the three
     * capabilities as a rank (`read < override < admin`) on the assumption that
     * an admin locked out of an override screen would be a privilege inversion.
     * `computeCan` in roles.tsx already answered that question the other way:
     * `approve` and `override-edit` require `cap === 'override'` exactly, so an
     * ADMIN cannot approve in this application.
     *
     * The rank model therefore contradicted the app everywhere it was used. It
     * was caught by a `usePermissions` test asserting `canApprove` equals
     * `can('approve')` — the two disagreed for ADMIN.
     */
    expect(hasCapability('admin', 'override')).toBe(false)
    expect(hasCapability('override', 'admin')).toBe(false)
  })

  it('read satisfies neither override nor admin', () => {
    expect(hasCapability('read', 'override')).toBe(false)
    expect(hasCapability('read', 'admin')).toBe(false)
  })

  it('override does NOT satisfy admin', () => {
    expect(hasCapability('override', 'admin')).toBe(false)
  })

  it('defaults to the least privileged capability before any provider mounts', () => {
    // A guard that fails OPEN is not a guard. If the snapshot is read before a
    // provider has rendered, the safe answer is the one that denies.
    __resetCurrentCapability()
    expect(capabilityDecision('admin')).toBe('/?denied=1')
  })
})

describe('requireCapability builds both halves together', () => {
  it('declares the requirement in `handle` so it can be audited without running', () => {
    const { handle } = requireCapability('admin')
    expect(handle.requiresCapability).toBe('admin')
  })

  it('the loader redirects when the capability is missing', () => {
    _syncCurrentRole('SE')
    const res = requireCapability('admin').loader()
    expect(res).toBeInstanceOf(Response)
    expect((res as Response).status).toBe(302)
    expect((res as Response).headers.get('Location')).toBe('/?denied=1')
  })

  it('the loader returns null — not a redirect — when the capability is held', () => {
    _syncCurrentRole('ADMIN')
    expect(requireCapability('admin').loader()).toBeNull()
  })
})

/* -------------------------------------------------------------------------- */
/* Ported from tests/router/privileged-routes.spec.ts, made non-inert         */
/* -------------------------------------------------------------------------- */

interface Flat {
  path: string
  route: RouteObject
}

/** Every route in the tree, with its resolved path, for auditing. */
function flatten(records: readonly RouteObject[], parent = ''): Flat[] {
  return records.flatMap((r) => {
    const path = r.path?.startsWith('/') ? r.path : r.path ? `${parent}/${r.path}` : parent
    return [{ path, route: r }, ...(r.children ? flatten(r.children, path) : [])]
  })
}

const flat = flatten(routes)

describe('the privileged-route convention', () => {
  it('every route DECLARING a capability also ENFORCES it with a loader', () => {
    // The dangerous direction, and a silent one: a declaration with no loader
    // reads as guarded in every audit and blocks nobody.
    const declared = flat.filter((f) => (f.route.handle as RouteCapabilityHandle | undefined)?.requiresCapability)
    expect(declared.length).toBeGreaterThan(0)

    for (const { path, route } of declared) {
      expect(typeof route.loader, `${path} declares a capability but has no loader`).toBe('function')
    }
  })

  it('/admin is gated on the admin capability', () => {
    const admin = flat.find((f) => f.path === '/admin')
    expect(admin).toBeDefined()
    expect((admin!.route.handle as RouteCapabilityHandle).requiresCapability).toBe('admin')
  })

  it('no OTHER route is gated — a guard added by accident is also a bug', () => {
    // Keeps the convention honest in both directions. Add the path here when a
    // route legitimately becomes privileged.
    const gated = flat
      .filter((f) => (f.route.handle as RouteCapabilityHandle | undefined)?.requiresCapability)
      .map((f) => f.path)
    expect(gated).toEqual(['/admin'])
  })
})

/* -------------------------------------------------------------------------- */
/* Through the real router                                                    */
/* -------------------------------------------------------------------------- */

describe('/admin through the real route tree', () => {
  // The function tests above prove the decision; these prove it is WIRED. A
  // correct guard attached to nothing is the whole failure mode.
  it('redirects a read session away before the screen renders', async () => {
    // A MEMORY router — assert on its own location, not window.location, which
    // never moves under it.
    const { router } = renderAt(routes, '/admin', { role: 'SE' })

    await waitFor(() => expect(router.state.location.pathname).not.toBe('/admin'))
    // Lands on /dashboard, not /: `/` is itself a redirect. The MARKER is what
    // must survive that hop — see `redirectPreservingQuery`.
    expect(router.state.location.pathname).toBe('/dashboard')
    expect(router.state.location.search).toBe('?denied=1')
  })

  it('redirects an override session too — override is not admin', async () => {
    const { router } = renderAt(routes, '/admin', { role: 'ASM' })
    await waitFor(() => expect(router.state.location.search).toBe('?denied=1'))
  })

  it('lets an ADMIN session through to the screen', async () => {
    const { router } = renderAt(routes, '/admin', { role: 'ADMIN' })
    await waitFor(() => expect(bodyText().length).toBeGreaterThan(0))
    expect(router.state.location.pathname).toBe('/admin')
    expect(router.state.location.search).not.toBe('?denied=1')
  })

  it('leaves ungated routes alone', async () => {
    const { router } = renderAt(routes, '/issues', { role: 'SE' })
    await waitFor(() => expect(bodyText()).toMatch(/issues/i))
    expect(router.state.location.pathname).toBe('/issues')
    expect(router.state.location.search).toBe('')
  })

  it('does NOT show the admin screen content to a blocked session', async () => {
    // The point of gating in a loader rather than in the component: the screen
    // never mounts at all, so its chunk is never fetched and its hooks never run.
    const { router } = renderAt(routes, '/admin', { role: 'SE' })
    await waitFor(() => expect(router.state.location.search).toBe('?denied=1'))
    expect(screen.queryByText(/Administration/i)).toBeNull()
  })
})

describe('REGRESSION — a hop-through redirect swallowed the query string', () => {
  // The guard sends a blocked user to `/?denied=1`, but `/` is itself a redirect
  // onto `/dashboard`. A plain `redirect('/dashboard')` builds a fresh URL with
  // no search params, so the marker vanished one hop after being set and the
  // user landed on the dashboard with no sign anything had been refused.
  it('carries the query from / to /dashboard', async () => {
    const { router } = renderAt(routes, '/?denied=1', { role: 'SE' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
    expect(router.state.location.search).toBe('?denied=1')
  })

  it('carries it through the /overview alias too', async () => {
    const { router } = renderAt(routes, '/overview?denied=1', { role: 'SE' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
    expect(router.state.location.search).toBe('?denied=1')
  })

  it('carries it through /issue-management', async () => {
    const { router } = renderAt(routes, '/issue-management?foo=bar', { role: 'SE' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/issues'))
    expect(router.state.location.search).toBe('?foo=bar')
  })

  it('appends nothing when there is no query', async () => {
    // `.search` is '' for a bare URL, so the redirect target must not gain a
    // stray '?'.
    const { router } = renderAt(routes, '/', { role: 'SE' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/dashboard'))
    expect(router.state.location.search).toBe('')
  })
})
