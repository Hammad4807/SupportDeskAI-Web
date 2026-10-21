import { useRef, useState } from 'react'
import { Check, Copy, LoaderCircle, MessageSquareText, TriangleAlert } from 'lucide-react'
import { draftReply } from '../api/tickets.ts'
import { toApiError, type ApiError } from '../api/client.ts'
import ProviderBadge from './ProviderBadge.tsx'

interface DraftReplyBoxProps {
  ticketId: string
}

// AI draft reply (FR-07). The draft is only shown here for a human to review and edit:
// it is never saved and there is deliberately no "Send" button. The agent copies it
// into their email tool after checking it.
export default function DraftReplyBox({ ticketId }: DraftReplyBoxProps) {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [draft, setDraft] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    setCopied(false)
    try {
      const result = await draftReply(ticketId)
      setDraft(result.draft)
      setProvider(result.provider)
    } catch (err) {
      setError(toApiError(err))
    } finally {
      setLoading(false)
    }
  }

  // Copies the (possibly edited) draft. If the browser blocks the clipboard,
  // select the text so the user can press Ctrl+C themselves.
  const copy = async () => {
    if (draft === null) return
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      textareaRef.current?.focus()
      textareaRef.current?.select()
    }
  }

  return (
    <div className="draft">
      <div className="draft__header">
        <h3 className="draft__title">
          <MessageSquareText size={16} aria-hidden="true" /> Draft reply
          {provider && <ProviderBadge provider={provider} />}
        </h3>
        <button type="button" className="btn btn--default" onClick={generate} disabled={isLoading}>
          {isLoading ? (
            <>
              <LoaderCircle size={16} className="spin" aria-hidden="true" /> Writing…
            </>
          ) : draft === null ? (
            'Draft reply'
          ) : (
            'Regenerate'
          )}
        </button>
      </div>

      {error && (
        <div className="banner banner--error" role="alert">
          <strong>{error.title}</strong> {error.message !== error.title && error.message}
          {error.traceId && <div className="banner__trace">Error ID: {error.traceId}</div>}
        </div>
      )}

      {draft !== null && (
        <>
          <div className="draft__notice" role="note">
            <TriangleAlert size={16} aria-hidden="true" />
            AI-generated draft — review and edit before sending. Nothing has been sent.
          </div>
          <label htmlFor="draft-text" className="visually-hidden">
            Draft reply text
          </label>
          <textarea
            id="draft-text"
            ref={textareaRef}
            className="input textarea draft__text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={10}
          />
          <div className="draft__actions">
            <button type="button" className="btn btn--default" onClick={copy}>
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              {copied ? 'Copied' : 'Copy to clipboard'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
