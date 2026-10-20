import { useEffect } from 'react'
import { Link } from 'react-router'
import { CircleCheck, X } from 'lucide-react'
import { ticketKey } from '../utils/ticketMeta.ts'
import type { Ticket } from '../types/ticket.ts'

interface FlagProps {
  ticket: Ticket
  onDismiss: () => void
}

// Jira "flag": a small success notification in the bottom-left corner.
export default function Flag({ ticket, onDismiss }: FlagProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 6000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="flag" role="status">
      <CircleCheck size={20} className="flag__icon" aria-hidden="true" />
      <div className="flag__body">
        <div className="flag__title">{ticketKey(ticket.id)} has been created</div>
        <Link to={`/tickets/${ticket.id}`} className="flag__link" onClick={onDismiss}>
          View ticket
        </Link>
      </div>
      <button type="button" className="btn btn--icon" onClick={onDismiss} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  )
}
