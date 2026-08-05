import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MyTasksPage } from './MyTasksPage'

describe('MyTasksPage', () => {
  it('renders only static tasks assigned to the mock authenticated user in list view', () => {
    render(<MyTasksPage />)

    expect(screen.getByRole('button', { name: 'List view' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('#')).toBeInTheDocument()
    expect(screen.getByText('Task Name')).toBeInTheDocument()
    expect(screen.getByText('Task Tags')).toBeInTheDocument()
    expect(screen.getByText('Estimate')).toBeInTheDocument()
    expect(screen.getByText('Due Date')).toBeInTheDocument()
    expect(screen.queryByText('Task Assignee Name')).not.toBeInTheDocument()
    expect(screen.getByText('To Do').parentElement).toHaveTextContent('(1)')
    expect(screen.getByText('In Progress').parentElement).toHaveTextContent('(1)')
    expect(screen.getByText('Done').parentElement).toHaveTextContent('(2)')
    expect(screen.getAllByText('No tasks in this category.')).toHaveLength(2)
    expect(screen.getByRole('article', { name: 'Google calendar sync' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Twitter notification flow' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Tesla mobile handoff' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Slack release checklist' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'More options for Google calendar sync' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'More options for Twitter notification flow' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'More options for Tesla mobile handoff' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'More options for Slack release checklist' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('article', { name: 'Maxxis tyres dashboard' }),
    ).not.toBeInTheDocument()
  })
})
