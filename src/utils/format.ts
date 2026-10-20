const dateTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })
const relativeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

// API dates are UTC ("...Z"); the browser shows them in the user's local time.
export function formatDateTime(iso: string | null) {
  return iso ? dateTimeFormat.format(new Date(iso)) : '—'
}

export function formatDate(iso: string | null) {
  return iso ? dateFormat.format(new Date(iso)) : '—'
}

// "5 minutes ago", "yesterday", ...
export function formatRelative(iso: string | null) {
  if (!iso) return '—'
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}
