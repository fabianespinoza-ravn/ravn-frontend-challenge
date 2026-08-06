import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatFullDateLabel } from '../../model/dueDate'
import { MaterialDatePicker } from './MaterialDatePicker'

/** 2026-03-10 is a Tuesday, and 2026-03-01 falls on a Sunday. */
const value = '2026-03-10'

function dayLabel(day: number) {
  return formatFullDateLabel(new Date(2026, 2, day))
}

afterEach(cleanup)

describe('MaterialDatePicker', () => {
  it('holds the chosen day until the footer confirms it', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(<MaterialDatePicker onCancel={vi.fn()} onSelect={onSelect} value={value} />)

    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByText('Tue, Mar 10')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: dayLabel(17) }))

    // The header follows the pending day, while the draft stays untouched.
    expect(screen.getByText('Tue, Mar 17')).toBeInTheDocument()
    expect(onSelect).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'OK' }))

    expect(onSelect).toHaveBeenCalledWith('2026-03-17')
  })

  it('leaves the draft alone when the dialog is cancelled', async () => {
    const onCancel = vi.fn()
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(<MaterialDatePicker onCancel={onCancel} onSelect={onSelect} value={value} />)

    await user.click(screen.getByRole('button', { name: dayLabel(17) }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalled()
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('browses months without disturbing the pending day', async () => {
    const user = userEvent.setup()

    render(<MaterialDatePicker onCancel={vi.fn()} onSelect={vi.fn()} value={value} />)

    await user.click(screen.getByRole('button', { name: 'Next month' }))

    expect(screen.getByText('April 2026')).toBeInTheDocument()
    expect(screen.getByText('Tue, Mar 10')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: dayLabel(10) })).not.toBeInTheDocument()
  })
})
