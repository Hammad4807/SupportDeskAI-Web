import { Link, useNavigate } from 'react-router'
import { CircleAlert, Inbox, Plus, RefreshCw } from 'lucide-react'
import { getTickets } from '../api/tickets.ts'
import { useAsync } from '../hooks/useAsync.ts'
import { useLayout } from '../hooks/useLayout.ts'
import StatusLozenge from '../components/StatusLozenge.tsx'
import PriorityIcon from '../components/PriorityIcon.tsx'
import StateMessage from '../components/StateMessage.tsx'
import { ticketKey } from '../utils/ticketMeta.ts'
import { formatDate, formatDateTime } from '../utils/format.ts'
import './TicketsPage.css'

// Jira "List" view of all tickets (FR-02).
export default function TicketsPage() {
  const { refreshKey, openCreateModal } = useLayout()
  const { state, retry } = useAsync((signal) => getTickets(signal), [refreshKey])
  const navigate = useNavigate()

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span>Projects</span>
        <span className="breadcrumbs__sep">/</span>
        <span>SupportDesk</span>
      </nav>

      <div className="page__header">
        <h1 className="page__title">Tickets</h1>
        {state.status === 'success' && state.data.length > 0 && (
          <span className="page__count">
            {state.data.length} {state.data.length === 1 ? 'ticket' : 'tickets'}
          </span>
        )}
      </div>

      {state.status === 'loading' && <TableSkeleton />}

      {state.status === 'error' && (
        <StateMessage
          icon={<CircleAlert size={32} />}
          title={state.error.title}
          description={state.error.message}
          action={
            <button type="button" className="btn btn--default" onClick={retry}>
              <RefreshCw size={16} aria-hidden="true" /> Try again
            </button>
          }
        />
      )}

      {state.status === 'success' && state.data.length === 0 && (
        <StateMessage
          icon={<Inbox size={32} />}
          title="No tickets yet"
          description="Create the first support ticket to get started."
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
