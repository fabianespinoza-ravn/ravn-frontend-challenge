import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/shared/ui/button/Button'

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
          <Button type="button" onClick={this.handleRetry}>
            Try again
          </Button>
          <Button type="button" variant="secondary" onClick={this.handleReturnToDashboard}>
            Back to dashboard
          </Button>
        </main>
      )
    }

    return this.props.children
  }
}
