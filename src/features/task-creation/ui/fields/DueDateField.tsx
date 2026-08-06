import { CalendarCheck } from 'lucide-react'
import { formatDueDateLabel } from '../../model/dueDate'
import type { TaskCreationForm } from '../../model/useTaskCreationForm'
import { DatePicker } from './DatePicker'
import { DateWheelPicker } from './DateWheelPicker'
import { FieldDropdown, type FieldVariant } from './FieldDropdown'
import styles from './FieldDropdown.module.css'

type DueDateFieldProps = {
  form: TaskCreationForm
  variant?: FieldVariant
}

export function DueDateField({ form, variant }: DueDateFieldProps) {
  const { setFieldValue, values } = form
  const selectedLabel = formatDueDateLabel(values.dueDate)
  const isRow = variant === 'row'

  return (
    <FieldDropdown
      isFilled={Boolean(selectedLabel)}
      label="Due date"
      panelClassName={
        isRow ? `${styles.panelFitsContent} ${styles.wheelPanel}` : styles.panelFitsContent
      }
      trigger={
        <>
          <CalendarCheck aria-hidden="true" size={16} />
          <span className={styles.triggerLabel}>{selectedLabel ?? 'Due date'}</span>
        </>
      }
      value={selectedLabel ?? undefined}
      variant={variant}
    >
      {(close) =>
        isRow ? (
          /*
           * The wheel keeps its dropdown open: month, day, and year are three
           * separate choices, so closing after the first would force the user
           * to reopen the field twice.
           */
          <DateWheelPicker
            onSelect={(nextValue) => setFieldValue('dueDate', nextValue)}
            value={values.dueDate}
          />
        ) : (
          <DatePicker
            onSelect={(nextValue) => {
              setFieldValue('dueDate', nextValue)
              close()
            }}
            value={values.dueDate}
          />
        )
      }
    </FieldDropdown>
  )
}
