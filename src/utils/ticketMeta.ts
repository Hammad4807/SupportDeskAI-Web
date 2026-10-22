import type { TicketCategory, TicketPriority, TicketStatus } from '../types/ticket.ts'

// The API sends Status/Priority (0..3) and Category (0..6) as numbers, matching the backend enums.
// These maps turn each number into its display name and UI styling.

export type LozengeTone = 'neutral' | 'info' | 'success' | 'closed'

export const STATUS: Record<TicketStatus, { name: string; tone: LozengeTone }> = {
  0: { name: 'Open', tone: 'neutral' },
  1: { name: 'In Progress', tone: 'info' },
  2: { name: 'Resolved', tone: 'success' },
  3: { name: 'Closed', tone: 'closed' },
}

export const PRIORITY: Record<TicketPriority, { name: string }> = {
  0: { name: 'Low' },
  1: { name: 'Medium' },
  2: { name: 'High' },
  3: { name: 'Critical' },
}

// Same order as the backend TicketCategory enum.
export const CATEGORY: Record<TicketCategory, { name: string }> = {
  0: { name: 'Account Access' },
  1: { name: 'Billing' },
  2: { name: 'Technical Issue' },
  3: { name: 'Bug Report' },
  4: { name: 'Feature Request' },
  5: { name: 'General Inquiry' },
  6: { name: 'Other' },
}

export const SENTIMENTS = ['Positive', 'Neutral', 'Negative', 'Frustrated', 'Angry'] as const

// All values, for dropdowns
export const STATUS_VALUES: TicketStatus[] = [0, 1, 2, 3]
export const PRIORITY_VALUES: TicketPriority[] = [0, 1, 2, 3]
export const CATEGORY_VALUES: TicketCategory[] = [0, 1, 2, 3, 4, 5, 6]

// Category name for display, or "—" when the ticket is not analyzed yet
export const categoryName = (category: TicketCategory | null) => (category === null ? '—' : (CATEGORY[category]?.name ?? '—'))

// Jira-style short key for display: first 8 characters of the UUID,
// e.g. "3f2b8c1e-4a7d-..." -> "SD-3F2B8C1E". URLs and API calls use the full id.
export const ticketKey = (id: string) => `SD-${id.slice(0, 8).toUpperCase()}`

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isValidTicketId = (id: string | undefined): id is string => !!id && UUID_PATTERN.test(id)

// Same rules as the backend CreateTicketRequestValidator.
export const TITLE_MIN = 5
export const TITLE_MAX = 200
export const DESCRIPTION_MIN = 10
export const DESCRIPTION_MAX = 4000
