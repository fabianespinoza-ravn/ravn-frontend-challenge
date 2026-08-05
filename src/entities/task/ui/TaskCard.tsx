import { CalendarClock, CheckSquare2, MessageCircle, MoreHorizontal, Paperclip } from 'lucide-react'
import type { Task } from '@/entities/task/model/task'
import { Avatar } from '@/shared/ui/avatar/Avatar'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import styles from './TaskCard.module.css'

type TaskCardProps = {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article aria-label={task.title} className={styles.root}>
      <header className={styles.header}>
        <h3>{task.title}</h3>
        <IconButton aria-label={`More options for ${task.title}`} size="small">
          <MoreHorizontal aria-hidden="true" size={18} />
        </IconButton>
      </header>

      <div className={styles.taskDetails}>
        <span>{task.points} points</span>
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
            className={tag === 'Android' ? `${styles.tag} ${styles.isAndroid}` : styles.tag}
            key={tag}
          >
            {tag}
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
