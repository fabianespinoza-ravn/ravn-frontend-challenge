import type { ReactNode } from 'react'
import { TaskCreationContext } from '@/features/task-creation/model/taskCreationContext'

type TaskCreationTestProviderProps = {
  children: ReactNode
  openTaskCreation?: () => void
}

/**
 * Supplies the layout-owned task creation trigger to components rendered in
 * isolation, so a unit test does not need the complete application shell.
 */
export function TaskCreationTestProvider({
  children,
  openTaskCreation = () => {},
}: TaskCreationTestProviderProps) {
  return <TaskCreationContext value={{ openTaskCreation }}>{children}</TaskCreationContext>
}
