import { apiRequest } from './client.ts'
import type { Role, UserSummary } from '../types/auth.ts'

// GET /api/users (Admin only)
export function getUsers(signal?: AbortSignal) {
  return apiRequest<UserSummary[]>('/api/users', { signal })
}

// PUT /api/users/{id}/role (Admin only) - replaces the user's role
export function changeUserRole(userId: string, role: Role) {
  return apiRequest<UserSummary>(`/api/users/${userId}/role`, { method: 'PUT', body: { role } })
}
