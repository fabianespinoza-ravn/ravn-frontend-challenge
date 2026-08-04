import { Component, type ErrorInfo, type ReactNode } from 'react'

type AppErrorBoundaryProps = {
  children: ReactNode
}

type AppErrorBoundaryState = {
  hasError: boolean
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false,
  }

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled application error', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false })
  }

  private handleReturnToDashboard = () => {
    window.location.assign('/dashboard')
  }

  public render() {
    if (this.state.hasError) {
      return (
        <main>
          <h1>Something went wrong</h1>
          <p>Please try again or return to the dashboard.</p>
          <button type="button" onClick={this.handleRetry}>
            Try again
          </button>
          <button type="button" onClick={this.handleReturnToDashboard}>
            Back to dashboard
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
