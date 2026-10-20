import { STATUS } from '../utils/ticketMeta.ts'
import type { TicketStatus } from '../types/ticket.ts'

interface StatusLozengeProps {
  status: TicketStatus
}

// Jira-style coloured status label, e.g. [ IN PROGRESS ].
export default function StatusLozenge({ status }: StatusLozengeProps) {
  const meta = STATUS[status]
  return <span className={`lozenge lozenge--${meta?.tone ?? 'neutral'}`}>{meta?.name ?? 'Unknown'}</span>
}
