import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  formatFullDateLabel,
  formatMonthLabel,
  formatWeekdayDateLabel,
  getCalendarDays,
  isSameDay,
  parseDueDateValue,
  toDueDateValue,
} from '../../model/dueDate'
import styles from './MaterialDatePicker.module.css'

const weekdayInitials = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

type MaterialDatePickerProps = {
  onCancel: () => void
  onSelect: (value: string) => void
  value: string
}

/**
 * The Android presentation of the due date. The desktop calendar and the iOS
 * wheel both write to the draft the moment a value is chosen, but this dialog
 * holds a pending day until `OK`, because that is what its own footer promises:
 * `Cancel` has to be able to leave the draft exactly as it found it.
 */
export function MaterialDatePicker({ onCancel, onSelect, value }: MaterialDatePickerProps) {
  const today = new Date()
  const [pendingDate, setPendingDate] = useState(() => parseDueDateValue(value) ?? today)
  const [visibleMonth, setVisibleMonth] = useState(() => ({
    month: pendingDate.getMonth(),
    year: pendingDate.getFullYear(),
  }))

  function shiftMonths(months: number) {
    setVisibleMonth((current) => {
      const shifted = new Date(current.year, current.month + months, 1)

      return { month: shifted.getMonth(), year: shifted.getFullYear() }
    })
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.headerYear}>{pendingDate.getFullYear()}</p>
        <p className={styles.headerDate}>{formatWeekdayDateLabel(pendingDate)}</p>
      </header>

      <div className={styles.monthNavigation}>
        <button
          aria-label="Previous month"
          className={styles.navigationButton}
          onClick={() => shiftMonths(-1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" size={18} />
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
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>

      <div aria-hidden="true" className={styles.weekdays}>
        {weekdayInitials.map((initial, index) => (
          <span key={`${initial}-${index}`}>{initial}</span>
        ))}
      </div>

      <div className={styles.days}>
        {getCalendarDays(visibleMonth.year, visibleMonth.month).map((day) => {
          /*
           * Material shows one month at a time rather than padding the grid with
           * its neighbours, so the surrounding cells stay blank to hold the
           * columns in place.
           */
          if (day.getMonth() !== visibleMonth.month) {
            return <span aria-hidden="true" className={styles.blank} key={day.toDateString()} />
          }

          const isPending = isSameDay(day, pendingDate)
          const dayClassName = [
            styles.day,
            isSameDay(day, today) ? styles.isToday : '',
            isPending ? styles.isPending : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              aria-label={formatFullDateLabel(day)}
              aria-pressed={isPending}
              className={dayClassName}
              key={day.toDateString()}
              onClick={() => setPendingDate(day)}
              type="button"
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>

      <footer className={styles.footer}>
        <button className={styles.cancelButton} onClick={onCancel} type="button">
          Cancel
        </button>
        <button
          className={styles.confirmButton}
          onClick={() => onSelect(toDueDateValue(pendingDate))}
          type="button"
        >
          OK
        </button>
      </footer>
    </div>
  )
}
