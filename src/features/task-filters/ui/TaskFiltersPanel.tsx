import { useCallback, useEffect, useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useUsers } from '@/entities/user/model/useUsers'
import { useIsNarrowViewport } from '@/shared/lib/viewport/useIsNarrowViewport'
import { Modal } from '@/shared/ui/modal/Modal'
import { countActiveFilters } from '../model/taskFilters'
import { useTaskFilters } from '../model/useTaskFilters'
import {
  AssigneeFilterField,
  DueDateFilter,
  EstimateFilter,
  StatusFilter,
  TagsFilter,
} from './TaskFilterFields'
import styles from './TaskFiltersPanel.module.css'

type TaskFiltersPanelProps = {
  /*
   * My Tasks is the assignee filter, so a second one there would either
   * contradict the route or do nothing. The board offers it instead, where it
   * is the working stand-in for the `ownerId` the API ignores.
   */
  hasAssigneeFilter?: boolean
}

export function TaskFiltersPanel({ hasAssigneeFilter = false }: TaskFiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { clearFilters, filters, setFilter } = useTaskFilters()
  const containerRef = useRef<HTMLDivElement>(null)
  // Teammates are only needed once the panel offers to filter by one.
  const { data } = useUsers({ skip: !hasAssigneeFilter || !isOpen })
  const activeCount = countActiveFilters(filters)
  /*
   * Below the layout breakpoint the toolbar hides its add-task control and gives
   * the view toggle the full width, which leaves this trigger flush against the
   * right edge. An anchored panel then opens into a screen edge rather than
   * across the board, so the presentation changes rather than the anchor: the
   * panel becomes a dialog and its fields the same full-width rows the task form
   * uses, whose options open centred over the screen. Nothing here can outgrow
   * the viewport, which flipping the anchor would only have deferred until a
   * reader enlarged their text and every `rem` grew with it.
   */
  const isNarrowViewport = useIsNarrowViewport()

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    /* The dialog dismisses through its own backdrop. */
    if (!isOpen || isNarrowViewport) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isNarrowViewport, isOpen])

  const fieldVariant = isNarrowViewport ? 'row' : 'compact'
  const content = (
    <>
      <div className={isNarrowViewport ? styles.sheetFields : styles.fields}>
        <StatusFilter
          onChange={(value) => setFilter('status', value)}
          value={filters.status}
          variant={fieldVariant}
        />
        <EstimateFilter
          onChange={(value) => setFilter('pointEstimate', value)}
          value={filters.pointEstimate}
          variant={fieldVariant}
        />
        <TagsFilter
          onChange={(value) => setFilter('tags', value)}
          value={filters.tags}
          variant={fieldVariant}
        />
        <DueDateFilter
          onChange={(value) => setFilter('dueDate', value)}
          value={filters.dueDate}
          variant={fieldVariant}
        />
        {hasAssigneeFilter ? (
          <AssigneeFilterField
            assignees={data?.users ?? []}
            onChange={(value) => setFilter('assigneeId', value)}
            value={filters.assigneeId}
            variant={fieldVariant}
          />
        ) : null}
      </div>
      {/*
       * Without this, a filter that returns nothing leaves no obvious way back:
       * the board is empty, so there is nothing on screen to suggest what is
       * hiding it.
       */}
      <button
        className={styles.clear}
        disabled={activeCount === 0 && filters.name === ''}
        onClick={() => {
          clearFilters()
          close()
        }}
        type="button"
      >
        Clear all filters
      </button>
    </>
  )

  return (
    <div className={styles.root} ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        /* The count is in the name, so it is announced and not only seen. */
        aria-label={activeCount > 0 ? `Filters, ${activeCount} active` : 'Filters'}
        className={activeCount > 0 ? `${styles.trigger} ${styles.isActive}` : styles.trigger}
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
        type="button"
      >
        <SlidersHorizontal aria-hidden="true" size={18} />
        <span className={styles.triggerLabel}>Filters</span>
        {activeCount > 0 ? (
          <span aria-hidden="true" className={styles.count}>
            {activeCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        isNarrowViewport ? (
          <Modal label="Task filters" onClose={close} panelClassName={styles.sheet}>
            {content}
          </Modal>
        ) : (
          <div aria-label="Task filters" className={styles.panel} role="group">
            {content}
          </div>
        )
      ) : null}
    </div>
  )
}
