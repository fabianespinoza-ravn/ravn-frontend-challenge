import { useContext } from 'react'
import { TaskFiltersContext } from './taskFiltersContext'

export function useTaskFilters() {
  const taskSearch = useContext(TaskFiltersContext)

  if (!taskSearch) {
    throw new Error('useTaskFilters must be used inside a TaskFiltersContext provider.')
  }

  return taskSearch
}
