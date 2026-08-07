import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { TaskFormContext } from '@/features/task-form/model/taskFormContext'
import { toCreateTaskInput } from '@/features/task-form/model/taskForm'
import { useCreateTask } from '@/features/task-form/model/useCreateTask'
import { useTaskFormState } from '@/features/task-form/model/useTaskFormState'
import { TaskFormModal } from '@/features/task-form/ui/TaskFormModal'
import { useUsers } from '@/entities/user/model/useUsers'
import { getMobilePlatform } from '@/shared/lib/platform/getMobilePlatform'
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

export function AppLayout() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [supportsTaskFormModal, setSupportsTaskFormModal] = useState(
    () => window.innerWidth >= taskFormModalBreakpoint,
  )
  const taskForm = useTaskFormState()
  const resetTaskFormState = taskForm.reset
  // Both containers assign from the same list, so the layout that owns the
  // draft also fetches it, and only once a draft exists to assign.
  const { data: usersData } = useUsers({ skip: !isTaskFormOpen })
  const [createTask, { error: creationError, loading: isCreatingTask, reset: resetCreation }] =
    useCreateTask()
  const mobilePlatform = getMobilePlatform()
  const isAndroid = mobilePlatform === 'android'

  useEffect(() => {
    function syncViewport() {
      setSupportsTaskFormModal(window.innerWidth >= taskFormModalBreakpoint)
    }

    window.addEventListener('resize', syncViewport)

    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  const closeTaskForm = useCallback(() => {
    setIsTaskFormOpen(false)
    resetTaskFormState()
    // Otherwise a failure from this draft would greet the next one.
    resetCreation()
  }, [resetCreation, resetTaskFormState])

  /*
   * An incomplete draft never reaches the API: the form has already recorded the
   * attempt by the time this runs, so returning here is what turns the press
   * into field messages instead of a request. A failure leaves the draft open,
   * and the mutation's own error state is what the containers render.
   */
  const submitTaskForm = useCallback(async () => {
    const input = toCreateTaskInput(taskForm.values)

    if (!input) {
      return
    }

    try {
      await createTask({ variables: { input } })
      closeTaskForm()
    } catch {
      // Reported through `creationError`; the draft stays exactly as it was.
    }
  }, [closeTaskForm, createTask, taskForm.values])

  const taskFormContext = useMemo(() => ({ openTaskForm: () => setIsTaskFormOpen(true) }), [])

  const isFullPageTaskFormOpen = isTaskFormOpen && !supportsTaskFormModal
  const isModalTaskFormOpen = isTaskFormOpen && supportsTaskFormModal
  // Only the full-page composition hides the current route, so only it takes
  // the active navigation state away from that route.

  return (
    <TaskFormContext value={taskFormContext}>
      <div
        className={isFullPageTaskFormOpen ? `${styles.root} ${styles.isTaskFormOpen}` : styles.root}
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
          {isFullPageTaskFormOpen ? null : <AppHeader isAndroid={isAndroid} />}
          <main className={isFullPageTaskFormOpen ? styles.addProjectContent : styles.content}>
            {isFullPageTaskFormOpen ? (
              <AddProjectPage
                assignees={usersData?.users}
                form={taskForm}
                hasFailed={Boolean(creationError)}
                isSubmitting={isCreatingTask}
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
            hasFailed={Boolean(creationError)}
            isSubmitting={isCreatingTask}
            onClose={closeTaskForm}
            onSubmit={submitTaskForm}
          />
        ) : null}
      </div>
    </TaskFormContext>
  )
}
