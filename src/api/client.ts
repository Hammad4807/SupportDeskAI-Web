import { clearToken, getToken } from '../auth/tokenStorage.ts'

// Small wrapper around fetch that talks to the SupportDesk AI API.
// The API returns errors as "ProblemDetails" JSON: { title, detail, status, errors, traceId }.
// Every request carries the logged-in user's JWT as "Authorization: Bearer <token>".

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5249'

// Google login is a full browser redirect (not fetch): the API sends the browser on to Google.
export const GOOGLE_LOGIN_URL = `${BASE_URL}/api/auth/external-login`

// Fired when the API rejects our token (expired or invalid). AuthProvider listens and logs the user out.
export const SESSION_EXPIRED_EVENT = 'supportdesk:session-expired'

// e.g. { Title: ['Title is required.'] }
export type FieldErrors = Record<string, string[]>

interface ProblemDetails {
  title?: string
  detail?: string
  status?: number
  errors?: FieldErrors
  traceId?: string
}

export class ApiError extends Error {
  status: number // 0 means the server could not be reached
  title: string
  fieldErrors: FieldErrors
  traceId?: string // matches "TraceId" in the API log, for finding this exact request

  constructor(status: number, title: string, detail?: string, fieldErrors?: FieldErrors, traceId?: string) {
    super(detail || title)
    this.name = 'ApiError'
    this.status = status
    this.title = title
    this.fieldErrors = fieldErrors ?? {}
    this.traceId = traceId
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

export async function apiRequest<T>(path: string, { method = 'GET', body, signal }: RequestOptions = {}): Promise<T> {
  const token = getToken()

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError(0, 'Cannot reach the server', `Make sure the API is running at ${BASE_URL}.`)
  }

  const isJson = response.headers.get('content-type')?.includes('json')
  const data: unknown = isJson ? await response.json() : null

  // 401 although we sent a token = the token expired or is no longer valid -> log out.
  // (A 401 without a token is just a failed login, e.g. a wrong password: nothing to clear.)
  if (response.status === 401 && token) {
    clearToken()
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
  }

  if (!response.ok) {
    const problem = (data ?? {}) as ProblemDetails
    throw new ApiError(
      response.status,
      // 401/403 from [Authorize] have no JSON body, so give them readable titles
      problem.title ?? defaultTitle(response.status),
      problem.detail,
      problem.errors,
      problem.traceId,
    )
  }

  return data as T
}

function defaultTitle(status: number) {
  if (status === 401) return 'Please log in again'
  if (status === 403) return 'You do not have permission to do this'
  return `Request failed (${status})`
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  return new ApiError(-1, 'Something went wrong', error instanceof Error ? error.message : undefined)
}
