import { useQuery } from '@apollo/client/react'
import { GET_USERS } from '@/entities/user/api/userOperations'
import type { User } from './user'

export type UsersQueryData = {
  users: User[]
}

/**
 * The teammates a draft can be assigned to. Task creation is the only consumer,
 * so the query waits for a draft to open rather than running on every page load;
 * the cache answers every later open.
 */
export function useUsers({ skip = false } = {}) {
  return useQuery<UsersQueryData>(GET_USERS, { skip })
}
