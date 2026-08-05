import { useEffect, useRef, type ReactNode } from 'react'
import styles from './Modal.module.css'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

type ModalProps = {
  children: ReactNode
  label?: string
  labelledBy?: string
  onClose: () => void
  panelClassName?: string
}

export function Modal({ children, label, labelledBy, onClose, panelClassName }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    // Focus the first control rather than the panel, so a container swap lands
    // the caret back in the form instead of on an empty dialog.
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(focusableSelector)

    if (firstFocusable) {
      firstFocusable.focus()
    } else {
      panelRef.current?.focus()
    }

    return () => {
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return
      }

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (!first || !last) {
        return
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className={styles.root}>
      <button
        aria-hidden="true"
        className={styles.backdrop}
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-label={label}
        aria-labelledby={labelledBy}
        aria-modal="true"
        className={[styles.panel, panelClassName].filter(Boolean).join(' ')}
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  )
}
