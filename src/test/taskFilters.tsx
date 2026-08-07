import type { ReactNode } from 'react'
import { TaskFiltersContext } from '@/features/task-filters/model/taskFiltersContext'

type TaskFiltersTestProviderProps = {
  /** What a query would filter by; defaults to searching for nothing. */
  appliedTerm?: string
  children: ReactNode
  setTerm?: (term: string) => void
  term?: string
}

/**
 * Supplies the layout-owned search term to components rendered in isolation, so
 * a unit test of the header or either task view does not need the complete
 * application shell.
 */
export function TaskFiltersTestProvider({
  appliedTerm = '',
  children,
  setTerm = () => {},
  term = '',
}: TaskFiltersTestProviderProps) {
  return <TaskFiltersContext value={{ appliedTerm, setTerm, term }}>{children}</TaskFiltersContext>
}
