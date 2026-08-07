import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { taskFormId } from '@/features/task-form/model/taskForm'
import { useTaskFormState } from '@/features/task-form/model/useTaskFormState'
import { AddProjectPage } from './AddProjectPage'
import styles from './AddProjectPage.module.css'

function AddProjectHarness({ onClose }: { onClose: () => void }) {
  const form = useTaskFormState()

  return <AddProjectPage form={form} onClose={onClose} />
}

afterEach(cleanup)

describe('AddProjectPage', () => {
  it('renders the task form inside the mobile full-page composition', () => {
    render(<AddProjectHarness onClose={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Close task creation' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Create Task' })).toBeInTheDocument()
    expect(screen.getByLabelText('Task Title')).toBeInTheDocument()

    for (const label of ['Estimate', 'Label', 'Assignee', 'Due date', 'Status']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('submits through the form even though its Create control sits outside it', () => {
    render(<AddProjectHarness onClose={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute('form', taskFormId)
  })

  it('highlights Create only once every required field carries a value', async () => {
    const user = userEvent.setup()

    render(<AddProjectHarness onClose={vi.fn()} />)

    const createButton = screen.getByRole('button', { name: 'Create' })

    expect(createButton).not.toHaveClass(styles.isReady)

    await user.type(screen.getByLabelText('Task Title'), 'Ship the iOS form')

    await user.click(screen.getByRole('button', { name: 'Estimate' }))
    await user.click(
      within(screen.getByRole('group', { name: 'Estimate' })).getByRole('button', {
        name: '2 Points',
      }),
    )

    await user.click(screen.getByRole('button', { name: 'Status' }))
    await user.click(
      within(screen.getByRole('group', { name: 'Status' })).getByRole('button', {
        name: 'Backlog',
      }),
    )

    await user.click(screen.getByRole('button', { name: 'Label' }))
    await user.click(
      within(screen.getByRole('group', { name: 'Tag Title' })).getByRole('button', {
        name: 'React',
      }),
    )
    await user.keyboard('{Escape}')

    expect(createButton).not.toHaveClass(styles.isReady)

    await user.click(screen.getByRole('button', { name: 'Due date' }))
    await user.click(
      within(screen.getByRole('group', { name: 'Day' })).getByRole('button', { name: '12' }),
    )

    expect(createButton).toHaveClass(styles.isReady)
  })
})
