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
  const { data, error, loading, previousData, refetch } = useQuery<TasksQueryData>(GET_TASKS, {
    variables,
  })
  /*
   * Narrowing a filter changes the variables, which empties `data` while the
   * next answer is in flight. Falling back to the previous one keeps the board
   * mounted: without it every filter change unmounted the whole board, threw
   * away every card and menu, and replaced them with a loading panel.
   */
  const apiTasks = data?.tasks ?? previousData?.tasks

  const tasks = useMemo(
    () =>
      applyClientFilters(
        [...(apiTasks ?? [])].sort(sortTasksByDueDate).map(mapApiTaskToTask),
        appliedFilters,
      ),
    [apiTasks, appliedFilters],
  )

  const retry = useCallback(() => {
    void refetch()
  }, [refetch])

  return {
    error,
    /* Lets the view say "nothing matches" rather than "there are no tasks". */
    isFiltered: hasActiveFilters(appliedFilters),
    /* Only the first answer is worth blanking the view for. */
    isLoading: loading && !previousData,
    /* A later one is a refresh, which the board reports without leaving. */
    isRefreshing: loading && Boolean(previousData),
    retry,
    tasks,
  }
}
