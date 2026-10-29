import { useState, type FormEvent } from 'react'
import { setPassword } from '../api/auth.ts'
import { ApiError } from '../api/client.ts'
import { useAuth } from '../hooks/useAuth.ts'
import { validatePassword } from '../utils/authValidation.ts'
import './TicketDetailPage.css' // the "details-panel" box, same look as on the ticket page

// The logged-in user's profile. A Google-only account (no password yet) can add a password here,
// so it can also log in with email + password.
export default function AccountPage() {
  const { user, refreshUser } = useAuth()
  const [password, setPasswordValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!user) return null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const problem = validatePassword(password)
    setError(problem ?? null)
    if (problem) return

    setSaving(true)
    try {
      await setPassword(password)
      setSaved(true)
      setPasswordValue('')
      await refreshUser() // hasPassword is now true, so the form disappears
    } catch (err) {
      setError(err instanceof ApiError ? (err.fieldErrors.Password?.join(' ') ?? err.message) : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span>Account</span>
      </nav>
      <div className="page__header">
        <h1 className="page__title">Your account</h1>
      </div>

      <div className="details-panel">
        <h2 className="details-panel__heading">Profile</h2>
        <dl className="details-panel__list">
          <dt>Name</dt>
          <dd>{user.fullName}</dd>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Role</dt>
          <dd>{user.roles.join(', ')}</dd>
          <dt>Password</dt>
          <dd>{user.hasPassword ? 'Set' : 'Not set (you sign in with Google)'}</dd>
        </dl>
      </div>

      {saved && (
        <div className="banner banner--success" role="status" style={{ marginTop: 16 }}>
          Password set. You can now also log in with your email and password.
        </div>
      )}

      {!user.hasPassword && (
        <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
          <div className="field">
            <label htmlFor="account-password" className="field__label">
              Add a password
            </label>
            <input
              id="account-password"
              type="password"
              className={`input${error ? ' input--invalid' : ''}`}
              value={password}
              onChange={(e) => setPasswordValue(e.target.value)}
              maxLength={100}
              autoComplete="new-password"
              aria-invalid={!!error}
            />
            {error ? (
              <p className="field__error">{error}</p>
            ) : (
              <p className="field__counter">At least 8 characters, with an uppercase letter, a lowercase letter and a digit.</p>
            )}
          </div>
          <button type="submit" className="btn btn--primary" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Set password'}
          </button>
        </form>
      )}
    </div>
  )
}
