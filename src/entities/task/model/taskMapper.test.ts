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

/**
 * Due dates arrive as instants at noon UTC, which is what creation sends and
 * what the API hands back. Building them from the local day here repeats the
 * arithmetic the form performs, so these read the way the application does.
 */
function dueIn(days: number): ApiTask {
  const day = new Date()

  day.setDate(day.getDate() + days)

  return {
    ...apiTask,
    dueDate: new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 12)).toISOString(),
  }
}

describe('mapApiTaskToTask due dates', () => {
  it('names the current day rather than dating it', () => {
    const task = mapApiTaskToTask(dueIn(0))

    expect(task.dueDateLabel).toEqual('Today')
    expect(task.dueDateTone).toEqual('soon')
  })

  it('names the next day too, and gives it the same tone', () => {
    const task = mapApiTaskToTask(dueIn(1))

    expect(task.dueDateLabel).toEqual('Tomorrow')
    expect(task.dueDateTone).toEqual('soon')
  })

  it('reports a day already gone as overdue', () => {
    const task = mapApiTaskToTask(dueIn(-1))

    expect(task.dueDateLabel).toEqual('Past due')
    expect(task.dueDateTone).toEqual('past')
  })

  it('dates anything further out, in the reference order', () => {
    const task = mapApiTaskToTask(dueIn(2))

    expect(task.dueDateTone).toEqual('future')
    expect(task.dueDateLabel).toMatch(/^\d{1,2} [A-Z][a-z]{2}, \d{4}$/)
  })

  it('reads day, month, year, the way the fixtures did', () => {
    // 2099 keeps this out of reach of the relative labels above.
    const task = mapApiTaskToTask({ ...apiTask, dueDate: '2099-08-12T12:00:00.000Z' })

    expect(task.dueDateLabel).toEqual('12 Aug, 2099')
  })

  it('says so when the date cannot be read at all', () => {
    const task = mapApiTaskToTask({ ...apiTask, dueDate: 'not-a-date' })

    expect(task.dueDateLabel).toEqual('Date unavailable')
  })
})
