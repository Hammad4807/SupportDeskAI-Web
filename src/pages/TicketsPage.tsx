import { Link, useNavigate, useSearchParams } from 'react-router'
import { CircleAlert, FilterX, Inbox, Plus, RefreshCw } from 'lucide-react'
import { getTickets } from '../api/tickets.ts'
import { useAsync } from '../hooks/useAsync.ts'
import { useLayout } from '../hooks/useLayout.ts'
import { useAuth } from '../hooks/useAuth.ts'
import { isStaffOrAdmin } from '../auth/permissions.ts'
import StatusLozenge from '../components/StatusLozenge.tsx'
import PriorityIcon from '../components/PriorityIcon.tsx'
import StateMessage from '../components/StateMessage.tsx'
import {
  CATEGORY,
  CATEGORY_VALUES,
  PRIORITY,
  PRIORITY_VALUES,
  STATUS,
  STATUS_VALUES,
  categoryName,
  ticketKey,
} from '../utils/ticketMeta.ts'
import { formatDate, formatDateTime } from '../utils/format.ts'
import type { TicketCategory, TicketFilters, TicketPriority, TicketStatus } from '../types/ticket.ts'
import './TicketsPage.css'

// Reads "?status=0&priority=2&category=1" from the URL. Unknown values are ignored,
// so a link like /tickets?status=0 (from the dashboard) opens the list already filtered.
function readFilters(params: URLSearchParams): TicketFilters {
  const toNumber = (value: string | null, max: number) => {
    const n = Number(value)
    return value !== null && value !== '' && Number.isInteger(n) && n >= 0 && n <= max ? n : undefined
  }
  return {
    status: toNumber(params.get('status'), 3) as TicketStatus | undefined,
    priority: toNumber(params.get('priority'), 3) as TicketPriority | undefined,
    category: toNumber(params.get('category'), 6) as TicketCategory | undefined,
  }
}

// Jira "List" view of the tickets (FR-02), with filters (status, priority, category).
// The API decides which tickets come back: Staff/Admin get all, a Customer only their own.
export default function TicketsPage() {
  const { refreshKey, openCreateModal } = useLayout()
  const { user } = useAuth()
  const isTeam = isStaffOrAdmin(user) // the support team also sees who reported each ticket
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = readFilters(searchParams)
  const hasFilters = filters.status !== undefined || filters.priority !== undefined || filters.category !== undefined

  // The filters live in the URL, so the list reloads whenever the query string changes.
  const { state, retry } = useAsync((signal) => getTickets(filters, signal), [refreshKey, searchParams.toString()])
  const navigate = useNavigate()

  // Sets (or removes, when value is '') one filter in the URL.
  const setFilter = (name: keyof TicketFilters, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === '') next.delete(name)
    else next.set(name, value)
    setSearchParams(next)
  }

  const clearFilters = () => setSearchParams(new URLSearchParams())

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span>Projects</span>
        <span className="breadcrumbs__sep">/</span>
        <span>SupportDesk</span>
      </nav>

      <div className="page__header">
        <h1 className="page__title">{isTeam ? 'Tickets' : 'My tickets'}</h1>
        {state.status === 'success' && state.data.length > 0 && (
          <span className="page__count">
            {state.data.length} {state.data.length === 1 ? 'ticket' : 'tickets'}
          </span>
        )}
      </div>

      {/* Jira-style filter bar */}
      <div className="filter-bar" role="search" aria-label="Filter tickets">
        <label className="filter">
          <span className="filter__label">Status</span>
          <select className="filter__select" value={filters.status ?? ''} onChange={(e) => setFilter('status', e.target.value)}>
            <option value="">All</option>
            {STATUS_VALUES.map((s) => (
              <option key={s} value={s}>
                {STATUS[s].name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter">
          <span className="filter__label">Priority</span>
          <select className="filter__select" value={filters.priority ?? ''} onChange={(e) => setFilter('priority', e.target.value)}>
            <option value="">All</option>
            {PRIORITY_VALUES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY[p].name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter">
          <span className="filter__label">Category</span>
          <select className="filter__select" value={filters.category ?? ''} onChange={(e) => setFilter('category', e.target.value)}>
            <option value="">All</option>
            {CATEGORY_VALUES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY[c].name}
              </option>
            ))}
          </select>
        </label>

        {hasFilters && (
          <button type="button" className="btn btn--subtle" onClick={clearFilters}>
            <FilterX size={16} aria-hidden="true" /> Clear filters
          </button>
        )}
      </div>

      {state.status === 'loading' && <TableSkeleton />}

      {state.status === 'error' && (
        <StateMessage
          icon={<CircleAlert size={32} />}
          title={state.error.title}
          description={state.error.message}
          traceId={state.error.traceId}
          action={
            <button type="button" className="btn btn--default" onClick={retry}>
              <RefreshCw size={16} aria-hidden="true" /> Try again
            </button>
          }
        />
      )}

      {state.status === 'success' && state.data.length === 0 && hasFilters && (
        <StateMessage
          icon={<FilterX size={32} />}
          title="No tickets match these filters"
          description="Try a different status, priority or category."
          action={
            <button type="button" className="btn btn--default" onClick={clearFilters}>
              Clear filters
            </button>
          }
        />
      )}

      {state.status === 'success' && state.data.length === 0 && !hasFilters && (
        <StateMessage
          icon={<Inbox size={32} />}
          title="No tickets yet"
          description={
            isTeam
              ? 'Create the first support ticket to get started.'
              : 'Having a problem? Create a ticket and our support team will get back to you.'
          }
          action={
            <button type="button" className="btn btn--primary" onClick={openCreateModal}>
              <Plus size={16} aria-hidden="true" /> Create ticket
            </button>
          }
        />
      )}

      {state.status === 'success' && state.data.length > 0 && (
        <div className="table-wrap">
          <table className="ticket-table">
            <thead>
              <tr>
                <th className="col-key">Key</th>
                <th>Title</th>
                {isTeam && <th className="col-reporter">Reporter</th>}
                <th className="col-category">Category</th>
                <th className="col-status">Status</th>
                <th className="col-priority">Priority</th>
                <th className="col-date">Created</th>
                <th className="col-date">Updated</th>
              </tr>
            </thead>
            <tbody>
              {state.data.map((ticket) => (
                <tr key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)}>
                  <td className="col-key">
                    <Link to={`/tickets/${ticket.id}`} className="ticket-table__key" onClick={(e) => e.stopPropagation()}>
                      {ticketKey(ticket.id)}
                    </Link>
                  </td>
                  <td className="ticket-table__title">{ticket.title}</td>
                  {isTeam && <td className="col-reporter">{ticket.createdByName ?? '—'}</td>}
                  <td className="col-category">{categoryName(ticket.category)}</td>
                  <td className="col-status">
                    <StatusLozenge status={ticket.status} />
                  </td>
                  <td className="col-priority">
                    <PriorityIcon priority={ticket.priority} />
                  </td>
                  <td className="col-date" title={formatDateTime(ticket.createdAt)}>
                    {formatDate(ticket.createdAt)}
                  </td>
                  <td className="col-date" title={formatDateTime(ticket.updatedAt)}>
                    {formatDate(ticket.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="table-wrap" aria-busy="true" aria-label="Loading tickets">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton-row">
          <span className="skeleton" style={{ width: 48 }} />
          <span className="skeleton" style={{ flex: 1 }} />
          <span className="skeleton" style={{ width: 80 }} />
          <span className="skeleton" style={{ width: 70 }} />
        </div>
      ))}
    </div>
  )
}
