import { useEffect, useRef, useState } from 'react'
import {
  getDaysInMonth,
  longMonthNames,
  parseDueDateValue,
  toDueDateValue,
} from '../../model/dueDate'
import styles from './DateWheelPicker.module.css'

const yearsBefore = 2
const yearsAfter = 8

/** How long the column stays still before its centred value is committed. */
const settleDelay = 120

type WheelItem = {
  label: string
  value: number
}

type DateWheelPickerProps = {
  onSelect: (value: string) => void
  value: string
}

type WheelColumnProps = {
  items: WheelItem[]
  label: string
  onSelect: (value: number) => void
  selected: number
}

/**
 * The iOS three-column wheel. Each column scrolls vertically and snaps to the
 * nearest item; it highlights whatever passes under the centre line as it moves
 * but commits only once it settles. The items stay buttons so the same control
 * is usable by pointer, keyboard, and assistive technology, which a drag-only
 * wheel would not be.
 */
export function DateWheelPicker({ onSelect, value }: DateWheelPickerProps) {
  const selectedDate = parseDueDateValue(value) ?? new Date()
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const day = selectedDate.getDate()

  const baseYear = new Date().getFullYear()
  const firstYear = Math.min(baseYear - yearsBefore, year)
  const lastYear = Math.max(baseYear + yearsAfter, year)

  function select(nextYear: number, nextMonth: number, nextDay: number) {
    // Moving to a shorter month must not roll the date into the next one.
    const clampedDay = Math.min(nextDay, getDaysInMonth(nextYear, nextMonth))

    onSelect(toDueDateValue(new Date(nextYear, nextMonth, clampedDay)))
  }

  return (
    <div className={styles.root}>
      <div aria-hidden="true" className={styles.centreLine} />
      <WheelColumn
        items={longMonthNames.map((name, index) => ({ label: name, value: index }))}
        label="Month"
        onSelect={(nextMonth) => select(year, nextMonth, day)}
        selected={month}
      />
      <WheelColumn
        items={Array.from({ length: getDaysInMonth(year, month) }, (_, index) => ({
          label: `${index + 1}`,
          value: index + 1,
        }))}
        label="Day"
        onSelect={(nextDay) => select(year, month, nextDay)}
        selected={day}
      />
      <WheelColumn
        items={Array.from({ length: lastYear - firstYear + 1 }, (_, index) => ({
          label: `${firstYear + index}`,
          value: firstYear + index,
        }))}
        label="Year"
        onSelect={(nextYear) => select(nextYear, month, day)}
        selected={year}
      />
    </div>
  )
}

function getDepthClassName(distance: number) {
  if (distance === 0) {
    return `${styles.item} ${styles.isSelected}`
  }

  if (distance === 1) {
    return `${styles.item} ${styles.isNear}`
  }

  if (distance === 2) {
    return `${styles.item} ${styles.isFar}`
  }

  return `${styles.item} ${styles.isDistant}`
}

/** The scroll maths reads this back, so `.item` must never wrap to two lines. */
function measureItemHeight(list: HTMLDivElement) {
  return list.querySelector('button')?.clientHeight ?? 0
}

function WheelColumn({ items, label, onSelect, selected }: WheelColumnProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const settleTimeoutRef = useRef<number | null>(null)
  /** The last value this column committed, to tell its own change from an outside one. */
  const committedValueRef = useRef(selected)
  const hasCentredRef = useRef(false)
  const selectedIndex = items.findIndex((item) => item.value === selected)
  /*
   * What sits under the centre line right now, which is deliberately not what
   * the form holds: the wheel follows the finger immediately and only commits
   * once it settles, so the two facts need separate state.
   */
  const [centredIndex, setCentredIndex] = useState(selectedIndex)

  /*
   * Centre the selection when it changes from outside the column, which is what
   * happens on open, when a tapped item needs to travel to the centre, and when
   * a shorter month clamps the day. The highlight is deliberately not set here:
   * moving the scroll position emits the scroll events that already maintain it,
   * so the centre line keeps a single source of truth.
   */
  useEffect(() => {
    const list = listRef.current

    if (!list || selectedIndex < 0) {
      return
    }

    /*
     * A value this column just committed already sits on the centre line, and
     * scrolling it again would fight the momentum the browser is still
     * resolving under the user's finger.
     */
    if (hasCentredRef.current && committedValueRef.current === selected) {
      return
    }

    const itemHeight = measureItemHeight(list)

    if (itemHeight === 0) {
      return
    }

    if (hasCentredRef.current) {
      // The stylesheet makes this glide; only programmatic scrolls are smoothed.
      list.scrollTop = selectedIndex * itemHeight

      return
    }

    // Opening the panel must land on the value, not animate up to it.
    list.style.scrollBehavior = 'auto'
    list.scrollTop = selectedIndex * itemHeight
    list.style.scrollBehavior = ''
    hasCentredRef.current = true
  }, [selected, selectedIndex])

  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current !== null) {
        window.clearTimeout(settleTimeoutRef.current)
      }
    }
  }, [])

  function handleScroll() {
    const list = listRef.current
    const itemHeight = list ? measureItemHeight(list) : 0

    if (!list || itemHeight === 0) {
      return
    }

    const nextCentredIndex = Math.min(
      Math.max(Math.round(list.scrollTop / itemHeight), 0),
      items.length - 1,
    )

    // The highlight tracks the scroll; React drops the render when it is unchanged.
    setCentredIndex(nextCentredIndex)

    if (settleTimeoutRef.current !== null) {
      window.clearTimeout(settleTimeoutRef.current)
    }

    settleTimeoutRef.current = window.setTimeout(() => {
      const centredItem = items[nextCentredIndex]

      if (centredItem && centredItem.value !== selected) {
        committedValueRef.current = centredItem.value
        onSelect(centredItem.value)
      }
    }, settleDelay)
  }

  return (
    <div
      aria-label={label}
      className={styles.column}
      onScroll={handleScroll}
      ref={listRef}
      role="group"
    >
      <div aria-hidden="true" className={styles.spacer} />
      {items.map((item, index) => (
        <button
          /* Reports the committed value, not one merely gliding past the line. */
          aria-pressed={item.value === selected}
          className={getDepthClassName(Math.abs(index - centredIndex))}
          key={item.value}
          onClick={() => onSelect(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
      <div aria-hidden="true" className={styles.spacer} />
    </div>
  )
}
