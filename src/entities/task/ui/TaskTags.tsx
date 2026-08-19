import { tagLabels } from '@/entities/task/model/taskLabels'
import type { TaskTag } from '@/entities/task/model/apiTask'
import styles from './TaskTags.module.css'

type TaskTagsProps = {
  /** Spacing belongs to the container, which knows where the list sits. */
  className?: string
  tags: TaskTag[]
}

/**
 * A task's labels, wherever a task is shown.
 *
 * The card and the list row rendered these separately and identically, including
 * the one tag that carries its own colour. Android is still a special case, but
 * now in one place: if a second tag ever gets a colour of its own, this is where
 * a tone table would replace the condition.
 */
export function TaskTags({ className, tags }: TaskTagsProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      {tags.map((tag) => (
        <span
          className={tag === 'ANDROID' ? `${styles.tag} ${styles.isAndroid}` : styles.tag}
          key={tag}
        >
          {tagLabels[tag]}
        </span>
      ))}
    </div>
  )
}
