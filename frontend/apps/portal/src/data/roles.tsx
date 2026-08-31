import { useMemo, type ReactNode } from 'react'
import type { PermAction, RoleKey, User } from './types'
import { useAuthStore, hasPermission, selectScope, userForRole } from '@/stores/auth'

/**
 * ROLE CONTEXT — NOW A THIN ADAPTER OVER `stores/auth/auth.store.ts`.
 *
 * ─── WHAT CHANGED, AND WHAT DELIBERATELY DID NOT ─────────────────────────────
 *
 * The session used to live in `useState` inside `RoleProvider`, with the
 * capability mirrored by hand into a module-level snapshot for route loaders to
 * read. It now lives in a Zustand store, per `04-state-management.md`'s
 * "Auth → Zustand".
 *
 * ⚠️ `useRole()`, `Guard` AND `PermAction` KEEP THEIR EXACT SHAPES. Twenty-odd
 * components and a dozen test files call `useRole()`, and the migration is a
 * change of where the value is kept — not of what any of them see. Changing the
 * consumer API at the same time would have made every one of those call sites
 * part of the diff and buried the actual change.
 *
 * ─── WHY `RoleProvider` STILL EXISTS AT ALL ──────────────────────────────────
 *
 * A Zustand store is a module singleton, so strictly nothing needs to be
 * provided. The component is kept because `initialRole` is load-bearing in
 * tests: several render the tree as a specific role, and the store's default
 * would otherwise be the only reachable identity. It now seeds the store instead
 * of holding state of its own.
 *
 * ⚠️ ONE BEHAVIOUR IS GENUINELY BETTER NOW, AND IT IS WORTH NAMING. The old
 * provider wrote the role into `data/capabilities.ts`'s snapshot *during render*
 * — a side effect in a `useMemo` — because a route loader runs before render and
 * an effect would have been too late. That workaround is gone: a store is
 * readable from a loader directly, which is precisely the property 04 requires
 * of `permissions` ("safe for `getState().permissions` to read from middleware,
 * outside React"). The store is now the one source, not a source plus a mirror.
 */

export type { PermAction }

interface RoleContextValue {
  role: RoleKey
  user: User
  setRole: (r: RoleKey) => void
  can: (action: PermAction) => boolean
  /** SE sees own-scope by default; override/admin roles see all. */
  scope: 'own' | 'all'
}

/**
 * Seeds the store's identity.
 *
 * ⚠️ WRITTEN DURING RENDER, NOT IN AN EFFECT, AND FOR THE SAME REASON THE OLD
 * SNAPSHOT SYNC WAS: React Router calls a route's loader BEFORE rendering the
 * route it guards, so a seed applied in an effect lands after the first guarded
 * navigation has already been decided against the wrong identity.
 *
 * The write is guarded on inequality, so it happens once rather than on every
 * render — an unconditional `setUser` would notify every subscriber each render
 * and loop.
 */
export function RoleProvider({
  children,
  initialRole,
}: {
  children: ReactNode
  initialRole?: RoleKey
}) {
  if (initialRole && useAuthStore.getState().currentUser.role !== initialRole) {
    // Through `setUser`, NOT `switchRole` — `switchRole` throws in a production
    // build by design, and seeding is not role switching.
    useAuthStore.getState().setUser(userForRole(initialRole))
  }
  return <>{children}</>
}

export function useRole(): RoleContextValue {
  const currentUser = useAuthStore((s) => s.currentUser)
  const permissions = useAuthStore((s) => s.permissions)
  const switchRole = useAuthStore((s) => s.switchRole)
  const scope = useAuthStore(selectScope)

  /*
   * Memoised on the store's own values, so the returned object keeps a stable
   * identity between renders where the session did not change. Several consumers
   * put `can` straight into an effect dependency list; a new function each render
   * would re-run that work on every unrelated re-render.
   */
  return useMemo<RoleContextValue>(
    () => ({
      role: currentUser.role,
      user: currentUser,
      setRole: switchRole,
      can: (action) => hasPermission(permissions, action),
      scope,
    }),
    [currentUser, permissions, switchRole, scope],
  )
}

/** Renders children only when the current role has the given capability. */
export function Guard({
  can,
  children,
  fallback = null,
}: {
  can: PermAction
  children: ReactNode
  fallback?: ReactNode
}) {
  const ctx = useRole()
  return <>{ctx.can(can) ? children : fallback}</>
}
