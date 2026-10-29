import { createContext } from 'react'
import type { AuthUser } from '../types/auth.ts'

// "loading" = we have a saved token and are asking the API who it belongs to (page refresh).
export type AuthStatus = 'loading' | 'anonymous' | 'authenticated'

export interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  sessionExpired: boolean // true after the API rejected the token, so the login page can explain why
  signIn: (user: AuthUser) => void // after login/register: saves the token and the user
  signInWithToken: (token: string) => Promise<void> // after Google: only a token, the user is loaded from /me
  signOut: () => void
  refreshUser: () => Promise<void> // e.g. after setting a password
}

// The value is provided by AuthProvider; read it with the useAuth() hook.
export const AuthContext = createContext<AuthContextValue | null>(null)
