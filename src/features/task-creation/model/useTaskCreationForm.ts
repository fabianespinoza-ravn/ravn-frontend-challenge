import { useCallback, useMemo, useState } from 'react'
import type { TaskTag } from '@/entities/task/model/apiTask'
import { emptyTaskCreationFormValues, type TaskCreationFormValues } from './taskCreationForm'

export type TaskCreationForm = {
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

  const reset = useCallback(() => setValues(emptyTaskCreationFormValues), [])

  return useMemo(
    () => ({ reset, setFieldValue, toggleTag, values }),
    [reset, setFieldValue, toggleTag, values],
  )
}
