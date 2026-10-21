// Small wrapper around fetch that talks to the SupportDesk AI API.
// The API returns errors as "ProblemDetails" JSON: { title, detail, status, errors, traceId }.

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5249'

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
  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError(0, 'Cannot reach the server', `Make sure the API is running at ${BASE_URL}.`)
  }

  const isJson = response.headers.get('content-type')?.includes('json')
  const data: unknown = isJson ? await response.json() : null

  if (!response.ok) {
    const problem = (data ?? {}) as ProblemDetails
    throw new ApiError(
      response.status,
      problem.title ?? `Request failed (${response.status})`,
      problem.detail,
      problem.errors,
      problem.traceId,
    )
  }

  return data as T
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  return new ApiError(-1, 'Something went wrong', error instanceof Error ? error.message : undefined)
}
