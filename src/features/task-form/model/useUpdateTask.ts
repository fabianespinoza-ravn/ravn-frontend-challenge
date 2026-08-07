import { useMutation } from '@apollo/client/react'
import { GET_TASKS, UPDATE_TASK } from '@/entities/task/api/taskOperations'
import type { ApiTask } from '@/entities/task/model/apiTask'

export type UpdateTaskData = {
  updateTask: ApiTask
}

/**
 * Saves the edited task and brings the views that list tasks back in step, for
 * the same reason creation does: an edit can move a task to another status or
 * hand it to somebody else, so it can enter or leave a filter the server owns.
 * Refetching `GET_TASKS` by document lets the server answer that instead of
 * this feature guessing which cached filters the task now belongs to.
 */
export function useUpdateTask() {
  return useMutation<UpdateTaskData>(UPDATE_TASK, {
    refetchQueries: [GET_TASKS],
  })
}
