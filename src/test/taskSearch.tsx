import type { ReactNode } from 'react'
import { TaskSearchContext } from '@/features/task-search/model/taskSearchContext'

type TaskSearchTestProviderProps = {
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
export function TaskSearchTestProvider({
  appliedTerm = '',
  children,
  setTerm = () => {},
  term = '',
}: TaskSearchTestProviderProps) {
  return <TaskSearchContext value={{ appliedTerm, setTerm, term }}>{children}</TaskSearchContext>
}
