import { Circle } from 'lucide-react'
import { taskStatuses } from '@/entities/task/model/task'
import type { TaskFormState } from '../../model/useTaskFormState'
import { FieldDropdown, type FieldVariant } from './FieldDropdown'
import styles from './FieldDropdown.module.css'

type StatusFieldProps = {
  form: TaskFormState
  isInvalid?: boolean
  variant?: FieldVariant
}

export function StatusField({ form, isInvalid, variant }: StatusFieldProps) {
  const { setFieldValue, values } = form
  const selectedStatus = taskStatuses.find((status) => status.value === values.status) ?? null

  return (
    <FieldDropdown
      isFilled={Boolean(selectedStatus)}
      isInvalid={isInvalid}
      label="Status"
      panelTitle="Status"
      trigger={
        <>
          <StatusDot color={selectedStatus?.color} />
          <span className={styles.triggerLabel}>{selectedStatus?.label ?? 'Status'}</span>
        </>
      }
      value={selectedStatus?.label}
      variant={variant}
    >
      {(close) =>
        taskStatuses.map((status) => (
          <button
            aria-pressed={values.status === status.value}
            className={styles.option}
            key={status.value}
            onClick={() => {
              setFieldValue('status', status.value)
              close()
            }}
            type="button"
          >
            <StatusDot color={status.color} />
            {status.label}
          </button>
        ))
      }
    </FieldDropdown>
  )
}

/**
 * Each status reuses the colour its board column already carries, and stays an
 * outline until one is chosen so the empty state is not mistaken for a value.
 */
function StatusDot({ color }: { color?: string }) {
  return (
    <span className={styles.optionIcon} style={color ? { color } : undefined}>
      <Circle aria-hidden="true" fill={color ?? 'none'} size={12} />
    </span>
  )
}
