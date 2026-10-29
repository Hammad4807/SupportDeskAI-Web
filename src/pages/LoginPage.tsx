import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router'
import { login } from '../api/auth.ts'
import { ApiError } from '../api/client.ts'
import { useAuth } from '../hooks/useAuth.ts'
import { homePath } from '../auth/permissions.ts'
import AuthCardLogo from '../components/AuthCardLogo.tsx'
import GoogleButton from '../components/GoogleButton.tsx'
import './AuthPages.css'

export default function LoginPage() {
  const { status, user, sessionExpired, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // The API sends Google errors back as /login?error=...
  const [error, setError] = useState<string | null>(searchParams.get('error'))
  const [isSubmitting, setSubmitting] = useState(false)

  // The page the user wanted before being sent to login (set by RequireAuth)
  const from = (location.state as { from?: string } | null)?.from

  // Already logged in (e.g. opened /login in a new tab)
  if (status === 'authenticated' && user) return <Navigate to={from ?? homePath(user)} replace />

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }

    setSubmitting(true)
    try {
      const signedIn = await login({ email: email.trim(), password })
      signIn(signedIn)
      navigate(from ?? homePath(signedIn), { replace: true })
    } catch (err) {
      // 401: wrong email/password or locked account; the API's message says which
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <AuthCardLogo />
        <h1 className="auth-card__title">Log in to continue</h1>

        {sessionExpired && !error && (
          <div className="banner banner--info" role="status">
            Your session has expired. Please log in again.
          </div>
        )}
        {error && (
          <div className="banner banner--error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email" className="field__label">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="login-password" className="field__label">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="auth-card__divider">or</div>
        <GoogleButton />

        <p className="auth-card__footer">
          No account yet? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
