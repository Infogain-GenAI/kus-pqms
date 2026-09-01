import { RouterProvider, createBrowserRouter } from 'react-router'
import { routes } from './routes'

/**
 * The router is created ONCE, at module scope — not inside the component.
 * `createBrowserRouter` builds a stateful router (it owns history, the match
 * cache and every loader's state), so constructing it during render would throw
 * that state away on every re-render and reset navigation.
 *
 * THE ROUTE TREE ITSELF LIVES IN routes.tsx, deliberately. This file is now only
 * the mount point. That split is the original request behind this whole pass —
 * routing had no file of its own; it was inline JSX here.
 *
 * WHAT CHANGED, so a reviewer can see the shape of the migration: this file used
 * to render declarative `<Routes>/<Route>` JSX against a single shared `AppShell`
 * layout, with `<BrowserRouter>` supplied by main.tsx. It is now data mode —
 * `RouterProvider` owns the history, and `main.tsx` no longer wraps anything in
 * `BrowserRouter`. Both cannot coexist: `RouterProvider` brings its own history,
 * so leaving a `BrowserRouter` above it would nest two routers.
 */
// NO `future` FLAGS, DELIBERATELY. Every v7_* flag this file briefly carried
// describes behaviour that is unconditional in v8, so passing them would be dead
// configuration that reads like a live switch. They were enabled on 6.30.6 first,
// as a probe, to prove the behaviour change independently of the API change — the
// suite passed under them before the package was swapped. See routes.tsx.
const router = createBrowserRouter(routes)

export default function App() {
  return <RouterProvider router={router} />
}
