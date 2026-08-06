import type { CreateTaskInput, PointEstimate, TaskTag } from '@/entities/task/model/apiTask'
import type { TaskStatus } from '@/entities/task/model/task'
import { toApiDueDate } from './dueDate'

/**
 * Shared identifiers so a container can render its own submit control outside
 * the form element and still target it through the HTML `form` attribute.
 */
export const taskCreationFormId = 'task-creation-form'
export const taskCreationTitleId = 'task-creation-title'
/** Every control the draft is short of points here, so focusing one reads why. */
export const taskCreationStatusId = 'task-creation-status'

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

/** `assigneeId` is the only field `createTask` accepts without (contract 5.8). */
export const requiredFields = ['name', 'status', 'pointEstimate', 'tags', 'dueDate'] as const

export type RequiredField = (typeof requiredFields)[number]

export const requiredFieldLabels: Record<RequiredField, string> = {
  dueDate: 'Due date',
  name: 'Task title',
  pointEstimate: 'Estimate',
  status: 'Status',
  tags: 'Label',
}

/** Listed in the order the user meets them, so the summary reads top to bottom. */
export function getMissingFields(values: TaskCreationFormValues): RequiredField[] {
  return requiredFields.filter((field) => {
    if (field === 'name') {
      return values.name.trim() === ''
    }

    if (field === 'tags') {
      return values.tags.length === 0
    }

    return values[field] === ''
  })
}

/**
 * The draft in the shape `createTask` accepts, or `null` while it is short of
 * something. `assigneeId` is omitted rather than sent empty.
 *
 * This and `getMissingFields` share one rule, so what the form reports missing
 * and what the request refuses to send can never drift apart.
 */
export function toCreateTaskInput(values: TaskCreationFormValues): CreateTaskInput | null {
  const dueDate = toApiDueDate(values.dueDate)

  if (getMissingFields(values).length > 0 || !dueDate) {
    return null
  }

  return {
    ...(values.assigneeId ? { assigneeId: values.assigneeId } : {}),
    dueDate,
    name: values.name.trim(),
    pointEstimate: values.pointEstimate as Exclude<TaskCreationFormValues['pointEstimate'], ''>,
    status: values.status as Exclude<TaskCreationFormValues['status'], ''>,
    tags: values.tags,
  }
}
