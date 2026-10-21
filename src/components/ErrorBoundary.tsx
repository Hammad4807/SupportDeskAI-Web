import { Component, type ErrorInfo, type ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import StateMessage from './StateMessage.tsx'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

// Frontend "global exception handler": if any page throws while rendering,
// show a friendly message instead of a blank white screen.
// (API errors are handled in the pages; this catches unexpected bugs in React code.)
// React only supports error boundaries as class components.
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Like the API's ExceptionHandlingMiddleware: details go to the log (browser console), not the screen.
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <StateMessage
          icon={<CircleAlert size={32} />}
          title="Something went wrong"
          description="An unexpected error occurred on this page."
          action={
            <a href="/tickets" className="btn btn--default">
              Back to tickets
            </a>
          }
        />
      )
    }

    return this.props.children
  }
}
