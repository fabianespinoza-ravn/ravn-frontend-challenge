import { Button } from '@/shared/ui/button/Button'
import { TaskToolbar } from '@/widgets/task-toolbar/TaskToolbar'
import { TaskBoard } from '@/widgets/task-board/TaskBoard'
import { useDashboardTasks } from './model/useDashboardTasks'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { error, isLoading, retry, tasks } = useDashboardTasks()

  return (
    <section className={styles.root}>
      <h1 className={styles.heading}>Dashboard</h1>
      <TaskToolbar />
      {isLoading ? (
        <section aria-live="polite" className={styles.state} role="status">
          <h2>Loading tasks</h2>
          <p>Preparing your task board.</p>
        </section>
      ) : null}
      {!isLoading && error ? (
        <section className={styles.state} role="alert">
          <h2>Unable to load tasks</h2>
          <p>Please check your connection and try again.</p>
          <Button onClick={retry} type="button" variant="secondary">
            Retry
          </Button>
        </section>
      ) : null}
      {!isLoading && !error && tasks.length === 0 ? (
        <section className={styles.state}>
          <h2>No tasks are available</h2>
          <p>Create a task to begin organizing your work.</p>
        </section>
      ) : null}
      {!isLoading && !error && tasks.length > 0 ? <TaskBoard tasks={tasks} /> : null}
    </section>
  )
}
