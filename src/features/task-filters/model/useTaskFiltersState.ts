import { useCallback, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/shared/lib/timing/useDebouncedValue'
import { emptyTaskFilters, type TaskFilters } from './taskFilters'

/* Long enough that a typed word is one request, short enough to feel live. */
const searchDebounceDelay = 300

/**
 * The filter set the controls write to and the views read from.
 *
 * Held above the routes because the toolbar that sets a filter and the view that
 * answers it are siblings, and the applied set is the one the views send to the
 * API rather than the one being typed.
 */
export function useTaskFiltersState() {
  const [filters, setFilters] = useState<TaskFilters>(emptyTaskFilters)
  /*
   * Only the name waits. It is typed a character at a time, while every other
   * control commits a whole choice at once and has nothing to settle. Trimmed,
   * because a trailing space is a search nobody meant to run.
   */
  const appliedName = useDebouncedValue(filters.name.trim(), searchDebounceDelay)

  const setFilter = useCallback(
    <TKey extends keyof TaskFilters>(key: TKey, value: TaskFilters[TKey]) => {
      setFilters((currentFilters) => ({ ...currentFilters, [key]: value }))
    },
    [],
  )

  const clearFilters = useCallback(() => setFilters(emptyTaskFilters), [])

  return useMemo(
    () => ({
      appliedFilters: { ...filters, name: appliedName },
      clearFilters,
      filters,
      setFilter,
    }),
    [appliedName, clearFilters, filters, setFilter],
  )
}
