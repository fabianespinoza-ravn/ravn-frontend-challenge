import type { ApiTask, PointEstimate, TaskTag } from './apiTask'
import type { Task } from './task'
import { getUserInitials } from '@/entities/user/model/user'

const estimateValues: Record<PointEstimate, number> = {
  EIGHT: 8,
  FOUR: 4,
  ONE: 1,
  TWO: 2,
  ZERO: 0,
}

const tagLabels: Record<TaskTag, string> = {
  ANDROID: 'Android',
  IOS: 'iOS App',
  NODE_JS: 'Node.js',
  RAILS: 'Rails',
  REACT: 'React',
}

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
    points: estimateValues[apiTask.pointEstimate],
    status: apiTask.status,
    tags: apiTask.tags.map((tag) => tagLabels[tag]),
    title: apiTask.name,
  }
}
