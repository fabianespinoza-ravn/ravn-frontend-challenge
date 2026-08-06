import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { longMonthNames } from '../../model/dueDate'
import { DateWheelPicker } from './DateWheelPicker'
import styles from './DateWheelPicker.module.css'

const itemHeight = 36

/**
 * jsdom reports every element as zero height, so the column cannot work out
 * which value is centred. Give it a stable item height instead.
 */
function stubItemHeight() {
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => itemHeight,
  })
}

function restoreItemHeight() {
  Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight')
}

beforeEach(() => {
  stubItemHeight()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  restoreItemHeight()
  cleanup()
})

describe('DateWheelPicker', () => {
  it('centres the selected value and recedes its neighbours', () => {
    render(<DateWheelPicker onSelect={vi.fn()} value="2026-03-10" />)

    const monthColumn = screen.getByRole('group', { name: 'Month' })

    expect(within(monthColumn).getByRole('button', { name: 'March' })).toHaveClass(
      styles.isSelected,
    )
    expect(within(monthColumn).getByRole('button', { name: 'February' })).toHaveClass(styles.isNear)
    expect(within(monthColumn).getByRole('button', { name: 'January' })).toHaveClass(styles.isFar)
    expect(within(monthColumn).getByRole('button', { name: 'July' })).toHaveClass(styles.isDistant)
  })

  it('scrolls the selected value onto the centre line', () => {
    render(<DateWheelPicker onSelect={vi.fn()} value="2026-03-10" />)

    const monthColumn = screen.getByRole('group', { name: 'Month' })

    expect(monthColumn.scrollTop).toEqual(longMonthNames.indexOf('March') * itemHeight)
  })

  it('commits whatever value settles on the centre line', () => {
    const onSelect = vi.fn()

    render(<DateWheelPicker onSelect={onSelect} value="2026-03-10" />)

    const monthColumn = screen.getByRole('group', { name: 'Month' })

    monthColumn.scrollTop = longMonthNames.indexOf('September') * itemHeight
    fireEvent.scroll(monthColumn)

    expect(onSelect).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(onSelect).toHaveBeenCalledWith('2026-09-10')
  })

  it('moves the highlight while the scroll is still settling', () => {
    const onSelect = vi.fn()

    render(<DateWheelPicker onSelect={onSelect} value="2026-03-10" />)

    const monthColumn = screen.getByRole('group', { name: 'Month' })

    monthColumn.scrollTop = longMonthNames.indexOf('September') * itemHeight
    fireEvent.scroll(monthColumn)

    // The wheel follows the finger immediately.
    expect(within(monthColumn).getByRole('button', { name: 'September' })).toHaveClass(
      styles.isSelected,
    )
    expect(within(monthColumn).getByRole('button', { name: 'March' })).toHaveClass(styles.isDistant)

    // The form still holds the old value, and that is what is reported.
    expect(onSelect).not.toHaveBeenCalled()
    expect(within(monthColumn).getByRole('button', { name: 'March' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('clamps the day when the settled month is shorter', () => {
    const onSelect = vi.fn()

    render(<DateWheelPicker onSelect={onSelect} value="2026-01-31" />)

    const monthColumn = screen.getByRole('group', { name: 'Month' })

    monthColumn.scrollTop = longMonthNames.indexOf('February') * itemHeight
    fireEvent.scroll(monthColumn)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(onSelect).toHaveBeenCalledWith('2026-02-28')
  })
})
