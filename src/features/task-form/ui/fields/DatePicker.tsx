import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import {
  formatFullDateLabel,
  formatMonthLabel,
  getCalendarDays,
  isSameDay,
  parseDueDateValue,
  toDueDateValue,
} from '../../model/dueDate'
import styles from './DatePicker.module.css'

const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

type DatePickerProps = {
  onSelect: (value: string) => void
  value: string
}

export function DatePicker({ onSelect, value }: DatePickerProps) {
  const today = new Date()
  const selectedDate = parseDueDateValue(value)
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const anchor = selectedDate ?? today

    return { month: anchor.getMonth(), year: anchor.getFullYear() }
  })

  function shiftMonths(months: number) {
    setVisibleMonth((current) => {
      const shifted = new Date(current.year, current.month + months, 1)

      return { month: shifted.getMonth(), year: shifted.getFullYear() }
    })
  }

  const days = getCalendarDays(visibleMonth.year, visibleMonth.month)

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <button
          aria-label="Previous year"
          className={styles.navigationButton}
          onClick={() => shiftMonths(-12)}
          type="button"
        >
          <ChevronsLeft aria-hidden="true" size={16} />
        </button>
        <button
          aria-label="Previous month"
          className={styles.navigationButton}
          onClick={() => shiftMonths(-1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" size={16} />
        </button>
        <p aria-live="polite" className={styles.monthLabel}>
          {formatMonthLabel(visibleMonth.year, visibleMonth.month)}
        </p>
        <button
          aria-label="Next month"
          className={styles.navigationButton}
          onClick={() => shiftMonths(1)}
          type="button"
        >
          <ChevronRight aria-hidden="true" size={16} />
        </button>
        <button
          aria-label="Next year"
          className={styles.navigationButton}
          onClick={() => shiftMonths(12)}
          type="button"
        >
          <ChevronsRight aria-hidden="true" size={16} />
        </button>
      </div>

      <div aria-hidden="true" className={styles.weekdays}>
        {weekdayLabels.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className={styles.days}>
        {days.map((day) => {
          const isOutsideMonth = day.getMonth() !== visibleMonth.month
          const isSelected = selectedDate !== null && isSameDay(day, selectedDate)
          const dayClassName = [
            styles.day,
            isOutsideMonth ? styles.isOutsideMonth : '',
            isSameDay(day, today) ? styles.isToday : '',
            isSelected ? styles.isSelected : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              aria-label={formatFullDateLabel(day)}
              aria-pressed={isSelected}
              className={dayClassName}
              key={day.toDateString()}
              onClick={() => onSelect(toDueDateValue(day))}
              type="button"
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>

      <button
        className={styles.todayButton}
        onClick={() => onSelect(toDueDateValue(today))}
        type="button"
      >
        Today
      </button>
    </div>
  )
}
