import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TaskBoard } from './TaskBoard'

describe('TaskBoard', () => {
  afterEach(cleanup)

  it('renders the five static task-status columns with their task counts', () => {
    render(<TaskBoard />)

    expect(screen.getByRole('region', { name: 'Backlog, 2 tasks' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'To Do, 1 task' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'In Progress, 2 tasks' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Done, 2 tasks' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Cancelled, 1 task' })).toBeInTheDocument()
  })

  it('orders cards chronologically within a column and renders an unassigned task fallback', () => {
    render(<TaskBoard />)

    const backlogCards = screen
      .getByRole('region', { name: 'Backlog, 2 tasks' })
      .querySelectorAll('article')

    expect(backlogCards[0]).toHaveAccessibleName('Slack workspace')
    expect(backlogCards[1]).toHaveAccessibleName('Research task insights')
    expect(screen.getByRole('img', { name: 'Unassigned' })).toBeInTheDocument()
  })
})
