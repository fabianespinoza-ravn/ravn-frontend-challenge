import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Task } from '@/entities/task/model/task'
import { useDisclosure } from '@/shared/lib/disclosure/useDisclosure'
import { IconButton } from '@/shared/ui/icon-button/IconButton'
import { useTaskActions } from '../model/useTaskActions'
import styles from './TaskActionsMenu.module.css'

type TaskActionsMenuProps = {
  task: Task
}

/**
 * The options control that cards and task rows have carried since the static
 * phase, now holding the actions it always implied.
 *
 * It closes the way the metadata dropdowns do: on a pointer press outside, on
 * Escape handled in the capture phase so nothing behind it reacts first, and on
 * choosing an action. Focus returns to the trigger afterwards, so the keyboard
 * lands back on the card it came from rather than at the top of the document.
 */
export function TaskActionsMenu({ task }: TaskActionsMenuProps) {
  const { deleteTask, editTask } = useTaskActions()
  const { close, containerRef, isOpen, toggle, triggerRef } = useDisclosure()

  return (
    <div className={styles.root} ref={containerRef}>
      <IconButton
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`More options for ${task.title}`}
        onClick={toggle}
        ref={triggerRef}
        size="small"
      >
        <MoreHorizontal aria-hidden="true" size={18} />
      </IconButton>
      {isOpen ? (
        <div aria-label={`Actions for ${task.title}`} className={styles.menu} role="menu">
          <button
            className={styles.item}
            onClick={() => {
              close()
              editTask(task)
            }}
            role="menuitem"
            type="button"
          >
            <Pencil aria-hidden="true" size={16} />
            Edit
          </button>
          <button
            className={`${styles.item} ${styles.isDestructive}`}
            onClick={() => {
              close()
              deleteTask(task)
            }}
            role="menuitem"
            type="button"
          >
            <Trash2 aria-hidden="true" size={16} />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  )
}
