import type { ReactNode } from 'react'
import { CalendarClock } from 'lucide-react'
import type { Task } from '@/entities/task/model/task'
import { pointEstimateValues } from '@/entities/task/model/taskLabels'
import { TaskTags } from '@/entities/task/ui/TaskTags'
import { Avatar } from '@/shared/ui/avatar/Avatar'
import styles from './TaskCard.module.css'

type TaskCardProps = {
  /*
   * The card is task UI, not an interaction, so what its options control does
   * arrives from whoever composes it. Reaching for that feature from here would
   * have an entity depending on a layer above it.
   */
  actions?: ReactNode
  task: Task
}

export function TaskCard({ actions, task }: TaskCardProps) {
  return (
    <article aria-label={task.title} className={styles.root}>
      <header className={styles.header}>
        <h3>{task.title}</h3>
        {actions}
      </header>

      <div className={styles.taskDetails}>
        <span>{pointEstimateValues[task.pointEstimate]} points</span>
        <span
          className={
            task.dueDateTone === 'past' ? `${styles.dueDate} ${styles.isOverdue}` : styles.dueDate
          }
        >
          <CalendarClock aria-hidden="true" size={14} />
          {task.dueDateLabel}
        </span>
      </div>

      <TaskTags className={styles.tags} tags={task.tags} />

      <footer className={styles.footer}>
        {task.assignee ? (
          <Avatar
            alt={`Assigned to ${task.assignee.name}`}
            initials={task.assignee.initials}
            size="small"
          />
        ) : (
          <span aria-label="Unassigned" className={styles.unassigned} role="img">
            —
          </span>
        )}
      </footer>
    </article>
  )
}
