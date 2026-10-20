import { apiRequest } from './client.ts'
import type { CreateTicketRequest, Ticket } from '../types/ticket.ts'

// FR-02: GET /api/tickets
export function getTickets(signal?: AbortSignal) {
  return apiRequest<Ticket[]>('/api/tickets', { signal })
}

// FR-03: GET /api/tickets/{id}
export function getTicket(id: string, signal?: AbortSignal) {
  return apiRequest<Ticket>(`/api/tickets/${id}`, { signal })
}

// FR-01: POST /api/tickets
export function createTicket(request: CreateTicketRequest) {
  return apiRequest<Ticket>('/api/tickets', { method: 'POST', body: request })
}
