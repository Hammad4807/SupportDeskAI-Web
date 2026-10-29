import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { register } from '../api/auth.ts'
import { ApiError } from '../api/client.ts'
import { useAuth } from '../hooks/useAuth.ts'
import { homePath } from '../auth/permissions.ts'
import { validatePassword } from '../utils/authValidation.ts'
import AuthCardLogo from '../components/AuthCardLogo.tsx'
import GoogleButton from '../components/GoogleButton.tsx'
import './AuthPages.css'

interface RegisterErrors {
  fullName?: string
  email?: string
  password?: string
}

// Public sign-up. The new account is always a Customer; only an Admin can give someone another role.
export default function RegisterPage() {
  const { status, user, signIn } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)

  if (status === 'authenticated' && user) return <Navigate to={homePath(user)} replace />

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)

    // Quick checks in the browser (same rules as the API) to save a round trip
    const clientErrors: RegisterErrors = {
      fullName: fullName.trim() ? undefined : 'Full name is required.',
      email: /^\S+@\S+\.\S+$/.test(email.trim()) ? undefined : 'Enter a valid email address.',
      password: validatePassword(password),
    }
    setErrors(clientErrors)
    if (clientErrors.fullName || clientErrors.email || clientErrors.password) return

    setSubmitting(true)
    try {
      const signedIn = await register({ fullName: fullName.trim(), email: email.trim(), password })
      signIn(signedIn)
      navigate(homePath(signedIn), { replace: true })
    } catch (err) {
      // 400 from the API (e.g. email already used): show its messages next to the matching fields
      if (err instanceof ApiError && err.status === 400 && Object.keys(err.fieldErrors).length > 0) {
        setErrors({
          fullName: err.fieldErrors.FullName?.[0],
          email: err.fieldErrors.Email?.[0],
          password: err.fieldErrors.Password?.join(' '),
        })
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <AuthCardLogo />
        <h1 className="auth-card__title">Create your account</h1>

        {submitError && (
          <div className="banner banner--error" role="alert">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="register-name" className="field__label">
              Full name <span className="required">*</span>
            </label>
            <input
              id="register-name"
              className={`input${errors.fullName ? ' input--invalid' : ''}`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
              autoComplete="name"
              aria-invalid={!!errors.fullName}
              autoFocus
            />
            {errors.fullName && <p className="field__error">{errors.fullName}</p>}
          </div>

          <div className="field">
            <label htmlFor="register-email" className="field__label">
              Email <span className="required">*</span>
            </label>
            <input
              id="register-email"
              type="email"
              className={`input${errors.email ? ' input--invalid' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={256}
              autoComplete="email"
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="field__error">{errors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="register-password" className="field__label">
              Password <span className="required">*</span>
            </label>
            <input
              id="register-password"
              type="password"
              className={`input${errors.password ? ' input--invalid' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={100}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
            />
            {errors.password ? (
              <p className="field__error">{errors.password}</p>
            ) : (
              <p className="field__counter">At least 8 characters, with an uppercase letter, a lowercase letter and a digit.</p>
            )}
          </div>

          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <div className="auth-card__divider">or</div>
        <GoogleButton />

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
