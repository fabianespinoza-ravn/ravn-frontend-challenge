import { Button } from '@/shared/ui/button/Button'
import { TaskToolbar } from '@/widgets/task-toolbar/TaskToolbar'
import { TaskBoard } from '@/widgets/task-board/TaskBoard'
import { useDashboardTasks } from './model/useDashboardTasks'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { error, isFiltered, isLoading, retry, tasks } = useDashboardTasks()

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
          {/*
           * A search that found nothing and an account with nothing in it are
           * different things to be told. The hint names the one surprise in
           * how the search behaves: the API matches the name exactly as typed
           * (5.10), so a lowercase term will not find a capitalised task.
           */}
          {isFiltered ? (
            <>
              <h2>No tasks match your search</h2>
              <p>Search matches the task name exactly as typed, including its capitals.</p>
            </>
          ) : (
            <>
              <h2>No tasks are available</h2>
              <p>Create a task to begin organizing your work.</p>
            </>
          )}
        </section>
      ) : null}
      {!isLoading && !error && tasks.length > 0 ? <TaskBoard tasks={tasks} /> : null}
    </section>
  )
}
