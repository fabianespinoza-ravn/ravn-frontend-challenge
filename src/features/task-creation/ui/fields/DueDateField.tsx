import { CalendarCheck } from 'lucide-react'
import { getMobilePlatform } from '@/shared/lib/platform/getMobilePlatform'
import { formatDueDateLabel } from '../../model/dueDate'
import type { TaskCreationForm } from '../../model/useTaskCreationForm'
import { DatePicker } from './DatePicker'
import { DateWheelPicker } from './DateWheelPicker'
import { MaterialDatePicker } from './MaterialDatePicker'
import { FieldDropdown, type FieldVariant } from './FieldDropdown'
import styles from './FieldDropdown.module.css'

type DueDateFieldProps = {
  form: TaskCreationForm
  isInvalid?: boolean
  variant?: FieldVariant
}

export function DueDateField({ form, isInvalid, variant }: DueDateFieldProps) {
  const { setFieldValue, values } = form
  const selectedLabel = formatDueDateLabel(values.dueDate)
  const isRow = variant === 'row'
  /*
   * The variant describes the layout, not the system, so the phone picker is
   * chosen here: the full-page composition is shared, but a wheel is an iOS
   * convention and Android expects its Material dialog instead.
   */
  const isAndroid = isRow && getMobilePlatform() === 'android'

  function getPanelClassName() {
    if (isAndroid) {
      return `${styles.panelFitsContent} ${styles.materialPanel}`
    }

    if (isRow) {
      return `${styles.panelFitsContent} ${styles.wheelPanel}`
    }

    return styles.panelFitsContent
  }

  return (
    <FieldDropdown
      isFilled={Boolean(selectedLabel)}
      isInvalid={isInvalid}
      label="Due date"
      panelClassName={getPanelClassName()}
      trigger={
        <>
          <CalendarCheck aria-hidden="true" size={16} />
          <span className={styles.triggerLabel}>{selectedLabel ?? 'Due date'}</span>
        </>
      }
      value={selectedLabel ?? undefined}
      variant={variant}
    >
      {(close) => {
        if (isAndroid) {
          return (
            <MaterialDatePicker
              onCancel={close}
              onSelect={(nextValue) => {
                setFieldValue('dueDate', nextValue)
                close()
              }}
              value={values.dueDate}
            />
          )
        }

        /*
         * The wheel keeps its dropdown open: month, day, and year are three
         * separate choices, so closing after the first would force the user to
         * reopen the field twice.
         */
        if (isRow) {
          return (
            <DateWheelPicker
              onSelect={(nextValue) => setFieldValue('dueDate', nextValue)}
              value={values.dueDate}
            />
          )
        }

        return (
          <DatePicker
            onSelect={(nextValue) => {
              setFieldValue('dueDate', nextValue)
              close()
            }}
            value={values.dueDate}
          />
        )
      }}
    </FieldDropdown>
  )
}
