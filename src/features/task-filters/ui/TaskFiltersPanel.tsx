import { useCallback, useEffect, useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useUsers } from '@/entities/user/model/useUsers'
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

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(event: MouseEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)

    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isOpen])

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
        <div aria-label="Task filters" className={styles.panel} role="group">
          <div className={styles.fields}>
            <StatusFilter onChange={(value) => setFilter('status', value)} value={filters.status} />
            <EstimateFilter
              onChange={(value) => setFilter('pointEstimate', value)}
              value={filters.pointEstimate}
            />
            <TagsFilter onChange={(value) => setFilter('tags', value)} value={filters.tags} />
            <DueDateFilter
              onChange={(value) => setFilter('dueDate', value)}
              value={filters.dueDate}
            />
            {hasAssigneeFilter ? (
              <AssigneeFilterField
                assignees={data?.users ?? []}
                onChange={(value) => setFilter('assigneeId', value)}
                value={filters.assigneeId}
              />
            ) : null}
          </div>
          {/*
           * Without this, a filter that returns nothing leaves no obvious way
           * back: the board is empty, so there is nothing on screen to suggest
           * what is hiding it.
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
        </div>
      ) : null}
    </div>
  )
}
