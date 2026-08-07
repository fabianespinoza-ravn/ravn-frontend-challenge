import { ChevronDown } from 'lucide-react'
import type { Task } from '@/entities/task/model/task'
import { taskStatuses } from '@/entities/task/model/task'
import { pointEstimateValues, tagLabels } from '@/entities/task/model/taskLabels'
import { TaskActionsMenu } from '@/features/task-actions/ui/TaskActionsMenu'
import styles from './TaskList.module.css'

type TaskListProps = {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  const taskCountLabel = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`

  return (
    <section className={styles.root}>
      <header className={styles.header}>
        <h1>My Tasks</h1>
        <span>{taskCountLabel}</span>
      </header>
      <div aria-label="Task table" className={styles.tableViewport}>
        <div className={styles.table}>
          <div aria-hidden="true" className={styles.columnHeaders}>
            <span>#</span>
            <span>Task Name</span>
            <span>Task Tags</span>
            <span>Estimate</span>
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
                            <div className={styles.tags}>
                              {task.tags.map((tag) => (
                                <span
                                  className={
                                    tag === 'ANDROID'
                                      ? `${styles.tag} ${styles.isAndroid}`
                                      : styles.tag
                                  }
                                  key={tag}
                                >
                                  {tagLabels[tag]}
                                </span>
                              ))}
                            </div>
                            <span className={styles.points}>
                              {pointEstimateValues[task.pointEstimate]} points
                            </span>
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
