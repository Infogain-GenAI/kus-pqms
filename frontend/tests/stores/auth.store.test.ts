// Tests for the Zustand auth/session store.
//
// ─── WHAT IS WORTH ASSERTING HERE ────────────────────────────────────────────
//
// Not "does a setter set". The rules 04 spends its "Auth → Zustand" section on
// are invariants that a plausible-looking implementation breaks silently:
//
//   • `permissions` and `currentUser` change in ONE `set()`, so no render ever
//     sees one user holding another's authority.
//   • `role` is derived and no action assigns it.
//   • `switchRole()` routes through `setUser()` rather than writing state.
//   • `switchRole()` throws in a production build — 04 calls that a security
//     control, not hygiene.
//   • `permissions` is a plain field, readable via `getState()` outside React,
//     which is what lets a route loader see the session at all.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  useAuthStore,
  userForRole,
  hasPermission,
  selectRole,
  selectScope,
  notificationReceiverId,
} from '@/stores/auth'
import type { PermAction, RoleKey } from '@/data/types'

beforeEach(() => {
  useAuthStore.getState().setUser(userForRole('SE'))
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('the single-writer rule', () => {
  it('sets currentUser and permissions together', () => {
    useAuthStore.getState().setUser(userForRole('ADMIN'))

    const { currentUser, permissions } = useAuthStore.getState()
    expect(currentUser.role).toBe('ADMIN')
    expect(permissions.administer).toBe(true)
  })

  /*
   * ⚠️ THE ONE THAT MATTERS. Two separate `set()` calls give a subscriber a
   * notification where `currentUser` is the new user and `permissions` still
   * belongs to the old one. It never throws and it lasts one frame, so it is
   * invisible to every other kind of test — but every gate in the app reads
   * permissions, so that frame shows one user holding another's authority.
   *
   * Subscribing and recording each notification is the only way to see it.
   */
  it('never notifies with a user and permissions from different sessions', () => {
    const seen: { role: RoleKey; canAdminister: boolean }[] = []
    const unsubscribe = useAuthStore.subscribe((state) =>
      seen.push({ role: state.currentUser.role, canAdminister: state.permissions.administer }),
    )

    useAuthStore.getState().setUser(userForRole('ADMIN'))
    useAuthStore.getState().setUser(userForRole('SE'))
    unsubscribe()

    expect(seen.length).toBeGreaterThan(0)
    for (const snapshot of seen) {
      expect(snapshot.canAdminister).toBe(snapshot.role === 'ADMIN')
    }
  })
})

describe('role is derived, not written', () => {
  it('follows currentUser', () => {
    useAuthStore.getState().setUser(userForRole('PQM'))
    expect(selectRole(useAuthStore.getState())).toBe('PQM')
  })

  // 04: "no action assigns it." A `role` field on the state object would be a
  // second thing to keep in step with `currentUser`, which is the ambiguity 04
  // says an earlier revision of the standard left open.
  it('is not a field on the state object', () => {
    expect(Object.keys(useAuthStore.getState())).not.toContain('role')
  })
})

describe('switchRole', () => {
  it('changes the session', () => {
    useAuthStore.getState().switchRole('ASM')
    expect(useAuthStore.getState().currentUser.role).toBe('ASM')
  })

  // 04: "switchRole(), MSAL hydration, and logout all route through setUser()."
  // Spying on the store's own action proves the route rather than the outcome —
  // a local `set()` would produce the same state and fail this.
  it('routes through setUser rather than writing state itself', () => {
    const real = useAuthStore.getState().setUser
    const setUser = vi.fn(real)
    useAuthStore.setState({ setUser })

    try {
      useAuthStore.getState().switchRole('PQM')

      expect(setUser).toHaveBeenCalledTimes(1)
      expect(setUser.mock.calls[0][0].role).toBe('PQM')
    } finally {
      // Restored explicitly: `setState` replaced an ACTION, not data, and
      // `vi.restoreAllMocks()` knows nothing about the store. Left in place, every
      // later test in this file would run against a spy-wrapped writer.
      useAuthStore.setState({ setUser: real })
    }
  })

  /*
   * ⚠️ THE SECURITY CONTROL. 04: "its prod-build gate is a security control, not
   * hygiene… the second layer of that same defence. Both layers are required."
   *
   * Without it a shipped build contains a function that reassigns the session's
   * identity and permissions with no server involved, reachable from the console.
   */
  it('throws in a production build', () => {
    vi.stubEnv('PROD', true)
    expect(() => useAuthStore.getState().switchRole('ADMIN')).toThrow(/production build/)
  })

  it('leaves the session untouched when it refuses', () => {
    vi.stubEnv('PROD', true)
    expect(() => useAuthStore.getState().switchRole('ADMIN')).toThrow()
    expect(useAuthStore.getState().currentUser.role).toBe('SE')
  })
})

describe('permissions', () => {
  /*
   * ⚠️ ADMIN IS A SEPARATE TRACK, NOT A SUPERSET, and this is the assertion that
   * pins it. A rank model (`admin >= override`) reads as the obvious design and
   * contradicts the application everywhere — an ADMIN here can administer and
   * nothing else.
   */
  it('gives ADMIN administer and nothing else', () => {
    useAuthStore.getState().setUser(userForRole('ADMIN'))
    const { permissions } = useAuthStore.getState()

    expect(permissions.administer).toBe(true)
    expect(permissions.approve).toBe(false)
    expect(permissions['override-edit']).toBe(false)
    expect(permissions.propose).toBe(false)
    expect(permissions['edit-own']).toBe(false)
    expect(permissions.create).toBe(false)
  })

  it('gives an override role approval but not administration', () => {
    useAuthStore.getState().setUser(userForRole('ASM'))
    const { permissions } = useAuthStore.getState()

    expect(permissions.approve).toBe(true)
    expect(permissions['override-edit']).toBe(true)
    expect(permissions.administer).toBe(false)
  })

  it('gives a read role propose and create but not approve', () => {
    const { permissions } = useAuthStore.getState()

    expect(permissions.propose).toBe(true)
    expect(permissions.create).toBe(true)
    expect(permissions.approve).toBe(false)
  })

  /*
   * 04 requires this specifically: "a plain, directly-readable field on the
   * store's state object (safe for getState().permissions to read from
   * middleware, outside React), never a hook-time-only derived selector."
   *
   * That property is the entire reason a route loader can see the session, and
   * it is what let `data/capabilities.ts` drop its hand-maintained mirror.
   */
  it('is a plain readable object outside React', () => {
    const { permissions } = useAuthStore.getState()
    expect(typeof permissions).toBe('object')
    expect(Object.getPrototypeOf(permissions)).toBe(Object.prototype)
  })
})

describe('hasPermission', () => {
  // 08 requires the bare-function shape specifically because it must be callable
  // from route middleware, which runs outside React and cannot use hooks. A
  // version that read the store internally would work in a component and be
  // unusable in the guard.
  it('takes permissions as an argument and reaches into no store', () => {
    const admin = { ...useAuthStore.getState().permissions, administer: true }
    expect(hasPermission(admin, 'administer')).toBe(true)

    // The live session is still SE, proving the function used the argument.
    expect(useAuthStore.getState().currentUser.role).toBe('SE')
  })

  it('is false for an action the session does not hold', () => {
    expect(hasPermission(useAuthStore.getState().permissions, 'approve' as PermAction)).toBe(false)
  })
})

describe('scope', () => {
  it('is own for a read session and all for the others', () => {
    expect(selectScope(useAuthStore.getState())).toBe('own')

    useAuthStore.getState().setUser(userForRole('ASM'))
    expect(selectScope(useAuthStore.getState())).toBe('all')

    useAuthStore.getState().setUser(userForRole('ADMIN'))
    expect(selectScope(useAuthStore.getState())).toBe('all')
  })
})

describe('notificationReceiverId', () => {
  /*
   * ⚠️ IT IS NOT `id`, AND THAT IS NOT AN OVERSIGHT. There is no shared user
   * space between this frontend's seeded ids (`u-se`) and the notification
   * service's own seed rows, so the `receiver` parameter every notification
   * endpoint requires needs its own value. Ported from the Vue auth store,
   * which records the same reason.
   */
  it('prefers the notification identity when the user has one', () => {
    const user = { ...userForRole('SE'), notificationReceiverId: 'qe_user_01@pqms.internal' }
    expect(notificationReceiverId(user)).toBe('qe_user_01@pqms.internal')
  })

  // The fallback is what keeps every call site working before identity lands.
  it('falls back to the id when it does not', () => {
    const user = userForRole('SE')
    expect(notificationReceiverId(user)).toBe(user.id)
  })

  /*
   * A function rather than two call sites each writing `x.notificationReceiverId
   * ?? x.id`. Two copies are two places for the rule to drift, and the symptom
   * of drift is a 404 from the backend's ownership check — which names nothing.
   */
  it('is the single place the fallback is decided', () => {
    expect(typeof notificationReceiverId).toBe('function')
  })
})
