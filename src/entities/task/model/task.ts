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

export type Task = {
  assignee?: TaskAssignee
  attachmentCount: number
  checklistCount: number
  commentCount: number
  dueDate: string
  dueDateLabel: string
  dueDateTone: 'future' | 'past' | 'soon'
  id: string
  points: number
  status: TaskStatus
  tags: string[]
  title: string
}
