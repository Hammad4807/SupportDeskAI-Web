import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client.ts'
import { DESCRIPTION_MAX, TITLE_MAX } from '../utils/ticketMeta.ts'
import { validateTicketFields, type TicketFieldErrors } from '../utils/ticketValidation.ts'

interface EditTicketFormProps {
  initialTitle: string
  initialDescription: string
  onSave: (title: string, description: string) => Promise<void>
  onCancel: () => void
}

// Inline editor for the ticket title and description (FR-04), shown on the ticket page.
export default function EditTicketForm({ initialTitle, initialDescription, onSave, onCancel }: EditTicketFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [errors, setErrors] = useState<TicketFieldErrors>({})
  const [submitError, setSubmitError] = useState<{ message: string; traceId?: string } | null>(null)
  const [isSaving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)

    const clientErrors = validateTicketFields(title, description)
    setErrors(clientErrors)
    if (clientErrors.title || clientErrors.description) return

    setSaving(true)
    try {
      await onSave(title.trim(), description.trim())
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
      setSaving(false)
    }
  }

  return (
    <form className="edit-form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="banner banner--error" role="alert">
          {submitError.message}
          {submitError.traceId && <div className="banner__trace">Error ID: {submitError.traceId}</div>}
        </div>
      )}

      <div className="field">
        <label htmlFor="edit-title" className="field__label">
          Title <span className="required">*</span>
        </label>
        <input
          id="edit-title"
          className={`input${errors.title ? ' input--invalid' : ''}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX}
          aria-invalid={!!errors.title}
          autoFocus
        />
        {errors.title && <p className="field__error">{errors.title}</p>}
      </div>

      <div className="field">
        <label htmlFor="edit-description" className="field__label">
          Description <span className="required">*</span>
        </label>
        <textarea
          id="edit-description"
          className={`input textarea${errors.description ? ' input--invalid' : ''}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={DESCRIPTION_MAX}
          rows={8}
          aria-invalid={!!errors.description}
        />
        <div className="field__meta">
          {errors.description ? <p className="field__error">{errors.description}</p> : <span />}
          <span className="field__counter">
            {description.length} / {DESCRIPTION_MAX}
          </span>
        </div>
      </div>

      <div className="edit-form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="btn btn--subtle" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
      </div>
    </form>
  )
}
