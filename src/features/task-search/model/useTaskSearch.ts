import { useContext } from 'react'
import { TaskSearchContext } from './taskSearchContext'

export function useTaskSearch() {
  const taskSearch = useContext(TaskSearchContext)

  if (!taskSearch) {
    throw new Error('useTaskSearch must be used inside a TaskSearchContext provider.')
  }

  return taskSearch
}
