import { MockedProvider } from '@apollo/client/testing/react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { GET_TASKS } from '@/entities/task/api/taskOperations'
import type { ApiTask } from '@/entities/task/model/apiTask'
import { mockProfile } from '@/test/mocks/graphql'
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

function renderDashboard(mocks: ConstructorParameters<typeof MockedProvider>[0]['mocks']) {
  return render(
    <MockedProvider mocks={mocks}>
      <DashboardPage />
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
