import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

export function RouteErrorPage() {
  const error = useRouteError()
  const errorMessage = getErrorMessage(error)

  const handleRetry = () => {
    window.location.reload()
  }

  const handleReturnToDashboard = () => {
    window.location.assign('/dashboard')
  }

  return (
    <main>
      <h1>Something went wrong while loading this page</h1>
      <p>{errorMessage}</p>
      <button type="button" onClick={handleRetry}>
        Try again
      </button>
      <button type="button" onClick={handleReturnToDashboard}>
        Back to dashboard
      </button>
    </main>
  )
}

function getErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return error.statusText || 'The requested page could not be loaded.'
  }

  return 'Please try again or return to the dashboard.'
}
