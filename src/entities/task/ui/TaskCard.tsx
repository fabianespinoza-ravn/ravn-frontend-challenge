import type { ReactNode } from 'react'
import { CalendarClock, CheckSquare2, MessageCircle, Paperclip } from 'lucide-react'
import type { Task } from '@/entities/task/model/task'
import { pointEstimateValues, tagLabels } from '@/entities/task/model/taskLabels'
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

      <div className={styles.tags}>
        {task.tags.map((tag) => (
          <span
            className={tag === 'ANDROID' ? `${styles.tag} ${styles.isAndroid}` : styles.tag}
            key={tag}
          >
            {tagLabels[tag]}
          </span>
        ))}
      </div>

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
        <div className={styles.statistics} aria-label="Task activity">
          <span>
            <Paperclip aria-hidden="true" size={14} />
            {task.attachmentCount}
          </span>
          <span>
            <CheckSquare2 aria-hidden="true" size={14} />
            {task.checklistCount}
          </span>
          <span>
            <MessageCircle aria-hidden="true" size={14} />
            {task.commentCount}
          </span>
        </div>
      </footer>
    </article>
  )
}
