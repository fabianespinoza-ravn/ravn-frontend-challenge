import type { PointEstimate, TaskTag } from './apiTask'

export const taskStatuses = [
  { color: '#92959a', label: 'Backlog', value: 'BACKLOG' },
  { color: '#e3bd57', label: 'To Do', value: 'TODO' },
  { color: '#a98ddd', label: 'In Progress', value: 'IN_PROGRESS' },
  { color: '#65b98b', label: 'Done', value: 'DONE' },
  { color: '#e2716a', label: 'Cancelled', value: 'CANCELLED' },
] as const

export type TaskStatus = (typeof taskStatuses)[number]['value']

export type TaskAssignee = {
  id: string
  initials: string
  name: string
}

/*
 * The estimate and the tags stay in the shape the API speaks, and the views
 * derive their wording through `taskLabels` at render. Presenting them as a
 * number and a list of labels lost what editing needs to send back: `4` and
 * `Node.js` cannot name `FOUR` and `NODE_JS` again without an inverse table
 * that a change of copy would quietly break. It also let the model hold
 * estimates the API cannot express, which the fixtures had already started
 * doing.
 */
export type Task = {
  assignee?: TaskAssignee
  attachmentCount: number
  checklistCount: number
  commentCount: number
  dueDate: string
  dueDateLabel: string
  dueDateTone: 'future' | 'past' | 'soon'
  id: string
  pointEstimate: PointEstimate
  status: TaskStatus
  tags: TaskTag[]
  title: string
}
