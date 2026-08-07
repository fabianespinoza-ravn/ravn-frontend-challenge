import { RouterProvider } from 'react-router-dom'
import { AppErrorBoundary } from '@/app/providers/AppErrorBoundary'
import { ApolloAppProvider } from '@/app/providers/ApolloAppProvider'
import { router } from '@/app/router/router'

export function App() {
  return (
    <AppErrorBoundary>
      <ApolloAppProvider>
        <RouterProvider router={router} />
      </ApolloAppProvider>
    </AppErrorBoundary>
  )
}
