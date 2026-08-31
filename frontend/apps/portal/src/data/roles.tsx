import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { RoleKey, User } from './types'
import { USERS } from './seed'
import { _syncCurrentRole } from './capabilities'

// Client-side role + permission context. Mirrors EXPERIENCE.md's read/override/admin
// behavior. The runtime role switch is a demo/UAT harness affordance, not a shipped feature;
// every mutation is still (documented to be) re-checked server-side.

export type PermAction = 'create' | 'edit-own' | 'propose' | 'approve' | 'override-edit' | 'administer'

interface RoleContextValue {
  role: RoleKey
  user: User
  setRole: (r: RoleKey) => void
  can: (action: PermAction) => boolean
  /** SE sees own-scope by default; override/admin roles see all. */
  scope: 'own' | 'all'
}

const RoleContext = createContext<RoleContextValue | null>(null)

function computeCan(user: User, action: PermAction): boolean {
  switch (action) {
    case 'approve':
    case 'override-edit':
      return user.cap === 'override'
    case 'administer':
      return user.cap === 'admin'
    case 'propose':
    case 'edit-own':
      return user.cap === 'read' || user.cap === 'override'
    case 'create':
      return user.cap !== 'admin'
    default:
      return false
  }
}

export function RoleProvider({ children, initialRole = 'SE' }: { children: ReactNode; initialRole?: RoleKey }) {
  const [role, setRole] = useState<RoleKey>(initialRole)
  const value = useMemo<RoleContextValue>(() => {
    const user = USERS.find((u) => u.role === role) ?? USERS[0]
    /*
     * Mirror the role into the module-level snapshot that route LOADERS read.
     * A loader runs outside the React tree and cannot call `useRole()`, so the
     * capability guard has no other way to see the session — see
     * `@/data/capabilities`.
     *
     * ⚠️ DONE HERE, INSIDE THE MEMO, NOT IN AN EFFECT. An effect runs AFTER
     * commit, and React Router calls a loader BEFORE rendering the route it
     * guards — so on the very first navigation the loader would read the
     * previous role. Writing during the memo is a side effect in render, which
     * is normally wrong; it is correct here because the write is idempotent
     * (same role in, same value out) and the ordering requirement is real.
     */
    _syncCurrentRole(role)
    return {
      role,
      user,
      setRole,
      can: (action) => computeCan(user, action),
      scope: user.cap === 'read' ? 'own' : 'all',
    }
  }, [role])
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}

/** Renders children only when the current role has the given capability. */
export function Guard({ can, children, fallback = null }: { can: PermAction; children: ReactNode; fallback?: ReactNode }) {
  const ctx = useRole()
  return <>{ctx.can(can) ? children : fallback}</>
}
