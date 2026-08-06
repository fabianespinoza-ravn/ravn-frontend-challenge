import { useCallback, useMemo, useState } from 'react'
import type { TaskTag } from '@/entities/task/model/apiTask'
import {
  emptyTaskCreationFormValues,
  getMissingFields,
  type RequiredField,
  type TaskCreationFormValues,
} from './taskCreationForm'

export type TaskCreationForm = {
  markSubmitAttempted: () => void
  missingFields: RequiredField[]
  reset: () => void
  setFieldValue: <TField extends keyof TaskCreationFormValues>(
    field: TField,
    value: TaskCreationFormValues[TField],
  ) => void
  toggleTag: (tag: TaskTag) => void
  values: TaskCreationFormValues
}

/**
 * Owns the task creation draft. It is called by the application layout rather
 * than by the form itself so the draft survives the responsive container swap
 * between the desktop modal and the mobile full-page composition.
 */
export function useTaskCreationForm(): TaskCreationForm {
  const [values, setValues] = useState<TaskCreationFormValues>(emptyTaskCreationFormValues)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const setFieldValue = useCallback(
    <TField extends keyof TaskCreationFormValues>(
      field: TField,
      value: TaskCreationFormValues[TField],
    ) => {
      setValues((currentValues) => ({ ...currentValues, [field]: value }))
    },
    [],
  )

  const toggleTag = useCallback((tag: TaskTag) => {
    setValues((currentValues) => ({
      ...currentValues,
      tags: currentValues.tags.includes(tag)
        ? currentValues.tags.filter((currentTag) => currentTag !== tag)
        : [...currentValues.tags, tag],
    }))
  }, [])

  const markSubmitAttempted = useCallback(() => setHasAttemptedSubmit(true), [])

  const reset = useCallback(() => {
    setValues(emptyTaskCreationFormValues)
    setHasAttemptedSubmit(false)
  }, [])

  /*
   * Nothing is reported missing until the draft has been submitted once, so an
   * untouched form does not open covered in complaints. The list is derived from
   * the values rather than stored beside them, so filling a field clears its own
   * message without anything having to remember to.
   */
  const missingFields = useMemo(
    () => (hasAttemptedSubmit ? getMissingFields(values) : []),
    [hasAttemptedSubmit, values],
  )

  return useMemo(
    () => ({ markSubmitAttempted, missingFields, reset, setFieldValue, toggleTag, values }),
    [markSubmitAttempted, missingFields, reset, setFieldValue, toggleTag, values],
  )
}
