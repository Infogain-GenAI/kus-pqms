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
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/issues" element={<IssueListScreen />} />
        <Route path="/issues/new" element={<CreateIssueScreen />} />
        <Route path="/issues/:id" element={<IssueWorkspaceScreen />} />
        <Route path="/qir" element={<QirManagementScreen />} />
        <Route path="/tsb" element={<TsbManagementScreen />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/notifications" element={<NotificationsScreen />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
