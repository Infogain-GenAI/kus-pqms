import type { RoleKey, User } from './types'
import { useAuthStore, userForRole } from '@/stores/auth.store'

/** The default session role. Matches the store's own initial identity. */
const DEFAULT_ROLE: RoleKey = 'SE'

/**
 * CAPABILITIES, READABLE FROM OUTSIDE REACT.
 *
 * Ported from the Vue app's `stores/auth/auth.store.ts` + `router/index.ts`
 * pairing, which enforces one hard rule this module carries over verbatim:
 *
 *   NO `role === 'X'` COMPARISON IS PERMITTED ANYWHERE OUTSIDE THE MAP BELOW.
 *   Every consumer gates on a capability, never on a role string.
 *
 * ─── WHY THIS EXISTS SEPARATELY FROM `data/roles.tsx` ────────────────────────
 *
 * Because a React Router LOADER RUNS OUTSIDE THE REACT TREE. It is called by the
 * router before any component renders, so it cannot call `useRole()` — there is
 * no context to read. Vue has no equivalent problem: its guard reads a Pinia
 * store, which is a module singleton reachable from anywhere.
 *
 * So the current capability is mirrored into a module-level snapshot that
 * `RoleProvider` keeps in step. That is not a second source of truth: the
 * provider owns the role, and this is a read-through copy for the one caller
 * that cannot reach the provider.
 *
 * ⚠️ THE SNAPSHOT IS PROCESS-WIDE. Two `RoleProvider`s mounted at once (which
 * happens only in tests) share it, and the last one to render wins. That is
 * acceptable because the guard is about the SESSION, of which there is exactly
 * one in a browser — but a test that renders two providers with different roles
 * and then asserts on a loader is asserting on whichever rendered last.
 */

/** The three tiers. NOT ordered — see `hasCapability`. */
export type Capability = 'read' | 'override' | 'admin'

/**
 * Does `current` satisfy `required`?
 *
 * ⚠️ `admin` IS NOT A SUPERSET OF `override` IN THIS APPLICATION, and an earlier
 * version of this file assumed it was. It is a SEPARATE TRACK. `computeCan` in
 * `roles.tsx` is unambiguous about it:
 *
 *     approve / override-edit → cap === 'override'      (admin: NO)
 *     propose  / edit-own     → cap read or override    (admin: NO)
 *     create                  → cap !== 'admin'         (admin: NO)
 *     administer              → cap === 'admin'
 *
 * So an ADMIN in this app can administer and do nothing else — it is an
 * operator role, not a super-user. A rank comparison (`admin >= override`) would
 * have contradicted that everywhere, and the disagreement was caught by a test
 * asserting `canApprove` equals `can('approve')`: the rank model said an admin
 * could approve, and the application says they cannot.
 *
 * `read` is the one shared floor, matching Vue: a route requiring only `read` is
 * declaring "any signed-in session", not "read-only sessions only".
 *
 * IF THE PRODUCT EVER DECIDES ADMIN SHOULD INHERIT OVERRIDE, this function and
 * `computeCan` must change TOGETHER. Changing one alone reintroduces exactly the
 * split that was found here.
 */
export function hasCapability(current: Capability, required: Capability): boolean {
  if (required === 'read') return true
  return current === required
}

/**
 * ROLE → CAPABILITY. The one permitted role comparison in the codebase.
 *
 * Derived from the seeded users rather than hand-written, so a role whose `cap`
 * changes in the seed cannot leave a stale duplicate here saying otherwise.
 */
export function capabilityOf(user: Pick<User, 'cap'>): Capability {
  return user.cap
}

/**
 * The session's capability, readable from a loader.
 *
 * ─── ⚠️ THIS IS NO LONGER A MIRROR. THE MIRROR IS GONE. ──────────────────────
 *
 * It used to be a module-level `let` that `RoleProvider` wrote to during render,
 * with a header on this file explaining at length that a route loader runs
 * outside the React tree and so cannot call `useRole()`. That workaround existed
 * only because the session lived in React state.
 *
 * It now lives in `stores/auth.store.ts`, which is a module singleton reachable
 * from anywhere — exactly the property `04-state-management.md` requires of it:
 * *"safe for `getState().permissions` to read from middleware, outside React."*
 * So this reads the store directly. There is one source of truth again, and the
 * old caveat about two `RoleProvider`s racing over a process-wide snapshot no
 * longer applies, because there is no snapshot to race over.
 *
 * DEFAULTS TO THE LEAST PRIVILEGED ROLE'S, not to `admin` — the store's own
 * initial state is the SE session. A guard that fails open is not a guard.
 */
export function currentCapability(): Capability {
  return capabilityOf(useAuthStore.getState().currentUser)
}

/**
 * Sets the session role.
 *
 * ⚠️ THE NAME IS NOW SLIGHTLY WRONG AND IS KEPT ANYWAY. It no longer *syncs*
 * anything — it writes the one store. The name survives because a dozen test
 * files and `tests/support/dataRouter.tsx` call it, and renaming it in the same
 * change that moved the session into Zustand would have put every one of those
 * files in this diff. Worth renaming to `setSessionRole` in a follow-up whose
 * whole content is the rename.
 *
 * Routes through `setUser()`, never `switchRole()`: `switchRole()` throws in a
 * production build by design, and this is also the seam a test uses.
 */
export function _syncCurrentRole(role: RoleKey): void {
  useAuthStore.getState().setUser(userForRole(role))
}

/** Test-only: restore the default, so one spec's role cannot leak into the next. */
export function __resetCurrentCapability(): void {
  useAuthStore.getState().setUser(userForRole(DEFAULT_ROLE))
}
