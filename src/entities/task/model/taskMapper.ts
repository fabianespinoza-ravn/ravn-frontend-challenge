import type { ApiTask } from './apiTask'
import type { Task } from './task'
import { pointEstimateValues, tagLabels } from './taskLabels'
import { getUserInitials } from '@/entities/user/model/user'

function getDueDateTone(dueDate: Date) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (dueDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    return 'past' as const
  }

  if (dueDate < new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1)) {
    return 'soon' as const
  }

  return 'future' as const
}

function getDueDateLabel(dueDate: Date, tone: Task['dueDateTone']) {
  if (Number.isNaN(dueDate.getTime())) {
    return 'Date unavailable'
  }

  if (tone === 'past') {
    return 'Past due'
  }

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dueDate)
}

export function mapApiTaskToTask(apiTask: ApiTask): Task {
  const dueDate = new Date(apiTask.dueDate)
  const dueDateTone = getDueDateTone(dueDate)

  return {
    ...(apiTask.assignee
      ? {
          assignee: {
            id: apiTask.assignee.id,
            initials: getUserInitials(apiTask.assignee.fullName),
            name: apiTask.assignee.fullName,
          },
        }
      : {}),
    attachmentCount: 0,
    checklistCount: 0,
    commentCount: 0,
    dueDate: apiTask.dueDate,
    dueDateLabel: getDueDateLabel(dueDate, dueDateTone),
    dueDateTone,
    id: apiTask.id,
    points: pointEstimateValues[apiTask.pointEstimate],
    status: apiTask.status,
    tags: apiTask.tags.map((tag) => tagLabels[tag]),
    title: apiTask.name,
  }
}
