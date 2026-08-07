import type { ReactNode } from 'react'
import { TaskFormContext } from '@/features/task-form/model/taskFormContext'

type TaskFormTestProviderProps = {
  children: ReactNode
  openTaskForm?: () => void
}

/**
 * Supplies the layout-owned task creation trigger to components rendered in
 * isolation, so a unit test does not need the complete application shell.
 */
export function TaskFormTestProvider({
  children,
  openTaskForm = () => {},
}: TaskFormTestProviderProps) {
  return <TaskFormContext value={{ openTaskForm }}>{children}</TaskFormContext>
}
