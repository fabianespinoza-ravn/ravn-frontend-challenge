import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type { User } from '@/entities/user/model/user'
import { mockProfile } from '@/test/mocks/graphql'
import { taskFormId } from '../model/taskForm'
import { formatDueDateLabel, formatFullDateLabel, toDueDateValue } from '@/shared/lib/date/dueDate'
import { useTaskFormState } from '../model/useTaskFormState'
import fieldStyles from '@/shared/ui/field-dropdown/FieldDropdown.module.css'
import { TaskMetadataForm } from './TaskMetadataForm'

const teammates: User[] = [
  { ...mockProfile, fullName: 'Jerome Bell', id: 'user-jerome' },
  {
    ...mockProfile,
    avatar: 'https://example.com/avatar.png',
    fullName: 'Leslie Alexander',
    id: 'user-leslie',
  },
]

function TaskMetadataFormHarness({ assignees }: { assignees?: User[] }) {
  const form = useTaskFormState()

  return <TaskMetadataForm assignees={assignees} form={form} id={taskFormId} />
}

afterEach(cleanup)

describe('TaskMetadataForm', () => {
  it('renders one collapsed control per metadata field', () => {
    render(<TaskMetadataFormHarness />)

    expect(screen.getByLabelText('Task Title')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Estimate' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByRole('button', { name: 'Assignee' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Label' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Due date' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Status' })).toBeInTheDocument()
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })

  it('requires an explicit status and shows the chosen one on its control', async () => {
    const user = userEvent.setup()

    render(<TaskMetadataFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Status' }))

    const panel = screen.getByRole('group', { name: 'Status' })

    expect(within(panel).getAllByRole('button')).toHaveLength(5)

    await user.click(within(panel).getByRole('button', { name: 'In Progress' }))

    expect(screen.queryByRole('group', { name: 'Status' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Status: In Progress' })).toHaveTextContent(
      'In Progress',
    )
  })

  it('replaces the estimate label with the selected value and closes its dropdown', async () => {
    const user = userEvent.setup()

    render(<TaskMetadataFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Estimate' }))

    expect(screen.getByRole('group', { name: 'Estimate' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '2 Points' }))

    expect(screen.queryByRole('group', { name: 'Estimate' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Estimate: 2 Points' })).toHaveTextContent('2 Points')
  })

  it('keeps the label dropdown open and shows every selected tag on its control', async () => {
    const user = userEvent.setup()

    render(<TaskMetadataFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Label' }))

    const panel = screen.getByRole('group', { name: 'Tag Title' })

    await user.click(screen.getByRole('button', { name: 'iOS App' }))
    await user.click(screen.getByRole('button', { name: 'React' }))

    expect(panel).toBeInTheDocument()

    const trigger = screen.getByRole('button', { name: 'Label: iOS App, React' })

    expect(trigger).toHaveTextContent('iOS App')
    expect(trigger).toHaveTextContent('React')

    await user.click(screen.getByRole('button', { name: 'iOS App', pressed: true }))

    expect(screen.getByRole('button', { name: 'Label: React' })).not.toHaveTextContent('iOS App')
  })

  it('fills the icon of a selected tag and clears it again when deselected', async () => {
    const user = userEvent.setup()

    render(<TaskMetadataFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Label' }))

    const tagIcon = (name: string) =>
      screen.getByRole('button', { name }).querySelector('svg')?.getAttribute('fill')

    expect(tagIcon('Rails')).toEqual('none')

    await user.click(screen.getByRole('button', { name: 'Rails' }))

    expect(tagIcon('Rails')).toEqual('currentColor')
    expect(tagIcon('React')).toEqual('none')

    await user.click(screen.getByRole('button', { name: 'Rails', pressed: true }))

    expect(tagIcon('Rails')).toEqual('none')
  })

  it('selects a due date from the calendar and shows it on the control', async () => {
    const user = userEvent.setup()
    const today = new Date()

    render(<TaskMetadataFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Due date' }))
    await user.click(screen.getByRole('button', { name: formatFullDateLabel(today) }))

    const expectedLabel = formatDueDateLabel(toDueDateValue(today))

    expect(screen.queryByRole('group', { name: 'Due date' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Due date: ${expectedLabel}` })).toBeInTheDocument()
  })

  it('opens the calendar at its natural height so it never scrolls', async () => {
    const user = userEvent.setup()

    render(<TaskMetadataFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Due date' }))

    const panel = screen.getByRole('group', { name: 'Due date' })

    expect(panel).toHaveClass(fieldStyles.panelFitsContent)
    expect(within(panel).getAllByRole('button')).toHaveLength(47)
  })

  it('navigates the calendar by month and by year', async () => {
    const user = userEvent.setup()

    render(<TaskMetadataFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Due date' }))

    const monthLabel = () => screen.getByRole('group', { name: 'Due date' }).querySelector('p')
    const initialLabel = monthLabel()?.textContent

    await user.click(screen.getByRole('button', { name: 'Next month' }))

    expect(monthLabel()?.textContent).not.toEqual(initialLabel)

    await user.click(screen.getByRole('button', { name: 'Previous month' }))

    expect(monthLabel()?.textContent).toEqual(initialLabel)

    await user.click(screen.getByRole('button', { name: 'Next year' }))

    const [, initialYear] = (initialLabel ?? '').split(' ')

    expect(monthLabel()?.textContent).toContain(`${Number(initialYear) + 1}`)
  })

  it('lists teammates with an avatar and shows the selected one on its control', async () => {
    const user = userEvent.setup()

    render(<TaskMetadataFormHarness assignees={teammates} />)

    await user.click(screen.getByRole('button', { name: 'Assignee' }))

    const panel = screen.getByRole('group', { name: 'Assign To...' })

    expect(panel.querySelectorAll('span[role="img"]')).toHaveLength(2)
    expect(within(panel).getByRole('button', { name: 'Leslie Alexander' })).toBeInTheDocument()

    await user.click(within(panel).getByRole('button', { name: 'Jerome Bell' }))

    expect(screen.queryByRole('group', { name: 'Assign To...' })).not.toBeInTheDocument()

    const trigger = screen.getByRole('button', { name: 'Assignee: Jerome Bell' })

    expect(trigger).toHaveTextContent('Jerome Bell')
    expect(trigger.querySelector('span[role="img"]')).toBeInTheDocument()
  })

  it('reports an empty assignee list until teammates are available', async () => {
    const user = userEvent.setup()

    render(<TaskMetadataFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Assignee' }))

    expect(screen.getByRole('group', { name: 'Assign To...' })).toHaveTextContent(
      'No teammates are available yet.',
    )
  })
})
