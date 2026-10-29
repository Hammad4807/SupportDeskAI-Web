import { useContext } from 'react'
import { AuthContext } from '../auth/authContext.ts'

// The logged-in user and the sign-in/sign-out functions, from AuthProvider.
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
