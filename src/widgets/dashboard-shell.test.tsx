import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppHeader } from './app-header/AppHeader'
import { AppSidebar } from './app-sidebar/AppSidebar'
import sidebarStyles from './app-sidebar/AppSidebar.module.css'
import { TaskToolbar } from './task-toolbar/TaskToolbar'

afterEach(cleanup)

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
    expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Project' })).toBeInTheDocument()
    expect(screen.getByRole('navigation').textContent).toContain('DashboardAdd ProjectMy Tasks')
  })

  it('keeps Add Project as the only visual active item while its composition is open', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppSidebar isAddProjectOpen />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveClass(sidebarStyles.isActive)
    expect(screen.getByRole('button', { name: 'Add Project' })).toHaveClass(sidebarStyles.isActive)
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

  it('renders the Android navigation drawer controls without an Add Project action', () => {
    const onRequestClose = vi.fn()
    const onNavigate = vi.fn()
    const onRequestOpen = vi.fn()

    render(
      <MemoryRouter>
        <AppSidebar
          isAndroid
          isDrawerOpen
          onNavigate={onNavigate}
          onRequestClose={onRequestClose}
          onRequestOpen={onRequestOpen}
        />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText('Android navigation drawer')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add Project' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Dashboard' }))

    expect(onNavigate).toHaveBeenCalledOnce()
    expect(onRequestClose).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Close navigation' }))

    expect(onRequestClose).toHaveBeenCalledOnce()

    fireEvent.touchStart(screen.getByTestId('android-drawer-swipe-area'), {
      touches: [{ clientX: 8 }],
    })
    fireEvent.touchEnd(screen.getByTestId('android-drawer-swipe-area'), {
      changedTouches: [{ clientX: 72 }],
    })

    expect(onRequestOpen).toHaveBeenCalledOnce()
  })

  it('renders the Android header with the profile on the left and icon-only search', () => {
    render(
      <MemoryRouter>
        <AppHeader isAndroid />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Open settings' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search tasks' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View notifications' })).toBeInTheDocument()
  })

  it('renders static board view controls and the add-task action', () => {
    render(<TaskToolbar />)

    expect(screen.getByRole('button', { name: 'Task view' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dashboard view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Add task' })).toBeInTheDocument()
  })
})
