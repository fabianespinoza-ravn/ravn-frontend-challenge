import { useCallback, useState } from 'react'
import type { Task } from '@/entities/task/model/task'
import { useDeleteTask } from './useDeleteTask'

type UseTaskDeletionWorkflowOptions = {
  /** How a finished mutation reaches the reader; see `useTransientStatus`. */
  announce: (message: string) => void
}

/**
 * The task awaiting a delete confirmation, and what the confirmation does.
 *
 * Held above the card rather than in the menu that opens it, because a
 * successful deletion takes that card off the board and a dialog owned by the
 * card would go with it.
 */
export function useTaskDeletionWorkflow({ announce }: UseTaskDeletionWorkflowOptions) {
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [runDeleteTask, { error: deletionError, loading: isDeleting, reset: resetDeletion }] =
    useDeleteTask()

  const cancel = useCallback(() => {
    setDeletingTask(null)
    // Otherwise a failure from this task would greet the next confirmation.
    resetDeletion()
  }, [resetDeletion])

  const confirm = useCallback(async () => {
    if (!deletingTask) {
      return
    }

    try {
      await runDeleteTask({ variables: { input: { id: deletingTask.id } } })
      setDeletingTask(null)
      /* Generic on purpose: the dialog named the task before the action ran. */
      announce('Task deleted successfully.')
    } catch {
      // Reported in the dialog, which stays open so it can be tried again.
    }
  }, [announce, deletingTask, runDeleteTask])

  return {
    cancel,
    confirm,
    deletingTask,
    hasFailed: Boolean(deletionError),
    isDeleting,
    /* A `useState` setter, so the context memo holding it stays stable. */
    requestDeletion: setDeletingTask,
  }
}
