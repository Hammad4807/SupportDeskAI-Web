import { Link } from 'react-router'
import { Plus } from 'lucide-react'

interface TopNavProps {
  onCreate: () => void
}

export default function TopNav({ onCreate }: TopNavProps) {
  return (
    <header className="top-nav">
      <Link to="/dashboard" className="top-nav__logo">
        <span className="top-nav__logo-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="24" height="24">
            <rect width="32" height="32" rx="6" fill="currentColor" />
            <path d="M9 11h14M9 16h14M9 21h9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </span>
        <span className="top-nav__logo-text">SupportDesk AI</span>
      </Link>

      <button type="button" className="btn btn--primary" onClick={onCreate}>
        <Plus size={16} aria-hidden="true" />
        Create
      </button>
    </header>
  )
}
