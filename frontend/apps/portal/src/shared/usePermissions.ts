import { useMemo } from 'react'
import type { Capability } from '@/data/capabilities'
import { useRole } from '@/data/roles'

/**
 * NAMED CAPABILITY BOOLEANS — the only sanctioned way a component asks what the
 * current session may do.
 *
 * Ported from `composables/usePermissions.ts` in the Vue app, whose first line
 * states the hard rule this hook exists to enforce, carried over verbatim:
 *
 *   NO `role === 'X'`-STYLE LITERAL ROLE COMPARISON IS PERMITTED ANYWHERE IN
 *   THIS CODEBASE outside the role→capability map. Every consumer gates on a
 *   named capability, never on a role string.
 *
 * `scripts/check-role-gate.mjs` enforces that mechanically — it fails the build
 * on a role comparison anywhere outside `data/roles.tsx` and
 * `data/capabilities.ts`, which are the two files permitted to know that roles
 * exist at all.
 *
 * ─── WHY THE RULE, AND NOT JUST A CONVENTION ─────────────────────────────────
 *
 * `role === 'ASM'` is a permission check written as a fact about a person. It is
 * wrong the moment a fourth role appears, and it is wrong SILENTLY: a new
 * override-capable role simply fails every such check, and the symptom is a user
 * who cannot approve anything with no error to explain it. Scattered role
 * literals also make "who can approve?" unanswerable without reading every file.
 *
 * A named capability moves the question to one place. Adding a role becomes an
 * edit to the seed's `cap` field, and every gate in the app follows.
 *
 * ─── HOW THIS DIFFERS FROM `useRole().can(...)`, WHICH ALREADY EXISTS ────────
 *
 * `can()` takes an ACTION (`'propose'`, `'approve'`) and is the finer-grained
 * gate; it stays, and most call sites should keep using it. This hook answers
 * the coarser question — what CAPABILITY TIER is this session — for the handful
 * of places that gate on the tier itself rather than on a specific action, which
 * is exactly what Vue's composable does.
 *
 * The two cannot drift: this hook DELEGATES to `can()` rather than recomputing.
 */
export interface Permissions {
  /** The raw tier, for the rare consumer that needs more than a boolean. */
  capability: Capability
  /** May decide a proposal — approve or reject. */
  canApprove: boolean
  /** May override a calculated priority letter. */
  canOverrideScore: boolean
  /** May reach the cross-organisation Sharing section. `SharingSection` gates on the same check. */
  canAccessSharing: boolean
  /**
   * May reach Administration.
   *
   * ⚠️ REQUIRES `admin`, NOT `override` — a DELIBERATE DIVERGENCE FROM VUE,
   * whose version resolves this to `override` because it has no admin tier at
   * all. This app does: `USERS` gives ADMIN `cap: 'admin'`, `AdminScreen` gates
   * on `can('administer')`, and `/admin` is loader-gated on `admin`. Resolving
   * it to `override` here would have handed ASM and PQM a flag saying they may
   * reach a screen that would then refuse them.
   *
   * NOTE ALSO that `admin` is NOT a superset of `override` in this application —
   * an ADMIN cannot approve, propose or create. See `hasCapability`.
   */
  canAccessAdmin: boolean
}

export function usePermissions(): Permissions {
  const { user, can } = useRole()
  const capability = user.cap

  /*
   * ─── DERIVED FROM `can()`, NOT FROM THE CAPABILITY DIRECTLY ────────────────
   *
   * These could each be written as `capability === 'override'`, and the first
   * version of this file did exactly that. It was WRONG for `canApprove` on an
   * ADMIN session: `computeCan` gives `approve` only to `override`, so an admin
   * cannot approve — while a capability comparison said they could. A test
   * asserting the two agree is what caught it.
   *
   * Delegating removes the possibility. There is one implementation of "may
   * this session approve", and this hook is a named view onto it rather than a
   * second opinion about it.
   *
   * Both dependencies are stable together and change together: `RoleProvider`
   * memoises its context value on the role, so `can` keeps its identity for as
   * long as the role — and therefore the capability — is unchanged. Listing both
   * is honest rather than suppressed, and costs no extra recomputation.
   */
  return useMemo<Permissions>(
    () => ({
      capability,
      canApprove: can('approve'),
      canOverrideScore: can('override-edit'),
      canAccessSharing: can('approve'),
      canAccessAdmin: can('administer'),
    }),
    [capability, can],
  )
}
