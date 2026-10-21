import { DESCRIPTION_MAX, DESCRIPTION_MIN, TITLE_MAX, TITLE_MIN } from './ticketMeta.ts'

export interface TicketFieldErrors {
  title?: string
  description?: string
  priority?: string
}

// Same rules as the backend validators, so most mistakes are caught before calling the API.
// Used by the Create modal and the Edit form on the ticket page.
export function validateTicketFields(title: string, description: string): TicketFieldErrors {
  const errors: TicketFieldErrors = {}
  const t = title.trim()
  const d = description.trim()

  if (!t) errors.title = 'Title is required.'
  else if (t.length < TITLE_MIN) errors.title = `Title must be at least ${TITLE_MIN} characters.`
  else if (t.length > TITLE_MAX) errors.title = `Title must not exceed ${TITLE_MAX} characters.`

  if (!d) errors.description = 'Description is required.'
  else if (d.length < DESCRIPTION_MIN) errors.description = `Description must be at least ${DESCRIPTION_MIN} characters.`
  else if (d.length > DESCRIPTION_MAX) errors.description = `Description must not exceed ${DESCRIPTION_MAX} characters.`

  return errors
}
