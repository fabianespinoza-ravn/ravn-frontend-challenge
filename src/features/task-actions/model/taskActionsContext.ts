import { createContext } from 'react'
import type { Task } from '@/entities/task/model/task'

export type TaskActionsContextValue = {
  /** Both open something the layout owns; neither performs the change itself. */
  deleteTask: (task: Task) => void
  editTask: (task: Task) => void
}

/**
 * The menu sits on a card, and the composition it opens is owned by the layout,
 * which is already where the single task-form state lives (5.13). Passing these
 * through the board and its columns would drill a callback through components
 * that have no interest in it, so the menu reads them here instead and this
 * feature never has to import the one that owns the form.
 */
export const TaskActionsContext = createContext<TaskActionsContextValue | null>(null)
