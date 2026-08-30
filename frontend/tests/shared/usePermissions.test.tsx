// Tests for the named capability booleans.
//
// Ported from Vue's `tests/composables/usePermissions.spec.ts`, plus the
// divergence this app's third capability tier forces.
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { RoleProvider, useRole } from '@/data/roles'
import { usePermissions } from '@/shared/usePermissions'
import type { RoleKey } from '@/data/types'

const wrapper = (initialRole: RoleKey) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <RoleProvider initialRole={initialRole}>{children}</RoleProvider>
  }

const permsFor = (role: RoleKey) => renderHook(() => usePermissions(), { wrapper: wrapper(role) }).result

describe('capability resolution per role', () => {
  it('resolves every check to false for SE (read capability)', () => {
    const p = permsFor('SE').current
    expect(p.capability).toBe('read')
    expect(p.canApprove).toBe(false)
    expect(p.canOverrideScore).toBe(false)
    expect(p.canAccessSharing).toBe(false)
    expect(p.canAccessAdmin).toBe(false)
  })

  it('resolves override checks identically for ASM and PQM', () => {
    // The point of a capability tier: two roles that differ in name and in
    // nothing that matters here must not be distinguishable by any gate.
    for (const role of ['ASM', 'PQM'] as const) {
      const p = permsFor(role).current
      expect(p.capability, role).toBe('override')
      expect(p.canApprove, role).toBe(true)
      expect(p.canOverrideScore, role).toBe(true)
      expect(p.canAccessSharing, role).toBe(true)
    }
  })

  it('gives ADMIN administration ONLY — it is a separate track, not a super-user', () => {
    /*
     * ⚠️ THIS IS THE OPPOSITE OF WHAT THIS TEST FIRST ASSERTED, and the change
     * is the finding. I assumed `admin` sat above `override` and wrote the flags
     * as a rank comparison. `computeCan` in roles.tsx says otherwise:
     *
     *     approve / override-edit → cap === 'override'   (admin: NO)
     *     propose  / edit-own     → read or override     (admin: NO)
     *     create                  → cap !== 'admin'      (admin: NO)
     *
     * An ADMIN in this application is an operator who can administer and
     * nothing else. The "agrees with can()" test below is what caught the
     * contradiction.
     */
    const p = permsFor('ADMIN').current
    expect(p.capability).toBe('admin')
    expect(p.canAccessAdmin).toBe(true)
    expect(p.canApprove).toBe(false)
    expect(p.canOverrideScore).toBe(false)
    expect(p.canAccessSharing).toBe(false)
  })
})

describe('DIVERGENCE — canAccessAdmin requires admin, not override', () => {
  // Vue resolves this to `override` because it has no admin tier at all. This
  // app does: ADMIN carries `cap: 'admin'`, `AdminScreen` gates on
  // `can('administer')`, and `/admin` is loader-gated on `admin`. Resolving it
  // to `override` here would hand ASM and PQM a flag saying they may reach a
  // screen that then refuses them.
  it('is false for ASM and PQM even though their other flags are true', () => {
    for (const role of ['ASM', 'PQM'] as const) {
      const p = permsFor(role).current
      expect(p.canApprove, role).toBe(true)
      expect(p.canAccessAdmin, role).toBe(false)
    }
  })

  it('agrees with what the /admin route actually enforces', () => {
    // The flag and the guard must not disagree — a true flag over a route that
    // redirects is how a dead nav link appears.
    for (const role of ['SE', 'ASM', 'PQM', 'ADMIN'] as const) {
      const p = permsFor(role).current
      expect(p.canAccessAdmin, role).toBe(role === 'ADMIN')
    }
  })
})

describe('it tracks a role switch with no stale state', () => {
  it('re-resolves when the role changes', () => {
    const { result } = renderHook(
      () => ({ perms: usePermissions(), role: useRole() }),
      { wrapper: wrapper('SE') },
    )
    expect(result.current.perms.canApprove).toBe(false)

    act(() => result.current.role.setRole('ASM'))
    expect(result.current.perms.canApprove).toBe(true)

    act(() => result.current.role.setRole('SE'))
    expect(result.current.perms.canApprove).toBe(false)
  })

  it('keeps a stable object identity while the capability is unchanged', () => {
    // Memoised on the capability, not the user object — the store hands back a
    // fresh `user` on unrelated edits, and re-rendering every consumer for those
    // is what the memo exists to prevent.
    const { result, rerender } = renderHook(() => usePermissions(), { wrapper: wrapper('ASM') })
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })

  it('switching between two roles of the SAME capability yields equal VALUES', () => {
    /*
     * ⚠️ EQUAL, NOT IDENTICAL — and this test originally asserted identity,
     * which was wrong. `RoleProvider` memoises on the ROLE, so ASM → PQM hands
     * back a new `can`, and the memo here depends on it. The object is rebuilt.
     *
     * That is the right trade: listing `can` honestly beats suppressing the
     * dependency to preserve an identity guarantee nothing relies on. What
     * consumers actually need — that two override roles are indistinguishable —
     * is what is asserted.
     */
    const { result } = renderHook(
      () => ({ perms: usePermissions(), role: useRole() }),
      { wrapper: wrapper('ASM') },
    )
    const first = { ...result.current.perms }
    act(() => result.current.role.setRole('PQM'))
    expect(result.current.perms).toEqual(first)
  })
})

describe('it agrees with the action-level gate it sits beside', () => {
  it('canApprove matches can("approve") for every role', () => {
    // `can()` and this hook resolve from the same `user.cap`, so they cannot
    // drift — this pins that they in fact do not.
    for (const role of ['SE', 'ASM', 'PQM', 'ADMIN'] as const) {
      const { result } = renderHook(
        () => ({ perms: usePermissions(), role: useRole() }),
        { wrapper: wrapper(role) },
      )
      expect(result.current.perms.canApprove, role).toBe(result.current.role.can('approve'))
    }
  })

  it('canAccessAdmin matches can("administer") for every role', () => {
    for (const role of ['SE', 'ASM', 'PQM', 'ADMIN'] as const) {
      const { result } = renderHook(
        () => ({ perms: usePermissions(), role: useRole() }),
        { wrapper: wrapper(role) },
      )
      expect(result.current.perms.canAccessAdmin, role).toBe(result.current.role.can('administer'))
    }
  })
})
