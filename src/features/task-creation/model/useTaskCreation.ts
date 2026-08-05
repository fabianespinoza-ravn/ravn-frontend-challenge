import { useContext } from 'react'
import { TaskCreationContext } from './taskCreationContext'

export function useTaskCreation() {
  const taskCreation = useContext(TaskCreationContext)

  if (!taskCreation) {
    throw new Error('useTaskCreation must be used inside a TaskCreationContext provider.')
  }

  return taskCreation
}
