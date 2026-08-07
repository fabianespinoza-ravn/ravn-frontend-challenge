import { X } from 'lucide-react'
import type { User } from '@/entities/user/model/user'
import {
  taskCreationFormId,
  taskCreationTitleId,
  toCreateTaskInput,
} from '@/features/task-creation/model/taskCreationForm'
import type { TaskCreationForm } from '@/features/task-creation/model/useTaskCreationForm'
import { TaskCreationStatus } from '@/features/task-creation/ui/TaskCreationStatus'
import { TaskForm } from '@/features/task-creation/ui/TaskForm'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import styles from './AddProjectPage.module.css'

type AddProjectPageProps = {
  assignees?: User[]
  form: TaskCreationForm
  hasFailed?: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit?: () => void
}

export function AddProjectPage({
  assignees,
  form,
  hasFailed = false,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AddProjectPageProps) {
  const isReady = toCreateTaskInput(form.values) !== null

  return (
    <section aria-labelledby={taskCreationTitleId} className={styles.root}>
      <h1 className={styles.visuallyHidden} id={taskCreationTitleId}>
        Create Task
      </h1>
      <header className={styles.actionBar}>
        <IconButton aria-label="Close task creation" onClick={onClose} size="small">
          <X aria-hidden="true" size={20} />
        </IconButton>
        {/*
         * Solid once the draft is complete, but never disabled for being
         * incomplete: pressing it is how the missing fields are named. Only a
         * request already in flight takes the control away.
         */}
        <button
          className={isReady ? `${styles.createButton} ${styles.isReady}` : styles.createButton}
          disabled={isSubmitting}
          form={taskCreationFormId}
          type="submit"
        >
          {isSubmitting ? 'Creating…' : 'Create'}
        </button>
      </header>
      <TaskCreationStatus
        className={styles.status}
        hasFailed={hasFailed}
        missingFields={form.missingFields}
      />
      <TaskForm assignees={assignees} form={form} id={taskCreationFormId} onSubmit={onSubmit} />
    </section>
  )
}
