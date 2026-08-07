import { Button } from '@/shared/ui/button/Button'
import { Modal } from '@/shared/ui/modal/Modal'
import styles from './DeleteTaskDialog.module.css'

type DeleteTaskDialogProps = {
  hasFailed?: boolean
  isDeleting?: boolean
  onCancel: () => void
  onConfirm: () => void
  taskTitle: string
}

/**
 * Deleting a task cannot be undone through this API, so it is confirmed rather
 * than performed straight from the menu.
 *
 * `Cancel` comes first in the markup, which is also where `Modal` puts initial
 * focus, so Enter on an unread dialog backs out instead of destroying the task.
 * The dialog names the task it means, because the menu it came from is closed
 * by the time this is read.
 */
export function DeleteTaskDialog({
  hasFailed = false,
  isDeleting = false,
  onCancel,
  onConfirm,
  taskTitle,
}: DeleteTaskDialogProps) {
  return (
    <Modal label="Delete task" onClose={onCancel} panelClassName={styles.panel}>
      <p className={styles.question}>Delete “{taskTitle}”?</p>
      <p className={styles.detail}>This cannot be undone.</p>
      {hasFailed ? (
        <p className={styles.failure} role="alert">
          The task could not be deleted. Please try again.
        </p>
      ) : null}
      <footer className={styles.footer}>
        <button
          className={styles.cancelButton}
          disabled={isDeleting}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <Button disabled={isDeleting} onClick={onConfirm} type="button">
          {isDeleting ? 'Deleting…' : 'Delete'}
        </Button>
      </footer>
    </Modal>
  )
}
