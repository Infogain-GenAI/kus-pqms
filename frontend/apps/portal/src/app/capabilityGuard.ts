import { redirect } from 'react-router'
import { currentCapability, hasCapability, type Capability } from '@/data/capabilities'

/**
 * THE ROUTE CAPABILITY GUARD.
 *
 * Ported from `router/index.ts`'s `capabilityGuard` in the Vue app, whose own
 * comment states the requirement: block navigation BEFORE the target page
 * renders, because authorization must never be enforced purely by UI visibility.
 *
 * ─── WHY A LOADER AND NOT A COMPONENT CHECK ──────────────────────────────────
 *
 * `/admin` already refuses to render its content for a non-admin — `AdminScreen`
 * checks `can('administer')` and shows a denial. That is UI visibility, and the
 * loader adds two things it cannot:
 *
 *   1. THE COMPONENT NEVER MOUNTS. Anything the screen does on mount — a fetch,
 *      a subscription, a store write — has already happened by the time an
 *      in-component denial renders.
 *   2. THE URL DOES NOT SETTLE ON `/admin`. Staying there reads as "you are here
 *      but blocked"; redirecting reads as "this is not for you", which is the
 *      accurate one.
 *
 * ⚠️ IT DOES NOT PREVENT THE CHUNK BEING DOWNLOADED, and an earlier version of
 * this comment claimed it did. That was wrong, and the browser said so: with the
 * guard active and a read session, `AdminScreen.tsx` was still requested. React
 * Router runs a route's `lazy` import IN PARALLEL with its `loader`, so the
 * fetch is already in flight when the redirect is decided. Moving the guard to a
 * pathless parent does not help — the router resolves the whole matched branch
 * together.
 *
 * The in-component check therefore stays, as defence in depth and as the thing a
 * nested render still needs.
 *
 * ⚠️ NOR IS EITHER A SECURITY CONTROL — see below. Nothing here keeps admin code
 * or admin data away from someone determined to read it.
 *
 * ⚠️ NEITHER IS A SECURITY CONTROL. Both run in the browser and both can be
 * bypassed by anyone willing to edit the bundle. The server re-checks every
 * mutation; this exists so the UI does not offer what the server will refuse.
 * Vue's file says the same and it must not be read as more than that.
 *
 * ─── THE REDIRECT TARGET IS VUE'S, VERBATIM ──────────────────────────────────
 *
 * `/?denied=1`. Vue has no "not authorized" page and neither does this app, so a
 * blocked navigation goes home carrying a marker. The marker matters: without it
 * the user is silently teleported to the dashboard with no idea why, which reads
 * as a broken link rather than a refusal.
 */

/**
 * The one shared decision. Exported separately from the loader so it can be
 * tested as a function — which is exactly how Vue's spec tests theirs.
 *
 * Returns `null` to allow, or the redirect target to block.
 */
export function capabilityDecision(required?: Capability): string | null {
  // No declaration means no requirement. This is the common case: most routes
  // are open to any session.
  if (!required) return null
  return hasCapability(currentCapability(), required) ? null : '/?denied=1'
}

/** Route metadata a test can read without executing anything. */
export interface RouteCapabilityHandle {
  requiresCapability: Capability
}

/**
 * Builds the `handle` + `loader` pair for a capability-gated route.
 *
 * ⚠️ USE THIS RATHER THAN WRITING EITHER HALF BY HAND. `handle` is what a route
 * DECLARES and `loader` is what ENFORCES it; written separately they can
 * disagree, and the dangerous direction is silent — a route that declares
 * `requiresCapability` with no loader looks guarded in every audit and is not.
 * `tests/capabilityGuard.test.tsx` fails the build if the two ever diverge.
 *
 * Spread into the route object:
 *
 *     { path: '/admin', ...requireCapability('admin'), lazy: … }
 */
export function requireCapability(required: Capability): {
  handle: RouteCapabilityHandle
  loader: () => Response | null
} {
  return {
    handle: { requiresCapability: required },
    loader: () => {
      const target = capabilityDecision(required)
      // `redirect()` returns a Response the router acts on; `null` is a loader
      // resolving with no data, which lets the route render normally.
      return target ? redirect(target) : null
    },
  }
}

/**
 * A redirect that CARRIES THE QUERY STRING ACROSS.
 *
 * ─── WHY THIS EXISTS: THE DENIAL MARKER WAS BEING SWALLOWED ──────────────────
 *
 * The guard sends a blocked user to `/?denied=1`. But `/` is itself a redirect
 * onto `/dashboard`, and a plain `redirect('/dashboard')` builds a fresh URL
 * with no search params — so the marker was dropped one hop after being set, and
 * the user landed on the dashboard with no indication anything had been refused.
 * Measured, not theorised: three router-level tests failed on exactly this, one
 * of them landing at `/dashboard` when `/` was asserted.
 *
 * That makes it a general trap rather than a guard-specific one: ANY query a
 * caller attaches to a redirecting path disappears. So the fix lives here, and
 * every hop-through redirect in the tree uses it.
 *
 * `request.url` is absolute; `URL` parses it and `.search` is `''` when there is
 * nothing to carry, which appends nothing.
 */
export function redirectPreservingQuery(to: string) {
  return ({ request }: { request: Request }) => redirect(`${to}${new URL(request.url).search}`)
}
