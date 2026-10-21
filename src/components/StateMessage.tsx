import type { ReactNode } from 'react'

interface StateMessageProps {
  icon?: ReactNode
  title: string
  description?: string
  traceId?: string // shown for server errors, so the user can quote it when reporting a problem
  action?: ReactNode
}

// Centered message used for empty, error and not-found states.
export default function StateMessage({ icon, title, description, traceId, action }: StateMessageProps) {
  return (
    <div className="state-message">
      {icon && <div className="state-message__icon">{icon}</div>}
      <h2 className="state-message__title">{title}</h2>
      {description && <p className="state-message__description">{description}</p>}
      {traceId && <p className="state-message__trace">Error ID: {traceId}</p>}
      {action && <div className="state-message__action">{action}</div>}
    </div>
  )
}
