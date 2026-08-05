import type { MockedResponse } from '@apollo/client/testing'
import { GET_TASKS } from '@/entities/task/api/taskOperations'
import { GET_PROFILE, GET_USERS } from '@/entities/user/api/userOperations'
import type { ApiTask } from '@/entities/task/model/apiTask'
import type { User } from '@/entities/user/model/user'

export const mockProfile: User = {
  avatar: null,
  createdAt: '2026-08-04T00:00:00.000Z',
  email: 'fabian@example.com',
  fullName: 'Fabian Espinoza',
  id: 'profile-1',
  type: 'CANDIDATE',
  updatedAt: '2026-08-04T00:00:00.000Z',
}

export const mockUsers: User[] = [mockProfile]

export const mockApiTasks: ApiTask[] = []

export function createGraphqlMocks(tasks: ApiTask[] = mockApiTasks): MockedResponse[] {
  return [
    {
      request: { query: GET_PROFILE },
      result: { data: { profile: mockProfile } },
    },
    {
      request: { query: GET_USERS },
      result: { data: { users: mockUsers } },
    },
    {
      request: { query: GET_TASKS, variables: { input: {} } },
      result: { data: { tasks } },
    },
  ]
}
