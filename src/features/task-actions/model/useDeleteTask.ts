import { useMutation } from '@apollo/client/react'
import { DELETE_TASK, GET_TASKS } from '@/entities/task/api/taskOperations'
import type { ApiTask } from '@/entities/task/model/apiTask'

export type DeleteTaskData = {
  deleteTask: ApiTask
}

/**
 * Removes the task and refetches `GET_TASKS`, the way creation and editing do.
 * The deleted task has to leave the board and My Tasks together, and both read
 * that document under filters the server owns.
 */
export function useDeleteTask() {
  return useMutation<DeleteTaskData>(DELETE_TASK, {
    refetchQueries: [GET_TASKS],
  })
}
