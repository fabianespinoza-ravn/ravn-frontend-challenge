import type { MockedResponse } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { GET_TASKS } from '@/entities/task/api/taskOperations'
import type { ApiTask } from '@/entities/task/model/apiTask'
import { GET_PROFILE } from '@/entities/user/api/userOperations'
import { mockProfile } from '@/test/mocks/graphql'
import { TaskActionsTestProvider } from '@/test/taskActions'
import { TaskSearchTestProvider } from '@/test/taskSearch'
import { TaskFormTestProvider } from '@/test/taskForm'
import { MyTasksPage } from './MyTasksPage'

type ApolloApiTask = ApiTask & {
  __typename: 'Task'
  assignee: NonNullable<ApiTask['assignee']> & { __typename: 'User' }
  creator: ApiTask['creator'] & { __typename: 'User' }
}

const assignedTask: ApolloApiTask = {
  __typename: 'Task',
  assignee: mockProfile,
  createdAt: '2026-08-04T00:00:00.000Z',
  creator: mockProfile,
  dueDate: '2099-08-12T12:00:00.000Z',
  id: 'assigned-task-1',
  name: 'Assigned API task',
  pointEstimate: 'TWO',
  position: 1,
  status: 'TODO',
  tags: ['REACT'],
}

function profileMock(): MockedResponse {
  return {
    request: { query: GET_PROFILE },
    result: { data: { profile: mockProfile } },
  }
}

function tasksMock(tasks: ApolloApiTask[]): MockedResponse {
  return {
    request: { query: GET_TASKS, variables: { input: { assigneeId: mockProfile.id } } },
    result: { data: { tasks } },
  }
}

function renderMyTasks(mocks: MockedResponse[], appliedTerm = '') {
  return render(
    <MockedProvider mocks={mocks}>
      <TaskFormTestProvider>
        <TaskActionsTestProvider>
          <TaskSearchTestProvider appliedTerm={appliedTerm}>
            <MyTasksPage />
          </TaskSearchTestProvider>
        </TaskActionsTestProvider>
      </TaskFormTestProvider>
    </MockedProvider>,
  )
}

afterEach(cleanup)

describe('MyTasksPage', () => {
  it('loads the authenticated profile and renders its assigned API tasks in list view', async () => {
    renderMyTasks([profileMock(), tasksMock([assignedTask])])

    expect(screen.getByRole('status')).toHaveTextContent('Loading assigned tasks')
    expect(await screen.findByRole('article', { name: 'Assigned API task' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Task view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('To Do').parentElement).toHaveTextContent('(1)')
    expect(screen.getByLabelText('Task table')).toBeInTheDocument()
  })

  it('keeps the table categories and reports an assigned-task empty state', async () => {
    renderMyTasks([profileMock(), tasksMock([])])

    expect(await screen.findByLabelText('Task table')).toBeInTheDocument()
    expect(screen.getAllByText('No tasks in this category.')).toHaveLength(5)
  })

  it('retries the profile and assigned-task requests after an error', async () => {
    const user = userEvent.setup()

    renderMyTasks([
      profileMock(),
      {
        error: new Error('Network request failed'),
        request: { query: GET_TASKS, variables: { input: { assigneeId: mockProfile.id } } },
      },
      profileMock(),
      tasksMock([assignedTask]),
    ])

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load assigned tasks')

    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(await screen.findByRole('article', { name: 'Assigned API task' })).toBeInTheDocument()
  })
})

describe('MyTasksPage search', () => {
  /*
   * Contract 5.10 confirmed that filter fields combine with AND, so the mock
   * carries both. Matching it is the proof that searching here stays inside
   * what is assigned to the authenticated user instead of escaping into
   * everyone's tasks.
   */
  it('searches within the assigned tasks rather than across all of them', async () => {
    renderMyTasks(
      [
        profileMock(),
        {
          request: {
            query: GET_TASKS,
            variables: { input: { assigneeId: mockProfile.id, name: 'Assigned' } },
          },
          result: { data: { tasks: [assignedTask] } },
        },
      ],
      'Assigned',
    )

    expect(await screen.findByText(assignedTask.name)).toBeInTheDocument()
  })

  it('tells a fruitless search apart from an empty assignment list', async () => {
    renderMyTasks(
      [
        profileMock(),
        {
          request: {
            query: GET_TASKS,
            variables: { input: { assigneeId: mockProfile.id, name: 'Nothing' } },
          },
          result: { data: { tasks: [] } },
        },
      ],
      'Nothing',
    )

    expect(
      await screen.findByRole('heading', { name: 'No assigned tasks match your search' }),
    ).toBeInTheDocument()
  })
})
