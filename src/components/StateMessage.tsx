import type { ReactNode } from 'react'

interface StateMessageProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

// Centered message used for empty, error and not-found states.
export default function StateMessage({ icon, title, description, action }: StateMessageProps) {
  return (
    <div className="state-message">
      {icon && <div className="state-message__icon">{icon}</div>}
      <h2 className="state-message__title">{title}</h2>
      {description && <p className="state-message__description">{description}</p>}
      {action && <div className="state-message__action">{action}</div>}
    </div>
  )
}
