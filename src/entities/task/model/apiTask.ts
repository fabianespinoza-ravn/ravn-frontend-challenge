import type { User } from '@/entities/user/model/user'
import type { TaskStatus } from './task'

export const pointEstimates = ['ZERO', 'ONE', 'TWO', 'FOUR', 'EIGHT'] as const
export const taskTags = ['ANDROID', 'IOS', 'NODE_JS', 'RAILS', 'REACT'] as const

export type PointEstimate = (typeof pointEstimates)[number]
export type TaskTag = (typeof taskTags)[number]

/** Only what the mapper reads: the fragment asks for exactly these. */
export type ApiTaskAssignee = Pick<User, 'fullName' | 'id'>

export type ApiTask = {
  assignee: ApiTaskAssignee | null
  dueDate: string
  id: string
  name: string
  pointEstimate: PointEstimate
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

/*
 * `ownerId` is deliberately absent. The schema accepts it and the API ignores
 * it: filtering by any of the four creators in the verified account, or by a
 * UUID belonging to nobody, returns every task. Leaving it off the type is what
 * stops a control being built for a filter that cannot filter.
 */
export type TaskFilterInput = {
  /** `null` asks for the unassigned ones, which the API answers for. */
  assigneeId?: string | null
  dueDate?: string
  name?: string
  pointEstimate?: PointEstimate
  status?: TaskStatus
  tags?: TaskTag[]
}
