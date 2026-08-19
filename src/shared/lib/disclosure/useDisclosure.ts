import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A control that opens something over the page and has to give the page back.
 *
 * It closes on a pointer press outside its own container, and on Escape handled
 * in the **capture** phase so nothing behind it reacts first: inside a modal,
 * that is what lets the first Escape close the popover instead of discarding the
 * draft underneath. Focus returns to the trigger when it closes, so the keyboard
 * lands back where it came from rather than at the top of the document.
 *
 * Both listeners are attached only while open, so a page full of closed controls
 * costs nothing.
 */
export function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(false)

  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((currentIsOpen) => !currentIsOpen), [])

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

  return { close, containerRef, isOpen, toggle, triggerRef }
}
