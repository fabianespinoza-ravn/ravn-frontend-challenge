import type { PointEstimate, TaskFilterInput, TaskTag } from '@/entities/task/model/apiTask'
import type { Task, TaskStatus } from '@/entities/task/model/task'
import { toDueDateValue } from '@/shared/lib/date/dueDate'

/**
 * Three states, and every one of them is a choice the panel can express:
 * `''` is anybody, `null` is nobody, and an id is that teammate. The task form
 * was refused a tri-state for exactly the opposite reason (6.1) — there, no
 * control could ever produce the third.
 */
export type AssigneeFilter = string | null | ''

export type TaskFilters = {
  assigneeId: AssigneeFilter
  /** A local `YYYY-MM-DD`. Matched here rather than by the API; see below. */
  dueDate: string
  name: string
  pointEstimate: PointEstimate | ''
  status: TaskStatus | ''
  tags: TaskTag[]
}

export const emptyTaskFilters: TaskFilters = {
  assigneeId: '',
  dueDate: '',
  name: '',
  pointEstimate: '',
  status: '',
  tags: [],
}

/**
 * The filters the API can answer, in the shape it takes. Everything absent is
 * left out rather than sent empty, so an untouched panel asks for everything.
 *
 * `dueDate` is not here. The API matches it as an exact instant, and two tasks
 * due the same day can be stored at different times, so a chosen calendar day
 * cannot address it. `ownerId` is not here either: it accepts a UUID and
 * ignores it, which is why no control offers it at all.
 */
export function toTaskFilterInput(filters: TaskFilters): TaskFilterInput {
  return {
    ...(filters.assigneeId !== '' ? { assigneeId: filters.assigneeId } : {}),
    ...(filters.name ? { name: filters.name } : {}),
    ...(filters.pointEstimate ? { pointEstimate: filters.pointEstimate } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.tags.length > 0 ? { tags: filters.tags } : {}),
  }
}

/**
 * Whether a task falls on the chosen calendar day, read in the viewer's own
 * timezone the way the board reads every other date (5.45).
 *
 * This is the one filter applied after the response rather than in it, and it
 * is exact rather than approximate: the query has no pagination (5.5), so the
 * client holds the complete set its request asked for. There is no page of
 * results hiding a task this could miss.
 */
export function matchesDueDateFilter(task: Task, dueDate: string) {
  if (!dueDate) {
    return true
  }

  return toDueDateValue(new Date(task.dueDate)) === dueDate
}

export function applyClientFilters(tasks: Task[], filters: TaskFilters) {
  return filters.dueDate
    ? tasks.filter((task) => matchesDueDateFilter(task, filters.dueDate))
    : tasks
}

/** How many dimensions are narrowing the result, for the panel to report. */
export function countActiveFilters(filters: TaskFilters) {
  return [
    filters.assigneeId !== '',
    filters.dueDate !== '',
    filters.pointEstimate !== '',
    filters.status !== '',
    filters.tags.length > 0,
  ].filter(Boolean).length
}

/** The name lives in the header, so "filtered" has to count it too. */
export function hasActiveFilters(filters: TaskFilters) {
  return countActiveFilters(filters) > 0 || filters.name !== ''
}

/**
 * What to say when a combination returns nothing.
 *
 * A typed name gets the one surprise in how this behaves: contract 5.10 found
 * the API matching it case-sensitively, so a lowercase term will not find a
 * capitalised task. The sentence offers that as something to try rather than
 * stating it as a rule, because the rule belongs to the API: were the API to
 * start folding case, advice that had become unnecessary would be a smaller
 * failure than copy that had become untrue. Without a name there is nothing
 * surprising to explain, so it points at the way out instead.
 *
 * One job per branch. The typed-name branch names the surprise and stops; the
 * other offers the way out. Saying both in one sentence made the first branch
 * repeat what the second exists to say, and named a `task title` the reader
 * cannot see rather than the term they typed.
 */
export function emptyResultsHint(filters: TaskFilters) {
  return filters.name
    ? 'Try matching the capitals in the name you typed.'
    : 'Try clearing one of them.'
}
