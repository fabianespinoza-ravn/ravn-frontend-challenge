import { requiredFieldLabels, taskFormStatusId, type RequiredField } from '../model/taskForm'
import styles from './TaskFormStatus.module.css'

type TaskFormStatusProps = {
  /** Spacing belongs to the container, which knows where the message sits. */
  className?: string
  hasFailed: boolean
  /* The same region serves both mutations, so it has to name the right one. */
  isEditing?: boolean
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
 *
 * Both sentences name the operation in progress. The composition serves create
 * and edit, so a fixed verb would tell half the users the wrong thing.
 */
export function TaskFormStatus({
  className,
  hasFailed,
  isEditing = false,
  missingFields,
}: TaskFormStatusProps) {
  const paragraphClassName = [styles.root, className].filter(Boolean).join(' ')

  if (missingFields.length > 0) {
    return (
      <p className={paragraphClassName} id={taskFormStatusId} role="alert">
        {`Add ${formatFieldList(missingFields)} before ${isEditing ? 'updating' : 'creating'} this task.`}
      </p>
    )
  }

  if (hasFailed) {
    return (
      <p className={paragraphClassName} id={taskFormStatusId} role="alert">
        {`The task could not be ${isEditing ? 'updated' : 'created'}. Your draft is still here, so you can try again.`}
      </p>
    )
  }

  return null
}
