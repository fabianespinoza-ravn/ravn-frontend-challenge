import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppHeader } from './app-header/AppHeader'
import { AppSidebar } from './app-sidebar/AppSidebar'
import { TaskToolbar } from './task-toolbar/TaskToolbar'

describe('Dashboard shell', () => {
  it('renders the primary navigation and marks the current route as active', () => {
    render(
      <MemoryRouter initialEntries={['/my-tasks']}>
        <AppSidebar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: 'My Tasks' })).toHaveAttribute('href', '/my-tasks')
    expect(screen.getByRole('link', { name: 'My Tasks' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings')
  })

  it('renders search, notification, and profile controls', () => {
    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )

    expect(screen.getByRole('searchbox', { name: 'Search tasks' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View notifications' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open settings' })).toHaveAttribute('href', '/settings')
    expect(screen.getByRole('img', { name: 'Profile' })).toHaveTextContent('FE')
  })

  it('renders static board view controls and the add-task action', () => {
    render(<TaskToolbar />)

    expect(screen.getByRole('button', { name: 'List view' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Board view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Add task' })).toBeInTheDocument()
  })
})
