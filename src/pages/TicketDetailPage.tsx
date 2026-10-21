import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { CircleAlert, Pencil, RefreshCw, SearchX } from 'lucide-react'
import { getTicket, updateTicket, updateTicketStatus } from '../api/tickets.ts'
import { toApiError, type ApiError } from '../api/client.ts'
import { useAsync } from '../hooks/useAsync.ts'
import PriorityIcon from '../components/PriorityIcon.tsx'
import StateMessage from '../components/StateMessage.tsx'
import StatusSelect from '../components/StatusSelect.tsx'
import EditTicketForm from '../components/EditTicketForm.tsx'
import { isValidTicketId, PRIORITY, PRIORITY_VALUES, ticketKey } from '../utils/ticketMeta.ts'
import { formatDateTime, formatRelative } from '../utils/format.ts'
import type { Ticket, TicketPriority, TicketStatus } from '../types/ticket.ts'
import './TicketDetailPage.css'

// Jira-style issue view for one ticket (FR-03), with editing (FR-04) and status changes (FR-05).
export default function TicketDetailPage() {
  const { id } = useParams()
  const validId = isValidTicketId(id)
  const { state, retry, setData } = useAsync((signal) => getTicket(id ?? '', signal), [id])

  const [isEditing, setEditing] = useState(false)
  const [isSaving, setSaving] = useState(false) // status or priority change in progress
  const [actionError, setActionError] = useState<ApiError | null>(null)

  // An id that is not a UUID would never match the API route, so treat it as not found.
  const notFound = !validId || (state.status === 'error' && state.error.status === 404)

  // Runs a save and shows the updated ticket, or an error banner if it fails.
  const runSave = async (save: () => Promise<Ticket>) => {
    setSaving(true)
    setActionError(null)
    try {
      setData(await save())
    } catch (err) {
      setActionError(toApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = (ticket: Ticket, status: TicketStatus) =>
    runSave(() => updateTicketStatus(ticket.id, status))

  // PUT needs all editable fields, so send the current title/description with the new priority.
  const changePriority = (ticket: Ticket, priority: TicketPriority) =>
    runSave(() => updateTicket(ticket.id, { title: ticket.title, description: ticket.description, priority }))

  // Errors are thrown back to EditTicketForm, which shows them next to the fields.
  const saveDetails = async (ticket: Ticket, title: string, description: string) => {
    const updated = await updateTicket(ticket.id, { title, description, priority: ticket.priority })
    setData(updated)
    setEditing(false)
  }

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
            {actionError && (
              <div className="banner banner--error" role="alert">
                <strong>{actionError.title}</strong> {actionError.message !== actionError.title && actionError.message}
                {actionError.traceId && <div className="banner__trace">Error ID: {actionError.traceId}</div>}
              </div>
            )}

            {isEditing ? (
              <EditTicketForm
                initialTitle={state.data.title}
                initialDescription={state.data.description}
                onSave={(title, description) => saveDetails(state.data, title, description)}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <>
                <div className="issue__title-row">
                  <h1 className="issue__title">{state.data.title}</h1>
                  <button type="button" className="btn btn--default" onClick={() => setEditing(true)}>
                    <Pencil size={14} aria-hidden="true" /> Edit
                  </button>
                </div>

                <section className="issue__section">
                  <h2 className="issue__section-title">Description</h2>
                  <p className="issue__description">{state.data.description}</p>
                </section>
              </>
            )}
          </div>

          <aside className="issue__side">
            <div className="issue__status">
              <StatusSelect
                status={state.data.status}
                disabled={isSaving}
                onChange={(status) => changeStatus(state.data, status)}
              />
            </div>

            <div className="details-panel">
              <h2 className="details-panel__heading">Details</h2>
              <dl className="details-panel__list">
                <dt>Priority</dt>
                <dd className="details-panel__priority">
                  <PriorityIcon priority={state.data.priority} showLabel={false} />
                  <select
                    className="details-select"
                    value={state.data.priority}
                    disabled={isSaving}
                    aria-label="Change priority"
                    onChange={(e) => changePriority(state.data, Number(e.target.value) as TicketPriority)}
                  >
                    {PRIORITY_VALUES.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY[p].name}
                      </option>
                    ))}
                  </select>
                </dd>

                <dt>Category</dt>
                <dd>{state.data.category ?? <span className="details-panel__empty">None</span>}</dd>

                <dt>Sentiment</dt>
                <dd>{state.data.sentiment ?? <span className="details-panel__empty">None</span>}</dd>
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
