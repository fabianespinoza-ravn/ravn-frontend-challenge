import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RouteErrorPage } from './RouteErrorPage'

describe('RouteErrorPage', () => {
  it('renders a recovery view when a route fails', async () => {
    const router = createMemoryRouter([
      {
        path: '/',
        element: <div>Route content</div>,
        errorElement: <RouteErrorPage />,
        loader: () => {
          throw new Error('Route failure')
        },
      },
    ])

    render(<RouterProvider router={router} />)

    expect(
      await screen.findByRole('heading', { name: 'Something went wrong while loading this page' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to dashboard' })).toBeInTheDocument()
  })
})
