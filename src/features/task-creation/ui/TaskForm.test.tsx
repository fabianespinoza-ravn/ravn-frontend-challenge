import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type { User } from '@/entities/user/model/user'
import { mockProfile } from '@/test/mocks/graphql'
import { formatDueDateLabel, longMonthNames, toDueDateValue } from '../model/dueDate'
import { taskCreationFormId } from '../model/taskCreationForm'
import { useTaskCreationForm } from '../model/useTaskCreationForm'
import fieldStyles from './fields/FieldDropdown.module.css'
import { TaskForm } from './TaskForm'

const teammates: User[] = [{ ...mockProfile, fullName: 'Jerome Bell', id: 'user-jerome' }]

function TaskFormHarness({ assignees }: { assignees?: User[] }) {
  const form = useTaskCreationForm()

  return <TaskForm assignees={assignees} form={form} id={taskCreationFormId} />
}

afterEach(cleanup)

describe('TaskForm', () => {
  it('renders a prominent title above one collapsed row per field', () => {
    render(<TaskFormHarness />)

    expect(screen.getByLabelText('Task Title')).toHaveValue('')
    expect(screen.getByLabelText('Task Title')).toHaveFocus()

    for (const label of ['Estimate', 'Label', 'Assignee', 'Due date', 'Status']) {
      expect(screen.getByRole('button', { name: label })).toHaveAttribute('aria-expanded', 'false')
    }

    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('opens a popover titled after its field and reports the choice on the row', async () => {
    const user = userEvent.setup()

    render(<TaskFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Estimate' }))

    const panel = screen.getByRole('group', { name: 'Estimate' })

    expect(panel.parentElement).toHaveClass(fieldStyles.overlay)
    expect(panel).toHaveClass(fieldStyles.rowPanel)

    await user.click(within(panel).getByRole('button', { name: '2 Points' }))

    expect(screen.queryByRole('group', { name: 'Estimate' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Estimate: 2 Points' })).toHaveTextContent('2 Points')
  })

  it('dismisses a centred popover when its backdrop is clicked', async () => {
    const user = userEvent.setup()

    const { container } = render(<TaskFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Status' }))

    expect(screen.getByRole('group', { name: 'Status' })).toBeInTheDocument()

    const backdrop = container.querySelector(`.${fieldStyles.overlayBackdrop}`)

    expect(backdrop).not.toBeNull()

    await user.click(backdrop as HTMLElement)

    expect(screen.queryByRole('group', { name: 'Status' })).not.toBeInTheDocument()
  })

  it('checks tags in place and keeps the label popover open', async () => {
    const user = userEvent.setup()

    render(<TaskFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Label' }))

    const panel = screen.getByRole('group', { name: 'Tag Title' })

    await user.click(within(panel).getByRole('button', { name: 'iOS App' }))
    await user.click(within(panel).getByRole('button', { name: 'React' }))

    expect(panel).toBeInTheDocument()
    expect(within(panel).getByRole('button', { name: 'iOS App' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(panel).getByRole('button', { name: 'Rails' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    const trigger = screen.getByRole('button', { name: 'Label: iOS App, React' })

    expect(trigger).toHaveTextContent('iOS App')
    expect(trigger).toHaveTextContent('React')
    expect(trigger.querySelector(`.${fieldStyles.triggerTags}`)).toHaveClass(
      fieldStyles.triggerTagsRow,
    )
  })

  it('picks a due date from a three column wheel without closing it', async () => {
    const user = userEvent.setup()
    const today = new Date()

    render(<TaskFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Due date' }))

    const panel = screen.getByRole('group', { name: 'Due date' })

    expect(panel).toHaveClass(fieldStyles.wheelPanel)

    for (const column of ['Month', 'Day', 'Year']) {
      expect(within(panel).getByRole('group', { name: column })).toBeInTheDocument()
    }

    const monthColumn = within(panel).getByRole('group', { name: 'Month' })

    await user.click(within(monthColumn).getByRole('button', { name: longMonthNames[0] }))

    expect(screen.getByRole('group', { name: 'Due date' })).toBeInTheDocument()

    const expected = formatDueDateLabel(
      toDueDateValue(new Date(today.getFullYear(), 0, today.getDate())),
    )

    expect(screen.getByRole('button', { name: `Due date: ${expected}` })).toBeInTheDocument()
  })

  it('lists teammates with an avatar and selects one', async () => {
    const user = userEvent.setup()

    render(<TaskFormHarness assignees={teammates} />)

    await user.click(screen.getByRole('button', { name: 'Assignee' }))

    const panel = screen.getByRole('group', { name: 'Assign To...' })

    expect(panel.querySelectorAll('span[role="img"]')).toHaveLength(1)

    await user.click(within(panel).getByRole('button', { name: 'Jerome Bell' }))

    expect(screen.getByRole('button', { name: 'Assignee: Jerome Bell' })).toHaveTextContent(
      'Jerome Bell',
    )
  })

  it('reports an empty assignee list until teammates are available', async () => {
    const user = userEvent.setup()

    render(<TaskFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Assignee' }))

    expect(screen.getByRole('group', { name: 'Assign To...' })).toHaveTextContent(
      'No teammates are available yet.',
    )
  })
})
