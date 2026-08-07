import { MockedProvider } from '@apollo/client/testing/react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { GET_TASKS } from '@/entities/task/api/taskOperations'
import type { ApiTask } from '@/entities/task/model/apiTask'
import { mockProfile } from '@/test/mocks/graphql'
import { TaskActionsTestProvider } from '@/test/taskActions'
import { emptyTaskFilters } from '@/features/task-filters/model/taskFilters'
import { TaskFiltersTestProvider } from '@/test/taskFilters'
import { TaskFormTestProvider } from '@/test/taskForm'
import { DashboardPage } from './DashboardPage'

type ApolloApiTask = ApiTask & {
  __typename: 'Task'
  creator: ApiTask['creator'] & { __typename: 'User' }
}

const laterTask: ApolloApiTask = {
  __typename: 'Task',
  assignee: null,
  createdAt: '2026-08-04T00:00:00.000Z',
  creator: { ...mockProfile, __typename: 'User' },
  dueDate: '2099-08-12T12:00:00.000Z',
  id: 'task-later',
  name: 'Later task',
  pointEstimate: 'FOUR',
  position: 2,
  status: 'BACKLOG',
  tags: ['REACT'],
}

const earlierTask: ApiTask = {
  ...laterTask,
  dueDate: '2099-08-01T12:00:00.000Z',
  id: 'task-earlier',
  name: 'Earlier task',
  position: 1,
}

function renderDashboard(
  mocks: ConstructorParameters<typeof MockedProvider>[0]['mocks'],
  name = '',
) {
  return render(
    <MockedProvider mocks={mocks}>
      <TaskFormTestProvider>
        <TaskActionsTestProvider>
          <TaskFiltersTestProvider filters={{ ...emptyTaskFilters, name }}>
            <DashboardPage />
          </TaskFiltersTestProvider>
        </TaskActionsTestProvider>
      </TaskFormTestProvider>
    </MockedProvider>,
  )
}

afterEach(cleanup)

describe('DashboardPage', () => {
  it('shows a loading state before task data is available', () => {
    renderDashboard([])

    expect(screen.getByRole('status')).toHaveTextContent('Loading tasks')
  })

  it('maps API tasks and keeps chronological order within a status column', async () => {
    renderDashboard([
      {
        request: { query: GET_TASKS, variables: { input: {} } },
        result: { data: { tasks: [laterTask, earlierTask] } },
      },
    ])

    const backlog = await screen.findByRole('region', { name: 'Backlog, 2 tasks' })
    const cards = backlog.querySelectorAll('article')

    expect(cards[0]).toHaveAccessibleName('Earlier task')
    expect(cards[1]).toHaveAccessibleName('Later task')
  })

  it('shows an accessible empty state when the API returns no tasks', async () => {
    renderDashboard([
      {
        request: { query: GET_TASKS, variables: { input: {} } },
        result: { data: { tasks: [] } },
      },
    ])

    expect(
      await screen.findByRole('heading', { name: 'No tasks are available' }),
    ).toBeInTheDocument()
  })

  it('retries after a task query error', async () => {
    const user = userEvent.setup()

    renderDashboard([
      {
        error: new Error('Network request failed'),
        request: { query: GET_TASKS, variables: { input: {} } },
      },
      {
        request: { query: GET_TASKS, variables: { input: {} } },
        result: { data: { tasks: [earlierTask] } },
      },
    ])

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load tasks')

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByRole('region', { name: 'Backlog, 1 task' })).toBeInTheDocument()
  })
})

describe('DashboardPage search', () => {
  /*
   * The mock answers one exact input, so the board showing the task is the
   * proof the term travelled as an API filter rather than being applied to
   * whatever had already been loaded.
   */
  it('asks the server for the matching tasks rather than filtering what it has', async () => {
    renderDashboard(
      [
        {
          request: { query: GET_TASKS, variables: { input: { name: 'Later' } } },
          result: { data: { tasks: [laterTask] } },
        },
      ],
      'Later',
    )

    expect(await screen.findByRole('article', { name: 'Later task' })).toBeInTheDocument()
    expect(screen.queryByRole('article', { name: 'Earlier task' })).not.toBeInTheDocument()
  })

  /* A search that found nothing is not an account with nothing in it. */
  it('tells a fruitless search apart from an empty board', async () => {
    renderDashboard(
      [
        {
          request: { query: GET_TASKS, variables: { input: { name: 'Nothing' } } },
          result: { data: { tasks: [] } },
        },
      ],
      'Nothing',
    )

    expect(
      await screen.findByRole('heading', { name: 'No tasks match your filters' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'No tasks are available' }),
    ).not.toBeInTheDocument()
  })
})

describe('DashboardPage view toggle', () => {
  const boardMock = {
    request: { query: GET_TASKS, variables: { input: {} } },
    result: { data: { tasks: [laterTask] } },
  }

  it('opens as a board, which is the presentation it was designed around', async () => {
    renderDashboard([boardMock])

    expect(await screen.findByRole('region', { name: 'Task board' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dashboard view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  /*
   * The same tasks, told a different way. Both presentations take the same
   * prop, so nothing about what is shown changes — only how.
   */
  it('shows the same tasks as a list once the control is pressed', async () => {
    const user = userEvent.setup()

    renderDashboard([boardMock])

    expect(await screen.findByRole('region', { name: 'Task board' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Task view' }))

    expect(screen.queryByRole('region', { name: 'Task board' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tasks' })).toBeInTheDocument()
    expect(screen.getByText(laterTask.name)).toBeInTheDocument()
  })

  it('reports exactly one active view at a time', async () => {
    const user = userEvent.setup()

    renderDashboard([boardMock])
    await screen.findByRole('region', { name: 'Task board' })

    await user.click(screen.getByRole('button', { name: 'Task view' }))

    expect(screen.getByRole('button', { name: 'Task view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Dashboard view' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })
})
