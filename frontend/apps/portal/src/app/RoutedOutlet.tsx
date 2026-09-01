import { Outlet, useLocation } from 'react-router'
import { ErrorBoundary } from './ErrorBoundary'

/**
 * `<Outlet />` wrapped in a recoverable error boundary.
 *
 * ─── WHY EVERY LAYOUT RENDERS THIS INSTEAD OF `<Outlet />` ───────────────────
 *
 * The brief was "wrap each route's element". Doing that literally would mean
 * twenty wrappers in `routes.tsx` — and it is not even possible for the routes
 * that use `lazy`, which produce their Component through the router rather than
 * as an element this file could wrap.
 *
 * Every routed screen renders through exactly one layout's `<Outlet />`, so
 * putting the boundary there covers all of them with four insertion points and
 * no route object left to forget. It also puts the boundary INSIDE the app
 * chrome, which is the behaviour worth having: a failed screen leaves the header
 * and navigation working, so the user can leave. A boundary above the chrome
 * would replace the whole page and strip away the way out.
 *
 * ─── THE KEY IS THE POINT, NOT AN OPTIMISATION ───────────────────────────────
 *
 * `resetKey={pathname}` clears a captured error whenever the route changes.
 * Without it React keeps this boundary instance mounted across navigation — same
 * element type, same position — so a user who hit an error and then clicked a
 * different nav item would STILL see the fallback, on a route that renders
 * perfectly well, with no way out but a reload.
 *
 * `source` names the failing route in the log. "Something threw" is not
 * actionable; "something threw on /issues/HV-260101/investigation" is.
 */
export function RoutedOutlet() {
  const { pathname } = useLocation()
  return (
    <ErrorBoundary resetKey={pathname} source={`route:${pathname}`}>
      <Outlet />
    </ErrorBoundary>
  )
}
