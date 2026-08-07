import { UserRound } from 'lucide-react'
import { getUserInitials, type User } from '@/entities/user/model/user'
import { Avatar } from '@/shared/ui/avatar/Avatar'
import type { TaskFormState } from '../../model/useTaskFormState'
import { FieldDropdown, type FieldVariant } from '@/shared/ui/field-dropdown/FieldDropdown'
import styles from '@/shared/ui/field-dropdown/FieldDropdown.module.css'

type AssigneeFieldProps = {
  assignees: User[]
  form: TaskFormState
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
          /*
           * Nobody is an option, not just a starting state. A new draft reaches
           * it by leaving the control alone, but an existing task cannot be
           * handed back without it, and clearing an assignee is the one edit
           * that has to travel as an explicit null (6.1).
           */
          <>
            <button
              aria-pressed={values.assigneeId === ''}
              className={styles.option}
              onClick={() => {
                setFieldValue('assigneeId', '')
                close()
              }}
              type="button"
            >
              <span aria-hidden="true" className={styles.optionIcon}>
                <UserRound size={16} />
              </span>
              Unassigned
            </button>
            {assignees.map((assignee) => (
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
            ))}
          </>
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
