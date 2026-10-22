// Shapes of the JSON exchanged with the API (mirror the C# DTOs).

// Backend enums are sent as numbers: see utils/ticketMeta.ts for their names.
export type TicketStatus = 0 | 1 | 2 | 3
export type TicketPriority = 0 | 1 | 2 | 3
export type TicketCategory = 0 | 1 | 2 | 3 | 4 | 5 | 6

// TicketResponse DTO
export interface Ticket {
  id: string // UUID, e.g. "3f2b8c1e-4a7d-4c1a-9b2e-0f6d5a1c2b3d"
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  // AI analysis results: null until the ticket has been analyzed
  category: TicketCategory | null
  sentiment: string | null
  aiSummary: string | null
  suggestedAction: string | null
  createdAt: string // ISO date, UTC
  updatedAt: string | null // null until the ticket is modified
}

// CreateTicketRequest DTO
export interface CreateTicketRequest {
  title: string
  description: string
}

// UpdateTicketRequest DTO (PUT /api/tickets/{id})
export interface UpdateTicketRequest {
  title: string
  description: string
  priority: TicketPriority
}

// TicketQueryParameters DTO: optional filters for GET /api/tickets
export interface TicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
}

// "Groq" is the real AI, "Mock" the fake one used without an API key
export type AiProvider = 'Groq' | 'Mock' | string

// TicketAnalysisResponse DTO (POST /api/tickets/{id}/analyze)
export interface TicketAnalysis {
  ticketId: string
  category: TicketCategory
  priority: TicketPriority
  sentiment: string
  summary: string
  suggestedAction: string
  provider: AiProvider
}

// DraftReplyResponse DTO (POST /api/tickets/{id}/draft-reply). Never saved, never sent.
export interface DraftReply {
  ticketId: string
  draft: string
  provider: AiProvider
  isSent: boolean // always false
  notice: string
  generatedAt: string
}

// DashboardSummaryResponse DTO (GET /api/dashboard/summary)
export interface DashboardSummary {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  highPriority: number
  unanalyzed: number
}
