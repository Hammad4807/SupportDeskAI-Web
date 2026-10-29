import type { AuthUser, Role } from '../types/auth.ts'
import type { Ticket, TicketStatus } from '../types/ticket.ts'

// What each role may do in the UI, in ONE place (the frontend copy of the backend's Policies.cs and
// TicketService rules). Hiding a button is only for a clean UI: the API still checks every request.

const hasRole = (user: AuthUser | null, ...roles: Role[]) => !!user && user.roles.some((r) => roles.includes(r))

// Policies.StaffOrAdmin: all tickets, AI, dashboard
export const isStaffOrAdmin = (user: AuthUser | null) => hasRole(user, 'Staff', 'Admin')

// Policies.AdminOnly: user management
export const isAdmin = (user: AuthUser | null) => hasRole(user, 'Admin')

export const canSeeDashboard = isStaffOrAdmin
export const canUseAi = isStaffOrAdmin
export const canManageUsers = isAdmin
export const canChangePriority = isStaffOrAdmin

// Customer: only their own ticket, and only while it is Open (TicketService.UpdateAsync)
export const canEditTicket = (user: AuthUser | null, ticket: Ticket) =>
  isStaffOrAdmin(user) || (ticket.createdByUserId === user?.userId && ticket.status === 0)

// The statuses this user may pick for the ticket. The current one is always included so the
// dropdown can show it. Customer: may only close their own ticket (TicketService.UpdateStatusAsync).
export function allowedStatuses(user: AuthUser | null, ticket: Ticket): TicketStatus[] {
  if (isStaffOrAdmin(user)) return [0, 1, 2, 3]
  return ticket.status === 3 ? [3] : [ticket.status, 3]
}

// Where to go after login: the support team starts on the dashboard, a Customer on their tickets.
export const homePath = (user: AuthUser | null) => (canSeeDashboard(user) ? '/dashboard' : '/tickets')
