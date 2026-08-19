import { useCallback, useMemo, useState } from 'react'
import { GET_TASKS } from '@/entities/task/api/taskOperations'
import type { Task } from '@/entities/task/model/task'
import { useUsers } from '@/entities/user/model/useUsers'
import { useIsNarrowViewport } from '@/shared/lib/viewport/useIsNarrowViewport'
import { toCreateTaskInput, toTaskFormValues, toUpdateTaskInput } from './taskForm'
import { useCreateTask } from './useCreateTask'
import { useTaskFormState } from './useTaskFormState'
import { useUpdateTask } from './useUpdateTask'

type UseTaskFormWorkflowOptions = {
  /** How a finished mutation reaches the reader; see `useTransientStatus`. */
  announce: (message: string) => void
}

/**
 * One draft, two mutations, two containers.
 *
 * Held above the routes rather than inside them because the same draft has to
 * survive a route change and a breakpoint change, and because both containers
 * assign from one users query. `useTaskFormState` owns the values; this owns
 * the cycle around them: which task is open, which mutation it is addressed to,
 * and what happens when it lands.
 */
export function useTaskFormWorkflow({ announce }: UseTaskFormWorkflowOptions) {
  const [isOpen, setIsOpen] = useState(false)
  /*
   * The modal opens exactly where the toolbar add-task control becomes visible,
   * so that control always leads to the same container. Below that width the
   * only creation entry points are Add Project and the Android action button,
   * which both open the full-page composition.
   */
  const supportsModal = !useIsNarrowViewport()
  /*
   * The task being edited, or `null` while the draft is a new one. It decides
   * which mutation the same form submits to, and both containers read it to
   * name what they are doing.
   */
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const form = useTaskFormState()
  const resetFormState = form.reset
  const loadFormValues = form.loadValues
  // Both containers assign from the same list, so whoever owns the draft also
  // fetches it, and only once a draft exists to assign.
  const { data: usersData } = useUsers({ skip: !isOpen })
  const [createTask, { error: creationError, loading: isCreating, reset: resetCreation }] =
    useCreateTask()
  const [updateTask, { error: updateError, loading: isUpdating, reset: resetUpdate }] =
    useUpdateTask()

  const close = useCallback(() => {
    setIsOpen(false)
    setEditingTask(null)
    resetFormState()
    // Otherwise a failure from this draft would greet the next one.
    resetCreation()
    resetUpdate()
  }, [resetCreation, resetFormState, resetUpdate])

  const editTask = useCallback(
    (task: Task) => {
      resetCreation()
      resetUpdate()
      loadFormValues(toTaskFormValues(task))
      setEditingTask(task)
      setIsOpen(true)
    },
    [loadFormValues, resetCreation, resetUpdate],
  )

  /*
   * An incomplete draft never reaches the API: the form has already recorded the
   * attempt by the time this runs, so returning here is what turns the press
   * into field messages instead of a request. A failure leaves the draft open,
   * and the mutation's own error state is what the containers render.
   */
  const submit = useCallback(async () => {
    /*
     * The same complete draft, addressed to whichever mutation this composition
     * was opened for. Editing cannot reuse the creation input: an empty
     * assignee has to leave as an explicit `null` there, or clearing one would
     * succeed without changing anything (6.1).
     */
    const input = editingTask
      ? toUpdateTaskInput(editingTask.id, form.values)
      : toCreateTaskInput(form.values)

    if (!input) {
      return
    }

    try {
      // `id` belongs to the update input alone, so it narrows the two apart.
      if ('id' in input) {
        /*
         * The mutation answers with the whole task, and the cache stores it
         * under its id, so every view showing it updates without being asked
         * again. The one thing that cannot follow from a value is membership
         * of a list the server filters: My Tasks asks for one assignee's
         * tasks, so a reassignment has to move the task in or out of it, and
         * only the server can say so. Every other field is a value alone.
         */
        const hasAssigneeChanged = (editingTask?.assignee?.id ?? '') !== form.values.assigneeId

        await updateTask({
          variables: { input },
          ...(hasAssigneeChanged ? { refetchQueries: [GET_TASKS] } : {}),
        })
      } else {
        await createTask({ variables: { input } })
      }

      close()
      /*
       * One success path serves both mutations, so the sentence is what says
       * which one finished. Create is included even though the review named
       * update and delete: staying silent here would take an extra condition,
       * and would leave one CRUD operation as the exception on a surface the
       * other two share.
       */
      announce(editingTask ? 'Task updated successfully.' : 'Task created successfully.')
    } catch {
      // Reported through the mutation's own error; the draft stays as it was.
    }
  }, [announce, close, createTask, editingTask, form.values, updateTask])

  const context = useMemo(
    () => ({
      openTaskForm: () => {
        // A new draft never inherits the task the last one was editing.
        setEditingTask(null)
        setIsOpen(true)
      },
    }),
    [],
  )

  return {
    assignees: usersData?.users,
    close,
    context,
    editTask,
    form,
    hasFailed: Boolean(creationError ?? updateError),
    isEditing: Boolean(editingTask),
    /* Only the full-page composition hides the current route. */
    isFullPageOpen: isOpen && !supportsModal,
    isModalOpen: isOpen && supportsModal,
    isSubmitting: isCreating || isUpdating,
    submit,
  }
}
