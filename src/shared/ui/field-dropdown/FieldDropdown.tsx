import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './FieldDropdown.module.css'

/**
 * `compact` is the desktop chip that sits in a single metadata row. `row` is the
 * iOS full-width field. Both share behaviour and take their colours from the
 * custom properties the surrounding composition sets.
 */
export type FieldVariant = 'compact' | 'row'

type FieldDropdownProps = {
  children: (close: () => void) => ReactNode
  /*
   * The element that explains this control when something is wrong with it.
   * Named by the caller rather than known here, so the primitive serves a form
   * that validates and a filter panel that does not.
   */
  describedBy?: string
  disabled?: boolean
  isFilled?: boolean
  isInvalid?: boolean
  label: string
  panelClassName?: string
  panelTitle?: string
  trigger: ReactNode
  value?: string
  variant?: FieldVariant
}

/**
 * The desktop chip anchors its options beneath itself; the iOS row centres them
 * over the screen behind a dimmed backdrop, which stays reachable on a narrow
 * viewport where an anchored popover would run off the bottom.
 */
function PanelContainer({
  children,
  isRow,
  onDismiss,
}: {
  children: ReactNode
  isRow: boolean
  onDismiss: () => void
}) {
  if (!isRow) {
    return children
  }

  return (
    <div className={styles.overlay}>
      <button
        aria-hidden="true"
        className={styles.overlayBackdrop}
        onClick={onDismiss}
        tabIndex={-1}
        type="button"
      />
      {children}
    </div>
  )
}

/**
 * A metadata control that swaps its own label for the selected value and opens
 * its options. Escape is handled in the capture phase so it closes
 * this dropdown before the surrounding modal ever sees it, and the first Escape
 * never discards the whole draft.
 */
export function FieldDropdown({
  children,
  describedBy,
  disabled = false,
  isFilled = false,
  isInvalid = false,
  label,
  panelClassName,
  panelTitle,
  trigger,
  value,
  variant = 'compact',
}: FieldDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
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

  const isRow = variant === 'row'

  return (
    <div className={isRow ? `${styles.root} ${styles.rowRoot}` : styles.root} ref={containerRef}>
      <button
        aria-describedby={describedBy}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={value ? `${label}: ${value}` : label}
        className={[
          styles.trigger,
          isFilled ? styles.isFilled : '',
          isRow ? styles.rowTrigger : '',
          isInvalid ? styles.isInvalid : '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
        ref={triggerRef}
        type="button"
      >
        {trigger}
      </button>
      {isOpen ? (
        <PanelContainer isRow={isRow} onDismiss={close}>
          <div
            aria-label={panelTitle ?? label}
            className={[styles.panel, isRow ? styles.rowPanel : '', panelClassName]
              .filter(Boolean)
              .join(' ')}
            role="group"
          >
            {panelTitle ? <p className={styles.panelTitle}>{panelTitle}</p> : null}
            {children(close)}
          </div>
        </PanelContainer>
      ) : null}
    </div>
  )
}
