import type { ApiTask } from './apiTask'
import type { Task } from './task'
import { getUserInitials } from '@/entities/user/model/user'

const millisecondsPerDay = 86_400_000

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * Whole days from today to the due date, both reduced to a local calendar day
 * first. The API stores an instant, so a task due today arrives as a moment that
 * is only "today" once it is read in the viewer's own timezone; comparing the
 * instants directly would call it yesterday for anyone far enough west. Rounding
 * absorbs the daylight-saving days that are 23 or 25 hours long.
 */
function getDayOffset(dueDate: Date) {
  const difference = startOfLocalDay(dueDate).getTime() - startOfLocalDay(new Date()).getTime()

  return Math.round(difference / millisecondsPerDay)
}

function getDueDateTone(dayOffset: number) {
  if (dayOffset < 0) {
    return 'past' as const
  }

  // Today and tomorrow share a tone; only their labels tell them apart.
  return dayOffset <= 1 ? ('soon' as const) : ('future' as const)
}

const dueDateParts = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/**
 * `10 Aug, 2026`, the order the reference composition reads in. The parts come
 * from `Intl` rather than a month table so the abbreviations stay its business,
 * and only their arrangement belongs here.
 */
function formatDueDate(dueDate: Date) {
  const parts = Object.fromEntries(
    dueDateParts.formatToParts(dueDate).map((part) => [part.type, part.value]),
  )

  return `${parts.day} ${parts.month}, ${parts.year}`
}

function getDueDateLabel(dueDate: Date, dayOffset: number) {
  if (Number.isNaN(dueDate.getTime())) {
    return 'Date unavailable'
  }

  if (dayOffset < 0) {
    return 'Past due'
  }

  if (dayOffset === 0) {
    return 'Today'
  }

  if (dayOffset === 1) {
    return 'Tomorrow'
  }

  return formatDueDate(dueDate)
}

export function mapApiTaskToTask(apiTask: ApiTask): Task {
  const dueDate = new Date(apiTask.dueDate)
  const dayOffset = getDayOffset(dueDate)
  const dueDateTone = getDueDateTone(dayOffset)

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
    dueDateLabel: getDueDateLabel(dueDate, dayOffset),
    dueDateTone,
    id: apiTask.id,
    pointEstimate: apiTask.pointEstimate,
    status: apiTask.status,
    tags: apiTask.tags,
    title: apiTask.name,
  }
}
