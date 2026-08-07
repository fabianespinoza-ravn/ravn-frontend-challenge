import { useQuery } from '@apollo/client/react'
import { useCallback, useMemo } from 'react'
import { GET_TASKS } from '@/entities/task/api/taskOperations'
import type { ApiTask } from '@/entities/task/model/apiTask'
import { mapApiTaskToTask } from '@/entities/task/model/taskMapper'
import { useTaskFilters } from '@/features/task-filters/model/useTaskFilters'

type TasksQueryData = {
  tasks: ApiTask[]
}

function sortTasksByDueDate(firstTask: ApiTask, secondTask: ApiTask) {
  return new Date(firstTask.dueDate).getTime() - new Date(secondTask.dueDate).getTime()
}

export function useDashboardTasks() {
  const { appliedTerm } = useTaskFilters()
  /*
   * The server filters, not the client: it owns what a match is, and filtering
   * here would only ever search what happened to be loaded. An empty term sends
   * no `name` at all rather than an empty one.
   */
  const variables = useMemo(
    () => ({ input: appliedTerm ? { name: appliedTerm } : {} }),
    [appliedTerm],
  )
  const { data, error, loading, refetch } = useQuery<TasksQueryData>(GET_TASKS, { variables })

  const tasks = useMemo(
    () => [...(data?.tasks ?? [])].sort(sortTasksByDueDate).map(mapApiTaskToTask),
    [data?.tasks],
  )

  const retry = useCallback(() => {
    void refetch()
  }, [refetch])

  return {
    error,
    /* Lets the view say "nothing matches" rather than "there are no tasks". */
    isFiltered: appliedTerm !== '',
    isLoading: loading,
    retry,
    tasks,
  }
}
