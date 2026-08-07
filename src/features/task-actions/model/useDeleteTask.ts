import { useMutation } from '@apollo/client/react'
import { DELETE_TASK } from '@/entities/task/api/taskOperations'
import type { ApiTask } from '@/entities/task/model/apiTask'

export type DeleteTaskData = {
  deleteTask: ApiTask
}

/**
 * Removes the task from the cache rather than asking the server for every list
 * again.
 *
 * Creation refetches because only the server can say whether a new task belongs
 * in a filter it owns (5.43). Deletion has no such question: a task that no
 * longer exists belongs in no list, under any filter, so evicting its entity is
 * exact rather than a guess at a server rule. Apollo drops the dangling
 * references from every cached result, which is what takes the card off the
 * board and out of My Tasks at once, with no round trip to wait through.
 */
export function useDeleteTask() {
  return useMutation<DeleteTaskData>(DELETE_TASK, {
    update(cache, { data }) {
      if (!data?.deleteTask) {
        return
      }

      cache.evict({ id: cache.identify(data.deleteTask) })
      // Sweeps the entity itself once nothing refers to it any more.
      cache.gc()
    },
  })
}
