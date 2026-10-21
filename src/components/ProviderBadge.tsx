// Small label showing which AI produced the result. The mock is clearly marked.
export default function ProviderBadge({ provider }: { provider: string }) {
  const isMock = provider === 'Mock'
  return (
    <span className={`provider-badge${isMock ? ' provider-badge--mock' : ''}`} title={isMock ? 'Fake AI used for development' : 'Real AI provider'}>
      {isMock ? 'Mock AI' : provider}
    </span>
  )
}
