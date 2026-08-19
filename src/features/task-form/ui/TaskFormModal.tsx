import type { User } from '@/entities/user/model/user'
import { Button } from '@/shared/ui/button/Button'
import { Modal } from '@/shared/ui/modal/Modal'
import { taskFormId } from '../model/taskForm'
import type { TaskFormState } from '../model/useTaskFormState'
import { TaskFormStatus } from './TaskFormStatus'
import { TaskMetadataForm } from './TaskMetadataForm'
import styles from './TaskFormModal.module.css'

type TaskFormModalProps = {
  assignees?: User[]
  form: TaskFormState
  hasFailed?: boolean
  /* The same composition serves both mutations, so it has to say which. */
  isEditing?: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit?: () => void
}

export function TaskFormModal({
  assignees,
  form,
  hasFailed = false,
  isEditing = false,
  isSubmitting = false,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  return (
    <Modal
      label={isEditing ? 'Edit Task' : 'Create Task'}
      onClose={onClose}
      panelClassName={styles.panel}
    >
      <TaskMetadataForm assignees={assignees} form={form} id={taskFormId} onSubmit={onSubmit} />
      <footer className={styles.footer}>
        <TaskFormStatus
          className={styles.status}
          hasFailed={hasFailed}
          isEditing={isEditing}
          missingFields={form.missingFields}
        />
        <button
          className={styles.cancelButton}
          disabled={isSubmitting}
          onClick={onClose}
          type="button"
        >
          Cancel
        </button>
        {/*
         * Never disabled for an incomplete draft: pressing it is how the missing
         * fields get named. Only a request already in flight takes it away.
         */}
        <Button disabled={isSubmitting} form={taskFormId} type="submit">
          {isEditing ? (isSubmitting ? 'Saving…' : 'Save') : isSubmitting ? 'Creating…' : 'Create'}
        </Button>
      </footer>
    </Modal>
  )
}
