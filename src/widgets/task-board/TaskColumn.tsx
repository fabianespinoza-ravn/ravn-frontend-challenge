import type { Task } from '@/entities/task/model/task'
import { TaskCard } from '@/entities/task/ui/TaskCard'
import { TaskActionsMenu } from '@/features/task-actions/ui/TaskActionsMenu'
import styles from './TaskColumn.module.css'

type TaskColumnProps = {
  color: string
  name: string
  tasks: Task[]
}

export function TaskColumn({ color, name, tasks }: TaskColumnProps) {
  const taskCountLabel = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`

  return (
    <section aria-label={`${name}, ${taskCountLabel}`} className={styles.root}>
      <header className={styles.header}>
        <span
          aria-hidden="true"
          className={styles.statusIndicator}
          style={{ backgroundColor: color }}
        />
        <h2>{name}</h2>
        <span className={styles.count}>{taskCountLabel}</span>
      </header>
      <ol className={styles.cards}>
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard actions={<TaskActionsMenu task={task} />} task={task} />
          </li>
        ))}
      </ol>
    </section>
  )
}
