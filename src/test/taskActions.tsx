import type { ReactNode } from 'react'
import type { Task } from '@/entities/task/model/task'
import { TaskActionsContext } from '@/features/task-actions/model/taskActionsContext'

type TaskActionsTestProviderProps = {
  children: ReactNode
  deleteTask?: (task: Task) => void
  editTask?: (task: Task) => void
}

/**
 * Supplies the layout-owned task actions to components rendered in isolation,
 * so a unit test of the board or the task list does not need the complete
 * application shell.
 */
export function TaskActionsTestProvider({
  children,
  deleteTask = () => {},
  editTask = () => {},
}: TaskActionsTestProviderProps) {
  return <TaskActionsContext value={{ deleteTask, editTask }}>{children}</TaskActionsContext>
}
