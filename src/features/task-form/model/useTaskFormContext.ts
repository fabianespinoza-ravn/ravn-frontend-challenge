import { useContext } from 'react'
import { TaskFormContext } from './taskFormContext'

export function useTaskFormContext() {
  const taskForm = useContext(TaskFormContext)

  if (!taskForm) {
    throw new Error('useTaskFormContext must be used inside a TaskFormContext provider.')
  }

  return taskForm
}
