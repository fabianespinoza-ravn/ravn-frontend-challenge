import { useEffect, useState } from 'react'

/**
 * The shared layout breakpoint. Above it the toolbar shows its add-task control
 * and the task form opens as a modal; below it the view toggle takes the whole
 * toolbar width and that control is hidden, which leaves whatever sits beside it
 * flush against the right edge of the screen.
 */
export const layoutBreakpoint = 768

function readIsNarrow() {
  return window.innerWidth < layoutBreakpoint
}

/**
 * Reports whether the viewport is below the layout breakpoint, for the cases a
 * media query cannot answer: choosing a different element tree, rather than
 * different rules over the same one.
 */
export function useIsNarrowViewport() {
  const [isNarrow, setIsNarrow] = useState(readIsNarrow)

  useEffect(() => {
    function syncViewport() {
      setIsNarrow(readIsNarrow())
    }

    window.addEventListener('resize', syncViewport)

    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  return isNarrow
}
