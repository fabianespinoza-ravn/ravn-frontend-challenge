import { useEffect, useRef } from 'react'
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
 * nearest item, and whatever lands on the centre line becomes the selection.
 * The items stay buttons so the same control is usable by pointer, keyboard,
 * and assistive technology, which a drag-only wheel would not be.
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

function WheelColumn({ items, label, onSelect, selected }: WheelColumnProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const settleTimeoutRef = useRef<number | null>(null)
  const selectedIndex = items.findIndex((item) => item.value === selected)

  /*
   * Centre the selection whenever it changes from outside the column, which is
   * what happens on open and when a shorter month clamps the day.
   */
  useEffect(() => {
    const list = listRef.current
    const itemHeight = list?.querySelector('button')?.clientHeight ?? 0

    if (!list || selectedIndex < 0 || itemHeight === 0) {
      return
    }

    list.scrollTop = selectedIndex * itemHeight
  }, [selectedIndex])

  useEffect(() => {
    return () => {
      if (settleTimeoutRef.current !== null) {
        window.clearTimeout(settleTimeoutRef.current)
      }
    }
  }, [])

  function handleScroll() {
    if (settleTimeoutRef.current !== null) {
      window.clearTimeout(settleTimeoutRef.current)
    }

    settleTimeoutRef.current = window.setTimeout(() => {
      const list = listRef.current
      const itemHeight = list?.querySelector('button')?.clientHeight ?? 0

      if (!list || itemHeight === 0) {
        return
      }

      const centredIndex = Math.min(
        Math.max(Math.round(list.scrollTop / itemHeight), 0),
        items.length - 1,
      )
      const centredItem = items[centredIndex]

      if (centredItem && centredItem.value !== selected) {
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
          aria-pressed={item.value === selected}
          className={getDepthClassName(Math.abs(index - selectedIndex))}
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
