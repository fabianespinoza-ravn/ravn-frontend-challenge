import { useQuery } from '@apollo/client/react'
import { useCallback, useMemo } from 'react'
import { GET_TASKS } from '@/entities/task/api/taskOperations'
import type { ApiTask } from '@/entities/task/model/apiTask'
import { mapApiTaskToTask } from '@/entities/task/model/taskMapper'
import {
  applyClientFilters,
  hasActiveFilters,
  toTaskFilterInput,
} from '@/features/task-filters/model/taskFilters'
import { useTaskFilters } from '@/features/task-filters/model/useTaskFilters'

type TasksQueryData = {
  tasks: ApiTask[]
}

function sortTasksByDueDate(firstTask: ApiTask, secondTask: ApiTask) {
  return new Date(firstTask.dueDate).getTime() - new Date(secondTask.dueDate).getTime()
}

export function useDashboardTasks() {
  const { appliedFilters } = useTaskFilters()
  /*
   * The server filters, not the client: it owns what a match is, and filtering
   * here would only ever search what happened to be loaded. An empty term sends
   * no `name` at all rather than an empty one.
   */
  const variables = useMemo(() => ({ input: toTaskFilterInput(appliedFilters) }), [appliedFilters])
  const { data, error, loading, refetch } = useQuery<TasksQueryData>(GET_TASKS, { variables })

  const tasks = useMemo(
    () =>
      applyClientFilters(
        [...(data?.tasks ?? [])].sort(sortTasksByDueDate).map(mapApiTaskToTask),
        appliedFilters,
      ),
    [appliedFilters, data?.tasks],
  )

  const retry = useCallback(() => {
    void refetch()
  }, [refetch])

  return {
    error,
    /* Lets the view say "nothing matches" rather than "there are no tasks". */
    isFiltered: hasActiveFilters(appliedFilters),
    isLoading: loading,
    retry,
    tasks,
  }
}
