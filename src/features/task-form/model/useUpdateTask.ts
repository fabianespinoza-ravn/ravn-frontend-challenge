import { useMutation } from '@apollo/client/react'
import { UPDATE_TASK } from '@/entities/task/api/taskOperations'
import type { ApiTask } from '@/entities/task/model/apiTask'

export type UpdateTaskData = {
  updateTask: ApiTask
}

/**
 * Saves the edited task and lets the cache carry the result.
 *
 * The mutation answers with the whole task under the id it already had, so
 * every cached result holding that entity re-reads it and the board and My
 * Tasks change together, without a request whose answer is already in hand.
 *
 * There is no blanket refetch here because only one field can do more than
 * change a value: reassigning a task moves it in or out of the list My Tasks
 * asks the server to filter. `AppLayout` asks for a refetch in that one case,
 * where it can see the assignee the task had and the one it is being given.
 * Status is not such a case, since the board reads every task and groups the
 * columns itself.
 */
export function useUpdateTask() {
  return useMutation<UpdateTaskData>(UPDATE_TASK)
}
