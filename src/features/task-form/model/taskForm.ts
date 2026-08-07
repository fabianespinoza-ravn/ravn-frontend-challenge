import type {
  CreateTaskInput,
  PointEstimate,
  TaskTag,
  UpdateTaskInput,
} from '@/entities/task/model/apiTask'
import type { Task, TaskStatus } from '@/entities/task/model/task'
import { toApiDueDate, toDueDateValue } from '@/shared/lib/date/dueDate'

/**
 * Shared identifiers so a container can render its own submit control outside
 * the form element and still target it through the HTML `form` attribute.
 */
export const taskFormId = 'task-form'
export const taskFormTitleId = 'task-form-title'
/** Every control the draft is short of points here, so focusing one reads why. */
export const taskFormStatusId = 'task-form-status'

export type TaskFormValues = {
  assigneeId: string
  dueDate: string
  name: string
  pointEstimate: PointEstimate | ''
  status: TaskStatus | ''
  tags: TaskTag[]
}

export const emptyTaskFormValues: TaskFormValues = {
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
export function getMissingFields(values: TaskFormValues): RequiredField[] {
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
 * A draft built from a task that already exists. The estimate, the tags and the
 * status travel as the API spells them, which is why the board keeps them that
 * way (6.3), and the due date returns to the local calendar day the controls
 * work in. An absent assignee becomes the empty string the controls use for
 * nobody, which `toUpdateTaskInput` turns back into an explicit `null`.
 */
export function toTaskFormValues(task: Task): TaskFormValues {
  return {
    assigneeId: task.assignee?.id ?? '',
    dueDate: toDueDateValue(new Date(task.dueDate)),
    name: task.title,
    pointEstimate: task.pointEstimate,
    status: task.status,
    tags: task.tags,
  }
}

/**
 * The draft in the shape `createTask` accepts, or `null` while it is short of
 * something. `assigneeId` is omitted rather than sent empty.
 *
 * This and `getMissingFields` share one rule, so what the form reports missing
 * and what the request refuses to send can never drift apart.
 */
export function toCreateTaskInput(values: TaskFormValues): CreateTaskInput | null {
  const dueDate = toApiDueDate(values.dueDate)

  if (getMissingFields(values).length > 0 || !dueDate) {
    return null
  }

  return {
    ...(values.assigneeId ? { assigneeId: values.assigneeId } : {}),
    dueDate,
    name: values.name.trim(),
    pointEstimate: values.pointEstimate as Exclude<TaskFormValues['pointEstimate'], ''>,
    status: values.status as Exclude<TaskFormValues['status'], ''>,
    tags: values.tags,
  }
}

/**
 * The same draft in the shape `updateTask` accepts. It differs from creation in
 * one field, and that field is the reason this function exists rather than a
 * flag on the one above.
 *
 * An empty `assigneeId` leaves as an explicit `null`. Creation may omit the
 * field because there is nothing to leave behind, but an update that omits it
 * keeps whoever is already assigned (contract 5.12). Reusing the creation rule
 * would let someone clear an assignee, watch the request succeed, and find the
 * assignee still there, with nothing to explain it.
 *
 * This assumes the form always submits every field, which both containers do. A
 * later partial update, such as changing status straight from the card menu,
 * would need a way to say "leave this alone" that an empty string cannot carry.
 */
export function toUpdateTaskInput(id: string, values: TaskFormValues): UpdateTaskInput | null {
  const dueDate = toApiDueDate(values.dueDate)

  if (getMissingFields(values).length > 0 || !dueDate) {
    return null
  }

  return {
    assigneeId: values.assigneeId || null,
    dueDate,
    id,
    name: values.name.trim(),
    pointEstimate: values.pointEstimate as Exclude<TaskFormValues['pointEstimate'], ''>,
    status: values.status as Exclude<TaskFormValues['status'], ''>,
    tags: values.tags,
  }
}
