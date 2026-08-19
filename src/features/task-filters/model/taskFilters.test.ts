import { describe, expect, it } from 'vitest'
import type { Task } from '@/entities/task/model/task'
import { toDueDateValue } from '@/shared/lib/date/dueDate'
import {
  applyClientFilters,
  countActiveFilters,
  emptyResultsHint,
  emptyTaskFilters,
  hasActiveFilters,
  matchesDueDateFilter,
  toTaskFilterInput,
} from './taskFilters'

function task(dueDate: string, id = 'task-1'): Task {
  return {
    dueDate,
    dueDateLabel: '',
    dueDateTone: 'future',
    id,
    pointEstimate: 'FOUR',
    status: 'TODO',
    tags: ['REACT'],
    title: 'Task',
  }
}

describe('toTaskFilterInput', () => {
  it('asks for everything when nothing is chosen', () => {
    expect(toTaskFilterInput(emptyTaskFilters)).toEqual({})
  })

  it('sends only the dimensions that are set', () => {
    expect(
      toTaskFilterInput({ ...emptyTaskFilters, status: 'DONE', tags: ['IOS', 'REACT'] }),
    ).toEqual({ status: 'DONE', tags: ['IOS', 'REACT'] })
  })

  /*
   * The empty string means anybody and must not be sent; `null` means nobody
   * and must be, since the API answers it with the unassigned tasks.
   */
  it('tells anybody apart from nobody', () => {
    expect(toTaskFilterInput({ ...emptyTaskFilters, assigneeId: '' })).toEqual({})
    expect(toTaskFilterInput({ ...emptyTaskFilters, assigneeId: null })).toEqual({
      assigneeId: null,
    })
    expect(toTaskFilterInput({ ...emptyTaskFilters, assigneeId: 'user-2' })).toEqual({
      assigneeId: 'user-2',
    })
  })

  /*
   * The API matches a due date as an exact instant, and two tasks due the same
   * day can be stored at different times, so a chosen calendar day cannot
   * address it. Sending it would return nothing rather than everything.
   */
  it('never sends the due date, which the API cannot answer by day', () => {
    expect(toTaskFilterInput({ ...emptyTaskFilters, dueDate: '2026-08-06' })).toEqual({})
  })
})

describe('matchesDueDateFilter', () => {
  it('keeps every task while no day is chosen', () => {
    expect(matchesDueDateFilter(task('2026-08-06T02:02:14.128Z'), '')).toBe(true)
  })

  /*
   * The invariant that matters, and it is stated rather than hardcoded so it
   * holds wherever the suite runs: whichever day the board shows a task under,
   * choosing that day finds it. The two instants are the real ones — seeded
   * tasks are stored at 02:02 and the ones this app creates at noon (5.43) —
   * and the API's exact-instant filter would have found neither by day.
   */
  it('finds a task by the very day the board shows it under', () => {
    for (const stored of ['2026-08-06T02:02:14.128Z', '2026-08-06T12:00:00.000Z']) {
      const subject = task(stored)
      const shownDay = toDueDateValue(new Date(stored))

      expect(
        applyClientFilters([subject], { ...emptyTaskFilters, dueDate: shownDay }),
      ).toHaveLength(1)
    }
  })

  it('drops a task due on another day', () => {
    expect(matchesDueDateFilter(task('2026-08-07T12:00:00.000Z'), '2026-08-06')).toBe(false)
  })
})

describe('counting', () => {
  it('reports nothing active for an untouched panel', () => {
    expect(countActiveFilters(emptyTaskFilters)).toEqual(0)
    expect(hasActiveFilters(emptyTaskFilters)).toBe(false)
  })

  /* The name is in the header, not the panel, so the badge leaves it out. */
  it('leaves the name out of the panel count but not out of being filtered', () => {
    const withName = { ...emptyTaskFilters, name: 'Ticket' }

    expect(countActiveFilters(withName)).toEqual(0)
    expect(hasActiveFilters(withName)).toBe(true)
  })

  it('counts each dimension once, however many tags are chosen', () => {
    expect(
      countActiveFilters({ ...emptyTaskFilters, status: 'DONE', tags: ['IOS', 'REACT'] }),
    ).toEqual(2)
  })
})

describe('emptyResultsHint', () => {
  it('offers the capitals as something to try when a name was typed', () => {
    expect(emptyResultsHint({ ...emptyTaskFilters, name: 'ticket' })).toContain('capitals')
  })

  it('points at the way out when nothing was typed', () => {
    expect(emptyResultsHint({ ...emptyTaskFilters, status: 'DONE' })).toContain('clearing')
  })
})
