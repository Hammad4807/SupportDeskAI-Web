import { useState } from 'react'
import { CircleAlert, RefreshCw } from 'lucide-react'
import { changeUserRole, getUsers } from '../api/users.ts'
import { toApiError, type ApiError } from '../api/client.ts'
import { useAsync } from '../hooks/useAsync.ts'
import { useAuth } from '../hooks/useAuth.ts'
import StateMessage from '../components/StateMessage.tsx'
import { formatDate, formatDateTime } from '../utils/format.ts'
import { ROLES, type Role, type UserSummary } from '../types/auth.ts'
import './UsersPage.css'

// Admin only (route guard + Policies.AdminOnly on the API): list users and change their role.
export default function UsersPage() {
  const { user: me } = useAuth()
  const { state, retry, setData } = useAsync((signal) => getUsers(signal), [])

  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [changed, setChanged] = useState<UserSummary | null>(null)

  const changeRole = async (target: UserSummary, role: Role) => {
    if (state.status !== 'success') return
    setSavingId(target.id)
    setError(null)
    setChanged(null)
    try {
      const updated = await changeUserRole(target.id, role)
      setData(state.data.map((u) => (u.id === updated.id ? updated : u)))
      setChanged(updated)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span>Settings</span>
      </nav>

      <div className="page__header">
        <h1 className="page__title">Users</h1>
        {state.status === 'success' && <span className="page__count">{state.data.length} users</span>}
      </div>
      <p className="users-intro">
        New accounts are always Customers. Give support team members the Staff role, and only trusted people Admin.
      </p>

      {changed && (
        <div className="banner banner--success" role="status">
          {changed.fullName} is now {changed.roles[0]}. The change applies the next time they log in.
        </div>
      )}
      {error && (
        <div className="banner banner--error" role="alert">
          <strong>{error.title}</strong> {error.message !== error.title && error.message}
          {error.traceId && <div className="banner__trace">Error ID: {error.traceId}</div>}
        </div>
      )}

      {state.status === 'loading' && <p aria-busy="true">Loading users…</p>}

      {state.status === 'error' && (
        <StateMessage
          icon={<CircleAlert size={32} />}
          title={state.error.title}
          description={state.error.message}
          traceId={state.error.traceId}
          action={
            <button type="button" className="btn btn--default" onClick={retry}>
              <RefreshCw size={16} aria-hidden="true" /> Try again
            </button>
          }
        />
      )}

      {state.status === 'success' && (
        <div className="table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {state.data.map((u) => {
                const isMe = u.id === me?.userId
                return (
                  <tr key={u.id}>
                    <td>
                      {u.fullName}
                      {isMe && <span className="users-table__you">(you)</span>}
                    </td>
                    <td className="users-table__email">{u.email}</td>
                    <td>
                      {/* An Admin cannot change their own role (the API refuses it too) */}
                      <select
                        className="role-select"
                        value={u.roles[0] ?? ''}
                        disabled={isMe || savingId === u.id}
                        aria-label={`Role of ${u.fullName}`}
                        title={isMe ? 'You cannot change your own role' : undefined}
                        onChange={(e) => changeRole(u, e.target.value as Role)}
                      >
                        {u.roles.length === 0 && <option value="">No role</option>}
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="users-table__date" title={formatDateTime(u.createdAt)}>
                      {formatDate(u.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
