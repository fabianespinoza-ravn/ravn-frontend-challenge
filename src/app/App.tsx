import { RouterProvider } from 'react-router-dom'
import { AppErrorBoundary } from '@/app/providers/AppErrorBoundary'
import { router } from '@/app/router/router'

export function App() {
  return (
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  )
}
