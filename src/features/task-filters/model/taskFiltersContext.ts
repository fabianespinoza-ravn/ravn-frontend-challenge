import { createContext } from 'react'

export type TaskFiltersContextValue = {
  /** What the query filters by. Trails the field, so typing is not a request. */
  appliedTerm: string
  setTerm: (term: string) => void
  /** What the field shows, which has to follow every keystroke. */
  term: string
}

/**
 * One search term for the whole shell. The field lives in the header and the
 * queries live in the pages beneath it, so neither can own the term; the layout
 * does, and both read it here, the way the task-form trigger works (5.13).
 */
export const TaskFiltersContext = createContext<TaskFiltersContextValue | null>(null)
