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

/*
 * `assigneeId` is required here and nullable, where creation has it optional and
 * never null. An update that leaves the field out keeps whoever is already
 * assigned, so the type refuses to let a caller forget it: the only way to say
 * "nobody" is to say `null` (contract 5.12).
 *
 * `position` is absent even though the schema accepts it, because updating it
 * fails against the live API. Leaving it out of the type is what keeps 5.13 from
 * depending on anyone remembering it.
 */
export type UpdateTaskInput = {
  assigneeId: string | null
  dueDate: string
  id: string
  name: string
  pointEstimate: PointEstimate
  status: TaskStatus
  tags: TaskTag[]
}

export type DeleteTaskInput = {
  id: string
}

export type TaskFilterInput = {
  assigneeId?: string
  dueDate?: string
  name?: string
  pointEstimate?: PointEstimate
  status?: TaskStatus
  tags?: TaskTag[]
}
