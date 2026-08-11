import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Task } from '@/entities/task/model/task'
import { TaskActionsTestProvider } from '@/test/taskActions'
import { TaskActionsMenu } from './TaskActionsMenu'

const task: Task = {
  dueDate: '2026-08-12T12:00:00.000Z',
  dueDateLabel: '12 Aug, 2026',
  dueDateTone: 'future',
  id: 'task-1',
  pointEstimate: 'FOUR',
  status: 'TODO',
  tags: ['REACT'],
  title: 'GraphQL task',
}

function renderMenu(editTask = vi.fn()) {
  render(
    <TaskActionsTestProvider editTask={editTask}>
      <TaskActionsMenu task={task} />
    </TaskActionsTestProvider>,
  )

  return {
    editTask,
    trigger: screen.getByRole('button', { name: 'More options for GraphQL task' }),
  }
}

describe('TaskActionsMenu', () => {
  afterEach(cleanup)

  it('keeps its actions closed until the control is pressed', async () => {
    const user = userEvent.setup()
    const { trigger } = renderMenu()

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
  })

  /* The card names the task, so the action has to carry which one it meant. */
  it('asks to edit the task it belongs to', async () => {
    const user = userEvent.setup()
    const { editTask, trigger } = renderMenu()

    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

    expect(editTask).toHaveBeenCalledWith(task)
  })

  /*
   * Deleting is confirmed elsewhere, so choosing it here only asks. The menu
   * never performs the change itself.
   */
  it('asks to delete the task it belongs to', async () => {
    const user = userEvent.setup()
    const deleteTask = vi.fn()

    render(
      <TaskActionsTestProvider deleteTask={deleteTask}>
        <TaskActionsMenu task={task} />
      </TaskActionsTestProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'More options for GraphQL task' }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))

    expect(deleteTask).toHaveBeenCalledWith(task)
  })

  it('closes once an action is chosen', async () => {
    const user = userEvent.setup()
    const { trigger } = renderMenu()

    await user.click(trigger)
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }))

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  /*
   * Focus goes back to the control that opened it, so a keyboard lands on the
   * card it came from rather than at the top of the document.
   */
  it('closes on Escape and hands focus back to its control', async () => {
    const user = userEvent.setup()
    const { trigger } = renderMenu()

    await user.click(trigger)
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
