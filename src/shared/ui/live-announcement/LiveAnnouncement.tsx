import styles from './LiveAnnouncement.module.css'

type LiveAnnouncementProps = {
  /** Empty when there is nothing to say. The region stays mounted either way. */
  message: string
}

/**
 * A visually hidden region that says what just changed on screen.
 *
 * For changes a reader can see but assistive technology would otherwise pass
 * over: a filter that empties a list replaces what is on screen without moving
 * focus, so nothing announces it. The region is mounted from the first render
 * because one that arrives together with its first message is announced by
 * almost nothing.
 *
 * Unlike the task-mutation toast, an announcement here needs no key to repeat
 * itself: two deletions are two events worth hearing twice, while narrowing an
 * already empty result set changes nothing the reader has not been told.
 */
export function LiveAnnouncement({ message }: LiveAnnouncementProps) {
  return (
    <p className={styles.root} role="status">
      {message}
    </p>
  )
}
