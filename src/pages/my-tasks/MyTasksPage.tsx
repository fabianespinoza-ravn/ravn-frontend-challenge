import { Button } from '@/shared/ui/button/Button'
import { TaskList } from '@/widgets/task-list/TaskList'
import { TaskToolbar } from '@/widgets/task-toolbar/TaskToolbar'
import { useAssignedTasks } from './model/useAssignedTasks'
import styles from './MyTasksPage.module.css'

export function MyTasksPage() {
  const { error, isLoading, retry, tasks } = useAssignedTasks()

  return (
    <section className={styles.root}>
      <TaskToolbar activeView="list" />
      {isLoading ? (
        <section aria-live="polite" className={styles.state} role="status">
          <h1>Loading assigned tasks</h1>
          <p>Preparing your task list.</p>
        </section>
      ) : null}
      {!isLoading && error ? (
        <section className={styles.state} role="alert">
          <h1>Unable to load assigned tasks</h1>
          <p>Please check your connection and try again.</p>
          <Button onClick={retry} type="button" variant="secondary">
            Retry
          </Button>
        </section>
      ) : null}
      {!isLoading && !error ? <TaskList tasks={tasks} /> : null}
    </section>
  )
}
