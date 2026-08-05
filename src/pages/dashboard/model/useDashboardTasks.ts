import { useQuery } from '@apollo/client/react'
import { useCallback, useMemo } from 'react'
import { GET_TASKS } from '@/entities/task/api/taskOperations'
import type { ApiTask } from '@/entities/task/model/apiTask'
import { mapApiTaskToTask } from '@/entities/task/model/taskMapper'

type TasksQueryData = {
  tasks: ApiTask[]
}

const emptyFilter = {}

function sortTasksByDueDate(firstTask: ApiTask, secondTask: ApiTask) {
  return new Date(firstTask.dueDate).getTime() - new Date(secondTask.dueDate).getTime()
}

export function useDashboardTasks() {
  const { data, error, loading, refetch } = useQuery<TasksQueryData>(GET_TASKS, {
    variables: { input: emptyFilter },
  })

  const tasks = useMemo(
    () => [...(data?.tasks ?? [])].sort(sortTasksByDueDate).map(mapApiTaskToTask),
    [data?.tasks],
  )

  const retry = useCallback(() => {
    void refetch()
  }, [refetch])

  return {
    error,
    isLoading: loading,
    retry,
    tasks,
  }
}
