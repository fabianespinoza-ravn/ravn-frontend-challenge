import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MockedResponse } from '@apollo/client/testing'
import { AppLayout } from './AppLayout'
import { CREATE_TASK } from '@/entities/task/api/taskOperations'
import { createGraphqlMocks, mockCreatedTask } from '@/test/mocks/graphql'
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

function renderLayout(routeElement = <h1>Dashboard</h1>, extraMocks: MockedResponse[] = []) {
  return render(
    <MockedProvider mocks={[...createGraphqlMocks(), ...extraMocks]}>
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

const draftTitle = 'Ship the mutation'

/** Every required field, through the controls a user would actually press. */
async function fillDraft(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Task Title'), draftTitle)

  await user.click(screen.getByRole('button', { name: 'Estimate' }))
  await user.click(screen.getByRole('button', { name: '4 Points' }))

  await user.click(screen.getByRole('button', { name: 'Label' }))
  await user.click(screen.getByRole('button', { name: 'React' }))
  // Tags are a multiple selection, so the panel waits to be dismissed.
  await user.keyboard('{Escape}')

  await user.click(screen.getByRole('button', { name: 'Due date' }))
  await user.click(screen.getByRole('button', { name: 'Today' }))

  await user.click(screen.getByRole('button', { name: 'Status' }))
  await user.click(screen.getByRole('button', { name: 'To Do' }))
}

function expectedCreateInput() {
  const today = new Date()

  return {
    dueDate: new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12),
    ).toISOString(),
    name: draftTitle,
    pointEstimate: 'FOUR',
    status: 'TODO',
    tags: ['REACT'],
  }
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

  it('assigns the draft to a teammate loaded from the API', async () => {
    platformMock.value = 'other'
    setViewportWidth(1024)
    const user = userEvent.setup()

    renderLayout(<TaskToolbar />)

    await user.click(screen.getByRole('button', { name: 'Add task' }))
    await user.click(screen.getByRole('button', { name: 'Assignee' }))

    const panel = screen.getByRole('group', { name: 'Assign To...' })

    // Only the users query knows this teammate, so finding her proves the list
    // is the API's rather than the profile the header already holds.
    await user.click(await within(panel).findByRole('button', { name: 'Ada Lovelace' }))

    expect(screen.getByRole('button', { name: 'Assignee: Ada Lovelace' })).toBeInTheDocument()
  })

  it('names the missing fields instead of sending an incomplete draft', async () => {
    platformMock.value = 'other'
    setViewportWidth(1024)
    const user = userEvent.setup()

    // No mutation mock: anything sent from here would fail this test outright.
    renderLayout(<TaskToolbar />)

    await user.click(screen.getByRole('button', { name: 'Add task' }))
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Add Task title, Status, Estimate, Label and Due date before creating this task.',
    )
    // Each control the draft is short of points at the message that names it.
    expect(screen.getByRole('button', { name: 'Status' })).toHaveAttribute(
      'aria-describedby',
      screen.getByRole('alert').id,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('creates the drafted task and closes on success', async () => {
    platformMock.value = 'other'
    setViewportWidth(1024)
    const user = userEvent.setup()

    renderLayout(<TaskToolbar />, [
      {
        request: { query: CREATE_TASK, variables: { input: expectedCreateInput() } },
        result: { data: { createTask: mockCreatedTask } },
      },
    ])

    await user.click(screen.getByRole('button', { name: 'Add task' }))
    await fillDraft(user)
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('keeps the draft and reports a creation that failed', async () => {
    platformMock.value = 'other'
    setViewportWidth(1024)
    const user = userEvent.setup()

    renderLayout(<TaskToolbar />, [
      {
        request: { query: CREATE_TASK, variables: { input: expectedCreateInput() } },
        error: new Error('Creation failed'),
      },
    ])

    await user.click(screen.getByRole('button', { name: 'Add task' }))
    await fillDraft(user)
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('The task could not be created')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Task Title')).toHaveValue(draftTitle)
  })
})
