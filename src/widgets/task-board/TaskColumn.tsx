import { MoreHorizontal } from 'lucide-react'
import type { Task } from '@/entities/task/model/task'
import { TaskCard } from '@/entities/task/ui/TaskCard'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
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
        <IconButton aria-label={`More options for ${name}`} size="small">
          <MoreHorizontal aria-hidden="true" size={18} />
        </IconButton>
      </header>
      <ol className={styles.cards}>
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard task={task} />
          </li>
        ))}
      </ol>
    </section>
  )
}
