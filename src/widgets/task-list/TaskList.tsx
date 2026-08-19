import { ChevronDown } from 'lucide-react'
import type { Task } from '@/entities/task/model/task'
import { taskStatuses } from '@/entities/task/model/task'
import { pointEstimateValues } from '@/entities/task/model/taskLabels'
import { TaskTags } from '@/entities/task/ui/TaskTags'
import { TaskActionsMenu } from '@/features/task-actions/ui/TaskActionsMenu'
import { Avatar } from '@/shared/ui/avatar/Avatar'
import styles from './TaskList.module.css'

type TaskListProps = {
  /*
   * Only where rows can belong to different people. My Tasks leaves it out
   * because every row there is already the reader's own, which is the same
   * reason the static phase never gave that route the column.
   */
  hasAssigneeColumn?: boolean
  tasks: Task[]
  /* It renders on both task routes now, so it is told what it is listing. */
  title?: string
}

export function TaskList({ hasAssigneeColumn = false, tasks, title = 'My Tasks' }: TaskListProps) {
  const taskCountLabel = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`

  return (
    <section className={styles.root}>
      <header className={styles.header}>
        <h1>{title}</h1>
        <span>{taskCountLabel}</span>
      </header>
      <div aria-label="Task table" className={styles.tableViewport}>
        <div
          className={
            hasAssigneeColumn ? `${styles.table} ${styles.hasAssigneeColumn}` : styles.table
          }
        >
          <div aria-hidden="true" className={styles.columnHeaders}>
            <span>#</span>
            <span>Task Name</span>
            <span>Task Tags</span>
            <span>Estimate</span>
            {hasAssigneeColumn ? <span>Assignee</span> : null}
            <span>Due Date</span>
          </div>
          <div className={styles.categories}>
            {taskStatuses.map((status) => {
              const categoryTasks = tasks
                .filter((task) => task.status === status.value)
                .sort((firstTask, secondTask) =>
                  firstTask.dueDate.localeCompare(secondTask.dueDate),
                )

              return (
                <details className={styles.category} key={status.value} open>
                  <summary>
                    <span aria-hidden="true" className={styles.summaryIcon}>
                      <ChevronDown size={18} />
                    </span>
                    <span
                      aria-hidden="true"
                      className={styles.statusIndicator}
                      style={{ background: status.color }}
                    />
                    <span>{status.label}</span>
                    <span>({categoryTasks.length})</span>
                  </summary>
                  {categoryTasks.length > 0 ? (
                    <ol aria-label={`${status.label} tasks`} className={styles.tasks}>
                      {categoryTasks.map((task, index) => (
                        <li key={task.id}>
                          <article
                            aria-label={task.title}
                            className={`${styles.task} ${styles[task.dueDateTone]}`}
                          >
                            <span className={styles.index}>
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <h2>{task.title}</h2>
                            <TaskTags tags={task.tags} />
                            <span className={styles.points}>
                              {pointEstimateValues[task.pointEstimate]} points
                            </span>
                            {hasAssigneeColumn ? (
                              task.assignee ? (
                                <span className={styles.assignee}>
                                  <Avatar alt="" initials={task.assignee.initials} size="small" />
                                  <span className={styles.assigneeName}>{task.assignee.name}</span>
                                </span>
                              ) : (
                                <span className={styles.unassigned}>Unassigned</span>
                              )
                            ) : null}
                            <span className={styles.dueDate}>{task.dueDateLabel}</span>
                            <TaskActionsMenu task={task} />
                          </article>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className={styles.emptyState}>No tasks in this category.</p>
                  )}
                </details>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
