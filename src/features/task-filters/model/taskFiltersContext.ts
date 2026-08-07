import { createContext } from 'react'
import type { TaskFilters } from './taskFilters'

export type TaskFiltersContextValue = {
  /** What the queries narrow by. Trails the name field, so typing is not a request. */
  appliedFilters: TaskFilters
  clearFilters: () => void
  /** What the controls show, which has to follow every keystroke. */
  filters: TaskFilters
  setFilter: <TKey extends keyof TaskFilters>(key: TKey, value: TaskFilters[TKey]) => void
}

/**
 * One set of filters for the whole shell. The name field lives in the header,
 * the rest live in the toolbar, and the queries live in the pages beneath both,
 * so none of them can own it; the layout does, the way it owns the task-form
 * trigger (5.13).
 */
export const TaskFiltersContext = createContext<TaskFiltersContextValue | null>(null)
