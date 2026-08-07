import { useContext } from 'react'
import { TaskActionsContext } from './taskActionsContext'

export function useTaskActions() {
  const taskActions = useContext(TaskActionsContext)

  if (!taskActions) {
    throw new Error('useTaskActions must be used inside a TaskActionsContext provider.')
  }

  return taskActions
}
