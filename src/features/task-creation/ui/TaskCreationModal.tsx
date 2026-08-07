import type { User } from '@/entities/user/model/user'
import { Button } from '@/shared/ui/button/Button'
import { Modal } from '@/shared/ui/modal/Modal'
import { taskCreationFormId } from '../model/taskCreationForm'
import type { TaskCreationForm } from '../model/useTaskCreationForm'
import { TaskCreationStatus } from './TaskCreationStatus'
import { TaskMetadataForm } from './TaskMetadataForm'
import styles from './TaskCreationModal.module.css'

type TaskCreationModalProps = {
  assignees?: User[]
  form: TaskCreationForm
  hasFailed?: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit?: () => void
}

export function TaskCreationModal({
  assignees,
  form,
  hasFailed = false,
  isSubmitting = false,
  onClose,
  onSubmit,
}: TaskCreationModalProps) {
  return (
    <Modal label="Create Task" onClose={onClose} panelClassName={styles.panel}>
      <TaskMetadataForm
        assignees={assignees}
        form={form}
        id={taskCreationFormId}
        onSubmit={onSubmit}
      />
      <footer className={styles.footer}>
        <TaskCreationStatus
          className={styles.status}
          hasFailed={hasFailed}
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
        <Button disabled={isSubmitting} form={taskCreationFormId} type="submit">
          {isSubmitting ? 'Creating…' : 'Create'}
        </Button>
      </footer>
    </Modal>
  )
}
