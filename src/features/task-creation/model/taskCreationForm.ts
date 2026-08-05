import type { PointEstimate, TaskTag } from '@/entities/task/model/apiTask'
import type { TaskStatus } from '@/entities/task/model/task'

/**
 * Shared identifiers so a container can render its own submit control outside
 * the form element and still target it through the HTML `form` attribute.
 */
export const taskCreationFormId = 'task-creation-form'
export const taskCreationTitleId = 'task-creation-title'

export type TaskCreationFormValues = {
  assigneeId: string
  dueDate: string
  name: string
  pointEstimate: PointEstimate | ''
  status: TaskStatus | ''
  tags: TaskTag[]
}

export const emptyTaskCreationFormValues: TaskCreationFormValues = {
  assigneeId: '',
  dueDate: '',
  name: '',
  pointEstimate: '',
  status: '',
  tags: [],
}
