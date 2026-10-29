import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getMe } from '../api/auth.ts'
import { SESSION_EXPIRED_EVENT } from '../api/client.ts'
import { clearToken, getToken, saveToken } from './tokenStorage.ts'
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext.ts'
import type { AuthUser } from '../types/auth.ts'

// Holds "who is logged in" for the whole app.
// On start: no saved token -> anonymous; a saved token -> ask GET /api/auth/me who it belongs to.
// The roles shown in the UI always come from the API, never from decoding the token in the browser.
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() => (getToken() ? 'loading' : 'anonymous'))
  const [user, setUser] = useState<AuthUser | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)

  const signOut = useCallback(() => {
    clearToken()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const loadUser = useCallback(async () => {
    try {
      setUser(await getMe())
      setStatus('authenticated')
    } catch {
      // invalid/expired token (the client already cleared it) or API down: show the login page
      signOut()
    }
  }, [signOut])

  // Page refresh with a saved token: ask the API who it belongs to (status starts as 'loading')
  useEffect(() => {
    if (!getToken()) return
    getMe()
      .then((me) => {
        setUser(me)
        setStatus('authenticated')
      })
      .catch(() => signOut())
  }, [signOut])

  // The API rejected our token during normal use (e.g. it expired after 60 minutes)
  useEffect(() => {
    const onExpired = () => {
      setSessionExpired(true)
      setUser(null)
      setStatus('anonymous')
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      sessionExpired,
      signIn: (signedIn) => {
        saveToken(signedIn.token)
        setUser(signedIn)
        setSessionExpired(false)
        setStatus('authenticated')
      },
      signInWithToken: async (token) => {
        saveToken(token)
        setSessionExpired(false)
        setStatus('loading')
        await loadUser()
      },
      signOut,
      refreshUser: loadUser,
    }),
    [status, user, sessionExpired, signOut, loadUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
