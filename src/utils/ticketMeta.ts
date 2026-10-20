import type { TicketPriority, TicketStatus } from '../types/ticket.ts'

// The API sends Status/Priority as numbers (0..3), matching the backend enums.
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
