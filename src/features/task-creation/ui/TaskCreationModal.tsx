import type { User } from '@/entities/user/model/user'
import { Button } from '@/shared/ui/button/Button'
import { Modal } from '@/shared/ui/modal/Modal'
import { taskCreationFormId } from '../model/taskCreationForm'
import type { TaskCreationForm } from '../model/useTaskCreationForm'
import { TaskMetadataForm } from './TaskMetadataForm'
import styles from './TaskCreationModal.module.css'

type TaskCreationModalProps = {
  assignees?: User[]
  form: TaskCreationForm
  onClose: () => void
}

export function TaskCreationModal({ assignees, form, onClose }: TaskCreationModalProps) {
  return (
    <Modal label="Create Task" onClose={onClose} panelClassName={styles.panel}>
      <TaskMetadataForm assignees={assignees} form={form} id={taskCreationFormId} />
      <footer className={styles.footer}>
        <button className={styles.cancelButton} onClick={onClose} type="button">
          Cancel
        </button>
        <Button form={taskCreationFormId} type="submit">
          Create
        </Button>
      </footer>
    </Modal>
  )
}
