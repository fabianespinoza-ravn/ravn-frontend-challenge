import { useCallback, useEffect, useRef, useState } from 'react'

/** Long enough to read and to be announced, short enough not to linger. */
export const transientStatusDuration = 4500

type TransientStatus = {
  /*
   * Rises with every announcement, so a message can be announced again even
   * when its text is the one already on screen. Deleting two tasks in a row
   * would otherwise leave the region unchanged, and an unchanged live region
   * says nothing at all.
   */
  announcementKey: number
  message: string | null
}

const emptyStatus: TransientStatus = { announcementKey: 0, message: null }

/**
 * A message that announces itself and then clears, one at a time.
 *
 * Replacing rather than stacking, because these confirm what just happened: the
 * latest is the only one still worth reading.
 */
export function useTransientStatus(duration = transientStatusDuration) {
  const [status, setStatus] = useState(emptyStatus)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const announce = useCallback(
    (message: string) => {
      // Otherwise the timer of the message being replaced clears this one early.
      clearTimeout(timeoutRef.current)

      setStatus((currentStatus) => ({
        announcementKey: currentStatus.announcementKey + 1,
        message,
      }))

      timeoutRef.current = setTimeout(
        () => setStatus((currentStatus) => ({ ...currentStatus, message: null })),
        duration,
      )
    },
    [duration],
  )

  // A timer outliving the tree would set state on something already gone.
  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return { announce, status }
}
