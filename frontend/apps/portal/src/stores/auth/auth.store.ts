import { create } from 'zustand'
import type { PermAction, RoleKey, User } from '@/data/types'
import { USERS } from '@/data/seed'

/**
 * AUTH / SESSION STORE — the first Zustand store in this application.
 *
 * `04-state-management.md` "Auth → Zustand" specifies this file. It is one of
 * exactly two stores 04 names as legitimate (the other is issue-list filters),
 * and 04 is explicit that the list is a ceiling rather than a starting point:
 * *"Do not add a store because this file names one."*
 *
 * ─── WHY AUTH IS CLIENT STATE AT ALL ─────────────────────────────────────────
 *
 * 04's classification test is ownership, not shape. Identity looks server-owned,
 * and the resolved permissions genuinely are — but what this store holds is *who
 * this browser tab is acting as*, which is a property of the session. In
 * fixtures mode there is no server to own it: `switchRole()` invents it. So it
 * is client state, and putting it in a query would mean caching, invalidating
 * and refetching a value nothing on the network has an opinion about.
 *
 * ─── THE SINGLE-WRITER RULE, WHICH IS THE POINT OF THE FILE ──────────────────
 *
 * 04: *"No action may write `currentUser` directly. The only writer is an
 * internal `setUser(user: AuthUser)` action, which derives `permissions` … and
 * sets both `currentUser` and `permissions` in the same `set()` call."*
 *
 * ⚠️ THE "SAME `set()` CALL" HALF IS THE LOAD-BEARING ONE. Two separate `set()`
 * calls give a render in between where `currentUser` is the new user and
 * `permissions` is still the old user's. Every gate in the app reads
 * permissions, so that intermediate render shows one user holding another's
 * authority. It is a single frame, it never throws, and it is exactly the shape
 * of bug that reaches production. One `set()` makes it unrepresentable.
 *
 * ─── AND WHY `role` IS NOT A FIELD ───────────────────────────────────────────
 *
 * 04: *"`role` is derived, not independently written… no action assigns it."*
 * It is read off `currentUser` through the `selectRole` selector below. A stored
 * `role` field would be a second thing to keep in step with `currentUser`, and
 * 04 records that an earlier revision of the standard listed three fields while
 * accounting for writing only two — the ambiguity this resolves.
 */

/**
 * The session's user.
 *
 * ⚠️ `export`ED DELIBERATELY, AND 04 CALLS THE MISSING KEYWORD OUT BY NAME:
 * *"in `kus-pqms` this interface was declared without `export`, which worked
 * only because every writer lived in the same file — a structure this file's
 * single-writer rule deliberately changes."* `setUser(user: AuthUser)` cannot
 * typecheck against a module-private type once a caller lives elsewhere.
 *
 * Structurally identical to `data/types`'s `User` today, and aliased to it
 * rather than redeclared so the two cannot drift into "nearly the same".
 */
export type AuthUser = User & {
  /**
   * The identifier the notification backend knows this user by.
   *
   * ⚠️ IT IS NOT `id`, AND THAT IS NOT AN OVERSIGHT. Ported from the Vue auth
   * store, which records the reason: there is no shared user space between this
   * frontend's seeded ids (`u-se`) and the notification service's own seed
   * rows, so the `receiver` parameter every notification endpoint requires
   * needs its own value.
   *
   * Optional, and `receiverId()` below falls back to `id` when it is absent —
   * so nothing breaks before identity lands, and the real path has somewhere to
   * put the value the moment it does.
   *
   * ⚠️ REVISIT WHEN AUTH LANDS. A real Entra tenant supplies one identity and
   * this field should disappear rather than be populated.
   */
  notificationReceiverId?: string
}

/**
 * ROLE → PERMISSIONS, FIXTURES ONLY.
 *
 * 04 requires `setUser()` to derive permissions *"in fixtures mode, from a
 * fixtures-only `ROLE_PERMISSIONS_MAP`… in real mode, from the FR-SEC-011
 * resolved-permissions response."* This is that map.
 *
 * ⚠️ IT IS DERIVED FROM `computeCan`, NOT TYPED OUT INDEPENDENTLY. A
 * hand-written table would be a second copy of the authorization rules, free to
 * disagree with the one every component already gates on — and a permission
 * table that disagrees with the app fails open in whichever direction it is
 * wrong. Deriving it means there is one rule with two readers.
 *
 * ⚠️ THIS IS NOT 08's PERMISSION MODEL, AND THE GAP IS DELIBERATE — SEE BELOW.
 */
const ALL_ACTIONS: readonly PermAction[] = [
  'create',
  'edit-own',
  'propose',
  'approve',
  'override-edit',
  'administer',
]

/**
 * The one place role authority is decided.
 *
 * ⚠️ `admin` IS A SEPARATE TRACK, NOT A SUPERSET. An ADMIN can administer and
 * nothing else — not approve, not propose, not create. A rank comparison
 * (`admin >= override`) contradicts the application everywhere, and `data/
 * capabilities.ts` records how that was caught. Keep the two in step.
 */
function computeCan(user: AuthUser, action: PermAction): boolean {
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

/** The resolved permissions for one user, as a plain readable object. */
export type ResolvedPermissions = Record<PermAction, boolean>

function resolvePermissions(user: AuthUser): ResolvedPermissions {
  return Object.fromEntries(
    ALL_ACTIONS.map((action) => [action, computeCan(user, action)]),
  ) as ResolvedPermissions
}

/** 04: the default session. The least-privileged role, never an admin. */
const DEFAULT_ROLE: RoleKey = 'SE'

/**
 * The seeded user for a role.
 *
 * Exported so `RoleProvider` can seed an initial identity through `setUser()`
 * rather than through `switchRole()` — which throws in production and is
 * therefore the wrong door for a seed, even though no production call passes an
 * initial role today.
 */
export function userForRole(role: RoleKey): AuthUser {
  return USERS.find((u) => u.role === role) ?? USERS[0]
}

interface AuthState {
  currentUser: AuthUser
  /**
   * ⚠️ A PLAIN FIELD, NOT A DERIVED SELECTOR, AND 04 REQUIRES THAT SPECIFICALLY:
   * *"This guarantees `permissions` is always a plain, directly-readable field
   * on the store's state object (safe for `getState().permissions` to read from
   * middleware, outside React), never a hook-time-only derived selector."*
   *
   * That is what lets a route loader — which runs before any component renders
   * and has no React context to read — reach the session. See the note in
   * `data/capabilities.ts`, which existed solely to work around not having this.
   */
  permissions: ResolvedPermissions
  setUser: (user: AuthUser) => void
  switchRole: (role: RoleKey) => void
}

const initialUser = userForRole(DEFAULT_ROLE)

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: initialUser,
  permissions: resolvePermissions(initialUser),

  /**
   * The ONLY writer. Every other action routes through it.
   *
   * ⚠️ IDEMPOTENT ON PURPOSE. `set()` always produces new object identities, so
   * writing the user who is already signed in still notifies every subscriber
   * and re-renders the app for no change. That is not merely wasteful:
   * `RoleProvider` seeds during render, and a re-entrant notification from a
   * render-phase write is how a render loop starts.
   *
   * `userForRole` returns the same seeded object each time, so identity is a
   * sound comparison here rather than a shallow-equality guess.
   */
  setUser: (user) => {
    if (get().currentUser === user) return
    set({ currentUser: user, permissions: resolvePermissions(user) })
  },

  /**
   * The dev-only role switcher.
   *
   * ⚠️ THE PRODUCTION THROW IS A SECURITY CONTROL, NOT HYGIENE. 04 says so in
   * those words: 08 pairs `isFixtureMode()` with `import.meta.env.PROD === false`
   * as a hard fuse on the fixtures-mode auth bypass, and *"`switchRole()`'s own
   * throws-in-production behaviour is the second layer of that same defence.
   * Both layers are required."*
   *
   * Without it, a shipped build contains a function that reassigns the current
   * user's identity and permissions with no server involved — reachable from the
   * console by anyone who can find the store. The UI affordance is hidden in
   * production too (see `AppHeader`), but a hidden button is not a control: this
   * throw is what makes the capability actually absent rather than merely
   * unrendered.
   *
   * ⚠️ IT IS ALSO NOT A CONVENIENCE THAT COULD BE DROPPED. 04: fixtures mode
   * bypasses MSAL entirely, so this is *"the only identity mechanism available
   * during all local development"* — without it there is exactly one identity
   * and the permission-gated call sites cannot be exercised at all.
   */
  switchRole: (role) => {
    if (import.meta.env.PROD) {
      throw new Error(
        'switchRole() is a development-only affordance and must not run in a production build. ' +
          'It reassigns the session identity with no server involved; see 04-state-management.md.',
      )
    }
    // ⚠️ ROUTES THROUGH `setUser`, IT DOES NOT `set()` ITSELF. 04:
    // "`switchRole()`, MSAL hydration, and logout all route through `setUser()`
    // — none of them touch `currentUser` directly." A local `set()` here would
    // work identically today and would be the first place `permissions` could
    // fall out of step with `currentUser` the next time derivation changes.
    get().setUser(userForRole(role))
  },
}))

/**
 * `role`, derived. 04: read off `currentUser`, never independently written.
 *
 * A function rather than an inline arrow at each call site, so every subscriber
 * shares one selector identity and re-renders on the same equality check.
 */
export const selectRole = (state: AuthState): RoleKey => state.currentUser.role

/** `04`'s scope default: a read-capability session sees its own, others see all. */
export const selectScope = (state: AuthState): 'own' | 'all' =>
  state.currentUser.cap === 'read' ? 'own' : 'all'

/**
 * Does the current session hold `action`?
 *
 * ⚠️ A BARE FUNCTION TAKING PERMISSIONS AS AN ARGUMENT, NEVER REACHING INTO THE
 * STORE. 08 requires exactly that shape — *"it takes the resolved-permissions
 * object as an argument and **never reaches into a store internally**, which is
 * precisely what makes it callable from both contexts"* — the two contexts being
 * a React component and route middleware that runs outside React.
 */
export function hasPermission(permissions: ResolvedPermissions, action: PermAction): boolean {
  return permissions[action] === true
}

/**
 * ─── ⚠️ WHERE THIS STORE DIVERGES FROM 08, AND WHY IT WAS NOT "FIXED" HERE ───
 *
 * 08's "Permission model" supersedes the capability model this file implements.
 * Three concrete differences, none of them accidental:
 *
 * 1. **Five roles, not four.** 08 names `SE | ASM | PQM | ADMIN | VIEWER` from
 *    BRD C1.0 §7.2. `data/types`'s `RoleKey` has no `VIEWER`, and no seeded user
 *    holds it.
 * 2. **Named permission keys, not actions.** 08 requires `"issue:create"`-style
 *    strings checked against a resolved-permissions object; this map holds the
 *    app's existing `PermAction` union.
 * 3. **`hasCapability` is dropped, not adapted.** 08: a coarse role-ordering
 *    gate *"is exactly the kind of client-side reimplementation this
 *    forecloses."* `data/capabilities.ts` still implements one.
 *
 * Migrating those is an 08 change, not a 04 change, and it cannot be done
 * honestly yet: 08 carries an OPEN placeholder for the resolved-permissions
 * response shape and says in terms *"Do not invent field names as confirmed,"*
 * with the trigger being the real FR-SEC-011 contract landing. Inventing the
 * shape here to look compliant would hard-code a guess into every gate in the
 * app.
 *
 * So this store implements 04's structure — single writer, derived role,
 * plain-field permissions, production-gated `switchRole` — over the permission
 * model the app actually has, and the 08 migration is raised separately rather
 * than smuggled in.
 */

/**
 * The identifier to send as `receiver` on every notification call.
 *
 * ⚠️ A FUNCTION RATHER THAN A FIELD, so there is exactly one place that decides
 * the fallback. Two call sites each writing `user.notificationReceiverId ?? user.id`
 * is two places for the rule to drift, and the symptom of drift is a 404 from an
 * ownership check rather than anything that names the cause.
 */
export function notificationReceiverId(user: AuthUser): string {
  return user.notificationReceiverId ?? user.id
}
