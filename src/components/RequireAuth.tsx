import type { ReactNode } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { LoaderCircle, ShieldX } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.ts'
import { homePath } from '../auth/permissions.ts'
import StateMessage from './StateMessage.tsx'
import type { AuthUser } from '../types/auth.ts'

interface RequireAuthProps {
  children: ReactNode
  allow?: (user: AuthUser) => boolean // extra role check, e.g. canManageUsers
}

// Route guard. Not logged in -> login page (and back here afterwards). Wrong role -> "no access".
// This only keeps the UI tidy: the API checks the token and the role on every request anyway.
export default function RequireAuth({ children, allow }: RequireAuthProps) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="auth-loading" aria-busy="true">
        <LoaderCircle size={24} className="spin" aria-hidden="true" /> Loading…
      </div>
    )
  }

  if (status === 'anonymous' || !user) {
    // "from" lets the login page send the user back to the page they asked for
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (allow && !allow(user)) {
    return (
      <StateMessage
        icon={<ShieldX size={32} />}
        title="You don't have access to this page"
        description="Ask an administrator if you think you should."
        action={
          <Link to={homePath(user)} className="btn btn--default">
            Go back
          </Link>
        }
      />
    )
  }

  return children
}
