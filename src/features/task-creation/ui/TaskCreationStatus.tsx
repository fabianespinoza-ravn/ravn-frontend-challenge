import {
  requiredFieldLabels,
  taskCreationStatusId,
  type RequiredField,
} from '../model/taskCreationForm'
import styles from './TaskCreationStatus.module.css'

type TaskCreationStatusProps = {
  /** Spacing belongs to the container, which knows where the message sits. */
  className?: string
  hasFailed: boolean
  missingFields: RequiredField[]
}

function formatFieldList(fields: RequiredField[]) {
  const labels = fields.map((field) => requiredFieldLabels[field])

  if (labels.length === 1) {
    return labels[0]
  }

  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

/**
 * The draft's single live region, shared by validation and mutation failure.
 * Validation wins when both apply, because a draft that cannot be sent is the
 * more actionable complaint of the two.
 */
export function TaskCreationStatus({
  className,
  hasFailed,
  missingFields,
}: TaskCreationStatusProps) {
  const paragraphClassName = [styles.root, className].filter(Boolean).join(' ')

  if (missingFields.length > 0) {
    return (
      <p className={paragraphClassName} id={taskCreationStatusId} role="alert">
        {`Add ${formatFieldList(missingFields)} before creating this task.`}
      </p>
    )
  }

  if (hasFailed) {
    return (
      <p className={paragraphClassName} id={taskCreationStatusId} role="alert">
        The task could not be created. Your draft is still here, so you can try again.
      </p>
    )
  }

  return null
}
