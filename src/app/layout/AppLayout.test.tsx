import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppLayout } from './AppLayout'
import { createGraphqlMocks } from '@/test/mocks/graphql'
import sidebarStyles from '@/widgets/app-sidebar/AppSidebar.module.css'
import { TaskToolbar } from '@/widgets/task-toolbar/TaskToolbar'

const platformMock = vi.hoisted(() => ({ value: 'android' }))

vi.mock('@/shared/lib/platform/getMobilePlatform', () => ({
  getMobilePlatform: () => platformMock.value,
}))

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
}

function resizeTo(width: number) {
  setViewportWidth(width)
  act(() => {
    fireEvent(window, new Event('resize'))
  })
}

function renderLayout(routeElement = <h1>Dashboard</h1>) {
  return render(
    <MockedProvider mocks={createGraphqlMocks()}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={routeElement} />
          </Route>
        </Routes>
      </MemoryRouter>
    </MockedProvider>,
  )
}

afterEach(() => {
  cleanup()
  platformMock.value = 'android'
  setViewportWidth(1024)
})

describe('AppLayout task creation', () => {
  it('opens the full-page composition from the Android floating action button', () => {
    setViewportWidth(390)

    renderLayout()

    fireEvent.click(screen.getByRole('button', { name: 'Add Project' }))

    expect(screen.getByRole('heading', { name: 'Create Task' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the full-page composition from the iOS-style bottom navigation', () => {
    platformMock.value = 'other'
    setViewportWidth(390)

    renderLayout()

    fireEvent.click(screen.getByRole('button', { name: 'Add Project' }))

    expect(screen.getByRole('heading', { name: 'Create Task' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: 'Dashboard' }))

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Create Task' })).not.toBeInTheDocument()
  })

  it('opens the modal at the exact width where the add-task control appears', async () => {
    platformMock.value = 'other'
    setViewportWidth(768)
    const user = userEvent.setup()

    renderLayout(<TaskToolbar />)

    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Create Task' })).not.toBeInTheDocument()
  })

  it('opens an accessible modal from the desktop add-task control', async () => {
    platformMock.value = 'other'
    setViewportWidth(1024)
    const user = userEvent.setup()

    renderLayout(<TaskToolbar />)

    await user.click(screen.getByRole('button', { name: 'Add task' }))

    const dialog = screen.getByRole('dialog')

    expect(dialog).toHaveAccessibleName('Create Task')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByLabelText('Task Title')).toHaveFocus()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass(sidebarStyles.isActive)
  })

  it('keeps the draft when the viewport crosses the modal breakpoint', async () => {
    platformMock.value = 'other'
    setViewportWidth(390)
    const user = userEvent.setup()

    renderLayout()

    fireEvent.click(screen.getByRole('button', { name: 'Add Project' }))
    await user.type(screen.getByLabelText('Task Title'), 'Draft task')
    await user.click(screen.getByRole('button', { name: 'Label' }))
    await user.click(screen.getByRole('button', { name: 'React' }))
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    resizeTo(1024)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Task Title')).toHaveValue('Draft task')
    expect(screen.getByRole('button', { name: 'Label: React' })).toHaveTextContent('React')
    expect(screen.getByLabelText('Task Title')).toHaveFocus()
  })

  it('returns focus to the draft when the container swaps back to the full page', async () => {
    platformMock.value = 'other'
    setViewportWidth(1024)
    const user = userEvent.setup()

    renderLayout(<TaskToolbar />)

    await user.click(screen.getByRole('button', { name: 'Add task' }))
    await user.type(screen.getByLabelText('Task Title'), 'Draft task')

    resizeTo(390)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Task Title')).toHaveValue('Draft task')
    expect(screen.getByLabelText('Task Title')).toHaveFocus()
  })

  it('closes an open metadata dropdown with Escape without discarding the draft', async () => {
    platformMock.value = 'other'
    setViewportWidth(1024)
    const user = userEvent.setup()

    renderLayout(<TaskToolbar />)

    await user.click(screen.getByRole('button', { name: 'Add task' }))
    await user.type(screen.getByLabelText('Task Title'), 'Kept draft')
    await user.click(screen.getByRole('button', { name: 'Estimate' }))

    expect(screen.getByRole('group', { name: 'Estimate' })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('group', { name: 'Estimate' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Task Title')).toHaveValue('Kept draft')

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('discards the draft when task creation is closed', async () => {
    platformMock.value = 'other'
    setViewportWidth(1024)
    const user = userEvent.setup()

    renderLayout(<TaskToolbar />)

    await user.click(screen.getByRole('button', { name: 'Add task' }))
    await user.type(screen.getByLabelText('Task Title'), 'Discarded draft')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByLabelText('Task Title')).toHaveValue('')
  })
})
