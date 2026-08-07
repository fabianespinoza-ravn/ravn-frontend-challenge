import { useCallback, useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Pencil } from 'lucide-react'
import type { Task } from '@/entities/task/model/task'
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
  const [isOpen, setIsOpen] = useState(false)
  const { editTask } = useTaskActions()
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(false)

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      triggerRef.current?.focus()
    }

    wasOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        close()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [close, isOpen])

  return (
    <div className={styles.root} ref={containerRef}>
      <IconButton
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`More options for ${task.title}`}
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
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
        </div>
      ) : null}
    </div>
  )
}
