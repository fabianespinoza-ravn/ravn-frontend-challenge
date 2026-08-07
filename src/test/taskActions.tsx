import type { ReactNode } from 'react'
import type { Task } from '@/entities/task/model/task'
import { TaskActionsContext } from '@/features/task-actions/model/taskActionsContext'

type TaskActionsTestProviderProps = {
  children: ReactNode
  editTask?: (task: Task) => void
}

/**
 * Supplies the layout-owned task actions to components rendered in isolation,
 * so a unit test of the board or the task list does not need the complete
 * application shell.
 */
export function TaskActionsTestProvider({
  children,
  editTask = () => {},
}: TaskActionsTestProviderProps) {
  return <TaskActionsContext value={{ editTask }}>{children}</TaskActionsContext>
}
