import { RouterProvider, createBrowserRouter } from 'react-router-dom'
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
const router = createBrowserRouter(routes)

import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/AppShell'
import { DashboardScreen } from '@/features/dashboard/DashboardScreen'
import { IssueListScreen } from '@/features/issues/IssueListScreen'
import { CreateIssueScreen } from '@/features/issues/CreateIssueScreen'
import { IssueWorkspaceScreen } from '@/features/issues/IssueWorkspaceScreen'
import { AdminScreen } from '@/features/admin/AdminScreen'
import { NotificationsScreen } from '@/features/notifications/NotificationsScreen'
import { QirManagementScreen } from '@/features/qir/QirManagementScreen'
import { TsbManagementScreen } from '@/features/tsb/TsbManagementScreen'

// AppShell is the layout route — it renders the chrome and an <Outlet/>.
// `/issues/new` is declared before `/issues/:id` so it is not read as an id.
export default function App() {
  return <RouterProvider router={router} />
}
