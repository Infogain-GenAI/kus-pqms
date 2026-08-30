import type { RoleKey, User } from './types'
import { USERS } from './seed'

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

/** Ordered least → most privileged. The ONLY place this ordering is expressed. */
export type Capability = 'read' | 'override' | 'admin'

/**
 * The rank each capability satisfies.
 *
 * ⚠️ A HIERARCHY, WHICH VUE'S IS NOT. Vue has two capabilities and its
 * `hasCapability` returns true for `override` only on an exact match, because
 * there is nothing above it. This app has a third — `admin` — and an admin who
 * could not reach an override-gated screen would be a privilege INVERSION, not
 * a stricter rule. So the comparison is `>=` on rank rather than equality, and
 * the divergence is deliberate.
 */
const CAPABILITY_RANK: Record<Capability, number> = {
  read: 0,
  override: 1,
  admin: 2,
}

/**
 * Does `current` satisfy `required`?
 *
 * `read` is satisfied by everyone, matching Vue: a route that requires only
 * `read` is declaring "any signed-in session", not "read-only sessions only".
 */
export function hasCapability(current: Capability, required: Capability): boolean {
  return CAPABILITY_RANK[current] >= CAPABILITY_RANK[required]
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

/** The provider's initial role, and the value before any provider mounts. */
const DEFAULT_ROLE: RoleKey = 'SE'

const roleCapability = (role: RoleKey): Capability =>
  capabilityOf(USERS.find((u) => u.role === role) ?? USERS[0])

let current: Capability = roleCapability(DEFAULT_ROLE)

/**
 * The session's capability, readable from a loader.
 *
 * DEFAULTS TO THE LEAST PRIVILEGED ROLE'S, not to `admin`. If the snapshot is
 * ever read before a provider has mounted, the safe answer is the one that
 * denies — a guard that fails open is not a guard.
 */
export function currentCapability(): Capability {
  return current
}

/**
 * Called by `RoleProvider` whenever the role changes. Not for anything else.
 *
 * Exported rather than kept private because the provider lives in a different
 * module; the leading underscore marks it as internal wiring, not API.
 */
export function _syncCurrentRole(role: RoleKey): void {
  current = roleCapability(role)
}

/** Test-only: restore the default, so one spec's role cannot leak into the next. */
export function __resetCurrentCapability(): void {
  current = roleCapability(DEFAULT_ROLE)
}
