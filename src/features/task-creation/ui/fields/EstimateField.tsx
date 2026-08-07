import { Diff } from 'lucide-react'
import { pointEstimates } from '@/entities/task/model/apiTask'
import { getPointEstimateLabel } from '@/entities/task/model/taskLabels'
import type { TaskCreationForm } from '../../model/useTaskCreationForm'
import { FieldDropdown, type FieldVariant } from './FieldDropdown'
import styles from './FieldDropdown.module.css'

type EstimateFieldProps = {
  form: TaskCreationForm
  isInvalid?: boolean
  variant?: FieldVariant
}

export function EstimateField({ form, isInvalid, variant }: EstimateFieldProps) {
  const { setFieldValue, values } = form
  const selectedLabel = values.pointEstimate ? getPointEstimateLabel(values.pointEstimate) : null

  return (
    <FieldDropdown
      isFilled={Boolean(selectedLabel)}
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
