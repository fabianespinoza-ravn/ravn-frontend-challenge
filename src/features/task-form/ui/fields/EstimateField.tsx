import { Diff } from 'lucide-react'
import { pointEstimates } from '@/entities/task/model/apiTask'
import { getPointEstimateLabel } from '@/entities/task/model/taskLabels'
import { taskFormStatusId } from '../../model/taskForm'
import type { TaskFormState } from '../../model/useTaskFormState'
import { FieldDropdown, type FieldVariant } from '@/shared/ui/field-dropdown/FieldDropdown'
import styles from '@/shared/ui/field-dropdown/FieldDropdown.module.css'

type EstimateFieldProps = {
  form: TaskFormState
  isInvalid?: boolean
  variant?: FieldVariant
}

export function EstimateField({ form, isInvalid, variant }: EstimateFieldProps) {
  const { setFieldValue, values } = form
  const selectedLabel = values.pointEstimate ? getPointEstimateLabel(values.pointEstimate) : null

  return (
    <FieldDropdown
      isFilled={Boolean(selectedLabel)}
      describedBy={isInvalid ? taskFormStatusId : undefined}
      isInvalid={isInvalid}
      label="Estimate"
      panelTitle="Estimate"
      trigger={
        <>
          <Diff aria-hidden="true" size={16} />
          <span className={styles.triggerLabel}>{selectedLabel ?? 'Estimate'}</span>
        </>
      }
      value={selectedLabel ?? undefined}
      variant={variant}
    >
      {(close) =>
        pointEstimates.map((pointEstimate) => (
          <button
            aria-pressed={values.pointEstimate === pointEstimate}
            className={styles.option}
            key={pointEstimate}
            onClick={() => {
              setFieldValue('pointEstimate', pointEstimate)
              close()
            }}
            type="button"
          >
            <span className={styles.optionIcon}>
              <Diff aria-hidden="true" size={16} />
            </span>
            {getPointEstimateLabel(pointEstimate)}
          </button>
        ))
      }
    </FieldDropdown>
  )
}
