import { useEffect, useState, type DependencyList } from 'react'
import { toApiError, type ApiError } from '../api/client.ts'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError }

// Runs an API call when the component mounts (and whenever deps change).
// The AbortController cancels the request if the user navigates away first.
export function useAsync<T>(load: (signal: AbortSignal) => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })

    load(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ status: 'error', error: toApiError(error) })
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt])

  const retry = () => setAttempt((n) => n + 1)

  // Replaces the loaded data without a new request, e.g. with the ticket returned by a save.
  const setData = (data: T) => setState({ status: 'success', data })

  return { state, retry, setData }
}
