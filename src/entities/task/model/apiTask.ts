import type { User } from '@/entities/user/model/user'
import type { TaskStatus } from './task'

export const pointEstimates = ['ZERO', 'ONE', 'TWO', 'FOUR', 'EIGHT'] as const
export const taskTags = ['ANDROID', 'IOS', 'NODE_JS', 'RAILS', 'REACT'] as const

export type PointEstimate = (typeof pointEstimates)[number]
export type TaskTag = (typeof taskTags)[number]

export type ApiTask = {
  assignee: User | null
  createdAt: string
  creator: User
  dueDate: string
  id: string
  name: string
  pointEstimate: PointEstimate
  position: number
  status: TaskStatus
  tags: TaskTag[]
}

export type CreateTaskInput = {
  assigneeId?: string
  dueDate: string
  name: string
  pointEstimate: PointEstimate
  status: TaskStatus
  tags: TaskTag[]
}

export type TaskFilterInput = {
  assigneeId?: string
  dueDate?: string
  name?: string
  pointEstimate?: PointEstimate
  status?: TaskStatus
  tags?: TaskTag[]
}
