import { STATUS, STATUS_VALUES } from '../utils/ticketMeta.ts'
import type { TicketStatus } from '../types/ticket.ts'

interface StatusSelectProps {
  status: TicketStatus
  options?: TicketStatus[] // the statuses this user may choose (a Customer: only Closed)
  disabled?: boolean
  onChange: (status: TicketStatus) => void
}

// Jira-style status "transition" button: coloured like the status lozenge.
// A native <select> keeps it keyboard- and screen-reader friendly.
export default function StatusSelect({ status, options = STATUS_VALUES, disabled, onChange }: StatusSelectProps) {
  const tone = STATUS[status]?.tone ?? 'neutral'

  return (
    <select
      className={`status-select status-select--${tone}`}
      value={status}
      disabled={disabled}
      aria-label="Change status"
      onChange={(e) => onChange(Number(e.target.value) as TicketStatus)}
    >
      {options.map((s) => (
        <option key={s} value={s}>
          {STATUS[s].name}
        </option>
      ))}
    </select>
  )
}
