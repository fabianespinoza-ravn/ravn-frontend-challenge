import { taskStatuses } from '@/entities/task/model/task'
import { StatusDot } from '@/entities/task/ui/StatusDot'
import { taskFormStatusId } from '../../model/taskForm'
import type { TaskFormState } from '../../model/useTaskFormState'
import { FieldDropdown, type FieldVariant } from '@/shared/ui/field-dropdown/FieldDropdown'
import styles from '@/shared/ui/field-dropdown/FieldDropdown.module.css'

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
      describedBy={isInvalid ? taskFormStatusId : undefined}
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
