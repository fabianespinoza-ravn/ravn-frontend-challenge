import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { TaskCreationContext } from '@/features/task-creation/model/taskCreationContext'
import { toCreateTaskInput } from '@/features/task-creation/model/taskCreationForm'
import { useCreateTask } from '@/features/task-creation/model/useCreateTask'
import { useTaskCreationForm } from '@/features/task-creation/model/useTaskCreationForm'
import { TaskCreationModal } from '@/features/task-creation/ui/TaskCreationModal'
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
const taskCreationModalBreakpoint = 768

export function AppLayout() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const [isTaskCreationOpen, setIsTaskCreationOpen] = useState(false)
  const [supportsTaskCreationModal, setSupportsTaskCreationModal] = useState(
    () => window.innerWidth >= taskCreationModalBreakpoint,
  )
  const taskCreationForm = useTaskCreationForm()
  const resetTaskCreationForm = taskCreationForm.reset
  // Both containers assign from the same list, so the layout that owns the
  // draft also fetches it, and only once a draft exists to assign.
  const { data: usersData } = useUsers({ skip: !isTaskCreationOpen })
  const [createTask, { error: creationError, loading: isCreatingTask, reset: resetCreation }] =
    useCreateTask()
  const mobilePlatform = getMobilePlatform()
  const isAndroid = mobilePlatform === 'android'

  useEffect(() => {
    function syncViewport() {
      setSupportsTaskCreationModal(window.innerWidth >= taskCreationModalBreakpoint)
    }

    window.addEventListener('resize', syncViewport)

    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  const closeTaskCreation = useCallback(() => {
    setIsTaskCreationOpen(false)
    resetTaskCreationForm()
    // Otherwise a failure from this draft would greet the next one.
    resetCreation()
  }, [resetCreation, resetTaskCreationForm])

  /*
   * An incomplete draft never reaches the API: the form has already recorded the
   * attempt by the time this runs, so returning here is what turns the press
   * into field messages instead of a request. A failure leaves the draft open,
   * and the mutation's own error state is what the containers render.
   */
  const submitTaskCreation = useCallback(async () => {
    const input = toCreateTaskInput(taskCreationForm.values)

    if (!input) {
      return
    }

    try {
      await createTask({ variables: { input } })
      closeTaskCreation()
    } catch {
      // Reported through `creationError`; the draft stays exactly as it was.
    }
  }, [closeTaskCreation, createTask, taskCreationForm.values])

  const taskCreation = useMemo(() => ({ openTaskCreation: () => setIsTaskCreationOpen(true) }), [])

  const isFullPageTaskCreationOpen = isTaskCreationOpen && !supportsTaskCreationModal
  const isModalTaskCreationOpen = isTaskCreationOpen && supportsTaskCreationModal
  // Only the full-page composition hides the current route, so only it takes
  // the active navigation state away from that route.

  return (
    <TaskCreationContext value={taskCreation}>
      <div
        className={
          isFullPageTaskCreationOpen ? `${styles.root} ${styles.isTaskCreationOpen}` : styles.root
        }
        data-mobile-navigation={isAndroid ? 'drawer' : 'bottom'}
        data-mobile-platform={mobilePlatform}
      >
        <AppSidebar
          isAndroid={isAndroid}
          isAddProjectOpen={isFullPageTaskCreationOpen}
          isDrawerOpen={isNavigationOpen}
          onNavigate={() => {
            setIsNavigationOpen(false)
            closeTaskCreation()
          }}
          onRequestAddProject={taskCreation.openTaskCreation}
          onRequestClose={() => setIsNavigationOpen(false)}
          onRequestOpen={() => setIsNavigationOpen(true)}
        />
        <div className={styles.workspace}>
          {isFullPageTaskCreationOpen ? null : <AppHeader isAndroid={isAndroid} />}
          <main className={isFullPageTaskCreationOpen ? styles.addProjectContent : styles.content}>
            {isFullPageTaskCreationOpen ? (
              <AddProjectPage
                assignees={usersData?.users}
                form={taskCreationForm}
                hasFailed={Boolean(creationError)}
                isSubmitting={isCreatingTask}
                onClose={closeTaskCreation}
                onSubmit={submitTaskCreation}
              />
            ) : (
              <Outlet />
            )}
          </main>
          {isAndroid && !isFullPageTaskCreationOpen ? (
            <IconButton
              aria-label="Add Project"
              className={styles.androidAddTaskButton}
              onClick={taskCreation.openTaskCreation}
            >
              <Plus aria-hidden="true" size={24} />
            </IconButton>
          ) : null}
        </div>
        {isModalTaskCreationOpen ? (
          <TaskCreationModal
            assignees={usersData?.users}
            form={taskCreationForm}
            hasFailed={Boolean(creationError)}
            isSubmitting={isCreatingTask}
            onClose={closeTaskCreation}
            onSubmit={submitTaskCreation}
          />
        ) : null}
      </div>
    </TaskCreationContext>
  )
}
