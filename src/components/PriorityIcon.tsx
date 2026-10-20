import { ChevronDown, ChevronUp, ChevronsUp, Equal, type LucideIcon } from 'lucide-react'
import { PRIORITY } from '../utils/ticketMeta.ts'
import type { TicketPriority } from '../types/ticket.ts'

// Jira-style priority arrows.
const ICONS: Record<TicketPriority, { icon: LucideIcon; color: string }> = {
  0: { icon: ChevronDown, color: 'var(--color-priority-low)' },
  1: { icon: Equal, color: 'var(--color-priority-medium)' },
  2: { icon: ChevronUp, color: 'var(--color-priority-high)' },
  3: { icon: ChevronsUp, color: 'var(--color-priority-critical)' },
}

interface PriorityIconProps {
  priority: TicketPriority
  showLabel?: boolean
}

export default function PriorityIcon({ priority, showLabel = true }: PriorityIconProps) {
  const { icon: Icon, color } = ICONS[priority] ?? ICONS[1]
  const label = PRIORITY[priority]?.name ?? 'Unknown'

  return (
    <span className="priority" title={label}>
      <Icon size={16} strokeWidth={2.5} color={color} aria-hidden="true" />
      {showLabel ? <span>{label}</span> : <span className="visually-hidden">{label}</span>}
    </span>
  )
}
