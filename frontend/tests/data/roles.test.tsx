// Tests for the role adapter over the Zustand auth store.
//
// `data/roles.tsx` used to hold the session in `useState`. It is now a thin
// adapter over `stores/auth.store.ts`, and the whole point of the migration was
// that its consumer API — `useRole()`, `Guard`, `PermAction` — did not change.
// So what is worth asserting here is exactly that: the adapter still behaves the
// way twenty-odd components already depend on, and `RoleProvider` still seeds an
// identity the way a dozen test files already depend on.
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Guard, RoleProvider, useRole } from '@/data/roles'
import { useAuthStore, userForRole } from '@/stores/auth.store'

beforeEach(() => {
  useAuthStore.getState().setUser(userForRole('SE'))
})

describe('Guard', () => {
  it('renders children when the session holds the capability', () => {
    render(
      <RoleProvider initialRole="ADMIN">
        <Guard can="administer">
          <span>admin tools</span>
        </Guard>
      </RoleProvider>,
    )

    expect(screen.getByText('admin tools')).toBeTruthy()
  })

  /*
   * ⚠️ THE ASSERTION THAT MATTERS IS THE ABSENCE ONE. A `Guard` that rendered
   * its children unconditionally would pass the test above and fail this — and
   * "the gate renders nothing when it should" is the only direction of this bug
   * that has a security consequence.
   */
  it('renders nothing when the session does not', () => {
    render(
      <RoleProvider initialRole="SE">
        <Guard can="administer">
          <span>admin tools</span>
        </Guard>
      </RoleProvider>,
    )

    expect(screen.queryByText('admin tools')).toBeNull()
  })

  it('renders the fallback instead, when one is given', () => {
    render(
      <RoleProvider initialRole="SE">
        <Guard can="administer" fallback={<span>not permitted</span>}>
          <span>admin tools</span>
        </Guard>
      </RoleProvider>,
    )

    expect(screen.getByText('not permitted')).toBeTruthy()
    expect(screen.queryByText('admin tools')).toBeNull()
  })
})

describe('useRole reflects the store', () => {
  function Probe() {
    const { role, user, can, scope } = useRole()
    return (
      <span>
        {role}|{user.name}|{scope}|{can('approve') ? 'yes' : 'no'}
      </span>
    )
  }

  it('exposes the seeded identity', () => {
    render(
      <RoleProvider initialRole="ASM">
        <Probe />
      </RoleProvider>,
    )

    expect(screen.getByText(/^ASM\|/).textContent).toContain('|all|yes')
  })

  // The adapter is a subscription, not a snapshot: a session change made outside
  // React — which is how a route loader or the store's own devtools would do it —
  // must reach a mounted component.
  it('re-renders when the store changes underneath it', () => {
    render(
      <RoleProvider>
        <Probe />
      </RoleProvider>,
    )
    expect(screen.getByText(/^SE\|/)).toBeTruthy()

    act(() => {
      useAuthStore.getState().setUser(userForRole('PQM'))
    })

    expect(screen.getByText(/^PQM\|/)).toBeTruthy()
  })
})

describe('RoleProvider seeding', () => {
  // Several existing test files render as a specific role and expect that to
  // apply. With the session in a module singleton, the seed is the only thing
  // making that true.
  it('applies initialRole to the store', () => {
    render(
      <RoleProvider initialRole="ADMIN">
        <span>x</span>
      </RoleProvider>,
    )

    expect(useAuthStore.getState().currentUser.role).toBe('ADMIN')
  })

  it('leaves the current session alone when given no initialRole', () => {
    useAuthStore.getState().setUser(userForRole('PQM'))

    render(
      <RoleProvider>
        <span>x</span>
      </RoleProvider>,
    )

    expect(useAuthStore.getState().currentUser.role).toBe('PQM')
  })
})
