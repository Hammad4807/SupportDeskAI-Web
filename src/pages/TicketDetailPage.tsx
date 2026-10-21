import { Link, useParams } from 'react-router'
import { CircleAlert, RefreshCw, SearchX } from 'lucide-react'
import { getTicket } from '../api/tickets.ts'
import { useAsync } from '../hooks/useAsync.ts'
import StatusLozenge from '../components/StatusLozenge.tsx'
import PriorityIcon from '../components/PriorityIcon.tsx'
import StateMessage from '../components/StateMessage.tsx'
import { isValidTicketId, ticketKey } from '../utils/ticketMeta.ts'
import { formatDateTime, formatRelative } from '../utils/format.ts'
import './TicketDetailPage.css'

// Jira-style issue view for one ticket (FR-03). Read-only in this step.
export default function TicketDetailPage() {
  const { id } = useParams()
  const validId = isValidTicketId(id)
  const { state, retry } = useAsync((signal) => getTicket(id ?? '', signal), [id])

  // An id that is not a UUID would never match the API route, so treat it as not found.
  const notFound = !validId || (state.status === 'error' && state.error.status === 404)

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span>Projects</span>
        <span className="breadcrumbs__sep">/</span>
        <Link to="/tickets">SupportDesk</Link>
        <span className="breadcrumbs__sep">/</span>
        <span>{validId ? ticketKey(id) : 'Unknown'}</span>
      </nav>

      {notFound ? (
        <StateMessage
          icon={<SearchX size={32} />}
          title="Ticket not found"
          description="It may have been deleted, or the link is wrong."
          action={
            <Link to="/tickets" className="btn btn--default">
              Back to tickets
            </Link>
          }
        />
      ) : state.status === 'loading' ? (
        <div className="issue" aria-busy="true">
          <div className="issue__main">
            <span className="skeleton" style={{ display: 'block', height: 28, width: '60%', marginBottom: 24 }} />
            <span className="skeleton" style={{ display: 'block', height: 14, width: '90%', marginBottom: 8 }} />
            <span className="skeleton" style={{ display: 'block', height: 14, width: '75%' }} />
          </div>
        </div>
      ) : state.status === 'error' ? (
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
      ) : (
        <div className="issue">
          <div className="issue__main">
            <h1 className="issue__title">{state.data.title}</h1>

            <section className="issue__section">
              <h2 className="issue__section-title">Description</h2>
              <p className="issue__description">{state.data.description}</p>
            </section>
          </div>

          <aside className="issue__side">
            <div className="issue__status">
              <StatusLozenge status={state.data.status} />
            </div>

            <div className="details-panel">
              <h2 className="details-panel__heading">Details</h2>
              <dl className="details-panel__list">
                <dt>Priority</dt>
                <dd>
                  <PriorityIcon priority={state.data.priority} />
                </dd>
              </dl>
            </div>

            <div className="issue__dates">
              <div title={formatDateTime(state.data.createdAt)}>Created {formatRelative(state.data.createdAt)}</div>
              <div title={formatDateTime(state.data.updatedAt)}>
                {state.data.updatedAt ? `Updated ${formatRelative(state.data.updatedAt)}` : 'Not updated yet'}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
