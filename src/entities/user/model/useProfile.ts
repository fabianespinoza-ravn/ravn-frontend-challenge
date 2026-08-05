import { useQuery } from '@apollo/client/react'
import { GET_PROFILE } from '@/entities/user/api/userOperations'
import type { User } from './user'

export type ProfileQueryData = {
  profile: User
}

export function useProfile() {
  return useQuery<ProfileQueryData>(GET_PROFILE)
}
