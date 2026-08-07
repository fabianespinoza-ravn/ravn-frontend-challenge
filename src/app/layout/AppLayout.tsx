import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { GET_TASKS } from '@/entities/task/api/taskOperations'
import type { Task } from '@/entities/task/model/task'
import { TaskActionsContext } from '@/features/task-actions/model/taskActionsContext'
import { useDeleteTask } from '@/features/task-actions/model/useDeleteTask'
import { DeleteTaskDialog } from '@/features/task-actions/ui/DeleteTaskDialog'
import { TaskFormContext } from '@/features/task-form/model/taskFormContext'
import { TaskSearchContext } from '@/features/task-search/model/taskSearchContext'
import {
  toCreateTaskInput,
  toTaskFormValues,
  toUpdateTaskInput,
} from '@/features/task-form/model/taskForm'
import { useCreateTask } from '@/features/task-form/model/useCreateTask'
import { useTaskFormState } from '@/features/task-form/model/useTaskFormState'
import { useUpdateTask } from '@/features/task-form/model/useUpdateTask'
import { TaskFormModal } from '@/features/task-form/ui/TaskFormModal'
import { useUsers } from '@/entities/user/model/useUsers'
import { getMobilePlatform } from '@/shared/lib/platform/getMobilePlatform'
import { useDebouncedValue } from '@/shared/lib/timing/useDebouncedValue'
import { AddProjectPage } from '@/pages/add-project/AddProjectPage'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import { AppHeader } from '@/widgets/app-header/AppHeader'
import { AppSidebar } from '@/widgets/app-sidebar/AppSidebar'
import styles from './AppLayout.module.css'

/**
 * The modal opens exactly where the toolbar add-task control becomes visible,
 * so that control always leads to the same container. Below this width the only
 * creation entry points are Add Project and the Android action button, which
 * both open the full-page composition.
 */
const taskFormModalBreakpoint = 768

/*
 * Named positively rather than as everything except Settings, so a route added
 * later has to ask for the task search instead of inheriting one it may have no
 * tasks for. Not Found is already such a route.
 */
const taskRoutes = ['/dashboard', '/my-tasks']

/* Long enough that a typed word is one request, short enough to feel live. */
const searchDebounceDelay = 300

export function AppLayout() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [supportsTaskFormModal, setSupportsTaskFormModal] = useState(
    () => window.innerWidth >= taskFormModalBreakpoint,
  )
  /*
   * The task being edited, or `null` while the draft is a new one. It decides
   * which mutation the same form submits to, and both containers read it to
   * name what they are doing.
   */
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  /*
   * The task awaiting a delete confirmation. It is held here rather than in the
   * menu because a successful deletion refetches the board, which unmounts the
   * card the menu belongs to; a dialog owned by that card would go with it.
   */
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const taskForm = useTaskFormState()
  const resetTaskFormState = taskForm.reset
  const loadTaskFormValues = taskForm.loadValues
  // Both containers assign from the same list, so the layout that owns the
  // draft also fetches it, and only once a draft exists to assign.
  const { data: usersData } = useUsers({ skip: !isTaskFormOpen })
  const [createTask, { error: creationError, loading: isCreatingTask, reset: resetCreation }] =
    useCreateTask()
  const [updateTask, { error: updateError, loading: isUpdatingTask, reset: resetUpdate }] =
    useUpdateTask()
  const [runDeleteTask, { error: deletionError, loading: isDeletingTask, reset: resetDeletion }] =
    useDeleteTask()
  const mobilePlatform = getMobilePlatform()
  const isAndroid = mobilePlatform === 'android'
  const hasTaskSearch = taskRoutes.includes(useLocation().pathname)
  const [searchTerm, setSearchTerm] = useState('')
  /*
   * The field follows every keystroke; the query waits for a pause. Trimmed
   * because a trailing space is a search nobody meant to run.
   */
  const appliedSearchTerm = useDebouncedValue(searchTerm.trim(), searchDebounceDelay)

  useEffect(() => {
    function syncViewport() {
      setSupportsTaskFormModal(window.innerWidth >= taskFormModalBreakpoint)
    }

    window.addEventListener('resize', syncViewport)

    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  const closeTaskForm = useCallback(() => {
    setIsTaskFormOpen(false)
    setEditingTask(null)
    resetTaskFormState()
    // Otherwise a failure from this draft would greet the next one.
    resetCreation()
    resetUpdate()
  }, [resetCreation, resetTaskFormState, resetUpdate])

  const editTask = useCallback(
    (task: Task) => {
      resetCreation()
      resetUpdate()
      loadTaskFormValues(toTaskFormValues(task))
      setEditingTask(task)
      setIsTaskFormOpen(true)
    },
    [loadTaskFormValues, resetCreation, resetUpdate],
  )

  /*
   * An incomplete draft never reaches the API: the form has already recorded the
   * attempt by the time this runs, so returning here is what turns the press
   * into field messages instead of a request. A failure leaves the draft open,
   * and the mutation's own error state is what the containers render.
   */
  const submitTaskForm = useCallback(async () => {
    /*
     * The same complete draft, addressed to whichever mutation this composition
     * was opened for. Editing cannot reuse the creation input: an empty
     * assignee has to leave as an explicit `null` there, or clearing one would
     * succeed without changing anything (6.1).
     */
    const input = editingTask
      ? toUpdateTaskInput(editingTask.id, taskForm.values)
      : toCreateTaskInput(taskForm.values)

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
        const hasAssigneeChanged = (editingTask?.assignee?.id ?? '') !== taskForm.values.assigneeId

        await updateTask({
          variables: { input },
          ...(hasAssigneeChanged ? { refetchQueries: [GET_TASKS] } : {}),
        })
      } else {
        await createTask({ variables: { input } })
      }

      closeTaskForm()
    } catch {
      // Reported through the mutation's own error; the draft stays as it was.
    }
  }, [closeTaskForm, createTask, editingTask, taskForm.values, updateTask])

  const taskFormContext = useMemo(
    () => ({
      openTaskForm: () => {
        // A new draft never inherits the task the last one was editing.
        setEditingTask(null)
        setIsTaskFormOpen(true)
      },
    }),
    [],
  )

  const cancelTaskDeletion = useCallback(() => {
    setDeletingTask(null)
    // Otherwise a failure from this task would greet the next confirmation.
    resetDeletion()
  }, [resetDeletion])

  const confirmTaskDeletion = useCallback(async () => {
    if (!deletingTask) {
      return
    }

    try {
      await runDeleteTask({ variables: { input: { id: deletingTask.id } } })
      setDeletingTask(null)
    } catch {
      // Reported in the dialog, which stays open so it can be tried again.
    }
  }, [deletingTask, runDeleteTask])

  const taskActionsContext = useMemo(() => ({ deleteTask: setDeletingTask, editTask }), [editTask])

  const taskSearchContext = useMemo(
    () => ({ appliedTerm: appliedSearchTerm, setTerm: setSearchTerm, term: searchTerm }),
    [appliedSearchTerm, searchTerm],
  )

  const isFullPageTaskFormOpen = isTaskFormOpen && !supportsTaskFormModal
  const isModalTaskFormOpen = isTaskFormOpen && supportsTaskFormModal
  // Only the full-page composition hides the current route, so only it takes
  // the active navigation state away from that route.

  return (
    <TaskFormContext value={taskFormContext}>
      <TaskActionsContext value={taskActionsContext}>
        <TaskSearchContext value={taskSearchContext}>
          <div
            className={
              isFullPageTaskFormOpen ? `${styles.root} ${styles.isTaskFormOpen}` : styles.root
            }
            data-mobile-navigation={isAndroid ? 'drawer' : 'bottom'}
            data-mobile-platform={mobilePlatform}
          >
            <AppSidebar
              isAndroid={isAndroid}
              isAddProjectOpen={isFullPageTaskFormOpen}
              isDrawerOpen={isNavigationOpen}
              onNavigate={() => {
                setIsNavigationOpen(false)
                closeTaskForm()
              }}
              onRequestAddProject={taskFormContext.openTaskForm}
              onRequestClose={() => setIsNavigationOpen(false)}
              onRequestOpen={() => setIsNavigationOpen(true)}
            />
            <div className={styles.workspace}>
              {isFullPageTaskFormOpen ? null : (
                <AppHeader hasTaskSearch={hasTaskSearch} isAndroid={isAndroid} />
              )}
              <main className={isFullPageTaskFormOpen ? styles.addProjectContent : styles.content}>
                {isFullPageTaskFormOpen ? (
                  <AddProjectPage
                    assignees={usersData?.users}
                    form={taskForm}
                    hasFailed={Boolean(creationError ?? updateError)}
                    isEditing={Boolean(editingTask)}
                    isSubmitting={isCreatingTask || isUpdatingTask}
                    onClose={closeTaskForm}
                    onSubmit={submitTaskForm}
                  />
                ) : (
                  <Outlet />
                )}
              </main>
              {isAndroid && !isFullPageTaskFormOpen ? (
                <IconButton
                  aria-label="Add Project"
                  className={styles.androidAddTaskButton}
                  onClick={taskFormContext.openTaskForm}
                >
                  <Plus aria-hidden="true" size={24} />
                </IconButton>
              ) : null}
            </div>
            {isModalTaskFormOpen ? (
              <TaskFormModal
                assignees={usersData?.users}
                form={taskForm}
                hasFailed={Boolean(creationError ?? updateError)}
                isEditing={Boolean(editingTask)}
                isSubmitting={isCreatingTask || isUpdatingTask}
                onClose={closeTaskForm}
                onSubmit={submitTaskForm}
              />
            ) : null}
            {deletingTask ? (
              <DeleteTaskDialog
                hasFailed={Boolean(deletionError)}
                isDeleting={isDeletingTask}
                onCancel={cancelTaskDeletion}
                onConfirm={confirmTaskDeletion}
                taskTitle={deletingTask.title}
              />
            ) : null}
          </div>
        </TaskSearchContext>
      </TaskActionsContext>
    </TaskFormContext>
  )
}
