// The SupportDesk AI logo at the top of the login and sign-up cards (same mark as the top navigation).
export default function AuthCardLogo() {
  return (
    <div className="auth-card__logo">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="currentColor" />
        <path d="M9 11h14M9 16h14M9 21h9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span>SupportDesk AI</span>
    </div>
  )
}
