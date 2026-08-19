import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { TaskActionsContext } from '@/features/task-actions/model/taskActionsContext'
import { useTaskDeletionWorkflow } from '@/features/task-actions/model/useTaskDeletionWorkflow'
import { DeleteTaskDialog } from '@/features/task-actions/ui/DeleteTaskDialog'
import { TaskFormContext } from '@/features/task-form/model/taskFormContext'
import { useTaskFormWorkflow } from '@/features/task-form/model/useTaskFormWorkflow'
import { TaskFormModal } from '@/features/task-form/ui/TaskFormModal'
import { TaskFiltersContext } from '@/features/task-filters/model/taskFiltersContext'
import { useTaskFiltersState } from '@/features/task-filters/model/useTaskFiltersState'
import { getMobilePlatform } from '@/shared/lib/platform/getMobilePlatform'
import { useTransientStatus } from '@/shared/lib/feedback/useTransientStatus'
import { TaskFormPage } from '@/pages/task-form/TaskFormPage'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import { StatusToast } from '@/shared/ui/status-toast/StatusToast'
import { AppHeader } from '@/widgets/app-header/AppHeader'
import { AppSidebar } from '@/widgets/app-sidebar/AppSidebar'
import styles from './AppLayout.module.css'

/*
 * Named positively rather than as everything except Settings, so a route added
 * later has to ask for the task search instead of inheriting one it may have no
 * tasks for. Not Found is already such a route.
 */
const taskRoutes = ['/dashboard', '/my-tasks']

/**
 * The application shell: the platform it is running on, the navigation around
 * the route, and where each task surface is composed.
 *
 * What those surfaces *do* belongs to the features that own them. The layout
 * holds the three workflows side by side because they are siblings that have to
 * agree on one screen, and passes them the one region all three report into.
 */
export function AppLayout() {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  /*
   * One region for all three mutations, held here because a deletion succeeds
   * when no draft is open to carry the message.
   */
  const { announce, status } = useTransientStatus()
  const taskForm = useTaskFormWorkflow({ announce })
  const taskDeletion = useTaskDeletionWorkflow({ announce })
  const taskFiltersContext = useTaskFiltersState()
  const mobilePlatform = getMobilePlatform()
  const isAndroid = mobilePlatform === 'android'
  const hasTaskSearch = taskRoutes.includes(useLocation().pathname)

  const taskActionsContext = useMemo(
    () => ({ deleteTask: taskDeletion.requestDeletion, editTask: taskForm.editTask }),
    [taskDeletion.requestDeletion, taskForm.editTask],
  )

  return (
    <TaskFormContext value={taskForm.context}>
      <TaskActionsContext value={taskActionsContext}>
        <TaskFiltersContext value={taskFiltersContext}>
          <div
            className={
              taskForm.isFullPageOpen ? `${styles.root} ${styles.isTaskFormOpen}` : styles.root
            }
            data-mobile-navigation={isAndroid ? 'drawer' : 'bottom'}
            data-mobile-platform={mobilePlatform}
          >
            <AppSidebar
              isAndroid={isAndroid}
              /* Only the full-page composition hides the route, so only it takes
                 the active navigation state away from it. */
              isAddProjectOpen={taskForm.isFullPageOpen}
              isDrawerOpen={isNavigationOpen}
              onNavigate={() => {
                setIsNavigationOpen(false)
                taskForm.close()
              }}
              onRequestAddProject={taskForm.context.openTaskForm}
              onRequestClose={() => setIsNavigationOpen(false)}
              onRequestOpen={() => setIsNavigationOpen(true)}
            />
            <div className={styles.workspace}>
              {taskForm.isFullPageOpen ? null : (
                <AppHeader hasTaskSearch={hasTaskSearch} isAndroid={isAndroid} />
              )}
              <main
                className={taskForm.isFullPageOpen ? styles.taskFormPageContent : styles.content}
              >
                {taskForm.isFullPageOpen ? (
                  <TaskFormPage
                    assignees={taskForm.assignees}
                    form={taskForm.form}
                    hasFailed={taskForm.hasFailed}
                    isEditing={taskForm.isEditing}
                    isSubmitting={taskForm.isSubmitting}
                    onClose={taskForm.close}
                    onSubmit={taskForm.submit}
                  />
                ) : (
                  <Outlet />
                )}
              </main>
              {isAndroid && !taskForm.isFullPageOpen ? (
                <IconButton
                  aria-label="Add task"
                  className={styles.androidAddTaskButton}
                  onClick={taskForm.context.openTaskForm}
                >
                  <Plus aria-hidden="true" size={24} />
                </IconButton>
              ) : null}
            </div>
            {taskForm.isModalOpen ? (
              <TaskFormModal
                assignees={taskForm.assignees}
                form={taskForm.form}
                hasFailed={taskForm.hasFailed}
                isEditing={taskForm.isEditing}
                isSubmitting={taskForm.isSubmitting}
                onClose={taskForm.close}
                onSubmit={taskForm.submit}
              />
            ) : null}
            {taskDeletion.deletingTask ? (
              <DeleteTaskDialog
                hasFailed={taskDeletion.hasFailed}
                isDeleting={taskDeletion.isDeleting}
                onCancel={taskDeletion.cancel}
                onConfirm={taskDeletion.confirm}
                taskTitle={taskDeletion.deletingTask.title}
              />
            ) : null}
            <StatusToast announcementKey={status.announcementKey} message={status.message} />
          </div>
        </TaskFiltersContext>
      </TaskActionsContext>
    </TaskFormContext>
  )
}
