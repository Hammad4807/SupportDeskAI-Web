import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { createTicket } from '../api/tickets.ts'
import { ApiError } from '../api/client.ts'
import { DESCRIPTION_MAX, TITLE_MAX } from '../utils/ticketMeta.ts'
import { validateTicketFields, type TicketFieldErrors } from '../utils/ticketValidation.ts'
import type { Ticket } from '../types/ticket.ts'
import './CreateTicketModal.css'

interface CreateTicketModalProps {
  onClose: () => void
  onCreated: (ticket: Ticket) => void
}

export default function CreateTicketModal({ onClose, onCreated }: CreateTicketModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<TicketFieldErrors>({})
  const [submitError, setSubmitError] = useState<{ message: string; traceId?: string } | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)

  // Close on Escape, like Jira.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, isSubmitting])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)

    const clientErrors = validateTicketFields(title, description)
    setErrors(clientErrors)
    if (clientErrors.title || clientErrors.description) return

    setSubmitting(true)
    try {
      const ticket = await createTicket({ title: title.trim(), description: description.trim() })
      onCreated(ticket)
    } catch (err) {
      // 400 from the API: show its messages next to the matching fields.
      if (err instanceof ApiError && err.status === 400 && (err.fieldErrors.Title || err.fieldErrors.Description)) {
        setErrors({ title: err.fieldErrors.Title?.[0], description: err.fieldErrors.Description?.[0] })
      } else {
        setSubmitError({
          message: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
          traceId: err instanceof ApiError ? err.traceId : undefined,
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="create-ticket-heading">
        <form onSubmit={handleSubmit} noValidate>
          <header className="modal__header">
            <h2 id="create-ticket-heading">Create ticket</h2>
            <button type="button" className="btn btn--icon" onClick={onClose} aria-label="Close" disabled={isSubmitting}>
              <X size={18} />
            </button>
          </header>

          <div className="modal__body">
            <p className="modal__hint">
              Required fields are marked with an asterisk <span className="required">*</span>
            </p>

            {submitError && (
              <div className="banner banner--error" role="alert">
                {submitError.message}
                {submitError.traceId && <div className="banner__trace">Error ID: {submitError.traceId}</div>}
              </div>
            )}

            <div className="field">
              <label htmlFor="ticket-title" className="field__label">
                Title <span className="required">*</span>
              </label>
              <input
                id="ticket-title"
                className={`input${errors.title ? ' input--invalid' : ''}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={TITLE_MAX}
                placeholder="Short summary of the problem"
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? 'ticket-title-error' : undefined}
                autoFocus
              />
              {errors.title && (
                <p id="ticket-title-error" className="field__error">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="field">
              <label htmlFor="ticket-description" className="field__label">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="ticket-description"
                className={`input textarea${errors.description ? ' input--invalid' : ''}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={DESCRIPTION_MAX}
                rows={7}
                placeholder="What happened? What did the customer expect?"
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'ticket-description-error' : undefined}
              />
              <div className="field__meta">
                {errors.description ? (
                  <p id="ticket-description-error" className="field__error">
                    {errors.description}
                  </p>
                ) : (
                  <span />
                )}
                <span className="field__counter">
                  {description.length} / {DESCRIPTION_MAX}
                </span>
              </div>
            </div>
          </div>

          <footer className="modal__footer">
            <button type="button" className="btn btn--subtle" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
