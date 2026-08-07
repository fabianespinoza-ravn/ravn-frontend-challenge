import { X } from 'lucide-react'
import type { User } from '@/entities/user/model/user'
import { taskFormId, taskFormTitleId, toCreateTaskInput } from '@/features/task-form/model/taskForm'
import type { TaskFormState } from '@/features/task-form/model/useTaskFormState'
import { TaskFormStatus } from '@/features/task-form/ui/TaskFormStatus'
import { TaskForm } from '@/features/task-form/ui/TaskForm'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import styles from './AddProjectPage.module.css'

type AddProjectPageProps = {
  assignees?: User[]
  form: TaskFormState
  hasFailed?: boolean
  /* The same composition serves both mutations, so it has to say which. */
  isEditing?: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit?: () => void
}

export function AddProjectPage({
  assignees,
  form,
  hasFailed = false,
  isEditing = false,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AddProjectPageProps) {
  /*
   * Completeness is the same question for either mutation, since both refuse
   * the same missing fields, so the creation input is what answers it.
   */
  const isReady = toCreateTaskInput(form.values) !== null

  return (
    <section aria-labelledby={taskFormTitleId} className={styles.root}>
      <h1 className={styles.visuallyHidden} id={taskFormTitleId}>
        {isEditing ? 'Edit Task' : 'Create Task'}
      </h1>
      <header className={styles.actionBar}>
        <IconButton
          aria-label={isEditing ? 'Close task editing' : 'Close task creation'}
          onClick={onClose}
          size="small"
        >
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
          form={taskFormId}
          type="submit"
        >
          {isEditing ? (isSubmitting ? 'Saving…' : 'Save') : isSubmitting ? 'Creating…' : 'Create'}
        </button>
      </header>
      <TaskFormStatus
        className={styles.status}
        hasFailed={hasFailed}
        missingFields={form.missingFields}
      />
      <TaskForm assignees={assignees} form={form} id={taskFormId} onSubmit={onSubmit} />
    </section>
  )
}
