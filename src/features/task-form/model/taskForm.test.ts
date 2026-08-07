import { describe, expect, it } from 'vitest'
import {
  emptyTaskFormValues,
  getMissingFields,
  toCreateTaskInput,
  toUpdateTaskInput,
  type TaskFormValues,
} from './taskForm'

const completeValues: TaskFormValues = {
  assigneeId: '',
  dueDate: '2026-03-17',
  name: '  Ship the mutation  ',
  pointEstimate: 'FOUR',
  status: 'TODO',
  tags: ['REACT'],
}

describe('getMissingFields', () => {
  it('names every required field of an untouched draft, in the order they are met', () => {
    expect(getMissingFields(emptyTaskFormValues)).toEqual([
      'name',
      'status',
      'pointEstimate',
      'tags',
      'dueDate',
    ])
  })

  it('counts a title of only whitespace as missing', () => {
    expect(getMissingFields({ ...completeValues, name: '   ' })).toEqual(['name'])
  })

  it('never asks for an assignee, which the mutation accepts without', () => {
    expect(getMissingFields(completeValues)).toEqual([])
  })
})

describe('toCreateTaskInput', () => {
  it('refuses a draft that is short of a required field', () => {
    expect(toCreateTaskInput({ ...completeValues, status: '' })).toBeNull()
  })

  it('trims the title and omits an assignee nobody chose', () => {
    const input = toCreateTaskInput(completeValues)

    expect(input?.name).toEqual('Ship the mutation')
    expect(input && 'assigneeId' in input).toBe(false)
  })

  it('sends the assignee once one is chosen', () => {
    expect(toCreateTaskInput({ ...completeValues, assigneeId: 'user-2' })?.assigneeId).toEqual(
      'user-2',
    )
  })

  /*
   * Midnight would name the previous day for anyone east of the meridian, which
   * is the whole reason the draft never ran `toISOString` on a local midnight.
   */
  it('sends the chosen day at noon UTC, so it survives every timezone', () => {
    expect(toCreateTaskInput(completeValues)?.dueDate).toEqual('2026-03-17T12:00:00.000Z')
  })
})

describe('toUpdateTaskInput', () => {
  it('refuses a draft that is short of a required field', () => {
    expect(toUpdateTaskInput('task-1', { ...completeValues, status: '' })).toBeNull()
  })

  it('carries the id of the task being edited', () => {
    expect(toUpdateTaskInput('task-1', completeValues)?.id).toEqual('task-1')
  })

  /*
   * The one that separates an update from a creation. Leaving the field out
   * would keep whoever is assigned, so a user who cleared the control would
   * watch a successful request change nothing. Asserting the value is not
   * enough on its own: the key has to be there to carry it.
   */
  it('clears an assignee the user removed, instead of leaving the field out', () => {
    const input = toUpdateTaskInput('task-1', completeValues)

    expect(input && 'assigneeId' in input).toBe(true)
    expect(input?.assigneeId).toBeNull()
  })

  it('sends the assignee once one is chosen', () => {
    expect(
      toUpdateTaskInput('task-1', { ...completeValues, assigneeId: 'user-2' })?.assigneeId,
    ).toEqual('user-2')
  })

  /* Updating it fails against the live API, so it must never be built. */
  it('never sends position', () => {
    expect(toUpdateTaskInput('task-1', completeValues)).not.toHaveProperty('position')
  })

  it('trims the title, like creation does', () => {
    expect(toUpdateTaskInput('task-1', completeValues)?.name).toEqual('Ship the mutation')
  })
})
