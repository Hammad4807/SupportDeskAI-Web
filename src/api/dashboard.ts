import { apiRequest } from './client.ts'
import type { DashboardSummary } from '../types/ticket.ts'

// FR-08: GET /api/dashboard/summary
export function getDashboardSummary(signal?: AbortSignal) {
  return apiRequest<DashboardSummary>('/api/dashboard/summary', { signal })
}
