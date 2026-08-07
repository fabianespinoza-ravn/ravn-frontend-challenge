import { Button } from '@/shared/ui/button/Button'
import { TaskList } from '@/widgets/task-list/TaskList'
import { TaskToolbar } from '@/widgets/task-toolbar/TaskToolbar'
import { emptyResultsHint } from '@/features/task-filters/model/taskFilters'
import { useTaskFilters } from '@/features/task-filters/model/useTaskFilters'
import { useAssignedTasks } from './model/useAssignedTasks'
import styles from './MyTasksPage.module.css'

export function MyTasksPage() {
  const { error, isFiltered, isLoading, retry, tasks } = useAssignedTasks()
  const { appliedFilters } = useTaskFilters()
  // The list keeps its own empty categories; only a search that found
  // nothing replaces it, since empty rows would not explain themselves.
  const hasNoMatches = isFiltered && tasks.length === 0

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
      {!isLoading && !error && hasNoMatches ? (
        <section className={styles.state}>
          <h1>No assigned tasks match your filters</h1>
          <p>{emptyResultsHint(appliedFilters)}</p>
        </section>
      ) : null}
      {!isLoading && !error && !hasNoMatches ? <TaskList tasks={tasks} /> : null}
    </section>
  )
}
