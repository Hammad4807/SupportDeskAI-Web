import { apiRequest } from './client.ts'
import type { AuthUser, LoginRequest, RegisterRequest } from '../types/auth.ts'

// POST /api/auth/register - the new account is always a Customer
export function register(request: RegisterRequest) {
  return apiRequest<AuthUser>('/api/auth/register', { method: 'POST', body: request })
}

// POST /api/auth/login - returns our JWT and the user
export function login(request: LoginRequest) {
  return apiRequest<AuthUser>('/api/auth/login', { method: 'POST', body: request })
}

// GET /api/auth/me - who the saved token belongs to (used after a page refresh or Google login)
export function getMe(signal?: AbortSignal) {
  return apiRequest<AuthUser>('/api/auth/me', { signal })
}

// POST /api/auth/set-password - a Google user adds a password (204, no body)
export function setPassword(password: string) {
  return apiRequest<null>('/api/auth/set-password', { method: 'POST', body: { password } })
}
