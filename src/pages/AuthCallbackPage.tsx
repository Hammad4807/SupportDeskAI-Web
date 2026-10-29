import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.ts'
import { homePath } from '../auth/permissions.ts'
import './AuthPages.css'

const loginError = (message: string) => `/login?error=${encodeURIComponent(message)}`

// After Google login the API redirects the browser here: /auth/callback#token=eyJ...
// The token is in the "#" part, which browsers never send to any server, so it does not end up in logs.
export default function AuthCallbackPage() {
  const { status, user, signInWithToken } = useAuth()
  const navigate = useNavigate()
  const started = useRef(false) // run once, even if the component renders again
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const token = new URLSearchParams(window.location.hash.slice(1)).get('token')
    if (!token) {
      navigate(loginError('Google login failed. Please try again.'), { replace: true })
      return
    }
    // Saves the token and loads the user (with roles) from GET /api/auth/me
    signInWithToken(token).finally(() => setFinished(true))
  }, [navigate, signInWithToken])

  // replace: true also removes the #token URL from the browser history
  useEffect(() => {
    if (!finished) return
    if (status === 'authenticated' && user) navigate(homePath(user), { replace: true })
    else if (status === 'anonymous') navigate(loginError('Google login failed. Please try again.'), { replace: true })
  }, [finished, status, user, navigate])

  return (
    <div className="auth-loading" aria-busy="true">
      <LoaderCircle size={24} className="spin" aria-hidden="true" /> Signing you in…
    </div>
  )
}
