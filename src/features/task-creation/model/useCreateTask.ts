import { useMutation } from '@apollo/client/react'
import { CREATE_TASK, GET_TASKS } from '@/entities/task/api/taskOperations'
import type { ApiTask } from '@/entities/task/model/apiTask'

export type CreateTaskData = {
  createTask: ApiTask
}

/**
 * Creates the drafted task and brings the views that list tasks back in step.
 *
 * Both the board and My Tasks read `GET_TASKS`, so refetching by document
 * refreshes every active filter without this feature having to know which ones
 * are cached or whether the new task belongs in them. Writing the result into
 * the cache by hand would save a round trip, but it would also mean deciding
 * here whether a task matches a filter the server owns, which is exactly the
 * kind of duplicated rule that drifts.
 */
export function useCreateTask() {
  return useMutation<CreateTaskData>(CREATE_TASK, {
    refetchQueries: [GET_TASKS],
  })
}
