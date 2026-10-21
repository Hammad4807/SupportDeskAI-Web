import { apiRequest } from './client.ts'
import type {
  CreateTicketRequest,
  DraftReply,
  Ticket,
  TicketAnalysis,
  TicketFilters,
  TicketStatus,
  UpdateTicketRequest,
} from '../types/ticket.ts'

// FR-02: GET /api/tickets?status=&priority=&category= (only the filters that are set)
export function getTickets(filters: TicketFilters = {}, signal?: AbortSignal) {
  const params = new URLSearchParams()
  if (filters.status !== undefined) params.set('status', String(filters.status))
  if (filters.priority !== undefined) params.set('priority', String(filters.priority))
  if (filters.category) params.set('category', filters.category)

  const query = params.toString()
  return apiRequest<Ticket[]>(`/api/tickets${query ? `?${query}` : ''}`, { signal })
}

// FR-03: GET /api/tickets/{id}
export function getTicket(id: string, signal?: AbortSignal) {
  return apiRequest<Ticket>(`/api/tickets/${id}`, { signal })
}

// FR-01: POST /api/tickets
export function createTicket(request: CreateTicketRequest) {
  return apiRequest<Ticket>('/api/tickets', { method: 'POST', body: request })
}

// FR-04: PUT /api/tickets/{id}
export function updateTicket(id: string, request: UpdateTicketRequest) {
  return apiRequest<Ticket>(`/api/tickets/${id}`, { method: 'PUT', body: request })
}

// FR-05: PATCH /api/tickets/{id}/status
export function updateTicketStatus(id: string, status: TicketStatus) {
  return apiRequest<Ticket>(`/api/tickets/${id}/status`, { method: 'PATCH', body: { status } })
}

// FR-06: POST /api/tickets/{id}/analyze (the result is also saved on the ticket)
export function analyzeTicket(id: string) {
  return apiRequest<TicketAnalysis>(`/api/tickets/${id}/analyze`, { method: 'POST' })
}

// FR-07: POST /api/tickets/{id}/draft-reply (only returned for review; never saved or sent)
export function draftReply(id: string) {
  return apiRequest<DraftReply>(`/api/tickets/${id}/draft-reply`, { method: 'POST' })
}
