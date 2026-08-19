import styles from './StatusToast.module.css'

type StatusToastProps = {
  /** Changes on every announcement, so repeating a message re-announces it. */
  announcementKey: number
  message: string | null
}

/**
 * The standing live region for confirmations.
 *
 * Mounted whether or not it has anything to say: a region that arrives together
 * with its first message is announced by almost nothing. `role="status"` is the
 * polite counterpart to the draft's own assertive alert, since a confirmation
 * should wait its turn rather than interrupt what is being read.
 */
export function StatusToast({ announcementKey, message }: StatusToastProps) {
  return (
    <div className={styles.root} role="status">
      {message ? (
        <p className={styles.message} key={announcementKey}>
          {message}
        </p>
      ) : null}
    </div>
  )
}
