import { useQuery } from '@apollo/client/react'
import { useCallback, useMemo } from 'react'
import { GET_TASKS } from '@/entities/task/api/taskOperations'
import type { ApiTask, TaskFilterInput } from '@/entities/task/model/apiTask'
import { mapApiTaskToTask } from '@/entities/task/model/taskMapper'
import { useProfile } from '@/entities/user/model/useProfile'
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
  const { appliedTerm } = useTaskFilters()
  /*
   * Both fields in one input. Contract 5.10 confirmed that different filter
   * fields combine with AND, so searching here stays inside what is assigned to
   * the authenticated user rather than escaping into everyone's tasks.
   */
  const taskVariables = useMemo(
    () => ({
      input: {
        ...(profileId ? { assigneeId: profileId } : {}),
        ...(appliedTerm ? { name: appliedTerm } : {}),
      },
    }),
    [appliedTerm, profileId],
  )
  const tasksQuery = useQuery<TasksQueryData, TasksQueryVariables>(GET_TASKS, {
    skip: !profileId,
    variables: taskVariables,
  })

  const tasks = useMemo(
    () => [...(tasksQuery.data?.tasks ?? [])].sort(sortTasksByDueDate).map(mapApiTaskToTask),
    [tasksQuery.data?.tasks],
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
    isFiltered: appliedTerm !== '',
    isLoading: profileQuery.loading || tasksQuery.loading,
    retry,
    tasks,
  }
}
