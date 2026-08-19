import { useCallback } from 'react'
import { useProfile } from '@/entities/user/model/useProfile'
import { useFilteredTasks } from '@/features/task-filters/model/useFilteredTasks'

/**
 * The authenticated user's tasks, filtered.
 *
 * All this route adds to the board's own request is its assignee and the profile
 * that answers who that is.
 */
export function useAssignedTasks() {
  const profileQuery = useProfile()
  const profileId = profileQuery.data?.profile.id
  /*
   * The route's own assignee wins over the panel's, which is why the panel does
   * not offer that control here: My Tasks is the assignee filter, and a second
   * one would either contradict it or do nothing.
   */
  const filtered = useFilteredTasks({ assigneeId: profileId, skip: !profileId })
  const retryTasks = filtered.retry

  const retry = useCallback(() => {
    void profileQuery.refetch()

    if (profileId) {
      retryTasks()
    }
  }, [profileId, profileQuery, retryTasks])

  return {
    error: profileQuery.error ?? filtered.error,
    isFiltered: filtered.isFiltered,
    /* The list waits on the profile too, since the request cannot go without it. */
    isLoading: (profileQuery.loading || filtered.loading) && !filtered.hasPreviousData,
    isRefreshing: filtered.isRefreshing,
    retry,
    tasks: filtered.tasks,
  }
}
