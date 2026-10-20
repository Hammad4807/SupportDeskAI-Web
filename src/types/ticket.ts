// Shapes of the JSON exchanged with the API (mirror the C# DTOs).

// Backend enums are sent as numbers: see utils/ticketMeta.ts for their names.
export type TicketStatus = 0 | 1 | 2 | 3
export type TicketPriority = 0 | 1 | 2 | 3

// TicketResponse DTO
export interface Ticket {
  id: string // UUID, e.g. "3f2b8c1e-4a7d-4c1a-9b2e-0f6d5a1c2b3d"
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  createdAt: string // ISO date, UTC
  updatedAt: string | null // null until the ticket is modified
}

// CreateTicketRequest DTO
export interface CreateTicketRequest {
  title: string
  description: string
}
