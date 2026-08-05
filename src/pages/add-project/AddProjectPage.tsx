import { X } from 'lucide-react'
import type { User } from '@/entities/user/model/user'
import {
  taskCreationFormId,
  taskCreationTitleId,
} from '@/features/task-creation/model/taskCreationForm'
import type { TaskCreationForm } from '@/features/task-creation/model/useTaskCreationForm'
import { TaskForm } from '@/features/task-creation/ui/TaskForm'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import styles from './AddProjectPage.module.css'

type AddProjectPageProps = {
  assignees?: User[]
  form: TaskCreationForm
  onClose: () => void
}

export function AddProjectPage({ assignees, form, onClose }: AddProjectPageProps) {
  const { values } = form
  // Visual affordance only. The mutation commit turns this into real validation.
  const isReady = Boolean(
    values.name && values.pointEstimate && values.status && values.dueDate && values.tags.length,
  )

  return (
    <section aria-labelledby={taskCreationTitleId} className={styles.root}>
      <h1 className={styles.visuallyHidden} id={taskCreationTitleId}>
        Create Task
      </h1>
      <header className={styles.actionBar}>
        <IconButton aria-label="Close task creation" onClick={onClose} size="small">
          <X aria-hidden="true" size={20} />
        </IconButton>
        <button
          className={isReady ? `${styles.createButton} ${styles.isReady}` : styles.createButton}
          form={taskCreationFormId}
          type="submit"
        >
          Create
        </button>
      </header>
      <TaskForm assignees={assignees} form={form} id={taskCreationFormId} />
    </section>
  )
}
