import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockedProvider } from '@apollo/client/testing/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { MockedResponse } from '@apollo/client/testing'
import { AppLayout } from './AppLayout'
import { CREATE_TASK, DELETE_TASK, UPDATE_TASK } from '@/entities/task/api/taskOperations'
import type { ApiTask } from '@/entities/task/model/apiTask'
import type { Task } from '@/entities/task/model/task'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { TaskActionsMenu } from '@/features/task-actions/ui/TaskActionsMenu'
import { toApiDueDate, toDueDateValue } from '@/shared/lib/date/dueDate'
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

function renderLayout(
  routeElement = <h1>Dashboard</h1>,
  extraMocks: MockedResponse[] = [],
  tasks?: ApiTask[],
) {
  return render(
    <MockedProvider mocks={[...createGraphqlMocks(tasks), ...extraMocks]}>
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

    /* The name resolves from the users query, so it arrives after the dialog. */
    expect(
      await screen.findByRole('button', { name: 'Assignee: Ada Lovelace' }),
    ).toBeInTheDocument()
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

const assignedTask: Task = {
  assignee: { id: 'user-2', initials: 'AL', name: 'Ada Lovelace' },
  attachmentCount: 0,
  checklistCount: 0,
  commentCount: 0,
  dueDate: '2026-08-10T12:00:00.000Z',
  dueDateLabel: '10 Aug, 2026',
  dueDateTone: 'future',
  id: 'task-1',
  pointEstimate: 'FOUR',
  status: 'TODO',
  tags: ['REACT'],
  title: draftTitle,
}

/*
 * Built through the same round trip the draft makes rather than written out, so
 * the expectation does not become the date-line case 5.45 accepts.
 */
function expectedUpdateInput(assigneeId: string | null) {
  return {
    assigneeId,
    dueDate: toApiDueDate(toDueDateValue(new Date(assignedTask.dueDate))),
    id: assignedTask.id,
    name: draftTitle,
    pointEstimate: 'FOUR',
    status: 'TODO',
    tags: ['REACT'],
  }
}

describe('AppLayout task editing', () => {
  it('opens the composition already filled with the task its menu belongs to', async () => {
    const user = userEvent.setup()

    renderLayout(<TaskActionsMenu task={assignedTask} />)

    await user.click(screen.getByRole('button', { name: `More options for ${draftTitle}` }))
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

    expect(screen.getByRole('dialog', { name: 'Edit Task' })).toBeInTheDocument()
    expect(screen.getByLabelText('Task Title')).toHaveValue(draftTitle)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()

    /*
     * The assignee control resolves a name by looking the id up in the users
     * query, so it can only say who this is once that query answers. The draft
     * has carried the id since the dialog opened either way, which is why the
     * request in the next test does not wait for this.
     */
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Assignee: Ada Lovelace' })).toBeInTheDocument(),
    )
  })

  /*
   * The mock answers one exact set of variables, so the dialog closing is what
   * proves the cleared assignee left as an explicit null. Had it been omitted,
   * the way creation omits it, nothing would have matched and the composition
   * would still be open — which is the quiet failure 6.1 exists to prevent.
   */
  it('clears an assignee by sending an explicit null', async () => {
    const user = userEvent.setup()

    renderLayout(<TaskActionsMenu task={assignedTask} />, [
      {
        request: { query: UPDATE_TASK, variables: { input: expectedUpdateInput(null) } },
        result: { data: { updateTask: mockCreatedTask } },
      },
    ])

    await user.click(screen.getByRole('button', { name: `More options for ${draftTitle}` }))
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

    await user.click(await screen.findByRole('button', { name: 'Assignee: Ada Lovelace' }))
    await user.click(screen.getByRole('button', { name: 'Unassigned' }))

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})

describe('AppLayout task deletion', () => {
  async function openDeleteConfirmation(
    user: ReturnType<typeof userEvent.setup>,
    extraMocks: MockedResponse[] = [],
  ) {
    renderLayout(<TaskActionsMenu task={assignedTask} />, extraMocks)

    await user.click(screen.getByRole('button', { name: `More options for ${draftTitle}` }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))
  }

  /*
   * The menu is closed by the time this is read, so the dialog has to name the
   * task itself rather than rely on what was under the pointer.
   */
  it('confirms before deleting, naming the task and warning that it is final', async () => {
    const user = userEvent.setup()

    await openDeleteConfirmation(user)

    const dialog = screen.getByRole('dialog', { name: 'Delete task' })

    expect(within(dialog).getByText(`Delete “${draftTitle}”?`)).toBeInTheDocument()
    expect(within(dialog).getByText('This cannot be undone.')).toBeInTheDocument()
  })

  /* Enter on an unread dialog must back out, not destroy the task. */
  it('places focus on Cancel rather than on the destructive action', async () => {
    const user = userEvent.setup()

    await openDeleteConfirmation(user)

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
  })

  it('leaves the task alone when the confirmation is cancelled', async () => {
    const user = userEvent.setup()

    await openDeleteConfirmation(user)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  /*
   * The mock answers one exact id, so the dialog closing is what proves the
   * confirmed task is the one that was sent.
   */
  it('deletes the confirmed task', async () => {
    const user = userEvent.setup()

    await openDeleteConfirmation(user, [
      {
        request: { query: DELETE_TASK, variables: { input: { id: assignedTask.id } } },
        result: { data: { deleteTask: mockCreatedTask } },
      },
    ])

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('keeps the confirmation open and reports a failed deletion', async () => {
    const user = userEvent.setup()

    await openDeleteConfirmation(user, [
      {
        request: { query: DELETE_TASK, variables: { input: { id: assignedTask.id } } },
        error: new Error('Deletion failed'),
      },
    ])

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('could not be deleted')
    expect(screen.getByRole('dialog', { name: 'Delete task' })).toBeInTheDocument()
  })
})

describe('AppLayout task deletion and the cache', () => {
  /*
   * Exactly one GET_TASKS mock is supplied. A refetch would find nothing to
   * answer it and the board would show its error state, so reaching the empty
   * state is what proves the card left without a second request.
   */
  it('takes a deleted task off the board without asking for the list again', async () => {
    const user = userEvent.setup()

    renderLayout(
      <DashboardPage />,
      [
        {
          request: { query: DELETE_TASK, variables: { input: { id: mockCreatedTask.id } } },
          result: { data: { deleteTask: mockCreatedTask } },
        },
      ],
      [mockCreatedTask],
    )

    expect(await screen.findByRole('article', { name: mockCreatedTask.name })).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: `More options for ${mockCreatedTask.name}` }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(screen.queryByRole('article', { name: mockCreatedTask.name })).not.toBeInTheDocument(),
    )

    expect(screen.getByRole('heading', { name: 'No tasks are available' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
  })
})

describe('AppLayout task editing and the cache', () => {
  const renamed = 'Renamed task'

  /*
   * One GET_TASKS mock again, so a refetch would leave the board in its error
   * state. The card carrying the new title is the proof that the mutation's own
   * answer reached the board through the cache, with no second request.
   */
  it('shows an edited title on the board without asking for the list again', async () => {
    const user = userEvent.setup()

    renderLayout(
      <DashboardPage />,
      [
        {
          request: {
            query: UPDATE_TASK,
            variables: {
              input: {
                assigneeId: null,
                dueDate: toApiDueDate(toDueDateValue(new Date(mockCreatedTask.dueDate))),
                id: mockCreatedTask.id,
                name: renamed,
                pointEstimate: mockCreatedTask.pointEstimate,
                status: mockCreatedTask.status,
                tags: mockCreatedTask.tags,
              },
            },
          },
          result: { data: { updateTask: { ...mockCreatedTask, name: renamed } } },
        },
      ],
      [mockCreatedTask],
    )

    expect(await screen.findByRole('article', { name: mockCreatedTask.name })).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: `More options for ${mockCreatedTask.name}` }),
    )
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

    const title = screen.getByLabelText('Task Title')
    await user.clear(title)
    await user.type(title, renamed)
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('article', { name: renamed })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
  })
})

describe('AppLayout task search', () => {
  function renderLayoutAt(pathname: string) {
    return render(
      <MockedProvider mocks={createGraphqlMocks()}>
        <MemoryRouter initialEntries={[pathname]}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<h1>Dashboard</h1>} />
              <Route path="/settings" element={<h1>Settings</h1>} />
              <Route path="*" element={<h1>Not found</h1>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </MockedProvider>,
    )
  }

  it('offers the task search on a route that lists tasks', () => {
    renderLayoutAt('/dashboard')

    expect(screen.getByRole('searchbox', { name: 'Search tasks' })).toBeInTheDocument()
  })

  /*
   * The field names what it searches, so a route with no tasks would be
   * offering something it cannot do.
   */
  it('leaves the task search out of settings', () => {
    renderLayoutAt('/settings')

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })

  /* Named positively, so a route nobody thought about does not inherit one. */
  it('leaves the task search out of an unknown route', () => {
    renderLayoutAt('/somewhere-else')

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })
})
