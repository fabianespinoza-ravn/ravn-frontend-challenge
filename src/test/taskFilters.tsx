import type { ReactNode } from 'react'
import { emptyTaskFilters, type TaskFilters } from '@/features/task-filters/model/taskFilters'
import { TaskFiltersContext } from '@/features/task-filters/model/taskFiltersContext'

type TaskFiltersTestProviderProps = {
  children: ReactNode
  clearFilters?: () => void
  /** Defaults to filtering by nothing, which is what most tests want. */
  filters?: TaskFilters
  setFilter?: TaskFiltersContextValue['setFilter']
}

type TaskFiltersContextValue = NonNullable<React.ContextType<typeof TaskFiltersContext>>

/**
 * Supplies the layout-owned filters to components rendered in isolation, so a
 * unit test of the header or either task view does not need the complete
 * application shell. The applied set is the same one the controls show, since a
 * test has no typing to wait for.
 */
export function TaskFiltersTestProvider({
  children,
  clearFilters = () => {},
  filters = emptyTaskFilters,
  setFilter = () => {},
}: TaskFiltersTestProviderProps) {
  return (
    <TaskFiltersContext value={{ appliedFilters: filters, clearFilters, filters, setFilter }}>
      {children}
    </TaskFiltersContext>
  )
}
