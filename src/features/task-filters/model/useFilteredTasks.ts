import { useQuery } from '@apollo/client/react'
import { useCallback, useMemo } from 'react'
import { GET_TASKS } from '@/entities/task/api/taskOperations'
import type { ApiTask, TaskFilterInput } from '@/entities/task/model/apiTask'
import { mapApiTaskToTask } from '@/entities/task/model/taskMapper'
import { applyClientFilters, hasActiveFilters, toTaskFilterInput } from './taskFilters'
import { useTaskFilters } from './useTaskFilters'

type TasksQueryData = {
  tasks: ApiTask[]
}

type TasksQueryVariables = {
  input: TaskFilterInput
}

type UseFilteredTasksOptions = {
  /** A route's own assignee filter, which is not one of the panel's controls. */
  assigneeId?: string
  skip?: boolean
}

function sortTasksByDueDate(firstTask: ApiTask, secondTask: ApiTask) {
  return new Date(firstTask.dueDate).getTime() - new Date(secondTask.dueDate).getTime()
}

/**
 * The tasks a view should show, given the filters that are applied to it.
 *
 * The board and the list ran the same request, the same sort, the same mapping
 * and the same client-side pass, differing only in whether the route narrowed
 * them to one assignee. That difference is the argument.
 */
export function useFilteredTasks({ assigneeId, skip = false }: UseFilteredTasksOptions = {}) {
  const { appliedFilters } = useTaskFilters()
  /*
   * The server filters, not the client: it owns what a match is, and filtering
   * here would only ever search what happened to be loaded. An empty term sends
   * no `name` at all rather than an empty one. Both fields go in one input,
   * since contract 5.10 confirmed that different filter fields combine with AND,
   * so a route that narrows by assignee stays inside what is assigned there
   * rather than escaping into everyone's tasks.
   */
  const variables = useMemo(
    () => ({
      input: { ...toTaskFilterInput(appliedFilters), ...(assigneeId ? { assigneeId } : {}) },
    }),
    [appliedFilters, assigneeId],
  )
  const { data, error, loading, previousData, refetch } = useQuery<
    TasksQueryData,
    TasksQueryVariables
  >(GET_TASKS, { skip, variables })
  /*
   * Narrowing a filter changes the variables, which empties `data` while the
   * next answer is in flight. Falling back to the previous one keeps the view
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
    /* Lets a caller that waits on something else decide what counts as loading. */
    hasPreviousData: Boolean(previousData),
    /* Lets the view say "nothing matches" rather than "there are no tasks". */
    isFiltered: hasActiveFilters(appliedFilters),
    /* Only the first answer is worth blanking the view for. */
    isLoading: loading && !previousData,
    /* A later one is a refresh, which the view reports without leaving. */
    isRefreshing: loading && Boolean(previousData),
    loading,
    retry,
    tasks,
  }
}
