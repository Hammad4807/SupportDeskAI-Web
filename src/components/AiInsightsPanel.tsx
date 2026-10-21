import { useState } from 'react'
import { LoaderCircle, Sparkles } from 'lucide-react'
import { analyzeTicket, getTicket } from '../api/tickets.ts'
import { toApiError, type ApiError } from '../api/client.ts'
import type { Ticket } from '../types/ticket.ts'
import './AiInsightsPanel.css'

interface AiInsightsPanelProps {
  ticket: Ticket
  onTicketUpdated: (ticket: Ticket) => void
}

// "AI insights" section on the ticket page (FR-06).
// The analysis is validated and saved by the API, so after it succeeds we reload the ticket
// to show the new priority and category everywhere on the page.
export default function AiInsightsPanel({ ticket, onTicketUpdated }: AiInsightsPanelProps) {
  const [isAnalyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [provider, setProvider] = useState<string | null>(null) // known after an analysis in this visit

  const analyze = async () => {
    setAnalyzing(true)
    setError(null)
    try {
      const result = await analyzeTicket(ticket.id)
      setProvider(result.provider)
      onTicketUpdated(await getTicket(ticket.id))
    } catch (err) {
      // 502 invalid AI output / provider error, 503 not configured, 504 timeout: shown inline, never crash
      setError(toApiError(err))
    } finally {
      setAnalyzing(false)
    }
  }

  const hasInsights = !!ticket.aiSummary
  // Saved mock results start with [MOCK], so they stay recognisable after a reload.
  const shownProvider = provider ?? (ticket.aiSummary?.startsWith('[MOCK]') ? 'Mock' : null)

  return (
    <section className="ai-panel" aria-labelledby="ai-panel-heading">
      <header className="ai-panel__header">
        <h2 id="ai-panel-heading" className="ai-panel__title">
          <Sparkles size={16} aria-hidden="true" /> AI insights
          {shownProvider && <ProviderBadge provider={shownProvider} />}
        </h2>
        <button type="button" className="btn btn--default" onClick={analyze} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <LoaderCircle size={16} className="spin" aria-hidden="true" /> Analyzing…
            </>
          ) : hasInsights ? (
            'Re-analyze'
          ) : (
            'Analyze with AI'
          )}
        </button>
      </header>

      {error && (
        <div className="banner banner--error" role="alert">
          <strong>{error.title}</strong> {error.message !== error.title && error.message}
          {error.traceId && <div className="banner__trace">Error ID: {error.traceId}</div>}
        </div>
      )}

      {hasInsights ? (
        <dl className="ai-panel__grid">
          <div>
            <dt>Category</dt>
            <dd>{ticket.category}</dd>
          </div>
          <div>
            <dt>Sentiment</dt>
            <dd>{ticket.sentiment}</dd>
          </div>
          <div className="ai-panel__wide">
            <dt>Summary</dt>
            <dd>{ticket.aiSummary}</dd>
          </div>
          <div className="ai-panel__wide">
            <dt>Suggested action</dt>
            <dd>{ticket.suggestedAction}</dd>
          </div>
        </dl>
      ) : (
        !error && (
          <p className="ai-panel__empty">
            Let AI suggest a category, priority and next step for this ticket. Suggestions are checked before they are saved.
          </p>
        )
      )}
    </section>
  )
}

// Small label showing which AI produced the result. The mock is clearly marked.
export function ProviderBadge({ provider }: { provider: string }) {
  const isMock = provider === 'Mock'
  return (
    <span className={`provider-badge${isMock ? ' provider-badge--mock' : ''}`} title={isMock ? 'Fake AI used for development' : 'Real AI provider'}>
      {isMock ? 'Mock AI' : provider}
    </span>
  )
}
