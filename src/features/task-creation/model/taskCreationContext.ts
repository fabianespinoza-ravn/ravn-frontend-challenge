import { createContext } from 'react'

export type TaskCreationContextValue = {
  openTaskCreation: () => void
}

/**
 * Exposes the layout-owned task creation trigger to descendants such as the
 * task toolbar, without routing the callback through every page in between.
 */
export const TaskCreationContext = createContext<TaskCreationContextValue | null>(null)
