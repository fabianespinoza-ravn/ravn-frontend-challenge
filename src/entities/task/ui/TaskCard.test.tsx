import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import type { Task } from '@/entities/task/model/task'
import { TaskCard } from './TaskCard'

const task: Task = {
  dueDate: '2026-08-12T12:00:00.000Z',
  dueDateLabel: '12 Aug, 2026',
  dueDateTone: 'future',
  id: 'task-1',
  pointEstimate: 'FOUR',
  status: 'TODO',
  tags: ['NODE_JS', 'ANDROID'],
  title: 'GraphQL task',
}

/*
 * The card receives the estimate and the tags as the API spells them and does
 * the wording itself, so these assertions are what keeps that step from
 * disappearing unnoticed. The mapper used to do it, and its own test covered
 * it there.
 */
describe('TaskCard', () => {
  afterEach(cleanup)

  it('spells the estimate out in points', () => {
    render(<TaskCard task={task} />)

    expect(screen.getByText('4 points')).toBeInTheDocument()
  })

  it('names each tag by its label rather than the enum it arrived as', () => {
    render(<TaskCard task={task} />)

    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('Android')).toBeInTheDocument()
    expect(screen.queryByText('NODE_JS')).not.toBeInTheDocument()
  })
})
