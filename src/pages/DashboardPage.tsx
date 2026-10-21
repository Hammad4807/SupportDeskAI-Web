import { Link } from 'react-router'
import { CircleAlert, RefreshCw } from 'lucide-react'
import { getDashboardSummary } from '../api/dashboard.ts'
import { useAsync } from '../hooks/useAsync.ts'
import { useLayout } from '../hooks/useLayout.ts'
import StateMessage from '../components/StateMessage.tsx'
import type { DashboardSummary } from '../types/ticket.ts'
import './DashboardPage.css'

interface Card {
  key: keyof DashboardSummary
  label: string
  hint: string
  tone: 'neutral' | 'info' | 'success' | 'closed' | 'danger' | 'ai'
  to?: string // opens the ticket list with a matching filter
}

// Status/priority numbers match the backend enums (see utils/ticketMeta.ts).
const CARDS: Card[] = [
  { key: 'total', label: 'Total tickets', hint: 'All tickets', tone: 'neutral', to: '/tickets' },
  { key: 'open', label: 'Open', hint: 'Waiting for an agent', tone: 'neutral', to: '/tickets?status=0' },
  { key: 'inProgress', label: 'In progress', hint: 'Being worked on', tone: 'info', to: '/tickets?status=1' },
  { key: 'resolved', label: 'Resolved', hint: 'Fixed, not closed yet', tone: 'success', to: '/tickets?status=2' },
  { key: 'closed', label: 'Closed', hint: 'Finished', tone: 'closed', to: '/tickets?status=3' },
  { key: 'highPriority', label: 'High priority', hint: 'High or Critical', tone: 'danger' },
  { key: 'unanalyzed', label: 'Not analyzed', hint: 'No AI insights yet', tone: 'ai' },
]

// Dashboard summary (FR-08): ticket counts at a glance.
export default function DashboardPage() {
  const { refreshKey } = useLayout()
  const { state, retry } = useAsync((signal) => getDashboardSummary(signal), [refreshKey])

  return (
    <div className="page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <span>Projects</span>
        <span className="breadcrumbs__sep">/</span>
        <span>SupportDesk</span>
      </nav>

      <div className="page__header">
        <h1 className="page__title">Dashboard</h1>
      </div>

      {state.status === 'error' ? (
        <StateMessage
          icon={<CircleAlert size={32} />}
          title={state.error.title}
          description={state.error.message}
          traceId={state.error.traceId}
          action={
            <button type="button" className="btn btn--default" onClick={retry}>
              <RefreshCw size={16} aria-hidden="true" /> Try again
            </button>
          }
        />
      ) : (
        <div className="summary-grid" aria-busy={state.status === 'loading'}>
          {CARDS.map((card) => {
            const content = (
              <>
                <span className="summary-card__label">{card.label}</span>
                <span className="summary-card__value">
                  {state.status === 'success' ? state.data[card.key] : <span className="skeleton summary-card__skeleton" />}
                </span>
                <span className="summary-card__hint">{card.hint}</span>
              </>
            )

            return card.to ? (
              <Link key={card.key} to={card.to} className={`summary-card summary-card--${card.tone} summary-card--link`}>
                {content}
              </Link>
            ) : (
              <div key={card.key} className={`summary-card summary-card--${card.tone}`}>
                {content}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
