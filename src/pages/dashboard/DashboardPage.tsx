import { Button } from '@/shared/ui/button/Button'
import { useState } from 'react'
import { TaskList } from '@/widgets/task-list/TaskList'
import { TaskToolbar, type TaskView } from '@/widgets/task-toolbar/TaskToolbar'
import { TaskBoard } from '@/widgets/task-board/TaskBoard'
import { emptyResultsHint } from '@/features/task-filters/model/taskFilters'
import { LiveAnnouncement } from '@/shared/ui/live-announcement/LiveAnnouncement'
import { useTaskFilters } from '@/features/task-filters/model/useTaskFilters'
import { useFilteredTasks } from '@/features/task-filters/model/useFilteredTasks'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { error, isFiltered, isLoading, isRefreshing, retry, tasks } = useFilteredTasks()
  const { appliedFilters } = useTaskFilters()
  /*
   * Each route keeps the presentation it was designed around and remembers its
   * own choice, so switching one does not rearrange the other behind you.
   */
  const [view, setView] = useState<TaskView>('board')
  const hasNoTasks = !isLoading && !error && tasks.length === 0
  /*
   * Loading announces itself and so does a failure, but a filter that empties
   * the board replaces it in silence. Only the emptiness is announced: coming
   * back to results is a board the reader is already watching, while an empty
   * one is the answer that needs saying.
   */
  const announcement = hasNoTasks
    ? isFiltered
      ? 'No tasks match your filters.'
      : 'No tasks are available.'
    : ''

  return (
    <section className={styles.root}>
      <LiveAnnouncement message={announcement} />
      <h1 className={styles.heading}>Dashboard</h1>
      <TaskToolbar activeView={view} hasAssigneeFilter onSelectView={setView} />
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
      {hasNoTasks ? (
        <section className={styles.state}>
          {/*
           * A search that found nothing and an account with nothing in it are
           * different things to be told. The hint names the one surprise in
           * how the search behaves: the API matches the name exactly as typed
           * (5.10), so a lowercase term will not find a capitalised task.
           */}
          {isFiltered ? (
            <>
              <h2>No tasks match your filters</h2>
              <p>{emptyResultsHint(appliedFilters)}</p>
            </>
          ) : (
            <>
              <h2>No tasks are available</h2>
              <p>Create a task to begin organizing your work.</p>
            </>
          )}
        </section>
      ) : null}
      {!isLoading && !error && tasks.length > 0 ? (
        <div aria-busy={isRefreshing} className={isRefreshing ? styles.isRefreshing : undefined}>
          {view === 'board' ? (
            <TaskBoard tasks={tasks} />
          ) : (
            <TaskList hasAssigneeColumn tasks={tasks} title="Tasks" />
          )}
        </div>
      ) : null}
    </section>
  )
}
