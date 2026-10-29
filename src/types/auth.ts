// Shapes of the login and user JSON exchanged with the API (mirror the C# DTOs).

// Same names as the backend Roles constants.
export type Role = 'Customer' | 'Staff' | 'Admin'

export const ROLES: Role[] = ['Customer', 'Staff', 'Admin']

// AuthResponse DTO: returned by register, login and GET /api/auth/me
export interface AuthUser {
  token: string // empty for GET /api/auth/me (we already have it)
  userId: string
  email: string
  fullName: string
  roles: Role[]
  hasPassword: boolean // false for Google-only accounts
}

// RegisterRequest DTO
export interface RegisterRequest {
  fullName: string
  email: string
  password: string
}

// LoginRequest DTO
export interface LoginRequest {
  email: string
  password: string
}

// UserResponse DTO (GET /api/users, Admin only)
export interface UserSummary {
  id: string
  email: string
  fullName: string
  roles: Role[]
  createdAt: string
}
