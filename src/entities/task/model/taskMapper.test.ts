import { describe, expect, it } from 'vitest'
import { mapApiTaskToTask } from './taskMapper'
import type { ApiTask } from './apiTask'

const apiTask: ApiTask = {
  assignee: {
    avatar: null,
    createdAt: '2026-08-04T00:00:00.000Z',
    email: 'assignee@example.com',
    fullName: 'Lena Evans',
    id: 'user-1',
    type: 'CANDIDATE',
    updatedAt: '2026-08-04T00:00:00.000Z',
  },
  createdAt: '2026-08-04T00:00:00.000Z',
  creator: {
    avatar: null,
    createdAt: '2026-08-04T00:00:00.000Z',
    email: 'creator@example.com',
    fullName: 'Fabian Espinoza',
    id: 'user-2',
    type: 'CANDIDATE',
    updatedAt: '2026-08-04T00:00:00.000Z',
  },
  dueDate: '2099-08-12T12:00:00.000Z',
  id: 'task-1',
  name: 'GraphQL task',
  pointEstimate: 'FOUR',
  position: 1,
  status: 'TODO',
  tags: ['NODE_JS', 'REACT'],
}

describe('mapApiTaskToTask', () => {
  it('maps API enums and assignee data to the dashboard model', () => {
    expect(mapApiTaskToTask(apiTask)).toMatchObject({
      assignee: { id: 'user-1', initials: 'LE', name: 'Lena Evans' },
      points: 4,
      status: 'TODO',
      tags: ['Node.js', 'React'],
      title: 'GraphQL task',
    })
  })

  it('keeps an unassigned task free of an avatar model', () => {
    const task = mapApiTaskToTask({ ...apiTask, assignee: null })

    expect(task.assignee).toBeUndefined()
  })
})
