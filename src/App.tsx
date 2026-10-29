import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/layout/AppLayout.tsx'
import RequireAuth from './components/RequireAuth.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import TicketsPage from './pages/TicketsPage.tsx'
import TicketDetailPage from './pages/TicketDetailPage.tsx'
import UsersPage from './pages/UsersPage.tsx'
import AccountPage from './pages/AccountPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import AuthCallbackPage from './pages/AuthCallbackPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import { useAuth } from './hooks/useAuth.ts'
import { canManageUsers, canSeeDashboard, homePath } from './auth/permissions.ts'

// "/" -> the start page for this user's role (Staff/Admin: dashboard, Customer: tickets)
function HomeRedirect() {
  const { user } = useAuth()
  return <Navigate to={homePath(user)} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="auth/callback" element={<AuthCallbackPage />} />

      {/* Everything else needs a logged-in user */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<HomeRedirect />} />
        <Route
          path="dashboard"
          element={
            <RequireAuth allow={canSeeDashboard}>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route
          path="users"
          element={
            <RequireAuth allow={canManageUsers}>
              <UsersPage />
            </RequireAuth>
          }
        />
        <Route path="account" element={<AccountPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
