import { useQuery } from '@apollo/client/react'
import { useCallback, useMemo } from 'react'
import { GET_TASKS } from '@/entities/task/api/taskOperations'
import type { ApiTask, TaskFilterInput } from '@/entities/task/model/apiTask'
import { mapApiTaskToTask } from '@/entities/task/model/taskMapper'
import { useProfile } from '@/entities/user/model/useProfile'
import {
  applyClientFilters,
  hasActiveFilters,
  toTaskFilterInput,
} from '@/features/task-filters/model/taskFilters'
import { useTaskFilters } from '@/features/task-filters/model/useTaskFilters'

type TasksQueryData = {
  tasks: ApiTask[]
}

type TasksQueryVariables = {
  input: TaskFilterInput
}

function sortTasksByDueDate(firstTask: ApiTask, secondTask: ApiTask) {
  return new Date(firstTask.dueDate).getTime() - new Date(secondTask.dueDate).getTime()
}

export function useAssignedTasks() {
  const profileQuery = useProfile()
  const profileId = profileQuery.data?.profile.id
  const { appliedFilters } = useTaskFilters()
  /*
   * Both fields in one input. Contract 5.10 confirmed that different filter
   * fields combine with AND, so searching here stays inside what is assigned to
   * the authenticated user rather than escaping into everyone's tasks.
   */
  /*
   * The route's own assignee wins over the panel's, which is why the panel does
   * not offer that control here: My Tasks is the assignee filter, and a second
   * one would either contradict it or do nothing.
   */
  const taskVariables = useMemo(
    () => ({
      input: {
        ...toTaskFilterInput(appliedFilters),
        ...(profileId ? { assigneeId: profileId } : {}),
      },
    }),
    [appliedFilters, profileId],
  )
  const tasksQuery = useQuery<TasksQueryData, TasksQueryVariables>(GET_TASKS, {
    skip: !profileId,
    variables: taskVariables,
  })

  // Keeps the list mounted while a narrowed filter is answered; see 7.x.
  const apiTasks = tasksQuery.data?.tasks ?? tasksQuery.previousData?.tasks

  const tasks = useMemo(
    () =>
      applyClientFilters(
        [...(apiTasks ?? [])].sort(sortTasksByDueDate).map(mapApiTaskToTask),
        appliedFilters,
      ),
    [apiTasks, appliedFilters],
  )

  const retry = useCallback(() => {
    void profileQuery.refetch()

    if (profileId) {
      void tasksQuery.refetch(taskVariables)
    }
  }, [profileId, profileQuery, taskVariables, tasksQuery])

  return {
    error: profileQuery.error ?? tasksQuery.error,
    /* Lets the view say "nothing matches" rather than "nothing is assigned". */
    isFiltered: hasActiveFilters(appliedFilters),
    isLoading: (profileQuery.loading || tasksQuery.loading) && !tasksQuery.previousData,
    isRefreshing: tasksQuery.loading && Boolean(tasksQuery.previousData),
    retry,
    tasks,
  }
}
