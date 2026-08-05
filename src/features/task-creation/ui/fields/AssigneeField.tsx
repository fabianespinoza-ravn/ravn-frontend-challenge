import { UserRound } from 'lucide-react'
import { getUserInitials, type User } from '@/entities/user/model/user'
import { Avatar } from '@/shared/ui/avatar/Avatar'
import type { TaskCreationForm } from '../../model/useTaskCreationForm'
import { FieldDropdown, type FieldVariant } from './FieldDropdown'
import styles from './FieldDropdown.module.css'

type AssigneeFieldProps = {
  assignees: User[]
  form: TaskCreationForm
  variant?: FieldVariant
}

export function AssigneeField({ assignees, form, variant }: AssigneeFieldProps) {
  const { setFieldValue, values } = form
  const selectedAssignee = assignees.find((assignee) => assignee.id === values.assigneeId) ?? null

  return (
    <FieldDropdown
      isFilled={Boolean(selectedAssignee)}
      label="Assignee"
      panelTitle="Assign To..."
      trigger={
        selectedAssignee ? (
          <>
            <AssigneeAvatar assignee={selectedAssignee} />
            <span className={styles.triggerLabel}>{selectedAssignee.fullName}</span>
          </>
        ) : (
          <>
            <UserRound aria-hidden="true" size={16} />
            <span className={styles.triggerLabel}>Assignee</span>
          </>
        )
      }
      value={selectedAssignee?.fullName}
      variant={variant}
    >
      {(close) =>
        assignees.length === 0 ? (
          <p className={styles.emptyState}>No teammates are available yet.</p>
        ) : (
          assignees.map((assignee) => (
            <button
              aria-pressed={assignee.id === values.assigneeId}
              className={styles.option}
              key={assignee.id}
              onClick={() => {
                setFieldValue('assigneeId', assignee.id)
                close()
              }}
              type="button"
            >
              <AssigneeAvatar assignee={assignee} />
              {assignee.fullName}
            </button>
          ))
        )
      }
    </FieldDropdown>
  )
}

/**
 * The name is always rendered next to the avatar, so the avatar itself is
 * hidden from assistive technology instead of repeating that name.
 */
function AssigneeAvatar({ assignee }: { assignee: User }) {
  return (
    <span aria-hidden="true" className={styles.optionIcon}>
      <Avatar
        alt=""
        initials={getUserInitials(assignee.fullName)}
        size="small"
        src={assignee.avatar}
      />
    </span>
  )
}
